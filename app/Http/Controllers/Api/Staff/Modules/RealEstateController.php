<?php

namespace App\Http\Controllers\Api\Staff\Modules;

use App\Http\Controllers\Controller;
use App\Models\Lease;
use App\Models\Property;
use App\Models\PropertyExpense;
use App\Models\PropertyUnit;
use App\Models\RentInvoice;
use App\Models\RentPayment;
use App\Models\Tenant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

/// Read-only Real Estate endpoints for the staff mobile app.
///
/// Mirrors the data/queries of the App\Http\Controllers\System\RealEstate
/// controllers but returns flat JSON envelopes instead of Inertia pages.
/// Auth + permission scoping is handled by the route middleware
/// (permission:realestate_*.view). Every method is read-only.
class RealEstateController extends Controller
{
    private const CURRENCIES = ['TZS', 'USD', 'KES', 'ZMW', 'MWK', 'MZN'];

    // ---------------------------------------------------------------------
    // Properties
    // ---------------------------------------------------------------------

    // GET /api/staff/modules/real-estate/properties — searchable, paginated list.
    public function properties(Request $request): JsonResponse
    {
        $query = Property::query()->latest();

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                  ->orWhere('code', 'like', "%{$s}%")
                  ->orWhere('address', 'like', "%{$s}%");
            });
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $query->withCount([
            'units',
            'units as occupied_units_count' => fn ($q) => $q->where('status', 'occupied'),
        ]);

        $properties = $query->paginate(15)->withQueryString();

        $properties->getCollection()->transform(function (Property $property) {
            // Monthly rent roll = sum of active-lease rent on this property's units.
            $monthlyRentRoll = (float) Lease::where('status', 'active')
                ->whereHas('unit', fn ($q) => $q->where('property_id', $property->id))
                ->sum('rent_amount');

            return [
                'id'                   => $property->id,
                'code'                 => $property->code,
                'name'                 => $property->name,
                'type'                 => $property->type,
                'type_label'           => Property::$types[$property->type]['label'] ?? $property->type,
                'type_color'           => Property::$types[$property->type]['color'] ?? null,
                'status'               => $property->status,
                'status_label'         => Property::$statuses[$property->status]['label'] ?? $property->status,
                'status_color'         => Property::$statuses[$property->status]['color'] ?? null,
                'ownership'            => $property->ownership,
                'address'              => $property->address,
                'region'               => $property->region,
                'district'             => $property->district,
                'units_count'          => (int) $property->units_count,
                'occupied_units_count' => (int) $property->occupied_units_count,
                'monthly_rent_roll'    => $monthlyRentRoll,
            ];
        });

        return response()->json([
            'properties' => $properties,
            'stats'      => [
                'total'            => Property::count(),
                'occupied'         => Property::whereIn('status', ['occupied', 'partially_occupied'])->count(),
                'under_renovation' => Property::where('status', 'under_renovation')->count(),
                'monthly_roll'     => (float) Lease::where('status', 'active')->sum('rent_amount'),
            ],
            'types'    => Property::$types,
            'statuses' => Property::$statuses,
        ]);
    }

    // GET /api/staff/modules/real-estate/properties/{id} — one property with its
    // units (each w/ active-lease summary), recent expenses + financials.
    public function propertyShow($id): JsonResponse
    {
        $property = Property::query()
            ->withCount([
                'units',
                'units as occupied_units_count' => fn ($q) => $q->where('status', 'occupied'),
            ])
            ->findOrFail($id);

        $units = $property->units()
            ->with(['activeLease' => fn ($q) => $q->with('tenant:id,name')])
            ->orderBy('unit_number')
            ->get()
            ->map(function (PropertyUnit $unit) {
                $lease = $unit->activeLease;

                return [
                    'id'            => $unit->id,
                    'unit_number'   => $unit->unit_number,
                    'type'          => $unit->type,
                    'type_label'    => PropertyUnit::$types[$unit->type]['label'] ?? $unit->type,
                    'status'        => $unit->status,
                    'status_label'  => PropertyUnit::$statuses[$unit->status]['label'] ?? $unit->status,
                    'status_color'  => PropertyUnit::$statuses[$unit->status]['color'] ?? null,
                    'rent_amount'   => (float) $unit->rent_amount,
                    'rent_currency' => $unit->rent_currency,
                    'bedrooms'      => $unit->bedrooms,
                    'bathrooms'     => $unit->bathrooms,
                    'size_sqm'      => $unit->size_sqm !== null ? (float) $unit->size_sqm : null,
                    'active_lease'  => $lease ? [
                        'id'           => $lease->id,
                        'lease_number' => $lease->lease_number,
                        'tenant_name'  => $lease->tenant?->name,
                        'rent_amount'  => (float) $lease->rent_amount,
                        'start_date'   => $lease->start_date?->toDateString(),
                        'end_date'     => $lease->end_date?->toDateString(),
                    ] : null,
                ];
            })
            ->values();

        $expenses = $property->expenses()
            ->with('unit:id,unit_number')
            ->latest('expense_date')
            ->limit(10)
            ->get()
            ->map(fn (PropertyExpense $e) => [
                'id'             => $e->id,
                'category'       => $e->category,
                'category_label' => PropertyExpense::$categories[$e->category]['label'] ?? $e->category,
                'category_icon'  => PropertyExpense::$categories[$e->category]['icon'] ?? null,
                'description'    => $e->description,
                'amount'         => (float) $e->amount,
                'currency'       => $e->currency,
                'amount_tzs'     => (float) $e->amount_tzs,
                'expense_date'   => $e->expense_date?->toDateString(),
                'phase'          => $e->phase,
                'vendor'         => $e->vendor,
                'unit_label'     => $e->unit?->unit_number,
            ])
            ->values();

        $expenseTotal = (float) $property->expenses()->sum('amount_tzs');
        $renovationTotal = (float) $property->expenses()->where('category', 'renovation')->sum('amount_tzs');
        $annualRentRoll = (float) Lease::where('status', 'active')
            ->whereHas('unit', fn ($q) => $q->where('property_id', $property->id))
            ->sum('rent_amount');

        return response()->json([
            'property' => [
                'id'                   => $property->id,
                'code'                 => $property->code,
                'name'                 => $property->name,
                'type'                 => $property->type,
                'type_label'           => Property::$types[$property->type]['label'] ?? $property->type,
                'type_color'           => Property::$types[$property->type]['color'] ?? null,
                'status'               => $property->status,
                'status_label'         => Property::$statuses[$property->status]['label'] ?? $property->status,
                'status_color'         => Property::$statuses[$property->status]['color'] ?? null,
                'ownership'            => $property->ownership,
                'address'              => $property->address,
                'region'               => $property->region,
                'district'             => $property->district,
                'acquisition_date'     => $property->acquisition_date?->toDateString(),
                'purchase_currency'    => $property->purchase_currency,
                'market_value'         => $property->market_value !== null ? (float) $property->market_value : null,
                'title_deed_number'    => $property->title_deed_number,
                'title_deed_url'       => $property->title_deed_url,
                'description'          => $property->description,
                'notes'                => $property->notes,
                'units_count'          => (int) $property->units_count,
                'occupied_units_count' => (int) $property->occupied_units_count,
            ],
            'units'      => $units,
            'expenses'   => $expenses,
            'financials' => [
                'purchase_price'   => (float) $property->purchase_price,
                'renovation_total' => $renovationTotal,
                'total_invested'   => $property->total_invested,
                'annual_rent_roll' => $annualRentRoll,
                'expense_total'    => $expenseTotal,
            ],
            'types'        => Property::$types,
            'statuses'     => Property::$statuses,
            'unitTypes'    => PropertyUnit::$types,
            'unitStatuses' => PropertyUnit::$statuses,
        ]);
    }

    // ---------------------------------------------------------------------
    // Tenants
    // ---------------------------------------------------------------------

    // GET /api/staff/modules/real-estate/tenants — searchable, paginated list.
    public function tenants(Request $request): JsonResponse
    {
        $query = Tenant::query()->latest()
            ->withCount(['leases as active_leases_count' => fn ($q) => $q->where('status', 'active')]);

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                  ->orWhere('code', 'like', "%{$s}%")
                  ->orWhere('phone', 'like', "%{$s}%")
                  ->orWhere('company_name', 'like', "%{$s}%");
            });
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $tenants = $query->paginate(15)->withQueryString();

        $tenants->getCollection()->transform(fn (Tenant $t) => [
            'id'                  => $t->id,
            'code'                => $t->code,
            'name'                => $t->name,
            'type'                => $t->type,
            'type_label'          => Tenant::$types[$t->type]['label'] ?? $t->type,
            'type_color'          => Tenant::$types[$t->type]['color'] ?? null,
            'status'              => $t->status,
            'status_label'        => Tenant::$statuses[$t->status]['label'] ?? $t->status,
            'status_color'        => Tenant::$statuses[$t->status]['color'] ?? null,
            'phone'               => $t->phone,
            'email'               => $t->email,
            'company_name'        => $t->company_name,
            'active_leases_count' => (int) $t->active_leases_count,
        ]);

        return response()->json([
            'tenants' => $tenants,
            'stats'   => [
                'total'     => Tenant::count(),
                'active'    => Tenant::where('status', 'active')->count(),
                'companies' => Tenant::where('type', 'company')->count(),
            ],
            'types'    => Tenant::$types,
            'statuses' => Tenant::$statuses,
        ]);
    }

    // GET /api/staff/modules/real-estate/tenants/{id} — one tenant + their leases.
    public function tenantShow($id): JsonResponse
    {
        $tenant = Tenant::findOrFail($id);

        $leases = $tenant->leases()
            ->with(['unit.property:id,name'])
            ->latest('start_date')
            ->get()
            ->map(function (Lease $lease) {
                $property = $lease->unit?->property;
                $propertyLabel = $property && $lease->unit
                    ? "{$property->name} — {$lease->unit->unit_number}"
                    : null;

                return [
                    'id'             => $lease->id,
                    'lease_number'   => $lease->lease_number,
                    'property_label' => $propertyLabel,
                    'rent_amount'    => (float) $lease->rent_amount,
                    'rent_currency'  => $lease->rent_currency,
                    'billing_cycle'  => $lease->billing_cycle,
                    'start_date'     => $lease->start_date?->toDateString(),
                    'end_date'       => $lease->end_date?->toDateString(),
                    'status'         => $lease->status,
                    'status_label'   => Lease::$statuses[$lease->status]['label'] ?? $lease->status,
                    'status_color'   => Lease::$statuses[$lease->status]['color'] ?? null,
                ];
            })
            ->values();

        return response()->json([
            'tenant' => [
                'id'                      => $tenant->id,
                'code'                    => $tenant->code,
                'name'                    => $tenant->name,
                'type'                    => $tenant->type,
                'type_label'              => Tenant::$types[$tenant->type]['label'] ?? $tenant->type,
                'status'                  => $tenant->status,
                'status_label'            => Tenant::$statuses[$tenant->status]['label'] ?? $tenant->status,
                'status_color'            => Tenant::$statuses[$tenant->status]['color'] ?? null,
                'phone'                   => $tenant->phone,
                'phone_alt'               => $tenant->phone_alt,
                'email'                   => $tenant->email,
                'national_id'             => $tenant->national_id,
                'company_name'            => $tenant->company_name,
                'tin'                     => $tenant->tin,
                'address'                 => $tenant->address,
                'emergency_contact_name'  => $tenant->emergency_contact_name,
                'emergency_contact_phone' => $tenant->emergency_contact_phone,
                'notes'                   => $tenant->notes,
            ],
            'leases'   => $leases,
            'types'    => Tenant::$types,
            'statuses' => Tenant::$statuses,
        ]);
    }

    // ---------------------------------------------------------------------
    // Leases
    // ---------------------------------------------------------------------

    // GET /api/staff/modules/real-estate/leases — searchable, paginated list.
    public function leases(Request $request): JsonResponse
    {
        $query = Lease::query()->latest()->with(['unit.property', 'tenant']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('lease_number', 'like', "%{$s}%")
                  ->orWhereHas('tenant', fn ($t) => $t->where('name', 'like', "%{$s}%"))
                  ->orWhereHas('unit.property', fn ($p) => $p->where('name', 'like', "%{$s}%"));
            });
        }

        $leases = $query->paginate(15)->withQueryString();

        $leases->getCollection()->transform(function (Lease $lease) {
            $property = $lease->unit?->property;
            $propertyLabel = $property && $lease->unit
                ? "{$property->name} — {$lease->unit->unit_number}"
                : null;

            return [
                'id'             => $lease->id,
                'lease_number'   => $lease->lease_number,
                'tenant_name'    => $lease->tenant?->name,
                'property_label' => $propertyLabel,
                'rent_amount'    => (float) $lease->rent_amount,
                'rent_currency'  => $lease->rent_currency,
                'billing_cycle'  => $lease->billing_cycle,
                'start_date'     => $lease->start_date?->toDateString(),
                'end_date'       => $lease->end_date?->toDateString(),
                'status'         => $lease->status,
                'status_label'   => Lease::$statuses[$lease->status]['label'] ?? $lease->status,
                'status_color'   => Lease::$statuses[$lease->status]['color'] ?? null,
                'has_contract'   => (bool) $lease->contract_path,
            ];
        });

        return response()->json([
            'leases' => $leases,
            'stats'  => [
                'active'       => Lease::where('status', 'active')->count(),
                'expiring_30d' => Lease::where('status', 'active')
                    ->whereNotNull('end_date')
                    ->whereBetween('end_date', [now(), now()->addDays(30)])
                    ->count(),
                'expired'      => Lease::where('status', 'expired')->count(),
                'monthly_roll' => (float) Lease::where('status', 'active')->sum('rent_amount'),
            ],
            'statuses'      => Lease::$statuses,
            'billingCycles' => Lease::$billingCycles,
        ]);
    }

    // GET /api/staff/modules/real-estate/leases/{id} — one lease + unit/property/
    // tenant + its rent invoices (with amount_paid/balance_due).
    public function leaseShow($id): JsonResponse
    {
        $lease = Lease::with([
            'unit.property',
            'tenant',
            'rentInvoices' => fn ($q) => $q->with('payments')->latest('period_start'),
        ])->findOrFail($id);

        $property = $lease->unit?->property;
        $propertyLabel = $property && $lease->unit
            ? "{$property->name} — {$lease->unit->unit_number}"
            : null;

        $invoices = $lease->rentInvoices->map(fn (RentInvoice $inv) => [
            'id'             => $inv->id,
            'invoice_number' => $inv->invoice_number,
            'period_start'   => $inv->period_start?->toDateString(),
            'period_end'     => $inv->period_end?->toDateString(),
            'due_date'       => $inv->due_date?->toDateString(),
            'amount'         => (float) $inv->amount,
            'currency'       => $inv->currency,
            'status'         => $inv->status,
            'status_label'   => RentInvoice::$statuses[$inv->status]['label'] ?? $inv->status,
            'status_color'   => RentInvoice::$statuses[$inv->status]['color'] ?? null,
            'amount_paid'    => $inv->amount_paid,
            'balance_due'    => $inv->balance_due,
        ])->values();

        return response()->json([
            'lease' => [
                'id'                   => $lease->id,
                'lease_number'         => $lease->lease_number,
                'property_label'       => $propertyLabel,
                'property_id'          => $property?->id,
                'property_name'        => $property?->name,
                'unit_id'              => $lease->unit?->id,
                'unit_number'          => $lease->unit?->unit_number,
                'tenant_id'            => $lease->tenant?->id,
                'tenant_name'          => $lease->tenant?->name,
                'tenant_phone'         => $lease->tenant?->phone,
                'start_date'           => $lease->start_date?->toDateString(),
                'end_date'             => $lease->end_date?->toDateString(),
                'billing_cycle'        => $lease->billing_cycle,
                'rent_amount'          => (float) $lease->rent_amount,
                'rent_currency'        => $lease->rent_currency,
                'deposit_amount'       => (float) $lease->deposit_amount,
                'payment_day'          => $lease->payment_day,
                'status'               => $lease->status,
                'status_label'         => Lease::$statuses[$lease->status]['label'] ?? $lease->status,
                'status_color'         => Lease::$statuses[$lease->status]['color'] ?? null,
                'has_contract'         => (bool) $lease->contract_path,
                'contract_url'         => $lease->contract_url,
                'contract_uploaded_at' => $lease->contract_uploaded_at?->toIso8601String(),
                'terms'                => $lease->terms,
                'notes'                => $lease->notes,
            ],
            'invoices'      => $invoices,
            'statuses'      => Lease::$statuses,
            'billingCycles' => Lease::$billingCycles,
        ]);
    }

    // ---------------------------------------------------------------------
    // Rent invoices
    // ---------------------------------------------------------------------

    // GET /api/staff/modules/real-estate/rent-invoices — searchable, paginated.
    public function rentInvoices(Request $request): JsonResponse
    {
        $query = RentInvoice::query()->latest('period_start')
            ->with(['tenant:id,name', 'unit.property:id,name']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('invoice_number', 'like', "%{$s}%")
                  ->orWhereHas('tenant', fn ($t) => $t->where('name', 'like', "%{$s}%"))
                  ->orWhereHas('unit.property', fn ($p) => $p->where('name', 'like', "%{$s}%"));
            });
        }

        $invoices = $query->paginate(15)->withQueryString();

        $invoices->getCollection()->transform(function (RentInvoice $inv) {
            $property = $inv->unit?->property;
            $propertyLabel = $property && $inv->unit
                ? "{$property->name} — {$inv->unit->unit_number}"
                : ($property?->name);

            return [
                'id'             => $inv->id,
                'invoice_number' => $inv->invoice_number,
                'tenant_name'    => $inv->tenant?->name,
                'property_label' => $propertyLabel,
                'period_start'   => $inv->period_start?->toDateString(),
                'period_end'     => $inv->period_end?->toDateString(),
                'due_date'       => $inv->due_date?->toDateString(),
                'amount'         => (float) $inv->amount,
                'currency'       => $inv->currency,
                'status'         => $inv->status,
                'status_label'   => RentInvoice::$statuses[$inv->status]['label'] ?? $inv->status,
                'status_color'   => RentInvoice::$statuses[$inv->status]['color'] ?? null,
                'amount_paid'    => $inv->amount_paid,
                'balance_due'    => $inv->balance_due,
            ];
        });

        $overdueCount = RentInvoice::whereIn('status', ['unpaid', 'partial', 'overdue'])
            ->whereDate('due_date', '<', now())
            ->count();

        return response()->json([
            'invoices' => $invoices,
            'stats'    => [
                'total_billed'    => (float) RentInvoice::whereNotIn('status', ['cancelled'])->sum('amount'),
                'total_collected' => (float) RentInvoice::query()->get()->sum('amount_paid'),
                'outstanding'     => (float) RentInvoice::whereNotIn('status', ['cancelled'])->get()->sum('balance_due'),
                'overdue_count'   => $overdueCount,
            ],
            'statuses'       => RentInvoice::$statuses,
            'paymentMethods' => RentPayment::$methods,
        ]);
    }

    // ---------------------------------------------------------------------
    // Property expenses
    // ---------------------------------------------------------------------

    // GET /api/staff/modules/real-estate/expenses — searchable, paginated.
    public function expenses(Request $request): JsonResponse
    {
        $query = PropertyExpense::query()
            ->with(['property:id,name', 'unit:id,unit_number'])
            ->latest('expense_date');

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('description', 'like', "%{$s}%")
                  ->orWhere('vendor', 'like', "%{$s}%");
            });
        }
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }
        if ($request->filled('property_id')) {
            $query->where('property_id', $request->property_id);
        }
        if ($request->filled('phase')) {
            $query->where('phase', $request->phase);
        }

        $expenses = $query->paginate(15)->withQueryString();

        $expenses->getCollection()->transform(fn (PropertyExpense $e) => [
            'id'             => $e->id,
            'property_id'    => $e->property_id,
            'property_label' => $e->property?->name,
            'unit_label'     => $e->unit?->unit_number,
            'category'       => $e->category,
            'category_label' => PropertyExpense::$categories[$e->category]['label'] ?? $e->category,
            'category_icon'  => PropertyExpense::$categories[$e->category]['icon'] ?? null,
            'description'    => $e->description,
            'amount'         => (float) $e->amount,
            'currency'       => $e->currency,
            'amount_tzs'     => (float) $e->amount_tzs,
            'expense_date'   => $e->expense_date?->toDateString(),
            'phase'          => $e->phase,
            'phase_label'    => $e->phase ? (PropertyExpense::$phases[$e->phase]['label'] ?? $e->phase) : null,
            'vendor'         => $e->vendor,
            'receipt_number' => $e->receipt_number,
        ]);

        return response()->json([
            'expenses' => $expenses,
            'stats'    => [
                'total_tzs'      => (float) PropertyExpense::sum('amount_tzs'),
                'this_month_tzs' => (float) PropertyExpense::whereBetween('expense_date', [
                    now()->startOfMonth(), now()->endOfMonth(),
                ])->sum('amount_tzs'),
                'renovation_tzs' => (float) PropertyExpense::where('category', 'renovation')->sum('amount_tzs'),
            ],
            'categories' => PropertyExpense::$categories,
            'phases'     => PropertyExpense::$phases,
            'properties' => Property::orderBy('name')->get(['id', 'name']),
        ]);
    }

    // ---------------------------------------------------------------------
    // Write actions (record payment / add expense / upload mkataba)
    // Permission is enforced by the route middleware.
    // ---------------------------------------------------------------------

    // POST /api/staff/modules/real-estate/rent-invoices/{id}/payments
    public function storePayment(Request $request, $id): JsonResponse
    {
        $invoice = RentInvoice::findOrFail($id);

        $data = $request->validate([
            'amount'           => 'required|numeric|gt:0',
            'payment_date'     => 'required|date',
            'payment_method'   => ['required', Rule::in(array_keys(RentPayment::$methods))],
            'reference_number' => 'nullable|string|max:60',
            'notes'            => 'nullable|string|max:200',
            'receipt'          => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
        ]);

        $receiptPath = $request->hasFile('receipt')
            ? $request->file('receipt')->store("rent/{$invoice->id}", 'public')
            : null;

        RentPayment::create([
            'rent_invoice_id'  => $invoice->id,
            'lease_id'         => $invoice->lease_id,
            'amount'           => $data['amount'],
            'currency'         => $invoice->currency,
            'payment_date'     => $data['payment_date'],
            'payment_method'   => $data['payment_method'],
            'reference_number' => $data['reference_number'] ?? null,
            'receipt_path'     => $receiptPath,
            'notes'            => $data['notes'] ?? null,
            'created_by'       => $request->user()?->id,
        ]);

        $invoice->refresh()->recalcStatus();
        $invoice->refresh();

        return response()->json([
            'message' => 'Payment recorded.',
            'invoice' => [
                'id'           => $invoice->id,
                'status'       => $invoice->status,
                'status_label' => RentInvoice::$statuses[$invoice->status]['label'] ?? $invoice->status,
                'status_color' => RentInvoice::$statuses[$invoice->status]['color'] ?? null,
                'amount_paid'  => $invoice->amount_paid,
                'balance_due'  => $invoice->balance_due,
            ],
        ]);
    }

    // POST /api/staff/modules/real-estate/expenses
    public function storeExpense(Request $request): JsonResponse
    {
        $data = $request->validate([
            'property_id'      => 'required|exists:properties,id',
            'property_unit_id' => 'nullable|exists:property_units,id',
            'category'         => ['required', Rule::in(array_keys(PropertyExpense::$categories))],
            'description'      => 'required|string|max:200',
            'amount'           => 'required|numeric',
            'currency'         => ['required', Rule::in(self::CURRENCIES)],
            'exchange_rate'    => 'nullable|numeric',
            'expense_date'     => 'required|date',
            'phase'            => ['nullable', Rule::in(array_keys(PropertyExpense::$phases))],
            'vendor'           => 'nullable|string|max:120',
            'receipt_number'   => 'nullable|string|max:60',
            'receipt'          => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:10240',
        ]);

        $data['amount_tzs'] = $data['currency'] === 'TZS'
            ? (float) $data['amount']
            : (float) $data['amount'] * (float) ($data['exchange_rate'] ?? 1);

        if ($request->hasFile('receipt')) {
            $data['receipt_path'] = $request->file('receipt')
                ->store("property-expenses/{$data['property_id']}", 'public');
        }
        unset($data['receipt']);

        $data['created_by'] = $request->user()?->id;

        $expense = PropertyExpense::create($data);

        return response()->json([
            'message' => 'Expense recorded.',
            'expense' => ['id' => $expense->id, 'amount_tzs' => (float) $expense->amount_tzs],
        ], 201);
    }

    // POST /api/staff/modules/real-estate/leases/{id}/contract  (multipart)
    public function uploadContract(Request $request, $id): JsonResponse
    {
        $lease = Lease::findOrFail($id);

        $request->validate([
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png,doc,docx|max:10240',
        ]);

        if ($lease->contract_path) {
            Storage::disk('public')->delete($lease->contract_path);
        }

        $path = $request->file('file')->store("leases/{$lease->id}", 'public');

        $lease->update([
            'contract_path'        => $path,
            'contract_uploaded_at' => now(),
        ]);

        $lease->refresh();

        return response()->json([
            'message'              => 'Contract uploaded.',
            'has_contract'         => true,
            'contract_url'         => $lease->contract_url,
            'contract_uploaded_at' => $lease->contract_uploaded_at?->toIso8601String(),
        ]);
    }
}