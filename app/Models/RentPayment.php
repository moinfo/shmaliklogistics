<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RentPayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'rent_invoice_id', 'lease_id', 'amount', 'currency',
        'payment_date', 'payment_method', 'reference_number',
        'receipt_path', 'notes', 'created_by',
    ];

    protected $appends = ['receipt_url'];

    protected $casts = [
        'payment_date' => 'date',
        'amount'       => 'decimal:2',
    ];

    public function invoice()
    {
        return $this->belongsTo(RentInvoice::class, 'rent_invoice_id');
    }

    public function lease()
    {
        return $this->belongsTo(Lease::class);
    }

    public function getReceiptUrlAttribute(): ?string
    {
        return $this->receipt_path
            ? '/storage/' . ltrim($this->receipt_path, '/')
            : null;
    }

    public static array $methods = [
        'cash'          => ['label' => 'Cash',          'color' => '#22C55E'],
        'bank_transfer' => ['label' => 'Bank Transfer', 'color' => '#3B82F6'],
        'mobile_money'  => ['label' => 'Mobile Money',  'color' => '#F59E0B'],
        'cheque'        => ['label' => 'Cheque',        'color' => '#8B5CF6'],
    ];
}