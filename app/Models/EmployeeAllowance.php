<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmployeeAllowance extends Model
{
    protected $fillable = [
        'employee_id', 'name', 'type', 'amount',
        'description', 'is_taxable', 'is_active',
    ];

    protected $casts = [
        'amount'     => 'decimal:2',
        'is_taxable' => 'boolean',
        'is_active'  => 'boolean',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public static array $types = ['FIXED', 'PERCENTAGE'];
}
