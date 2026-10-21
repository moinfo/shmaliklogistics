<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BillingDocumentEmail extends Model
{
    protected $fillable = [
        'billing_document_id', 'recipient', 'subject', 'message',
        'status', 'error', 'sent_by',
    ];

    public function document()
    {
        return $this->belongsTo(BillingDocument::class, 'billing_document_id');
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sent_by');
    }
}
