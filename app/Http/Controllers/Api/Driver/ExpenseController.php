<?php

namespace App\Http\Controllers\Api\Driver;

use App\Http\Controllers\Controller;
use App\Models\Trip;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ExpenseController extends Controller
{
    public function update(Request $request, Trip $trip): JsonResponse
    {
        $driver = $request->user()->driver;

        if ($trip->driver_id !== $driver->id) {
            return response()->json(['message' => 'That trip is not assigned to you.'], 403);
        }

        if (! in_array($trip->status, ['planned', 'loading', 'in_transit', 'at_border', 'delivered'])) {
            return response()->json(['message' => 'Trip is closed and can no longer be edited.'], 422);
        }

        $data = $request->validate([
            'road_fines'   => 'required|numeric|min:0',
            'guard_fees'   => 'required|numeric|min:0',
            'border_costs' => 'required|numeric|min:0',
            'notes'        => 'nullable|string|max:2000',
        ]);

        if (! empty($data['notes'])) {
            $line = "[" . now()->format('Y-m-d H:i') . " — {$driver->name}] " . $data['notes'];
            $existing = trim($trip->notes ?? '');
            $trip->notes = $existing ? $existing . "\n" . $line : $line;
        }

        $trip->road_fines   = $data['road_fines'];
        $trip->guard_fees   = $data['guard_fees'];
        $trip->border_costs = $data['border_costs'];
        $trip->save();

        return response()->json([
            'message' => 'Expenses saved.',
            'trip'    => $trip->fresh(['expenses'])->append(['total_costs']),
        ]);
    }

    public function uploadReceipt(Request $request, Trip $trip): JsonResponse
    {
        $driver = $request->user()->driver;

        if ($trip->driver_id !== $driver->id) {
            return response()->json(['message' => 'That trip is not assigned to you.'], 403);
        }

        $request->validate([
            'receipt' => 'required|file|mimes:pdf,jpg,jpeg,png,webp|max:10240',
        ]);

        if ($trip->expense_receipt_path) {
            Storage::disk('public')->delete($trip->expense_receipt_path);
        }

        $path = $request->file('receipt')->store("trips/{$trip->id}/receipts", 'public');
        $trip->update(['expense_receipt_path' => $path]);

        return response()->json([
            'message'     => 'Receipt uploaded.',
            'receipt_url' => $trip->expense_receipt_url,
        ]);
    }
}