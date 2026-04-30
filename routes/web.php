<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\System\CargoController;
use App\Http\Controllers\System\DashboardController;
use App\Http\Controllers\System\TripController;
use App\Http\Controllers\System\VehicleController;
use App\Http\Controllers\System\FuelLogController;
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
use App\Http\Controllers\System\NotificationsController;
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
use App\Http\Controllers\Settings\DepartmentController;
use App\Http\Controllers\Settings\RoleController;
use App\Http\Controllers\Settings\UserController;
use App\Http\Controllers\System\Billing\QuoteRequestController;
use App\Http\Controllers\System\HR\AllowanceController;
use App\Http\Controllers\System\HR\AttendanceController;
use App\Http\Controllers\System\HR\AttendanceDeviceController;
use App\Http\Controllers\System\HR\SalarySlipController;
use App\Http\Controllers\System\HR\AppraisalController;
use App\Http\Controllers\System\HR\RecruitmentController;
use App\Http\Controllers\System\InventoryController;
use App\Http\Controllers\System\Procurement\SupplierController;
use App\Http\Controllers\System\Procurement\PurchaseOrderController;
use App\Http\Controllers\Portal\PortalAuthController;
use App\Http\Controllers\Portal\PortalDashboardController;
use App\Http\Controllers\Portal\PortalTripController;
use App\Http\Controllers\Portal\PortalInvoiceController;
use App\Http\Controllers\Portal\PortalQuoteController;
use App\Http\Controllers\Portal\PortalCargoController;
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

// ── Customer Portal ──────────────────────────────────────────────────────────
Route::prefix('portal')->name('portal.')->group(function () {
    Route::get('login',  [PortalAuthController::class, 'showLogin'])->name('login');
    Route::post('login', [PortalAuthController::class, 'login'])->name('login.post');
    Route::post('logout',[PortalAuthController::class, 'logout'])->name('logout');

    Route::middleware(\App\Http\Middleware\EnsurePortalAuth::class)->group(function () {
        Route::get('dashboard',           PortalDashboardController::class)->name('dashboard');
        Route::get('trips',               [PortalTripController::class, 'index'])->name('trips.index');
        Route::get('trips/{trip}',        [PortalTripController::class, 'show'])->name('trips.show');
        Route::get('invoices',            [PortalInvoiceController::class, 'index'])->name('invoices.index');
        Route::get('invoices/{invoice}',  [PortalInvoiceController::class, 'show'])->name('invoices.show');

        Route::get('quote-requests',        [PortalQuoteController::class, 'index'])->name('quote-requests.index');
        Route::get('quote-requests/create', [PortalQuoteController::class, 'create'])->name('quote-requests.create');
        Route::post('quote-requests',       [PortalQuoteController::class, 'store'])->name('quote-requests.store');

        Route::get('cargo',         [PortalCargoController::class, 'index'])->name('cargo.index');
        Route::get('cargo/{cargo}', [PortalCargoController::class, 'show'])->name('cargo.show');
    });
});

Route::post('/logout', [AuthController::class, 'logout'])->name('logout')->middleware('auth');

