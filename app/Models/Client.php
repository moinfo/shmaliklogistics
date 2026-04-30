<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Client extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name', 'company_name', 'email', 'phone', 'phone_alt',
        'address', 'tin_number', 'vrn_number', 'status', 'notes', 'created_by',
        'portal_password', 'portal_active', 'last_portal_login',
    ];

    protected $hidden = ['portal_password'];

    protected $casts = [
        'portal_active'      => 'boolean',
        'last_portal_login'  => 'datetime',
    ];

    public function billingDocuments()
    {
        return $this->hasMany(BillingDocument::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public static array $statuses = [
        'active'   => ['label' => 'Active',   'color' => '#22C55E'],
        'inactive' => ['label' => 'Inactive', 'color' => '#94A3B8'],
    ];
}
