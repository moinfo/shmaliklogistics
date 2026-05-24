<?php

namespace App\Http\Controllers\Api\Staff\Modules;

use App\Http\Controllers\Controller;
use App\Models\BillingDocument;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Staff mobile · Billing Quotes module (read-only).
 *
 * Mirrors the data/query of the web System\Billing\QuoteController — billing
 * documents of type `quote`. Scope/auth is enforced by the route `permission:`
 * middleware — no re-checking here.
 */
class QuoteController extends Controller
{
    // GET /api/staff/modules/quotes — searchable, status-filterable list.
    public function index(Request $request): JsonResponse
    {
        $query = BillingDocument::with('client:id,name,company_name')
            ->where('type', 'quote')
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

        $quotes = $query->paginate(50)->withQueryString();

        $quotes->getCollection()->transform(fn (BillingDocument $q) => $this->transform($q));

        return response()->json([
            'quotes' => $quotes,
        ]);
    }

    // GET /api/staff/modules/quotes/{id} — single quote with line items.
    public function show($id): JsonResponse
    {
        $quote = BillingDocument::with(['client', 'trip:id,trip_number,route_from,route_to', 'items'])
            ->where('type', 'quote')
            ->findOrFail($id);

        return response()->json([
            'quote' => $this->transform($quote, withItems: true),
        ]);
    }

    /**
     * Flatten a billing-document quote (+ related client/trip names) for the
     * mobile client. Line items are included when [$withItems] is true.
     */
    private function transform(BillingDocument $q, bool $withItems = false): array
    {
        $data = [
            'id'               => $q->id,
            'document_number'  => $q->document_number,
            'client_id'        => $q->client_id,
            'client_name'      => $q->client?->name,
            'client_company'   => $q->client?->company_name,
            'trip_id'          => $q->trip_id,
            'status'           => $q->status,
            'currency'         => $q->currency,
            'subtotal'         => (float) $q->subtotal,
            'discount_amount'  => (float) $q->discount_amount,
            'tax_rate'         => (float) $q->tax_rate,
            'tax_amount'       => (float) $q->tax_amount,
            'total'            => (float) $q->total,
            'issue_date'       => $q->issue_date?->toDateString(),
            'due_date'         => $q->due_date?->toDateString(),
            'valid_until'      => $q->valid_until?->toDateString(),
            'notes'            => $q->notes,
            'terms_conditions' => $q->terms_conditions,
            'created_at'       => $q->created_at?->toIso8601String(),
        ];

        if ($withItems) {
            $data['client_email'] = $q->client?->email;
            $data['client_phone'] = $q->client?->phone;
            $data['trip_number']  = $q->trip?->trip_number;
            $data['trip_route_from'] = $q->trip?->route_from;
            $data['trip_route_to']   = $q->trip?->route_to;
            $data['items'] = $q->items->map(fn ($item) => [
                'id'          => $item->id,
                'description' => $item->description,
                'quantity'    => (float) $item->quantity,
                'unit'        => $item->unit,
                'unit_price'  => (float) $item->unit_price,
                'total'       => (float) $item->total,
            ])->all();
        }

        return $data;
    }
}
