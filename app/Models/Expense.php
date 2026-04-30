<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Expense extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'trip_id', 'vehicle_plate', 'category', 'description',
        'amount', 'currency', 'expense_date', 'receipt_number', 'notes', 'created_by',
    ];

    protected $casts = [
        'expense_date' => 'date',
        'amount'       => 'decimal:2',
    ];

    public function trip()    { return $this->belongsTo(Trip::class); }
    public function creator() { return $this->belongsTo(User::class, 'created_by'); }

    public static array $categories = [
        'fuel'          => ['label' => 'Fuel',                 'icon' => '⛽'],
        'tyre'          => ['label' => 'Tyre / Wheel',         'icon' => '🔄'],
        'repair'        => ['label' => 'Vehicle Repair',       'icon' => '🔧'],
        'driver_salary' => ['label' => 'Driver Salary/Advance','icon' => '👤'],
        'accommodation' => ['label' => 'Accommodation',        'icon' => '🏨'],
        'toll'          => ['label' => 'Toll / Road Fees',     'icon' => '🛣️'],
        'port'          => ['label' => 'Port / Clearing',      'icon' => '🚢'],
        'permit_fee'    => ['label' => 'Permit Fee',           'icon' => '🛂'],
        'communication' => ['label' => 'Communication',        'icon' => '📱'],
        'office'        => ['label' => 'Office Expenses',      'icon' => '🏢'],
        'other'         => ['label' => 'Other',                'icon' => '📦'],
    ];

    public static array $currencies = ['TZS', 'USD', 'ZMW', 'CDF', 'MWK', 'KES', 'ZAR'];
}
