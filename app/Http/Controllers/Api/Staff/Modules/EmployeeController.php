<?php

namespace App\Http\Controllers\Api\Staff\Modules;

use App\Http\Controllers\Api\Staff\Modules\Concerns\BuildsHrPayroll;
use App\Http\Controllers\Controller;
use App\Models\Employee;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/// Read-only Employee (HR) endpoints for the staff mobile app.
///
/// Mirrors the data/query of App\Http\Controllers\System\HR\EmployeeController
/// but returns flat JSON envelopes instead of Inertia pages. Auth + permission
/// scoping is handled by the route middleware (permission:hr_employees.view).
class EmployeeController extends Controller
{
    use BuildsHrPayroll;

    // GET /api/staff/modules/employees — searchable list, newest first.
    public function index(Request $request): JsonResponse
    {
        $query = Employee::latest();

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                  ->orWhere('employee_number', 'like', "%{$s}%")
                  ->orWhere('position', 'like', "%{$s}%")
                  ->orWhere('department', 'like', "%{$s}%");
            });
        }
        if ($request->filled('department')) {
            $query->where('department', $request->department);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $employees = $query->get()
            ->map(fn (Employee $e) => $this->summarize($e));

        return response()->json([
            'employees'   => $employees,
            'statuses'    => Employee::$statuses,
            'departments' => Employee::$departments,
        ]);
    }

    // GET /api/staff/modules/employees/{id} — single employee record + the HR
    // payroll bundle (bank, allowances, advances, loans, recent payslips).
    public function show(Request $request, $id): JsonResponse
    {
        $employee = Employee::findOrFail($id);
        $u = $request->user();

        $data = $this->summarize($employee) + [
            'national_id'             => $employee->national_id,
            'address'                 => $employee->address,
            'birth_date'              => $employee->birth_date?->toDateString(),
            'salary'                  => $employee->salary,
            'salary_currency'         => $employee->salary_currency,
            'bonus'                   => $employee->bonus,
            'emergency_contact_name'  => $employee->emergency_contact_name,
            'emergency_contact_phone' => $employee->emergency_contact_phone,
            'notes'                   => $employee->notes,
            // The route already enforces hr_employees.view; the bundle gates its
            // own sensitive sub-sections (payslips, advances, loans, bonus) by
            // the viewer's specific HR permissions.
            'hr'                      => $this->hrPayrollBundle(
                $employee,
                $u->hasPermission('hr_salary_slips.view') || $u->hasPermission('hr_payroll.view'),
                $u->hasPermission('hr_advances.view'),
                $u->hasPermission('hr_loans.view'),
                $u->hasPermission('hr_bonus.view'),
            ),
        ];

        return response()->json([
            'employee' => $data,
        ]);
    }

    // Shared flat shape used by both list and detail responses.
    private function summarize(Employee $employee): array
    {
        return [
            'id'              => $employee->id,
            'name'            => $employee->name,
            'employee_number' => $employee->employee_number,
            'department'      => $employee->department,
            'department_name' => $employee->department,
            'position'        => $employee->position,
            'status'          => $employee->status,
            'status_label'    => Employee::$statuses[$employee->status]['label'] ?? $employee->status,
            'status_color'    => Employee::$statuses[$employee->status]['color'] ?? null,
            'phone'           => $employee->phone,
            'email'           => $employee->email,
            'hire_date'       => $employee->hire_date?->toDateString(),
        ];
    }
}
