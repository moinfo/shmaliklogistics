<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

return new class extends Migration
{
    public function up(): void
    {
        $driverRoleId = DB::table('roles')->where('slug', 'driver')->value('id');

        if (! $driverRoleId) {
            return;
        }

        $drivers = DB::table('drivers')
            ->whereNull('user_id')
            ->whereNull('deleted_at')
            ->get();

        foreach ($drivers as $driver) {
            $base  = strtolower(str_replace(' ', '.', $driver->name));
            $email = $base . '@shmalik.co.tz';

            $suffix = 1;
            while (DB::table('users')->where('email', $email)->exists()) {
                $email = $base . $suffix . '@shmalik.co.tz';
                $suffix++;
            }

            $userId = DB::table('users')->insertGetId([
                'name'       => $driver->name,
                'email'      => $email,
                'password'   => Hash::make('driver123'),
                'role_id'    => $driverRoleId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('drivers')->where('id', $driver->id)->update(['user_id' => $userId]);
        }
    }

    public function down(): void
    {
        $driverRoleId = DB::table('roles')->where('slug', 'driver')->value('id');

        $drivers = DB::table('drivers')->whereNotNull('user_id')->get();

        foreach ($drivers as $driver) {
            $user = DB::table('users')
                ->where('id', $driver->user_id)
                ->where('role_id', $driverRoleId)
                ->first();

            if ($user) {
                DB::table('users')->where('id', $user->id)->delete();
                DB::table('drivers')->where('id', $driver->id)->update(['user_id' => null]);
            }
        }
    }
};
