<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Department extends Model
{
    protected $fillable = [
        'name',
        'code',
        'description',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function occupations(): HasMany
    {
        return $this->hasMany(Occupation::class);
    }

    public function applications(): HasMany
    {
        return $this->hasMany(Application::class);
    }
}
