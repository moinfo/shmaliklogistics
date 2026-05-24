<?php

namespace App\Http\Controllers\Api\Staff\Modules;

use App\Http\Controllers\Controller;
use App\Models\BillingDocument;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Staff mobile · Billing Proformas module (read-only).
 *
 * Mirrors the data/query of the web System\Billing\ProformaController but
 * returns flat JSON envelopes instead of Inertia pages. Proformas are
 * `billing_documents` rows of type `proforma`. Scope/auth is enforced by the
 * route `permission:` middleware — no re-checking here.
 */
class ProformaController extends Controller
{
    // GET /api/staff/modules/proformas — searchable, status-filterable list.
    public function index(Request $request): JsonResponse
    {
        $query = BillingDocument::with('client:id,name,company_name')
            ->where('type', 'proforma')
            ->latest();

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('document_number', 'like', "%{$s}%")
                  ->orWhereHas('client', fn ($cq) => $cq->where('name', 'like', "%{$s}%"));
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $proformas = $query->paginate(50)->withQueryString();

        $proformas->getCollection()->transform(fn (BillingDocument $d) => $this->summarize($d));

        return response()->json([
            'proformas' => $proformas,
            'statuses'  => BillingDocument::$proformaStatuses,
        ]);
    }

    // GET /api/staff/modules/proformas/{id} — single proforma with line items.
    public function show($id): JsonResponse
    {
        $proforma = BillingDocument::with(['client', 'trip:id,trip_number,route_from,route_to', 'items'])
            ->where('type', 'proforma')
            ->findOrFail($id);

        $data = $this->summarize($proforma) + [
            'client_company'   => $proforma->client?->company_name,
            'client_email'     => $proforma->client?->email,
            'client_phone'     => $proforma->client?->phone,
            'trip_id'          => $proforma->trip_id,
            'trip_number'      => $proforma->trip?->trip_number,
            'trip_route_from'  => $proforma->trip?->route_from,
            'trip_route_to'    => $proforma->trip?->route_to,
            'subtotal'         => (float) $proforma->subtotal,
            'discount_amount'  => (float) $proforma->discount_amount,
            'tax_rate'         => (float) $proforma->tax_rate,
            'tax_amount'       => (float) $proforma->tax_amount,
            'due_date'         => $proforma->due_date?->toDateString(),
            'notes'            => $proforma->notes,
            'terms_conditions' => $proforma->terms_conditions,
            'items'            => $proforma->items->map(fn ($i) => [
                'id'          => $i->id,
                'description' => $i->description,
                'quantity'    => (float) $i->quantity,
                'unit'        => $i->unit,
                'unit_price'  => (float) $i->unit_price,
                'total'       => (float) $i->total,
            ])->values(),
        ];

        return response()->json([
            'proforma' => $data,
        ]);
    }

    /**
     * Shared flat shape used by both list and detail responses.
     * Flattens the client name and money fields for the mobile client.
     */
    private function summarize(BillingDocument $d): array
    {
        $statuses = BillingDocument::$proformaStatuses;

        return [
            'id'              => $d->id,
            'document_number' => $d->document_number,
            'client_id'       => $d->client_id,
            'client_name'     => $d->client?->name,
            'currency'        => $d->currency,
            'total'           => (float) $d->total,
            'status'          => $d->status,
            'status_label'    => $statuses[$d->status]['label'] ?? $d->status,
            'status_color'    => $statuses[$d->status]['color'] ?? null,
            'issue_date'      => $d->issue_date?->toDateString(),
            'valid_until'     => $d->valid_until?->toDateString(),
            'created_at'      => $d->created_at?->toIso8601String(),
        ];
    }
}
