<?php

namespace App\Http\Controllers\Api\Staff\Modules;

use App\Http\Controllers\Controller;
use App\Models\PurchaseOrder;
use Illuminate\Http\Request;

/**
 * Read-only staff API for procurement purchase orders.
 *
 * Mirrors the data of System\Procurement\PurchaseOrderController but returns
 * flat JSON envelopes for the mobile app. Auth/scope is enforced by the route's
 * `permission:` middleware.
 */
class PurchaseOrderController extends Controller
{
    public function index(Request $request)
    {
        $query = PurchaseOrder::with(['supplier', 'creator'])->latest();

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('po_number', 'like', "%{$s}%")
                  ->orWhereHas('supplier', fn ($sq) => $sq->where('name', 'like', "%{$s}%"));
            });
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('supplier_id')) {
            $query->where('supplier_id', $request->supplier_id);
        }

        $orders = $query->paginate(20)->withQueryString();

        $orders->getCollection()->transform(fn ($po) => $this->transform($po));

        return response()->json(['purchase_orders' => $orders]);
    }

    public function show($id)
    {
        $order = PurchaseOrder::with(['supplier', 'items.inventoryItem', 'creator'])->findOrFail($id);

        return response()->json(['purchase_order' => $this->transform($order, true)]);
    }

    /**
     * Flatten a purchase order for the mobile client. Adds `supplier_name`
     * (+ contact/category) and, in detail mode, the line items.
     */
    private function transform(PurchaseOrder $po, bool $withItems = false): array
    {
        $supplier = $po->supplier;

        $data = [
            'id'             => $po->id,
            'po_number'      => $po->po_number,
            'supplier_id'    => $po->supplier_id,
            'supplier_name'  => $supplier?->name,
            'supplier_category' => $supplier?->category,
            'supplier_contact'  => $supplier?->contact_name,
            'supplier_phone'    => $supplier?->phone,
            'supplier_email'    => $supplier?->email,
            'status'         => $po->status,
            'status_label'   => PurchaseOrder::$statuses[$po->status]['label'] ?? $po->status,
            'status_color'   => PurchaseOrder::$statuses[$po->status]['color'] ?? '#94A3B8',
            'order_date'     => optional($po->order_date)->toDateString(),
            'expected_date'  => optional($po->expected_date)->toDateString(),
            'subtotal'       => $po->subtotal,
            'tax_amount'     => $po->tax_amount,
            'total'          => $po->total,
            'notes'          => $po->notes,
            'created_by_name' => $po->creator?->name,
            'created_at'     => optional($po->created_at)->toIso8601String(),
        ];

        if ($withItems) {
            $data['items'] = $po->items->map(fn ($item) => [
                'id'                 => $item->id,
                'inventory_item_id'  => $item->inventory_item_id,
                'inventory_item_name' => $item->inventoryItem?->name,
                'description'        => $item->description,
                'quantity'          => $item->quantity,
                'unit'              => $item->unit,
                'unit_price'        => $item->unit_price,
                'total'             => $item->total,
                'received_qty'      => $item->received_qty,
            ])->values()->all();
        }

        return $data;
    }
}
