<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApplicationDocument extends Model
{
    protected $fillable = [
        'application_id',
        'document_type',
        'original_filename',
        'file_name',
        'stored_filename',
        'file_path',
        'file_size',
        'mime_type',
        'uploaded_by',
        'is_verified',
        'verified_by',
        'verified_at',
        'notes',
        'description',
    ];

    protected $casts = [
        'is_verified' => 'boolean',
        'verified_at' => 'datetime',
    ];

    public function getFileNameAttribute()
    {
        return $this->attributes['original_filename'] ?? null;
    }

    public function setFileNameAttribute($value)
    {
        $this->attributes['original_filename'] = $value;
    }

    public function getDescriptionAttribute()
    {
        return $this->attributes['notes'] ?? null;
    }

    public function setDescriptionAttribute($value)
    {
        $this->attributes['notes'] = $value;
    }

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function verifier(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }
}
