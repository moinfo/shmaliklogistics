<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PayrollSetting extends Model
{
    protected $fillable = ['key', 'value', 'label', 'group'];

    /** Return all settings as a flat key→value array. */
    public static function allAsMap(): array
    {
        return static::pluck('value', 'key')->toArray();
    }
}
