<?php

namespace App\Http\Controllers\System\HR;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\LeaveRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmployeeController extends Controller
{
    public function index(Request $request)
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

        $employees = $query->paginate(20)->withQueryString();

        $stats = [
            'total'  => Employee::count(),
            'active' => Employee::where('status', 'active')->count(),
            'on_leave' => Employee::where('status', 'on_leave')->count(),
            'departments' => Employee::groupBy('department')
                ->selectRaw('department, COUNT(*) as count')
                ->pluck('count', 'department'),
        ];

        return Inertia::render('system/HR/Employees/Index', [
            'employees'   => $employees,
            'stats'       => $stats,
            'statuses'    => Employee::$statuses,
            'departments' => Employee::$departments,
            'filters'     => $request->only(['search', 'department', 'status']),
        ]);
    }

    public function create()
    {
        return Inertia::render('system/HR/Employees/Create', [
            'statuses'    => Employee::$statuses,
            'departments' => Employee::$departments,
            'nextNumber'  => Employee::nextNumber(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'employee_number'         => 'required|string|max:20|unique:employees,employee_number',
            'name'                    => 'required|string|max:150',
            'department'              => 'nullable|string|max:80',
            'position'                => 'nullable|string|max:100',
            'phone'                   => 'nullable|string|max:30',
            'email'                   => 'nullable|email|max:150',
            'national_id'             => 'nullable|string|max:50',
            'address'                 => 'nullable|string',
            'hire_date'               => 'nullable|date',
            'birth_date'              => 'nullable|date',
            'salary'                  => 'nullable|numeric|min:0',
            'salary_currency'         => 'required|string|max:10',
            'status'                  => 'required|in:' . implode(',', array_keys(Employee::$statuses)),
            'emergency_contact_name'  => 'nullable|string|max:100',
            'emergency_contact_phone' => 'nullable|string|max:30',
            'notes'                   => 'nullable|string',
        ]);

        $data['created_by'] = $request->user()->id;
        Employee::create($data);

        return redirect()->route('system.hr.employees.index')
            ->with('success', 'Employee added.');
    }

    public function show(Employee $employee)
    {
        $employee->load('leaveRequests');
        return Inertia::render('system/HR/Employees/Show', [
            'employee' => $employee,
            'statuses' => Employee::$statuses,
            'leaveTypes' => LeaveRequest::$types,
        ]);
    }

    public function edit(Employee $employee)
    {
        return Inertia::render('system/HR/Employees/Edit', [
            'employee'    => $employee,
            'statuses'    => Employee::$statuses,
            'departments' => Employee::$departments,
        ]);
    }

    public function update(Request $request, Employee $employee)
    {
        $data = $request->validate([
            'employee_number'         => 'required|string|max:20|unique:employees,employee_number,' . $employee->id,
            'name'                    => 'required|string|max:150',
            'department'              => 'nullable|string|max:80',
            'position'                => 'nullable|string|max:100',
            'phone'                   => 'nullable|string|max:30',
            'email'                   => 'nullable|email|max:150',
            'national_id'             => 'nullable|string|max:50',
            'address'                 => 'nullable|string',
            'hire_date'               => 'nullable|date',
            'birth_date'              => 'nullable|date',
            'salary'                  => 'nullable|numeric|min:0',
            'salary_currency'         => 'required|string|max:10',
            'status'                  => 'required|in:' . implode(',', array_keys(Employee::$statuses)),
            'emergency_contact_name'  => 'nullable|string|max:100',
            'emergency_contact_phone' => 'nullable|string|max:30',
            'notes'                   => 'nullable|string',
        ]);

        $employee->update($data);

        return redirect()->route('system.hr.employees.index')
            ->with('success', 'Employee updated.');
    }

    public function destroy(Employee $employee)
    {
        $employee->delete();
        return back()->with('success', 'Employee removed.');
    }
}
