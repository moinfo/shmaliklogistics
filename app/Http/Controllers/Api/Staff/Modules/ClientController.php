<?php

namespace App\Http\Controllers\Api\Staff\Modules;

use App\Http\Controllers\Controller;
use App\Models\Client;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/// Read-only Client endpoints for the staff mobile app.
///
/// Mirrors the data/query of App\Http\Controllers\System\ClientController but
/// returns flat JSON envelopes instead of Inertia pages. Auth + permission
/// scoping is handled by the route middleware (permission:clients.view).
/// Never exposes portal_password (it's $hidden on the model).
class ClientController extends Controller
{
    // GET /api/staff/modules/clients — searchable list, newest first.
    public function index(Request $request): JsonResponse
    {
        $query = Client::query()->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

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

        $clients = $query->get()->map(fn (Client $c) => $this->summarize($c));

        return response()->json([
            'clients'  => $clients,
            'statuses' => Client::$statuses,
        ]);
    }

    // GET /api/staff/modules/clients/{id} — single client with contact, tax and
    // a light billing summary.
    public function show($id): JsonResponse
    {
        $client = Client::findOrFail($id);

        $stats = [
            'quotes'       => $client->billingDocuments()->where('type', 'quote')->count(),
            'invoices'     => $client->billingDocuments()->where('type', 'invoice')->count(),
            'total_billed' => (float) $client->billingDocuments()->where('type', 'invoice')->sum('total'),
        ];

        $data = $this->summarize($client) + [
            'phone_alt'  => $client->phone_alt,
            'address'    => $client->address,
            'vrn_number' => $client->vrn_number,
            'notes'      => $client->notes,
            'created_at' => $client->created_at?->toDateString(),
            'stats'      => $stats,
        ];

        return response()->json([
            'client' => $data,
        ]);
    }

    // Shared flat shape used by both list and detail responses.
    private function summarize(Client $client): array
    {
        return [
            'id'           => $client->id,
            'name'         => $client->name,
            'company_name' => $client->company_name,
            'status'       => $client->status,
            'status_label' => Client::$statuses[$client->status]['label'] ?? $client->status,
            'status_color' => Client::$statuses[$client->status]['color'] ?? null,
            'email'        => $client->email,
            'phone'        => $client->phone,
            'tin_number'   => $client->tin_number,
        ];
    }
}
