<?php

namespace App\Http\Controllers\System\HR;

use App\Http\Controllers\Controller;
use App\Models\CompanySetting;
use App\Models\Employee;
use App\Models\EmployeeBankDetail;
use App\Models\PayrollRun;
use App\Models\PayrollSlip;
use App\Models\PayrollSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SalarySlipController extends Controller
{
    public function index(Request $request)
    {
        $empId = $request->input('employee_id');
        $year  = (int) $request->input('year',  now()->year);
        $month = (int) $request->input('month', now()->month);

        $employees = Employee::where('status', 'active')
            ->orderBy('name')
            ->get(['id', 'name', 'employee_number', 'department', 'position', 'salary']);

        $company = CompanySetting::get();
        $nssf    = PayrollSetting::where('key', 'nssf_employee')->value('value') ?? 10;

        $slip = null;
        $run  = null;

        if ($empId && $year && $month) {
            $run = PayrollRun::where('year', $year)->where('month', $month)->first();

            if ($run) {
                $slip = PayrollSlip::where('payroll_run_id', $run->id)
                    ->where('employee_id', $empId)
                    ->with('employee')
                    ->first();
            }
        }

        // Attach bank detail for the found employee
        $bankDetail = $empId
            ? EmployeeBankDetail::where('employee_id', $empId)->where('is_primary', true)->first()
              ?? EmployeeBankDetail::where('employee_id', $empId)->first()
            : null;

        return Inertia::render('system/HR/SalarySlip/Index', [
            'slip'       => $slip,
            'run'        => $run,
            'bankDetail' => $bankDetail,
            'employees'  => $employees,
            'company'    => $company,
            'nssfRate'   => (float) $nssf,
            'filters'    => [
                'employee_id' => $empId ? (string) $empId : '',
                'year'        => $year,
                'month'       => $month,
            ],
        ]);
    }
}
