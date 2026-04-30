<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PortalQuoteRequest extends Model
{
    protected $fillable = [
        'client_id', 'route_from', 'route_to', 'cargo_description',
        'cargo_weight_kg', 'cargo_volume_m3', 'preferred_date', 'notes',
        'status', 'reviewed_by', 'staff_notes',
    ];

    protected $casts = [
        'preferred_date' => 'date',
        'cargo_weight_kg' => 'decimal:2',
    ];

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public static array $statuses = [
        'pending'   => ['label' => 'Pending',  'color' => '#F59E0B'],
        'reviewed'  => ['label' => 'Reviewed', 'color' => '#3B82F6'],
        'quoted'    => ['label' => 'Quoted',   'color' => '#22C55E'],
        'cancelled' => ['label' => 'Cancelled','color' => '#EF4444'],
    ];
}
