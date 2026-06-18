<?php

namespace App\Http\Controllers\System\Billing;

use App\Http\Controllers\Controller;
use App\Models\PortalQuoteRequest;
use App\Support\ReportExport;
use Illuminate\Http\Request;
use Inertia\Inertia;

class QuoteRequestController extends Controller
{
    public function export(Request $request)
    {
        $query = PortalQuoteRequest::with('client:id,name,phone,email')->latest();
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        $requests = $query->get();
        $statuses = PortalQuoteRequest::$statuses;

        $scope = $request->filled('status')
            ? 'Status: ' . ($statuses[$request->status]['label'] ?? $request->status)
            : 'All statuses';

        $report = [
            'title'    => 'Quote Requests',
            'subtitle' => $scope . ' · ' . $requests->count() . ' request(s)',
            'filename' => 'quote-requests-' . now()->format('Y-m-d'),
            'sections' => [
                [
                    'heading' => 'Quote Requests',
                    'columns' => [
                        ['label' => 'Submitted',    'key' => 'submitted', 'type' => 'text'],
                        ['label' => 'Client',       'key' => 'client',    'type' => 'text'],
                        ['label' => 'Phone',        'key' => 'phone',     'type' => 'text'],
                        ['label' => 'Route',        'key' => 'route',     'type' => 'text'],
                        ['label' => 'Cargo',        'key' => 'cargo',     'type' => 'text'],
                        ['label' => 'Weight (kg)',  'key' => 'weight',    'type' => 'int'],
                        ['label' => 'Volume (m³)',  'key' => 'volume',    'type' => 'tons'],
                        ['label' => 'Preferred',    'key' => 'preferred', 'type' => 'text'],
                        ['label' => 'Status',       'key' => 'status',    'type' => 'text'],
                    ],
                    'rows' => $requests->map(fn ($r) => [
                        'submitted' => $r->created_at?->format('d M Y'),
                        'client'    => $r->client?->name ?: '—',
                        'phone'     => $r->client?->phone ?: '—',
                        'route'     => trim(($r->route_from ?: '?') . ' → ' . ($r->route_to ?: '?')),
                        'cargo'     => $r->cargo_description ?: '—',
                        'weight'    => $r->cargo_weight_kg,
                        'volume'    => $r->cargo_volume_m3,
                        'preferred' => $r->preferred_date ? \Carbon\Carbon::parse($r->preferred_date)->format('d M Y') : '—',
                        'status'    => $statuses[$r->status]['label'] ?? $r->status,
                    ])->all(),
                ],
            ],
        ];

        return $request->get('format') === 'excel'
            ? ReportExport::xlsx($report)
            : ReportExport::pdf($report);
    }

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
