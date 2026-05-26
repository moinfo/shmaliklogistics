<?php

namespace App\Http\Controllers\System\RealEstate;

use App\Http\Controllers\Controller;
use App\Models\Property;
use App\Models\PropertyExpense;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class PropertyExpenseController extends Controller
{
    private const CURRENCIES = ['TZS', 'USD', 'KES', 'ZMW', 'MWK', 'MZN'];

    public function index(Request $request)
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

        $expenses = $query->paginate(15)->withQueryString()->through(fn (PropertyExpense $e) => [
            'id'           => $e->id,
            'property_id'      => $e->property_id,
            'property_unit_id' => $e->property_unit_id,
            'property_label' => $e->property?->name,
            'unit_label'   => $e->unit?->unit_number ?? '—',
            'category'     => $e->category,
            'description'  => $e->description,
            'amount'       => $e->amount,
            'currency'     => $e->currency,
            'exchange_rate' => $e->exchange_rate,
            'amount_tzs'   => $e->amount_tzs,
            'expense_date' => $e->expense_date,
            'phase'        => $e->phase,
            'vendor'       => $e->vendor,
            'receipt_number' => $e->receipt_number,
            'receipt_url'  => $e->receipt_url,
        ]);

        $stats = [
            'total_tzs'      => (float) PropertyExpense::sum('amount_tzs'),
            'this_month_tzs' => (float) PropertyExpense::whereBetween('expense_date', [
                now()->startOfMonth(), now()->endOfMonth(),
            ])->sum('amount_tzs'),
            'renovation_tzs' => (float) PropertyExpense::where('category', 'renovation')->sum('amount_tzs'),
        ];

        return Inertia::render('system/RealEstate/Expenses/Index', [
            'expenses'   => $expenses,
            'stats'      => $stats,
            'categories' => PropertyExpense::$categories,
            'phases'     => array_keys(PropertyExpense::$phases),
            'properties' => Property::orderBy('name')->get(['id', 'name']),
            'currencies' => self::CURRENCIES,
            'filters'    => $request->only(['search', 'category', 'property_id', 'phase']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->validateExpense($request);

        $data['amount_tzs'] = $this->computeAmountTzs($data);

        if ($request->hasFile('receipt')) {
            $data['receipt_path'] = $request->file('receipt')
                ->store("property-expenses/{$data['property_id']}", 'public');
        }

        unset($data['receipt']);

        $data['created_by'] = $request->user()->id;

        PropertyExpense::create($data);

        return back()->with('success', 'Expense recorded.');
    }

    public function update(Request $request, PropertyExpense $expense)
    {
        $data = $this->validateExpense($request);

        $data['amount_tzs'] = $this->computeAmountTzs($data);

        if ($request->hasFile('receipt')) {
            if ($expense->receipt_path) {
                Storage::disk('public')->delete($expense->receipt_path);
            }
            $data['receipt_path'] = $request->file('receipt')
                ->store("property-expenses/{$data['property_id']}", 'public');
        }

        unset($data['receipt']);

        $expense->update($data);

        return back()->with('success', 'Expense updated.');
    }

    public function destroy(PropertyExpense $expense)
    {
        if ($expense->receipt_path) {
            Storage::disk('public')->delete($expense->receipt_path);
        }

        $expense->delete();

        return back()->with('success', 'Expense removed.');
    }

    private function validateExpense(Request $request): array
    {
        return $request->validate([
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
    }

    private function computeAmountTzs(array $data): float
    {
        return $data['currency'] === 'TZS'
            ? (float) $data['amount']
            : (float) $data['amount'] * (float) ($data['exchange_rate'] ?? 1);
    }
}