<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\CompanySetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CompanySettingController extends Controller
{
    public function index()
    {
        return Inertia::render('system/Settings/CompanySettings/Index', [
            'company' => CompanySetting::get(),
        ]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'company_name'    => 'required|string|max:200',
            'company_address' => 'nullable|string|max:300',
            'company_po_box'  => 'nullable|string|max:50',
            'company_city'    => 'nullable|string|max:100',
            'company_country' => 'nullable|string|max:100',
            'company_phone'   => 'nullable|string|max:50',
            'company_email'   => 'nullable|email|max:100',
            'company_tin'     => 'nullable|string|max:50',
        ]);

        CompanySetting::get()->update($data);

        return back()->with('success', 'Company settings updated.');
    }
}
