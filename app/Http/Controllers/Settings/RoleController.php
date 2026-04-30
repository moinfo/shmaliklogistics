<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Role;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RoleController extends Controller
{
    public function index()
    {
        return Inertia::render('system/Settings/Roles/Index', [
            'roles' => Role::withCount('users')->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:100',
            'description' => 'nullable|string|max:300',
            'permissions' => 'nullable|array',
            'permissions.*' => 'string',
            'is_active'   => 'boolean',
        ]);

        $data['slug']       = Role::makeSlug($data['name']);
        $data['created_by'] = auth()->id();
        $data['permissions'] = $data['permissions'] ?? [];

        Role::create($data);

        return back()->with('success', 'Role created.');
    }

    public function update(Request $request, Role $role)
    {
        $data = $request->validate([
            'name'          => "required|string|max:100",
            'description'   => 'nullable|string|max:300',
            'permissions'   => 'nullable|array',
            'permissions.*' => 'string',
            'is_active'     => 'boolean',
        ]);

        $data['slug']        = Role::makeSlug($data['name']);
        $data['permissions'] = $data['permissions'] ?? [];

        $role->update($data);

        return back()->with('success', 'Role updated.');
    }

    public function destroy(Role $role)
    {
        if ($role->users()->exists()) {
            return back()->with('error', 'Cannot delete role — users are assigned to it.');
        }

        $role->delete();
        return back()->with('success', 'Role deleted.');
    }
}
