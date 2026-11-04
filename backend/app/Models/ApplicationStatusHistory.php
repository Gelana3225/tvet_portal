<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApplicationStatusHistory extends Model
{
    const UPDATED_AT = null; // This table only has created_at

    protected $fillable = [
        'application_id',
        'previous_status',
        'new_status',
        'status',
        'changed_by',
        'reason',
        'notes',
        'remarks',
    ];

    public function getStatusAttribute()
    {
        return $this->attributes['new_status'] ?? null;
    }

    public function setStatusAttribute($value)
    {
        $this->attributes['new_status'] = $value;
    }

    public function getRemarksAttribute()
    {
        return $this->attributes['notes'] ?? null;
    }

    public function setRemarksAttribute($value)
    {
        $this->attributes['notes'] = $value;
    }

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }

    public function changer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
