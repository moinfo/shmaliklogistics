<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Property extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code', 'name', 'type', 'status', 'ownership',
        'address', 'region', 'district',
        'acquisition_date', 'purchase_price', 'purchase_currency', 'market_value',
        'title_deed_number', 'title_deed_path',
        'description', 'notes', 'created_by',
    ];

    protected $appends = ['title_deed_url'];

    protected $casts = [
        'acquisition_date' => 'date',
        'purchase_price'   => 'decimal:2',
        'market_value'     => 'decimal:2',
    ];

    public function units()
    {
        return $this->hasMany(PropertyUnit::class);
    }

    public function expenses()
    {
        return $this->hasMany(PropertyExpense::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function leases()
    {
        return $this->hasManyThrough(Lease::class, PropertyUnit::class);
    }

    public function getTitleDeedUrlAttribute(): ?string
    {
        return $this->title_deed_path
            ? '/storage/' . ltrim($this->title_deed_path, '/')
            : null;
    }

    public function getTotalInvestedAttribute(): float
    {
        return (float) $this->purchase_price
            + (float) $this->expenses()->sum('amount_tzs');
    }

    public static function nextNumber(): string
    {
        $year   = now()->year;
        $prefix = "PROP-{$year}-";
        $last   = static::withTrashed()
            ->where('code', 'like', "{$prefix}%")
            ->orderByDesc('id')
            ->value('code');

        $seq = $last ? ((int) substr($last, -3)) + 1 : 1;
        return $prefix . str_pad($seq, 3, '0', STR_PAD_LEFT);
    }

    public static array $types = [
        'house'      => ['label' => 'House',          'color' => '#3B82F6'],
        'apartment'  => ['label' => 'Apartment',      'color' => '#8B5CF6'],
        'room_block' => ['label' => 'Room Block',     'color' => '#06B6D4'],
        'commercial' => ['label' => 'Commercial',     'color' => '#F59E0B'],
        'farm'       => ['label' => 'Farm',           'color' => '#22C55E'],
        'land'       => ['label' => 'Land',           'color' => '#A16207'],
    ];

    public static array $statuses = [
        'available'           => ['label' => 'Available',           'color' => '#22C55E'],
        'occupied'            => ['label' => 'Occupied',            'color' => '#3B82F6'],
        'partially_occupied'  => ['label' => 'Partially Occupied',  'color' => '#F59E0B'],
        'under_renovation'    => ['label' => 'Under Renovation',    'color' => '#A855F7'],
        'not_available'       => ['label' => 'Not Available',       'color' => '#94A3B8'],
    ];

    public static array $ownerships = [
        'owned'   => ['label' => 'Owned',   'color' => '#22C55E'],
        'managed' => ['label' => 'Managed', 'color' => '#60A5FA'],
    ];
}