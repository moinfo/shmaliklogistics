<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PayrollSlip extends Model
{
    protected $fillable = [
        'payroll_run_id', 'employee_id',
        'basic_salary', 'allowances', 'overtime', 'gross_salary',
        'paye', 'nssf_employee', 'nhif_employee', 'heslb', 'other_deductions',
        'advance_deduction', 'loan_deduction', 'loan_balance', 'adjustment',
        'total_deductions', 'net_salary',
        'nssf_employer', 'sdl_employer', 'wcf_employer', 'total_employer_cost',
        'notes',
    ];

    protected $casts = [
        'basic_salary' => 'decimal:2', 'allowances' => 'decimal:2',
        'overtime' => 'decimal:2', 'gross_salary' => 'decimal:2',
        'paye' => 'decimal:2', 'nssf_employee' => 'decimal:2',
        'nhif_employee' => 'decimal:2', 'heslb' => 'decimal:2',
        'other_deductions' => 'decimal:2', 'adjustment' => 'decimal:2',
        'advance_deduction' => 'decimal:2', 'loan_deduction' => 'decimal:2',
        'loan_balance' => 'decimal:2',
        'total_deductions' => 'decimal:2', 'net_salary' => 'decimal:2',
        'nssf_employer' => 'decimal:2', 'sdl_employer' => 'decimal:2',
        'wcf_employer' => 'decimal:2', 'total_employer_cost' => 'decimal:2',
    ];

    public function run()
    {
        return $this->belongsTo(PayrollRun::class, 'payroll_run_id');
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function advances()
    {
        return $this->hasMany(EmployeeAdvance::class);
    }
}
