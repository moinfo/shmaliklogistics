<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TripCheckIn extends Model
{
    use HasFactory;

    protected $table = 'trip_check_ins';

    protected $fillable = [
        'trip_id', 'driver_id', 'vehicle_id',
        'checked_in_at', 'lat', 'lng', 'location',
        'odometer_km', 'status', 'notes', 'created_by',
    ];

    protected $casts = [
        'checked_in_at' => 'datetime',
        'lat'           => 'decimal:7',
        'lng'           => 'decimal:7',
    ];

    public function trip()
    {
        return $this->belongsTo(Trip::class);
    }

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Drivers must check in at least every 3 hours while on an active trip.
    public const INTERVAL_HOURS = 3;

    public static array $statuses = [
        'ok'        => ['label' => 'All Good',  'color' => '#22C55E'],
        'issue'     => ['label' => 'Issue',     'color' => '#F59E0B'],
        'emergency' => ['label' => 'Emergency', 'color' => '#EF4444'],
    ];
}
