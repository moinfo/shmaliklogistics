<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmployeeInfraction extends Model
{
    protected $fillable = [
        'employee_id', 'bonus_rule_id', 'amount', 'occurred_on',
        'status', 'notes', 'recorded_by', 'payroll_slip_id',
    ];

    protected $casts = [
        'amount'      => 'decimal:2',
        'occurred_on' => 'date',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function rule()
    {
        return $this->belongsTo(BonusRule::class, 'bonus_rule_id');
    }

    public function recorder()
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }

    public static array $statuses = ['pending', 'applied', 'waived'];
}
