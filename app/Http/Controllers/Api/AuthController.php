<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Driver;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'login'    => ['required', 'string'],
            'password' => ['required'],
        ]);

        $login    = $request->input('login');
        $password = $request->input('password');

        // (1) email -> User, (2) card_id -> Driver -> User
        if (filter_var($login, FILTER_VALIDATE_EMAIL)) {
            $user = User::where('email', $login)->first();
        } else {
            $driver = Driver::where('card_id', $login)->first();
            $user   = $driver?->user;
        }

        if ($user && Hash::check($password, $user->password)) {
            return $user->role?->slug === 'driver'
                ? $this->driverResponse($user)
                : $this->staffResponse($user);
        }

        // (3) email -> active Client (customer portal user)
        if (filter_var($login, FILTER_VALIDATE_EMAIL)) {
            $client = Client::where('email', $login)
                ->where('portal_active', true)
                ->first();

            if ($client && Hash::check($password, $client->portal_password)) {
                return $this->customerResponse($client);
            }
        }

        return response()->json(['message' => 'Invalid credentials.'], 401);
    }

    private function staffResponse(User $user): JsonResponse
    {
        $permissions = $user->permissionsList();
        $abilities   = empty($permissions) ? ['*'] : $permissions;

        $token = $user->createToken('mobile-app', $abilities)->plainTextToken;

        return response()->json([
            'token'        => $token,
            'account_type' => 'staff',
            'user'         => $this->userBlock($user),
        ]);
    }

    private function driverResponse(User $user): JsonResponse
    {
        $driver = $user->driver?->load('vehicle:id,plate,make,model_name,type');

        if (! $driver) {
            return response()->json(['message' => 'No driver profile linked to this account.'], 403);
        }

        $token = $user->createToken('mobile-app', ['driver'])->plainTextToken;

        return response()->json([
            'token'        => $token,
            'account_type' => 'driver',
            'user'         => $this->userBlock($user),
            'driver'       => $driver,
        ]);
    }

    private function customerResponse(Client $client): JsonResponse
    {
        $client->update(['last_portal_login' => now()]);

        $token = $client->createToken('mobile-app', ['customer'])->plainTextToken;

        return response()->json([
            'token'        => $token,
            'account_type' => 'customer',
            'user'         => [
                'id'          => $client->id,
                'name'        => $client->name,
                'email'       => $client->email,
                'avatar_url'  => null,
                'role'        => 'customer',
                'permissions' => ['customer'],
            ],
            'client'       => [
                'id'           => $client->id,
                'name'         => $client->name,
                'company_name' => $client->company_name,
                'email'        => $client->email,
            ],
        ]);
    }

    private function userBlock(User $user): array
    {
        return [
            'id'          => $user->id,
            'name'        => $user->name,
            'email'       => $user->email,
            'avatar_url'  => $user->avatar_url,
            'role'        => $user->role?->slug,
            'permissions' => $user->permissionsList(),
        ];
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out.']);
    }
}