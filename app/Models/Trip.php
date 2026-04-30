<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Trip extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'trip_number', 'status',
        'route_from', 'route_to', 'departure_date', 'arrival_date',
        'driver_name', 'vehicle_plate',
        'cargo_description', 'cargo_weight_tons',
        'freight_amount', 'fuel_cost', 'driver_allowance', 'border_costs', 'other_costs',
        'notes', 'created_by',
    ];

    protected $casts = [
        'departure_date'    => 'date',
        'arrival_date'      => 'date',
        'freight_amount'    => 'decimal:2',
        'fuel_cost'         => 'decimal:2',
        'driver_allowance'  => 'decimal:2',
        'border_costs'      => 'decimal:2',
        'other_costs'       => 'decimal:2',
        'cargo_weight_tons' => 'decimal:2',
    ];

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function documents()
    {
        return $this->morphMany(Document::class, 'documentable');
    }

    public function expenses()
    {
        return $this->hasMany(Expense::class);
    }

    public function getTotalCostsAttribute(): float
    {
        return (float) $this->fuel_cost
            + (float) $this->driver_allowance
            + (float) $this->border_costs
            + (float) $this->other_costs;
    }

    public function getProfitAttribute(): float
    {
        return (float) $this->freight_amount - $this->total_costs;
    }

    public static function nextNumber(): string
    {
        $year   = now()->year;
        $prefix = "TRP-{$year}-";
        $last   = static::withTrashed()
            ->where('trip_number', 'like', "{$prefix}%")
            ->orderByDesc('id')
            ->value('trip_number');

        $seq = $last ? ((int) substr($last, -3)) + 1 : 1;
        return $prefix . str_pad($seq, 3, '0', STR_PAD_LEFT);
    }

    public static array $statuses = [
        'planned'    => ['label' => 'Planned',    'color' => '#A78BFA'],
        'loading'    => ['label' => 'Loading',    'color' => '#60A5FA'],
        'in_transit' => ['label' => 'In Transit', 'color' => '#3B82F6'],
        'at_border'  => ['label' => 'At Border',  'color' => '#F59E0B'],
        'delivered'  => ['label' => 'Delivered',  'color' => '#22C55E'],
        'completed'  => ['label' => 'Completed',  'color' => '#10B981'],
        'cancelled'  => ['label' => 'Cancelled',  'color' => '#EF4444'],
    ];
}
