<?php

namespace App\Http\Controllers\Api\Customer;

use App\Http\Controllers\Controller;
use App\Models\BillingDocument;
use App\Models\Cargo;
use App\Models\PortalQuoteRequest;
use App\Models\Trip;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PortalController extends Controller
{
    public function dashboard(Request $request): JsonResponse
    {
        $client = $request->user();

        $activeTrips = Trip::where('client_id', $client->id)
            ->whereIn('status', ['loading', 'in_transit', 'at_border'])
            ->with(['driver:id,name', 'vehicle:id,plate,make,model_name'])
            ->latest()
            ->get();

        $recentCargo = Cargo::where('client_id', $client->id)
            ->with(['trip:id,trip_number,route_from,route_to,status'])
            ->latest()
            ->limit(5)
            ->get();

        $recentInvoices = BillingDocument::where('client_id', $client->id)
            ->where('type', 'invoice')
            ->with(['items'])
            ->latest()
            ->limit(5)
            ->get()
            ->append(['amount_paid', 'balance_due']);

        return response()->json([
            'dashboard' => [
                'client' => [
                    'id'           => $client->id,
                    'name'         => $client->name,
                    'company_name' => $client->company_name,
                    'email'        => $client->email,
                ],
                'stats' => [
                    'active_trips'   => $activeTrips->count(),
                    'total_trips'    => Trip::where('client_id', $client->id)->count(),
                    'pending_amount' => BillingDocument::where('client_id', $client->id)
                        ->where('type', 'invoice')
                        ->where('status', '!=', 'paid')
                        ->sum('total'),
                    'paid_invoices'  => BillingDocument::where('client_id', $client->id)
                        ->where('type', 'invoice')
                        ->where('status', 'paid')
                        ->count(),
                ],
                'active_trips'    => $activeTrips,
                'recent_cargo'    => $recentCargo,
                'recent_invoices' => $recentInvoices,
                'trip_statuses'   => Trip::$statuses,
            ],
        ]);
    }

    public function trips(Request $request): JsonResponse
    {
        $client = $request->user();

        $query = Trip::where('client_id', $client->id)
            ->with(['driver:id,name', 'vehicle:id,plate,make,model_name'])
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $trips = $query->paginate(15)->withQueryString();

        // The Trip model exposes no cargo relationship, so attach this client's own
        // cargo count per trip (kept client-scoped) without touching shared models.
        if ($trips->isNotEmpty()) {
            $counts = Cargo::where('client_id', $client->id)
                ->whereIn('trip_id', $trips->getCollection()->pluck('id'))
                ->selectRaw('trip_id, COUNT(*) as aggregate')
                ->groupBy('trip_id')
                ->pluck('aggregate', 'trip_id');

            $trips->getCollection()->each(function ($trip) use ($counts) {
                $trip->setAttribute('cargo_count', (int) ($counts[$trip->id] ?? 0));
            });
        }

        return response()->json([
            'trips'         => $trips,
            'trip_statuses' => Trip::$statuses,
        ]);
    }

    public function tripShow(Request $request, Trip $trip): JsonResponse
    {
        $client = $request->user();
        abort_unless($trip->client_id === $client->id, 403);

        $trip->load(['driver:id,name', 'vehicle:id,plate,make,model_name,type', 'expenses']);

        // Cargo is scoped to this client's own records for this trip (the Trip model
        // exposes no cargo relationship, so query Cargo directly to stay client-scoped).
        $cargo = Cargo::where('trip_id', $trip->id)
            ->where('client_id', $client->id)
            ->get();

        return response()->json([
            'trip'          => $trip,
            'cargo'         => $cargo,
            'trip_statuses' => Trip::$statuses,
        ]);
    }

    public function invoices(Request $request): JsonResponse
    {
        $client = $request->user();

        $query = BillingDocument::where('client_id', $client->id)
            ->where('type', 'invoice')
            ->with(['items'])
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $invoices = $query->paginate(15)->withQueryString();
        $invoices->getCollection()->each->append(['amount_paid', 'balance_due']);

        $summary = [
            'total_billed' => BillingDocument::where('client_id', $client->id)->where('type', 'invoice')->sum('total'),
            'total_paid'   => BillingDocument::where('client_id', $client->id)->where('type', 'invoice')->where('status', 'paid')->sum('total'),
            'balance_due'  => BillingDocument::where('client_id', $client->id)->where('type', 'invoice')->whereIn('status', ['sent', 'overdue', 'partial'])->sum('total'),
        ];

        return response()->json([
            'invoices'         => $invoices,
            'summary'          => $summary,
            'invoice_statuses' => BillingDocument::$invoiceStatuses,
        ]);
    }

    public function invoiceShow(Request $request, BillingDocument $invoice): JsonResponse
    {
        $client = $request->user();
        abort_unless($invoice->client_id === $client->id && $invoice->type === 'invoice', 403);

        $invoice->load(['items', 'payments'])->append(['amount_paid', 'balance_due']);

        return response()->json([
            'invoice'          => $invoice,
            'invoice_statuses' => BillingDocument::$invoiceStatuses,
        ]);
    }

    public function cargo(Request $request): JsonResponse
    {
        $client = $request->user();

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

        $cargo = $query->paginate(12)->withQueryString();

        return response()->json([
            'cargo'           => $cargo,
            'cargo_statuses'  => Cargo::$statuses,
        ]);
    }

    public function quoteRequests(Request $request): JsonResponse
    {
        $client = $request->user();

        $requests = PortalQuoteRequest::where('client_id', $client->id)
            ->latest()
            ->get();

        return response()->json([
            'quote_requests'        => $requests,
            'quote_request_statuses' => PortalQuoteRequest::$statuses,
        ]);
    }

    public function storeQuoteRequest(Request $request): JsonResponse
    {
        $client = $request->user();

        $data = $request->validate([
            'route_from'        => 'required|string|max:150',
            'route_to'          => 'required|string|max:150',
            'cargo_description' => 'required|string|max:300',
            'cargo_weight_kg'   => 'nullable|numeric|min:0',
            'cargo_volume_m3'   => 'nullable|integer|min:0',
            'preferred_date'    => 'nullable|date|after:today',
            'notes'             => 'nullable|string',
        ]);

        $quoteRequest = PortalQuoteRequest::create(array_merge($data, ['client_id' => $client->id]));

        return response()->json([
            'message'       => 'Quote request submitted. Our team will contact you shortly.',
            'quote_request' => $quoteRequest,
        ], 201);
    }
}
