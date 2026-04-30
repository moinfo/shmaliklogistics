<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\PayrollSetting;
use App\Services\TanzaniaPayrollCalculator;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PayrollSettingsController extends Controller
{
    public function index()
    {
        $settings = PayrollSetting::orderBy('group')->orderBy('key')->get();

        // Group by 'group' field for frontend display
        $grouped = $settings->groupBy('group')->map(fn ($g) => $g->keyBy('key'));

        return Inertia::render('system/Settings/PayrollSettings/Index', [
            'grouped' => $grouped,
        ]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'settings'               => 'required|array',
            'settings.sdl_rate'      => 'required|numeric|min:0|max:100',
            'settings.nssf_employee' => 'required|numeric|min:0|max:100',
            'settings.nssf_employer' => 'required|numeric|min:0|max:100',
            'settings.nssf_max_monthly' => 'required|numeric|min:0',
            'settings.wcf_rate'      => 'required|numeric|min:0|max:100',
            'settings.paye_bands'    => 'required|json',
            'settings.nhif_bands'    => 'required|json',
        ]);

        foreach ($data['settings'] as $key => $value) {
            PayrollSetting::where('key', $key)->update(['value' => $value]);
        }

        return back()->with('success', 'Payroll settings updated.');
    }

    /** Live preview: calculate deductions for a given gross salary. */
    public function preview(Request $request)
    {
        $request->validate(['gross' => 'required|numeric|min:0']);

        $settings   = PayrollSetting::allAsMap();
        $calculator = new TanzaniaPayrollCalculator($settings);
        $result     = $calculator->calculate((float) $request->gross);

        return response()->json($result);
    }
}
