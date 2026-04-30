<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryMovement extends Model
{
    use HasFactory;

    protected $fillable = [
        'item_id', 'type', 'quantity', 'unit_cost', 'balance_after',
        'reference', 'vehicle_id', 'notes', 'created_by',
    ];

    protected $casts = [
        'quantity'     => 'decimal:3',
        'unit_cost'    => 'decimal:2',
        'balance_after'=> 'decimal:3',
    ];

    public function item()
    {
        return $this->belongsTo(InventoryItem::class, 'item_id');
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public static array $types = [
        'in'         => ['label' => 'Stock In',    'color' => '#22C55E'],
        'out'        => ['label' => 'Stock Out',   'color' => '#EF4444'],
        'adjustment' => ['label' => 'Adjustment',  'color' => '#F59E0B'],
    ];
}
