<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VehicleDocumentType extends Model
{
    protected $fillable = ['name', 'description', 'is_builtin', 'is_active', 'sort_order'];

    protected $casts = [
        'is_builtin'  => 'boolean',
        'is_active'   => 'boolean',
        'sort_order'  => 'integer',
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeCustom($query)
    {
        return $query->where('is_builtin', false);
    }
}
