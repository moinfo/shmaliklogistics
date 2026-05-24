<?php

namespace App\Http\Controllers\Api\Staff\Modules\Concerns;

use App\Models\Employee;
use App\Models\EmployeeAdvance;
use App\Models\EmployeeAllowance;
use App\Models\EmployeeBankDetail;
use App\Models\EmployeeLoan;
use App\Models\PayrollSlip;

/// Builds the shared HR/payroll bundle for an employee — primary bank account,
/// active allowances, open advances/loans and recent payslips. Reused by the
/// Employees module screen and the Drivers screen (drivers are matched to an
/// employee by national ID).
///
/// The bundle is sensitive, so advances, loans and payslips are each gated by
/// their own HR permission. The caller owns the base `hr_employees.view` gate
/// (it guards salary/allowances, which the route or lookup already implies).
trait BuildsHrPayroll
{
    // Infraction lifecycle colours (the model only stores the status string).
    private const INFRACTION_COLORS = [
        'pending' => '#F59E0B',
        'applied' => '#EF4444',
        'waived'  => '#22C55E',
    ];

    /// Resolves the employee a driver maps to by national ID. Returns null
    /// unless there is EXACTLY one match — drivers and employees share no FK, so
    /// a duplicate/ambiguous national ID must never silently surface another
    /// person's salary, bank account and payslips.
    protected function findEmployeeForNationalId(?string $nationalId): ?Employee
    {
        if ($nationalId === null || $nationalId === '') {
            return null;
        }
        $matches = Employee::where('national_id', $nationalId)->take(2)->get();
        return $matches->count() === 1 ? $matches->first() : null;
    }

    /// Employment terms + the payroll bundle, for records that don't carry
    /// employment data natively (i.e. the Drivers screen and the driver's own
    /// profile). Employees expose employment fields natively, so they call
    /// [hrPayrollBundle] directly instead.
    protected function employeeHrProfile(
        Employee $employee,
        bool $canPayroll,
        bool $canAdvances,
        bool $canLoans,
        bool $canBonus
    ): array {
        return [
            'employee_id'     => $employee->id,
            'employee_number' => $employee->employee_number,
            'department'      => $employee->department,
            'position'        => $employee->position,
            'status'          => $employee->status,
            'hire_date'       => $employee->hire_date?->toDateString(),
            'salary'          => $employee->salary !== null ? (float) $employee->salary : null,
            'salary_currency' => $employee->salary_currency,
            'bonus'           => $employee->bonus !== null ? (float) $employee->bonus : null,
        ] + $this->hrPayrollBundle($employee, $canPayroll, $canAdvances, $canLoans, $canBonus);
    }

