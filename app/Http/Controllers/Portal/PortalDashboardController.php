<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Models\BillingDocument;
use App\Models\CompanySetting;
use App\Models\Trip;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PortalDashboardController extends Controller
{
    public function __invoke(Request $request)
    {
        $client  = $request->attributes->get('portal_client');
        $company = CompanySetting::first();

        $activeTrips = Trip::where('client_id', $client->id)
            ->whereIn('status', ['loading', 'in_transit', 'at_border'])
            ->with(['driver', 'vehicle'])
            ->latest()
            ->get();

        $recentInvoices = BillingDocument::where('client_id', $client->id)
            ->where('type', 'invoice')
            ->with(['items'])
            ->latest()
            ->limit(5)
            ->get()
            ->append(['amount_paid', 'balance_due']);

        $stats = [
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
        ];

        return Inertia::render('portal/Dashboard', [
            'client'         => $client,
            'company'        => $company,
            'activeTrips'    => $activeTrips,
            'recentInvoices' => $recentInvoices,
            'stats'          => $stats,
        ]);
    }
}
