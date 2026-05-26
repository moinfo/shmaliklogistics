<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class RentInvoice extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'invoice_number', 'lease_id', 'property_unit_id', 'tenant_id',
        'period_start', 'period_end', 'due_date',
        'amount', 'currency', 'status', 'notes', 'created_by',
    ];

    protected $appends = ['amount_paid', 'balance_due'];

    protected $casts = [
        'period_start' => 'date',
        'period_end'   => 'date',
        'due_date'     => 'date',
        'amount'       => 'decimal:2',
    ];

    public function lease()
    {
        return $this->belongsTo(Lease::class);
    }

    public function unit()
    {
        return $this->belongsTo(PropertyUnit::class, 'property_unit_id');
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function payments()
    {
        return $this->hasMany(RentPayment::class);
    }

    public function getAmountPaidAttribute(): float
    {
        return (float) $this->payments()->sum('amount');
    }

    public function getBalanceDueAttribute(): float
    {
        return (float) $this->amount - $this->amount_paid;
    }

    public function recalcStatus(): void
    {
        $paid = (float) $this->payments()->sum('amount');

        if ($paid <= 0) {
            if (in_array($this->status, ['paid', 'partial'], true)) {
                $this->status = 'unpaid';
            }
        } elseif ($paid >= (float) $this->amount) {
            $this->status = 'paid';
        } else {
            $this->status = 'partial';
        }

        $this->save();
    }

    public static function nextNumber(): string
    {
        $year   = now()->year;
        $prefix = "RNT-{$year}-";
        $last   = static::withTrashed()
            ->where('invoice_number', 'like', "{$prefix}%")
            ->orderByDesc('id')
            ->value('invoice_number');

        $seq = $last ? ((int) substr($last, -4)) + 1 : 1;
        return $prefix . str_pad($seq, 4, '0', STR_PAD_LEFT);
    }

    public static array $statuses = [
        'unpaid'    => ['label' => 'Unpaid',    'color' => '#94A3B8'],
        'partial'   => ['label' => 'Partial',   'color' => '#F59E0B'],
        'paid'      => ['label' => 'Paid',      'color' => '#22C55E'],
        'overdue'   => ['label' => 'Overdue',   'color' => '#EF4444'],
        'cancelled' => ['label' => 'Cancelled', 'color' => '#475569'],
    ];
}