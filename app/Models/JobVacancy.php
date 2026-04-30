<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JobVacancy extends Model
{
    use HasFactory;

    protected $fillable = [
        'title', 'department', 'description', 'requirements',
        'openings', 'status', 'closing_date', 'created_by',
    ];

    protected $casts = ['closing_date' => 'date'];

    public function applications()
    {
        return $this->hasMany(JobApplication::class, 'vacancy_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public static array $statuses = [
        'open'   => ['label' => 'Open',   'color' => '#22C55E'],
        'closed' => ['label' => 'Closed', 'color' => '#94A3B8'],
        'filled' => ['label' => 'Filled', 'color' => '#2196F3'],
    ];
}
