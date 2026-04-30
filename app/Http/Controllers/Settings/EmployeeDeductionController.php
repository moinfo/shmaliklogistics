<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\DeductionType;
use App\Models\Employee;
use App\Models\EmployeeDeduction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmployeeDeductionController extends Controller
{
    public function index()
    {
        return Inertia::render('system/Settings/DeductionSubscriptions/Index', [
            'subscriptions' => EmployeeDeduction::with(['employee', 'deductionType'])
                ->orderBy('employee_id')
                ->orderBy('deduction_type_id')
                ->get(),
            'employees'       => Employee::where('status', 'active')->orderBy('name')->get(['id', 'name', 'employee_number']),
            'deductionTypes'  => DeductionType::where('is_active', true)->orderBy('name')->get(['id', 'name', 'abbreviation']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'employee_id'       => 'required|exists:employees,id',
            'deduction_type_id' => 'required|exists:deduction_types,id',
            'membership_number' => 'nullable|string|max:100',
            'fixed_amount'      => 'nullable|numeric|min:0',
        ]);

        EmployeeDeduction::updateOrCreate(
            ['employee_id' => $data['employee_id'], 'deduction_type_id' => $data['deduction_type_id']],
            ['membership_number' => $data['membership_number'] ?? null, 'fixed_amount' => $data['fixed_amount'] ?? null, 'is_active' => true]
        );

        return back()->with('success', 'Subscription saved.');
    }

    public function update(Request $request, EmployeeDeduction $deductionSubscription)
    {
        $data = $request->validate([
            'membership_number' => 'nullable|string|max:100',
            'fixed_amount'      => 'nullable|numeric|min:0',
            'is_active'         => 'boolean',
        ]);

        $deductionSubscription->update($data);

        return back()->with('success', 'Subscription updated.');
    }

    public function destroy(EmployeeDeduction $deductionSubscription)
    {
        $deductionSubscription->delete();

        return back()->with('success', 'Subscription removed.');
    }
}
