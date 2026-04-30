<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JobApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'vacancy_id', 'full_name', 'phone', 'email', 'cv_path',
        'stage', 'interview_date', 'interview_notes', 'offer_amount', 'notes',
    ];

    protected $casts = [
        'interview_date' => 'datetime',
        'offer_amount'   => 'decimal:2',
    ];

    public function vacancy()
    {
        return $this->belongsTo(JobVacancy::class, 'vacancy_id');
    }

    public static array $stages = [
        'applied'     => ['label' => 'Applied',     'color' => '#94A3B8'],
        'shortlisted' => ['label' => 'Shortlisted', 'color' => '#2196F3'],
        'interview'   => ['label' => 'Interview',   'color' => '#F59E0B'],
        'offer'       => ['label' => 'Offer',       'color' => '#A855F7'],
        'hired'       => ['label' => 'Hired',       'color' => '#22C55E'],
        'rejected'    => ['label' => 'Rejected',    'color' => '#EF4444'],
    ];
}
