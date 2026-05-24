<?php

namespace App\Http\Controllers\Api\Staff;

use App\Http\Controllers\Controller;
use App\Models\BillingDocument;
use App\Models\Driver;
use App\Models\Employee;
use App\Models\EmployeeAdvance;
use App\Models\EmployeeLoan;
use App\Models\LeaveRequest;
use App\Models\Permit;
use App\Models\Trip;
use App\Models\Vehicle;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OverviewController extends Controller
{
    // GET /api/staff/dashboard — cross-module summary. Only sections the user is
    // permitted to see are included; the rest are omitted entirely.
    public function index(Request $request): JsonResponse
    {
        $user    = $request->user();
        $payload = [];

        // ----- Ops -----
        if ($user->hasPermission('trips.view') || $user->hasPermission('fleet.view') || $user->hasPermission('drivers.view')) {
            $soon = now()->addDays(30);

            $alertsCount = Driver::where(function ($q) use ($soon) {
                    $q->where('license_expiry', '<=', $soon)->orWhere('visa_expiry', '<=', $soon);
                })->count()
                + Vehicle::where(function ($q) use ($soon) {
                    $q->where('insurance_expiry', '<=', $soon)
                      ->orWhere('road_licence_expiry', '<=', $soon)
                      ->orWhere('fitness_expiry', '<=', $soon)
                      ->orWhere('tra_sticker_expiry', '<=', $soon)
                      ->orWhere('goods_vehicle_licence_expiry', '<=', $soon);
                })->count()
                + Permit::whereNotNull('expiry_date')
                    ->where('expiry_date', '<=', $soon)
                    ->whereIn('status', ['pending', 'active'])
                    ->count();

            $payload['ops'] = [
                'active_trips' => Trip::whereIn('status', ['planned', 'loading', 'in_transit', 'at_border'])->count(),
                'fleet_count'  => Vehicle::count(),
                'drivers_count' => Driver::count(),
                'alerts_count' => $alertsCount,
            ];
        }

        // ----- Finance -----
        if ($user->hasPermission('billing_invoices.view') || $user->hasPermission('billing_payments.view')) {
            $payload['finance'] = [
                'invoices_count'    => BillingDocument::where('type', 'invoice')->count(),
                'outstanding_count' => BillingDocument::where('type', 'invoice')
                    ->whereIn('status', ['sent', 'partial', 'overdue'])->count(),
                'overdue_count'     => BillingDocument::where('type', 'invoice')
                    ->where('status', 'overdue')->count(),
            ];
        }

        // ----- HR -----
        if ($user->hasPermission('hr_employees.view')
            || $user->hasPermission('hr_leave.view')
            || $user->hasPermission('hr_advances.view')
            || $user->hasPermission('hr_loans.view')) {

            $pendingApprovals = LeaveRequest::where('status', 'pending')->count()
                + EmployeeAdvance::where('status', 'pending')->count()
                + EmployeeLoan::where('status', 'pending')->count();

            $payload['hr'] = [
                'employees_count'   => Employee::count(),
                'pending_approvals' => $pendingApprovals,
                'pending_leave'     => LeaveRequest::where('status', 'pending')->count(),
            ];
        }

        return response()->json($payload);
    }
}
