<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GpsEvent extends Model
{
    public const UPDATED_AT = null;

    /** type => [label, icon] */
    public const TYPES = [
        'speeding'             => ['Speeding',                 '🚨'],
        'idle'                 => ['Long idle',                '⏳'],
        'ignition_after_hours' => ['Ignition after hours',     '🌙'],
        'harsh_acceleration'   => ['Harsh acceleration',       '⚡'],
        'harsh_braking'        => ['Harsh braking',            '🛑'],
        'harsh_cornering'      => ['Harsh cornering',          '↪️'],
        'geofence_enter'       => ['Entered zone',             '📍'],
        'geofence_exit'        => ['Left zone',                '🚪'],
        'offline'              => ['Tracker offline',          '📡'],
    ];

    protected $fillable = [
        'vehicle_id', 'driver_id', 'geofence_id', 'type', 'severity', 'message',
        'latitude', 'longitude', 'value', 'occurred_at', 'acknowledged_at', 'acknowledged_by',
    ];

    protected $casts = [
        'latitude'        => 'float',
        'longitude'       => 'float',
        'value'           => 'float',
        'occurred_at'     => 'datetime',
        'acknowledged_at' => 'datetime',
    ];

    public function vehicle()  { return $this->belongsTo(Vehicle::class); }
    public function driver()   { return $this->belongsTo(Driver::class); }
    public function geofence() { return $this->belongsTo(Geofence::class); }
}
