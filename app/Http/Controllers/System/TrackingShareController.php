<?php

namespace App\Http\Controllers\System;

use App\Http\Controllers\Controller;
use App\Models\TrackingShare;
use App\Models\Vehicle;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/** Staff side of share links: create, list and revoke read-only public tracking links. */
class TrackingShareController extends Controller
{
    public function index(Vehicle $vehicle): JsonResponse
    {
        return response()->json(
            TrackingShare::active()->where('vehicle_id', $vehicle->id)->latest()->get()->map(fn ($s) => $this->present($s))
        );
    }

    public function store(Request $request, Vehicle $vehicle): JsonResponse
    {
        $data = $request->validate([
            'days'    => 'required|integer|min:1|max:30',
            'label'   => 'nullable|string|max:100',
            'trip_id' => 'nullable|exists:trips,id',
        ]);

        $share = TrackingShare::create([
            'vehicle_id' => $vehicle->id,
            'trip_id'    => $data['trip_id'] ?? null,
            'label'      => $data['label'] ?? null,
            'token'      => TrackingShare::newToken(),
            'expires_at' => now()->addDays($data['days']),
            'created_by' => $request->user()->id,
        ]);

        return response()->json($this->present($share), 201);
    }

    public function destroy(TrackingShare $share): JsonResponse
    {
        $share->update(['revoked_at' => now()]);

        return response()->json(['ok' => true]);
    }

    private function present(TrackingShare $s): array
    {
        return [
            'id'         => $s->id,
            'label'      => $s->label,
            'url'        => url("/track/{$s->token}"),
            'expires_at' => $s->expires_at->toIso8601String(),
            'trip_id'    => $s->trip_id,
        ];
    }
}
