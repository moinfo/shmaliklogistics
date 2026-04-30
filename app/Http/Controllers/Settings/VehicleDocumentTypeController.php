<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\VehicleDocumentType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VehicleDocumentTypeController extends Controller
{
    public function index()
    {
        $types = VehicleDocumentType::orderBy('is_builtin', 'desc')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return Inertia::render('system/Settings/DocumentTypes/Index', [
            'types' => $types,
        ]);
    }

    public function create()
    {
        return Inertia::render('system/Settings/DocumentTypes/Create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:100|unique:vehicle_document_types,name',
            'description' => 'nullable|string|max:200',
            'sort_order'  => 'nullable|integer|min:0|max:999',
            'is_active'   => 'boolean',
        ]);

        $data['is_builtin']  = false;
        $data['sort_order']  = $data['sort_order'] ?? (VehicleDocumentType::max('sort_order') + 1);
        $data['is_active']   = $data['is_active'] ?? true;

        VehicleDocumentType::create($data);

        return redirect()->route('system.settings.document-types.index')
            ->with('success', "Document type \"{$data['name']}\" added.");
    }

    public function edit(VehicleDocumentType $documentType)
    {
        return Inertia::render('system/Settings/DocumentTypes/Edit', [
            'documentType' => $documentType,
        ]);
    }

    public function update(Request $request, VehicleDocumentType $documentType)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:100|unique:vehicle_document_types,name,' . $documentType->id,
            'description' => 'nullable|string|max:200',
            'sort_order'  => 'nullable|integer|min:0|max:999',
            'is_active'   => 'boolean',
        ]);

        $documentType->update($data);

        return redirect()->route('system.settings.document-types.index')
            ->with('success', "Document type \"{$documentType->name}\" updated.");
    }

    public function destroy(VehicleDocumentType $documentType)
    {
        if ($documentType->is_builtin) {
            return back()->with('error', 'Built-in document types cannot be deleted.');
        }

        $name = $documentType->name;
        $documentType->delete();

        return redirect()->route('system.settings.document-types.index')
            ->with('success', "Document type \"{$name}\" removed.");
    }
}
