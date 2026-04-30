<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Models\Cargo;
use App\Models\CargoStatusLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PortalCargoController extends Controller
{
    public function index(Request $request)
    {
        $client = $request->attributes->get('portal_client');

        $query = Cargo::where('client_id', $client->id)
            ->with(['trip:id,trip_number,route_from,route_to,status'])
            ->latest();

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('cargo_number', 'like', "%{$s}%")
                  ->orWhere('description', 'like', "%{$s}%")
                  ->orWhere('origin', 'like', "%{$s}%")
                  ->orWhere('destination', 'like', "%{$s}%");
            });
        }

        $cargos = $query->paginate(12)->withQueryString();

        return Inertia::render('portal/Cargo/Index', [
            'cargos'   => $cargos,
            'statuses' => Cargo::$statuses,
            'filters'  => $request->only(['search']),
        ]);
    }

    public function show(Request $request, Cargo $cargo)
    {
        $client = $request->attributes->get('portal_client');

        // Only show cargo belonging to this client
        if ($cargo->client_id !== $client->id) {
            abort(403);
        }

        $cargo->load(['trip:id,trip_number,route_from,route_to,status,driver_name,vehicle_plate', 'client:id,name,company_name']);
        $logs = CargoStatusLog::where('cargo_id', $cargo->id)->latest()->get(['status', 'location', 'notes', 'created_at']);

        return Inertia::render('portal/Cargo/Show', [
            'cargo'    => $cargo,
            'logs'     => $logs,
            'statuses' => Cargo::$statuses,
        ]);
    }
}
