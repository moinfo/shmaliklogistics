<?php

namespace App\Http\Controllers\System;

use App\Http\Controllers\Controller;
use App\Models\Driver;
use App\Models\Expense;
use App\Models\Trip;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TripController extends Controller
{
    public function index(Request $request)
    {
        $query = Trip::query()->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('trip_number', 'like', "%{$s}%")
                  ->orWhere('route_from', 'like', "%{$s}%")
                  ->orWhere('route_to', 'like', "%{$s}%")
                  ->orWhere('driver_name', 'like', "%{$s}%")
                  ->orWhere('vehicle_plate', 'like', "%{$s}%");
            });
        }

        $trips = $query->paginate(15)->withQueryString();

        // Append computed attributes for each trip
        $trips->getCollection()->transform(function (Trip $t) {
            $t->append(['total_costs', 'profit']);
            return $t;
        });

        // Summary stats
        $stats = [
            'total'      => Trip::count(),
            'active'     => Trip::whereIn('status', ['loading', 'in_transit', 'at_border'])->count(),
            'completed'  => Trip::where('status', 'completed')->count(),
            'cancelled'  => Trip::where('status', 'cancelled')->count(),
            'month_revenue' => Trip::whereMonth('departure_date', now()->month)
                ->whereYear('departure_date', now()->year)
                ->sum('freight_amount'),
        ];

        return Inertia::render('system/Trips/Index', [
            'trips'    => $trips,
            'stats'    => $stats,
            'statuses' => Trip::$statuses,
            'filters'  => $request->only(['status', 'search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('system/Trips/Create', [
            'statuses'   => Trip::$statuses,
            'nextNumber' => Trip::nextNumber(),
            'drivers'    => self::driverOptions(),
            'vehicles'   => self::vehicleOptions(),
        ]);
    }

    private static function driverOptions()
    {
        return Driver::whereIn('status', ['active', 'on_trip'])
            ->with('vehicle:id,plate,make,model_name')
            ->orderBy('name')
            ->get(['id', 'name', 'phone', 'status']);
    }

    private static function vehicleOptions()
    {
        return Vehicle::whereNotIn('status', ['maintenance', 'retired'])
            ->with('driver:id,name,phone')
            ->orderBy('plate')
            ->get(['id', 'plate', 'make', 'model_name', 'type', 'driver_id']);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'status'             => 'required|in:' . implode(',', array_keys(Trip::$statuses)),
            'route_from'         => 'required|string|max:100',
            'route_to'           => 'required|string|max:100',
            'departure_date'     => 'required|date',
            'arrival_date'       => 'nullable|date|after_or_equal:departure_date',
            'driver_name'        => 'required|string|max:100',
            'vehicle_plate'      => 'required|string|max:20',
            'cargo_description'  => 'nullable|string|max:200',
            'cargo_weight_tons'  => 'nullable|numeric|min:0',
            'freight_amount'     => 'required|numeric|min:0',
            'fuel_cost'          => 'required|numeric|min:0',
            'driver_allowance'   => 'required|numeric|min:0',
            'border_costs'       => 'required|numeric|min:0',
            'other_costs'        => 'required|numeric|min:0',
            'notes'              => 'nullable|string',
        ]);

        $data['trip_number'] = Trip::nextNumber();
        $data['created_by']  = $request->user()->id;

        $trip = Trip::create($data);

        return redirect()->route('system.trips.show', $trip)
            ->with('success', "Trip {$trip->trip_number} created successfully.");
    }

    public function show(Trip $trip)
    {
        $trip->append(['total_costs', 'profit']);

        $expenses = Expense::where('trip_id', $trip->id)
            ->orderBy('expense_date')
            ->get();

        return Inertia::render('system/Trips/Show', [
            'trip'              => $trip,
            'statuses'          => Trip::$statuses,
            'expenses'          => $expenses,
            'expenseCategories' => Expense::$categories,
        ]);
    }

    public function edit(Trip $trip)
    {
        return Inertia::render('system/Trips/Edit', [
            'trip'     => $trip,
            'statuses' => Trip::$statuses,
            'drivers'  => self::driverOptions(),
            'vehicles' => self::vehicleOptions(),
        ]);
    }

    public function update(Request $request, Trip $trip)
    {
        $data = $request->validate([
            'status'             => 'required|in:' . implode(',', array_keys(Trip::$statuses)),
            'route_from'         => 'required|string|max:100',
            'route_to'           => 'required|string|max:100',
            'departure_date'     => 'required|date',
            'arrival_date'       => 'nullable|date|after_or_equal:departure_date',
            'driver_name'        => 'required|string|max:100',
            'vehicle_plate'      => 'required|string|max:20',
            'cargo_description'  => 'nullable|string|max:200',
            'cargo_weight_tons'  => 'nullable|numeric|min:0',
            'freight_amount'     => 'required|numeric|min:0',
            'fuel_cost'          => 'required|numeric|min:0',
            'driver_allowance'   => 'required|numeric|min:0',
            'border_costs'       => 'required|numeric|min:0',
            'other_costs'        => 'required|numeric|min:0',
            'notes'              => 'nullable|string',
        ]);

        $trip->update($data);

        return redirect()->route('system.trips.show', $trip)
            ->with('success', "Trip {$trip->trip_number} updated successfully.");
    }

    public function destroy(Trip $trip)
    {
        $trip->delete();

        return redirect()->route('system.trips.index')
            ->with('success', "Trip {$trip->trip_number} deleted.");
    }

    public function updateStatus(Request $request, Trip $trip)
    {
        $request->validate([
            'status' => 'required|in:' . implode(',', array_keys(Trip::$statuses)),
        ]);

        $trip->update(['status' => $request->status]);

        return back()->with('success', 'Status updated.');
    }
}
