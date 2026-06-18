<?php

namespace App\Http\Controllers\System;

use App\Http\Controllers\Controller;
use App\Models\BonusPolicy;
use App\Models\Driver;
use App\Models\Employee;
use App\Models\Guarantor;
use App\Models\LicenseClass;
use App\Models\Role;
use App\Models\Trip;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class DriverController extends Controller
{
    public function index(Request $request)
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

        $drivers = $query->with('vehicle')->paginate(15)->withQueryString();

        $stats = [
            'total'            => Driver::count(),
            'active'           => Driver::whereIn('status', ['active', 'on_trip'])->count(),
            'on_trip'          => Driver::where('status', 'on_trip')->count(),
            'license_expiring' => Driver::whereNotNull('license_expiry')
                ->where('license_expiry', '<=', now()->addDays(30))
                ->count(),
        ];

        return Inertia::render('system/Drivers/Index', [
            'drivers'  => $drivers,
            'stats'    => $stats,
            'statuses' => Driver::$statuses,
            'filters'  => $request->only(['status', 'search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('system/Drivers/Create', [
            'statuses'       => Driver::$statuses,
            'licenseClasses' => self::licenseClassMap(),
        ]);
    }

    private static function licenseClassMap(): array
    {
        return LicenseClass::active()->orderBy('sort_order')->get()
            ->mapWithKeys(fn($c) => [$c->code => "{$c->name} ({$c->description})"])
            ->toArray();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'                    => 'required|string|max:100',
            'status'                  => 'required|in:' . implode(',', array_keys(Driver::$statuses)),
            'phone'                   => 'required|string|max:20',
            'phone_alt'               => 'nullable|string|max:20',
            'email'                   => 'nullable|email|max:100',
            'national_id'             => 'nullable|string|max:30|unique:drivers,national_id',
            'card_id'                 => 'nullable|string|max:30|unique:drivers,card_id',
            'address'                 => 'nullable|string|max:200',
            'birth_region'            => 'nullable|string|max:100',
            'birth_district'          => 'nullable|string|max:100',
            'license_number'          => 'nullable|string|max:40|unique:drivers,license_number',
            'license_classes'         => 'nullable|array',
            'license_classes.*'       => ['string', Rule::in(LicenseClass::active()->pluck('code'))],
            'license_expiry'          => 'nullable|date',
            'emergency_contact_name'  => 'nullable|string|max:100',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'notes'                   => 'nullable|string',
            'visa_expiry'             => 'nullable|date',
        ]);

        $data['created_by'] = $request->user()->id;
        $driver = Driver::create($data);

        return redirect()->route('system.drivers.show', $driver)
            ->with('success', "Driver {$driver->name} registered successfully.");
    }

    public function show(Driver $driver)
    {
        $driver->load(['vehicle', 'user:id,name,email,avatar,role_id', 'guarantors']);

        $trips = Trip::where('driver_name', $driver->name)
            ->latest('departure_date')
            ->limit(10)
            ->get();

        // Available vehicles for quick-assign (unassigned or already this driver's)
        $availableVehicles = Vehicle::where(function ($q) use ($driver) {
            $q->whereNull('driver_id')->orWhere('driver_id', $driver->id);
        })->orderBy('plate')->get(['id', 'plate', 'make', 'model_name', 'type']);

        // HR / payroll snapshot. Drivers and employees are separate records
        // matched on national_id (see DriverEmployeeSeeder).
        $hr = null;
        $employee = $driver->national_id
            ? Employee::where('national_id', $driver->national_id)->with(['advances', 'loans'])->first()
            : null;

        if ($employee) {
            // Effective monthly bonus: per-employee override, else department policy.
            $bonus = $employee->bonus !== null ? (float) $employee->bonus : 0.0;
            if ($employee->bonus === null && class_exists(BonusPolicy::class)) {
                $bonus = (float) (BonusPolicy::where('department', $employee->department)
                    ->where('is_active', true)->value('amount') ?? 0);
            }

            // Arrears = amounts the driver still owes the company.
            $advanceArrears = (float) $employee->advances->whereIn('status', ['pending', 'approved'])->sum('amount');
            $loanArrears    = (float) $employee->loans->where('status', 'active')->sum('balance_remaining');

            $hr = [
                'employee_id'     => $employee->id,
                'employee_number' => $employee->employee_number,
                'department'      => $employee->department,
                'position'        => $employee->position,
                'salary'          => (float) $employee->salary,
                'currency'        => $employee->salary_currency ?? 'TZS',
                'bonus'           => $bonus,
                'advance_arrears' => $advanceArrears,
                'loan_arrears'    => $loanArrears,
                'arrears_total'   => $advanceArrears + $loanArrears,
                'advances' => $employee->advances->whereIn('status', ['pending', 'approved'])
                    ->map(fn ($a) => ['amount' => (float) $a->amount, 'purpose' => $a->purpose, 'status' => $a->status])
                    ->values(),
                'loans' => $employee->loans->where('status', 'active')
                    ->map(fn ($l) => ['loan_number' => $l->loan_number, 'balance' => (float) $l->balance_remaining, 'installment' => (float) $l->monthly_installment])
                    ->values(),
            ];
        }

        return Inertia::render('system/Drivers/Show', [
            'driver'            => $driver,
            'trips'             => $trips,
            'hr'                => $hr,
            'guarantorSummary'  => $driver->guarantorsSummary(),
            'guarantorIdTypes'  => Guarantor::$idTypes,
            'guarantorMax'      => Guarantor::$maxPerDriver,
            'statuses'          => Driver::$statuses,
            'licenseClasses'    => self::licenseClassMap(),
            'vehicleStatuses'   => Vehicle::$statuses,
            'vehicleTypeIcons'  => Vehicle::$typeIcons,
            'availableVehicles' => $availableVehicles,
        ]);
    }

    public function createAccount(Request $request, Driver $driver)
    {
        if ($driver->user_id) {
            return back()->with('error', 'Driver already has a login account.');
        }

        $data = $request->validate([
            'email'    => ['required', 'email', Rule::unique('users', 'email')],
            'password' => ['required', 'string', 'min:8'],
        ]);

        $role = Role::where('slug', 'driver')->first();
        if (! $role) {
            return back()->with('error', 'The "driver" role does not exist. Create it under Settings → Roles first.');
        }

        $user = User::create([
            'name'     => $driver->name,
            'email'    => $data['email'],
            'password' => Hash::make($data['password']),
            'role_id'  => $role->id,
        ]);

        $driver->update(['user_id' => $user->id]);

        return back()->with('success', "Login account created for {$driver->name}.");
    }

    public function revokeAccount(Driver $driver)
    {
        if (! $driver->user_id) {
            return back()->with('error', 'Driver has no login account.');
        }

        $userId = $driver->user_id;
        $driver->update(['user_id' => null]);
        // Hard-delete the user — drivers without portal access shouldn't leave
        // dangling auth rows. Driver record itself is unaffected.
        User::where('id', $userId)->delete();

        return back()->with('success', 'Login access revoked.');
    }

    public function edit(Driver $driver)
    {
        return Inertia::render('system/Drivers/Edit', [
            'driver'         => $driver,
            'statuses'       => Driver::$statuses,
            'licenseClasses' => self::licenseClassMap(),
        ]);
    }

    public function update(Request $request, Driver $driver)
    {
        $data = $request->validate([
            'name'                    => 'required|string|max:100',
            'status'                  => 'required|in:' . implode(',', array_keys(Driver::$statuses)),
            'phone'                   => 'required|string|max:20',
            'phone_alt'               => 'nullable|string|max:20',
            'email'                   => 'nullable|email|max:100',
            'national_id'             => 'nullable|string|max:30|unique:drivers,national_id,' . $driver->id,
            'card_id'                 => 'nullable|string|max:30|unique:drivers,card_id,' . $driver->id,
            'address'                 => 'nullable|string|max:200',
            'birth_region'            => 'nullable|string|max:100',
            'birth_district'          => 'nullable|string|max:100',
            'license_number'          => 'nullable|string|max:40|unique:drivers,license_number,' . $driver->id,
            'license_classes'         => 'nullable|array',
            'license_classes.*'       => ['string', Rule::in(LicenseClass::active()->pluck('code'))],
            'license_expiry'          => 'nullable|date',
            'emergency_contact_name'  => 'nullable|string|max:100',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'notes'                   => 'nullable|string',
        ]);

        $driver->update($data);

        return redirect()->route('system.drivers.show', $driver)
            ->with('success', "Driver {$driver->name} updated.");
    }

    public function destroy(Driver $driver)
    {
        $driver->delete();

        return redirect()->route('system.drivers.index')
            ->with('success', "Driver {$driver->name} removed.");
    }

    public function updateStatus(Request $request, Driver $driver)
    {
        $request->validate([
            'status' => 'required|in:' . implode(',', array_keys(Driver::$statuses)),
        ]);

        $driver->update(['status' => $request->status]);

        return back()->with('success', 'Status updated.');
    }

    public function uploadPhoto(Request $request, Driver $driver)
    {
        $request->validate([
            'photo' => 'required|image|mimes:jpg,jpeg,png,webp|max:4096',
        ]);

        if ($driver->photo_path) {
            Storage::disk('public')->delete($driver->photo_path);
        }

        $path = $request->file('photo')->store("drivers/{$driver->id}", 'public');
        $driver->update(['photo_path' => $path]);

        return back()->with('success', 'Profile picture updated.');
    }

    public function uploadLicenseDoc(Request $request, Driver $driver)
    {
        $request->validate([
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:10240',
        ]);

        if ($driver->license_doc_path) {
            Storage::disk('public')->delete($driver->license_doc_path);
        }

        $path = $request->file('file')->store("drivers/{$driver->id}", 'public');
        $driver->update(['license_doc_path' => $path]);

        return back()->with('success', 'Licence document uploaded.');
    }

    public function uploadVisaDoc(Request $request, Driver $driver)
    {
        $request->validate([
            'file'        => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
            'visa_expiry' => 'nullable|date',
        ]);

        $updates = [];

        if ($request->hasFile('file')) {
            if ($driver->visa_doc_path) {
                Storage::disk('public')->delete($driver->visa_doc_path);
            }
            $updates['visa_doc_path'] = $request->file('file')->store("drivers/{$driver->id}", 'public');
        }

        if ($request->filled('visa_expiry')) {
            $updates['visa_expiry'] = $request->visa_expiry;
        }

        if ($updates) {
            $driver->update($updates);
        }

        return back()->with('success', 'Visa details saved.');
    }

    public function deleteDocument(Request $request, Driver $driver, string $type)
    {
        if ($type === 'license') {
            if ($driver->license_doc_path) {
                Storage::disk('public')->delete($driver->license_doc_path);
                $driver->update(['license_doc_path' => null]);
            }
        } elseif ($type === 'visa') {
            if ($driver->visa_doc_path) {
                Storage::disk('public')->delete($driver->visa_doc_path);
                $driver->update(['visa_doc_path' => null]);
            }
        }

        return back()->with('success', 'Document removed.');
    }

    public function assignVehicle(Request $request, Driver $driver)
    {
        $request->validate(['vehicle_id' => 'nullable|exists:vehicles,id']);

        // Unassign this driver from any vehicle they're currently on
        Vehicle::where('driver_id', $driver->id)->update(['driver_id' => null]);

        // Assign to the new vehicle (if provided)
        if ($request->vehicle_id) {
            // Also unassign whoever was previously on that vehicle
            Vehicle::where('id', $request->vehicle_id)->update(['driver_id' => $driver->id]);
        }

        $vehicle = $request->vehicle_id ? Vehicle::find($request->vehicle_id) : null;
        $msg = $vehicle
            ? "Assigned to {$vehicle->plate} successfully."
            : "Vehicle assignment removed.";

        return back()->with('success', $msg);
    }
}
