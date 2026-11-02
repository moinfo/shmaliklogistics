<?php

use App\Models\Role;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /** Managing geofences and share links = fleet_tracking.edit; give it to roles that can edit vehicles. */
    public function up(): void
    {
        foreach (Role::all() as $role) {
            $perms = $role->permissions ?? [];

            if (in_array('*', $perms, true) || in_array('fleet_tracking.*', $perms, true) || in_array('fleet_tracking.edit', $perms, true)) {
                continue;
            }

            if (in_array('fleet.*', $perms, true) || in_array('fleet.edit', $perms, true)) {
                $perms[] = 'fleet_tracking.edit';
                $role->update(['permissions' => array_values($perms)]);
            }
        }
    }

    public function down(): void
    {
        foreach (Role::all() as $role) {
            $role->update(['permissions' => array_values(array_diff($role->permissions ?? [], ['fleet_tracking.edit']))]);
        }
    }
};
