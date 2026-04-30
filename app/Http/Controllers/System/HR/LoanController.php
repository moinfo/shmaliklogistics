<?php

namespace App\Http\Controllers\System\HR;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\EmployeeLoan;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LoanController extends Controller
{
    public function index(Request $request)
    {
        $query = EmployeeLoan::with('employee')->latest();

        if ($request->filled('employee_id')) $query->where('employee_id', $request->employee_id);
        if ($request->filled('status'))      $query->where('status', $request->status);

        $loans = $query->paginate(20)->withQueryString();

        $stats = [
            'total'           => EmployeeLoan::count(),
            'active'          => EmployeeLoan::where('status', 'active')->count(),
            'pending'         => EmployeeLoan::where('status', 'pending')->count(),
            'total_outstanding' => EmployeeLoan::where('status', 'active')->sum('balance_remaining'),
        ];

        return Inertia::render('system/HR/Loans/Index', [
            'loans'     => $loans,
            'stats'     => $stats,
            'statuses'  => EmployeeLoan::$statuses,
            'employees' => Employee::where('status', '!=', 'terminated')->orderBy('name')->get(['id', 'name', 'employee_number']),
            'filters'   => $request->only(['employee_id', 'status']),
        ]);
    }

    public function create(Request $request)
    {
        return Inertia::render('system/HR/Loans/Create', [
            'employees'       => Employee::where('status', 'active')->orderBy('name')->get(['id', 'name', 'employee_number']),
            'nextNumber'      => EmployeeLoan::nextNumber(),
            'prefillEmployee' => $request->employee_id,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'employee_id'         => 'required|exists:employees,id',
            'loan_number'         => 'required|string|max:20|unique:employee_loans,loan_number',
            'principal'           => 'required|numeric|min:1',
            'monthly_installment' => 'required|numeric|min:1',
            'total_months'        => 'required|integer|min:1',
            'start_date'          => 'required|date',
            'purpose'             => 'nullable|string|max:255',
            'notes'               => 'nullable|string',
        ]);

        $data['balance_remaining']  = $data['principal'];
        $data['months_paid']        = 0;
        $data['expected_end_date']  = date('Y-m-d', strtotime("+{$data['total_months']} months", strtotime($data['start_date'])));
        $data['status']             = 'pending';
        $data['created_by']         = $request->user()->id;

        EmployeeLoan::create($data);

        return redirect()->route('system.hr.loans.index')
            ->with('success', 'Loan request submitted.');
    }

    public function show(EmployeeLoan $loan)
    {
        $loan->load('employee', 'approver');
        return Inertia::render('system/HR/Loans/Show', [
            'loan'     => $loan,
            'statuses' => EmployeeLoan::$statuses,
        ]);
    }

    public function approve(Request $request, EmployeeLoan $loan)
    {
        abort_if($loan->status !== 'pending', 422, 'Only pending loans can be approved.');
        $request->validate(['approval_notes' => 'nullable|string']);

        $loan->update([
            'status'         => 'active',
            'approved_by'    => $request->user()->id,
            'approval_notes' => $request->approval_notes,
        ]);
        return back()->with('success', 'Loan approved and activated.');
    }

    public function reject(Request $request, EmployeeLoan $loan)
    {
        abort_if($loan->status !== 'pending', 422, 'Only pending loans can be rejected.');
        $request->validate(['approval_notes' => 'nullable|string']);

        $loan->update([
            'status'         => 'rejected',
            'approved_by'    => $request->user()->id,
            'approval_notes' => $request->approval_notes,
        ]);
        return back()->with('success', 'Loan rejected.');
    }

    public function destroy(EmployeeLoan $loan)
    {
        abort_if($loan->status === 'active' && $loan->months_paid > 0, 403, 'Active loans with payments cannot be deleted.');
        $loan->delete();
        return back()->with('success', 'Loan deleted.');
    }
}
