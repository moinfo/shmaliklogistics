<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Driver;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'login'    => ['required', 'string'],
            'password' => ['required'],
        ]);

        $login = $request->input('login');

        // Resolve the user — either by email or by driver card_id
        if (filter_var($login, FILTER_VALIDATE_EMAIL)) {
            $user = User::where('email', $login)->first();
        } else {
            $driver = Driver::where('card_id', $login)->first();
            $user = $driver?->user;
        }

        if (! $user || ! Hash::check($request->input('password'), $user->password)) {
            return response()->json(['message' => 'Invalid credentials.'], 401);
        }

        Auth::login($user);

        if ($user->role?->slug !== 'driver') {
            Auth::logout();
            return response()->json(['message' => 'Access restricted to drivers.'], 403);
        }

        $driver = $user->driver?->load('vehicle:id,plate,make,model_name,type');

        if (! $driver) {
            Auth::logout();
            return response()->json(['message' => 'No driver profile linked to this account.'], 403);
        }

        $token = $user->createToken('mobile-app', ['driver'])->plainTextToken;

        return response()->json([
            'token'  => $token,
            'user'   => [
                'id'         => $user->id,
                'name'       => $user->name,
                'email'      => $user->email,
                'avatar_url' => $user->avatar_url,
            ],
            'driver' => $driver,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out.']);
    }
}