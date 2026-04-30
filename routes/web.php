<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\System\DashboardController;
use App\Http\Controllers\System\TripController;
use App\Http\Controllers\System\VehicleController;
use App\Http\Controllers\System\DriverController;
use App\Http\Controllers\System\ClientController;
use App\Http\Controllers\System\PermitController;
use App\Http\Controllers\System\Billing\QuoteController;
use App\Http\Controllers\System\Billing\ProformaController;
use App\Http\Controllers\System\Billing\InvoiceController;
use App\Http\Controllers\System\Billing\PaymentController;
use App\Http\Controllers\System\ExpenseController;
use App\Http\Controllers\System\MaintenanceController;
use App\Http\Controllers\System\DocumentController;
use App\Http\Controllers\System\RouteProfitabilityController;
use App\Http\Controllers\System\FinancialSummaryController;
use App\Http\Controllers\System\FleetUtilizationController;
use App\Http\Controllers\System\HR\EmployeeController;
use App\Http\Controllers\System\HR\LeaveController;
use App\Http\Controllers\System\HR\PayrollController;
use App\Http\Controllers\System\HR\AdvanceController;
use App\Http\Controllers\System\HR\LoanController;
use App\Http\Controllers\Settings\PayrollSettingsController;
use App\Http\Controllers\Settings\LicenseClassController;
use App\Http\Controllers\Settings\VehicleDocumentTypeController;
use App\Http\Controllers\Settings\DeductionTypeController;
use App\Http\Controllers\Settings\EmployeeDeductionController;
use App\Http\Controllers\Settings\BankDetailController;
use App\Http\Controllers\System\HR\AllowanceController;
use App\Http\Controllers\System\HR\AttendanceController;
use App\Http\Controllers\System\HR\AttendanceDeviceController;
use App\Http\Controllers\System\HR\SalarySlipController;
use App\Http\Controllers\Settings\CompanySettingController;
use Illuminate\Support\Facades\Route;
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
    Route::get('/dashboard', DashboardController::class)->name('dashboard');

    // Trips
    Route::resource('trips', TripController::class);
    Route::patch('trips/{trip}/status', [TripController::class, 'updateStatus'])->name('trips.update-status');

    // Fleet
    Route::resource('fleet', VehicleController::class);
    Route::patch('fleet/{vehicle}/status', [VehicleController::class, 'updateStatus'])->name('fleet.update-status');
    Route::patch('fleet/{vehicle}/driver', [VehicleController::class, 'assignDriver'])->name('fleet.assign-driver');

    // Drivers
    Route::resource('drivers', DriverController::class);
    Route::patch('drivers/{driver}/status', [DriverController::class, 'updateStatus'])->name('drivers.update-status');
    Route::patch('drivers/{driver}/vehicle', [DriverController::class, 'assignVehicle'])->name('drivers.assign-vehicle');

    // Clients
    Route::resource('clients', ClientController::class);

    // Permits
    Route::resource('permits', PermitController::class);

    // Billing
    Route::prefix('billing')->name('billing.')->group(function () {
        Route::resource('quotes', QuoteController::class);
        Route::post('quotes/{quote}/convert-to-proforma', [QuoteController::class, 'convertToProforma'])
            ->name('quotes.convert-proforma');

        Route::resource('proformas', ProformaController::class);
        Route::post('proformas/{proforma}/convert-to-invoice', [ProformaController::class, 'convertToInvoice'])
            ->name('proformas.convert-invoice');

        Route::resource('invoices', InvoiceController::class);
        Route::post('invoices/{invoice}/payments', [InvoiceController::class, 'recordPayment'])
            ->name('invoices.payments.store');

        Route::get('payments', [PaymentController::class, 'index'])->name('payments.index');
        Route::delete('payments/{payment}', [PaymentController::class, 'destroy'])->name('payments.destroy');
    });

    // Expenses
    Route::resource('expenses', ExpenseController::class)->except(['show']);

    // Maintenance / Service Records
    Route::resource('maintenance', MaintenanceController::class);

    // Documents
    Route::resource('documents', DocumentController::class)->only(['index', 'create', 'store', 'destroy']);
    Route::get('documents/{document}/download', [DocumentController::class, 'download'])->name('documents.download');

    // HR
    Route::prefix('hr')->name('hr.')->group(function () {
        Route::resource('employees', EmployeeController::class);
        Route::resource('leave', LeaveController::class)->except(['edit', 'update']);
        Route::post('leave/{leave}/approve', [LeaveController::class, 'approve'])->name('leave.approve');
        Route::post('leave/{leave}/reject', [LeaveController::class, 'reject'])->name('leave.reject');

        Route::resource('payroll', PayrollController::class)->except(['edit', 'update']);
        Route::patch('payroll/{payroll}/slips/{slip}', [PayrollController::class, 'updateSlip'])->name('payroll.slips.update');
        Route::post('payroll/{payroll}/process', [PayrollController::class, 'process'])->name('payroll.process');
        Route::post('payroll/{payroll}/close', [PayrollController::class, 'close'])->name('payroll.close');

        Route::resource('advances', AdvanceController::class)->except(['edit', 'update']);
        Route::post('advances/{advance}/approve', [AdvanceController::class, 'approve'])->name('advances.approve');
        Route::post('advances/{advance}/reject',  [AdvanceController::class, 'reject'])->name('advances.reject');

        Route::resource('loans', LoanController::class)->except(['edit', 'update']);
        Route::post('loans/{loan}/approve', [LoanController::class, 'approve'])->name('loans.approve');
        Route::post('loans/{loan}/reject',  [LoanController::class, 'reject'])->name('loans.reject');

        Route::resource('allowances', AllowanceController::class)->only(['index', 'store', 'update', 'destroy']);

        Route::resource('attendance', AttendanceController::class)->only(['index', 'store', 'destroy']);
        Route::get('salary-slips', [SalarySlipController::class, 'index'])->name('salary-slips.index');

        Route::resource('attendance/devices', AttendanceDeviceController::class)->only(['index', 'store', 'update', 'destroy'])->names([
            'index'   => 'attendance.devices.index',
            'store'   => 'attendance.devices.store',
            'update'  => 'attendance.devices.update',
            'destroy' => 'attendance.devices.destroy',
        ]);
        Route::post('attendance/devices/{device}/sync', [AttendanceDeviceController::class, 'sync'])->name('attendance.devices.sync');
    });

    // Reports
    Route::get('reports/route-profitability', [RouteProfitabilityController::class, 'index'])
        ->name('reports.route-profitability');
    Route::get('reports/financial-summary', [FinancialSummaryController::class, 'index'])
        ->name('reports.financial-summary');
    Route::get('reports/fleet-utilization', [FleetUtilizationController::class, 'index'])
        ->name('reports.fleet-utilization');

    // Settings
    Route::prefix('settings')->name('settings.')->group(function () {
        Route::resource('license-classes', LicenseClassController::class)->except(['show']);
        Route::resource('document-types', VehicleDocumentTypeController::class)->except(['show']);
        Route::get('payroll', [PayrollSettingsController::class, 'index'])->name('payroll.index');
        Route::post('payroll', [PayrollSettingsController::class, 'update'])->name('payroll.update');
        Route::get('payroll/preview', [PayrollSettingsController::class, 'preview'])->name('payroll.preview');

        Route::get('company', [CompanySettingController::class, 'index'])->name('company.index');
        Route::post('company', [CompanySettingController::class, 'update'])->name('company.update');

        Route::resource('deductions', DeductionTypeController::class)->only(['index', 'store', 'update', 'destroy'])->parameters(['deductions' => 'deduction']);
        Route::resource('deduction-subscriptions', EmployeeDeductionController::class)->only(['index', 'store', 'update', 'destroy'])->parameters(['deduction-subscriptions' => 'deductionSubscription']);
        Route::resource('bank-details', BankDetailController::class)->only(['index', 'store', 'update', 'destroy'])->parameters(['bank-details' => 'bankDetail']);
    });
});

// Redirect /dashboard → /system/dashboard for convenience
Route::get('/dashboard', fn () => redirect()->route('system.dashboard'))->middleware('auth')->name('dashboard');
