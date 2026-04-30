<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Models\PortalQuoteRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;

class PortalQuoteController extends Controller
{
    public function index(Request $request)
    {
        $client   = Session::get('portal_client');
        $requests = PortalQuoteRequest::where('client_id', $client['id'])
            ->latest()
            ->get();

        return Inertia::render('portal/QuoteRequests/Index', [
            'quoteRequests' => $requests,
            'client'        => $client,
            'statuses'      => PortalQuoteRequest::$statuses,
        ]);
    }

    public function create()
    {
        return Inertia::render('portal/QuoteRequests/Create', [
            'client' => Session::get('portal_client'),
        ]);
    }

    public function store(Request $request)
    {
        $client = Session::get('portal_client');

        $data = $request->validate([
            'route_from'        => 'required|string|max:150',
            'route_to'          => 'required|string|max:150',
            'cargo_description' => 'required|string|max:300',
            'cargo_weight_kg'   => 'nullable|numeric|min:0',
            'cargo_volume_m3'   => 'nullable|integer|min:0',
            'preferred_date'    => 'nullable|date|after:today',
            'notes'             => 'nullable|string',
        ]);

        PortalQuoteRequest::create(array_merge($data, ['client_id' => $client['id']]));

        return redirect()->route('portal.quote-requests.index')
            ->with('success', 'Quote request submitted. Our team will contact you shortly.');
    }
}
