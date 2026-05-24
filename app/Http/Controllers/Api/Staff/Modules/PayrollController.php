<?php

namespace App\Http\Controllers\Api\Staff\Modules;

use App\Http\Controllers\Controller;
use App\Models\PayrollRun;
use App\Models\PayrollSlip;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/// Read-only Payroll + Salary Slip endpoints for the staff mobile app (Module 18).
///
/// Mirrors the data/query of App\Http\Controllers\System\HR\PayrollController and
/// SalarySlipController but returns flat JSON envelopes instead of Inertia pages.
/// Auth + permission scoping is handled by route middleware
/// (permission:hr_payroll.view / hr_salary_slips.view).
class PayrollController extends Controller
{
    // GET /api/staff/modules/payroll — payroll runs, newest period first, with slip counts + run totals.
    public function index(Request $request): JsonResponse
    {
        $query = PayrollRun::withCount('slips')
            ->withSum('slips as gross_total', 'gross_salary')
            ->withSum('slips as deductions_total', 'total_deductions')
            ->withSum('slips as net_total', 'net_salary')
            ->orderByDesc('year')
            ->orderByDesc('month');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('year')) {
            $query->where('year', (int) $request->year);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('document_number', 'like', "%{$s}%")
                  ->orWhere('payroll_number', 'like', "%{$s}%");
            });
        }

        $runs = $query->get()->map(fn (PayrollRun $run) => $this->summarizeRun($run));

        $stats = [
            'total_runs'  => PayrollRun::count(),
            'draft'       => PayrollRun::where('status', 'draft')->count(),
            'processed'   => PayrollRun::where('status', 'processed')->count(),
            'closed'      => PayrollRun::where('status', 'closed')->count(),
            'net_paid'    => (float) PayrollSlip::whereHas('run', fn ($q) => $q->where('status', '!=', 'draft'))
                ->sum('net_salary'),
        ];

        return response()->json([
            'payroll_runs' => $runs,
            'stats'        => $stats,
            'statuses'     => PayrollRun::$statuses,
        ]);
    }

    // GET /api/staff/modules/payroll/{id} — single run with its salary slips + totals.
    public function show($id): JsonResponse
    {
        $run = PayrollRun::with('slips.employee:id,name,employee_number,department,position')
            ->findOrFail($id);

        $totals = [
            'gross'         => (float) $run->slips->sum('gross_salary'),
            'bonus'         => (float) $run->slips->sum(fn ($s) => max(0, (float) $s->bonus - (float) $s->bonus_penalty)),
            'paye'          => (float) $run->slips->sum('paye'),
            'nssf_emp'      => (float) $run->slips->sum('nssf_employee'),
            'nhif'          => (float) $run->slips->sum('nhif_employee'),
            'heslb'         => (float) $run->slips->sum('heslb'),
            'advances'      => (float) $run->slips->sum('advance_deduction'),
            'loans'         => (float) $run->slips->sum('loan_deduction'),
            'deductions'    => (float) $run->slips->sum('total_deductions'),
            'net'           => (float) $run->slips->sum('net_salary'),
            'sdl'           => (float) $run->slips->sum('sdl_employer'),
            'nssf_er'       => (float) $run->slips->sum('nssf_employer'),
            'wcf'           => (float) $run->slips->sum('wcf_employer'),
            'employer_cost' => (float) $run->slips->sum('total_employer_cost'),
        ];

        $data = $this->summarizeRun($run) + [
            'notes'        => $run->notes,
            'created_at'   => $run->created_at?->toIso8601String(),
            'totals'       => $totals,
            'slips'        => $run->slips->map(fn (PayrollSlip $slip) => $this->summarizeSlip($slip))->values(),
        ];

        return response()->json([
            'payroll_run' => $data,
        ]);
    }

    // GET /api/staff/modules/salary-slips — flat list of salary slips across runs.
    public function salarySlips(Request $request): JsonResponse
    {
        $query = PayrollSlip::with([
            'employee:id,name,employee_number,department,position',
            'run:id,year,month,status,document_number',
        ]);

        if ($request->filled('employee_id')) {
            $query->where('employee_id', (int) $request->employee_id);
        }

        if ($request->filled('payroll_run_id')) {
            $query->where('payroll_run_id', (int) $request->payroll_run_id);
        }

        if ($request->filled('year') || $request->filled('month')) {
            $query->whereHas('run', function ($q) use ($request) {
                if ($request->filled('year')) {
                    $q->where('year', (int) $request->year);
                }
                if ($request->filled('month')) {
                    $q->where('month', (int) $request->month);
                }
            });
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->whereHas('employee', function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                  ->orWhere('employee_number', 'like', "%{$s}%");
            });
        }

        $slips = $query->get()
            ->sortByDesc(fn ($slip) => ($slip->run?->year ?? 0) * 100 + ($slip->run?->month ?? 0))
            ->map(fn (PayrollSlip $slip) => $this->summarizeSlip($slip))
            ->values();

        return response()->json([
            'salary_slips' => $slips,
        ]);
    }

    // Shared flat shape for a payroll run (period, status, totals, slip count).
    private function summarizeRun(PayrollRun $run): array
    {
        $status = $run->status;

        return [
            'id'              => $run->id,
            'year'            => $run->year,
            'month'           => $run->month,
            'month_name'      => $run->month_name,
            'period_label'    => "{$run->month_name} {$run->year}",
            'document_number' => $run->document_number,
            'payroll_number'  => $run->payroll_number,
            'status'          => $status,
            'status_label'    => PayrollRun::$statuses[$status]['label'] ?? ucfirst((string) $status),
            'status_color'    => PayrollRun::$statuses[$status]['color'] ?? null,
            'slips_count'     => $run->slips_count ?? $run->slips->count(),
            'gross_total'     => (float) ($run->gross_total ?? 0),
            'deductions_total' => (float) ($run->deductions_total ?? 0),
            'net_total'       => (float) ($run->net_total ?? 0),
        ];
    }

    // Shared flat shape for a salary slip; employee + period names flattened inline.
    private function summarizeSlip(PayrollSlip $slip): array
    {
        return [
            'id'                => $slip->id,
            'payroll_run_id'    => $slip->payroll_run_id,
            'employee_id'       => $slip->employee_id,
            'employee_name'     => $slip->employee?->name ?? 'Unknown',
            'employee_number'   => $slip->employee?->employee_number,
            'department'        => $slip->employee?->department,
            'position'          => $slip->employee?->position,
            'period_year'       => $slip->run?->year,
            'period_month'      => $slip->run?->month,
            'period_label'      => $slip->run
                ? $slip->run->month_name . ' ' . $slip->run->year
                : null,
            'run_status'        => $slip->run?->status,
            'run_document'      => $slip->run?->document_number,
            'basic_salary'      => (float) $slip->basic_salary,
            'allowances'        => (float) $slip->allowances,
            'overtime'          => (float) $slip->overtime,
            'bonus'             => (float) $slip->bonus,
            'bonus_penalty'     => (float) $slip->bonus_penalty,
            'gross_salary'      => (float) $slip->gross_salary,
            'paye'              => (float) $slip->paye,
            'nssf_employee'     => (float) $slip->nssf_employee,
            'nhif_employee'     => (float) $slip->nhif_employee,
            'heslb'             => (float) $slip->heslb,
            'other_deductions'  => (float) $slip->other_deductions,
            'advance_deduction' => (float) $slip->advance_deduction,
            'loan_deduction'    => (float) $slip->loan_deduction,
            'loan_balance'      => (float) $slip->loan_balance,
            'adjustment'        => (float) $slip->adjustment,
            'total_deductions'  => (float) $slip->total_deductions,
            'net_salary'        => (float) $slip->net_salary,
            'notes'             => $slip->notes,
        ];
    }
}
