<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeductionType extends Model
{
    protected $fillable = [
        'name', 'nature', 'abbreviation', 'description',
        'registration_number', 'is_statutory', 'is_active',
    ];

    protected $casts = [
        'is_statutory' => 'boolean',
        'is_active'    => 'boolean',
    ];

    public function employeeDeductions()
    {
        return $this->hasMany(EmployeeDeduction::class);
    }

    public static array $natures = ['TAXABLE', 'GROSS', 'NET'];
}
