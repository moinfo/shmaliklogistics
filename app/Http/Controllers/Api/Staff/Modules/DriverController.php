<?php

namespace App\Http\Controllers\Api\Staff\Modules;

use App\Http\Controllers\Api\Staff\Modules\Concerns\BuildsHrPayroll;
use App\Http\Controllers\Controller;
use App\Models\Driver;
use App\Models\Employee;
use App\Models\Trip;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/// Read-only Driver endpoints for the staff mobile app.
///
/// Mirrors the data/query of App\Http\Controllers\System\DriverController but
/// returns flat JSON envelopes instead of Inertia pages. Auth + permission
/// scoping is handled by the route middleware (permission:drivers.view).
class DriverController extends Controller
{
    use BuildsHrPayroll;

    // GET /api/staff/modules/drivers — searchable list, newest first.
    public function index(Request $request): JsonResponse
    {
        $query = Driver::query()->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                  ->orWhere('phone', 'like', "%{$s}%")
                  ->orWhere('license_number', 'like', "%{$s}%")
                  ->orWhere('national_id', 'like', "%{$s}%");
            });
        }

        $drivers = $query->with('vehicle:id,driver_id,plate')
            ->get()
            ->map(fn (Driver $d) => $this->summarize($d));

        return response()->json([
            'drivers'  => $drivers,
            'statuses' => Driver::$statuses,
        ]);
    }

    // GET /api/staff/modules/drivers/{id} — single driver with recent trips.
    public function show(Request $request, $id): JsonResponse
    {
        $driver = Driver::with('vehicle:id,driver_id,plate,make,model_name,type')
            ->findOrFail($id);

        $trips = Trip::where('driver_name', $driver->name)
            ->latest('departure_date')
            ->limit(10)
            ->get()
            ->map(fn (Trip $t) => [
                'id'             => $t->id,
                'trip_number'    => $t->trip_number,
                'status'         => $t->status,
                'route_from'     => $t->route_from,
                'route_to'       => $t->route_to,
                'departure_date' => $t->departure_date?->toDateString(),
                'arrival_date'   => $t->arrival_date?->toDateString(),
            ]);

        $data = $this->summarize($driver) + [
            'phone_alt'               => $driver->phone_alt,
            'email'                   => $driver->email,
            'national_id'             => $driver->national_id,
            'card_id'                 => $driver->card_id,
            'address'                 => $driver->address,
            'birth_region'            => $driver->birth_region,
            'birth_district'          => $driver->birth_district,
            'license_classes'         => $driver->license_classes,
            'emergency_contact_name'  => $driver->emergency_contact_name,
            'emergency_contact_phone' => $driver->emergency_contact_phone,
            'visa_expiry'             => $driver->visa_expiry?->toDateString(),
            'notes'                   => $driver->notes,
            'vehicle_make'            => $driver->vehicle?->make,
            'vehicle_model'           => $driver->vehicle?->model_name,
            'vehicle_type'            => $driver->vehicle?->type,
            'trips'                   => $trips,
            'hr'                      => $this->hrProfile($driver, $request->user()),
        ];

        return response()->json([
            'driver' => $data,
        ]);
    }

    // The driver's HR/payroll profile, or null when no matching employee exists
    // or the viewer lacks HR access.
    //
    // Drivers and HR employees are separate tables with no foreign key; they are
    // matched on the immutable `national_id` (the only shared identifier). The
    // block is sensitive (compensation, payroll), so it is gated by the same HR
    // permissions used elsewhere — the `drivers.view` route grant alone is not
    // enough to see salary/payslips:
    //   • employment terms, salary, bonus, allowances → hr_employees.view
    //   • payslips                                     → hr_salary_slips.view / hr_payroll.view
    //   • advances                                     → hr_advances.view
    //   • loans                                        → hr_loans.view
    private function hrProfile(Driver $driver, $user): ?array
    {
        if (! $user || ! $user->hasPermission('hr_employees.view')) {
            return null;
        }
        if (! $driver->national_id) {
            return null;
        }

        $employee = Employee::where('national_id', $driver->national_id)->first();
        if (! $employee) {
            return null;
        }

        return $this->employeeHrProfile(
            $employee,
            $user->hasPermission('hr_salary_slips.view') || $user->hasPermission('hr_payroll.view'),
            $user->hasPermission('hr_advances.view'),
            $user->hasPermission('hr_loans.view'),
            $user->hasPermission('hr_bonus.view'),
        );
    }

    // Shared flat shape used by both list and detail responses.
    private function summarize(Driver $driver): array
    {
        return [
            'id'             => $driver->id,
            'name'           => $driver->name,
            'status'         => $driver->status,
            'status_label'   => Driver::$statuses[$driver->status]['label'] ?? $driver->status,
            'status_color'   => Driver::$statuses[$driver->status]['color'] ?? null,
            'phone'          => $driver->phone,
            'license_number' => $driver->license_number,
            'license_expiry' => $driver->license_expiry?->toDateString(),
            'license_days'   => $driver->license_days,
            'vehicle_plate'  => $driver->vehicle?->plate,
            'photo_url'      => $driver->photo_url,
        ];
    }
}
