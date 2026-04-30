<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class PortalAuthController extends Controller
{
    public function showLogin()
    {
        if (session('portal_client_id')) {
            return redirect()->route('portal.dashboard');
        }
        return Inertia::render('portal/Login');
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $client = Client::where('email', $data['email'])
            ->where('portal_active', true)
            ->first();

        if (! $client || ! Hash::check($data['password'], $client->portal_password)) {
            return back()->withErrors(['email' => 'Invalid credentials or portal access not enabled.']);
        }

        $request->session()->put('portal_client_id', $client->id);
        $client->update(['last_portal_login' => now()]);

        return redirect()->route('portal.dashboard');
    }

    public function logout(Request $request)
    {
        $request->session()->forget('portal_client_id');
        return redirect()->route('portal.login');
    }
}
