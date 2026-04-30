<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Models\CompanySetting;
use App\Models\Trip;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PortalTripController extends Controller
{
    public function index(Request $request)
    {
        $client = $request->attributes->get('portal_client');

        $query = Trip::where('client_id', $client->id)
            ->with(['driver', 'vehicle', 'cargo'])
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $trips = $query->paginate(15)->withQueryString();

        return Inertia::render('portal/Trips/Index', [
            'client'   => $client,
            'trips'    => $trips,
            'statuses' => Trip::$statuses,
            'filters'  => $request->only(['status']),
        ]);
    }

    public function show(Request $request, Trip $trip)
    {
        $client = $request->attributes->get('portal_client');

        if ($trip->client_id !== $client->id) {
            abort(403);
        }

        $trip->load(['driver', 'vehicle', 'cargo', 'expenses', 'permits']);

        return Inertia::render('portal/Trips/Show', [
            'client'  => $client,
            'trip'    => $trip,
            'company' => CompanySetting::first(),
        ]);
    }
}
