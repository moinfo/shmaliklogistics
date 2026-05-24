<?php

namespace App\Http\Controllers\Api\Staff\Modules;

use App\Http\Controllers\Controller;
use App\Models\PortalQuoteRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Staff mobile · Quote Requests module (read-only).
 *
 * Mirrors the data/query of the web System\Billing\QuoteRequestController.
 * Quote requests are leads submitted by clients through the customer portal.
 * Scope/auth is enforced by the route `permission:` middleware — no
 * re-checking here.
 */
class QuoteRequestController extends Controller
{
    // GET /api/staff/modules/quote-requests — status-filterable list, newest first.
    public function index(Request $request): JsonResponse
    {
        $query = PortalQuoteRequest::with('client:id,name,company_name,phone,email')
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('route_from', 'like', "%{$s}%")
                  ->orWhere('route_to', 'like', "%{$s}%")
                  ->orWhere('cargo_description', 'like', "%{$s}%")
                  ->orWhereHas('client', fn ($c) => $c->where('name', 'like', "%{$s}%")
                      ->orWhere('company_name', 'like', "%{$s}%"));
            });
        }

        $requests = $query->paginate(50)->withQueryString();

        $requests->getCollection()->transform(fn (PortalQuoteRequest $r) => $this->transform($r));

        return response()->json([
            'quote_requests' => $requests,
            'statuses'       => PortalQuoteRequest::$statuses,
        ]);
    }

    // GET /api/staff/modules/quote-requests/{id} — single request with reviewer + staff notes.
    public function show($id): JsonResponse
    {
        $request = PortalQuoteRequest::with([
            'client:id,name,company_name,phone,email',
            'reviewer:id,name',
        ])->findOrFail($id);

        return response()->json([
            'quote_request' => $this->transform($request),
        ]);
    }

    /**
     * Flatten a quote request (+ client/reviewer names) for the mobile client.
     */
    private function transform(PortalQuoteRequest $r): array
    {
        return [
            'id'                => $r->id,
            'client_id'         => $r->client_id,
            'client_name'       => $r->client?->name,
            'client_company'    => $r->client?->company_name,
            'client_phone'      => $r->client?->phone,
            'client_email'      => $r->client?->email,
            'route_from'        => $r->route_from,
            'route_to'          => $r->route_to,
            'cargo_description' => $r->cargo_description,
            'cargo_weight_kg'   => $r->cargo_weight_kg !== null ? (float) $r->cargo_weight_kg : null,
            'cargo_volume_m3'   => $r->cargo_volume_m3,
            'preferred_date'    => $r->preferred_date?->toDateString(),
            'notes'             => $r->notes,
            'status'            => $r->status,
            'status_label'      => PortalQuoteRequest::$statuses[$r->status]['label'] ?? $r->status,
            'status_color'      => PortalQuoteRequest::$statuses[$r->status]['color'] ?? null,
            'reviewed_by'       => $r->reviewed_by,
            'reviewer_name'     => $r->reviewer?->name,
            'staff_notes'       => $r->staff_notes,
            'created_at'        => $r->created_at?->toIso8601String(),
            'updated_at'        => $r->updated_at?->toIso8601String(),
        ];
    }
}
