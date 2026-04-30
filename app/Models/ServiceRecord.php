<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ServiceRecord extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'vehicle_id', 'service_type', 'service_date', 'mileage_km',
        'workshop_name', 'description', 'cost', 'currency',
        'next_service_date', 'next_service_mileage', 'notes', 'created_by',
    ];

    protected $casts = [
        'service_date'      => 'date',
        'next_service_date' => 'date',
        'cost'              => 'decimal:2',
    ];

    public function vehicle() { return $this->belongsTo(Vehicle::class); }
    public function creator() { return $this->belongsTo(User::class, 'created_by'); }

    public static array $serviceTypes = [
        'Oil Change',
        'Tyre Rotation / Replacement',
        'Brake Service',
        'Engine Service',
        'Transmission Service',
        'Electrical Repair',
        'Body Repair / Paint',
        'Air Filter / Fuel Filter',
        'Cooling System',
        'General Inspection / Service',
        'Other',
    ];
}
