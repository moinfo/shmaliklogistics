<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Role extends Model
{
    protected $fillable = ['name', 'slug', 'description', 'permissions', 'is_active', 'created_by'];

    protected $casts = [
        'permissions' => 'array',
        'is_active'   => 'boolean',
    ];

    public function creator() { return $this->belongsTo(User::class, 'created_by'); }
    public function users()   { return $this->hasMany(User::class); }

    public static function makeSlug(string $name): string
    {
        return Str::slug($name);
    }

    public function hasPermission(string $permission): bool
    {
        $perms = $this->permissions ?? [];
        return in_array('*', $perms) || in_array($permission, $perms)
            || in_array(explode('.', $permission)[0] . '.*', $perms);
    }
}
