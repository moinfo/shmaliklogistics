<?php

namespace App\Http\Controllers\Api\Staff\Modules;

use App\Http\Controllers\Controller;
use App\Models\Permit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Staff mobile · Permits module (read-only).
 *
 * Mirrors the data/query of the web System\PermitController. Scope/auth is
 * enforced by the route `permission:` middleware — no re-checking here.
 */
class PermitController extends Controller
{
    // GET /api/staff/modules/permits — searchable, status-filterable list.
    public function index(Request $request): JsonResponse
    {
        $query = Permit::with('trip:id,trip_number,route_from,route_to')->latest();

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

        $permits = $query->paginate(50)->withQueryString();

        $permits->getCollection()->transform(fn (Permit $p) => $this->transform($p));

        return response()->json([
            'permits' => $permits,
        ]);
    }

    // GET /api/staff/modules/permits/{id} — single permit with trip context.
    public function show($id): JsonResponse
    {
        $permit = Permit::with('trip:id,trip_number,route_from,route_to')->findOrFail($id);

        return response()->json([
            'permit' => $this->transform($permit),
        ]);
    }

    /**
     * Flatten a permit (+ related trip names) for the mobile client.
     */
    private function transform(Permit $p): array
    {
        return [
            'id'                => $p->id,
            'trip_id'           => $p->trip_id,
            'trip_number'       => $p->trip?->trip_number,
            'trip_route_from'   => $p->trip?->route_from,
            'trip_route_to'     => $p->trip?->route_to,
            'vehicle_plate'     => $p->vehicle_plate,
            'permit_type'       => $p->permit_type,
            'permit_number'     => $p->permit_number,
            'issuing_country'   => $p->issuing_country,
            'issuing_authority' => $p->issuing_authority,
            'issue_date'        => $p->issue_date?->toDateString(),
            'expiry_date'       => $p->expiry_date?->toDateString(),
            'days_until_expiry' => $p->days_until_expiry,
            'cost'              => $p->cost !== null ? (float) $p->cost : null,
            'currency'          => $p->currency,
            'status'            => $p->status,
            'notes'             => $p->notes,
            'created_at'        => $p->created_at?->toIso8601String(),
        ];
    }
}
