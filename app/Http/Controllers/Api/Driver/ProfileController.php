<?php

namespace App\Http\Controllers\Api\Driver;

use App\Http\Controllers\Api\Staff\Modules\Concerns\BuildsHrPayroll;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class ProfileController extends Controller
{
    use BuildsHrPayroll;

    public function show(Request $request): JsonResponse
    {
        $user = $request->user();
        $driver = $user->driver?->load('vehicle:id,driver_id,plate,make,model_name,type');
        abort_if($driver === null, 403, 'No driver profile is associated with this account.');

        // Self-service: a driver sees their OWN full payroll (salary, allowances,
        // bonus, payslips, advances, loans), matched to their employee record by
        // national ID. No HR staff permissions needed — it's their own data.
        // findEmployeeForNationalId returns null unless there is exactly one match.
        $employee = $this->findEmployeeForNationalId($driver->national_id);

        // Explicit field list (never `toArray()`) so new/internal driver columns
        // are not exposed to the mobile client by accident.
        $data = [
            'id'                      => $driver->id,
            'name'                    => $driver->name,
            'status'                  => $driver->status,
            'phone'                   => $driver->phone,
            'phone_alt'               => $driver->phone_alt,
            'email'                   => $driver->email,
            'login_email'             => $user->email,
            'card_id'                 => $driver->card_id,
            'national_id'             => $driver->national_id,
            'address'                 => $driver->address,
            'birth_region'            => $driver->birth_region,
            'birth_district'          => $driver->birth_district,
            'license_number'          => $driver->license_number,
            'license_class'           => $driver->license_class,
            'license_classes'         => $driver->license_classes,
            'license_expiry'          => $driver->license_expiry?->toDateString(),
            'emergency_contact_name'  => $driver->emergency_contact_name,
            'emergency_contact_phone' => $driver->emergency_contact_phone,
            'photo_url'               => $driver->photo_url,
            'vehicle'                 => $driver->vehicle,
            'hr'                      => $employee
                ? $this->employeeHrProfile($employee, true, true, true, true)
                : null,
        ];

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
