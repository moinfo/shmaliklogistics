<?php

namespace App\Http\Controllers\Api\Staff\Modules;

use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use App\Models\InventoryMovement;
use Illuminate\Http\Request;

/**
 * Read-only staff API for inventory / stock items.
 *
 * Mirrors the data of System\InventoryController but returns flat JSON
 * envelopes for the mobile app. Auth/scope is enforced by the route's
 * `permission:` middleware.
 */
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

        $items->getCollection()->transform(fn ($item) => $this->transform($item));

        return response()->json(['items' => $items]);
    }

    public function show($id)
    {
        $item = InventoryItem::with('category')->findOrFail($id);

        $movements = InventoryMovement::where('item_id', $item->id)
            ->with('vehicle')
            ->latest()
            ->limit(20)
            ->get()
            ->map(fn ($m) => $this->transformMovement($m))
            ->all();

        $data = $this->transform($item);
        $data['movements'] = $movements;

        return response()->json(['item' => $data]);
    }

    /**
     * Flatten an inventory item for the mobile client. Maps the domain columns
     * to the friendlier names the contract expects (sku, quantity, status) and
     * adds a derived low-stock flag and a flattened `category_name`.
     */
    private function transform(InventoryItem $item): array
    {
        return [
            'id'             => $item->id,
            'name'           => $item->name,
            'sku'            => $item->part_number,
            'part_number'    => $item->part_number,
            'category_id'    => $item->category_id,
            'category_name'  => $item->category?->name,
            'category_color' => $item->category?->color,
            'quantity'       => $item->current_stock,
            'current_stock'  => $item->current_stock,
            'unit'           => $item->unit,
            'reorder_level'  => $item->reorder_level,
            'unit_cost'      => $item->unit_cost,
            'location'       => $item->location,
            'tracks_serials' => $item->tracks_serials,
            'tracks_batch'   => $item->tracks_batch,
            'is_active'      => $item->is_active,
            'is_low_stock'   => $item->isLowStock(),
            'status'         => $item->is_active ? 'active' : 'inactive',
            'notes'          => $item->notes,
            'created_at'     => optional($item->created_at)->toIso8601String(),
        ];
    }

    private function transformMovement(InventoryMovement $m): array
    {
        return [
            'id'            => $m->id,
            'type'          => $m->type,
            'type_label'    => InventoryMovement::$types[$m->type]['label'] ?? $m->type,
            'type_color'    => InventoryMovement::$types[$m->type]['color'] ?? null,
            'quantity'      => $m->quantity,
            'unit_cost'     => $m->unit_cost,
            'balance_after' => $m->balance_after,
            'reference'     => $m->reference,
            'batch_number'  => $m->batch_number,
            'vehicle_plate' => $m->vehicle?->plate,
            'notes'         => $m->notes,
            'created_at'    => optional($m->created_at)->toIso8601String(),
        ];
    }
}
