<?php

namespace App\Http\Controllers\System\HR;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\LeaveRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LeaveController extends Controller
{
    public function index(Request $request)
    {
        $query = LeaveRequest::with('employee')->latest();

        if ($request->filled('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $leaves = $query->paginate(20)->withQueryString();

        $stats = [
            'total'    => LeaveRequest::count(),
            'pending'  => LeaveRequest::where('status', 'pending')->count(),
            'approved' => LeaveRequest::where('status', 'approved')->count(),
            'rejected' => LeaveRequest::where('status', 'rejected')->count(),
        ];

        return Inertia::render('system/HR/Leave/Index', [
            'leaves'    => $leaves,
            'stats'     => $stats,
            'types'     => LeaveRequest::$types,
            'statuses'  => LeaveRequest::$statuses,
            'employees' => Employee::where('status', '!=', 'terminated')->orderBy('name')->get(['id', 'name', 'employee_number']),
            'filters'   => $request->only(['employee_id', 'status', 'type']),
        ]);
    }

    public function create(Request $request)
    {
        return Inertia::render('system/HR/Leave/Create', [
            'employees'      => Employee::where('status', '!=', 'terminated')->orderBy('name')->get(['id', 'name', 'employee_number']),
            'types'          => LeaveRequest::$types,
            'prefillEmployee' => $request->employee_id,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'type'        => 'required|in:' . implode(',', array_keys(LeaveRequest::$types)),
            'start_date'  => 'required|date',
            'end_date'    => 'required|date|after_or_equal:start_date',
            'days'        => 'required|integer|min:1',
            'reason'      => 'nullable|string',
        ]);

        $data['status']     = 'pending';
        $data['created_by'] = $request->user()->id;
        LeaveRequest::create($data);

        return redirect()->route('system.hr.leave.index')
            ->with('success', 'Leave request submitted.');
    }

    public function show(LeaveRequest $leave)
    {
        $leave->load('employee', 'approver');
        return Inertia::render('system/HR/Leave/Show', [
            'leave'    => $leave,
            'types'    => LeaveRequest::$types,
            'statuses' => LeaveRequest::$statuses,
        ]);
    }

    public function approve(Request $request, LeaveRequest $leave)
    {
        $request->validate(['approval_notes' => 'nullable|string']);

        $leave->update([
            'status'         => 'approved',
            'approved_by'    => $request->user()->id,
            'approval_notes' => $request->approval_notes,
        ]);

        // Reflect on employee status
        $leave->employee->update(['status' => 'on_leave']);

        return back()->with('success', 'Leave request approved.');
    }

    public function reject(Request $request, LeaveRequest $leave)
    {
        $request->validate(['approval_notes' => 'nullable|string']);

        $leave->update([
            'status'         => 'rejected',
            'approved_by'    => $request->user()->id,
            'approval_notes' => $request->approval_notes,
        ]);

        return back()->with('success', 'Leave request rejected.');
    }

    public function destroy(LeaveRequest $leave)
    {
        $leave->delete();
        return back()->with('success', 'Leave request deleted.');
    }
}
