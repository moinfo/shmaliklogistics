<?php

namespace App\Http\Controllers\System;

use App\Http\Controllers\Controller;
use App\Models\InventoryCategory;
use App\Models\InventoryItem;
use App\Models\InventoryMovement;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class InventoryDashboardController extends Controller
{
    public function __invoke()
    {
        $stats = [
            'total_items'         => InventoryItem::where('is_active', true)->count(),
            'total_stock_value'   => (float) InventoryItem::where('is_active', true)
                ->selectRaw('SUM(current_stock * unit_cost) as val')->value('val') ?? 0,
            'low_stock_count'     => InventoryItem::where('is_active', true)
                ->where('reorder_level', '>', 0)
                ->whereRaw('current_stock <= reorder_level')
                ->count(),
            'out_of_stock_count'  => InventoryItem::where('is_active', true)
                ->where('current_stock', '<=', 0)
                ->count(),
            'categories_count'    => InventoryCategory::count(),
            'movements_30d'       => InventoryMovement::where('created_at', '>=', now()->subDays(30))->count(),
        ];

        // Stock value per category (active items only)
        $valueByCategory = InventoryCategory::query()
            ->leftJoin('inventory_items', function ($join) {
                $join->on('inventory_items.category_id', '=', 'inventory_categories.id')
                    ->where('inventory_items.is_active', true);
            })
            ->groupBy('inventory_categories.id', 'inventory_categories.name', 'inventory_categories.color')
            ->select(
                'inventory_categories.name',
                'inventory_categories.color',
                DB::raw('COUNT(inventory_items.id) as items_count'),
                DB::raw('COALESCE(SUM(inventory_items.current_stock * inventory_items.unit_cost), 0) as stock_value')
            )
            ->orderByDesc('stock_value')
            ->get()
            ->map(fn ($c) => [
                'name'        => $c->name,
                'color'       => $c->color,
                'items_count' => (int) $c->items_count,
                'stock_value' => (float) $c->stock_value,
            ]);

        $lowStockItems = InventoryItem::with('category:id,name')
            ->where('is_active', true)
            ->where('reorder_level', '>', 0)
            ->whereRaw('current_stock <= reorder_level')
            ->orderByRaw('(current_stock - reorder_level) asc')
            ->limit(10)
            ->get()
            ->map(fn ($i) => [
                'id'            => $i->id,
                'name'          => $i->name,
                'part_number'   => $i->part_number,
                'current_stock' => (float) $i->current_stock,
                'reorder_level' => (float) $i->reorder_level,
                'unit'          => $i->unit,
                'category_name' => $i->category?->name,
            ]);

        $topItemsByValue = InventoryItem::with('category:id,name')
            ->where('is_active', true)
            ->orderByRaw('(current_stock * unit_cost) desc')
            ->limit(8)
            ->get()
            ->map(fn ($i) => [
                'id'            => $i->id,
                'name'          => $i->name,
                'current_stock' => (float) $i->current_stock,
                'unit'          => $i->unit,
                'unit_cost'     => (float) $i->unit_cost,
                'stock_value'   => (float) $i->current_stock * (float) $i->unit_cost,
                'category_name' => $i->category?->name,
            ]);

        $recentMovements = InventoryMovement::with('item:id,name')
            ->latest()
            ->limit(8)
            ->get()
            ->map(fn ($m) => [
                'id'         => $m->id,
                'item_name'  => $m->item?->name,
                'type'       => $m->type,
                'type_label' => InventoryMovement::$types[$m->type]['label'] ?? ucfirst($m->type),
                'type_color' => InventoryMovement::$types[$m->type]['color'] ?? '#64748B',
                'quantity'   => (float) $m->quantity,
                'reference'  => $m->reference,
                'created_at' => $m->created_at,
            ]);

        // 12-month movement value trend (in vs out)
        $monthlyMovements = collect(range(11, 0))->map(function ($offset) {
            $date  = now()->subMonths($offset);
            $year  = $date->year;
            $month = $date->month;

            $inValue = (float) InventoryMovement::where('type', 'in')
                ->whereYear('created_at', $year)
                ->whereMonth('created_at', $month)
                ->selectRaw('SUM(quantity * unit_cost) as v')->value('v') ?? 0;
            $outValue = (float) InventoryMovement::where('type', 'out')
                ->whereYear('created_at', $year)
                ->whereMonth('created_at', $month)
                ->selectRaw('SUM(quantity * unit_cost) as v')->value('v') ?? 0;

            return [
                'month'     => $date->format('M'),
                'in_value'  => $inValue,
                'out_value' => $outValue,
            ];
        })->values()->all();

        return Inertia::render('system/Inventory/Dashboard', compact(
            'stats',
            'valueByCategory',
            'lowStockItems',
            'topItemsByValue',
            'recentMovements',
            'monthlyMovements'
        ));
    }
}