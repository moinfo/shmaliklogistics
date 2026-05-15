<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\ProfileController;
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
use App\Http\Controllers\NfcController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// ── Public website ──────────────────────────────────────────────────────────
Route::get('/', fn () => Inertia::render('website/Home'))->name('home');
Route::get('/services', fn () => Inertia::render('website/Services'))->name('services');
Route::get('/about', fn () => Inertia::render('website/About'))->name('about');
Route::get('/contact', fn () => Inertia::render('website/Contact'))->name('contact');

// ── NFC Staff Cards ─────────────────────────────────────────────────────────
Route::get('/team', [NfcController::class, 'index'])->name('team');
Route::get('/team/{slug}', [NfcController::class, 'show'])->name('team.show');

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

Route::middleware('auth')->group(function () {
    Route::get('/account/password',   [ProfileController::class, 'showChangePassword'])->name('account.password');
    Route::patch('/account/password', [ProfileController::class, 'changePassword'])->name('account.password.update');
    Route::post('/account/avatar',    [ProfileController::class, 'updateAvatar'])->name('account.avatar.update');
});

// ── Driver Portal ───────────────────────────────────────────────────────────
Route::middleware(['auth', 'driver'])->prefix('driver')->name('driver.')->group(function () {
    Route::get('/dashboard', [\App\Http\Controllers\Driver\DriverPortalController::class, 'dashboard'])->name('dashboard');

    Route::get('/trips',                  [\App\Http\Controllers\Driver\DriverPortalController::class, 'trips'])->name('trips.index');
    Route::get('/trips/{trip}',           [\App\Http\Controllers\Driver\DriverPortalController::class, 'tripShow'])->name('trips.show');
    Route::patch('/trips/{trip}/expenses', [\App\Http\Controllers\Driver\DriverTripExpenseController::class, 'update'])->name('trips.expenses.update');

    Route::get('/inspections',         [\App\Http\Controllers\Driver\DriverInspectionController::class, 'index'])->name('inspections.index');
    Route::get('/inspections/create',  [\App\Http\Controllers\Driver\DriverInspectionController::class, 'create'])->name('inspections.create');
    Route::post('/inspections',        [\App\Http\Controllers\Driver\DriverInspectionController::class, 'store'])->name('inspections.store');

    Route::get('/check-ins',          [\App\Http\Controllers\Driver\DriverCheckInController::class, 'index'])->name('check-ins.index');
    Route::get('/check-ins/create',   [\App\Http\Controllers\Driver\DriverCheckInController::class, 'create'])->name('check-ins.create');
    Route::post('/check-ins',         [\App\Http\Controllers\Driver\DriverCheckInController::class, 'store'])->name('check-ins.store');
});

// ── System (protected) ──────────────────────────────────────────────────────
//
// Permission helper: split a Laravel resource into per-action permission groups.
// Maps verbs to module actions: index/show→view, create/store→create,
// edit/update→edit, destroy→delete.
$permResource = function (string $name, string $controller, string $module, array $opts = []) {
    $only = $opts['only'] ?? ['index', 'create', 'store', 'show', 'edit', 'update', 'destroy'];
    if (!empty($opts['except'])) {
        $only = array_values(array_diff($only, $opts['except']));
    }

    // Order matters: 'create' (GET {name}/create) must be registered before
    // 'view' (GET {name}/{param}) or the wildcard route will swallow /create
    // and 404 because route model binding can't resolve "create" to a model.
    $partitions = [
        'create' => array_values(array_intersect($only, ['create', 'store'])),
        'view'   => array_values(array_intersect($only, ['index', 'show'])),
        'edit'   => array_values(array_intersect($only, ['edit', 'update'])),
        'delete' => array_values(array_intersect($only, ['destroy'])),
    ];

    foreach ($partitions as $action => $methods) {
        if (empty($methods)) continue;
        $r = Route::resource($name, $controller)->only($methods)->middleware("permission:{$module}.{$action}");
        if (!empty($opts['parameters'])) $r->parameters($opts['parameters']);
        if (!empty($opts['names']))      $r->names($opts['names']);
    }
};

