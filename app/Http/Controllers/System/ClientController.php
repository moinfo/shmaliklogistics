<?php

namespace App\Http\Controllers\System;

use App\Http\Controllers\Controller;
use App\Models\Client;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClientController extends Controller
{
    public function index(Request $request)
    {
        $query = Client::query()->latest();

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                  ->orWhere('company_name', 'like', "%{$s}%")
                  ->orWhere('email', 'like', "%{$s}%")
                  ->orWhere('phone', 'like', "%{$s}%")
                  ->orWhere('tin_number', 'like', "%{$s}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $clients = $query->paginate(15)->withQueryString();

        $stats = [
            'total'    => Client::count(),
            'active'   => Client::where('status', 'active')->count(),
            'inactive' => Client::where('status', 'inactive')->count(),
        ];

        return Inertia::render('system/Clients/Index', [
            'clients'  => $clients,
            'stats'    => $stats,
            'statuses' => Client::$statuses,
            'filters'  => $request->only(['search', 'status']),
        ]);
    }

    public function create()
    {
        return Inertia::render('system/Clients/Create', [
            'statuses' => Client::$statuses,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'         => 'required|string|max:150',
            'company_name' => 'nullable|string|max:150',
            'email'        => 'nullable|email|max:150',
            'phone'        => 'nullable|string|max:30',
            'phone_alt'    => 'nullable|string|max:30',
            'address'      => 'nullable|string',
            'tin_number'   => 'nullable|string|max:50',
            'vrn_number'   => 'nullable|string|max:50',
            'status'       => 'required|in:active,inactive',
            'notes'        => 'nullable|string',
        ]);

        $data['created_by'] = $request->user()->id;
        $client = Client::create($data);

        return redirect()->route('system.clients.show', $client)
            ->with('success', "Client {$client->name} created.");
    }

    public function show(Client $client)
    {
        $client->load(['billingDocuments' => fn ($q) => $q->latest()->limit(10)]);

        $stats = [
            'quotes'    => $client->billingDocuments()->where('type', 'quote')->count(),
            'invoices'  => $client->billingDocuments()->where('type', 'invoice')->count(),
            'total_billed' => $client->billingDocuments()->where('type', 'invoice')->sum('total'),
        ];

        return Inertia::render('system/Clients/Show', [
            'client'   => $client,
            'stats'    => $stats,
            'statuses' => Client::$statuses,
        ]);
    }

    public function edit(Client $client)
    {
        return Inertia::render('system/Clients/Edit', [
            'client'   => $client,
            'statuses' => Client::$statuses,
        ]);
    }

    public function update(Request $request, Client $client)
    {
        $data = $request->validate([
            'name'         => 'required|string|max:150',
            'company_name' => 'nullable|string|max:150',
            'email'        => 'nullable|email|max:150',
            'phone'        => 'nullable|string|max:30',
            'phone_alt'    => 'nullable|string|max:30',
            'address'      => 'nullable|string',
            'tin_number'   => 'nullable|string|max:50',
            'vrn_number'   => 'nullable|string|max:50',
            'status'       => 'required|in:active,inactive',
            'notes'        => 'nullable|string',
        ]);

        $client->update($data);

        return redirect()->route('system.clients.show', $client)
            ->with('success', "Client updated.");
    }

    public function destroy(Client $client)
    {
        $client->delete();
        return redirect()->route('system.clients.index')->with('success', "Client deleted.");
    }
}
