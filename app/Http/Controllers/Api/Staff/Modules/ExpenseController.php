<?php

namespace App\Http\Controllers\Api\Staff\Modules;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use Illuminate\Http\Request;

/**
 * Read-only staff API for recorded expenses (Module #4).
 *
 * Mirrors the data of System\ExpenseController but returns flat JSON
 * envelopes for the mobile app. Auth/scope is enforced by the route's
 * `permission:` middleware.
 */
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

        $expenses->getCollection()->transform(fn ($e) => $this->transform($e));

        return response()->json(['expenses' => $expenses]);
    }

    public function show($id)
    {
        $expense = Expense::with('trip')->findOrFail($id);

        return response()->json(['expense' => $this->transform($expense)]);
    }

    /**
     * Flatten an expense for the mobile client. Adds the human-readable
     * category label and the related trip number/route inline.
     */
    private function transform(Expense $e): array
    {
        $trip     = $e->trip;
        $category = Expense::$categories[$e->category] ?? null;

        return [
            'id'             => $e->id,
            'trip_id'        => $e->trip_id,
            'trip_number'    => $trip?->trip_number,
            'trip_route'     => $this->tripRoute($trip),
            'vehicle_plate'  => $e->vehicle_plate,
            'category'       => $e->category,
            'category_label' => $category['label'] ?? $e->category,
            'category_icon'  => $category['icon'] ?? null,
            'description'    => $e->description,
            'amount'         => $e->amount,
            'currency'       => $e->currency,
            'expense_date'   => optional($e->expense_date)->toDateString(),
            'receipt_number' => $e->receipt_number,
            'notes'          => $e->notes,
            'created_at'     => optional($e->created_at)->toIso8601String(),
        ];
    }

    private function tripRoute($trip): ?string
    {
        if (! $trip) {
            return null;
        }

        $parts = array_filter([$trip->route_from, $trip->route_to]);

        return empty($parts) ? null : implode(' → ', $parts);
    }
}
