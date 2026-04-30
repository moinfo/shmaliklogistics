<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'po_number', 'supplier_id', 'status', 'order_date', 'expected_date',
        'notes', 'subtotal', 'tax_amount', 'total', 'created_by',
    ];

    protected $casts = [
        'order_date'    => 'date',
        'expected_date' => 'date',
        'subtotal'      => 'decimal:2',
        'tax_amount'    => 'decimal:2',
        'total'         => 'decimal:2',
    ];

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function items()
    {
        return $this->hasMany(PurchaseOrderItem::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function recalculateTotals(): void
    {
        $subtotal = $this->items()->sum('total');
        $tax      = round($subtotal * 0.18, 2);
        $this->update(['subtotal' => $subtotal, 'tax_amount' => $tax, 'total' => $subtotal + $tax]);
    }

    public static function nextNumber(): string
    {
        $year = now()->year;
        $last = static::whereYear('created_at', $year)->max('po_number');
        $seq  = $last ? ((int) substr($last, -4)) + 1 : 1;
        return 'PO-' . $year . '-' . str_pad($seq, 4, '0', STR_PAD_LEFT);
    }

    public static array $statuses = [
        'draft'     => ['label' => 'Draft',     'color' => '#94A3B8'],
        'sent'      => ['label' => 'Sent',       'color' => '#2196F3'],
        'partial'   => ['label' => 'Partial',    'color' => '#F59E0B'],
        'received'  => ['label' => 'Received',   'color' => '#22C55E'],
        'cancelled' => ['label' => 'Cancelled',  'color' => '#EF4444'],
    ];
}
