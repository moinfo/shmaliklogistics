<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TripExpenseLine extends Model
{
    protected $fillable = [
        'trip_id', 'category', 'description',
        'quantity', 'unit_price', 'amount',
        'currency', 'exchange_rate', 'amount_tzs',
        'sort_order', 'created_by',
    ];

    protected $casts = [
        'quantity'      => 'decimal:3',
        'unit_price'    => 'decimal:2',
        'amount'        => 'decimal:2',
        'exchange_rate' => 'decimal:2',
        'amount_tzs'    => 'decimal:2',
    ];

    public function trip()    { return $this->belongsTo(Trip::class); }
    public function creator() { return $this->belongsTo(User::class, 'created_by'); }

    public static array $categories = [
        'fuel'        => ['label' => 'Fuel',               'icon' => '⛽'],
        'road_toll'   => ['label' => 'Road Toll',          'icon' => '🛣️'],
        'mileage'     => ['label' => 'Mileage Allowance',  'icon' => '🚗'],
        'border_fee'  => ['label' => 'Border / Clearing',  'icon' => '🛂'],
        'council_fee' => ['label' => 'Council Fee',        'icon' => '🏛️'],
        'handling'    => ['label' => 'Handling / Loading', 'icon' => '📦'],
        'parking'     => ['label' => 'Parking',            'icon' => '🅿️'],
        'car_wash'    => ['label' => 'Car Wash',           'icon' => '🚿'],
        'posho'       => ['label' => 'Posho / Allowance',  'icon' => '🍽️'],
        'guard'       => ['label' => 'Guard (Mlinzi)',     'icon' => '🛡️'],
        'other'       => ['label' => 'Other',              'icon' => '📋'],
    ];

    public static array $currencies = ['TZS', 'USD', 'ZMW', 'CDF', 'MWK', 'KES', 'ZAR'];
}
