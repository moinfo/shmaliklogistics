<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'contact_name', 'phone', 'email', 'address',
        'tin_number', 'category', 'is_active', 'notes', 'created_by',
    ];

    protected $casts = ['is_active' => 'boolean'];

    public function purchaseOrders()
    {
        return $this->hasMany(PurchaseOrder::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public static array $categories = [
        'fuel'        => ['label' => 'Fuel',        'color' => '#F59E0B'],
        'spare_parts' => ['label' => 'Spare Parts',  'color' => '#2196F3'],
        'office'      => ['label' => 'Office',       'color' => '#A855F7'],
        'other'       => ['label' => 'Other',        'color' => '#94A3B8'],
    ];
}
