<?php

namespace App\Http\Controllers;

use App\Models\CompanySetting;
use App\Models\TrackingShare;
use App\Models\VehicleLocation;
use App\Services\FleetPositionService;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;

/**
 * Public, login-free tracking page reached through an unguessable share link.
 * It deliberately exposes only the plate, position, last-update time and a short recent trail —
 * never the driver, speed or any history beyond a few hours.
 */
class PublicTrackingController extends Controller
{
    private const TRAIL_HOURS = 3;
    private const TRAIL_POINTS = 300;

    public function show(string $token)
    {
        $share = $this->resolve($token);

        return Inertia::render('track/Public', [
            'token'   => $token,
            'company' => CompanySetting::get()->company_name,
            'initial' => $this->payload($share),
        ]);
    }

    public function position(string $token): JsonResponse
    {
        return response()->json($this->payload($this->resolve($token)));
    }

    private function resolve(string $token): TrackingShare
    {
        $share = TrackingShare::with('vehicle:id,plate', 'trip:id,route_from,route_to,trip_number')
            ->where('token', $token)
            ->first();

        abort_unless($share && $share->isActive(), 404);

        return $share;
    }

    private function payload(TrackingShare $share): array
    {
        $now = app(FleetPositionService::class)->all([$share->vehicle_id])[0] ?? null;

        $trail = VehicleLocation::where('vehicle_id', $share->vehicle_id)
            ->where('recorded_at', '>=', now()->subHours(self::TRAIL_HOURS))
            ->orderBy('recorded_at')
            ->get(['latitude', 'longitude'])
            ->map(fn ($l) => [round((float) $l->latitude, 5), round((float) $l->longitude, 5)]);

        $step = max(1, (int) ceil($trail->count() / self::TRAIL_POINTS));

        return [
            'plate'      => $share->vehicle->plate,
            'label'      => $share->label,
            'trip'       => $share->trip ? ['from' => $share->trip->route_from, 'to' => $share->trip->route_to, 'number' => $share->trip->trip_number] : null,
            'expires_at' => $share->expires_at->toIso8601String(),
            'position'   => $now ? [
                'lat'       => $now['lat'],
                'lng'       => $now['lng'],
                'state'     => $now['state'],
                'last_seen' => $now['last_seen'],
                'location'  => $now['location'],
                'road'      => $now['road'],
                'area'      => $now['area'],
            ] : null,
            'trail'      => $trail->filter(fn ($_, $i) => $i % $step === 0)->values(),
        ];
    }
}
