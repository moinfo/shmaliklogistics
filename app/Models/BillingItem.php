<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BillingItem extends Model
{
    protected $fillable = [
        'billing_document_id', 'description', 'quantity', 'unit', 'unit_price', 'total', 'sort_order',
    ];

    protected $casts = [
        'quantity'   => 'decimal:2',
        'unit_price' => 'decimal:2',
        'total'      => 'decimal:2',
    ];

    public function document()
    {
        return $this->belongsTo(BillingDocument::class, 'billing_document_id');
    }
}
