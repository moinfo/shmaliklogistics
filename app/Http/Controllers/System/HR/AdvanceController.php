<?php

namespace App\Http\Controllers\System\HR;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\EmployeeAdvance;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdvanceController extends Controller
{
    public function index(Request $request)
    {
        $query = EmployeeAdvance::with('employee')->latest();

        if ($request->filled('employee_id')) $query->where('employee_id', $request->employee_id);
        if ($request->filled('status'))      $query->where('status', $request->status);

        $advances = $query->paginate(20)->withQueryString();

        $stats = [
            'total'    => EmployeeAdvance::count(),
            'pending'  => EmployeeAdvance::where('status', 'pending')->count(),
            'approved' => EmployeeAdvance::where('status', 'approved')->count(),
            'deducted' => EmployeeAdvance::where('status', 'deducted')->count(),
            'total_approved_amount' => EmployeeAdvance::where('status', 'approved')->sum('amount'),
        ];

        return Inertia::render('system/HR/Advances/Index', [
            'advances'  => $advances,
            'stats'     => $stats,
            'statuses'  => EmployeeAdvance::$statuses,
            'employees' => Employee::where('status', '!=', 'terminated')->orderBy('name')->get(['id', 'name', 'employee_number']),
            'filters'   => $request->only(['employee_id', 'status']),
        ]);
    }

    public function create(Request $request)
    {
        return Inertia::render('system/HR/Advances/Create', [
            'employees'      => Employee::where('status', 'active')->orderBy('name')->get(['id', 'name', 'employee_number']),
            'prefillEmployee' => $request->employee_id,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'employee_id'     => 'required|exists:employees,id',
            'amount'          => 'required|numeric|min:1',
            'purpose'         => 'nullable|string|max:255',
            'requested_date'  => 'required|date',
            'deduction_month' => 'nullable|date',
            'notes'           => 'nullable|string',
        ]);

        $data['status']     = 'pending';
        $data['created_by'] = $request->user()->id;

        // Normalise deduction_month to first of month
        if (!empty($data['deduction_month'])) {
            $data['deduction_month'] = date('Y-m-01', strtotime($data['deduction_month']));
        }

        EmployeeAdvance::create($data);

        return redirect()->route('system.hr.advances.index')
            ->with('success', 'Advance request submitted.');
    }

    public function show(EmployeeAdvance $advance)
    {
        $advance->load('employee', 'approver', 'payrollSlip.run');
        return Inertia::render('system/HR/Advances/Show', [
            'advance'  => $advance,
            'statuses' => EmployeeAdvance::$statuses,
        ]);
    }

    public function approve(Request $request, EmployeeAdvance $advance)
    {
        abort_if($advance->status !== 'pending', 422, 'Only pending advances can be approved.');
        $request->validate(['approval_notes' => 'nullable|string', 'deduction_month' => 'nullable|date']);

        $update = [
            'status'         => 'approved',
            'approved_by'    => $request->user()->id,
            'approval_notes' => $request->approval_notes,
        ];
        if ($request->deduction_month) {
            $update['deduction_month'] = date('Y-m-01', strtotime($request->deduction_month));
        }

        $advance->update($update);
        return back()->with('success', 'Advance approved.');
    }

    public function reject(Request $request, EmployeeAdvance $advance)
    {
        abort_if($advance->status !== 'pending', 422, 'Only pending advances can be rejected.');
        $request->validate(['approval_notes' => 'nullable|string']);

        $advance->update([
            'status'         => 'rejected',
            'approved_by'    => $request->user()->id,
            'approval_notes' => $request->approval_notes,
        ]);
        return back()->with('success', 'Advance rejected.');
    }

    public function destroy(EmployeeAdvance $advance)
    {
        abort_if($advance->status === 'deducted', 403, 'Already-deducted advances cannot be deleted.');
        $advance->delete();
        return back()->with('success', 'Advance deleted.');
    }
}
