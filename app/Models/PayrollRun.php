<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PayrollRun extends Model
{
    protected $fillable = ['year', 'month', 'status', 'notes', 'created_by', 'document_number', 'payroll_number'];

    public function slips()
    {
        return $this->hasMany(PayrollSlip::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public static array $statuses = [
        'draft'     => ['label' => 'Draft',     'color' => '#94A3B8'],
        'processed' => ['label' => 'Processed', 'color' => '#3B82F6'],
        'closed'    => ['label' => 'Closed',    'color' => '#22C55E'],
    ];

    public function getMonthNameAttribute(): string
    {
        return date('F', mktime(0, 0, 0, $this->month, 1));
    }
}
