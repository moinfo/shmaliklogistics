<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Department;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DepartmentController extends Controller
{
    public function index()
    {
        return Inertia::render('system/Settings/Departments/Index', [
            'departments' => Department::orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:100|unique:departments',
            'code'        => 'nullable|string|max:20',
            'description' => 'nullable|string|max:300',
            'is_active'   => 'boolean',
        ]);

        Department::create(array_merge($data, ['created_by' => auth()->id()]));

        return back()->with('success', 'Department created.');
    }

    public function update(Request $request, Department $department)
    {
        $data = $request->validate([
            'name'        => "required|string|max:100|unique:departments,name,{$department->id}",
            'code'        => 'nullable|string|max:20',
            'description' => 'nullable|string|max:300',
            'is_active'   => 'boolean',
        ]);

        $department->update($data);

        return back()->with('success', 'Department updated.');
    }

    public function destroy(Department $department)
    {
        $department->delete();
        return back()->with('success', 'Department deleted.');
    }
}
