<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Permit extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'trip_id', 'vehicle_plate', 'permit_type', 'permit_number',
        'issuing_country', 'issuing_authority',
        'issue_date', 'expiry_date', 'cost', 'currency',
        'status', 'notes', 'created_by',
    ];

    protected $casts = [
        'issue_date'  => 'date',
        'expiry_date' => 'date',
        'cost'        => 'decimal:2',
    ];

    public function trip()
    {
        return $this->belongsTo(Trip::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function getDaysUntilExpiryAttribute(): ?int
    {
        return $this->expiry_date
            ? (int) now()->startOfDay()->diffInDays($this->expiry_date->startOfDay(), false)
            : null;
    }

    public static array $types = [
        'Transit Permit',
        'Single Journey Permit',
        'Multiple Journey Permit',
        'Goods Vehicle Permit',
        'COMESA Permit',
        'SADC Permit',
        'Border Pass',
        'Other',
    ];

    public static array $statuses = [
        'pending'   => ['label' => 'Pending',   'color' => '#F59E0B'],
        'active'    => ['label' => 'Active',    'color' => '#22C55E'],
        'expired'   => ['label' => 'Expired',   'color' => '#EF4444'],
        'cancelled' => ['label' => 'Cancelled', 'color' => '#94A3B8'],
    ];

    public static array $currencies = ['USD', 'TZS', 'ZMW', 'CDF', 'MWK', 'KES', 'ZAR'];
}
