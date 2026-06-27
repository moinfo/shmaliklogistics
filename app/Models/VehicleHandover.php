<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class VehicleHandover extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'vehicle_id', 'driver_id', 'driver_name', 'license_number', 'license_class',
        'license_expiry', 'vehicle_registration', 'horse_trailer', 'odometer_km',
        'fuel_level', 'route_destination', 'inspection', 'documentation',
        'handed_over_by', 'handed_over_date', 'received_by', 'received_date',
        'notes', 'created_by',
    ];

    protected $casts = [
        'license_expiry'   => 'date',
        'handed_over_date' => 'date',
        'received_date'    => 'date',
        'inspection'       => 'array',
        'documentation'    => 'array',
    ];

    public function vehicle() { return $this->belongsTo(Vehicle::class); }
    public function driver()  { return $this->belongsTo(Driver::class); }
    public function creator() { return $this->belongsTo(User::class, 'created_by'); }

    // Vehicle inspection checklist — key => label.
    public static array $inspectionItems = [
        'bodywork'       => 'Bodywork, Paintwork & Cabin Condition',
        'windshield'     => 'Windshield, Windows & Side Mirrors',
        'tyres'          => 'Tyre Condition & Spare Tyre (Tread/Pressure)',
        'brakes'         => 'Brake System & Air Pressure Systems',
        'fluids'         => 'Fluid Levels (Engine Oil, Coolant, Brake Fluid)',
        'lights'         => 'All Lights (Headlights, Indicators, Brake & Hazards)',
        'dashboard'      => 'Dashboard Warnings, AC, Horn & Wipers',
        'kingpin'        => 'Kingpin, Fifth Wheel & Trailer Connections',
        'fire_safety'    => 'Fire Extinguisher & Warning Triangles',
        'tools'          => 'Jack, Wheel Spanner & Cargo Straps/Ratchets',
        'first_aid'      => 'First Aid Kit',
        'gps'            => 'GPS Tracking & Telematics System',
        'speed_governor' => 'Speed Governor Calibration & Functionality',
    ];

    // Documentation checklist — key => label.
    public static array $documentationItems = [
        'logbook_insurance' => 'Vehicle Logbook Copy & Valid Insurance',
        'latra_permit'      => 'LATRA Permit / Carrier License',
        'delivery_note'     => 'Delivery Note / Waybill / Cargo Manifest',
        'customs'           => 'Customs & Transit Documents (e.g., COMESA Yellow Card)',
        'driver_logbook'    => "Driver's Logbook / Hours of Service Record",
    ];

    // Status options for each checklist line.
    public static array $statusOptions = [
        'ok'   => ['label' => 'OK',    'color' => '#22C55E'],
        'fail' => ['label' => 'Issue', 'color' => '#EF4444'],
        'na'   => ['label' => 'N/A',   'color' => '#94A3B8'],
    ];

    public static function statusKeys(): array
    {
        return array_keys(self::$statusOptions);
    }
}
