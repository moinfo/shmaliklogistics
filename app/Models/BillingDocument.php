<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BillingDocument extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'type', 'document_number', 'client_id', 'trip_id', 'status',
        'issue_date', 'due_date', 'valid_until', 'currency',
        'subtotal', 'discount_amount', 'tax_rate', 'tax_amount', 'total',
        'notes', 'terms_conditions', 'converted_from_id', 'created_by',
    ];

    protected $casts = [
        'issue_date'      => 'date',
        'due_date'        => 'date',
        'valid_until'     => 'date',
        'subtotal'        => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'tax_rate'        => 'decimal:2',
        'tax_amount'      => 'decimal:2',
        'total'           => 'decimal:2',
    ];

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function trip()
    {
        return $this->belongsTo(Trip::class);
    }

    public function items()
    {
        return $this->hasMany(BillingItem::class)->orderBy('sort_order');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function convertedFrom()
    {
        return $this->belongsTo(BillingDocument::class, 'converted_from_id');
    }

    public function conversions()
    {
        return $this->hasMany(BillingDocument::class, 'converted_from_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function getAmountPaidAttribute(): float
    {
        return (float) $this->payments()->sum('amount');
    }

    public function getBalanceDueAttribute(): float
    {
        return (float) $this->total - $this->amount_paid;
    }

    public static function nextNumber(string $type): string
    {
        $prefix = match($type) {
            'quote'    => 'QUO',
            'proforma' => 'PRO',
            'invoice'  => 'INV',
            default    => 'DOC',
        };
        $year  = now()->year;
        $full  = "{$prefix}-{$year}-";
        $last  = static::withTrashed()
            ->where('type', $type)
            ->where('document_number', 'like', "{$full}%")
            ->orderByDesc('id')
            ->value('document_number');

        $seq = $last ? ((int) substr($last, -4)) + 1 : 1;
        return $full . str_pad($seq, 4, '0', STR_PAD_LEFT);
    }

    public static array $quoteStatuses = [
        'draft'    => ['label' => 'Draft',    'color' => '#94A3B8'],
        'sent'     => ['label' => 'Sent',     'color' => '#60A5FA'],
        'accepted' => ['label' => 'Accepted', 'color' => '#22C55E'],
        'rejected' => ['label' => 'Rejected', 'color' => '#EF4444'],
        'expired'  => ['label' => 'Expired',  'color' => '#F59E0B'],
    ];

    public static array $proformaStatuses = [
        'draft'    => ['label' => 'Draft',    'color' => '#94A3B8'],
        'sent'     => ['label' => 'Sent',     'color' => '#60A5FA'],
        'accepted' => ['label' => 'Accepted', 'color' => '#22C55E'],
        'expired'  => ['label' => 'Expired',  'color' => '#F59E0B'],
    ];

    public static array $invoiceStatuses = [
        'draft'     => ['label' => 'Draft',     'color' => '#94A3B8'],
        'sent'      => ['label' => 'Sent',      'color' => '#60A5FA'],
        'partial'   => ['label' => 'Partial',   'color' => '#F59E0B'],
        'paid'      => ['label' => 'Paid',      'color' => '#22C55E'],
        'overdue'   => ['label' => 'Overdue',   'color' => '#EF4444'],
        'cancelled' => ['label' => 'Cancelled', 'color' => '#475569'],
    ];

    public function getStatusesForTypeAttribute(): array
    {
        return match($this->type) {
            'quote'    => self::$quoteStatuses,
            'proforma' => self::$proformaStatuses,
            'invoice'  => self::$invoiceStatuses,
            default    => [],
        };
    }
}
