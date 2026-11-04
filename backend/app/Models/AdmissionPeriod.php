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
        if ($this->status !== 'open') {
            return false;
        }

        $today = now()->startOfDay();
        $opening = $this->opening_date ? $this->opening_date->copy()->startOfDay() : null;
        $closing = $this->closing_date ? $this->closing_date->copy()->endOfDay() : null;

        if ($opening && $today->lt($opening)) {
            return false;
        }

        if ($closing && $today->gt($closing)) {
            return false;
        }

        return true;
    }

    /**
     * Alias for isOpen to prevent undefined method errors
     */
    public function isActive(): bool
    {
        return $this->isOpen();
    }
}
