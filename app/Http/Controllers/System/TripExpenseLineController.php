<?php

namespace App\Http\Controllers\System;

use App\Http\Controllers\Controller;
use App\Models\Trip;
use App\Models\TripExpenseLine;
use Illuminate\Http\Request;

class TripExpenseLineController extends Controller
{
    public function store(Request $request, Trip $trip)
    {
        $data = $request->validate([
            'category'      => 'required|string|max:30',
            'description'   => 'nullable|string|max:200',
            'quantity'      => 'required|numeric|min:0.001',
            'unit_price'    => 'required|numeric|min:0',
            'currency'      => 'required|string|max:3',
            'exchange_rate' => 'nullable|numeric|min:0',
        ]);

        $amount    = round((float) $data['quantity'] * (float) $data['unit_price'], 2);
        $rate      = (float) ($data['exchange_rate'] ?? 1) ?: 1;
        $amountTzs = $data['currency'] === 'TZS' ? $amount : round($amount * $rate, 2);

        $trip->expenseLines()->create([
            ...$data,
            'amount'     => $amount,
            'amount_tzs' => $amountTzs,
            'sort_order' => $trip->expenseLines()->count(),
            'created_by' => $request->user()->id,
        ]);

        return back()->with('success', 'Line added.');
    }

    public function destroy(Trip $trip, TripExpenseLine $line)
    {
        abort_if($line->trip_id !== $trip->id, 403);
        $line->delete();
        return back()->with('success', 'Line removed.');
    }
}
