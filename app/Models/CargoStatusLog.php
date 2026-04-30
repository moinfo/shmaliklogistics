<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CargoStatusLog extends Model
{
    protected $fillable = ['cargo_id', 'status', 'location', 'notes', 'user_id'];

    public function cargo() { return $this->belongsTo(Cargo::class); }
    public function user()  { return $this->belongsTo(User::class); }
}
