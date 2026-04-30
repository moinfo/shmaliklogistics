<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'billing_document_id', 'amount', 'payment_date',
        'payment_method', 'reference_number', 'notes', 'created_by',
    ];

    protected $casts = [
        'payment_date' => 'date',
        'amount'       => 'decimal:2',
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
