<?php

namespace App\Http\Controllers\System\RealEstate;

use App\Http\Controllers\Controller;
use App\Models\Lease;
use App\Models\Property;
use App\Models\PropertyUnit;
use Illuminate\Http\Request;

class PropertyUnitController extends Controller
{
    public function store(Request $request, Property $property)
    {
        $data = $this->validateUnit($request);

        $property->units()->create($data);

        return back()->with('success', 'Unit added.');
    }

    public function update(Request $request, PropertyUnit $unit)
    {
        $data = $this->validateUnit($request);

        $unit->update($data);

        return back()->with('success', 'Unit updated.');
    }

    public function destroy(PropertyUnit $unit)
    {
        $unit->delete();

        return back()->with('success', 'Unit removed.');
    }

    private function validateUnit(Request $request): array
    {
        return $request->validate([
            'unit_number'           => 'required|string|max:50',
            'type'                  => 'required|in:' . implode(',', array_keys(PropertyUnit::$types)),
            'status'                => 'required|in:' . implode(',', array_keys(PropertyUnit::$statuses)),
            'bedrooms'              => 'nullable|integer|min:0',
            'bathrooms'             => 'nullable|integer|min:0',
            'size_sqm'              => 'nullable|numeric|min:0',
            'rent_amount'          => 'required|numeric|min:0',
            'rent_currency'         => 'required|in:' . implode(',', PropertyController::$currencies),
            'default_billing_cycle' => 'required|in:' . implode(',', array_keys(Lease::$billingCycles)),
            'description'           => 'nullable|string|max:200',
        ]);
    }
}