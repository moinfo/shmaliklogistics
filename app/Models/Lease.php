<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Lease extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'lease_number', 'property_unit_id', 'tenant_id',
        'start_date', 'end_date', 'billing_cycle',
        'rent_amount', 'rent_currency', 'deposit_amount', 'payment_day',
        'status', 'contract_path', 'contract_uploaded_at',
        'terms', 'notes', 'created_by',
    ];

    protected $appends = ['contract_url'];

    protected $casts = [
        'start_date'           => 'date',
        'end_date'             => 'date',
        'contract_uploaded_at' => 'datetime',
        'rent_amount'          => 'decimal:2',
        'deposit_amount'       => 'decimal:2',
    ];

    public function unit()
    {
        return $this->belongsTo(PropertyUnit::class, 'property_unit_id');
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function rentInvoices()
    {
        return $this->hasMany(RentInvoice::class);
    }

    public function payments()
    {
        return $this->hasMany(RentPayment::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function getContractUrlAttribute(): ?string
    {
        return $this->contract_path
            ? '/storage/' . ltrim($this->contract_path, '/')
            : null;
    }

    public static function nextNumber(): string
    {
        $year   = now()->year;
        $prefix = "LSE-{$year}-";
        $last   = static::withTrashed()
            ->where('lease_number', 'like', "{$prefix}%")
            ->orderByDesc('id')
            ->value('lease_number');

        $seq = $last ? ((int) substr($last, -4)) + 1 : 1;
        return $prefix . str_pad($seq, 4, '0', STR_PAD_LEFT);
    }

    public static array $statuses = [
        'active'     => ['label' => 'Active',     'color' => '#22C55E'],
        'pending'    => ['label' => 'Pending',    'color' => '#60A5FA'],
        'expired'    => ['label' => 'Expired',    'color' => '#F59E0B'],
        'terminated' => ['label' => 'Terminated', 'color' => '#EF4444'],
    ];

    public static array $billingCycles = [
        'monthly'     => ['label' => 'Monthly',            'months' => 1],
        'quarterly'   => ['label' => 'Quarterly',          'months' => 3],
        'semi_annual' => ['label' => 'Semi-Annual (6mo)',  'months' => 6],
        'annual'      => ['label' => 'Annual',             'months' => 12],
    ];
}