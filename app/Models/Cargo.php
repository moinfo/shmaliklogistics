<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cargo extends Model
{
    protected $fillable = [
        'cargo_number', 'trip_id', 'client_id', 'created_by',
        'description', 'type', 'weight_kg', 'volume_m3', 'pieces', 'packing_type',
        'origin', 'destination', 'consignee_name', 'consignee_contact',
        'status', 'declared_value', 'currency',
        'special_instructions', 'notes',
    ];

    protected $casts = [
        'weight_kg'       => 'decimal:2',
        'volume_m3'       => 'decimal:3',
        'declared_value'  => 'decimal:2',
    ];

    public function trip()    { return $this->belongsTo(Trip::class); }
    public function client()  { return $this->belongsTo(Client::class); }
    public function creator() { return $this->belongsTo(User::class, 'created_by'); }

    public static function nextNumber(): string
    {
        $year   = now()->year;
        $prefix = "CGO-{$year}-";
        $last   = static::where('cargo_number', 'like', "{$prefix}%")
            ->orderByDesc('id')->value('cargo_number');
        $seq = $last ? ((int) substr($last, -4)) + 1 : 1;
        return $prefix . str_pad($seq, 4, '0', STR_PAD_LEFT);
    }

    public static array $types = [
        'general'      => ['label' => 'General Goods',   'color' => '#3B82F6'],
        'refrigerated' => ['label' => 'Refrigerated',    'color' => '#06B6D4'],
        'hazardous'    => ['label' => 'Hazardous',       'color' => '#EF4444'],
        'bulk'         => ['label' => 'Bulk',            'color' => '#F59E0B'],
        'oversized'    => ['label' => 'Oversized',       'color' => '#8B5CF6'],
        'perishable'   => ['label' => 'Perishable',      'color' => '#22C55E'],
        'livestock'    => ['label' => 'Livestock',       'color' => '#A78BFA'],
    ];

    public static array $statuses = [
        'registered'  => ['label' => 'Registered',  'color' => '#64748B'],
        'loaded'      => ['label' => 'Loaded',       'color' => '#A78BFA'],
        'in_transit'  => ['label' => 'In Transit',   'color' => '#3B82F6'],
        'at_border'   => ['label' => 'At Border',    'color' => '#F59E0B'],
        'cleared'     => ['label' => 'Cleared',      'color' => '#06B6D4'],
        'delivered'   => ['label' => 'Delivered',    'color' => '#22C55E'],
        'cancelled'   => ['label' => 'Cancelled',    'color' => '#EF4444'],
    ];
}
