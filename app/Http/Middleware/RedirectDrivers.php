<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RedirectDrivers
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()?->role?->slug === 'driver') {
            return redirect()->route('driver.dashboard');
        }

        return $next($request);
    }
}
