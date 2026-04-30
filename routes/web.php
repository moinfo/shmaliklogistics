<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\System\TripController;
use App\Http\Controllers\System\VehicleController;
use App\Http\Controllers\System\DriverController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

// ── Public website ──────────────────────────────────────────────────────────
Route::get('/', fn () => Inertia::render('website/Home'))->name('home');
Route::get('/services', fn () => Inertia::render('website/Services'))->name('services');
Route::get('/about', fn () => Inertia::render('website/About'))->name('about');
Route::get('/contact', fn () => Inertia::render('website/Contact'))->name('contact');

// ── Auth ────────────────────────────────────────────────────────────────────
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
});

Route::post('/logout', [AuthController::class, 'logout'])->name('logout')->middleware('auth');

// ── System (protected) ──────────────────────────────────────────────────────
Route::middleware('auth')->prefix('system')->name('system.')->group(function () {
    Route::get('/dashboard', fn () => Inertia::render('system/Dashboard'))->name('dashboard');

    // Trips
    Route::resource('trips', TripController::class);
    Route::patch('trips/{trip}/status', [TripController::class, 'updateStatus'])->name('trips.update-status');

    // Fleet
    Route::resource('fleet', VehicleController::class);
    Route::patch('fleet/{vehicle}/status', [VehicleController::class, 'updateStatus'])->name('fleet.update-status');

    // Drivers
    Route::resource('drivers', DriverController::class);
    Route::patch('drivers/{driver}/status', [DriverController::class, 'updateStatus'])->name('drivers.update-status');
});

// Redirect /dashboard → /system/dashboard for convenience
Route::get('/dashboard', fn () => redirect()->route('system.dashboard'))->middleware('auth')->name('dashboard');
