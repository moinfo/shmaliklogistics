<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GpsDevice extends Model
{
    protected $fillable = [
        'vehicle_id', 'imei', 'provider', 'model', 'sim_number', 'is_active', 'last_ping',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'last_ping' => 'datetime',
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function locations()
    {
        return $this->hasMany(VehicleLocation::class);
    }
}
