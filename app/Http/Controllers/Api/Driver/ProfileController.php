<?php

namespace App\Http\Controllers\Api\Driver;

use App\Http\Controllers\Api\Staff\Modules\Concerns\BuildsHrPayroll;
use App\Http\Controllers\Controller;
use App\Models\Employee;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class ProfileController extends Controller
{
    use BuildsHrPayroll;

    public function show(Request $request): JsonResponse
    {
        $driver = $request->user()->driver->load('vehicle:id,driver_id,plate,make,model_name,type');
        $data = $driver->toArray();
        $data['login_email'] = $request->user()->email;

        // Self-service: a driver sees their OWN full payroll (salary, allowances,
        // bonus, payslips, advances, loans), matched to their employee record by
        // national ID. No HR staff permissions needed — it's their own data.
        $employee = $driver->national_id
            ? Employee::where('national_id', $driver->national_id)->first()
            : null;
        $data['hr'] = $employee
            ? $this->employeeHrProfile($employee, true, true, true, true)
            : null;

        return response()->json(['driver' => $data]);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => 'required|string',
            'password'         => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password is incorrect.'],
            ]);
        }

        $user->update(['password' => Hash::make($request->password)]);

        return response()->json(['message' => 'Password updated successfully.']);
    }
}
