<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CompanySetting extends Model
{
    protected $fillable = [
        'company_name', 'company_address', 'company_po_box',
        'company_city', 'company_country', 'company_phone',
        'company_email', 'company_tin', 'company_logo',
    ];

    public static function get(): self
    {
        return static::firstOrCreate([], ['company_name' => 'YOUR COMPANY LIMITED', 'company_country' => 'Tanzania']);
    }
}
