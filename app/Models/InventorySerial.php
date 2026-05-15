<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventorySerial extends Model
{
    use HasFactory;

    protected $fillable = [
        'item_id', 'serial', 'status',
        'received_movement_id', 'issued_movement_id',
        'vehicle_id', 'received_at', 'issued_at', 'notes',
    ];

    protected $casts = [
        'received_at' => 'datetime',
        'issued_at'   => 'datetime',
    ];

    public function item()
    {
        return $this->belongsTo(InventoryItem::class, 'item_id');
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function receivedMovement()
    {
        return $this->belongsTo(InventoryMovement::class, 'received_movement_id');
    }

    public function issuedMovement()
    {
        return $this->belongsTo(InventoryMovement::class, 'issued_movement_id');
    }
}
