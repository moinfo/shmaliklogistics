<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmployeeAdvance extends Model
{
    protected $fillable = [
        'employee_id', 'amount', 'purpose', 'requested_date',
        'deduction_month', 'status', 'approved_by', 'approval_notes',
        'payroll_slip_id', 'created_by', 'notes',
    ];

    protected $casts = [
        'requested_date'  => 'date',
        'deduction_month' => 'date',
        'amount'          => 'decimal:2',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function payrollSlip()
    {
        return $this->belongsTo(PayrollSlip::class);
    }

    public static function nextNumber(): string
    {
        $last = static::max('id') ?? 0;
        return 'ADV-' . str_pad($last + 1, 4, '0', STR_PAD_LEFT);
    }

    public static array $statuses = [
        'pending'  => ['label' => 'Pending',  'color' => '#F59E0B'],
        'approved' => ['label' => 'Approved', 'color' => '#3B82F6'],
        'rejected' => ['label' => 'Rejected', 'color' => '#EF4444'],
        'deducted' => ['label' => 'Deducted', 'color' => '#22C55E'],
    ];
}
