<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class TrackingShare extends Model
{
    protected $fillable = ['vehicle_id', 'trip_id', 'token', 'label', 'expires_at', 'revoked_at', 'created_by'];

    protected $casts = [
        'expires_at' => 'datetime',
        'revoked_at' => 'datetime',
    ];

    public function vehicle() { return $this->belongsTo(Vehicle::class); }
    public function trip()    { return $this->belongsTo(Trip::class); }

    public static function newToken(): string
    {
        return Str::random(40);
    }

    public function isActive(): bool
    {
        return $this->revoked_at === null && $this->expires_at->isFuture();
    }

    public function scopeActive($query)
    {
        return $query->whereNull('revoked_at')->where('expires_at', '>', now());
    }
}
