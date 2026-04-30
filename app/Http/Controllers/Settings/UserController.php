<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        $users = User::with('role:id,name,slug')->latest()->get();
        $roles = Role::where('is_active', true)->orderBy('name')->get(['id', 'name', 'slug']);

        return Inertia::render('system/Settings/Users/Index', compact('users', 'roles'));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'                  => 'required|string|max:100',
            'email'                 => 'required|email|unique:users,email',
            'role_id'               => 'nullable|exists:roles,id',
            'password'              => 'required|string|min:8|confirmed',
            'password_confirmation' => 'required',
        ]);

        User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'role_id'  => $data['role_id'] ?? null,
            'password' => Hash::make($data['password']),
        ]);

        return back()->with('success', "User {$data['name']} created.");
    }

    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'name'                  => 'required|string|max:100',
            'email'                 => ['required', 'email', Rule::unique('users')->ignore($user->id)],
            'role_id'               => 'nullable|exists:roles,id',
            'password'              => 'nullable|string|min:8|confirmed',
            'password_confirmation' => 'nullable',
        ]);

        $user->name    = $data['name'];
        $user->email   = $data['email'];
        $user->role_id = $data['role_id'] ?? null;
        if (!empty($data['password'])) {
            $user->password = Hash::make($data['password']);
        }
        $user->save();

        return back()->with('success', "User {$user->name} updated.");
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return back()->with('error', 'You cannot delete your own account.');
        }

        $user->delete();

        return back()->with('success', 'User removed.');
    }
}
