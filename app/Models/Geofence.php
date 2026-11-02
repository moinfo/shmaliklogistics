<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Geofence extends Model
{
    protected $fillable = [
        'name', 'center_lat', 'center_lng', 'radius_m', 'color',
        'alert_on_enter', 'alert_on_exit', 'is_active', 'created_by',
    ];

    protected $casts = [
        'center_lat'     => 'float',
        'center_lng'     => 'float',
        'radius_m'       => 'integer',
        'alert_on_enter' => 'boolean',
        'alert_on_exit'  => 'boolean',
        'is_active'      => 'boolean',
    ];
}
