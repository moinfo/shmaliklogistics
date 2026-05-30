<?php

namespace App\Http\Controllers\Api\Staff\Modules;

use App\Http\Controllers\Controller;
use App\Models\Appraisal;
use App\Models\JobApplication;
use App\Models\JobVacancy;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/// Read-only Recruitment + Appraisals endpoints for the staff mobile app (Module 19).
///
/// Mirrors the data/query of App\Http\Controllers\System\HR\RecruitmentController and
/// AppraisalController but returns flat JSON envelopes instead of Inertia pages.
/// Auth + permission scoping is handled by route middleware
/// (permission:hr_recruitment.view / hr_appraisals.view).
class TalentController extends Controller
{
    // GET /api/staff/modules/recruitment — job vacancies, newest first, with application counts.
    public function recruitment(Request $request): JsonResponse
    {
        $query = JobVacancy::withCount('applications')->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('title', 'like', "%{$s}%")
                  ->orWhere('department', 'like', "%{$s}%");
            });
        }

        $vacancies = $query->get()->map(fn (JobVacancy $vacancy) => $this->summarizeVacancy($vacancy));

        $stats = [
            'open'       => JobVacancy::where('status', 'open')->count(),
            'total_apps' => JobApplication::count(),
            'interviews' => JobApplication::where('stage', 'interview')->count(),
            'hired'      => JobApplication::where('stage', 'hired')->count(),
        ];

        return response()->json([
            'vacancies' => $vacancies,
            'stats'     => $stats,
            'statuses'  => JobVacancy::$statuses,
        ]);
    }

    // GET /api/staff/modules/recruitment/{id} — single vacancy with its applications + pipeline.
    public function recruitmentShow($id): JsonResponse
    {
        $vacancy = JobVacancy::withCount('applications')
            ->with('creator:id,name')
            ->findOrFail($id);

        $applications = $vacancy->applications()
            ->latest()
            ->get()
            ->map(fn (JobApplication $application) => $this->summarizeApplication($application))
            ->values();

        $pipeline = collect(JobApplication::$stages)->map(function ($stage, $key) use ($vacancy) {
            return [
                'stage' => $key,
                'label' => $stage['label'],
                'color' => $stage['color'],
                'count' => $vacancy->applications()->where('stage', $key)->count(),
            ];
        })->values();

        $data = $this->summarizeVacancy($vacancy) + [
            'description'  => $vacancy->description,
            'requirements' => $vacancy->requirements,
            'created_by'   => $vacancy->creator?->name,
            'created_at'   => $vacancy->created_at?->toIso8601String(),
            'pipeline'     => $pipeline,
        ];

        return response()->json([
            'vacancy'      => $data,
            'applications' => $applications,
        ]);
    }

    // GET /api/staff/modules/appraisals — flat list of appraisals, newest first.
    public function appraisals(Request $request): JsonResponse
    {
        $query = Appraisal::with(['employee:id,name,employee_number,department,position', 'creator:id,name'])
            ->latest();

        if ($request->filled('employee_id')) {
            $query->where('employee_id', (int) $request->employee_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->whereHas('employee', function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                  ->orWhere('employee_number', 'like', "%{$s}%");
            });
        }

        $appraisals = $query->get()
            ->map(fn (Appraisal $appraisal) => $this->summarizeAppraisal($appraisal))
            ->values();

        $stats = [
            'total'     => Appraisal::count(),
            'published' => Appraisal::where('status', 'published')->count(),
            'drafts'    => Appraisal::where('status', 'draft')->count(),
            'avg_score' => round((float) (Appraisal::where('status', 'published')->avg('overall_score') ?? 0), 2),
        ];

        return response()->json([
            'appraisals' => $appraisals,
            'stats'      => $stats,
            'statuses'   => Appraisal::$statuses,
        ]);
    }

    // Shared flat shape for a job vacancy (status flattened, application count).
    private function summarizeVacancy(JobVacancy $vacancy): array
    {
        $status = $vacancy->status;

        return [
            'id'                 => $vacancy->id,
            'title'              => $vacancy->title,
            'department'         => $vacancy->department,
            'openings'           => $vacancy->openings,
            'status'             => $status,
            'status_label'       => JobVacancy::$statuses[$status]['label'] ?? ucfirst((string) $status),
            'status_color'       => JobVacancy::$statuses[$status]['color'] ?? null,
            'closing_date'       => $vacancy->closing_date?->toDateString(),
            'applications_count' => $vacancy->applications_count ?? $vacancy->applications()->count(),
        ];
    }

    // Shared flat shape for a job application; applicant name + stage flattened inline.
    private function summarizeApplication(JobApplication $application): array
    {
        $stage = $application->stage;

        return [
            'id'              => $application->id,
            'vacancy_id'      => $application->vacancy_id,
            'applicant_name'  => $application->full_name,
            'phone'           => $application->phone,
            'email'           => $application->email,
            'stage'           => $stage,
            'stage_label'     => JobApplication::$stages[$stage]['label'] ?? ucfirst((string) $stage),
            'stage_color'     => JobApplication::$stages[$stage]['color'] ?? null,
            'interview_date'  => $application->interview_date?->toIso8601String(),
            'interview_notes' => $application->interview_notes,
            'offer_amount'    => $application->offer_amount !== null ? (float) $application->offer_amount : null,
            'notes'           => $application->notes,
            'has_cv'          => ! empty($application->cv_path),
            'applied_at'      => $application->created_at?->toIso8601String(),
        ];
    }

    // Shared flat shape for an appraisal; employee name + status flattened inline.
    private function summarizeAppraisal(Appraisal $appraisal): array
    {
        $status = $appraisal->status;

        return [
            'id'                 => $appraisal->id,
            'employee_id'        => $appraisal->employee_id,
            'employee_name'      => $appraisal->employee?->name ?? 'Unknown',
            'employee_number'    => $appraisal->employee?->employee_number,
            'department'         => $appraisal->employee?->department,
            'position'           => $appraisal->employee?->position,
            'period_from'        => $appraisal->period_from?->toDateString(),
            'period_to'          => $appraisal->period_to?->toDateString(),
            'trips_count'        => $appraisal->trips_count,
            'on_time_pct'        => $appraisal->on_time_pct !== null ? (float) $appraisal->on_time_pct : null,
            'fuel_eff_kml'       => $appraisal->fuel_eff_kml !== null ? (float) $appraisal->fuel_eff_kml : null,
            'incidents'          => $appraisal->incidents,
            'rating_punctuality' => $appraisal->rating_punctuality,
            'rating_conduct'     => $appraisal->rating_conduct,
            'rating_cargo_care'  => $appraisal->rating_cargo_care,
            'rating_compliance'  => $appraisal->rating_compliance,
            'manager_rating'     => $appraisal->manager_rating,
            'manager_notes'      => $appraisal->manager_notes,
            'overall_score'      => $appraisal->overall_score !== null ? (float) $appraisal->overall_score : null,
            'status'             => $status,
            'status_label'       => Appraisal::$statuses[$status]['label'] ?? ucfirst((string) $status),
            'status_color'       => Appraisal::$statuses[$status]['color'] ?? null,
            'created_by'         => $appraisal->creator?->name,
            'created_at'         => $appraisal->created_at?->toIso8601String(),
        ];
    }
}
