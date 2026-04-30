<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Vehicle extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'plate', 'chassis_number', 'engine_number',
        'status', 'driver_id',
        'make', 'model_name', 'year', 'type', 'color',
        'payload_tons', 'mileage_km',
        'fuel_type', 'fuel_tank_capacity_l',
        'insurance_expiry', 'road_licence_expiry', 'fitness_expiry',
        'tra_sticker_expiry', 'goods_vehicle_licence_expiry', 'next_service_date',
        'owner_name', 'notes', 'extra_documents', 'created_by',
    ];

    protected $casts = [
        'insurance_expiry'             => 'date',
        'road_licence_expiry'          => 'date',
        'fitness_expiry'               => 'date',
        'tra_sticker_expiry'           => 'date',
        'goods_vehicle_licence_expiry' => 'date',
        'next_service_date'            => 'date',
        'payload_tons'                 => 'decimal:2',
        'extra_documents'              => 'array',
    ];

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function serviceRecords()
    {
        return $this->hasMany(ServiceRecord::class)->latest('service_date');
    }

    public function documents()
    {
        return $this->morphMany(Document::class, 'documentable');
    }

    public static array $statuses = [
        'active'      => ['label' => 'Active',      'color' => '#22C55E'],
        'on_road'     => ['label' => 'On Road',      'color' => '#3B82F6'],
        'at_border'   => ['label' => 'At Border',    'color' => '#F59E0B'],
        'loading'     => ['label' => 'Loading',      'color' => '#A78BFA'],
        'idle'        => ['label' => 'Idle',         'color' => '#64748B'],
        'maintenance' => ['label' => 'Maintenance',  'color' => '#EF4444'],
        'retired'     => ['label' => 'Retired',      'color' => '#475569'],
    ];

    public static array $types = [
        'Flatbed', 'Container', 'Lowboy', 'Reefer', 'Tipper', 'Tanker', 'Box Body', 'Other',
    ];

    public static array $fuelTypes = ['diesel', 'petrol', 'cng'];

    public static array $typeIcons = [
        'Flatbed'   => '🚛',
        'Container' => '📦',
        'Lowboy'    => '🏗️',
        'Reefer'    => '❄️',
        'Tipper'    => '🏔️',
        'Tanker'    => '🛢️',
        'Box Body'  => '📫',
        'Other'     => '🚗',
    ];
}
