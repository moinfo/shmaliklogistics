<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id', 'name', 'part_number', 'unit',
        'current_stock', 'reorder_level', 'unit_cost',
        'location', 'notes', 'is_active', 'created_by',
    ];

    protected $casts = [
        'current_stock' => 'decimal:3',
        'reorder_level' => 'decimal:3',
        'unit_cost'     => 'decimal:2',
        'is_active'     => 'boolean',
    ];

    public function category()
    {
        return $this->belongsTo(InventoryCategory::class, 'category_id');
    }

    public function movements()
    {
        return $this->hasMany(InventoryMovement::class, 'item_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function isLowStock(): bool
    {
        return $this->reorder_level > 0 && $this->current_stock <= $this->reorder_level;
    }
}
