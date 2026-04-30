<?php

namespace App\Http\Controllers\System;

use App\Http\Controllers\Controller;
use App\Models\Permit;
use App\Models\Trip;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PermitController extends Controller
{
    public function index(Request $request)
    {
        $query = Permit::with('trip')->latest();

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('vehicle_plate', 'like', "%{$s}%")
                  ->orWhere('permit_number', 'like', "%{$s}%")
                  ->orWhere('permit_type', 'like', "%{$s}%")
                  ->orWhere('issuing_country', 'like', "%{$s}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $permits = $query->paginate(15)->withQueryString();

        $stats = [
            'total'   => Permit::count(),
            'active'  => Permit::where('status', 'active')->count(),
            'expired' => Permit::where('status', 'expired')->count(),
            'expiring_soon' => Permit::where('status', 'active')
                ->whereNotNull('expiry_date')
                ->where('expiry_date', '<=', now()->addDays(14))
                ->count(),
        ];

        return Inertia::render('system/Permits/Index', [
            'permits'  => $permits,
            'stats'    => $stats,
            'statuses' => Permit::$statuses,
            'filters'  => $request->only(['search', 'status']),
        ]);
    }

    public function create(Request $request)
    {
        return Inertia::render('system/Permits/Create', [
            'statuses'   => Permit::$statuses,
            'types'      => Permit::$types,
            'currencies' => Permit::$currencies,
            'trips'      => Trip::latest()->get(['id', 'trip_number', 'route_from', 'route_to', 'vehicle_plate']),
            'vehicles'   => Vehicle::whereNotIn('status', ['retired'])->orderBy('plate')->get(['id', 'plate', 'make', 'model_name']),
            'prefillTripId' => $request->trip_id,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'trip_id'           => 'nullable|exists:trips,id',
            'vehicle_plate'     => 'required|string|max:20',
            'permit_type'       => 'required|string|max:100',
            'permit_number'     => 'nullable|string|max:100',
            'issuing_country'   => 'nullable|string|max:100',
            'issuing_authority' => 'nullable|string|max:100',
            'issue_date'        => 'nullable|date',
            'expiry_date'       => 'nullable|date|after_or_equal:issue_date',
            'cost'              => 'nullable|numeric|min:0',
            'currency'          => 'required|string|max:10',
            'status'            => 'required|in:' . implode(',', array_keys(Permit::$statuses)),
            'notes'             => 'nullable|string',
        ]);

        $data['created_by'] = $request->user()->id;
        $permit = Permit::create($data);

        return redirect()->route('system.permits.show', $permit)
            ->with('success', "Permit {$permit->permit_number} created.");
    }

    public function show(Permit $permit)
    {
        $permit->load('trip');

        return Inertia::render('system/Permits/Show', [
            'permit'   => $permit,
            'statuses' => Permit::$statuses,
        ]);
    }

    public function edit(Permit $permit)
    {
        return Inertia::render('system/Permits/Edit', [
            'permit'     => $permit,
            'statuses'   => Permit::$statuses,
            'types'      => Permit::$types,
            'currencies' => Permit::$currencies,
            'trips'      => Trip::latest()->get(['id', 'trip_number', 'route_from', 'route_to', 'vehicle_plate']),
            'vehicles'   => Vehicle::whereNotIn('status', ['retired'])->orderBy('plate')->get(['id', 'plate', 'make', 'model_name']),
        ]);
    }

    public function update(Request $request, Permit $permit)
    {
        $data = $request->validate([
            'trip_id'           => 'nullable|exists:trips,id',
            'vehicle_plate'     => 'required|string|max:20',
            'permit_type'       => 'required|string|max:100',
            'permit_number'     => 'nullable|string|max:100',
            'issuing_country'   => 'nullable|string|max:100',
            'issuing_authority' => 'nullable|string|max:100',
            'issue_date'        => 'nullable|date',
            'expiry_date'       => 'nullable|date|after_or_equal:issue_date',
            'cost'              => 'nullable|numeric|min:0',
            'currency'          => 'required|string|max:10',
            'status'            => 'required|in:' . implode(',', array_keys(Permit::$statuses)),
            'notes'             => 'nullable|string',
        ]);

        $permit->update($data);

        return redirect()->route('system.permits.show', $permit)
            ->with('success', "Permit updated.");
    }

    public function destroy(Permit $permit)
    {
        $permit->delete();
        return redirect()->route('system.permits.index')->with('success', "Permit deleted.");
    }
}
