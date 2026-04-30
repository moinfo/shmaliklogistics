<?php

namespace App\Http\Controllers\System\HR;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\EmployeeAdvance;
use App\Models\EmployeeAllowance;
use App\Models\EmployeeDeduction;
use App\Models\EmployeeLoan;
use App\Models\PayrollRun;
use App\Models\PayrollSlip;
use App\Models\PayrollSetting;
use App\Services\TanzaniaPayrollCalculator;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PayrollController extends Controller
{
    public function index()
    {
        $runs = PayrollRun::withCount('slips')
            ->orderByDesc('year')
            ->orderByDesc('month')
            ->paginate(20);

        $stats = [
            'total_runs'       => PayrollRun::count(),
            'draft'            => PayrollRun::where('status', 'draft')->count(),
            'processed'        => PayrollRun::where('status', 'processed')->count(),
            'active_employees' => Employee::where('status', 'active')->count(),
        ];

        // Months that can have a new payroll run created
        $existing = PayrollRun::selectRaw('year * 100 + month as ym')->pluck('ym')->toArray();
        $available = [];
        $now = now();
        for ($i = 0; $i < 12; $i++) {
            $d   = $now->copy()->subMonths($i);
            $ym  = $d->year * 100 + $d->month;
            if (! in_array($ym, $existing)) {
                $available[] = ['year' => $d->year, 'month' => $d->month, 'label' => $d->format('F Y')];
            }
        }

        return Inertia::render('system/HR/Payroll/Index', [
            'runs'      => $runs,
            'stats'     => $stats,
            'statuses'  => PayrollRun::$statuses,
            'available' => $available,
        ]);
    }

    public function create()
    {
        $existing = PayrollRun::selectRaw('year * 100 + month as ym')->pluck('ym')->toArray();
        return Inertia::render('system/HR/Payroll/Create', ['existing' => $existing]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'year'  => 'required|integer|min:2020|max:2099',
            'month' => 'required|integer|min:1|max:12',
            'notes' => 'nullable|string',
        ]);

        // Generate document_number: PRL/{YEAR}/N
        $seq = PayrollRun::whereYear('created_at', $data['year'])->count() + 1;
        $docNumber = "PRL/{$data['year']}/{$seq}";

        $run = PayrollRun::create([
            'year'            => $data['year'],
            'month'           => $data['month'],
            'status'          => 'draft',
            'notes'           => $data['notes'] ?? null,
            'created_by'      => $request->user()->id,
            'document_number' => $docNumber,
            'payroll_number'  => (string) time(),
        ]);

        $settings   = PayrollSetting::allAsMap();
        $calculator = new TanzaniaPayrollCalculator($settings);
        $employees  = Employee::where('status', 'active')->get();

        $deductionMonth = sprintf('%04d-%02d-01', $data['year'], $data['month']);

        // Approved advances due this month
        $advances = EmployeeAdvance::where('status', 'approved')
            ->where(fn ($q) => $q->whereNull('deduction_month')->orWhere('deduction_month', '<=', $deductionMonth))
            ->get()
            ->groupBy('employee_id');

        // Active loans
        $loans = EmployeeLoan::where('status', 'active')
            ->get()
            ->groupBy('employee_id');

        // HESLB subscriptions (fixed monthly amounts)
        $heslbDeductions = EmployeeDeduction::whereHas('deductionType', fn ($q) => $q->where('abbreviation', 'HESLB'))
            ->where('is_active', true)
            ->get()
            ->groupBy('employee_id');

        // Employee allowances
        $allowances = EmployeeAllowance::where('is_active', true)
            ->get()
            ->groupBy('employee_id');

        foreach ($employees as $emp) {
            $advanceTotal = collect($advances[$emp->id] ?? [])->sum('amount');
            $loanTotal    = collect($loans[$emp->id] ?? [])->sum('monthly_installment');
            $heslbAmount  = collect($heslbDeductions[$emp->id] ?? [])->sum('fixed_amount');

            // Allowances: sum fixed amounts + compute percentages
            $allowanceTotal = 0;
            foreach (($allowances[$emp->id] ?? []) as $all) {
                if ($all->type === 'FIXED') {
                    $allowanceTotal += (float) $all->amount;
                } else {
                    $allowanceTotal += (float) $emp->salary * ((float) $all->amount / 100);
                }
            }

            $result = $calculator->calculate(
                (float) ($emp->salary ?? 0),
                $allowanceTotal,
                0, 0,
                (float) $advanceTotal,
                (float) $loanTotal,
            );

            // Inject HESLB into result
            $result['heslb']           = round($heslbAmount, 2);
            $result['total_deductions'] = round($result['total_deductions'] + $heslbAmount, 2);
            $result['net_salary']       = round(max(0, $result['net_salary'] - $heslbAmount), 2);

            // Snapshot loan balance
            $loanBalance = collect($loans[$emp->id] ?? [])->sum('balance_remaining');
            $result['loan_balance'] = round(max(0, $loanBalance - $loanTotal), 2);

            $slip = PayrollSlip::create(array_merge(
                ['payroll_run_id' => $run->id, 'employee_id' => $emp->id],
                $result,
            ));

            // Mark advances as deducted
            foreach (($advances[$emp->id] ?? []) as $adv) {
                $adv->update(['payroll_slip_id' => $slip->id, 'status' => 'deducted']);
            }

            // Update loan balances
            foreach (($loans[$emp->id] ?? []) as $loan) {
                $newBalance = max(0, $loan->balance_remaining - $loan->monthly_installment);
                $loan->update([
                    'balance_remaining' => $newBalance,
                    'months_paid'       => $loan->months_paid + 1,
                    'status'            => $newBalance <= 0 ? 'settled' : 'active',
                ]);
            }
        }

        return redirect()->route('system.hr.payroll.show', $run)
            ->with('success', "Payroll run {$docNumber} created with {$employees->count()} employees.");
    }

    public function show(PayrollRun $payroll)
    {
        $payroll->load('slips.employee');

        $totals = [
            'gross'         => $payroll->slips->sum('gross_salary'),
            'paye'          => $payroll->slips->sum('paye'),
            'nssf_emp'      => $payroll->slips->sum('nssf_employee'),
            'nhif'          => $payroll->slips->sum('nhif_employee'),
            'heslb'         => $payroll->slips->sum('heslb'),
            'advances'      => $payroll->slips->sum('advance_deduction'),
            'loans'         => $payroll->slips->sum('loan_deduction'),
            'net'           => $payroll->slips->sum('net_salary'),
            'sdl'           => $payroll->slips->sum('sdl_employer'),
            'nssf_er'       => $payroll->slips->sum('nssf_employer'),
            'wcf'           => $payroll->slips->sum('wcf_employer'),
            'employer_cost' => $payroll->slips->sum('total_employer_cost'),
        ];

        return Inertia::render('system/HR/Payroll/Show', [
            'run'      => $payroll,
            'slips'    => $payroll->slips,
            'totals'   => $totals,
            'statuses' => PayrollRun::$statuses,
        ]);
    }

    public function updateSlip(Request $request, PayrollRun $payroll, PayrollSlip $slip)
    {
        $data = $request->validate([
            'basic_salary'      => 'required|numeric|min:0',
            'allowances'        => 'nullable|numeric|min:0',
            'overtime'          => 'nullable|numeric|min:0',
            'other_deductions'  => 'nullable|numeric|min:0',
            'advance_deduction' => 'nullable|numeric|min:0',
            'loan_deduction'    => 'nullable|numeric|min:0',
            'heslb'             => 'nullable|numeric|min:0',
            'adjustment'        => 'nullable|numeric',
            'notes'             => 'nullable|string',
        ]);

        $settings   = PayrollSetting::allAsMap();
        $calculator = new TanzaniaPayrollCalculator($settings);

        $result = $calculator->calculate(
            (float) $data['basic_salary'],
            (float) ($data['allowances'] ?? 0),
            (float) ($data['overtime'] ?? 0),
            (float) ($data['other_deductions'] ?? 0),
            (float) ($data['advance_deduction'] ?? $slip->advance_deduction),
            (float) ($data['loan_deduction'] ?? $slip->loan_deduction),
        );

        $heslb      = (float) ($data['heslb'] ?? $slip->heslb);
        $adjustment = (float) ($data['adjustment'] ?? $slip->adjustment);
        $result['heslb']            = round($heslb, 2);
        $result['adjustment']       = round($adjustment, 2);
        $result['total_deductions'] = round($result['total_deductions'] + $heslb + $adjustment, 2);
        $result['net_salary']       = round(max(0, $result['net_salary'] - $heslb - $adjustment), 2);

        $slip->update(array_merge($result, ['notes' => $data['notes'] ?? null]));

        return back()->with('success', 'Slip updated and recalculated.');
    }

    public function process(PayrollRun $payroll)
    {
        abort_if($payroll->status !== 'draft', 422, 'Only draft runs can be processed.');
        $payroll->update(['status' => 'processed']);
        return back()->with('success', 'Payroll run marked as processed.');
    }

    public function close(PayrollRun $payroll)
    {
        abort_if($payroll->status !== 'processed', 422, 'Only processed runs can be closed.');
        $payroll->update(['status' => 'closed']);
        return back()->with('success', 'Payroll run closed.');
    }

    public function destroy(PayrollRun $payroll)
    {
        abort_if($payroll->status === 'closed', 403, 'Closed runs cannot be deleted.');
        $payroll->delete();
        return redirect()->route('system.hr.payroll.index')->with('success', 'Payroll run deleted.');
    }
}
