<?php

namespace App\Http\Controllers\Api\Staff\Modules;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use Illuminate\Http\Request;

/**
 * Read-only staff API for procurement suppliers.
 *
 * Mirrors the data of System\Procurement\SupplierController but returns flat
 * JSON envelopes for the mobile app. Auth/scope is enforced by the route's
 * `permission:` middleware.
 */
class SupplierController extends Controller
{
    public function index(Request $request)
    {
        $query = Supplier::withCount('purchaseOrders')->latest();

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                  ->orWhere('contact_name', 'like', "%{$s}%")
                  ->orWhere('phone', 'like', "%{$s}%")
                  ->orWhere('email', 'like', "%{$s}%");
            });
        }
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        $suppliers = $query->paginate(20)->withQueryString();

        $suppliers->getCollection()->transform(fn ($supplier) => $this->transform($supplier));

        return response()->json(['suppliers' => $suppliers]);
    }

    public function show($id)
    {
        $supplier = Supplier::withCount('purchaseOrders')
            ->with('creator')
            ->findOrFail($id);

        return response()->json(['supplier' => $this->transform($supplier, true)]);
    }

    /**
     * Flatten a supplier for the mobile client. Adds a human category label +
     * color and a derived status; detail mode adds notes and creator name.
     */
    private function transform(Supplier $supplier, bool $detail = false): array
    {
        $category = $supplier->category;
        $meta = Supplier::$categories[$category] ?? null;

        $data = [
            'id'              => $supplier->id,
            'name'            => $supplier->name,
            'contact_name'    => $supplier->contact_name,
            'phone'           => $supplier->phone,
            'email'           => $supplier->email,
            'address'         => $supplier->address,
            'tin_number'      => $supplier->tin_number,
            'category'        => $category,
            'category_label'  => $meta['label'] ?? ($category ? ucfirst($category) : null),
            'category_color'  => $meta['color'] ?? '#94A3B8',
            'is_active'       => (bool) $supplier->is_active,
            'status'          => $supplier->is_active ? 'active' : 'inactive',
            'status_label'    => $supplier->is_active ? 'Active' : 'Inactive',
            'purchase_orders_count' => $supplier->purchase_orders_count ?? 0,
            'created_at'      => optional($supplier->created_at)->toIso8601String(),
        ];

        if ($detail) {
            $data['notes'] = $supplier->notes;
            $data['created_by_name'] = $supplier->creator?->name;
        }

        return $data;
    }
}
