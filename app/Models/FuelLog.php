<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FuelLog extends Model
{
    protected $fillable = [
        'vehicle_id', 'driver_id', 'trip_id',
        'log_date', 'liters', 'cost_per_liter',
        'odometer_km', 'station_name', 'fuel_type', 'currency', 'notes', 'created_by',
    ];

    protected $casts = [
        'log_date'       => 'date',
        'liters'         => 'decimal:2',
        'cost_per_liter' => 'decimal:2',
        'total_cost'     => 'decimal:2',
    ];

    public function vehicle() { return $this->belongsTo(Vehicle::class); }
    public function driver()  { return $this->belongsTo(Driver::class); }
    public function trip()    { return $this->belongsTo(Trip::class); }
    public function creator() { return $this->belongsTo(User::class, 'created_by'); }

    public static array $fuelTypes = ['diesel', 'petrol', 'cng'];
}
