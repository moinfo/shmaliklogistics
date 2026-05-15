<?php

namespace App\Http\Controllers\Driver;

use App\Http\Controllers\Controller;
use App\Models\Trip;
use Illuminate\Http\Request;

class DriverTripExpenseController extends Controller
{
    public function update(Request $request, Trip $trip)
    {
        $driver = $request->user()->driver;
        abort_unless($trip->driver_id === $driver->id, 403, 'That trip is not assigned to you.');

        // Only allow updates while the trip is still active. Completed/cancelled
        // trips are locked — admin can still adjust from the system side.
        if (! in_array($trip->status, ['planned', 'loading', 'in_transit', 'at_border', 'delivered'])) {
            return back()->withErrors(['trip' => 'Trip imeshafungwa, huwezi kubadilisha tena.']);
        }

        $data = $request->validate([
            'road_fines'   => 'required|numeric|min:0',
            'guard_fees'   => 'required|numeric|min:0',
            'border_costs' => 'required|numeric|min:0',
            'notes'        => 'nullable|string|max:2000',
        ]);

        // Driver can only add to existing notes, not overwrite — append timestamp + driver line.
        if (!empty($data['notes'])) {
            $line = "[" . now()->format('Y-m-d H:i') . " — {$driver->name}] " . $data['notes'];
            $existing = trim($trip->notes ?? '');
            $trip->notes = $existing ? $existing . "\n" . $line : $line;
        }

        $trip->road_fines   = $data['road_fines'];
        $trip->guard_fees   = $data['guard_fees'];
        $trip->border_costs = $data['border_costs'];
        $trip->save();

        return redirect()->route('driver.trips.show', $trip)
            ->with('success', 'Expenses zimehifadhiwa.');
    }
}
