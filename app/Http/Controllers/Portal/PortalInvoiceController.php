<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Models\BillingDocument;
use App\Models\CompanySetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PortalInvoiceController extends Controller
{
    public function index(Request $request)
    {
        $client = $request->attributes->get('portal_client');

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
            'total_billed'  => BillingDocument::where('client_id', $client->id)->where('type', 'invoice')->sum('total'),
            'total_paid'    => BillingDocument::where('client_id', $client->id)->where('type', 'invoice')->where('status', 'paid')->sum('total'),
            'balance_due'   => BillingDocument::where('client_id', $client->id)->where('type', 'invoice')->whereIn('status', ['sent', 'overdue', 'partial'])->sum('total'),
        ];

        return Inertia::render('portal/Invoices/Index', [
            'client'   => $client,
            'invoices' => $invoices,
            'summary'  => $summary,
            'filters'  => $request->only(['status']),
        ]);
    }

    public function show(Request $request, BillingDocument $invoice)
    {
        $client = $request->attributes->get('portal_client');

        if ($invoice->client_id !== $client->id || $invoice->type !== 'invoice') {
            abort(403);
        }

        $invoice->load(['items', 'payments'])->append(['amount_paid', 'balance_due']);

        return Inertia::render('portal/Invoices/Show', [
            'client'  => $client,
            'invoice' => $invoice,
            'company' => CompanySetting::first(),
        ]);
    }
}
