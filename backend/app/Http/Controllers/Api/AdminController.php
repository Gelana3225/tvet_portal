<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdmissionPeriod;
use App\Models\Application;
use App\Models\ApplicationStatusHistory;
use App\Models\Department;
use App\Models\Occupation;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class AdminController extends Controller
{
    /**
     * Check if user is authorized as admin or registrar
     */
    private function authorizeStaff(Request $request)
    {
        $user = $request->user();
        if (!$user || (!$user->isAdmin() && !$user->isRegistrar())) {
            abort(403, 'Unauthorized. Staff access required.');
        }
        return $user;
    }

    /**
     * Dashboard statistics overview
     */
    public function stats(Request $request): JsonResponse
    {
        $this->authorizeStaff($request);

        $totalApplications = Application::count();
        $submittedCount = Application::where('current_status', 'submitted')->count();
        $underReviewCount = Application::where('current_status', 'under_review')->count();
        $approvedCount = Application::where('current_status', 'approved')->count();
        $rejectedCount = Application::where('current_status', 'rejected')->count();
        $correctionRequiredCount = Application::where('current_status', 'correction_required')->count();
        $draftCount = Application::where('current_status', 'draft')->count();

        $totalStudents = Student::count();
        $totalUsers = User::count();
        $totalApplicants = User::whereHas('role', function($q) {
            $q->where('name', 'applicant');
        })->count();

        $activePeriod = AdmissionPeriod::where('status', 'open')->first();

        $recentApplications = Application::with(['user.applicantProfile', 'department', 'occupation'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($app) {
                $name = $app->user && $app->user->applicantProfile 
                    ? $app->user->applicantProfile->full_name 
                    : ($app->user ? $app->user->email : 'Unknown');
                return [
                    'id' => $app->id,
                    'application_number' => $app->application_number,
                    'applicant_name' => $name,
                    'applicant_email' => $app->user ? $app->user->email : '',
                    'department' => $app->department ? $app->department->name : '-',
                    'occupation' => $app->occupation ? $app->occupation->name : '-',
                    'status' => $app->current_status,
                    'submitted_at' => $app->submitted_at,
                    'created_at' => $app->created_at,
                ];
            });

        return response()->json([
            'stats' => [
                'total_applications' => $totalApplications,
                'submitted' => $submittedCount,
                'under_review' => $underReviewCount,
                'approved' => $approvedCount,
                'rejected' => $rejectedCount,
                'correction_required' => $correctionRequiredCount,
                'draft' => $draftCount,
                'total_students' => $totalStudents,
                'total_applicants' => $totalApplicants,
                'total_users' => $totalUsers,
                'active_period' => $activePeriod ? [
                    'id' => $activePeriod->id,
                    'name' => $activePeriod->name,
                    'academic_year' => $activePeriod->academic_year,
                ] : null,
            ],
            'recent_applications' => $recentApplications,
        ], 200);
    }

    /**
     * List all applications with filtering
     */
    public function applications(Request $request): JsonResponse
    {
        $this->authorizeStaff($request);

        $query = Application::with([
            'user.applicantProfile',
            'department',
            'occupation',
            'qualificationLevel',
            'admissionPeriod',
        ]);

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('current_status', $request->status);
        }

        if ($request->filled('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        if ($request->filled('admission_period_id')) {
            $query->where('admission_period_id', $request->admission_period_id);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('application_number', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($uq) use ($search) {
                      $uq->where('email', 'like', "%{$search}%")
                         ->orWhereHas('applicantProfile', function ($pq) use ($search) {
                             $pq->where('first_name', 'like', "%{$search}%")
                                ->orWhere('father_name', 'like', "%{$search}%")
                                ->orWhere('grandfather_name', 'like', "%{$search}%");
                         });
                  });
            });
        }

        $applications = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'applications' => $applications->map(function ($app) {
                $profile = $app->user ? $app->user->applicantProfile : null;
                return [
                    'id' => $app->id,
                    'application_number' => $app->application_number,
                    'status' => $app->current_status,
                    'applicant' => [
                        'id' => $app->user ? $app->user->id : null,
                        'email' => $app->user ? $app->user->email : '',
                        'full_name' => $profile ? $profile->full_name : ($app->user ? $app->user->email : 'N/A'),
                        'phone' => $profile ? $profile->phone_number : 'N/A',
                        'gender' => $profile ? $profile->gender : 'N/A',
                    ],
                    'department' => $app->department ? [
                        'id' => $app->department->id,
                        'name' => $app->department->name,
                        'code' => $app->department->code,
                    ] : null,
                    'occupation' => $app->occupation ? [
                        'id' => $app->occupation->id,
                        'name' => $app->occupation->name,
                        'code' => $app->occupation->code,
                    ] : null,
                    'qualification_level' => $app->qualificationLevel ? [
                        'id' => $app->qualificationLevel->id,
                        'name' => $app->qualificationLevel->name,
                    ] : null,
                    'admission_period' => $app->admissionPeriod ? [
                        'id' => $app->admissionPeriod->id,
                        'name' => $app->admissionPeriod->name,
                    ] : null,
                    'submitted_at' => $app->submitted_at,
                    'created_at' => $app->created_at,
                ];
            }),
        ], 200);
    }

    /**
     * Show single application details for review
     */
    public function applicationDetail(Request $request, $id): JsonResponse
    {
        $this->authorizeStaff($request);

        $application = Application::with([
            'user.applicantProfile',
            'department',
            'occupation',
            'qualificationLevel',
            'admissionPeriod',
            'documents',
            'statusHistories.changer',
            'reviewer',
            'student',
        ])->find($id);

        if (!$application) {
            return response()->json(['message' => 'Application not found.'], 404);
        }

        $profile = $application->user ? $application->user->applicantProfile : null;

        return response()->json([
            'application' => [
                'id' => $application->id,
                'application_number' => $application->application_number,
                'status' => $application->current_status,
                'submitted_at' => $application->submitted_at,
                'reviewed_at' => $application->reviewed_at,
                'approval_notes' => $application->approval_notes,
                'rejection_reason' => $application->rejection_reason,
                'correction_notes' => $application->correction_notes,
                'reviewer' => $application->reviewer ? [
                    'id' => $application->reviewer->id,
                    'email' => $application->reviewer->email,
                ] : null,
                'applicant' => [
                    'id' => $application->user ? $application->user->id : null,
                    'email' => $application->user ? $application->user->email : '',
                    'profile' => $profile ? [
                        'full_name' => $profile->full_name,
                        'first_name' => $profile->first_name,
                        'father_name' => $profile->father_name,
                        'grandfather_name' => $profile->grandfather_name,
                        'gender' => $profile->gender,
                        'date_of_birth' => $profile->date_of_birth ? $profile->date_of_birth->format('Y-m-d') : null,
                        'nationality' => $profile->nationality,
                        'phone' => $profile->phone_number,
                        'photo_url' => $profile->profile_photo_path ? Storage::url($profile->profile_photo_path) : null,
                        'region' => $profile->region,
                        'zone' => $profile->zone,
                        'woreda' => $profile->woreda,
                        'kebele' => $profile->kebele,
                        'house_number' => $profile->house_number,
                        'emergency_contact_name' => $profile->emergency_contact_name,
                        'emergency_contact_phone' => $profile->emergency_contact_phone,
                        'emergency_contact_relationship' => $profile->emergency_contact_relationship,
                    ] : null,
                ],
                'program' => [
                    'admission_period' => $application->admissionPeriod ? [
                        'id' => $application->admissionPeriod->id,
                        'name' => $application->admissionPeriod->name,
                        'academic_year' => $application->admissionPeriod->academic_year,
                    ] : null,
                    'department' => $application->department ? [
                        'id' => $application->department->id,
                        'name' => $application->department->name,
                        'code' => $application->department->code,
                    ] : null,
                    'occupation' => $application->occupation ? [
                        'id' => $application->occupation->id,
                        'name' => $application->occupation->name,
                        'code' => $application->occupation->code,
                    ] : null,
                    'qualification_level' => $application->qualificationLevel ? [
                        'id' => $application->qualificationLevel->id,
                        'name' => $application->qualificationLevel->name,
                    ] : null,
                ],
                'qualifications' => [
                    'previous_school_name' => $application->previous_school_name,
                    'previous_school_address' => $application->previous_school_address,
                    'grade_10_result' => $application->grade_10_result,
                    'grade_12_result' => $application->grade_12_result,
                    'has_disability' => $application->has_disability,
                    'disability_description' => $application->disability_description,
                ],
                'documents' => $application->documents->map(function ($doc) {
                    return [
                        'id' => $doc->id,
                        'document_type' => $doc->document_type,
                        'file_name' => $doc->original_filename,
                        'file_url' => Storage::url($doc->file_path),
                        'file_size' => $doc->file_size,
                        'is_verified' => $doc->is_verified,
                        'uploaded_at' => $doc->created_at,
                    ];
                }),
                'status_history' => $application->statusHistories->map(function ($h) {
                    return [
                        'id' => $h->id,
                        'previous_status' => $h->previous_status,
                        'new_status' => $h->new_status,
                        'notes' => $h->notes,
                        'changed_by' => $h->changer ? $h->changer->email : 'System',
                        'created_at' => $h->created_at,
                    ];
                }),
                'student' => $application->student ? [
                    'id' => $application->student->id,
                    'student_id' => $application->student->student_id,
                    'status' => $application->student->status,
                ] : null,
            ],
        ], 200);
    }

    /**
     * Update application status (review, approve, reject, request correction)
     */
    public function updateApplicationStatus(Request $request, $id): JsonResponse
    {
        $staff = $this->authorizeStaff($request);

        $request->validate([
            'status' => ['required', 'in:under_review,approved,rejected,correction_required'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'rejection_reason' => ['nullable', 'required_if:status,rejected', 'string', 'max:1000'],
            'correction_notes' => ['nullable', 'required_if:status,correction_required', 'string', 'max:1000'],
        ]);

        $application = Application::with('admissionPeriod')->find($id);

        if (!$application) {
            return response()->json(['message' => 'Application not found.'], 404);
        }

        $prevStatus = $application->current_status;
        $newStatus = $request->status;

        DB::beginTransaction();
        try {
            $updateData = [
                'current_status' => $newStatus,
                'reviewed_by' => $staff->id,
                'reviewed_at' => now(),
            ];

            if ($newStatus === 'approved') {
                $updateData['approval_notes'] = $request->notes;

                // Create official Student record if not already created
                if (!$application->student) {
                    $year = date('Y');
                    $maxStudent = Student::max('id') ?? 0;
                    $studentIdNumber = sprintf('HTC-%s-%04d', $year, $maxStudent + 1);

                    Student::create([
                        'student_id' => $studentIdNumber,
                        'application_id' => $application->id,
                        'user_id' => $application->user_id,
                        'department_id' => $application->department_id,
                        'occupation_id' => $application->occupation_id,
                        'qualification_level_id' => $application->qualification_level_id,
                        'enrollment_date' => now(),
                        'academic_year' => $application->admissionPeriod ? $application->admissionPeriod->academic_year : date('Y') . '/' . (date('Y') + 1),
                        'status' => 'active',
                        'approved_by' => $staff->id,
                        'approved_at' => now(),
                    ]);
                }
            } elseif ($newStatus === 'rejected') {
                $updateData['rejection_reason'] = $request->rejection_reason ?: $request->notes;
            } elseif ($newStatus === 'correction_required') {
                $updateData['correction_notes'] = $request->correction_notes ?: $request->notes;
            }

            $application->update($updateData);

            // Log history
            ApplicationStatusHistory::create([
                'application_id' => $application->id,
                'previous_status' => $prevStatus,
                'new_status' => $newStatus,
                'changed_by' => $staff->id,
                'notes' => $request->notes ?: ucfirst(str_replace('_', ' ', $newStatus)),
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Application status updated to ' . str_replace('_', ' ', $newStatus) . ' successfully.',
                'status' => $newStatus,
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to update application status.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * List all students
     */
    public function students(Request $request): JsonResponse
    {
        $this->authorizeStaff($request);

        $students = Student::with([
            'user.applicantProfile',
            'department',
            'occupation',
            'qualificationLevel',
            'application',
        ])->orderBy('created_at', 'desc')->get();

        return response()->json([
            'students' => $students->map(function ($s) {
                $profile = $s->user ? $s->user->applicantProfile : null;
                return [
                    'id' => $s->id,
                    'student_id' => $s->student_id,
                    'full_name' => $profile ? $profile->full_name : ($s->user ? $s->user->email : 'N/A'),
                    'email' => $s->user ? $s->user->email : '',
                    'phone' => $profile ? $profile->phone_number : '',
                    'department' => $s->department ? $s->department->name : '-',
                    'occupation' => $s->occupation ? $s->occupation->name : '-',
                    'qualification_level' => $s->qualificationLevel ? $s->qualificationLevel->name : '-',
                    'academic_year' => $s->academic_year,
                    'enrollment_date' => $s->enrollment_date ? $s->enrollment_date->format('Y-m-d') : null,
                    'status' => $s->status,
                ];
            }),
        ], 200);
    }

    /**
     * List all admission periods for admin management
     */
    public function admissionPeriods(Request $request): JsonResponse
    {
        $this->authorizeStaff($request);

        $periods = AdmissionPeriod::withCount('applications')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'admission_periods' => $periods->map(function ($period) {
                return [
                    'id' => $period->id,
                    'name' => $period->name,
                    'academic_year' => $period->academic_year,
                    'opening_date' => $period->opening_date ? $period->opening_date->format('Y-m-d') : null,
                    'closing_date' => $period->closing_date ? $period->closing_date->format('Y-m-d') : null,
                    'status' => $period->status,
                    'description' => $period->description,
                    'applications_count' => $period->applications_count,
                    'is_active' => $period->isActive(),
                    'created_at' => $period->created_at,
                ];
            }),
        ], 200);
    }

    /**
     * Store admission period
     */
    public function storeAdmissionPeriod(Request $request): JsonResponse
    {
        $staff = $this->authorizeStaff($request);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'academic_year' => ['required', 'string', 'max:20'],
            'opening_date' => ['required', 'date'],
            'closing_date' => ['required', 'date', 'after:opening_date'],
            'status' => ['required', 'in:draft,open,closed'],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        $data['created_by'] = $staff->id;

        $period = AdmissionPeriod::create($data);

        return response()->json([
            'message' => 'Admission period created successfully.',
            'admission_period' => $period,
        ], 201);
    }

    /**
     * Update admission period
     */
    public function updateAdmissionPeriod(Request $request, $id): JsonResponse
    {
        $this->authorizeStaff($request);

        $period = AdmissionPeriod::find($id);
        if (!$period) {
            return response()->json(['message' => 'Admission period not found.'], 404);
        }

        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'academic_year' => ['sometimes', 'required', 'string', 'max:20'],
            'opening_date' => ['sometimes', 'required', 'date'],
            'closing_date' => ['sometimes', 'required', 'date'],
            'status' => ['sometimes', 'required', 'in:draft,open,closed'],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        $period->update($data);

        return response()->json([
            'message' => 'Admission period updated successfully.',
            'admission_period' => $period,
        ], 200);
    }
}
