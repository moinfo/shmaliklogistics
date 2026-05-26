<?php

namespace App\Http\Controllers\System\RealEstate;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TenantController extends Controller
{
    public function index(Request $request)
    {
        $query = Tenant::query()->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                  ->orWhere('code', 'like', "%{$s}%")
                  ->orWhere('phone', 'like', "%{$s}%")
                  ->orWhere('email', 'like', "%{$s}%")
                  ->orWhere('national_id', 'like', "%{$s}%");
            });
        }

        $tenants = $query
            ->withCount(['leases as active_leases_count' => function ($q) {
                $q->where('status', 'active');
            }])
            ->paginate(15)
            ->withQueryString();

        $stats = [
            'total'     => Tenant::count(),
            'active'    => Tenant::where('status', 'active')->count(),
            'companies' => Tenant::where('type', 'company')->count(),
        ];

        return Inertia::render('system/RealEstate/Tenants/Index', [
            'tenants'  => $tenants,
            'stats'    => $stats,
            'types'    => Tenant::$types,
            'statuses' => Tenant::$statuses,
            'filters'  => $request->only(['search', 'status', 'type']),
        ]);
    }

    public function create()
    {
        return Inertia::render('system/RealEstate/Tenants/Create', [
            'types'    => Tenant::$types,
            'statuses' => Tenant::$statuses,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'                    => 'required|string|max:120',
            'type'                    => 'required|in:' . implode(',', array_keys(Tenant::$types)),
            'phone'                   => 'required|string|max:20',
            'phone_alt'               => 'nullable|string|max:20',
            'email'                   => 'nullable|email|max:100',
            'national_id'             => 'nullable|string|max:30',
            'company_name'            => 'nullable|required_if:type,company|string|max:150',
            'tin'                     => 'nullable|string|max:30',
            'address'                 => 'nullable|string|max:200',
            'emergency_contact_name'  => 'nullable|string|max:100',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'status'                  => 'required|in:' . implode(',', array_keys(Tenant::$statuses)),
            'notes'                   => 'nullable|string',
        ]);

        $data['code']       = Tenant::nextNumber();
        $data['created_by'] = $request->user()->id;

        $tenant = Tenant::create($data);

        return redirect()->route('system.real-estate.tenants.show', $tenant)
            ->with('success', "Tenant {$tenant->name} registered successfully.");
    }

    public function show(Tenant $tenant)
    {
        $leases = $tenant->leases()
            ->with(['unit:id,property_id,unit_number', 'unit.property:id,name'])
            ->latest('start_date')
            ->get()
            ->map(function ($lease) {
                $propertyName = $lease->unit?->property?->name;
                $unitNumber   = $lease->unit?->unit_number;
                $label = trim(implode(' — ', array_filter([$propertyName, $unitNumber])));

                return [
                    'id'            => $lease->id,
                    'lease_number'  => $lease->lease_number,
                    'property_label' => $label,
                    'unit_number'   => $unitNumber,
                    'property_name' => $propertyName,
                    'rent_amount'   => $lease->rent_amount,
                    'rent_currency' => $lease->rent_currency,
                    'status'        => $lease->status,
                    'start_date'    => $lease->start_date,
                    'end_date'      => $lease->end_date,
                ];
            });

        return Inertia::render('system/RealEstate/Tenants/Show', [
            'tenant'   => $tenant,
            'leases'   => $leases,
            'statuses' => Tenant::$statuses,
            'types'    => Tenant::$types,
        ]);
    }

    public function edit(Tenant $tenant)
    {
        return Inertia::render('system/RealEstate/Tenants/Edit', [
            'tenant'   => $tenant,
            'types'    => Tenant::$types,
            'statuses' => Tenant::$statuses,
        ]);
    }

    public function update(Request $request, Tenant $tenant)
    {
        $data = $request->validate([
            'name'                    => 'required|string|max:120',
            'type'                    => 'required|in:' . implode(',', array_keys(Tenant::$types)),
            'phone'                   => 'required|string|max:20',
            'phone_alt'               => 'nullable|string|max:20',
            'email'                   => 'nullable|email|max:100',
            'national_id'             => 'nullable|string|max:30',
            'company_name'            => 'nullable|required_if:type,company|string|max:150',
            'tin'                     => 'nullable|string|max:30',
            'address'                 => 'nullable|string|max:200',
            'emergency_contact_name'  => 'nullable|string|max:100',
            'emergency_contact_phone' => 'nullable|string|max:20',
            'status'                  => 'required|in:' . implode(',', array_keys(Tenant::$statuses)),
            'notes'                   => 'nullable|string',
        ]);

        $tenant->update($data);

        return redirect()->route('system.real-estate.tenants.show', $tenant)
            ->with('success', "Tenant {$tenant->name} updated.");
    }

    public function destroy(Tenant $tenant)
    {
        $tenant->delete();

        return redirect()->route('system.real-estate.tenants.index')
            ->with('success', "Tenant {$tenant->name} removed.");
    }
}