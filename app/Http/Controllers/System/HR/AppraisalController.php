<?php

namespace App\Http\Controllers\System\HR;

use App\Http\Controllers\Controller;
use App\Models\Appraisal;
use App\Models\Employee;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AppraisalController extends Controller
{
    public function index(Request $request)
    {
        $query = Appraisal::with(['employee', 'creator'])->latest();

        if ($request->filled('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $appraisals = $query->paginate(20)->withQueryString();

        $stats = [
            'total'     => Appraisal::count(),
            'published' => Appraisal::where('status', 'published')->count(),
            'drafts'    => Appraisal::where('status', 'draft')->count(),
            'avg_score' => round(Appraisal::where('status', 'published')->avg('overall_score') ?? 0, 2),
        ];

        return Inertia::render('system/HR/Appraisals/Index', [
            'appraisals' => $appraisals,
            'employees'  => Employee::where('status', 'active')->orderBy('name')->get(['id', 'name', 'employee_number', 'department']),
            'statuses'   => Appraisal::$statuses,
            'stats'      => $stats,
            'filters'    => $request->only(['employee_id', 'status']),
        ]);
    }

    public function create()
    {
        return Inertia::render('system/HR/Appraisals/Create', [
            'employees' => Employee::where('status', 'active')->orderBy('name')->get(['id', 'name', 'employee_number', 'department', 'position']),
            'statuses'  => Appraisal::$statuses,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'employee_id'         => 'required|exists:employees,id',
            'period_from'         => 'required|date',
            'period_to'           => 'required|date|after:period_from',
            'trips_count'         => 'nullable|integer|min:0',
            'on_time_pct'         => 'nullable|numeric|min:0|max:100',
            'fuel_eff_kml'        => 'nullable|numeric|min:0',
            'incidents'           => 'nullable|integer|min:0',
            'rating_punctuality'  => 'nullable|integer|min:1|max:5',
            'rating_conduct'      => 'nullable|integer|min:1|max:5',
            'rating_cargo_care'   => 'nullable|integer|min:1|max:5',
            'rating_compliance'   => 'nullable|integer|min:1|max:5',
            'manager_rating'      => 'nullable|integer|min:1|max:5',
            'manager_notes'       => 'nullable|string',
            'status'              => 'required|in:draft,published',
        ]);

        $data['created_by'] = $request->user()->id;

        $appraisal = Appraisal::create($data);
        $appraisal->update(['overall_score' => $appraisal->computeOverallScore()]);

        return redirect()->route('system.hr.appraisals.show', $appraisal)
            ->with('success', "Appraisal for {$appraisal->employee->name} created.");
    }

    public function show(Appraisal $appraisal)
    {
        $appraisal->load(['employee', 'creator']);

        return Inertia::render('system/HR/Appraisals/Show', [
            'appraisal' => $appraisal,
            'statuses'  => Appraisal::$statuses,
        ]);
    }

    public function update(Request $request, Appraisal $appraisal)
    {
        $data = $request->validate([
            'period_from'         => 'required|date',
            'period_to'           => 'required|date|after:period_from',
            'trips_count'         => 'nullable|integer|min:0',
            'on_time_pct'         => 'nullable|numeric|min:0|max:100',
            'fuel_eff_kml'        => 'nullable|numeric|min:0',
            'incidents'           => 'nullable|integer|min:0',
            'rating_punctuality'  => 'nullable|integer|min:1|max:5',
            'rating_conduct'      => 'nullable|integer|min:1|max:5',
            'rating_cargo_care'   => 'nullable|integer|min:1|max:5',
            'rating_compliance'   => 'nullable|integer|min:1|max:5',
            'manager_rating'      => 'nullable|integer|min:1|max:5',
            'manager_notes'       => 'nullable|string',
            'status'              => 'required|in:draft,published',
        ]);

        $appraisal->update($data);
        $appraisal->update(['overall_score' => $appraisal->computeOverallScore()]);

        return back()->with('success', 'Appraisal updated.');
    }

    public function destroy(Appraisal $appraisal)
    {
        $name = $appraisal->employee->name ?? 'Unknown';
        $appraisal->delete();
        return redirect()->route('system.hr.appraisals.index')
            ->with('success', "Appraisal for {$name} deleted.");
    }
}
