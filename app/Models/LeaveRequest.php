<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LeaveRequest extends Model
{
    protected $fillable = [
        'employee_id', 'type', 'start_date', 'end_date', 'days',
        'reason', 'status', 'approved_by', 'approval_notes', 'created_by',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date'   => 'date',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public static array $types = [
        'annual'    => ['label' => 'Annual Leave',    'color' => '#3B82F6'],
        'sick'      => ['label' => 'Sick Leave',      'color' => '#EF4444'],
        'emergency' => ['label' => 'Emergency Leave', 'color' => '#F59E0B'],
        'maternity' => ['label' => 'Maternity Leave', 'color' => '#EC4899'],
        'paternity' => ['label' => 'Paternity Leave', 'color' => '#8B5CF6'],
        'unpaid'    => ['label' => 'Unpaid Leave',    'color' => '#94A3B8'],
    ];

    public static array $statuses = [
        'pending'  => ['label' => 'Pending',  'color' => '#F59E0B'],
        'approved' => ['label' => 'Approved', 'color' => '#22C55E'],
        'rejected' => ['label' => 'Rejected', 'color' => '#EF4444'],
    ];
}
