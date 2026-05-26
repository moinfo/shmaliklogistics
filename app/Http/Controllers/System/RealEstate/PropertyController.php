<?php

namespace App\Http\Controllers\System\RealEstate;

use App\Http\Controllers\Controller;
use App\Models\Lease;
use App\Models\Property;
use App\Models\PropertyExpense;
use App\Models\PropertyUnit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PropertyController extends Controller
{
    /** Supported currencies across the real-estate module (TZS default). */
    public static array $currencies = ['TZS', 'USD', 'KES', 'ZMW', 'MWK', 'MZN'];

    public function index(Request $request)
    {
        $query = Property::query()->latest();

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                  ->orWhere('code', 'like', "%{$s}%")
                  ->orWhere('address', 'like', "%{$s}%");
            });
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $query->withCount([
            'units',
            'units as occupied_units_count' => function ($q) {
                $q->where('status', 'occupied');
            },
        ]);

        $properties = $query->paginate(15)->withQueryString();

        // Monthly rent roll per property = sum of active-lease rent on its units.
        $properties->getCollection()->transform(function (Property $property) {
            $property->monthly_rent_roll = (float) Lease::where('status', 'active')
                ->whereHas('unit', fn ($q) => $q->where('property_id', $property->id))
                ->sum('rent_amount');

            return $property;
        });

        $monthlyRoll = (float) Lease::where('status', 'active')->sum('rent_amount');

        $stats = [
            'total'            => Property::count(),
            'occupied'         => Property::whereIn('status', ['occupied', 'partially_occupied'])->count(),
            'under_renovation' => Property::where('status', 'under_renovation')->count(),
            'monthly_roll'     => $monthlyRoll,
        ];

        return Inertia::render('system/RealEstate/Properties/Index', [
            'properties' => $properties,
            'stats'      => $stats,
            'types'      => Property::$types,
            'statuses'   => Property::$statuses,
            'filters'    => $request->only(['search', 'status', 'type']),
        ]);
    }

    public function create()
    {
        return Inertia::render('system/RealEstate/Properties/Create', [
            'types'      => Property::$types,
            'statuses'   => Property::$statuses,
            'ownerships' => Property::$ownerships,
            'currencies' => self::$currencies,
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validateProperty($request);

        $data['code']       = Property::nextNumber();
        $data['created_by'] = $request->user()->id;

        $property = Property::create($data);

        return redirect()->route('system.real-estate.properties.show', $property)
            ->with('success', "Property {$property->name} created successfully.");
    }

    public function show(Property $property)
    {
        $property->loadCount([
            'units',
            'units as occupied_units_count' => function ($q) {
                $q->where('status', 'occupied');
            },
        ]);

        $units = $property->units()
            ->with(['activeLease' => function ($q) {
                $q->with('tenant:id,name');
            }])
            ->orderBy('unit_number')
            ->get()
            ->map(function (PropertyUnit $unit) {
                $lease = $unit->activeLease;

                return [
                    'id'            => $unit->id,
                    'unit_number'   => $unit->unit_number,
                    'type'          => $unit->type,
                    'status'        => $unit->status,
                    'rent_amount'   => (float) $unit->rent_amount,
                    'rent_currency' => $unit->rent_currency,
                    'bedrooms'      => $unit->bedrooms,
                    'bathrooms'     => $unit->bathrooms,
                    'size_sqm'      => $unit->size_sqm !== null ? (float) $unit->size_sqm : null,
                    'active_lease'  => $lease ? [
                        'id'           => $lease->id,
                        'lease_number' => $lease->lease_number,
                        'tenant_name'  => $lease->tenant?->name,
                        'rent_amount'  => (float) $lease->rent_amount,
                        'start_date'   => $lease->start_date?->toDateString(),
                        'end_date'     => $lease->end_date?->toDateString(),
                    ] : null,
                ];
            })
            ->values();

        $expenses = $property->expenses()
            ->with('unit:id,unit_number')
            ->latest('expense_date')
            ->limit(10)
            ->get();

        $expenseTotal = (float) $property->expenses()->sum('amount_tzs');

        $renovationTotal = (float) $property->expenses()
            ->where('category', 'renovation')
            ->sum('amount_tzs');

        // Active leases summary across this property's units.
        $leases = Lease::where('status', 'active')
            ->whereHas('unit', fn ($q) => $q->where('property_id', $property->id))
            ->with(['unit:id,unit_number', 'tenant:id,name'])
            ->get()
            ->map(fn (Lease $lease) => [
                'id'           => $lease->id,
                'lease_number' => $lease->lease_number,
                'unit_number'  => $lease->unit?->unit_number,
                'tenant_name'  => $lease->tenant?->name,
                'rent_amount'  => (float) $lease->rent_amount,
                'rent_currency'=> $lease->rent_currency,
                'start_date'   => $lease->start_date?->toDateString(),
                'end_date'     => $lease->end_date?->toDateString(),
            ])
            ->values();

        $annualRentRoll = (float) Lease::where('status', 'active')
            ->whereHas('unit', fn ($q) => $q->where('property_id', $property->id))
            ->sum('rent_amount');

        $financials = [
            'purchase_price'   => (float) $property->purchase_price,
            'renovation_total' => $renovationTotal,
            'total_invested'   => $property->total_invested,
            'annual_rent_roll' => $annualRentRoll,
            'expense_total'    => $expenseTotal,
        ];

        return Inertia::render('system/RealEstate/Properties/Show', [
            'property'           => $property,
            'units'              => $units,
            'expenses'           => $expenses,
            'expenseTotal'       => $expenseTotal,
            'leases'             => $leases,
            'financials'         => $financials,
            'types'              => Property::$types,
            'statuses'           => Property::$statuses,
            'unitTypes'          => PropertyUnit::$types,
            'unitStatuses'       => PropertyUnit::$statuses,
            'expenseCategories'  => PropertyExpense::$categories,
            'currencies'         => self::$currencies,
        ]);
    }

    public function edit(Property $property)
    {
        return Inertia::render('system/RealEstate/Properties/Edit', [
            'property'   => $property,
            'types'      => Property::$types,
            'statuses'   => Property::$statuses,
            'ownerships' => Property::$ownerships,
            'currencies' => self::$currencies,
        ]);
    }

    public function update(Request $request, Property $property)
    {
        $data = $this->validateProperty($request);

        $property->update($data);

        return redirect()->route('system.real-estate.properties.show', $property)
            ->with('success', "Property {$property->name} updated.");
    }

    public function destroy(Property $property)
    {
        $property->delete();

        return redirect()->route('system.real-estate.properties.index')
            ->with('success', "Property {$property->name} removed.");
    }

    public function uploadTitleDeed(Request $request, Property $property)
    {
        $request->validate([
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:10240',
        ]);

        if ($property->title_deed_path) {
            Storage::disk('public')->delete($property->title_deed_path);
        }

        $path = $request->file('file')->store("properties/{$property->id}", 'public');
        $property->update(['title_deed_path' => $path]);

        return back()->with('success', 'Title deed uploaded.');
    }

    public function updateStatus(Request $request, Property $property)
    {
        $request->validate([
            'status' => 'required|in:' . implode(',', array_keys(Property::$statuses)),
        ]);

        $property->update(['status' => $request->status]);

        return back()->with('success', 'Status updated.');
    }

    private function validateProperty(Request $request): array
    {
        return $request->validate([
            'name'              => 'required|string|max:150',
            'type'              => 'required|in:' . implode(',', array_keys(Property::$types)),
            'status'            => 'required|in:' . implode(',', array_keys(Property::$statuses)),
            'ownership'         => 'required|in:' . implode(',', array_keys(Property::$ownerships)),
            'address'           => 'nullable|string|max:200',
            'region'            => 'nullable|string|max:100',
            'district'          => 'nullable|string|max:100',
            'acquisition_date'  => 'nullable|date',
            'purchase_price'    => 'nullable|numeric|min:0',
            'purchase_currency' => 'nullable|in:' . implode(',', self::$currencies),
            'market_value'      => 'nullable|numeric|min:0',
            'title_deed_number' => 'nullable|string|max:80',
            'description'       => 'nullable|string',
            'notes'             => 'nullable|string',
        ]);
    }
}