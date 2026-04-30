<?php

namespace App\Http\Controllers\System\Procurement;

use App\Http\Controllers\Controller;
use App\Models\PurchaseOrder;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SupplierController extends Controller
{
    public function index(Request $request)
    {
        $query = Supplier::latest();

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                  ->orWhere('phone', 'like', "%{$s}%")
                  ->orWhere('email', 'like', "%{$s}%");
            });
        }
        if ($request->filled('category')) {
            $query->where('category', $request->category);
        }

        $suppliers = $query->withCount('purchaseOrders')->paginate(20)->withQueryString();

        $stats = [
            'total'  => Supplier::count(),
            'active' => Supplier::where('is_active', true)->count(),
        ];

        return Inertia::render('system/Procurement/Suppliers/Index', [
            'suppliers'  => $suppliers,
            'categories' => Supplier::$categories,
            'stats'      => $stats,
            'filters'    => $request->only(['search', 'category']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'         => 'required|string|max:255',
            'contact_name' => 'nullable|string|max:100',
            'phone'        => 'nullable|string|max:30',
            'email'        => 'nullable|email|max:150',
            'address'      => 'nullable|string',
            'tin_number'   => 'nullable|string|max:30',
            'category'     => 'nullable|in:fuel,spare_parts,office,other',
            'notes'        => 'nullable|string',
        ]);

        $data['created_by'] = $request->user()->id;
        $supplier = Supplier::create($data);

        return back()->with('success', "Supplier '{$supplier->name}' added.");
    }

    public function update(Request $request, Supplier $supplier)
    {
        $data = $request->validate([
            'name'         => 'required|string|max:255',
            'contact_name' => 'nullable|string|max:100',
            'phone'        => 'nullable|string|max:30',
            'email'        => 'nullable|email|max:150',
            'address'      => 'nullable|string',
            'tin_number'   => 'nullable|string|max:30',
            'category'     => 'nullable|in:fuel,spare_parts,office,other',
            'is_active'    => 'boolean',
            'notes'        => 'nullable|string',
        ]);

        $supplier->update($data);
        return back()->with('success', 'Supplier updated.');
    }

    public function destroy(Supplier $supplier)
    {
        $name = $supplier->name;
        $supplier->delete();
        return back()->with('success', "Supplier '{$name}' deleted.");
    }
}
