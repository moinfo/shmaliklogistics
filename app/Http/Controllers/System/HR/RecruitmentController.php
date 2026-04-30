<?php

namespace App\Http\Controllers\System\HR;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\JobApplication;
use App\Models\JobVacancy;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class RecruitmentController extends Controller
{
    public function index(Request $request)
    {
        $query = JobVacancy::withCount('applications')->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $vacancies = $query->paginate(15)->withQueryString();

        $stats = [
            'open'         => JobVacancy::where('status', 'open')->count(),
            'total_apps'   => JobApplication::count(),
            'interviews'   => JobApplication::where('stage', 'interview')->count(),
            'hired'        => JobApplication::where('stage', 'hired')->count(),
        ];

        return Inertia::render('system/HR/Recruitment/Index', [
            'vacancies' => $vacancies,
            'statuses'  => JobVacancy::$statuses,
            'stats'     => $stats,
            'filters'   => $request->only(['status']),
        ]);
    }

    public function storeVacancy(Request $request)
    {
        $data = $request->validate([
            'title'        => 'required|string|max:255',
            'department'   => 'nullable|string|max:100',
            'description'  => 'nullable|string',
            'requirements' => 'nullable|string',
            'openings'     => 'nullable|integer|min:1|max:99',
            'closing_date' => 'nullable|date',
            'status'       => 'required|in:open,closed,filled',
        ]);

        $data['created_by'] = $request->user()->id;
        JobVacancy::create($data);

        return back()->with('success', "Vacancy '{$data['title']}' created.");
    }

    public function updateVacancy(Request $request, JobVacancy $vacancy)
    {
        $data = $request->validate([
            'title'        => 'required|string|max:255',
            'department'   => 'nullable|string|max:100',
            'description'  => 'nullable|string',
            'requirements' => 'nullable|string',
            'openings'     => 'nullable|integer|min:1|max:99',
            'closing_date' => 'nullable|date',
            'status'       => 'required|in:open,closed,filled',
        ]);

        $vacancy->update($data);
        return back()->with('success', 'Vacancy updated.');
    }

    public function destroyVacancy(JobVacancy $vacancy)
    {
        $vacancy->delete();
        return back()->with('success', 'Vacancy deleted.');
    }

    public function showVacancy(JobVacancy $vacancy)
    {
        $vacancy->load('creator');

        $applications = $vacancy->applications()
            ->latest()
            ->paginate(20);

        $pipeline = collect(JobApplication::$stages)->map(function ($stage, $key) use ($vacancy) {
            return [
                'stage' => $key,
                'label' => $stage['label'],
                'color' => $stage['color'],
                'count' => $vacancy->applications()->where('stage', $key)->count(),
            ];
        })->values();

        return Inertia::render('system/HR/Recruitment/Show', [
            'vacancy'      => $vacancy,
            'applications' => $applications,
            'pipeline'     => $pipeline,
            'stages'       => JobApplication::$stages,
            'statuses'     => JobVacancy::$statuses,
        ]);
    }

    public function storeApplication(Request $request, JobVacancy $vacancy)
    {
        $data = $request->validate([
            'full_name' => 'required|string|max:255',
            'phone'     => 'nullable|string|max:30',
            'email'     => 'nullable|email|max:150',
            'cv'        => 'nullable|file|mimes:pdf,doc,docx|max:5120',
            'notes'     => 'nullable|string',
        ]);

        $cvPath = null;
        if ($request->hasFile('cv')) {
            $cvPath = $request->file('cv')->store('cv_uploads', 'public');
        }

        JobApplication::create([
            'vacancy_id' => $vacancy->id,
            'full_name'  => $data['full_name'],
            'phone'      => $data['phone'] ?? null,
            'email'      => $data['email'] ?? null,
            'cv_path'    => $cvPath,
            'stage'      => 'applied',
            'notes'      => $data['notes'] ?? null,
        ]);

        return back()->with('success', "Application from {$data['full_name']} added.");
    }

    public function updateApplicationStage(Request $request, JobApplication $application)
    {
        $data = $request->validate([
            'stage'           => 'required|in:applied,shortlisted,interview,offer,hired,rejected',
            'interview_date'  => 'nullable|date',
            'interview_notes' => 'nullable|string',
            'offer_amount'    => 'nullable|numeric|min:0',
        ]);

        $application->update($data);
        return back()->with('success', "Stage updated to {$data['stage']}.");
    }

    public function destroyApplication(JobApplication $application)
    {
        if ($application->cv_path) {
            Storage::disk('public')->delete($application->cv_path);
        }
        $name = $application->full_name;
        $application->delete();
        return back()->with('success', "Application from {$name} removed.");
    }
}
