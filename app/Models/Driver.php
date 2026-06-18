<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Driver extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id', 'name', 'status',
        'phone', 'phone_alt', 'email',
        'national_id', 'card_id', 'address', 'birth_region', 'birth_district', 'photo_path',
        'license_number', 'license_class', 'license_classes', 'license_expiry',
        'license_doc_path', 'visa_doc_path', 'visa_expiry',
        'emergency_contact_name', 'emergency_contact_phone',
        'notes', 'created_by',
    ];

    protected $casts = [
        'license_expiry'  => 'date',
        'visa_expiry'     => 'date',
        'license_classes' => 'array',
    ];

    protected $appends = ['photo_url'];

    public function getPhotoUrlAttribute(): ?string
    {
        return $this->photo_path ? '/storage/' . ltrim($this->photo_path, '/') : null;
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function vehicle()
    {
        return $this->hasOne(Vehicle::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function documents()
    {
        return $this->morphMany(Document::class, 'documentable');
    }

    public function inspections()
    {
        return $this->hasMany(VehicleInspection::class)->latest('inspected_at');
    }

    public function trips()
    {
        return $this->hasMany(Trip::class)->latest('departure_date');
    }

    public function guarantors()
    {
        return $this->hasMany(Guarantor::class)->latest();
    }

    /**
     * Summarise this driver's guarantor situation for display and gating.
     *
     * Business rules (from the registration policy):
     *   - A driver may have up to Guarantor::$maxPerDriver (6) guarantors.
     *   - At least ONE guarantor must own a house (owns_house = true).
     *   - The driver's guarantor set is only "complete" when it has at
     *     least one guarantor AND meets the house-owner requirement.
     *
     * The UI shows a green "requirements met" banner when `is_complete`
     * is true, otherwise a warning telling staff what is still missing.
     *
     * NOTE: $this->guarantors is already an Eloquent Collection here, so use
     * collection helpers (->count(), ->contains(), ->where(), ->isNotEmpty()).
     *
     * @return array{count:int, has_homeowner:bool, slots_left:int, is_complete:bool}
     */
    public function guarantorsSummary(): array
    {
        $guarantors = $this->guarantors; // Eloquent Collection of Guarantor models

        $count        = $guarantors->count();
        $hasHomeowner = $guarantors->contains('owns_house', true);

        return [
            'count'         => $count,
            'has_homeowner' => $hasHomeowner,
            'slots_left'    => max(0, Guarantor::$maxPerDriver - $count),
            // Policy: a driver's guarantor set is complete once it has at least
            // one guarantor AND at least one of them owns a house. We deliberately
            // do NOT require the full 6 — registration allows 1–6.
            'is_complete'   => $count >= 1 && $hasHomeowner,
        ];
    }

    public function getLicenseDaysAttribute(): ?int
    {
        return $this->license_expiry
            ? (int) now()->startOfDay()->diffInDays($this->license_expiry->startOfDay(), false)
            : null;
    }

    public static array $statuses = [
        'active'    => ['label' => 'Active',    'color' => '#22C55E'],
        'on_trip'   => ['label' => 'On Trip',   'color' => '#3B82F6'],
        'on_leave'  => ['label' => 'On Leave',  'color' => '#F59E0B'],
        'suspended' => ['label' => 'Suspended', 'color' => '#EF4444'],
        'inactive'  => ['label' => 'Inactive',  'color' => '#475569'],
    ];

    // Tanzania driving licence classes with descriptions
    public static array $licenseClasses = [
        'B'  => 'Light vehicles (up to 3,500 kg)',
        'C1' => 'Medium goods (3,500 – 7,500 kg)',
        'C'  => 'Heavy goods vehicles (over 7,500 kg)',
        'CE' => 'Articulated trucks (C + trailer)',
        'D1' => 'Minibus (up to 16 passengers)',
        'D'  => 'Large bus (over 8 passengers)',
        'DE' => 'Articulated bus (D + trailer)',
    ];
}
