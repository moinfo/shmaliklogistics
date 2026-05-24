<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
        ]);

        $middleware->alias([
            'permission' => \App\Http\Middleware\EnsurePermission::class,
            'driver'     => \App\Http\Middleware\EnsureDriver::class,
            'no.driver'  => \App\Http\Middleware\RedirectDrivers::class,
            'abilities'  => \Laravel\Sanctum\Http\Middleware\CheckAbilities::class,
            'ability'    => \Laravel\Sanctum\Http\Middleware\CheckForAnyAbility::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->renderable(function (\Symfony\Component\HttpKernel\Exception\HttpException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json(['message' => $e->getMessage() ?: \Symfony\Component\HttpFoundation\Response::$statusTexts[$e->getStatusCode()] ?? 'Error'], $e->getStatusCode());
            }
        });
    })->create();
