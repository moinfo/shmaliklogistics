<?php

namespace App\Http\Controllers\System;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\Trip;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExpenseController extends Controller
{
    public function index(Request $request)
    {
        $query = Expense::with('trip')->latest('expense_date');

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('description', 'like', "%{$s}%")
                  ->orWhere('vehicle_plate', 'like', "%{$s}%")
                  ->orWhere('receipt_number', 'like', "%{$s}%")
                  ->orWhereHas('trip', fn ($tq) => $tq->where('trip_number', 'like', "%{$s}%"));
            });
        }
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        $expenses = $query->paginate(20)->withQueryString();

        $stats = [
            'total_count'  => Expense::count(),
            'total_amount' => Expense::where('currency', 'TZS')->sum('amount'),
            'this_month'   => Expense::where('currency', 'TZS')
                ->whereMonth('expense_date', now()->month)
                ->whereYear('expense_date', now()->year)
                ->sum('amount'),
            'by_category'  => Expense::where('currency', 'TZS')
                ->groupBy('category')
                ->selectRaw('category, SUM(amount) as total')
                ->pluck('total', 'category'),
        ];

        return Inertia::render('system/Expenses/Index', [
            'expenses'   => $expenses,
            'stats'      => $stats,
            'categories' => Expense::$categories,
            'filters'    => $request->only(['search', 'category']),
        ]);
    }

    public function create(Request $request)
    {
        return Inertia::render('system/Expenses/Create', [
            'categories'  => Expense::$categories,
            'currencies'  => Expense::$currencies,
            'trips'       => Trip::latest()->limit(60)->get(['id', 'trip_number', 'route_from', 'route_to', 'vehicle_plate']),
            'vehicles'    => Vehicle::orderBy('plate')->get(['id', 'plate', 'make', 'model_name']),
            'prefillTrip' => $request->trip_id,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'trip_id'        => 'nullable|exists:trips,id',
            'vehicle_plate'  => 'nullable|string|max:20',
            'category'       => 'required|in:' . implode(',', array_keys(Expense::$categories)),
            'description'    => 'nullable|string|max:255',
            'amount'         => 'required|numeric|min:0.01',
            'currency'       => 'required|string|max:10',
            'expense_date'   => 'required|date',
            'receipt_number' => 'nullable|string|max:80',
            'notes'          => 'nullable|string',
        ]);

        $data['created_by'] = $request->user()->id;
        Expense::create($data);

        return redirect()->route('system.expenses.index')
            ->with('success', 'Expense recorded.');
    }

    public function edit(Expense $expense)
    {
        return Inertia::render('system/Expenses/Edit', [
            'expense'    => $expense,
            'categories' => Expense::$categories,
            'currencies' => Expense::$currencies,
            'trips'      => Trip::latest()->limit(60)->get(['id', 'trip_number', 'route_from', 'route_to', 'vehicle_plate']),
            'vehicles'   => Vehicle::orderBy('plate')->get(['id', 'plate', 'make', 'model_name']),
        ]);
    }

    public function update(Request $request, Expense $expense)
    {
        $data = $request->validate([
            'trip_id'        => 'nullable|exists:trips,id',
            'vehicle_plate'  => 'nullable|string|max:20',
            'category'       => 'required|in:' . implode(',', array_keys(Expense::$categories)),
            'description'    => 'nullable|string|max:255',
            'amount'         => 'required|numeric|min:0.01',
            'currency'       => 'required|string|max:10',
            'expense_date'   => 'required|date',
            'receipt_number' => 'nullable|string|max:80',
            'notes'          => 'nullable|string',
        ]);

        $expense->update($data);

        return redirect()->route('system.expenses.index')
            ->with('success', 'Expense updated.');
    }

    public function destroy(Expense $expense)
    {
        $expense->delete();
        return back()->with('success', 'Expense deleted.');
    }
}
