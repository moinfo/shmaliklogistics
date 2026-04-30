<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Vehicle extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'plate', 'status', 'driver_id', 'make', 'model_name', 'year', 'type', 'color',
        'payload_tons', 'mileage_km',
        'insurance_expiry', 'road_licence_expiry', 'fitness_expiry', 'next_service_date',
        'owner_name', 'notes', 'created_by',
    ];

    protected $casts = [
        'insurance_expiry'    => 'date',
        'road_licence_expiry' => 'date',
        'fitness_expiry'      => 'date',
        'next_service_date'   => 'date',
        'payload_tons'        => 'decimal:2',
    ];

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // How many days until a document expires (negative = already expired)
    public function daysUntil(string $field): ?int
    {
        return $this->$field ? (int) now()->startOfDay()->diffInDays($this->$field->startOfDay(), false) : null;
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
}
