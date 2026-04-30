<?php

namespace App\Http\Controllers\System\HR;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\Employee;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        $empId     = $request->input('employee_id');
        $dateFrom  = $request->input('date_from', now()->startOfMonth()->toDateString());
        $dateTo    = $request->input('date_to',   now()->toDateString());

        $logs = AttendanceLog::with(['employee', 'device'])
            ->when($empId, fn ($q) => $q->where('employee_id', $empId))
            ->whereBetween('punch_time', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59'])
            ->orderBy('punch_time', 'desc')
            ->paginate(50)
            ->withQueryString();

        // Build daily summary per employee
        $summary = AttendanceLog::selectRaw('employee_id, DATE(punch_time) as date, MIN(punch_time) as check_in, MAX(punch_time) as check_out')
            ->when($empId, fn ($q) => $q->where('employee_id', $empId))
            ->whereBetween('punch_time', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59'])
            ->groupBy('employee_id', 'date')
            ->with('employee')
            ->orderBy('date', 'desc')
            ->get();

        return Inertia::render('system/HR/Attendance/Index', [
            'logs'      => $logs,
            'summary'   => $summary,
            'employees' => Employee::where('status', 'active')->orderBy('name')->get(['id', 'name', 'employee_number']),
            'filters'   => compact('empId', 'dateFrom', 'dateTo'),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'punch_time'  => 'required|date',
            'punch_type'  => 'required|in:in,out',
            'notes'       => 'nullable|string',
        ]);

        $data['source'] = 'manual';

        AttendanceLog::create($data);

        return back()->with('success', 'Attendance record added.');
    }

    public function destroy(AttendanceLog $log)
    {
        $log->delete();

        return back()->with('success', 'Record deleted.');
    }
}
