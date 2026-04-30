<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\DeductionType;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DeductionTypeController extends Controller
{
    public function index()
    {
        return Inertia::render('system/Settings/Deductions/Index', [
            'deductions' => DeductionType::orderBy('id')->get(),
            'natures'    => DeductionType::$natures,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'                => 'required|string|max:100',
            'nature'              => 'required|in:TAXABLE,GROSS,NET',
            'abbreviation'        => 'required|string|max:20',
            'description'         => 'nullable|string',
            'registration_number' => 'nullable|string|max:100',
            'is_statutory'        => 'boolean',
        ]);

        DeductionType::create($data);

        return back()->with('success', 'Deduction type added.');
    }

    public function update(Request $request, DeductionType $deduction)
    {
        $data = $request->validate([
            'name'                => 'required|string|max:100',
            'nature'              => 'required|in:TAXABLE,GROSS,NET',
            'abbreviation'        => 'required|string|max:20',
            'description'         => 'nullable|string',
            'registration_number' => 'nullable|string|max:100',
            'is_statutory'        => 'boolean',
            'is_active'           => 'boolean',
        ]);

        $deduction->update($data);

        return back()->with('success', 'Deduction type updated.');
    }

    public function destroy(DeductionType $deduction)
    {
        if ($deduction->employeeDeductions()->exists()) {
            return back()->withErrors(['error' => 'Cannot delete — employees have subscriptions to this deduction.']);
        }

        $deduction->delete();

        return back()->with('success', 'Deduction type deleted.');
    }
}
