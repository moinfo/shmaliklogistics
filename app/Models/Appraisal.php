<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Appraisal extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id', 'period_from', 'period_to',
        'trips_count', 'on_time_pct', 'fuel_eff_kml', 'incidents',
        'rating_punctuality', 'rating_conduct', 'rating_cargo_care', 'rating_compliance',
        'manager_rating', 'manager_notes', 'overall_score', 'status', 'created_by',
    ];

    protected $casts = [
        'period_from'  => 'date',
        'period_to'    => 'date',
        'on_time_pct'  => 'decimal:2',
        'fuel_eff_kml' => 'decimal:2',
        'overall_score'=> 'decimal:2',
    ];

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function computeOverallScore(): float
    {
        $ratings = array_filter([
            $this->rating_punctuality,
            $this->rating_conduct,
            $this->rating_cargo_care,
            $this->rating_compliance,
            $this->manager_rating,
        ], fn ($v) => $v !== null);

        if (empty($ratings)) return 0;

        $avg = array_sum($ratings) / count($ratings);

        // Penalty for incidents (each incident reduces score by 0.2, max -1)
        $penalty = min($this->incidents * 0.2, 1);

        return round(max(0, min(5, $avg - $penalty)), 2);
    }

    public static array $statuses = [
        'draft'     => ['label' => 'Draft',     'color' => '#94A3B8'],
        'published' => ['label' => 'Published', 'color' => '#22C55E'],
    ];
}
