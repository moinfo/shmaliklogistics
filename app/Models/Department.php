<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    protected $fillable = ['name', 'code', 'description', 'is_active', 'created_by'];

    protected $casts = ['is_active' => 'boolean'];

    public function creator() { return $this->belongsTo(User::class, 'created_by'); }
}
