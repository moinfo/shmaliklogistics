<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BonusRule extends Model
{
    protected $fillable = ['name', 'penalty_amount', 'description', 'is_active'];

    protected $casts = [
        'penalty_amount' => 'decimal:2',
        'is_active'      => 'boolean',
    ];

    public function infractions()
    {
        return $this->hasMany(EmployeeInfraction::class);
    }
}
