<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmployeeLoan extends Model
{
    protected $fillable = [
        'employee_id', 'loan_number', 'principal', 'balance_remaining',
        'monthly_installment', 'total_months', 'months_paid',
        'start_date', 'expected_end_date', 'purpose',
        'status', 'approved_by', 'approval_notes', 'created_by', 'notes',
    ];

    protected $casts = [
        'start_date'        => 'date',
        'expected_end_date' => 'date',
        'principal'         => 'decimal:2',
        'balance_remaining' => 'decimal:2',
        'monthly_installment' => 'decimal:2',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public static function nextNumber(): string
    {
        $last = static::withTrashed()->max('id') ?? 0;
        return 'LN-' . date('Y') . '-' . str_pad($last + 1, 4, '0', STR_PAD_LEFT);
    }

    public function getProgressPctAttribute(): float
    {
        if ($this->total_months == 0) return 0;
        return round(($this->months_paid / $this->total_months) * 100, 1);
    }

    public static array $statuses = [
        'pending'   => ['label' => 'Pending',   'color' => '#F59E0B'],
        'active'    => ['label' => 'Active',    'color' => '#3B82F6'],
        'settled'   => ['label' => 'Settled',   'color' => '#22C55E'],
        'defaulted' => ['label' => 'Defaulted', 'color' => '#EF4444'],
        'rejected'  => ['label' => 'Rejected',  'color' => '#94A3B8'],
    ];
}
