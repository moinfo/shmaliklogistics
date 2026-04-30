<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseOrderItem extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'purchase_order_id', 'inventory_item_id', 'description',
        'quantity', 'unit', 'unit_price', 'total', 'received_qty',
    ];

    protected $casts = [
        'quantity'     => 'decimal:3',
        'unit_price'   => 'decimal:2',
        'total'        => 'decimal:2',
        'received_qty' => 'decimal:3',
    ];

    public function purchaseOrder()
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    public function inventoryItem()
    {
        return $this->belongsTo(InventoryItem::class);
    }
}
