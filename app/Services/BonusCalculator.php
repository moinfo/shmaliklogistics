<?php

namespace App\Services;

use App\Models\Employee;

/**
 * Resolves an employee's performance bonus for one payroll month.
 *
 * Policy (chosen by the business):
 *   - Base bonus comes from the employee's own override, else the
 *     department default, else nothing.
 *   - Recorded infractions (makosa) reduce that bonus.
 *   - The bonus is floored at zero — penalties can erase it but never
 *     bite into the base salary.
 *   - The bonus is paid UNTAXED, so the caller adds net_bonus to net pay.
 */
class BonusCalculator
{
    /** @param array<string,float> $policyByDepartment department => default monthly bonus */
    public function __construct(private array $policyByDepartment) {}

    /**
     * The base bonus an employee is entitled to before any penalties.
     * Per-employee override wins; otherwise the department default; otherwise 0.
     */
    public function baseBonusFor(Employee $employee): float
    {
        if ($employee->bonus !== null) {
            return (float) $employee->bonus;
        }

        return (float) ($this->policyByDepartment[$employee->department] ?? 0);
    }

    /**
     * Apply this month's penalties to the base bonus and return the breakdown
     * to store on the payslip:
     *   ['bonus' => base, 'bonus_penalty' => total deducted, 'net_bonus' => paid]
     *
     * ──────────────────────────────────────────────────────────────────────
     * TODO(you): implement the rule you chose — penalties reduce the bonus,
     * floored at zero, never going negative. It's a single line: compute
     * $netBonus from $baseBonus and $penalties. Replace the placeholder below.
     *
     * Think about: should a huge penalty ever produce a *negative* number
     * here (which would then be added to net pay and reduce salary)? You said
     * no — so guard against it.
     * ──────────────────────────────────────────────────────────────────────
     */
    public function settle(float $baseBonus, float $penalties): array
    {
        $baseBonus = round(max(0, $baseBonus), 2);
        $penalties = round(max(0, $penalties), 2);

        $netBonus = max(0, $baseBonus - $penalties);

        return [
            'bonus'         => $baseBonus,
            'bonus_penalty' => $penalties,
            'net_bonus'     => round($netBonus, 2),
        ];
    }
}
