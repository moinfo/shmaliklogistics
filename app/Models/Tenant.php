<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Tenant extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code', 'name', 'type', 'phone', 'phone_alt', 'email',
        'national_id', 'company_name', 'tin', 'address',
        'emergency_contact_name', 'emergency_contact_phone',
        'status', 'notes', 'created_by',
    ];

    public function leases()
    {
        return $this->hasMany(Lease::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public static function nextNumber(): string
    {
        $year   = now()->year;
        $prefix = "TEN-{$year}-";
        $last   = static::withTrashed()
            ->where('code', 'like', "{$prefix}%")
            ->orderByDesc('id')
            ->value('code');

        $seq = $last ? ((int) substr($last, -3)) + 1 : 1;
        return $prefix . str_pad($seq, 3, '0', STR_PAD_LEFT);
    }

    public static array $types = [
        'individual' => ['label' => 'Individual', 'color' => '#3B82F6'],
        'company'    => ['label' => 'Company',    'color' => '#8B5CF6'],
    ];

    public static array $statuses = [
        'active' => ['label' => 'Active', 'color' => '#22C55E'],
        'past'   => ['label' => 'Past',   'color' => '#94A3B8'],
    ];
}