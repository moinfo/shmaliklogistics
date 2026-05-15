<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VehicleInspection extends Model
{
    use HasFactory;

    protected $fillable = [
        'vehicle_id', 'driver_id', 'trip_id',
        'inspection_type', 'inspected_at',
        'items', 'overall_status', 'odometer_km',
        'location', 'lat', 'lng',
        'notes', 'photo_path', 'created_by',
    ];

    protected $casts = [
        'items'        => 'array',
        'inspected_at' => 'datetime',
        'lat'          => 'decimal:7',
        'lng'          => 'decimal:7',
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

    public function trip()
    {
        return $this->belongsTo(Trip::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Default pre-trip checklist for Tanzanian road conditions.
    public static array $defaultChecklist = [
        'brakes'        => 'Brakes (front & rear)',
        'tires'         => 'Tires (tread, pressure, spare)',
        'lights'        => 'Headlights, indicators & brake lights',
        'engine_oil'    => 'Engine oil level',
        'coolant'       => 'Coolant / radiator water',
        'fuel'          => 'Fuel level',
        'wipers'        => 'Wipers & washer fluid',
        'mirrors'       => 'Mirrors & windscreen',
        'horn'          => 'Horn',
        'fire_extinguisher' => 'Fire extinguisher',
        'first_aid'     => 'First-aid kit',
        'reflectors'    => 'Reflectors / hazard triangle',
        'documents'     => 'Licence, insurance & permit',
        'load_secured'  => 'Cargo properly secured',
    ];

    public static array $statuses = [
        'ok'            => ['label' => 'All Good',      'color' => '#22C55E'],
        'minor_issues'  => ['label' => 'Minor Issues',  'color' => '#F59E0B'],
        'critical'      => ['label' => 'Critical',      'color' => '#EF4444'],
    ];

    public static array $types = [
        'pre_trip'  => ['label' => 'Pre-Trip (Morning)', 'color' => '#3B82F6'],
        'periodic'  => ['label' => 'On-Route Check',     'color' => '#8B5CF6'],
        'post_trip' => ['label' => 'Post-Trip',          'color' => '#64748B'],
    ];
}
