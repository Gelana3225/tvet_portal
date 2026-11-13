<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApplicantProfile extends Model
{
    protected $fillable = [
        'user_id',
        'first_name',
        'father_name',
        'grandfather_name',
        'gender',
        'date_of_birth',
        'nationality',
        'profile_photo_path',
        'photo_path',
        'phone_number',
        'phone',
        'email',
        'region',
        'zone',
        'woreda',
        'kebele',
        'house_number',
        'emergency_contact_name',
        'emergency_contact_phone',
        'emergency_contact_relationship',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
    ];

    public function getPhoneAttribute()
    {
        return $this->attributes['phone_number'] ?? null;
    }

    public function setPhoneAttribute($value)
    {
        $this->attributes['phone_number'] = $value;
    }

    public function getPhotoPathAttribute()
    {
        return $this->attributes['profile_photo_path'] ?? null;
    }

    public function setPhotoPathAttribute($value)
    {
        $this->attributes['profile_photo_path'] = $value;
    }

    public function getFullNameAttribute(): string
    {
        $parts = array_filter([
            $this->first_name ?? null,
            $this->father_name ?? null,
            $this->grandfather_name ?? null,
        ]);
        if (!empty($parts)) {
            return implode(' ', $parts);
        }
        return $this->user ? ($this->user->name ?: $this->user->email) : '';
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
