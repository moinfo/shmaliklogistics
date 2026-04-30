<?php

namespace App\Http\Controllers\System\Procurement;

use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use App\Models\InventoryMovement;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class PurchaseOrderController extends Controller
{
    public function index(Request $request)
    {
        $query = PurchaseOrder::with(['supplier', 'creator'])->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('supplier_id')) {
            $query->where('supplier_id', $request->supplier_id);
        }

        $orders = $query->paginate(20)->withQueryString();

        $stats = [
            'total'    => PurchaseOrder::count(),
            'draft'    => PurchaseOrder::where('status', 'draft')->count(),
            'pending'  => PurchaseOrder::whereIn('status', ['sent', 'partial'])->count(),
            'received' => PurchaseOrder::where('status', 'received')->count(),
            'spend_ytd'=> PurchaseOrder::whereIn('status', ['received', 'partial'])->whereYear('created_at', now()->year)->sum('total'),
        ];

        return Inertia::render('system/Procurement/PurchaseOrders/Index', [
            'orders'    => $orders,
            'suppliers' => Supplier::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'statuses'  => PurchaseOrder::$statuses,
            'stats'     => $stats,
            'filters'   => $request->only(['status', 'supplier_id']),
        ]);
    }

    public function create()
    {
        return Inertia::render('system/Procurement/PurchaseOrders/Create', [
            'suppliers'      => Supplier::where('is_active', true)->orderBy('name')->get(['id', 'name', 'category']),
            'inventoryItems' => InventoryItem::where('is_active', true)->orderBy('name')->get(['id', 'name', 'unit', 'unit_cost']),
            'nextNumber'     => PurchaseOrder::nextNumber(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'supplier_id'    => 'required|exists:suppliers,id',
            'order_date'     => 'required|date',
            'expected_date'  => 'nullable|date|after_or_equal:order_date',
            'notes'          => 'nullable|string',
            'items'          => 'required|array|min:1',
            'items.*.description'       => 'required|string|max:255',
            'items.*.inventory_item_id' => 'nullable|exists:inventory_items,id',
            'items.*.quantity'          => 'required|numeric|min:0.001',
            'items.*.unit'              => 'required|string|max:30',
            'items.*.unit_price'        => 'required|numeric|min:0',
        ]);

        DB::transaction(function () use ($data, $request) {
            $po = PurchaseOrder::create([
                'po_number'   => PurchaseOrder::nextNumber(),
                'supplier_id' => $data['supplier_id'],
                'status'      => 'draft',
                'order_date'  => $data['order_date'],
                'expected_date' => $data['expected_date'] ?? null,
                'notes'       => $data['notes'] ?? null,
                'created_by'  => $request->user()->id,
            ]);

            foreach ($data['items'] as $item) {
                $total = round($item['quantity'] * $item['unit_price'], 2);
                PurchaseOrderItem::create([
                    'purchase_order_id'  => $po->id,
                    'inventory_item_id'  => $item['inventory_item_id'] ?? null,
                    'description'        => $item['description'],
                    'quantity'           => $item['quantity'],
                    'unit'               => $item['unit'],
                    'unit_price'         => $item['unit_price'],
                    'total'              => $total,
                ]);
            }

            $po->recalculateTotals();

            return redirect()->route('system.procurement.orders.show', $po)
                ->with('success', "Purchase Order {$po->po_number} created.");
        });

        return redirect()->route('system.procurement.orders.index')
            ->with('success', 'Purchase Order created.');
    }

    public function show(PurchaseOrder $order)
    {
        $order->load(['supplier', 'items.inventoryItem', 'creator']);

        return Inertia::render('system/Procurement/PurchaseOrders/Show', [
            'order'    => $order,
            'statuses' => PurchaseOrder::$statuses,
        ]);
    }

    public function updateStatus(Request $request, PurchaseOrder $order)
    {
        $data = $request->validate([
            'status' => 'required|in:draft,sent,partial,received,cancelled',
        ]);

        $order->update(['status' => $data['status']]);
        return back()->with('success', "Status updated to {$data['status']}.");
    }

    public function receive(Request $request, PurchaseOrder $order)
    {
        $data = $request->validate([
            'items'                => 'required|array',
            'items.*.id'           => 'required|exists:purchase_order_items,id',
            'items.*.received_qty' => 'required|numeric|min:0',
        ]);

        DB::transaction(function () use ($data, $order, $request) {
            foreach ($data['items'] as $itemData) {
                $item = PurchaseOrderItem::findOrFail($itemData['id']);
                $newQty = min($itemData['received_qty'], (float) $item->quantity);
                $additional = $newQty - (float) $item->received_qty;

                $item->update(['received_qty' => $newQty]);

                if ($additional > 0 && $item->inventory_item_id) {
                    $invItem = InventoryItem::find($item->inventory_item_id);
                    if ($invItem) {
                        $newStock = (float) $invItem->current_stock + $additional;
                        $invItem->update(['current_stock' => $newStock]);
                        InventoryMovement::create([
                            'item_id'      => $invItem->id,
                            'type'         => 'in',
                            'quantity'     => $additional,
                            'unit_cost'    => $item->unit_price,
                            'balance_after'=> $newStock,
                            'reference'    => $order->po_number,
                            'notes'        => "Received via PO {$order->po_number}",
                            'created_by'   => $request->user()->id,
                        ]);
                    }
                }
            }

            // Auto-update PO status
            $order->load('items');
            $allReceived = $order->items->every(fn ($i) => (float) $i->received_qty >= (float) $i->quantity);
            $anyReceived = $order->items->some(fn ($i) => (float) $i->received_qty > 0);

            if ($allReceived) {
                $order->update(['status' => 'received']);
            } elseif ($anyReceived) {
                $order->update(['status' => 'partial']);
            }
        });

        return back()->with('success', 'Goods receipt recorded. Inventory updated.');
    }

    public function destroy(PurchaseOrder $order)
    {
        $number = $order->po_number;
        $order->delete();
        return redirect()->route('system.procurement.orders.index')
            ->with('success', "Purchase Order {$number} deleted.");
    }
}
