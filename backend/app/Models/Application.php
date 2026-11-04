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
        'previous_school_name',
        'previous_school_address',
        'grade_10_result',
        'grade_12_result',
        'has_disability',
        'disability_description',
        'highest_education_level',
        'completion_year',
        'certificate_info',
        'current_status',
        'status',
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
        'has_disability' => 'boolean',
        'grade_10_result' => 'float',
        'grade_12_result' => 'float',
        'submitted_at' => 'datetime',
        'reviewed_at' => 'datetime',
    ];

    protected static function booted()
    {
        static::creating(function ($application) {
            if (empty($application->application_number)) {
                $year = date('Y');
                $maxId = static::max('id') ?? 0;
                $application->application_number = sprintf('HTC-%s-%05d', $year, $maxId + 1);
            }
            if (empty($application->current_status)) {
                $application->current_status = $application->status ?? 'draft';
            }
            if (empty($application->previous_school)) {
                $application->previous_school = $application->previous_school_name ?? 'Not Specified';
            }
            if (empty($application->highest_education_level)) {
                $application->highest_education_level = !empty($application->grade_12_result) ? 'Grade 12' : 'Grade 10';
            }
            if (empty($application->completion_year)) {
                $application->completion_year = (int) date('Y');
            }
        });
    }

    public function getStatusAttribute()
    {
        return $this->current_status;
    }

    public function setStatusAttribute($value)
    {
        $this->attributes['current_status'] = $value;
    }

    public function getPreviousSchoolNameAttribute()
    {
        return $this->attributes['previous_school'] ?? null;
    }

    public function setPreviousSchoolNameAttribute($value)
    {
        $this->attributes['previous_school'] = $value;
    }

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
