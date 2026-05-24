<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Driver\DashboardController;
use App\Http\Controllers\Api\Driver\TripController;
use App\Http\Controllers\Api\Driver\CheckInController;
use App\Http\Controllers\Api\Driver\ExpenseController;
use App\Http\Controllers\Api\Driver\InspectionController;
use App\Http\Controllers\Api\Driver\ProfileController;
use App\Http\Controllers\Api\Staff\OverviewController;
use App\Http\Controllers\Api\Staff\OpsController;
use App\Http\Controllers\Api\Staff\FinanceController;
use App\Http\Controllers\Api\Staff\HrController;
use App\Http\Controllers\Api\Customer\PortalController;
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

    Route::prefix('staff')->group(function () {
        Route::get('/dashboard', [OverviewController::class, 'index']);

        Route::get('/ops/trips', [OpsController::class, 'trips'])->middleware('permission:trips.view');
        Route::get('/ops/fleet', [OpsController::class, 'fleet'])->middleware('permission:fleet.view');
        Route::get('/ops/alerts', [OpsController::class, 'alerts']);

        Route::get('/finance/invoices', [FinanceController::class, 'invoices'])->middleware('permission:billing_invoices.view');
        Route::get('/finance/invoices/{invoice}', [FinanceController::class, 'invoiceShow'])->middleware('permission:billing_invoices.view');
        Route::get('/finance/payments', [FinanceController::class, 'payments'])->middleware('permission:billing_payments.view');
        Route::get('/finance/debtors', [FinanceController::class, 'debtors'])->middleware('permission:billing_invoices.view');
        Route::post('/finance/invoices/{invoice}/payments', [FinanceController::class, 'recordPayment'])->middleware('permission:billing_payments.create');

        Route::get('/hr/approvals', [HrController::class, 'approvals']);
        Route::post('/hr/leave/{leave}/approve', [HrController::class, 'approveLeave'])->middleware('permission:hr_leave.edit');
        Route::post('/hr/leave/{leave}/reject', [HrController::class, 'rejectLeave'])->middleware('permission:hr_leave.edit');
        Route::post('/hr/advances/{advance}/approve', [HrController::class, 'approveAdvance'])->middleware('permission:hr_advances.edit');
        Route::post('/hr/advances/{advance}/reject', [HrController::class, 'rejectAdvance'])->middleware('permission:hr_advances.edit');
        Route::post('/hr/loans/{loan}/approve', [HrController::class, 'approveLoan'])->middleware('permission:hr_loans.edit');
        Route::post('/hr/loans/{loan}/reject', [HrController::class, 'rejectLoan'])->middleware('permission:hr_loans.edit');
        Route::get('/hr/attendance', [HrController::class, 'attendance'])->middleware('permission:hr_attendance.view');

        // ── Module screens (read-only lists + detail) ─────────────────────────
        // Controllers live in App\Http\Controllers\Api\Staff\Modules\* (FQCN inline
        // to avoid import clashes with the Api\Driver\* controllers).
        Route::prefix('modules')->group(function () {
            Route::get('/vehicles', [\App\Http\Controllers\Api\Staff\Modules\VehicleController::class, 'index'])->middleware('permission:fleet.view');
            Route::get('/vehicles/{id}', [\App\Http\Controllers\Api\Staff\Modules\VehicleController::class, 'show'])->middleware('permission:fleet.view');

            Route::get('/drivers', [\App\Http\Controllers\Api\Staff\Modules\DriverController::class, 'index'])->middleware('permission:drivers.view');
            Route::get('/drivers/{id}', [\App\Http\Controllers\Api\Staff\Modules\DriverController::class, 'show'])->middleware('permission:drivers.view');

            Route::get('/permits', [\App\Http\Controllers\Api\Staff\Modules\PermitController::class, 'index'])->middleware('permission:permits.view');
            Route::get('/permits/{id}', [\App\Http\Controllers\Api\Staff\Modules\PermitController::class, 'show'])->middleware('permission:permits.view');

            Route::get('/clients', [\App\Http\Controllers\Api\Staff\Modules\ClientController::class, 'index'])->middleware('permission:clients.view');
            Route::get('/clients/{id}', [\App\Http\Controllers\Api\Staff\Modules\ClientController::class, 'show'])->middleware('permission:clients.view');

            Route::get('/expenses', [\App\Http\Controllers\Api\Staff\Modules\ExpenseController::class, 'index'])->middleware('permission:expenses.view');
            Route::get('/expenses/{id}', [\App\Http\Controllers\Api\Staff\Modules\ExpenseController::class, 'show'])->middleware('permission:expenses.view');

            Route::get('/maintenance', [\App\Http\Controllers\Api\Staff\Modules\MaintenanceController::class, 'index'])->middleware('permission:maintenance.view');
            Route::get('/maintenance/{id}', [\App\Http\Controllers\Api\Staff\Modules\MaintenanceController::class, 'show'])->middleware('permission:maintenance.view');

            Route::get('/documents', [\App\Http\Controllers\Api\Staff\Modules\DocumentController::class, 'index'])->middleware('permission:documents.view');

            Route::get('/cargo', [\App\Http\Controllers\Api\Staff\Modules\CargoController::class, 'index'])->middleware('permission:cargo.view');
            Route::get('/cargo/{id}', [\App\Http\Controllers\Api\Staff\Modules\CargoController::class, 'show'])->middleware('permission:cargo.view');

            Route::get('/fuel-logs', [\App\Http\Controllers\Api\Staff\Modules\FuelLogController::class, 'index'])->middleware('permission:fleet_fuel_logs.view');

            Route::get('/inspections', [\App\Http\Controllers\Api\Staff\Modules\InspectionController::class, 'index'])->middleware('permission:inspections.view');
            Route::get('/inspections/{id}', [\App\Http\Controllers\Api\Staff\Modules\InspectionController::class, 'show'])->middleware('permission:inspections.view');

            Route::get('/check-ins', [\App\Http\Controllers\Api\Staff\Modules\CheckInController::class, 'index'])->middleware('permission:trip_check_ins.view');

            Route::get('/quotes', [\App\Http\Controllers\Api\Staff\Modules\QuoteController::class, 'index'])->middleware('permission:billing_quotes.view');
            Route::get('/quotes/{id}', [\App\Http\Controllers\Api\Staff\Modules\QuoteController::class, 'show'])->middleware('permission:billing_quotes.view');

            Route::get('/proformas', [\App\Http\Controllers\Api\Staff\Modules\ProformaController::class, 'index'])->middleware('permission:billing_proformas.view');
            Route::get('/proformas/{id}', [\App\Http\Controllers\Api\Staff\Modules\ProformaController::class, 'show'])->middleware('permission:billing_proformas.view');

            Route::get('/quote-requests', [\App\Http\Controllers\Api\Staff\Modules\QuoteRequestController::class, 'index'])->middleware('permission:billing_quote_requests.view');
            Route::get('/quote-requests/{id}', [\App\Http\Controllers\Api\Staff\Modules\QuoteRequestController::class, 'show'])->middleware('permission:billing_quote_requests.view');

            Route::get('/suppliers', [\App\Http\Controllers\Api\Staff\Modules\SupplierController::class, 'index'])->middleware('permission:procurement_suppliers.view');
            Route::get('/suppliers/{id}', [\App\Http\Controllers\Api\Staff\Modules\SupplierController::class, 'show'])->middleware('permission:procurement_suppliers.view');

            Route::get('/purchase-orders', [\App\Http\Controllers\Api\Staff\Modules\PurchaseOrderController::class, 'index'])->middleware('permission:procurement_orders.view');
            Route::get('/purchase-orders/{id}', [\App\Http\Controllers\Api\Staff\Modules\PurchaseOrderController::class, 'show'])->middleware('permission:procurement_orders.view');

            Route::get('/inventory', [\App\Http\Controllers\Api\Staff\Modules\InventoryController::class, 'index'])->middleware('permission:inventory.view');
            Route::get('/inventory/{id}', [\App\Http\Controllers\Api\Staff\Modules\InventoryController::class, 'show'])->middleware('permission:inventory.view');

            Route::get('/employees', [\App\Http\Controllers\Api\Staff\Modules\EmployeeController::class, 'index'])->middleware('permission:hr_employees.view');
            Route::get('/employees/{id}', [\App\Http\Controllers\Api\Staff\Modules\EmployeeController::class, 'show'])->middleware('permission:hr_employees.view');

            Route::get('/payroll', [\App\Http\Controllers\Api\Staff\Modules\PayrollController::class, 'index'])->middleware('permission:hr_payroll.view');
            Route::get('/payroll/{id}', [\App\Http\Controllers\Api\Staff\Modules\PayrollController::class, 'show'])->middleware('permission:hr_payroll.view');
            Route::get('/salary-slips', [\App\Http\Controllers\Api\Staff\Modules\PayrollController::class, 'salarySlips'])->middleware('permission:hr_salary_slips.view');

            Route::get('/recruitment', [\App\Http\Controllers\Api\Staff\Modules\TalentController::class, 'recruitment'])->middleware('permission:hr_recruitment.view');
            Route::get('/recruitment/{id}', [\App\Http\Controllers\Api\Staff\Modules\TalentController::class, 'recruitmentShow'])->middleware('permission:hr_recruitment.view');
            Route::get('/appraisals', [\App\Http\Controllers\Api\Staff\Modules\TalentController::class, 'appraisals'])->middleware('permission:hr_appraisals.view');

            Route::get('/reports/route-profitability', [\App\Http\Controllers\Api\Staff\Modules\ReportsController::class, 'routeProfitability'])->middleware('permission:reports_route_profitability.view');
            Route::get('/reports/financial-summary', [\App\Http\Controllers\Api\Staff\Modules\ReportsController::class, 'financialSummary'])->middleware('permission:reports_financial_summary.view');
            Route::get('/reports/fleet-utilization', [\App\Http\Controllers\Api\Staff\Modules\ReportsController::class, 'fleetUtilization'])->middleware('permission:reports_fleet_utilization.view');
        });
    });

    Route::prefix('customer')->middleware('abilities:customer')->group(function () {
        Route::get('/dashboard', [PortalController::class, 'dashboard']);
        Route::get('/trips', [PortalController::class, 'trips']);
        Route::get('/trips/{trip}', [PortalController::class, 'tripShow']);
        Route::get('/invoices', [PortalController::class, 'invoices']);
        Route::get('/invoices/{invoice}', [PortalController::class, 'invoiceShow']);
        Route::get('/cargo', [PortalController::class, 'cargo']);
        Route::get('/quote-requests', [PortalController::class, 'quoteRequests']);
        Route::post('/quote-requests', [PortalController::class, 'storeQuoteRequest']);
    });
});
