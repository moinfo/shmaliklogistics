<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'billing_document_id', 'amount', 'usd_amount', 'exchange_rate',
        'payment_date', 'payment_method', 'payment_stage',
        'reference_number', 'cheque_number', 'cheque_date',
        'notes', 'created_by',
    ];

    protected $casts = [
        'payment_date'  => 'date',
        'cheque_date'   => 'date',
        'amount'        => 'decimal:2',
        'usd_amount'    => 'decimal:2',
        'exchange_rate' => 'decimal:2',
    ];

    public static array $stages = [
        'advance' => ['label' => 'Advance',  'color' => '#F59E0B'],
        'final'   => ['label' => 'Final',    'color' => '#22C55E'],
    ];

    public function invoice()
    {
        return $this->belongsTo(BillingDocument::class, 'billing_document_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public static array $methods = [
        'bank_transfer' => 'Bank Transfer',
        'cash'          => 'Cash',
        'mobile_money'  => 'Mobile Money (M-Pesa/Tigopesa)',
        'cheque'        => 'Cheque',
        'rtgs'          => 'RTGS',
    ];
}
