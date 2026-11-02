<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\GpsDevice;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class GpsDeviceController extends Controller
{
    public function index()
    {
        return Inertia::render('system/Settings/GpsDevices/Index', [
            'devices'  => GpsDevice::with('vehicle:id,plate,make,model_name')->orderBy('imei')->get(),
            'vehicles' => Vehicle::orderBy('plate')->get(['id', 'plate', 'make', 'model_name']),
            'port'     => 5027,
        ]);
    }

    public function store(Request $request)
    {
        $device = GpsDevice::create($this->validated($request));

        return back()->with('success', "Device {$device->imei} registered.");
    }

    public function update(Request $request, GpsDevice $gpsDevice)
    {
        $gpsDevice->update($this->validated($request, $gpsDevice));

        return back()->with('success', "Device {$gpsDevice->imei} updated.");
    }

    public function destroy(GpsDevice $gpsDevice)
    {
        $imei = $gpsDevice->imei;
        $gpsDevice->delete();

        return back()->with('success', "Device {$imei} removed.");
    }

    private function validated(Request $request, ?GpsDevice $device = null): array
    {
        $data = $request->validate([
            'imei'       => ['required', 'regex:/^\d{10,20}$/', Rule::unique('gps_devices', 'imei')->ignore($device)],
            'vehicle_id' => ['nullable', 'exists:vehicles,id', Rule::unique('gps_devices', 'vehicle_id')->ignore($device)],
            'provider'   => 'required|string|max:50',
            'model'      => 'nullable|string|max:50',
            'sim_number' => 'nullable|string|max:30',
            'is_active'  => 'boolean',
        ], [
            'imei.regex'        => 'The IMEI must be 10–20 digits (printed on the device label).',
            'vehicle_id.unique' => 'That vehicle already has a tracker linked.',
        ]);

        $data['is_active'] = $data['is_active'] ?? true;

        return $data;
    }
}
