<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Storage;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    protected $fillable = ['name', 'email', 'avatar', 'password', 'role_id'];

    protected $hidden = ['password', 'remember_token'];

    protected $appends = ['avatar_url'];

    public function role() { return $this->belongsTo(Role::class); }

    public function driver() { return $this->hasOne(Driver::class); }

    public function getAvatarUrlAttribute(): ?string
    {
        return $this->avatar ? Storage::disk('public')->url($this->avatar) : null;
    }

    public function hasPermission(string $permission): bool
    {
        return (bool) $this->role?->hasPermission($permission);
    }

    public function can($abilities, $arguments = []): bool
    {
        if (is_string($abilities) && str_contains($abilities, '.')) {
            return $this->hasPermission($abilities);
        }
        return parent::can($abilities, $arguments);
    }

    public function permissionsList(): array
    {
        return $this->role?->permissions ?? [];
    }

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
