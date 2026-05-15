<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Administrator already has '*' — no change needed there.
        // Grant inspections + check-ins to Operations Manager.
        $this->addPermissions('operations-manager', ['inspections.view', 'trip_check_ins.view']);
    }

    public function down(): void
    {
        $this->removePermissions('operations-manager', ['inspections.view', 'trip_check_ins.view']);
    }

    private function addPermissions(string $roleSlug, array $perms): void
    {
        $role = DB::table('roles')->where('slug', $roleSlug)->first();
        if (! $role) return;

        $existing = json_decode($role->permissions ?? '[]', true) ?: [];
        $merged   = array_values(array_unique(array_merge($existing, $perms)));

        DB::table('roles')->where('id', $role->id)->update([
            'permissions' => json_encode($merged),
            'updated_at'  => now(),
        ]);
    }

    private function removePermissions(string $roleSlug, array $perms): void
    {
        $role = DB::table('roles')->where('slug', $roleSlug)->first();
        if (! $role) return;

        $existing = json_decode($role->permissions ?? '[]', true) ?: [];
        $remaining = array_values(array_diff($existing, $perms));

        DB::table('roles')->where('id', $role->id)->update([
            'permissions' => json_encode($remaining),
            'updated_at'  => now(),
        ]);
    }
};
