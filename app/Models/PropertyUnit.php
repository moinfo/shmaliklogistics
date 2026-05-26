<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PropertyUnit extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'property_id', 'unit_number', 'type', 'status',
        'bedrooms', 'bathrooms', 'size_sqm',
        'rent_amount', 'rent_currency', 'default_billing_cycle',
        'description',
    ];

    protected $casts = [
        'size_sqm'    => 'decimal:2',
        'rent_amount' => 'decimal:2',
    ];

    public function property()
    {
        return $this->belongsTo(Property::class);
    }

    public function leases()
    {
        return $this->hasMany(Lease::class);
    }

    public function activeLease()
    {
        return $this->hasOne(Lease::class)->where('status', 'active')->latestOfMany();
    }

    public static array $types = [
        'self_contained' => ['label' => 'Self Contained', 'color' => '#3B82F6'],
        'room'           => ['label' => 'Room',           'color' => '#06B6D4'],
        'apartment'      => ['label' => 'Apartment',      'color' => '#8B5CF6'],
        'shop'           => ['label' => 'Shop',           'color' => '#F59E0B'],
        'office'         => ['label' => 'Office',         'color' => '#10B981'],
        'hall'           => ['label' => 'Hall',           'color' => '#EC4899'],
        'plot'           => ['label' => 'Plot',           'color' => '#A16207'],
        'whole_house'    => ['label' => 'Whole House',    'color' => '#6366F1'],
    ];

    public static array $statuses = [
        'vacant'      => ['label' => 'Vacant',      'color' => '#22C55E'],
        'occupied'    => ['label' => 'Occupied',    'color' => '#3B82F6'],
        'maintenance' => ['label' => 'Maintenance', 'color' => '#F59E0B'],
        'reserved'    => ['label' => 'Reserved',    'color' => '#A855F7'],
    ];
}