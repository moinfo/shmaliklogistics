<?php

use App\Models\Role;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /** Roles that could already view the fleet get the new live-tracking view permission. */
    public function up(): void
    {
        foreach (Role::all() as $role) {
            $perms = $role->permissions ?? [];

            if (in_array('*', $perms, true) || in_array('fleet_tracking.view', $perms, true) || in_array('fleet_tracking.*', $perms, true)) {
                continue;
            }

            if (in_array('fleet.*', $perms, true) || in_array('fleet.view', $perms, true)) {
                $perms[] = 'fleet_tracking.view';
                $role->update(['permissions' => array_values($perms)]);
            }
        }
    }

    public function down(): void
    {
        foreach (Role::all() as $role) {
            $perms = array_values(array_diff($role->permissions ?? [], ['fleet_tracking.view']));
            $role->update(['permissions' => $perms]);
        }
    }
};
