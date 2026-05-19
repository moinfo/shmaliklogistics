<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Driver\DashboardController;
use App\Http\Controllers\Api\Driver\TripController;
use App\Http\Controllers\Api\Driver\CheckInController;
use App\Http\Controllers\Api\Driver\ExpenseController;
use App\Http\Controllers\Api\Driver\InspectionController;
use App\Http\Controllers\Api\Driver\ProfileController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::prefix('driver')->group(function () {
        Route::get('/dashboard', DashboardController::class);
        Route::get('/trips', [TripController::class, 'index']);
        Route::get('/trips/{trip}', [TripController::class, 'show']);
        Route::post('/trips/{trip}/check-ins', [CheckInController::class, 'store']);
        Route::get('/check-ins', [CheckInController::class, 'index']);
        Route::patch('/trips/{trip}/expenses', [ExpenseController::class, 'update']);
        Route::post('/trips/{trip}/expenses/receipt', [ExpenseController::class, 'uploadReceipt']);
        Route::get('/inspections', [InspectionController::class, 'index']);
        Route::post('/inspections', [InspectionController::class, 'store']);
        Route::get('/profile', [ProfileController::class, 'show']);
        Route::post('/profile/change-password', [ProfileController::class, 'changePassword']);
    });
});