    protected function hrPayrollBundle(
        Employee $employee,
        bool $canPayroll,
        bool $canAdvances,
        bool $canLoans,
        bool $canBonus
    ): array {
        $employeeId = $employee->id;

        $bank = EmployeeBankDetail::where('employee_id', $employeeId)
            ->orderByDesc('is_primary')
            ->first();

        $allowances = EmployeeAllowance::where('employee_id', $employeeId)
            ->where('is_active', true)
            ->get()
            ->map(fn (EmployeeAllowance $a) => [
                'id'         => $a->id,
                'name'       => $a->name,
                'type'       => $a->type,
                'amount'     => (float) $a->amount,
                'is_taxable' => (bool) $a->is_taxable,
            ])->values();

        $advances = $canAdvances
            ? EmployeeAdvance::where('employee_id', $employeeId)
                ->whereIn('status', ['pending', 'approved'])
                ->latest('requested_date')
                ->get()
                ->map(fn (EmployeeAdvance $a) => [
                    'id'             => $a->id,
                    'amount'         => (float) $a->amount,
                    'purpose'        => $a->purpose,
                    'status'         => $a->status,
                    'status_label'   => EmployeeAdvance::$statuses[$a->status]['label'] ?? ucfirst((string) $a->status),
                    'status_color'   => EmployeeAdvance::$statuses[$a->status]['color'] ?? null,
                    'requested_date' => $a->requested_date?->toDateString(),
                ])->values()
            : collect();

        $loans = $canLoans
            ? EmployeeLoan::where('employee_id', $employeeId)
                ->whereIn('status', ['pending', 'active'])
                ->latest('start_date')
                ->get()
                ->map(fn (EmployeeLoan $l) => [
                    'id'                  => $l->id,
                    'loan_number'         => $l->loan_number,
                    'principal'           => (float) $l->principal,
                    'balance_remaining'   => (float) $l->balance_remaining,
                    'monthly_installment' => (float) $l->monthly_installment,
                    'months_paid'         => $l->months_paid,
                    'total_months'        => $l->total_months,
                    'status'              => $l->status,
                    'status_label'        => EmployeeLoan::$statuses[$l->status]['label'] ?? ucfirst((string) $l->status),
                    'status_color'        => EmployeeLoan::$statuses[$l->status]['color'] ?? null,
                ])->values()
            : collect();

        // Recent payslips, newest pay period first (runs carry year + month).
        $slips = $canPayroll
            ? PayrollSlip::with([
                    'run:id,year,month,status,document_number,payroll_number',
                    'employee:id,name',
                ])
                ->where('payroll_slips.employee_id', $employeeId)
                ->join('payroll_runs', 'payroll_runs.id', '=', 'payroll_slips.payroll_run_id')
                ->orderByDesc('payroll_runs.year')
                ->orderByDesc('payroll_runs.month')
                ->select('payroll_slips.*')
                ->limit(6)
                ->get()
                ->map(fn (PayrollSlip $slip) => $this->slipShape($slip))
                ->values()
            : collect();

        return [
            'bank' => $bank ? [
                'bank_name'      => $bank->bank_name,
                'account_number' => $bank->account_number,
                'account_name'   => $bank->account_name,
                'branch'         => $bank->branch,
            ] : null,
            'allowances'         => $allowances,
            'allowances_total'   => (float) $allowances->sum('amount'),
            'advances'           => $advances,
            'loans'              => $loans,
            'loan_balance_total' => (float) $loans->sum('balance_remaining'),
            'slips'              => $slips,
            // Distinct key: the driver envelope also carries a scalar `bonus`
            // (the standing amount), so the block can't reuse `bonus` or the
            // PHP array `+` union would drop it.
            'bonus_summary'      => $canBonus ? $this->bonusBlock($employee) : null,
        ];
    }

    // Performance-bonus picture for an employee: the department policy default,
    // their standing bonus, recorded infractions (makosa) and the resulting net
    // bonus after pending/applied penalties. Mirrors System\HR\BonusController.
    //
    // The BonusPolicy/EmployeeInfraction models are optional (the bonus feature
    // may not be installed); when absent we degrade to just the standing bonus
    // so the rest of the HR profile keeps working.
    protected function bonusBlock(Employee $employee): array
    {
        $policyClass     = 'App\\Models\\BonusPolicy';
        $infractionClass = 'App\\Models\\EmployeeInfraction';

        $standing = $employee->bonus !== null ? (float) $employee->bonus : null;

        $policyAmount = class_exists($policyClass)
            ? $policyClass::where('is_active', true)
                ->where('department', $employee->department)
                ->value('amount')
            : null;

        $infractions = collect();
        if (class_exists($infractionClass)) {
            $infractions = $infractionClass::with('rule:id,name')
                ->where('employee_id', $employee->id)
                ->orderByDesc('occurred_on')
                ->limit(12)
                ->get()
                ->map(fn ($x) => [
                    'id'           => $x->id,
                    'rule_name'    => $x->rule?->name,
                    'amount'       => (float) $x->amount,
                    'occurred_on'  => $x->occurred_on?->toDateString(),
                    'status'       => $x->status,
                    'status_label' => ucfirst((string) $x->status),
                    'status_color' => self::INFRACTION_COLORS[$x->status] ?? null,
                    'notes'        => $x->notes,
                ])->values();
        }

        $effective = $standing ?? ($policyAmount !== null ? (float) $policyAmount : 0.0);

        // Only pending + applied penalties reduce the bonus; waived are forgiven.
        $penalties = (float) $infractions
            ->whereIn('status', ['pending', 'applied'])
            ->sum('amount');

        return [
            'department'      => $employee->department,
            'policy_amount'   => $policyAmount !== null ? (float) $policyAmount : null,
            'standing_bonus'  => $standing,
            'effective_bonus' => $effective,
            'infractions'     => $infractions,
            'penalties_total' => $penalties,
            'net_bonus'       => max(0, $effective - $penalties),
        ];
    }

    // Full salary-slip breakdown; matches the mobile `SalarySlip` model so the
    // same JSON parses for payroll slips and the driver/employee payslip cards.
    protected function slipShape(PayrollSlip $slip): array
    {
        return [
            'id'                => $slip->id,
            'payroll_run_id'    => $slip->payroll_run_id,
            'employee_id'       => $slip->employee_id,
            'employee_name'     => $slip->employee?->name ?? 'Unknown',
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
