<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VehicleLocation extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = [
        'gps_device_id', 'vehicle_id', 'latitude', 'longitude', 'speed_kmh', 'heading',
        'altitude_m', 'satellites', 'ignition', 'external_voltage_mv', 'io', 'recorded_at',
    ];

    protected $casts = [
        'latitude'    => 'decimal:7',
        'longitude'   => 'decimal:7',
        'speed_kmh'   => 'decimal:1',
        'ignition'    => 'boolean',
        'io'          => 'array',
        'recorded_at' => 'datetime',
    ];

    public function device()
    {
        return $this->belongsTo(GpsDevice::class, 'gps_device_id');
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}
