<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AttendanceDevice extends Model
{
    protected $fillable = [
        'name', 'ip_address', 'port', 'serial_number',
        'location', 'model', 'firmware', 'is_active',
        'last_sync_at', 'last_sync_count',
    ];

    protected $casts = [
        'is_active'   => 'boolean',
        'last_sync_at' => 'datetime',
    ];

    public function logs()
    {
        return $this->hasMany(AttendanceLog::class, 'device_id');
    }
}
