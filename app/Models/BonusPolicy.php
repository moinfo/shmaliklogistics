<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BonusPolicy extends Model
{
    protected $fillable = ['department', 'amount', 'is_active', 'description'];

    protected $casts = [
        'amount'    => 'decimal:2',
        'is_active' => 'boolean',
    ];

    /** Active department → default bonus amount map, for the payroll calculator. */
    public static function activeMap(): array
    {
        return static::where('is_active', true)->pluck('amount', 'department')->toArray();
    }
}
