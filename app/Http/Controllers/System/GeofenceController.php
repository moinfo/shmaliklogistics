<?php

namespace App\Http\Controllers\System;

use App\Http\Controllers\Controller;
use App\Models\Geofence;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GeofenceController extends Controller
{
    public function index()
    {
        return Inertia::render('system/Fleet/Geofences', [
            'geofences' => Geofence::orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $geofence = Geofence::create($this->validated($request) + ['created_by' => $request->user()->id]);

        return back()->with('success', "Zone \"{$geofence->name}\" created.");
    }

    public function update(Request $request, Geofence $geofence)
    {
        $geofence->update($this->validated($request));

        return back()->with('success', "Zone \"{$geofence->name}\" updated.");
    }

    public function destroy(Geofence $geofence)
    {
        $name = $geofence->name;
        $geofence->delete();

        return back()->with('success', "Zone \"{$name}\" deleted.");
    }

    private function validated(Request $request): array
    {
        $data = $request->validate([
            'name'           => 'required|string|max:100',
            'center_lat'     => 'required|numeric|between:-90,90',
            'center_lng'     => 'required|numeric|between:-180,180',
            'radius_m'       => 'required|integer|min:30|max:100000',
            'color'          => ['required', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'alert_on_enter' => 'boolean',
            'alert_on_exit'  => 'boolean',
            'is_active'      => 'boolean',
        ]);

        return $data + ['alert_on_enter' => true, 'alert_on_exit' => true, 'is_active' => true];
    }
}