// ── System (protected) ──────────────────────────────────────────────────────
Route::middleware('auth')->prefix('system')->name('system.')->group(function () {
    Route::get('/dashboard', DashboardController::class)->name('dashboard');
    Route::get('/notifications', NotificationsController::class)->name('notifications');

    // Trips
    Route::resource('trips', TripController::class);
    Route::patch('trips/{trip}/status', [TripController::class, 'updateStatus'])->name('trips.update-status');

    // Cargo
    Route::resource('cargo', CargoController::class);
    Route::patch('cargo/{cargo}/status', [CargoController::class, 'updateStatus'])->name('cargo.update-status');

    // Fleet
    Route::resource('fleet', VehicleController::class);
    Route::patch('fleet/{vehicle}/status', [VehicleController::class, 'updateStatus'])->name('fleet.update-status');
    Route::patch('fleet/{vehicle}/driver', [VehicleController::class, 'assignDriver'])->name('fleet.assign-driver');
    Route::patch('fleet/{vehicle}/gps', [VehicleController::class, 'updateGps'])->name('fleet.update-gps');
    Route::get('fleet/fuel-logs',            [FuelLogController::class, 'index'])->name('fleet.fuel-logs.index');
    Route::post('fleet/fuel-logs',           [FuelLogController::class, 'store'])->name('fleet.fuel-logs.store');
    Route::delete('fleet/fuel-logs/{fuelLog}', [FuelLogController::class, 'destroy'])->name('fleet.fuel-logs.destroy');

    // Drivers
    Route::resource('drivers', DriverController::class);
    Route::patch('drivers/{driver}/status', [DriverController::class, 'updateStatus'])->name('drivers.update-status');
    Route::patch('drivers/{driver}/vehicle', [DriverController::class, 'assignVehicle'])->name('drivers.assign-vehicle');
    Route::post('drivers/{driver}/documents/license', [DriverController::class, 'uploadLicenseDoc'])->name('drivers.documents.license');
    Route::post('drivers/{driver}/documents/visa', [DriverController::class, 'uploadVisaDoc'])->name('drivers.documents.visa');
    Route::delete('drivers/{driver}/documents/{type}', [DriverController::class, 'deleteDocument'])->name('drivers.documents.delete');

    // Clients
    Route::resource('clients', ClientController::class);
    Route::patch('clients/{client}/portal', [ClientController::class, 'updatePortal'])->name('clients.portal');

    // Permits
    Route::resource('permits', PermitController::class);

    // Billing
    Route::prefix('billing')->name('billing.')->group(function () {
        Route::resource('quotes', QuoteController::class);
        Route::post('quotes/{quote}/convert-to-proforma', [QuoteController::class, 'convertToProforma'])
            ->name('quotes.convert-proforma');
        Route::post('quotes/{quote}/send', [QuoteController::class, 'send'])
            ->name('quotes.send');
        Route::get('quotes/{quote}/pdf', [QuoteController::class, 'download'])
            ->name('quotes.pdf');

        Route::resource('proformas', ProformaController::class);
        Route::post('proformas/{proforma}/convert-to-invoice', [ProformaController::class, 'convertToInvoice'])
            ->name('proformas.convert-invoice');
        Route::post('proformas/{proforma}/send', [ProformaController::class, 'send'])
            ->name('proformas.send');
        Route::get('proformas/{proforma}/pdf', [ProformaController::class, 'download'])
            ->name('proformas.pdf');

        Route::resource('invoices', InvoiceController::class);
        Route::post('invoices/{invoice}/payments', [InvoiceController::class, 'recordPayment'])
            ->name('invoices.payments.store');
        Route::post('invoices/{invoice}/send', [InvoiceController::class, 'send'])
            ->name('invoices.send');
        Route::get('invoices/{invoice}/pdf', [InvoiceController::class, 'download'])
            ->name('invoices.pdf');

        Route::get('payments', [PaymentController::class, 'index'])->name('payments.index');

        Route::get('quote-requests', [QuoteRequestController::class, 'index'])->name('quote-requests.index');
        Route::patch('quote-requests/{quoteRequest}', [QuoteRequestController::class, 'update'])->name('quote-requests.update');
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

        Route::resource('appraisals', AppraisalController::class);

        // Recruitment
        Route::get('recruitment', [RecruitmentController::class, 'index'])->name('recruitment.index');
        Route::post('recruitment/vacancies', [RecruitmentController::class, 'storeVacancy'])->name('recruitment.vacancies.store');
        Route::put('recruitment/vacancies/{vacancy}', [RecruitmentController::class, 'updateVacancy'])->name('recruitment.vacancies.update');
        Route::delete('recruitment/vacancies/{vacancy}', [RecruitmentController::class, 'destroyVacancy'])->name('recruitment.vacancies.destroy');
        Route::get('recruitment/vacancies/{vacancy}', [RecruitmentController::class, 'showVacancy'])->name('recruitment.vacancies.show');
        Route::post('recruitment/vacancies/{vacancy}/applications', [RecruitmentController::class, 'storeApplication'])->name('recruitment.applications.store');
        Route::patch('recruitment/applications/{application}/stage', [RecruitmentController::class, 'updateApplicationStage'])->name('recruitment.applications.stage');
        Route::delete('recruitment/applications/{application}', [RecruitmentController::class, 'destroyApplication'])->name('recruitment.applications.destroy');

        Route::resource('attendance/devices', AttendanceDeviceController::class)->only(['index', 'store', 'update', 'destroy'])->names([
            'index'   => 'attendance.devices.index',
            'store'   => 'attendance.devices.store',
            'update'  => 'attendance.devices.update',
            'destroy' => 'attendance.devices.destroy',
        ]);
        Route::post('attendance/devices/{device}/sync', [AttendanceDeviceController::class, 'sync'])->name('attendance.devices.sync');
    });

    // Procurement
    Route::prefix('procurement')->name('procurement.')->group(function () {
        Route::get('suppliers', [SupplierController::class, 'index'])->name('suppliers.index');
        Route::post('suppliers', [SupplierController::class, 'store'])->name('suppliers.store');
        Route::put('suppliers/{supplier}', [SupplierController::class, 'update'])->name('suppliers.update');
        Route::delete('suppliers/{supplier}', [SupplierController::class, 'destroy'])->name('suppliers.destroy');

        Route::get('orders', [PurchaseOrderController::class, 'index'])->name('orders.index');
        Route::get('orders/create', [PurchaseOrderController::class, 'create'])->name('orders.create');
        Route::post('orders', [PurchaseOrderController::class, 'store'])->name('orders.store');
        Route::get('orders/{order}', [PurchaseOrderController::class, 'show'])->name('orders.show');
        Route::patch('orders/{order}/status', [PurchaseOrderController::class, 'updateStatus'])->name('orders.status');
        Route::post('orders/{order}/receive', [PurchaseOrderController::class, 'receive'])->name('orders.receive');
        Route::delete('orders/{order}', [PurchaseOrderController::class, 'destroy'])->name('orders.destroy');
    });

    // Inventory
    Route::get('inventory', [InventoryController::class, 'index'])->name('inventory.index');
    Route::get('inventory/create', [InventoryController::class, 'create'])->name('inventory.create');
    Route::post('inventory', [InventoryController::class, 'store'])->name('inventory.store');
    Route::get('inventory/movements', [InventoryController::class, 'movements'])->name('inventory.movements');
    Route::get('inventory/{item}', [InventoryController::class, 'show'])->name('inventory.show');
    Route::put('inventory/{item}', [InventoryController::class, 'update'])->name('inventory.update');
    Route::delete('inventory/{item}', [InventoryController::class, 'destroy'])->name('inventory.destroy');
    Route::post('inventory/{item}/stock-in', [InventoryController::class, 'stockIn'])->name('inventory.stock-in');
    Route::post('inventory/{item}/stock-out', [InventoryController::class, 'stockOut'])->name('inventory.stock-out');
    Route::post('inventory/categories', [InventoryController::class, 'storeCategory'])->name('inventory.categories.store');
    Route::delete('inventory/categories/{category}', [InventoryController::class, 'destroyCategory'])->name('inventory.categories.destroy');

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
        Route::resource('departments', DepartmentController::class)->only(['index', 'store', 'update', 'destroy'])->parameters(['departments' => 'department']);
        Route::resource('roles', RoleController::class)->only(['index', 'store', 'update', 'destroy'])->parameters(['roles' => 'role']);

        Route::get('users', [UserController::class, 'index'])->name('users.index');
        Route::post('users', [UserController::class, 'store'])->name('users.store');
        Route::put('users/{user}', [UserController::class, 'update'])->name('users.update');
        Route::delete('users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
    });
});

// Redirect /dashboard → /system/dashboard for convenience
Route::get('/dashboard', fn () => redirect()->route('system.dashboard'))->middleware('auth')->name('dashboard');
