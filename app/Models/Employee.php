<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Employee extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'employee_number', 'name', 'department', 'position',
        'phone', 'email', 'national_id', 'address',
        'hire_date', 'birth_date',
        'salary', 'salary_currency', 'status',
        'emergency_contact_name', 'emergency_contact_phone',
        'notes', 'created_by',
    ];

    protected $casts = [
        'hire_date'  => 'date',
        'birth_date' => 'date',
        'salary'     => 'decimal:2',
    ];

    public function leaveRequests()
    {
        return $this->hasMany(LeaveRequest::class);
    }

    public function advances()
    {
        return $this->hasMany(EmployeeAdvance::class);
    }

    public function loans()
    {
        return $this->hasMany(EmployeeLoan::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public static function nextNumber(): string
    {
        $last = static::withTrashed()->max('employee_number');
        $seq  = $last ? ((int) substr($last, 4)) + 1 : 1;
        return 'EMP-' . str_pad($seq, 4, '0', STR_PAD_LEFT);
    }

    public static array $departments = [
        'Operations',
        'Finance',
        'Administration',
        'Logistics',
        'Mechanical',
        'Security',
        'Management',
    ];

    public static array $statuses = [
        'active'     => ['label' => 'Active',     'color' => '#22C55E'],
        'on_leave'   => ['label' => 'On Leave',   'color' => '#F59E0B'],
        'suspended'  => ['label' => 'Suspended',  'color' => '#EF4444'],
        'terminated' => ['label' => 'Terminated', 'color' => '#475569'],
    ];
}