Route::middleware('auth')->prefix('system')->name('system.')->group(function () use ($permResource) {
    Route::get('/dashboard', DashboardController::class)->name('dashboard');
    Route::get('/notifications', NotificationsController::class)->name('notifications');

    // Vehicle inspections (read-only admin view of driver-submitted reports)
    Route::get('/inspections',                [\App\Http\Controllers\System\VehicleInspectionController::class, 'index'])->name('inspections.index')->middleware('permission:inspections.view');
    Route::get('/inspections/{inspection}',   [\App\Http\Controllers\System\VehicleInspectionController::class, 'show'])->name('inspections.show')->middleware('permission:inspections.view');

    // Trip check-ins (admin view)
    Route::get('/check-ins',                  [\App\Http\Controllers\System\TripCheckInController::class, 'index'])->name('check-ins.index')->middleware('permission:trip_check_ins.view');

    // Trips
    $permResource('trips', TripController::class, 'trips');
    Route::patch('trips/{trip}/status', [TripController::class, 'updateStatus'])->name('trips.update-status')->middleware('permission:trips.edit');

    // Cargo
    $permResource('cargo', CargoController::class, 'cargo');
    Route::patch('cargo/{cargo}/status', [CargoController::class, 'updateStatus'])->name('cargo.update-status')->middleware('permission:cargo.edit');

    // Fleet — static sub-routes must come before the resource to avoid {vehicle} wildcard capturing them
    Route::get('fleet/fuel-logs',              [FuelLogController::class, 'index'])->name('fleet.fuel-logs.index')->middleware('permission:fleet_fuel_logs.view');
    Route::post('fleet/fuel-logs',             [FuelLogController::class, 'store'])->name('fleet.fuel-logs.store')->middleware('permission:fleet_fuel_logs.create');
    Route::delete('fleet/fuel-logs/{fuelLog}', [FuelLogController::class, 'destroy'])->name('fleet.fuel-logs.destroy')->middleware('permission:fleet_fuel_logs.delete');
    // Map the resource URL param to {vehicle} so implicit binding matches the
    // controller signature Vehicle $vehicle — without this Laravel skips the
    // bind silently and destroy/show/edit receive an empty model.
    $permResource('fleet', VehicleController::class, 'fleet', ['parameters' => ['fleet' => 'vehicle']]);
    Route::patch('fleet/{vehicle}/status', [VehicleController::class, 'updateStatus'])->name('fleet.update-status')->middleware('permission:fleet.edit');
    Route::patch('fleet/{vehicle}/driver', [VehicleController::class, 'assignDriver'])->name('fleet.assign-driver')->middleware('permission:fleet.edit');
    Route::patch('fleet/{vehicle}/gps', [VehicleController::class, 'updateGps'])->name('fleet.update-gps')->middleware('permission:fleet.edit');

    // Drivers
    $permResource('drivers', DriverController::class, 'drivers');
    Route::patch('drivers/{driver}/status', [DriverController::class, 'updateStatus'])->name('drivers.update-status')->middleware('permission:drivers.edit');
    Route::patch('drivers/{driver}/vehicle', [DriverController::class, 'assignVehicle'])->name('drivers.assign-vehicle')->middleware('permission:drivers.edit');
    Route::post('drivers/{driver}/account',   [DriverController::class, 'createAccount'])->name('drivers.account.create')->middleware('permission:drivers.edit');
    Route::delete('drivers/{driver}/account', [DriverController::class, 'revokeAccount'])->name('drivers.account.revoke')->middleware('permission:drivers.edit');
    Route::post('drivers/{driver}/photo',             [DriverController::class, 'uploadPhoto'])->name('drivers.photo.update')->middleware('permission:drivers.edit');
    Route::post('drivers/{driver}/documents/license', [DriverController::class, 'uploadLicenseDoc'])->name('drivers.documents.license')->middleware('permission:drivers.edit');
    Route::post('drivers/{driver}/documents/visa', [DriverController::class, 'uploadVisaDoc'])->name('drivers.documents.visa')->middleware('permission:drivers.edit');
    Route::delete('drivers/{driver}/documents/{type}', [DriverController::class, 'deleteDocument'])->name('drivers.documents.delete')->middleware('permission:drivers.delete');

    // Clients
    $permResource('clients', ClientController::class, 'clients');
    Route::patch('clients/{client}/portal', [ClientController::class, 'updatePortal'])->name('clients.portal')->middleware('permission:clients.edit');

    // Permits
    $permResource('permits', PermitController::class, 'permits');

    // Billing — sub-modules each have their own permission key
    Route::prefix('billing')->name('billing.')->group(function () use ($permResource) {
        $permResource('quotes', QuoteController::class, 'billing_quotes');
        Route::post('quotes/{quote}/convert-to-proforma', [QuoteController::class, 'convertToProforma'])->name('quotes.convert-proforma')->middleware('permission:billing_quotes.edit');
        Route::post('quotes/{quote}/send', [QuoteController::class, 'send'])->name('quotes.send')->middleware('permission:billing_quotes.edit');
        Route::get('quotes/{quote}/pdf', [QuoteController::class, 'download'])->name('quotes.pdf')->middleware('permission:billing_quotes.view');

        $permResource('proformas', ProformaController::class, 'billing_proformas');
        Route::post('proformas/{proforma}/convert-to-invoice', [ProformaController::class, 'convertToInvoice'])->name('proformas.convert-invoice')->middleware('permission:billing_proformas.edit');
        Route::post('proformas/{proforma}/send', [ProformaController::class, 'send'])->name('proformas.send')->middleware('permission:billing_proformas.edit');
        Route::get('proformas/{proforma}/pdf', [ProformaController::class, 'download'])->name('proformas.pdf')->middleware('permission:billing_proformas.view');

        $permResource('invoices', InvoiceController::class, 'billing_invoices');
        Route::post('invoices/{invoice}/payments', [InvoiceController::class, 'recordPayment'])->name('invoices.payments.store')->middleware('permission:billing_payments.create');
        Route::post('invoices/{invoice}/send', [InvoiceController::class, 'send'])->name('invoices.send')->middleware('permission:billing_invoices.edit');
        Route::get('invoices/{invoice}/pdf', [InvoiceController::class, 'download'])->name('invoices.pdf')->middleware('permission:billing_invoices.view');

        Route::get('payments', [PaymentController::class, 'index'])->name('payments.index')->middleware('permission:billing_payments.view');

        Route::get('quote-requests', [QuoteRequestController::class, 'index'])->name('quote-requests.index')->middleware('permission:billing_quote_requests.view');
        Route::patch('quote-requests/{quoteRequest}', [QuoteRequestController::class, 'update'])->name('quote-requests.update')->middleware('permission:billing_quote_requests.edit');
        Route::delete('payments/{payment}', [PaymentController::class, 'destroy'])->name('payments.destroy')->middleware('permission:billing_payments.delete');
    });

    // Expenses
    $permResource('expenses', ExpenseController::class, 'expenses', ['except' => ['show']]);

    // Maintenance
    $permResource('maintenance', MaintenanceController::class, 'maintenance');

    // Documents
    $permResource('documents', DocumentController::class, 'documents', ['only' => ['index', 'create', 'store', 'destroy']]);
    Route::get('documents/{document}/download', [DocumentController::class, 'download'])->name('documents.download')->middleware('permission:documents.view');

    // HR
    Route::prefix('hr')->name('hr.')->group(function () use ($permResource) {
        $permResource('employees', EmployeeController::class, 'hr_employees');

        $permResource('leave', LeaveController::class, 'hr_leave', ['except' => ['edit', 'update']]);
        Route::post('leave/{leave}/approve', [LeaveController::class, 'approve'])->name('leave.approve')->middleware('permission:hr_leave.approve');
        Route::post('leave/{leave}/reject',  [LeaveController::class, 'reject'])->name('leave.reject')->middleware('permission:hr_leave.approve');

        $permResource('payroll', PayrollController::class, 'hr_payroll', ['except' => ['edit', 'update']]);
        Route::patch('payroll/{payroll}/slips/{slip}', [PayrollController::class, 'updateSlip'])->name('payroll.slips.update')->middleware('permission:hr_payroll.process');
        Route::post('payroll/{payroll}/process', [PayrollController::class, 'process'])->name('payroll.process')->middleware('permission:hr_payroll.process');
        Route::post('payroll/{payroll}/close',   [PayrollController::class, 'close'])->name('payroll.close')->middleware('permission:hr_payroll.process');

        $permResource('advances', AdvanceController::class, 'hr_advances', ['except' => ['edit', 'update']]);
        Route::post('advances/{advance}/approve', [AdvanceController::class, 'approve'])->name('advances.approve')->middleware('permission:hr_advances.approve');
        Route::post('advances/{advance}/reject',  [AdvanceController::class, 'reject'])->name('advances.reject')->middleware('permission:hr_advances.approve');

        $permResource('loans', LoanController::class, 'hr_loans', ['except' => ['edit', 'update']]);
        Route::post('loans/{loan}/approve', [LoanController::class, 'approve'])->name('loans.approve')->middleware('permission:hr_loans.approve');
        Route::post('loans/{loan}/reject',  [LoanController::class, 'reject'])->name('loans.reject')->middleware('permission:hr_loans.approve');

        $permResource('allowances', AllowanceController::class, 'hr_allowances', ['only' => ['index', 'store', 'update', 'destroy']]);

        $permResource('attendance', AttendanceController::class, 'hr_attendance', ['only' => ['index', 'store', 'destroy']]);
        Route::get('salary-slips', [SalarySlipController::class, 'index'])->name('salary-slips.index')->middleware('permission:hr_salary_slips.view');

        $permResource('appraisals', AppraisalController::class, 'hr_appraisals');

        // Recruitment
        Route::get('recruitment', [RecruitmentController::class, 'index'])->name('recruitment.index')->middleware('permission:hr_recruitment.view');
        Route::post('recruitment/vacancies', [RecruitmentController::class, 'storeVacancy'])->name('recruitment.vacancies.store')->middleware('permission:hr_recruitment.create');
        Route::put('recruitment/vacancies/{vacancy}', [RecruitmentController::class, 'updateVacancy'])->name('recruitment.vacancies.update')->middleware('permission:hr_recruitment.edit');
        Route::delete('recruitment/vacancies/{vacancy}', [RecruitmentController::class, 'destroyVacancy'])->name('recruitment.vacancies.destroy')->middleware('permission:hr_recruitment.delete');
        Route::get('recruitment/vacancies/{vacancy}', [RecruitmentController::class, 'showVacancy'])->name('recruitment.vacancies.show')->middleware('permission:hr_recruitment.view');
        Route::post('recruitment/vacancies/{vacancy}/applications', [RecruitmentController::class, 'storeApplication'])->name('recruitment.applications.store')->middleware('permission:hr_recruitment.create');
        Route::patch('recruitment/applications/{application}/stage', [RecruitmentController::class, 'updateApplicationStage'])->name('recruitment.applications.stage')->middleware('permission:hr_recruitment.edit');
        Route::delete('recruitment/applications/{application}', [RecruitmentController::class, 'destroyApplication'])->name('recruitment.applications.destroy')->middleware('permission:hr_recruitment.delete');

        Route::resource('attendance/devices', AttendanceDeviceController::class)->only(['index'])->middleware('permission:hr_attendance.view')->names([
            'index'   => 'attendance.devices.index',
        ]);
        Route::resource('attendance/devices', AttendanceDeviceController::class)->only(['store'])->middleware('permission:hr_attendance.create')->names([
            'store'   => 'attendance.devices.store',
        ]);
        Route::resource('attendance/devices', AttendanceDeviceController::class)->only(['update'])->middleware('permission:hr_attendance.create')->names([
            'update'  => 'attendance.devices.update',
        ]);
        Route::resource('attendance/devices', AttendanceDeviceController::class)->only(['destroy'])->middleware('permission:hr_attendance.create')->names([
            'destroy' => 'attendance.devices.destroy',
        ]);
        Route::post('attendance/devices/{device}/sync', [AttendanceDeviceController::class, 'sync'])->name('attendance.devices.sync')->middleware('permission:hr_attendance.create');
    });

    // Procurement — split into suppliers and orders
    Route::prefix('procurement')->name('procurement.')->group(function () {
        Route::get('suppliers',                  [SupplierController::class, 'index'])->name('suppliers.index')->middleware('permission:procurement_suppliers.view');
        Route::post('suppliers',                 [SupplierController::class, 'store'])->name('suppliers.store')->middleware('permission:procurement_suppliers.create');
        Route::put('suppliers/{supplier}',       [SupplierController::class, 'update'])->name('suppliers.update')->middleware('permission:procurement_suppliers.edit');
        Route::delete('suppliers/{supplier}',    [SupplierController::class, 'destroy'])->name('suppliers.destroy')->middleware('permission:procurement_suppliers.delete');

        Route::get('orders',                     [PurchaseOrderController::class, 'index'])->name('orders.index')->middleware('permission:procurement_orders.view');
        Route::get('orders/create',              [PurchaseOrderController::class, 'create'])->name('orders.create')->middleware('permission:procurement_orders.create');
        Route::post('orders',                    [PurchaseOrderController::class, 'store'])->name('orders.store')->middleware('permission:procurement_orders.create');
        Route::get('orders/{order}',             [PurchaseOrderController::class, 'show'])->name('orders.show')->middleware('permission:procurement_orders.view');
        Route::patch('orders/{order}/status',    [PurchaseOrderController::class, 'updateStatus'])->name('orders.status')->middleware('permission:procurement_orders.edit');
        Route::post('orders/{order}/receive',    [PurchaseOrderController::class, 'receive'])->name('orders.receive')->middleware('permission:procurement_orders.edit');
        Route::delete('orders/{order}',          [PurchaseOrderController::class, 'destroy'])->name('orders.destroy')->middleware('permission:procurement_orders.delete');
    });

    // Inventory
    Route::get('inventory', [InventoryController::class, 'index'])->name('inventory.index')->middleware('permission:inventory.view');
    Route::get('inventory/create', [InventoryController::class, 'create'])->name('inventory.create')->middleware('permission:inventory.create');
    Route::post('inventory', [InventoryController::class, 'store'])->name('inventory.store')->middleware('permission:inventory.create');
    Route::get('inventory/movements', [InventoryController::class, 'movements'])->name('inventory.movements')->middleware('permission:inventory.view');
    Route::get('inventory/{item}', [InventoryController::class, 'show'])->name('inventory.show')->middleware('permission:inventory.view');
    Route::put('inventory/{item}', [InventoryController::class, 'update'])->name('inventory.update')->middleware('permission:inventory.edit');
    Route::delete('inventory/{item}', [InventoryController::class, 'destroy'])->name('inventory.destroy')->middleware('permission:inventory.delete');
    Route::post('inventory/{item}/stock-in', [InventoryController::class, 'stockIn'])->name('inventory.stock-in')->middleware('permission:inventory.edit');
    Route::post('inventory/{item}/stock-out', [InventoryController::class, 'stockOut'])->name('inventory.stock-out')->middleware('permission:inventory.edit');
    Route::post('inventory/categories', [InventoryController::class, 'storeCategory'])->name('inventory.categories.store')->middleware('permission:inventory.create');
    Route::delete('inventory/categories/{category}', [InventoryController::class, 'destroyCategory'])->name('inventory.categories.destroy')->middleware('permission:inventory.delete');

    // Reports — each report has its own permission
    Route::get('reports/route-profitability', [RouteProfitabilityController::class, 'index'])->name('reports.route-profitability')->middleware('permission:reports_route_profitability.view');
    Route::get('reports/financial-summary',   [FinancialSummaryController::class, 'index'])->name('reports.financial-summary')->middleware('permission:reports_financial_summary.view');
    Route::get('reports/fleet-utilization',   [FleetUtilizationController::class, 'index'])->name('reports.fleet-utilization')->middleware('permission:reports_fleet_utilization.view');

    // Settings — every read = settings.view, every write = settings.edit
    Route::prefix('settings')->name('settings.')->group(function () use ($permResource) {
        $permResource('license-classes', LicenseClassController::class, 'settings', ['except' => ['show']]);
        $permResource('document-types',  VehicleDocumentTypeController::class, 'settings', ['except' => ['show']]);

        Route::get('payroll',         [PayrollSettingsController::class, 'index'])->name('payroll.index')->middleware('permission:settings.view');
        Route::post('payroll',        [PayrollSettingsController::class, 'update'])->name('payroll.update')->middleware('permission:settings.edit');
        Route::get('payroll/preview', [PayrollSettingsController::class, 'preview'])->name('payroll.preview')->middleware('permission:settings.view');

        Route::get('company',  [CompanySettingController::class, 'index'])->name('company.index')->middleware('permission:settings.view');
        Route::post('company', [CompanySettingController::class, 'update'])->name('company.update')->middleware('permission:settings.edit');

        $permResource('deductions', DeductionTypeController::class, 'settings', [
            'only' => ['index', 'store', 'update', 'destroy'],
            'parameters' => ['deductions' => 'deduction'],
        ]);
        $permResource('deduction-subscriptions', EmployeeDeductionController::class, 'settings', [
            'only' => ['index', 'store', 'update', 'destroy'],
            'parameters' => ['deduction-subscriptions' => 'deductionSubscription'],
        ]);
        $permResource('bank-details', BankDetailController::class, 'settings', [
            'only' => ['index', 'store', 'update', 'destroy'],
            'parameters' => ['bank-details' => 'bankDetail'],
        ]);
        $permResource('departments', DepartmentController::class, 'settings', [
            'only' => ['index', 'store', 'update', 'destroy'],
            'parameters' => ['departments' => 'department'],
        ]);
        $permResource('roles', RoleController::class, 'settings', [
            'only' => ['index', 'store', 'update', 'destroy'],
            'parameters' => ['roles' => 'role'],
        ]);

        Route::get('users',                  [UserController::class, 'index'])->name('users.index')->middleware('permission:settings.view');
        Route::post('users',                 [UserController::class, 'store'])->name('users.store')->middleware('permission:settings.edit');
        Route::put('users/{user}',           [UserController::class, 'update'])->name('users.update')->middleware('permission:settings.edit');
        Route::post('users/{user}/avatar',   [UserController::class, 'uploadAvatar'])->name('users.avatar.update')->middleware('permission:settings.edit');
        Route::delete('users/{user}',        [UserController::class, 'destroy'])->name('users.destroy')->middleware('permission:settings.edit');
    });
});

// Redirect /dashboard → /system/dashboard for convenience
Route::get('/dashboard', fn () => redirect()->route('system.dashboard'))->middleware('auth')->name('dashboard');
