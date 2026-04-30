<?php

namespace App\Http\Middleware;

use App\Models\Client;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePortalAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        $clientId = $request->session()->get('portal_client_id');

        if (! $clientId) {
            return redirect()->route('portal.login');
        }

        $client = Client::where('id', $clientId)->where('portal_active', true)->first();

        if (! $client) {
            $request->session()->forget('portal_client_id');
            return redirect()->route('portal.login');
        }

        $request->attributes->set('portal_client', $client);

        return $next($request);
    }
}
