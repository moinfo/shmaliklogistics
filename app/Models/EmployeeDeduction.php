<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmployeeDeduction extends Model
{
    protected $fillable = [
        'employee_id', 'deduction_type_id',
        'membership_number', 'fixed_amount', 'is_active',
    ];

    protected $casts = [
        'fixed_amount' => 'decimal:2',
        'is_active'    => 'boolean',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function deductionType()
    {
        return $this->belongsTo(DeductionType::class);
    }
}
