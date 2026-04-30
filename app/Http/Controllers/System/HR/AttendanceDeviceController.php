<?php

namespace App\Http\Controllers\System\HR;

use App\Http\Controllers\Controller;
use App\Models\AttendanceDevice;
use App\Models\AttendanceLog;
use App\Models\Employee;
use App\Services\ZKTecoService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AttendanceDeviceController extends Controller
{
    public function index()
    {
        return Inertia::render('system/HR/Attendance/Devices', [
            'devices' => AttendanceDevice::withCount('logs')->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'          => 'required|string|max:100',
            'ip_address'    => 'required|ip',
            'port'          => 'nullable|integer|min:1|max:65535',
            'serial_number' => 'nullable|string|max:50',
            'location'      => 'nullable|string|max:100',
            'model'         => 'nullable|string|max:50',
        ]);
        $data['port'] = $data['port'] ?? 4370;

        AttendanceDevice::create($data);

        return back()->with('success', 'Device registered.');
    }

    public function update(Request $request, AttendanceDevice $device)
    {
        $data = $request->validate([
            'name'          => 'required|string|max:100',
            'ip_address'    => 'required|ip',
            'port'          => 'nullable|integer|min:1|max:65535',
            'serial_number' => 'nullable|string|max:50',
            'location'      => 'nullable|string|max:100',
            'model'         => 'nullable|string|max:50',
            'is_active'     => 'boolean',
        ]);

        $device->update($data);

        return back()->with('success', 'Device updated.');
    }

    public function destroy(AttendanceDevice $device)
    {
        $device->delete();

        return back()->with('success', 'Device removed.');
    }

    /**
     * Pull attendance logs from the physical ZKTeco device.
     */
    public function sync(AttendanceDevice $device)
    {
        $zk = new ZKTecoService();

        if (! $zk->connect($device->ip_address, $device->port)) {
            return back()->withErrors(['error' => "Cannot connect to device at {$device->ip_address}:{$device->port}. Check the IP, port, and network."]);
        }

        $logs = $zk->getAttendanceLogs();
        $zk->disconnect();

        // Map device user_id → employee_id using device_user_id stored in employees or attendance_logs
        $employees = Employee::pluck('id', 'id'); // fallback: device uid = employee id
        $imported  = 0;

        foreach ($logs as $log) {
            // Try to find employee by device_user_id (stored on previous syncs)
            $employeeId = AttendanceLog::where('device_user_id', $log['device_user_id'])
                ->where('device_id', $device->id)
                ->value('employee_id');

            if (! $employeeId) {
                // Fallback: device_user_id matches employee id directly
                $employeeId = $employees->has((int) $log['device_user_id'])
                    ? (int) $log['device_user_id']
                    : null;
            }

            if (! $employeeId) continue;

            // Skip duplicates
            $exists = AttendanceLog::where('employee_id', $employeeId)
                ->where('device_id', $device->id)
                ->where('punch_time', $log['punch_time'])
                ->exists();

            if (! $exists) {
                AttendanceLog::create([
                    'employee_id'    => $employeeId,
                    'device_id'      => $device->id,
                    'punch_time'     => $log['punch_time'],
                    'punch_type'     => $log['punch_type'],
                    'verify_type'    => $log['verify_type'] ?? null,
                    'device_user_id' => $log['device_user_id'],
                    'source'         => 'device',
                ]);
                $imported++;
            }
        }

        $device->update([
            'last_sync_at'    => now(),
            'last_sync_count' => $imported,
        ]);

        return back()->with('success', "Sync complete — {$imported} new records imported.");
    }
}
