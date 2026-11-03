<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Application extends Model
{
    protected $fillable = [
        'application_number',
        'user_id',
        'admission_period_id',
        'department_id',
        'occupation_id',
        'qualification_level_id',
        'previous_school',
        'highest_education_level',
        'completion_year',
        'certificate_info',
        'current_status',
        'declaration_accepted',
        'submitted_at',
        'reviewed_by',
        'reviewed_at',
        'approval_notes',
        'rejection_reason',
        'correction_notes',
    ];

    protected $casts = [
        'declaration_accepted' => 'boolean',
        'submitted_at' => 'datetime',
        'reviewed_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function admissionPeriod(): BelongsTo
    {
        return $this->belongsTo(AdmissionPeriod::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function occupation(): BelongsTo
    {
        return $this->belongsTo(Occupation::class);
    }

    public function qualificationLevel(): BelongsTo
    {
        return $this->belongsTo(QualificationLevel::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(ApplicationDocument::class);
    }

    public function statusHistories(): HasMany
    {
        return $this->hasMany(ApplicationStatusHistory::class);
    }

    public function student(): HasOne
    {
        return $this->hasOne(Student::class);
    }

    /**
     * Check if the application can be edited
     */
    public function canBeEdited(): bool
    {
        return in_array($this->current_status, ['draft', 'correction_required']);
    }

    /**
     * Check if the application is approved
     */
    public function isApproved(): bool
    {
        return $this->current_status === 'approved';
    }
}
