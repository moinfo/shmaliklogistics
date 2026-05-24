<?php

namespace App\Http\Controllers\System;

use App\Http\Controllers\Controller;
use App\Models\InventoryCategory;
use App\Models\InventoryItem;
use App\Models\InventoryMovement;
use App\Models\InventorySerial;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class InventoryController extends Controller
{
    public function index(Request $request)
    {
        $query = InventoryItem::with('category')->latest();

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                  ->orWhere('part_number', 'like', "%{$s}%");
            });
        }
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }
        if ($request->filled('low_stock')) {
            $query->whereRaw('current_stock <= reorder_level')->where('reorder_level', '>', 0);
        }

        $items = $query->paginate(20)->withQueryString();

        $stats = [
            'total_items'    => InventoryItem::where('is_active', true)->count(),
            'low_stock'      => InventoryItem::whereRaw('current_stock <= reorder_level')->where('reorder_level', '>', 0)->count(),
            'total_value'    => InventoryItem::selectRaw('SUM(current_stock * unit_cost) as val')->value('val') ?? 0,
            'categories'     => InventoryCategory::count(),
        ];

        return Inertia::render('system/Inventory/Index', [
            'items'      => $items,
            'categories' => InventoryCategory::orderBy('name')->get(),
            'stats'      => $stats,
            'filters'    => $request->only(['search', 'category_id', 'low_stock']),
        ]);
    }

    public function create()
    {
        return Inertia::render('system/Inventory/Create', [
            'categories' => InventoryCategory::orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'           => 'required|string|max:255',
            'category_id'    => 'nullable|exists:inventory_categories,id',
            'part_number'    => 'nullable|string|max:100',
            'unit'           => 'required|string|max:30',
            'tracks_serials' => 'boolean',
            'tracks_batch'   => 'boolean',
            'reorder_level'  => 'nullable|numeric|min:0',
            'unit_cost'      => 'nullable|numeric|min:0',
            'location'       => 'nullable|string|max:100',
            'notes'          => 'nullable|string',
            'is_active'      => 'boolean',
        ]);

        // Serial and batch are mutually exclusive; serial wins if both arrive.
        if (! empty($data['tracks_serials'])) {
            $data['tracks_batch'] = false;
        }

        $data['created_by'] = $request->user()->id;
        $item = InventoryItem::create($data);

        return redirect()->route('system.inventory.show', $item)
            ->with('success', "Item '{$item->name}' created.");
    }

    public function show(InventoryItem $item)
    {
        $item->load('category');
        $movements = InventoryMovement::where('item_id', $item->id)
            ->with(['vehicle', 'creator'])
            ->latest()
            ->paginate(20);

        $serials = $item->tracks_serials
            ? InventorySerial::where('item_id', $item->id)
                ->with(['vehicle', 'issuedMovement'])
                ->orderByRaw("CASE WHEN status='in_stock' THEN 0 ELSE 1 END")
                ->orderByDesc('created_at')
                ->get()
            : collect();

        return Inertia::render('system/Inventory/Show', [
            'item'         => $item,
            'movements'    => $movements,
            'serials'      => $serials,
            'inStockCount' => $item->tracks_serials
                ? InventorySerial::where('item_id', $item->id)->where('status', 'in_stock')->count()
                : null,
            'vehicles'     => Vehicle::where('status', 'active')->orderBy('plate')->get(['id', 'plate', 'make', 'model_name']),
            'movTypes'     => InventoryMovement::$types,
        ]);
    }

    public function update(Request $request, InventoryItem $item)
    {
        $data = $request->validate([
            'name'           => 'required|string|max:255',
            'category_id'    => 'nullable|exists:inventory_categories,id',
            'part_number'    => 'nullable|string|max:100',
            'unit'           => 'required|string|max:30',
            'tracks_serials' => 'boolean',
            'tracks_batch'   => 'boolean',
            'reorder_level'  => 'nullable|numeric|min:0',
            'unit_cost'      => 'nullable|numeric|min:0',
            'location'       => 'nullable|string|max:100',
            'notes'          => 'nullable|string',
            'is_active'      => 'boolean',
        ]);

        if (! empty($data['tracks_serials'])) {
            $data['tracks_batch'] = false;
        }

        // Block disabling serial tracking once any serial exists for this item.
        if ($item->tracks_serials && empty($data['tracks_serials'])
            && InventorySerial::where('item_id', $item->id)->exists()) {
            return back()->withErrors([
                'tracks_serials' => 'Cannot disable serial tracking — this item already has serial records.',
            ]);
        }

        $item->update($data);
        return back()->with('success', 'Item updated.');
    }

    public function destroy(InventoryItem $item)
    {
        $name = $item->name;
        $item->delete();
        return redirect()->route('system.inventory.index')
            ->with('success', "Item '{$name}' deleted.");
    }

    public function stockIn(Request $request, InventoryItem $item)
    {
        if ($item->tracks_serials) {
            return $this->stockInBySerial($request, $item);
        }

        $data = $request->validate([
            'quantity'     => 'required|numeric|min:0.001',
            'unit_cost'    => 'nullable|numeric|min:0',
            'reference'    => 'nullable|string|max:100',
            // Lot number is required when the item is batch-tracked (traceability).
            'batch_number' => ($item->tracks_batch ? 'required' : 'nullable') . '|string|max:100',
            'vehicle_id'   => 'nullable|exists:vehicles,id',
            'notes'        => 'nullable|string',
        ]);

        $newStock = $item->current_stock + $data['quantity'];
        $item->update(['current_stock' => $newStock]);
        if (isset($data['unit_cost'])) {
            $item->update(['unit_cost' => $data['unit_cost']]);
        }

        InventoryMovement::create([
            'item_id'      => $item->id,
            'type'         => 'in',
            'quantity'     => $data['quantity'],
            'unit_cost'    => $data['unit_cost'] ?? $item->unit_cost,
            'balance_after'=> $newStock,
            'reference'    => $data['reference'] ?? null,
            'batch_number' => $data['batch_number'] ?? null,
            'vehicle_id'   => $data['vehicle_id'] ?? null,
            'notes'        => $data['notes'] ?? null,
            'created_by'   => $request->user()->id,
        ]);

        return back()->with('success', "Stock in recorded. New balance: {$newStock} {$item->unit}.");
    }

    private function stockInBySerial(Request $request, InventoryItem $item)
    {
        $data = $request->validate([
            'serials'     => 'required|array|min:1',
            'serials.*'   => 'required|string|max:120',
            'unit_cost'   => 'nullable|numeric|min:0',
            'reference'   => 'nullable|string|max:100',
            'vehicle_id'  => 'nullable|exists:vehicles,id',
            'notes'       => 'nullable|string',
        ]);

        $serials = collect($data['serials'])
            ->map(fn($s) => trim($s))
            ->filter()
            ->unique()
            ->values();

        if ($serials->isEmpty()) {
            return back()->withErrors(['serials' => 'Enter at least one serial number.']);
        }

        // Block duplicates already on file for this item.
        $existing = InventorySerial::where('item_id', $item->id)
            ->whereIn('serial', $serials)
            ->pluck('serial')
            ->all();

        if (!empty($existing)) {
            return back()->withErrors([
                'serials' => 'Already on file: ' . implode(', ', $existing),
            ]);
        }

        DB::transaction(function () use ($item, $serials, $data, $request) {
            $qty      = $serials->count();
            $newStock = $item->current_stock + $qty;
            $updates  = ['current_stock' => $newStock];
            if (isset($data['unit_cost'])) {
                $updates['unit_cost'] = $data['unit_cost'];
            }
            $item->update($updates);

            $movement = InventoryMovement::create([
                'item_id'       => $item->id,
                'type'          => 'in',
                'quantity'      => $qty,
                'unit_cost'     => $data['unit_cost'] ?? $item->unit_cost,
                'balance_after' => $newStock,
                'reference'     => $data['reference'] ?? null,
                'vehicle_id'    => $data['vehicle_id'] ?? null,
                'notes'         => $data['notes'] ?? null,
                'serials'       => $serials->all(),
                'created_by'    => $request->user()->id,
            ]);

            foreach ($serials as $serial) {
                InventorySerial::create([
                    'item_id'              => $item->id,
                    'serial'               => $serial,
                    'status'               => 'in_stock',
                    'received_movement_id' => $movement->id,
                    'received_at'          => now(),
                ]);
            }
        });

        return back()->with('success', "Received {$serials->count()} serial(s).");
    }

    public function stockOut(Request $request, InventoryItem $item)
    {
        if ($item->tracks_serials) {
            return $this->stockOutBySerial($request, $item);
        }

        $data = $request->validate([
            'quantity'     => 'required|numeric|min:0.001',
            'reference'    => 'nullable|string|max:100',
            'batch_number' => 'nullable|string|max:100',
            'vehicle_id'   => 'nullable|exists:vehicles,id',
            'notes'        => 'nullable|string',
        ]);

        if ($data['quantity'] > $item->current_stock) {
            return back()->withErrors(['quantity' => "Cannot remove {$data['quantity']} {$item->unit} — only {$item->current_stock} available."]);
        }

        $newStock = $item->current_stock - $data['quantity'];
        $item->update(['current_stock' => $newStock]);

        InventoryMovement::create([
            'item_id'      => $item->id,
            'type'         => 'out',
            'quantity'     => $data['quantity'],
            'unit_cost'    => $item->unit_cost,
            'balance_after'=> $newStock,
            'reference'    => $data['reference'] ?? null,
            'batch_number' => $data['batch_number'] ?? null,
            'vehicle_id'   => $data['vehicle_id'] ?? null,
            'notes'        => $data['notes'] ?? null,
            'created_by'   => $request->user()->id,
        ]);

        return back()->with('success', "Stock out recorded. New balance: {$newStock} {$item->unit}.");
    }

    private function stockOutBySerial(Request $request, InventoryItem $item)
    {
        $data = $request->validate([
            'serials'     => 'required|array|min:1',
            'serials.*'   => 'required|string|max:120',
            'reference'   => 'nullable|string|max:100',
            'vehicle_id'  => 'nullable|exists:vehicles,id',
            'notes'       => 'nullable|string',
        ]);

        $serials = collect($data['serials'])
            ->map(fn($s) => trim($s))
            ->filter()
            ->unique()
            ->values();

        if ($serials->isEmpty()) {
            return back()->withErrors(['serials' => 'Select at least one serial number to issue.']);
        }

        $records = InventorySerial::where('item_id', $item->id)
            ->whereIn('serial', $serials)
            ->get();

        $foundMap = $records->keyBy('serial');
        $missing  = $serials->reject(fn($s) => $foundMap->has($s))->values();
        if ($missing->isNotEmpty()) {
            return back()->withErrors([
                'serials' => 'Unknown serial(s): ' . $missing->implode(', '),
            ]);
        }

        $alreadyIssued = $records->where('status', '!=', 'in_stock')->pluck('serial')->all();
        if (!empty($alreadyIssued)) {
            return back()->withErrors([
                'serials' => 'Already issued: ' . implode(', ', $alreadyIssued),
            ]);
        }

        DB::transaction(function () use ($item, $serials, $records, $data, $request) {
            $qty      = $serials->count();
            $newStock = $item->current_stock - $qty;
            $item->update(['current_stock' => $newStock]);

            $movement = InventoryMovement::create([
                'item_id'       => $item->id,
                'type'          => 'out',
                'quantity'      => $qty,
                'unit_cost'     => $item->unit_cost,
                'balance_after' => $newStock,
                'reference'     => $data['reference'] ?? null,
                'vehicle_id'    => $data['vehicle_id'] ?? null,
                'notes'         => $data['notes'] ?? null,
                'serials'       => $serials->all(),
                'created_by'    => $request->user()->id,
            ]);

            foreach ($records as $serial) {
                $serial->update([
                    'status'             => 'issued',
                    'issued_movement_id' => $movement->id,
                    'issued_at'          => now(),
                    'vehicle_id'         => $data['vehicle_id'] ?? null,
                ]);
            }
        });

        return back()->with('success', "Issued {$serials->count()} serial(s).");
    }

    public function movements(Request $request)
    {
        $query = InventoryMovement::with(['item.category', 'vehicle', 'creator'])->latest();

        if ($request->filled('item_id')) {
            $query->where('item_id', $request->item_id);
        }
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $movements = $query->paginate(30)->withQueryString();

        return Inertia::render('system/Inventory/Movements', [
            'movements' => $movements,
            'items'     => InventoryItem::orderBy('name')->get(['id', 'name', 'unit']),
            'movTypes'  => InventoryMovement::$types,
            'filters'   => $request->only(['item_id', 'type']),
        ]);
    }

    // Category management
    public function storeCategory(Request $request)
    {
        $data = $request->validate(['name' => 'required|string|max:100', 'color' => 'nullable|string|max:7']);
        InventoryCategory::create($data);
        return back()->with('success', 'Category created.');
    }

    public function destroyCategory(InventoryCategory $category)
    {
        $category->delete();
        return back()->with('success', 'Category deleted.');
    }
}
