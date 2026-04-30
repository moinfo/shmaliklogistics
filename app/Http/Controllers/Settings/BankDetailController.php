<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\EmployeeBankDetail;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BankDetailController extends Controller
{
    public function index()
    {
        return Inertia::render('system/Settings/BankDetails/Index', [
            'bankDetails' => EmployeeBankDetail::with('employee')
                ->orderBy('employee_id')
                ->get(),
            'employees' => Employee::where('status', 'active')->orderBy('name')->get(['id', 'name', 'employee_number']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'employee_id'    => 'required|exists:employees,id',
            'bank_name'      => 'required|string|max:100',
            'account_number' => 'required|string|max:50',
            'branch'         => 'nullable|string|max:100',
            'account_name'   => 'nullable|string|max:100',
            'is_primary'     => 'boolean',
        ]);

        if ($data['is_primary'] ?? false) {
            EmployeeBankDetail::where('employee_id', $data['employee_id'])->update(['is_primary' => false]);
        }

        EmployeeBankDetail::create($data);

        return back()->with('success', 'Bank detail added.');
    }

    public function update(Request $request, EmployeeBankDetail $bankDetail)
    {
        $data = $request->validate([
            'bank_name'      => 'required|string|max:100',
            'account_number' => 'required|string|max:50',
            'branch'         => 'nullable|string|max:100',
            'account_name'   => 'nullable|string|max:100',
            'is_primary'     => 'boolean',
        ]);

        if ($data['is_primary'] ?? false) {
            EmployeeBankDetail::where('employee_id', $bankDetail->employee_id)->where('id', '!=', $bankDetail->id)->update(['is_primary' => false]);
        }

        $bankDetail->update($data);

        return back()->with('success', 'Bank detail updated.');
    }

    public function destroy(EmployeeBankDetail $bankDetail)
    {
        $bankDetail->delete();

        return back()->with('success', 'Bank detail deleted.');
    }
}
