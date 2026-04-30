<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\LicenseClass;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LicenseClassController extends Controller
{
    public function index()
    {
        $classes = LicenseClass::orderBy('sort_order')->orderBy('code')->get();

        return Inertia::render('system/Settings/LicenseClasses/Index', [
            'classes' => $classes,
        ]);
    }

    public function create()
    {
        return Inertia::render('system/Settings/LicenseClasses/Create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'code'        => 'required|string|max:10|unique:license_classes,code|regex:/^[A-Z0-9]+$/',
            'name'        => 'required|string|max:100',
            'description' => 'nullable|string|max:200',
            'sort_order'  => 'nullable|integer|min:0|max:999',
            'is_active'   => 'boolean',
        ]);

        $data['code']       = strtoupper($data['code']);
        $data['sort_order'] = $data['sort_order'] ?? LicenseClass::max('sort_order') + 1;
        $data['is_active']  = $data['is_active'] ?? true;

        LicenseClass::create($data);

        return redirect()->route('system.settings.license-classes.index')
            ->with('success', "Licence class {$data['code']} added.");
    }

    public function edit(LicenseClass $licenseClass)
    {
        return Inertia::render('system/Settings/LicenseClasses/Edit', [
            'licenseClass' => $licenseClass,
        ]);
    }

    public function update(Request $request, LicenseClass $licenseClass)
    {
        $data = $request->validate([
            'code'        => 'required|string|max:10|unique:license_classes,code,' . $licenseClass->id . '|regex:/^[A-Z0-9]+$/',
            'name'        => 'required|string|max:100',
            'description' => 'nullable|string|max:200',
            'sort_order'  => 'nullable|integer|min:0|max:999',
            'is_active'   => 'boolean',
        ]);

        $data['code'] = strtoupper($data['code']);
        $licenseClass->update($data);

        return redirect()->route('system.settings.license-classes.index')
            ->with('success', "Licence class {$licenseClass->code} updated.");
    }

    public function destroy(LicenseClass $licenseClass)
    {
        $licenseClass->delete();

        return redirect()->route('system.settings.license-classes.index')
            ->with('success', "Licence class {$licenseClass->code} removed.");
    }
}
