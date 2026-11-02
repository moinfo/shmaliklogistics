<?php

namespace App\Http\Controllers\System;

use App\Http\Controllers\Controller;
use App\Models\GpsEvent;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TrackingAlertController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->only('type', 'vehicle_id', 'status');
        $status  = $filters['status'] ?? 'open';

        $events = GpsEvent::with('vehicle:id,plate', 'driver:id,name')
            ->when($filters['type'] ?? null, fn ($q, $t) => $q->where('type', $t))
            ->when($filters['vehicle_id'] ?? null, fn ($q, $v) => $q->where('vehicle_id', $v))
            ->when($status === 'open', fn ($q) => $q->whereNull('acknowledged_at'))
            ->latest('occurred_at')
            ->paginate(25)
            ->withQueryString()
            ->through(fn (GpsEvent $e) => [
                'id'           => $e->id,
                'type'         => $e->type,
                'label'        => GpsEvent::TYPES[$e->type][0] ?? $e->type,
                'icon'         => GpsEvent::TYPES[$e->type][1] ?? '📡',
                'severity'     => $e->severity,
                'message'      => $e->message,
                'plate'        => $e->vehicle?->plate,
                'vehicle_id'   => $e->vehicle_id,
                'driver'       => $e->driver?->name,
                'lat'          => $e->latitude,
                'lng'          => $e->longitude,
                'occurred_at'  => $e->occurred_at->toIso8601String(),
                'acknowledged' => $e->acknowledged_at !== null,
            ]);

        return Inertia::render('system/Fleet/TrackingAlerts', [
            'events'    => $events,
            'filters'   => ['type' => $filters['type'] ?? '', 'vehicle_id' => $filters['vehicle_id'] ?? '', 'status' => $status],
            'types'     => collect(GpsEvent::TYPES)->map(fn ($t, $k) => ['value' => $k, 'label' => $t[0]])->values(),
            'vehicles'  => Vehicle::orderBy('plate')->get(['id', 'plate']),
            'openCount' => GpsEvent::whereNull('acknowledged_at')->count(),
        ]);
    }

    public function acknowledge(Request $request, GpsEvent $event)
    {
        $event->update(['acknowledged_at' => now(), 'acknowledged_by' => $request->user()->id]);

        return back();
    }

    public function acknowledgeAll(Request $request)
    {
        GpsEvent::whereNull('acknowledged_at')->update(['acknowledged_at' => now(), 'acknowledged_by' => $request->user()->id]);

        return back()->with('success', 'All alerts acknowledged.');
    }
}
