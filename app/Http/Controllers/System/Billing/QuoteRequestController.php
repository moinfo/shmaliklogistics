<?php

namespace App\Http\Controllers\System\Billing;

use App\Http\Controllers\Controller;
use App\Models\PortalQuoteRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class QuoteRequestController extends Controller
{
    public function index(Request $request)
    {
        $query = PortalQuoteRequest::with('client:id,name,phone,email')
            ->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $requests = $query->paginate(20)->withQueryString();

        return Inertia::render('system/Billing/QuoteRequests/Index', [
            'requests' => $requests,
            'statuses' => PortalQuoteRequest::$statuses,
            'filters'  => $request->only('status'),
            'pending'  => PortalQuoteRequest::where('status', 'pending')->count(),
        ]);
    }

    public function update(Request $request, PortalQuoteRequest $quoteRequest)
    {
        $data = $request->validate([
            'status'      => 'required|in:pending,reviewed,quoted,cancelled',
            'staff_notes' => 'nullable|string',
        ]);

        $quoteRequest->update(array_merge($data, ['reviewed_by' => auth()->id()]));

        return back()->with('success', 'Quote request updated.');
    }
}
