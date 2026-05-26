<?php

namespace App\Http\Controllers\System\RealEstate;

use App\Http\Controllers\Controller;
use App\Models\Lease;
use App\Models\PropertyUnit;
use App\Models\RentPayment;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class LeaseController extends Controller
{
    private const CURRENCIES = ['TZS', 'USD', 'KES', 'ZMW', 'MWK', 'MZN'];

    public function index(Request $request)
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
                : '—';

            return [
                'id'            => $lease->id,
                'lease_number'  => $lease->lease_number,
                'tenant_name'   => $lease->tenant?->name,
                'property_label' => $propertyLabel,
                'rent_amount'   => $lease->rent_amount,
                'rent_currency' => $lease->rent_currency,
                'billing_cycle' => $lease->billing_cycle,
                'start_date'    => $lease->start_date,
                'end_date'      => $lease->end_date,
                'status'        => $lease->status,
                'has_contract'  => (bool) $lease->contract_path,
            ];
        });

        $stats = [
            'active'       => Lease::where('status', 'active')->count(),
            'expiring_30d' => Lease::where('status', 'active')
                ->whereNotNull('end_date')
                ->whereBetween('end_date', [now(), now()->addDays(30)])
                ->count(),
            'expired'      => Lease::where('status', 'expired')->count(),
            'monthly_roll' => (float) Lease::where('status', 'active')->sum('rent_amount'),
        ];

        return Inertia::render('system/RealEstate/Leases/Index', [
            'leases'        => $leases,
            'stats'         => $stats,
            'statuses'      => Lease::$statuses,
            'billingCycles' => Lease::$billingCycles,
            'filters'       => $request->only(['search', 'status']),
        ]);
    }

    public function create(Request $request)
    {
        return Inertia::render('system/RealEstate/Leases/Create', [
            'units'         => $this->unitOptions(),
            'tenants'       => $this->tenantOptions(),
            'billingCycles' => Lease::$billingCycles,
            'currencies'    => self::CURRENCIES,
            'statuses'      => Lease::$statuses,
            'unit_id'       => $request->query('unit_id'),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validateLease($request);

        $data['lease_number'] = Lease::nextNumber();
        $data['created_by'] = $request->user()->id;

        $lease = Lease::create($data);

        if ($lease->status === 'active') {
            PropertyUnit::where('id', $lease->property_unit_id)->update(['status' => 'occupied']);
        }

        return redirect()->route('system.real-estate.leases.show', $lease)
            ->with('success', "Lease {$lease->lease_number} created.");
    }

    public function show(Lease $lease)
    {
        $lease->load([
            'unit.property',
            'tenant',
            'rentInvoices' => fn ($q) => $q->with('payments')->latest('period_start'),
        ]);

        $invoices = $lease->rentInvoices->map(fn ($inv) => [
            'id'             => $inv->id,
            'invoice_number' => $inv->invoice_number,
            'period_start'   => $inv->period_start,
            'period_end'     => $inv->period_end,
            'due_date'       => $inv->due_date,
            'amount'         => $inv->amount,
            'currency'       => $inv->currency,
            'status'         => $inv->status,
            'amount_paid'    => $inv->amount_paid,
            'balance_due'    => $inv->balance_due,
        ])->values();

        return Inertia::render('system/RealEstate/Leases/Show', [
            'lease'          => $lease,
            'invoices'       => $invoices,
            'statuses'       => Lease::$statuses,
            'billingCycles'  => Lease::$billingCycles,
            'paymentMethods' => RentPayment::$methods,
        ]);
    }

    public function edit(Lease $lease)
    {
        return Inertia::render('system/RealEstate/Leases/Edit', [
            'lease'         => $lease,
            'units'         => $this->unitOptions($lease->property_unit_id),
            'tenants'       => $this->tenantOptions(),
            'billingCycles' => Lease::$billingCycles,
            'currencies'    => self::CURRENCIES,
            'statuses'      => Lease::$statuses,
        ]);
    }

    public function update(Request $request, Lease $lease)
    {
        $data = $this->validateLease($request);

        $previousUnitId = $lease->property_unit_id;
        $lease->update($data);

        // Free the previous unit if the unit changed.
        if ($previousUnitId !== $lease->property_unit_id) {
            PropertyUnit::where('id', $previousUnitId)
                ->where('status', 'occupied')
                ->update(['status' => 'vacant']);
        }

        if ($lease->status === 'active') {
            PropertyUnit::where('id', $lease->property_unit_id)->update(['status' => 'occupied']);
        } else {
            PropertyUnit::where('id', $lease->property_unit_id)
                ->where('status', 'occupied')
                ->update(['status' => 'vacant']);
        }

        return redirect()->route('system.real-estate.leases.show', $lease)
            ->with('success', "Lease {$lease->lease_number} updated.");
    }

    public function destroy(Lease $lease)
    {
        if ($lease->status === 'active') {
            PropertyUnit::where('id', $lease->property_unit_id)
                ->where('status', 'occupied')
                ->update(['status' => 'vacant']);
        }

        $lease->delete();

        return redirect()->route('system.real-estate.leases.index')
            ->with('success', "Lease {$lease->lease_number} removed.");
    }

    public function uploadContract(Request $request, Lease $lease)
    {
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

        return back()->with('success', 'Contract uploaded.');
    }

    public function updateStatus(Request $request, Lease $lease)
    {
        $request->validate([
            'status' => 'required|in:' . implode(',', array_keys(Lease::$statuses)),
        ]);

        $lease->update(['status' => $request->status]);

        if ($lease->status === 'active') {
            PropertyUnit::where('id', $lease->property_unit_id)->update(['status' => 'occupied']);
        } elseif (in_array($lease->status, ['terminated', 'expired'], true)) {
            PropertyUnit::where('id', $lease->property_unit_id)
                ->where('status', 'occupied')
                ->update(['status' => 'vacant']);
        }

        return back()->with('success', 'Lease status updated.');
    }

    private function validateLease(Request $request): array
    {
        return $request->validate([
            'property_unit_id' => 'required|exists:property_units,id',
            'tenant_id'        => 'required|exists:tenants,id',
            'start_date'       => 'required|date',
            'end_date'         => 'nullable|date|after_or_equal:start_date',
            'billing_cycle'    => 'required|in:' . implode(',', array_keys(Lease::$billingCycles)),
            'rent_amount'      => 'required|numeric',
            'rent_currency'    => 'required|in:' . implode(',', self::CURRENCIES),
            'deposit_amount'   => 'nullable|numeric',
            'payment_day'      => 'nullable|integer|min:1|max:28',
            'status'           => 'required|in:' . implode(',', array_keys(Lease::$statuses)),
            'terms'            => 'nullable|string',
            'notes'            => 'nullable|string',
        ]);
    }

    private function unitOptions(?int $includeUnitId = null): array
    {
        return PropertyUnit::query()
            ->where(function ($q) use ($includeUnitId) {
                $q->whereIn('status', ['vacant', 'reserved']);
                if ($includeUnitId) {
                    $q->orWhere('id', $includeUnitId);
                }
            })
            ->with('property')
            ->get()
            ->map(fn (PropertyUnit $unit) => [
                'value'                 => $unit->id,
                'label'                 => "{$unit->property?->name} — {$unit->unit_number} ({$unit->rent_currency} {$unit->rent_amount})",
                'rent_amount'           => $unit->rent_amount,
                'rent_currency'         => $unit->rent_currency,
                'default_billing_cycle' => $unit->default_billing_cycle,
            ])
            ->values()
            ->toArray();
    }

    private function tenantOptions(): array
    {
        return Tenant::where('status', 'active')
            ->orderBy('name')
            ->get()
            ->map(fn (Tenant $tenant) => [
                'value' => $tenant->id,
                'label' => "{$tenant->name} ({$tenant->phone})",
            ])
            ->values()
            ->toArray();
    }
}