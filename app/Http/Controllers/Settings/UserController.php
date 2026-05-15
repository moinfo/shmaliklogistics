<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
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
            'role_id'               => 'required|exists:roles,id',
            'birth_region'          => 'nullable|string|max:100',
            'birth_district'        => 'nullable|string|max:100',
            'password'              => 'required|string|min:8|confirmed',
            'password_confirmation' => 'required',
        ], [
            'role_id.required' => 'Please select a role for this user.',
            'role_id.exists'   => 'The selected role is invalid.',
        ]);

        User::create([
            'name'           => $data['name'],
            'email'          => $data['email'],
            'role_id'        => $data['role_id'],
            'birth_region'   => $data['birth_region'] ?? null,
            'birth_district' => $data['birth_district'] ?? null,
            'password'       => Hash::make($data['password']),
        ]);

        return back()->with('success', "User {$data['name']} created.");
    }

    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'name'                  => 'required|string|max:100',
            'email'                 => ['required', 'email', Rule::unique('users')->ignore($user->id)],
            'role_id'               => 'required|exists:roles,id',
            'birth_region'          => 'nullable|string|max:100',
            'birth_district'        => 'nullable|string|max:100',
            'password'              => 'nullable|string|min:8|confirmed',
            'password_confirmation' => 'nullable',
        ], [
            'role_id.required' => 'Please select a role for this user.',
            'role_id.exists'   => 'The selected role is invalid.',
        ]);

        $user->name           = $data['name'];
        $user->email          = $data['email'];
        $user->role_id        = $data['role_id'];
        $user->birth_region   = $data['birth_region'] ?? null;
        $user->birth_district = $data['birth_district'] ?? null;
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

    public function uploadAvatar(Request $request, User $user)
    {
        $request->validate([
            'avatar' => 'required|image|mimes:jpg,jpeg,png,webp|max:4096',
        ]);

        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
        }

        $user->avatar = $request->file('avatar')->store('avatars', 'public');
        $user->save();

        return back()->with('success', "Profile picture for {$user->name} updated.");
    }
}
