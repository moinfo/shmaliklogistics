<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Driver extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name', 'status',
        'phone', 'phone_alt', 'email',
        'national_id', 'address',
        'license_number', 'license_class', 'license_classes', 'license_expiry',
        'emergency_contact_name', 'emergency_contact_phone',
        'notes', 'created_by',
    ];

    protected $casts = [
        'license_expiry'  => 'date',
        'license_classes' => 'array',
    ];

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
