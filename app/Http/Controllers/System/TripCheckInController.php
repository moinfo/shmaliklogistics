<?php

namespace App\Http\Controllers\System;

use App\Http\Controllers\Controller;
use App\Models\Driver;
use App\Models\TripCheckIn;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TripCheckInController extends Controller
{
    public function index(Request $request)
    {
        $query = TripCheckIn::with([
                'trip:id,trip_number,route_from,route_to,status',
                'driver:id,name,phone',
                'vehicle:id,plate',
            ])
            ->latest('checked_in_at');

        if ($request->filled('driver_id')) {
            $query->where('driver_id', $request->driver_id);
        }
        if ($request->filled('trip_id')) {
            $query->where('trip_id', $request->trip_id);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $checkIns = $query->paginate(30)->withQueryString();

        $stats = [
            'today'      => TripCheckIn::whereDate('checked_in_at', today())->count(),
            'issues'     => TripCheckIn::where('status', 'issue')->count(),
            'emergency'  => TripCheckIn::where('status', 'emergency')->count(),
            'total'      => TripCheckIn::count(),
        ];

        return Inertia::render('system/CheckIns/Index', [
            'checkIns' => $checkIns,
            'stats'    => $stats,
            'drivers'  => Driver::orderBy('name')->get(['id', 'name']),
            'statuses' => TripCheckIn::$statuses,
            'filters'  => $request->only(['driver_id', 'trip_id', 'status']),
        ]);
    }
}
