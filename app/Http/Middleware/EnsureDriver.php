<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureDriver
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || $user->role?->slug !== 'driver') {
            abort(403, 'This area is for driver accounts only.');
        }

        if (! $user->driver) {
            abort(403, 'No driver profile is linked to this account. Please contact dispatch.');
        }

        $request->attributes->set('driver', $user->driver);

        return $next($request);
    }
}
