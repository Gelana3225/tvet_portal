<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AdmissionPeriod extends Model
{
    protected $fillable = [
        'name',
        'academic_year',
        'opening_date',
        'closing_date',
        'status',
        'description',
        'created_by',
    ];

    protected $casts = [
        'opening_date' => 'date',
        'closing_date' => 'date',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function applications(): HasMany
    {
        return $this->hasMany(Application::class);
    }

    /**
     * Check if the admission period is currently open
     */
    public function isOpen(): bool
    {
        return $this->status === 'open' 
            && now()->between($this->opening_date, $this->closing_date);
    }
}
