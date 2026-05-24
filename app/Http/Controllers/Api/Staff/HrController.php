<?php

namespace App\Http\Controllers\Api\Staff;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\EmployeeAdvance;
use App\Models\EmployeeLoan;
use App\Models\LeaveRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HrController extends Controller
{
    /**
     * Unified inbox of PENDING items across leave, advances and loans.
     * Only sections the user is allowed to view are included.
     */
    public function approvals(Request $request): JsonResponse
    {
        $user = $request->user();

        $payload = [];

        if ($user->hasPermission('hr_leave.view')) {
            $payload['leave'] = LeaveRequest::with('employee:id,name,employee_number')
                ->where('status', 'pending')
                ->latest()
                ->get()
                ->map(fn ($leave) => [
                    'id'            => $leave->id,
                    'employee_name' => $leave->employee?->name,
                    'type'          => $leave->type,
                    'type_label'    => LeaveRequest::$types[$leave->type]['label'] ?? $leave->type,
                    'start_date'    => $leave->start_date?->toDateString(),
                    'end_date'      => $leave->end_date?->toDateString(),
                    'days'          => $leave->days,
                    'reason'        => $leave->reason,
                    'status'        => $leave->status,
                ]);
        }

        if ($user->hasPermission('hr_advances.view')) {
            $payload['advances'] = EmployeeAdvance::with('employee:id,name,employee_number')
                ->where('status', 'pending')
                ->latest()
                ->get()
                ->map(fn ($advance) => [
                    'id'             => $advance->id,
                    'employee_name'  => $advance->employee?->name,
                    'amount'         => $advance->amount,
                    'purpose'        => $advance->purpose,
                    'requested_date' => $advance->requested_date?->toDateString(),
                    'status'         => $advance->status,
                ]);
        }

        if ($user->hasPermission('hr_loans.view')) {
            $payload['loans'] = EmployeeLoan::with('employee:id,name,employee_number')
                ->where('status', 'pending')
                ->latest()
                ->get()
                ->map(fn ($loan) => [
                    'id'                  => $loan->id,
                    'employee_name'       => $loan->employee?->name,
                    'loan_number'         => $loan->loan_number,
                    'principal'           => $loan->principal,
                    'monthly_installment' => $loan->monthly_installment,
                    'total_months'        => $loan->total_months,
                    'start_date'          => $loan->start_date?->toDateString(),
                    'purpose'             => $loan->purpose,
                    'status'              => $loan->status,
                ]);
        }

        return response()->json($payload);
    }

    public function approveLeave(Request $request, LeaveRequest $leave): JsonResponse
    {
        $request->validate(['approval_notes' => 'nullable|string']);

        $leave->update([
            'status'         => 'approved',
            'approved_by'    => $request->user()->id,
            'approval_notes' => $request->approval_notes,
        ]);

        // Reflect on employee status
        $leave->employee->update(['status' => 'on_leave']);

        return response()->json(['leave' => $leave->fresh('employee:id,name,employee_number')]);
    }

    public function rejectLeave(Request $request, LeaveRequest $leave): JsonResponse
    {
        $request->validate(['approval_notes' => 'nullable|string']);

        $leave->update([
            'status'         => 'rejected',
            'approved_by'    => $request->user()->id,
            'approval_notes' => $request->approval_notes,
        ]);

        return response()->json(['leave' => $leave->fresh('employee:id,name,employee_number')]);
    }

    public function approveAdvance(Request $request, EmployeeAdvance $advance): JsonResponse
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

        return response()->json(['advance' => $advance->fresh('employee:id,name,employee_number')]);
    }

    public function rejectAdvance(Request $request, EmployeeAdvance $advance): JsonResponse
    {
        abort_if($advance->status !== 'pending', 422, 'Only pending advances can be rejected.');
        $request->validate(['approval_notes' => 'nullable|string']);

        $advance->update([
            'status'         => 'rejected',
            'approved_by'    => $request->user()->id,
            'approval_notes' => $request->approval_notes,
        ]);

        return response()->json(['advance' => $advance->fresh('employee:id,name,employee_number')]);
    }

    public function approveLoan(Request $request, EmployeeLoan $loan): JsonResponse
    {
        abort_if($loan->status !== 'pending', 422, 'Only pending loans can be approved.');
        $request->validate(['approval_notes' => 'nullable|string']);

        $loan->update([
            'status'         => 'active',
            'approved_by'    => $request->user()->id,
            'approval_notes' => $request->approval_notes,
        ]);

        return response()->json(['loan' => $loan->fresh('employee:id,name,employee_number')]);
    }

    public function rejectLoan(Request $request, EmployeeLoan $loan): JsonResponse
    {
        abort_if($loan->status !== 'pending', 422, 'Only pending loans can be rejected.');
        $request->validate(['approval_notes' => 'nullable|string']);

        $loan->update([
            'status'         => 'rejected',
            'approved_by'    => $request->user()->id,
            'approval_notes' => $request->approval_notes,
        ]);

        return response()->json(['loan' => $loan->fresh('employee:id,name,employee_number')]);
    }

    /**
     * Recent attendance: daily check-in/out summary per employee for this week.
     * Mirrors the daily summary built by the web AttendanceController.
     */
    public function attendance(Request $request): JsonResponse
    {
        $dateFrom = now()->startOfWeek()->toDateString();
        $dateTo   = now()->toDateString();

        $summary = AttendanceLog::selectRaw('employee_id, DATE(punch_time) as date, MIN(punch_time) as check_in, MAX(punch_time) as check_out')
            ->whereBetween('punch_time', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59'])
            ->groupBy('employee_id', 'date')
            ->with('employee:id,name,employee_number')
            ->orderBy('date', 'desc')
            ->get()
            ->map(function ($row) {
                $checkOut = $row->check_in !== $row->check_out ? $row->check_out : null;

                return [
                    'employee_id'   => $row->employee_id,
                    'employee_name' => $row->employee?->name,
                    'date'          => $row->date,
                    'check_in'      => $row->check_in,
                    'check_out'     => $checkOut,
                    'status'        => $checkOut ? 'present' : 'in',
                ];
            });

        return response()->json(['attendance' => $summary]);
    }
}
