<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PropertyExpense extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'property_id', 'property_unit_id', 'category', 'description',
        'amount', 'currency', 'exchange_rate', 'amount_tzs',
        'expense_date', 'phase', 'vendor', 'receipt_number',
        'receipt_path', 'notes', 'created_by',
    ];

    protected $appends = ['receipt_url'];

    protected $casts = [
        'expense_date'  => 'date',
        'amount'        => 'decimal:2',
        'exchange_rate' => 'decimal:2',
        'amount_tzs'    => 'decimal:2',
    ];

    public function property()
    {
        return $this->belongsTo(Property::class);
    }

    public function unit()
    {
        return $this->belongsTo(PropertyUnit::class, 'property_unit_id');
    }

    public function getReceiptUrlAttribute(): ?string
    {
        return $this->receipt_path
            ? '/storage/' . ltrim($this->receipt_path, '/')
            : null;
    }

    public static array $categories = [
        'renovation'  => ['label' => 'Renovation',  'icon' => '🔨'],
        'repair'      => ['label' => 'Repair',      'icon' => '🛠️'],
        'maintenance' => ['label' => 'Maintenance', 'icon' => '🧰'],
        'utility'     => ['label' => 'Utility',     'icon' => '💡'],
        'land_rent'   => ['label' => 'Land Rent',   'icon' => '🌍'],
        'tax'         => ['label' => 'Tax',         'icon' => '🧾'],
        'agent_fee'   => ['label' => 'Agent Fee',   'icon' => '🤝'],
        'security'    => ['label' => 'Security',    'icon' => '🛡️'],
        'cleaning'    => ['label' => 'Cleaning',    'icon' => '🧹'],
        'furnishing'  => ['label' => 'Furnishing',  'icon' => '🛋️'],
        'insurance'   => ['label' => 'Insurance',   'icon' => '📋'],
        'other'       => ['label' => 'Other',       'icon' => '📦'],
    ];

    public static array $phases = [
        'acquisition' => ['label' => 'Acquisition', 'color' => '#3B82F6'],
        'renovation'  => ['label' => 'Renovation',  'color' => '#A855F7'],
        'operating'   => ['label' => 'Operating',   'color' => '#22C55E'],
    ];
}