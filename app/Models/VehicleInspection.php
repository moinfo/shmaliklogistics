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

    public static array $checklistSections = [
        'A' => [
            'title'   => 'Engine & Fluids',
            'options' => ['ok' => 'Good', 'issue' => 'Needs Attention'],
            'items'   => [
                'engine_oil'        => 'Engine Oil Level',
                'coolant'           => 'Coolant / Radiator Water',
                'brake_fluid'       => 'Brake Fluid',
                'power_steering'    => 'Power Steering Fluid',
                'fuel'              => 'Fuel Level',
                'leakage'           => 'Leakage Check',
            ],
        ],
        'B' => [
            'title'   => 'Tyres & Wheels',
            'options' => ['ok' => 'Good', 'issue' => 'Needs Attention'],
            'items'   => [
                'front_tyres'       => 'Front Tyres',
                'rear_tyres'        => 'Rear Tyres',
                'spare_tyre'        => 'Spare Tyre',
                'tyre_pressure'     => 'Tyre Pressure',
                'wheel_nuts'        => 'Wheel Nuts Tight',
            ],
        ],
        'C' => [
            'title'   => 'Lights & Electricals',
            'options' => ['ok' => 'Good', 'issue' => 'Needs Attention'],
            'items'   => [
                'headlights'        => 'Headlights',
                'brake_lights'      => 'Brake Lights',
                'indicators'        => 'Indicators',
                'hazard_lights'     => 'Hazard Lights',
                'horn'              => 'Horn',
                'battery'           => 'Battery Condition',
            ],
        ],
        'D' => [
            'title'   => 'Safety & Emergency Equipment',
            'options' => ['ok' => 'Available', 'issue' => 'Missing'],
            'items'   => [
                'fire_extinguisher' => 'Fire Extinguisher',
                'reflectors'        => 'Reflector Triangles',
                'first_aid'         => 'First Aid Kit',
                'jack_spanner'      => 'Jack & Wheel Spanner',
                'seat_belt'         => 'Seat Belt',
            ],
        ],
        'E' => [
            'title'   => 'Cargo & Documents',
            'options' => ['ok' => 'Checked', 'issue' => 'Not Checked'],
            'items'   => [
                'cargo_secured'     => 'Cargo Secured Properly',
                'cargo_balanced'    => 'Cargo Weight Balanced',
                'driving_license'   => 'Driving License Available',
                'insurance'         => 'Insurance Available',
                'delivery_note'     => 'Delivery Note Available',
            ],
        ],
    ];

    // Flat map for backward-compatible item initialisation
    public static array $defaultChecklist = [
        'engine_oil'        => 'Engine Oil Level',
        'coolant'           => 'Coolant / Radiator Water',
        'brake_fluid'       => 'Brake Fluid',
        'power_steering'    => 'Power Steering Fluid',
        'fuel'              => 'Fuel Level',
        'leakage'           => 'Leakage Check',
        'front_tyres'       => 'Front Tyres',
        'rear_tyres'        => 'Rear Tyres',
        'spare_tyre'        => 'Spare Tyre',
        'tyre_pressure'     => 'Tyre Pressure',
        'wheel_nuts'        => 'Wheel Nuts Tight',
        'headlights'        => 'Headlights',
        'brake_lights'      => 'Brake Lights',
        'indicators'        => 'Indicators',
        'hazard_lights'     => 'Hazard Lights',
        'horn'              => 'Horn',
        'battery'           => 'Battery Condition',
        'fire_extinguisher' => 'Fire Extinguisher',
        'reflectors'        => 'Reflector Triangles',
        'first_aid'         => 'First Aid Kit',
        'jack_spanner'      => 'Jack & Wheel Spanner',
        'seat_belt'         => 'Seat Belt',
        'cargo_secured'     => 'Cargo Secured Properly',
        'cargo_balanced'    => 'Cargo Weight Balanced',
        'driving_license'   => 'Driving License Available',
        'insurance'         => 'Insurance Available',
        'delivery_note'     => 'Delivery Note Available',
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
