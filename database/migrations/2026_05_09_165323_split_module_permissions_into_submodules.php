<?php

use App\Models\Role;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration {
    public function up(): void
    {
        $expansions = [
            // Old key (with .* wildcard or specific .action) → list of new sub-module keys
            'procurement' => ['procurement_suppliers', 'procurement_orders'],
            'billing'     => ['billing_quotes', 'billing_proformas', 'billing_invoices', 'billing_payments', 'billing_quote_requests'],
            'reports'     => ['reports_route_profitability', 'reports_financial_summary', 'reports_fleet_utilization'],
        ];

        // Fleet keeps `fleet` for vehicles, gains `fleet_fuel_logs`
        $fleetSubmodules = ['fleet_fuel_logs'];

        foreach (Role::all() as $role) {
            $perms = $role->permissions ?? [];
            if (in_array('*', $perms, true)) continue;

            $expanded = [];
            foreach ($perms as $perm) {
                if (! str_contains($perm, '.')) { $expanded[] = $perm; continue; }
                [$mod, $action] = explode('.', $perm, 2);

                if (isset($expansions[$mod])) {
                    foreach ($expansions[$mod] as $newMod) {
                        $expanded[] = "{$newMod}.{$action}";
                    }
                    // drop the old generic key
                    continue;
                }

                $expanded[] = $perm;

                // Fleet: if user had fleet.*, also grant fleet_fuel_logs.* (vehicles can use fuel logs)
                if ($mod === 'fleet') {
                    foreach ($fleetSubmodules as $subMod) {
                        $expanded[] = "{$subMod}.{$action}";
                    }
                }
            }

            $role->permissions = array_values(array_unique($expanded));
            $role->save();
        }
    }

    public function down(): void
    {
        $reverse = [
            'procurement_suppliers'       => 'procurement',
            'procurement_orders'          => 'procurement',
            'billing_quotes'              => 'billing',
            'billing_proformas'           => 'billing',
            'billing_invoices'            => 'billing',
            'billing_payments'            => 'billing',
            'billing_quote_requests'      => 'billing',
            'reports_route_profitability' => 'reports',
            'reports_financial_summary'   => 'reports',
            'reports_fleet_utilization'   => 'reports',
            'fleet_fuel_logs'             => 'fleet',
        ];

        foreach (Role::all() as $role) {
            $perms = $role->permissions ?? [];
            if (in_array('*', $perms, true)) continue;

            $collapsed = [];
            foreach ($perms as $perm) {
                if (! str_contains($perm, '.')) { $collapsed[] = $perm; continue; }
                [$mod, $action] = explode('.', $perm, 2);
                if (isset($reverse[$mod])) {
                    $collapsed[] = "{$reverse[$mod]}.{$action}";
                    continue;
                }
                $collapsed[] = $perm;
            }
            $role->permissions = array_values(array_unique($collapsed));
            $role->save();
        }
    }
};
