<?php

namespace Database\Seeders;

use App\Models\BonusPolicy;
use App\Models\BonusRule;
use App\Models\Driver;
use App\Models\Employee;
use App\Models\EmployeeAdvance;
use App\Models\EmployeeAllowance;
use App\Models\EmployeeBankDetail;
use App\Models\EmployeeInfraction;
use App\Models\EmployeeLoan;
use App\Models\PayrollRun;
use App\Models\PayrollSlip;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

/// Links the seeded drivers to HR employee + payroll records so the driver
/// detail screen's HR section has data to show. Drivers and employees are
/// matched on `national_id`; the base demo data seeds them as separate people,
/// so this backfills an employee (in the Operations dept), bank account,
/// allowances and a payslip per existing payroll run for every driver.
///
/// Idempotent: re-running updates the same rows instead of duplicating. Run with
///   php artisan db:seed --class=DriverEmployeeSeeder
class DriverEmployeeSeeder extends Seeder
{
    public function run(): void
    {
        $adminId = User::min('id');
        $now = now();

        // Bands reused from the main seeder so slip figures stay consistent.
        $paye = function (float $taxable): float {
            if ($taxable <= 270000)  return 0;
            if ($taxable <= 520000)  return ($taxable - 270000) * 0.08;
            if ($taxable <= 760000)  return 20000 + ($taxable - 520000) * 0.20;
            if ($taxable <= 1000000) return 68000 + ($taxable - 760000) * 0.25;
            return 128000 + ($taxable - 1000000) * 0.30;
        };
        $nhif = function (float $gross): float {
            if ($gross < 1000000) return 0;
            if ($gross < 2000000) return 30000;
            if ($gross < 3000000) return 60000;
            return 90000;
        };

        $runs = PayrollRun::orderBy('year')->orderBy('month')->get();
        $banks = ['CRDB Bank', 'NMB Bank', 'Stanbic Bank', 'NBC Bank', 'Equity Bank'];

        // ── Bonus scaffolding: Operations policy + offence catalog (sheria) ──
        // The bonus models are optional; skip this section if not installed.
        $bonusOn = class_exists(BonusPolicy::class)
            && class_exists(BonusRule::class)
            && class_exists(EmployeeInfraction::class);
        $ruleIds = [];
        $infractionPlan = [];
        if ($bonusOn) {
            BonusPolicy::updateOrCreate(
                ['department' => 'Operations'],
                ['amount' => 60000, 'is_active' => true, 'description' => 'Operations team performance bonus'],
            );
            foreach ([['Overspeeding', 20000], ['Late delivery', 15000], ['Cargo mishandling', 30000], ['Unauthorised stop', 10000]] as [$rname, $penalty]) {
                $ruleIds[$rname] = BonusRule::updateOrCreate(
                    ['name' => $rname],
                    ['penalty_amount' => $penalty, 'is_active' => true],
                )->id;
            }
            // Demo infractions (makosa) for the first few drivers, by driver index.
            $infractionPlan = [
                0 => [['Overspeeding', 'applied', '2026-04-12', 'Caught at 95km/h in a 60 zone'], ['Late delivery', 'pending', '2026-05-02', 'Lusaka run 6h late']],
                1 => [['Cargo mishandling', 'waived', '2026-03-20', 'Resolved — no damage confirmed']],
                2 => [['Late delivery', 'pending', '2026-04-28', null]],
            ];
        }

        $drivers = Driver::whereNotNull('national_id')->orderBy('id')->get();

        foreach ($drivers->values() as $i => $driver) {
            $salary    = 700000 + ($i % 5) * 50000;   // 700k–900k spread
            $housing   = 150000;
            $transport = 80000;
            $allowTotal = $housing + $transport;

            // 1) Employee (matched to the driver by national_id).
            $employee = Employee::updateOrCreate(
                ['national_id' => $driver->national_id],
                [
                    'employee_number' => 'EMP-DRV-' . str_pad((string) $driver->id, 3, '0', STR_PAD_LEFT),
                    'name'            => $driver->name,
                    'department'      => 'Operations',
                    'position'        => 'Driver',
                    'phone'           => $driver->phone,
                    'email'           => $driver->email,
                    'address'         => $driver->address ?? 'Dar es Salaam, Tanzania',
                    'hire_date'       => Carbon::create(2026, 1, 1)->subMonths(12 + $i)->toDateString(),
                    'salary'          => $salary,
                    'salary_currency' => 'TZS',
                    'bonus'           => 50000,
                    'status'          => 'active',
                    'created_by'      => $adminId,
                ]
            );

            // 2) Primary bank account.
            EmployeeBankDetail::updateOrCreate(
                ['employee_id' => $employee->id, 'is_primary' => true],
                [
                    'bank_name'      => $banks[$i % count($banks)],
                    'account_number' => (string) (20000000 + $driver->id * 137),
                    'branch'         => 'Dar es Salaam Main Branch',
                    'account_name'   => $driver->name,
                ]
            );

            // 3) Active allowances.
            foreach ([['Housing Allowance', $housing], ['Transport Allowance', $transport]] as [$aname, $amount]) {
                EmployeeAllowance::updateOrCreate(
                    ['employee_id' => $employee->id, 'name' => $aname],
                    ['type' => 'FIXED', 'amount' => $amount, 'is_taxable' => false, 'is_active' => true]
                );
            }

            // 4) A payslip in every existing payroll run.
            $hasLoan = $i < 2;                       // first two drivers carry a loan
            $loanInstallment = 90000;
            $loanPrincipal   = 1200000;

            foreach ($runs->values() as $seq => $run) {
                $gross    = $salary + $allowTotal;
                $nssfEmp  = round($gross * 0.10);
                $taxable  = $gross - $nssfEmp;
                $payeTax  = round($paye($taxable));
                $nhifAmt  = $nhif($gross);
                $loanAmt  = $hasLoan ? $loanInstallment : 0;
                $sdlEmpr  = round($gross * 0.045);
                $wcfEmpr  = round($gross * 0.005);
                $nssfEmpr = round($gross * 0.10);

                $totalDed = $nssfEmp + $payeTax + $nhifAmt + $loanAmt;
                $loanBalance = $hasLoan ? max(0, $loanPrincipal - $loanInstallment * ($seq + 1)) : 0;

                PayrollSlip::updateOrCreate(
                    ['payroll_run_id' => $run->id, 'employee_id' => $employee->id],
                    [
                        'basic_salary'        => $salary,
                        'allowances'          => $allowTotal,
                        'overtime'            => 0,
                        'bonus'               => 0,
                        'bonus_penalty'       => 0,
                        'gross_salary'        => $gross,
                        'paye'                => $payeTax,
                        'nssf_employee'       => $nssfEmp,
                        'nhif_employee'       => $nhifAmt,
                        'heslb'               => 0,
                        'other_deductions'    => 0,
                        'advance_deduction'   => 0,
                        'loan_deduction'      => $loanAmt,
                        'loan_balance'        => $loanBalance,
                        'adjustment'          => 0,
                        'total_deductions'    => $totalDed,
                        'net_salary'          => $gross - $totalDed,
                        'nssf_employer'       => $nssfEmpr,
                        'sdl_employer'        => $sdlEmpr,
                        'wcf_employer'        => $wcfEmpr,
                        'total_employer_cost' => $gross + $nssfEmpr + $sdlEmpr + $wcfEmpr,
                    ]
                );
            }

            // 5) A loan (first two drivers) + an advance (first three) so the
            //    Advances & Loans card has something to render.
            if ($hasLoan) {
                EmployeeLoan::updateOrCreate(
                    ['employee_id' => $employee->id, 'loan_number' => 'LN-DRV-' . str_pad((string) $driver->id, 3, '0', STR_PAD_LEFT)],
                    [
                        'principal'           => $loanPrincipal,
                        'balance_remaining'   => max(0, $loanPrincipal - $loanInstallment * $runs->count()),
                        'monthly_installment' => $loanInstallment,
                        'total_months'        => 14,
                        'months_paid'         => $runs->count(),
                        'start_date'          => Carbon::create(2026, 1, 1)->toDateString(),
                        'expected_end_date'   => Carbon::create(2026, 1, 1)->addMonths(14)->toDateString(),
                        'purpose'             => 'Family support loan',
                        'status'              => 'active',
                        'approved_by'         => $adminId,
                        'created_by'          => $adminId,
                    ]
                );
            }
            if ($i < 3) {
                EmployeeAdvance::updateOrCreate(
                    ['employee_id' => $employee->id, 'purpose' => 'Salary advance'],
                    [
                        'amount'          => 250000,
                        'requested_date'  => Carbon::create(2026, 4, 10)->toDateString(),
                        'deduction_month' => Carbon::create(2026, 5, 1)->toDateString(),
                        'status'          => 'approved',
                        'approved_by'     => $adminId,
                        'created_by'      => $adminId,
                    ]
                );
            }

            // 6) Bonus infractions (makosa) for the first few drivers.
            foreach ($infractionPlan[$i] ?? [] as [$ruleName, $status, $date, $note]) {
                EmployeeInfraction::updateOrCreate(
                    [
                        'employee_id'   => $employee->id,
                        'bonus_rule_id' => $ruleIds[$ruleName],
                        'occurred_on'   => $date,
                    ],
                    [
                        'amount'      => BonusRule::find($ruleIds[$ruleName])->penalty_amount,
                        'status'      => $status,
                        'notes'       => $note,
                        'recorded_by' => $adminId,
                    ]
                );
            }
        }

        $this->command?->info("Linked {$drivers->count()} drivers to HR employee + payroll records.");
    }
}
