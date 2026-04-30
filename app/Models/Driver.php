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
        'license_number', 'license_class', 'license_expiry',
        'emergency_contact_name', 'emergency_contact_phone',
        'notes', 'created_by',
    ];

    protected $casts = [
        'license_expiry' => 'date',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
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

    public static array $licenseClasses = ['B', 'C', 'CE', 'D', 'DE', 'Other'];
}
