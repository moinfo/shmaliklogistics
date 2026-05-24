<?php

namespace App\Http\Controllers\System\HR;

use App\Http\Controllers\Controller;
use App\Models\BonusPolicy;
use App\Models\BonusRule;
use App\Models\Employee;
use App\Models\EmployeeInfraction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BonusController extends Controller
{
    public function index()
    {
        return Inertia::render('system/HR/Bonus/Index', [
            'policies'    => BonusPolicy::orderBy('department')->get(),
            'rules'       => BonusRule::orderBy('name')->get(),
            'infractions' => EmployeeInfraction::with(['employee:id,name,employee_number', 'rule:id,name'])
                ->orderByDesc('occurred_on')
                ->limit(200)
                ->get(),
            'employees'   => Employee::where('status', 'active')->orderBy('name')->get(['id', 'name', 'employee_number', 'department', 'bonus']),
            'departments' => Employee::$departments,
            'statuses'    => EmployeeInfraction::$statuses,
        ]);
    }

    // ── Bonus policies (default amount per department) ──────────────────────

    public function storePolicy(Request $request)
    {
        $data = $request->validate([
            'department'  => 'required|string|max:100',
            'amount'      => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'is_active'   => 'boolean',
        ]);

        // One policy per department — upsert so re-saving a department updates it.
        BonusPolicy::updateOrCreate(
            ['department' => $data['department']],
            ['amount' => $data['amount'], 'description' => $data['description'] ?? null, 'is_active' => $data['is_active'] ?? true],
        );

        return back()->with('success', 'Bonus policy saved.');
    }

    public function destroyPolicy(BonusPolicy $policy)
    {
        $policy->delete();
        return back()->with('success', 'Bonus policy removed.');
    }

    // ── Rules / sheria (offence catalog) ────────────────────────────────────

    public function storeRule(Request $request)
    {
        $data = $request->validate([
            'name'           => 'required|string|max:120',
            'penalty_amount' => 'required|numeric|min:0',
            'description'    => 'nullable|string',
        ]);

        BonusRule::create($data);

        return back()->with('success', 'Rule added.');
    }

    public function updateRule(Request $request, BonusRule $rule)
    {
        $data = $request->validate([
            'name'           => 'required|string|max:120',
            'penalty_amount' => 'required|numeric|min:0',
            'description'    => 'nullable|string',
            'is_active'      => 'boolean',
        ]);

        $rule->update($data);

        return back()->with('success', 'Rule updated.');
    }

    public function destroyRule(BonusRule $rule)
    {
        $rule->delete();
        return back()->with('success', 'Rule deleted.');
    }

    // ── Infractions / makosa (recorded events) ──────────────────────────────

    public function storeInfraction(Request $request)
    {
        $data = $request->validate([
            'employee_id'   => 'required|exists:employees,id',
            'bonus_rule_id' => 'nullable|exists:bonus_rules,id',
            'amount'        => 'nullable|numeric|min:0',
            'occurred_on'   => 'required|date',
            'notes'         => 'nullable|string',
        ]);

        // Penalty defaults to the rule's amount but can be overridden per event.
        $amount = $data['amount'] ?? null;
        if ($amount === null && ! empty($data['bonus_rule_id'])) {
            $amount = (float) BonusRule::find($data['bonus_rule_id'])->penalty_amount;
        }

        EmployeeInfraction::create([
            'employee_id'   => $data['employee_id'],
            'bonus_rule_id' => $data['bonus_rule_id'] ?? null,
            'amount'        => $amount ?? 0,
            'occurred_on'   => $data['occurred_on'],
            'notes'         => $data['notes'] ?? null,
            'status'        => 'pending',
            'recorded_by'   => $request->user()->id,
        ]);

        return back()->with('success', 'Infraction recorded.');
    }

    public function waiveInfraction(EmployeeInfraction $infraction)
    {
        // Only a pending infraction can be waived — an applied one has already
        // been deducted on a payslip.
        abort_if($infraction->status !== 'pending', 422, 'Only pending infractions can be waived.');
        $infraction->update(['status' => 'waived']);

        return back()->with('success', 'Infraction waived.');
    }

    public function destroyInfraction(EmployeeInfraction $infraction)
    {
        abort_if($infraction->status === 'applied', 422, 'Applied infractions cannot be deleted.');
        $infraction->delete();

        return back()->with('success', 'Infraction deleted.');
    }
}
