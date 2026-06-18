<?php

namespace App\Http\Controllers\System;

use App\Http\Controllers\Controller;
use App\Models\Driver;
use App\Models\Guarantor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class GuarantorController extends Controller
{
    /**
     * Validation rules shared by store() and update().
     * Files are optional on update so editing text doesn't force re-upload.
     */
    private function rules(bool $filesRequired): array
    {
        return [
            'name'          => 'required|string|max:120',
            'phone'         => 'required|string|max:20',
            'address'       => 'required|string|max:200',
            'id_type'       => ['required', Rule::in(array_keys(Guarantor::$idTypes))],
            'id_number'     => 'required|string|max:50',
            'owns_house'    => 'boolean',
            // house_address is required only when this guarantor owns a house.
            'house_address' => 'nullable|required_if:owns_house,1,true|string|max:200',
            'id_doc'        => ($filesRequired ? 'required' : 'nullable') . '|file|mimes:pdf,jpg,jpeg,png|max:10240',
            'letter_doc'    => ($filesRequired ? 'required' : 'nullable') . '|file|mimes:pdf,jpg,jpeg,png|max:10240',
        ];
    }

    public function store(Request $request, Driver $driver)
    {
        // Enforce the 6-guarantor ceiling before doing any work.
        if ($driver->guarantors()->count() >= Guarantor::$maxPerDriver) {
            return back()->with('error', 'This driver already has the maximum of ' . Guarantor::$maxPerDriver . ' guarantors.');
        }

        $data = $request->validate($this->rules(filesRequired: true));

        $data['owns_house'] = $request->boolean('owns_house');
        if (! $data['owns_house']) {
            $data['house_address'] = null;
        }

        $data['id_doc_path']     = $request->file('id_doc')->store("drivers/{$driver->id}/guarantors", 'public');
        $data['letter_doc_path'] = $request->file('letter_doc')->store("drivers/{$driver->id}/guarantors", 'public');
        unset($data['id_doc'], $data['letter_doc']);

        $driver->guarantors()->create($data);

        return back()->with('success', "Guarantor {$data['name']} added.");
    }

    public function update(Request $request, Driver $driver, Guarantor $guarantor)
    {
        abort_unless($guarantor->driver_id === $driver->id, 404);

        $data = $request->validate($this->rules(filesRequired: false));

        $data['owns_house'] = $request->boolean('owns_house');
        if (! $data['owns_house']) {
            $data['house_address'] = null;
        }

        // Replace files only when a new one is supplied; otherwise keep the old.
        foreach (['id_doc' => 'id_doc_path', 'letter_doc' => 'letter_doc_path'] as $field => $column) {
            if ($request->hasFile($field)) {
                if ($guarantor->$column) {
                    Storage::disk('public')->delete($guarantor->$column);
                }
                $data[$column] = $request->file($field)->store("drivers/{$driver->id}/guarantors", 'public');
            }
            unset($data[$field]);
        }

        $guarantor->update($data);

        return back()->with('success', "Guarantor {$guarantor->name} updated.");
    }

    public function destroy(Driver $driver, Guarantor $guarantor)
    {
        abort_unless($guarantor->driver_id === $driver->id, 404);

        foreach ([$guarantor->id_doc_path, $guarantor->letter_doc_path] as $path) {
            if ($path) {
                Storage::disk('public')->delete($path);
            }
        }

        $guarantor->delete();

        return back()->with('success', 'Guarantor removed.');
    }
}