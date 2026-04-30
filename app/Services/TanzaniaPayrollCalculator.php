<?php

namespace App\Services;

/**
 * Tanzania statutory payroll calculator.
 * All rates are loaded from the payroll_settings table at runtime.
 */
class TanzaniaPayrollCalculator
{
    private array $settings;

    public function __construct(array $settings)
    {
        $this->settings = $settings;
    }

    /**
     * Calculate all deductions for one employee in one month.
     *
     * @param  float  $basicSalary
     * @param  float  $allowances
     * @param  float  $overtime
     * @param  float  $otherDeductions   Manual extra deductions
     * @param  float  $advanceDeduction  Advance salary being recovered this month
     * @param  float  $loanDeduction     Loan installment this month
     */
    public function calculate(
        float $basicSalary,
        float $allowances = 0,
        float $overtime = 0,
        float $otherDeductions = 0,
        float $advanceDeduction = 0,
        float $loanDeduction = 0,
    ): array {
        $gross = $basicSalary + $allowances + $overtime;

        // ── Employee deductions ────────────────────────────────────────────
        $paye          = $this->calculatePaye($gross);
        $nssfEmployee  = $this->calculateNssf($gross, 'employee');
        $nhifEmployee  = $this->calculateNhif($gross);
        $totalDeductions = $paye + $nssfEmployee + $nhifEmployee + $otherDeductions + $advanceDeduction + $loanDeduction;
        $netSalary     = max(0, $gross - $totalDeductions);

        // ── Employer costs ─────────────────────────────────────────────────
        $nssfEmployer = $this->calculateNssf($gross, 'employer');
        $sdlEmployer  = round($gross * ($this->rate('sdl_rate') / 100), 2);
        $wcfEmployer  = round($gross * ($this->rate('wcf_rate') / 100), 2);
        $totalEmployerCost = $gross + $nssfEmployer + $sdlEmployer + $wcfEmployer;

        return [
            'basic_salary'       => round($basicSalary, 2),
            'allowances'         => round($allowances, 2),
            'overtime'           => round($overtime, 2),
            'gross_salary'       => round($gross, 2),
            'paye'               => $paye,
            'nssf_employee'      => $nssfEmployee,
            'nhif_employee'      => $nhifEmployee,
            'other_deductions'   => round($otherDeductions, 2),
            'advance_deduction'  => round($advanceDeduction, 2),
            'loan_deduction'     => round($loanDeduction, 2),
            'total_deductions'   => round($totalDeductions, 2),
            'net_salary'         => round($netSalary, 2),
            'nssf_employer'      => $nssfEmployer,
            'sdl_employer'       => $sdlEmployer,
            'wcf_employer'       => $wcfEmployer,
            'total_employer_cost' => round($totalEmployerCost, 2),
        ];
    }

    // ── PAYE (graduated bands) ─────────────────────────────────────────────

    private function calculatePaye(float $gross): float
    {
        $bands = json_decode($this->settings['paye_bands'] ?? '[]', true);
        $tax   = 0.0;

        foreach ($bands as $band) {
            $from = (float) $band['from'];
            $to   = $band['to'] !== null ? (float) $band['to'] : PHP_FLOAT_MAX;
            $rate = (float) $band['rate'] / 100;

            if ($gross <= $from) break;

            $taxable = min($gross, $to) - $from;
            $tax += $taxable * $rate;
        }

        return round($tax, 2);
    }

    // ── NSSF ───────────────────────────────────────────────────────────────

    private function calculateNssf(float $gross, string $side): float
    {
        $key  = $side === 'employee' ? 'nssf_employee' : 'nssf_employer';
        $rate = $this->rate($key) / 100;
        $contribution = $gross * $rate;

        $max = (float) ($this->settings['nssf_max_monthly'] ?? 0);
        if ($max > 0) {
            $contribution = min($contribution, $max);
        }

        return round($contribution, 2);
    }

    // ── NHIF (flat amount per graduated bracket) ───────────────────────────

    private function calculateNhif(float $gross): float
    {
        $bands = json_decode($this->settings['nhif_bands'] ?? '[]', true);

        foreach (array_reverse($bands) as $band) {
            if ($gross >= (float) $band['from']) {
                return (float) $band['amount'];
            }
        }

        return 0.0;
    }

    private function rate(string $key): float
    {
        return (float) ($this->settings[$key] ?? 0);
    }
}
