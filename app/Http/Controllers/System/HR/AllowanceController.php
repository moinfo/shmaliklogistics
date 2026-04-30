<?php

namespace App\Http\Controllers\System\HR;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\EmployeeAllowance;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AllowanceController extends Controller
{
    public function index()
    {
        return Inertia::render('system/HR/Allowances/Index', [
            'allowances' => EmployeeAllowance::with('employee')
                ->orderBy('employee_id')
                ->orderBy('name')
                ->get(),
            'employees' => Employee::where('status', 'active')->orderBy('name')->get(['id', 'name', 'employee_number']),
            'types'     => EmployeeAllowance::$types,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'name'        => 'required|string|max:100',
            'type'        => 'required|in:FIXED,PERCENTAGE',
            'amount'      => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'is_taxable'  => 'boolean',
        ]);

        EmployeeAllowance::create($data);

        return back()->with('success', 'Allowance added.');
    }

    public function update(Request $request, EmployeeAllowance $allowance)
    {
        $data = $request->validate([
            'name'       => 'required|string|max:100',
            'type'       => 'required|in:FIXED,PERCENTAGE',
            'amount'     => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'is_taxable'  => 'boolean',
            'is_active'   => 'boolean',
        ]);

        $allowance->update($data);

        return back()->with('success', 'Allowance updated.');
    }

    public function destroy(EmployeeAllowance $allowance)
    {
        $allowance->delete();

        return back()->with('success', 'Allowance deleted.');
    }
}
