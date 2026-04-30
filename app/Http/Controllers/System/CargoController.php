<?php

namespace App\Http\Controllers\System;

use App\Http\Controllers\Controller;
use App\Models\Cargo;
use App\Models\Client;
use App\Models\Trip;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CargoController extends Controller
{
    public function index(Request $request)
    {
        $query = Cargo::with(['trip:id,trip_number', 'client:id,name,company_name'])->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('cargo_number', 'like', "%{$s}%")
                  ->orWhere('description', 'like', "%{$s}%")
                  ->orWhere('consignee_name', 'like', "%{$s}%")
                  ->orWhere('origin', 'like', "%{$s}%")
                  ->orWhere('destination', 'like', "%{$s}%");
            });
        }

        $cargos = $query->paginate(15)->withQueryString();

        $stats = [
            'total'      => Cargo::count(),
            'in_transit' => Cargo::where('status', 'in_transit')->count(),
            'at_border'  => Cargo::where('status', 'at_border')->count(),
            'delivered'  => Cargo::where('status', 'delivered')->count(),
            'total_kg'   => (float) Cargo::whereNotIn('status', ['cancelled'])->sum('weight_kg'),
        ];

        return Inertia::render('system/Cargo/Index', [
            'cargos'   => $cargos,
            'stats'    => $stats,
            'statuses' => Cargo::$statuses,
            'types'    => Cargo::$types,
            'filters'  => $request->only(['status', 'search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('system/Cargo/Create', [
            'trips'    => Trip::whereIn('status', ['planned', 'loading', 'in_transit', 'at_border'])
                ->orderByDesc('id')->get(['id', 'trip_number', 'route_from', 'route_to']),
            'clients'  => Client::where('status', 'active')->orderBy('name')->get(['id', 'name', 'company_name']),
            'statuses' => Cargo::$statuses,
            'types'    => Cargo::$types,
            'nextNumber' => Cargo::nextNumber(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'cargo_number'         => 'required|string|max:30|unique:cargos',
            'trip_id'              => 'nullable|exists:trips,id',
            'client_id'            => 'nullable|exists:clients,id',
            'description'          => 'required|string|max:500',
            'type'                 => 'required|in:' . implode(',', array_keys(Cargo::$types)),
            'weight_kg'            => 'required|numeric|min:0',
            'volume_m3'            => 'nullable|numeric|min:0',
            'pieces'               => 'required|integer|min:1',
            'packing_type'         => 'nullable|string|max:50',
            'origin'               => 'nullable|string|max:200',
            'destination'          => 'nullable|string|max:200',
            'consignee_name'       => 'nullable|string|max:200',
            'consignee_contact'    => 'nullable|string|max:100',
            'status'               => 'required|in:' . implode(',', array_keys(Cargo::$statuses)),
            'declared_value'       => 'nullable|numeric|min:0',
            'currency'             => 'required|string|max:10',
            'special_instructions' => 'nullable|string|max:1000',
            'notes'                => 'nullable|string|max:1000',
        ]);

        $data['created_by'] = auth()->id();

        Cargo::create($data);

        return redirect('/system/cargo')->with('success', "Cargo {$data['cargo_number']} registered successfully.");
    }

    public function show(Cargo $cargo)
    {
        $cargo->load(['trip:id,trip_number,route_from,route_to,status,driver_name,vehicle_plate', 'client:id,name,company_name,phone,email']);

        return Inertia::render('system/Cargo/Show', [
            'cargo'    => $cargo,
            'statuses' => Cargo::$statuses,
            'types'    => Cargo::$types,
        ]);
    }

    public function edit(Cargo $cargo)
    {
        return Inertia::render('system/Cargo/Edit', [
            'cargo'    => $cargo,
            'trips'    => Trip::whereIn('status', ['planned', 'loading', 'in_transit', 'at_border'])
                ->orderByDesc('id')->get(['id', 'trip_number', 'route_from', 'route_to']),
            'clients'  => Client::where('status', 'active')->orderBy('name')->get(['id', 'name', 'company_name']),
            'statuses' => Cargo::$statuses,
            'types'    => Cargo::$types,
        ]);
    }

    public function update(Request $request, Cargo $cargo)
    {
        $data = $request->validate([
            'cargo_number'         => "required|string|max:30|unique:cargos,cargo_number,{$cargo->id}",
            'trip_id'              => 'nullable|exists:trips,id',
            'client_id'            => 'nullable|exists:clients,id',
            'description'          => 'required|string|max:500',
            'type'                 => 'required|in:' . implode(',', array_keys(Cargo::$types)),
            'weight_kg'            => 'required|numeric|min:0',
            'volume_m3'            => 'nullable|numeric|min:0',
            'pieces'               => 'required|integer|min:1',
            'packing_type'         => 'nullable|string|max:50',
            'origin'               => 'nullable|string|max:200',
            'destination'          => 'nullable|string|max:200',
            'consignee_name'       => 'nullable|string|max:200',
            'consignee_contact'    => 'nullable|string|max:100',
            'status'               => 'required|in:' . implode(',', array_keys(Cargo::$statuses)),
            'declared_value'       => 'nullable|numeric|min:0',
            'currency'             => 'required|string|max:10',
            'special_instructions' => 'nullable|string|max:1000',
            'notes'                => 'nullable|string|max:1000',
        ]);

        $cargo->update($data);

        return redirect("/system/cargo/{$cargo->id}")->with('success', 'Cargo updated successfully.');
    }

    public function destroy(Cargo $cargo)
    {
        $cargo->delete();
        return redirect('/system/cargo')->with('success', 'Cargo record deleted.');
    }

    public function updateStatus(Request $request, Cargo $cargo)
    {
        $request->validate(['status' => 'required|in:' . implode(',', array_keys(Cargo::$statuses))]);
        $cargo->update(['status' => $request->status]);
        return back()->with('success', 'Cargo status updated.');
    }
}
