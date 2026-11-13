<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreApplicationRequest;
use App\Http\Requests\UpdateApplicationRequest;
use App\Models\Application;
use App\Models\ApplicationDocument;
use App\Models\ApplicationStatusHistory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ApplicationController extends Controller
{
    /**
     * Get all applications for the authenticated user
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $applications = Application::where('user_id', $user->id)
            ->with(['admissionPeriod', 'department', 'occupation', 'qualificationLevel', 'documents', 'student'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'applications' => $applications->map(function($app) {
                return $this->formatApplicationResponse($app);
            })
        ], 200);
    }

    /**
     * Get a specific application
     */
    public function show(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        
        $application = Application::where('id', $id)
            ->where('user_id', $user->id)
            ->with(['admissionPeriod', 'department', 'occupation', 'qualificationLevel', 'documents', 'statusHistories', 'student'])
            ->first();

        if (!$application) {
            return response()->json([
                'message' => 'Application not found.'
            ], 404);
        }

        return response()->json([
            'application' => $this->formatApplicationResponse($application, true)
        ], 200);
    }

    /**
     * Create a new application
     */
    public function store(StoreApplicationRequest $request): JsonResponse
    {
        $user = $request->user();

        // Check if user has a profile
        if (!$user->applicantProfile) {
            return response()->json([
                'message' => 'Please complete your profile before applying.'
            ], 400);
        }

        // Check for duplicate application
        $existingApplication = Application::where('user_id', $user->id)
            ->where('admission_period_id', $request->admission_period_id)
            ->first();

        if ($existingApplication) {
            return response()->json([
                'message' => 'You have already applied for this admission period.'
            ], 409);
        }

        DB::beginTransaction();
        try {
            // Create application
            $application = Application::create([
                'user_id' => $user->id,
                'admission_period_id' => $request->admission_period_id,
                'department_id' => $request->department_id,
                'occupation_id' => $request->occupation_id,
                'qualification_level_id' => $request->qualification_level_id,
                'previous_school' => $request->previous_school_name,
                'previous_school_name' => $request->previous_school_name,
                'previous_school_address' => $request->previous_school_address,
                'grade_10_result' => $request->grade_10_result,
                'grade_12_result' => $request->grade_12_result,
                'has_disability' => $request->has_disability,
                'disability_description' => $request->disability_description,
                'current_status' => 'draft',
                'status' => 'draft',
            ]);

            // Create initial status history
            ApplicationStatusHistory::create([
                'application_id' => $application->id,
                'previous_status' => null,
                'new_status' => 'draft',
                'status' => 'draft',
                'changed_by' => $user->id,
                'notes' => 'Application created',
                'remarks' => 'Application created',
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Application created successfully. Please upload required documents.',
                'application' => $this->formatApplicationResponse($application->load(['admissionPeriod', 'department', 'occupation', 'qualificationLevel']))
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to create application.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update an application (only if status is draft or correction_required)
     */
    public function update(UpdateApplicationRequest $request, $id): JsonResponse
    {
        $user = $request->user();
        
        $application = Application::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$application) {
            return response()->json([
                'message' => 'Application not found.'
            ], 404);
        }

        if (!$application->canBeEdited()) {
            return response()->json([
                'message' => 'Application cannot be edited in its current status.'
            ], 403);
        }

        $data = $request->validated();
        if (isset($data['previous_school_name'])) {
            $data['previous_school'] = $data['previous_school_name'];
        }

        $application->update($data);

        return response()->json([
            'message' => 'Application updated successfully.',
            'application' => $this->formatApplicationResponse($application->load(['admissionPeriod', 'department', 'occupation', 'qualificationLevel']))
        ], 200);
    }

    /**
     * Upload a document for an application
     */
    public function uploadDocument(Request $request, $id): JsonResponse
    {
        $request->validate([
            'document_type' => ['required', 'string', 'in:transcript,certificate,id_card,birth_certificate,photo,other'],
            'file' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:2048'], // 2MB max
            'description' => ['nullable', 'string', 'max:255'],
        ], [
            'file.max' => 'The selected file exceeds the maximum allowed size of 2 MB (2,048 KB). Please minimize or compress your file and re-upload.',
            'file.mimes' => 'Only PDF, JPG, JPEG, and PNG files are accepted.',
            'file.required' => 'No file received or file exceeded the upload limit. Please minimize your file and try again.',
        ]);

        $user = $request->user();
        
        $application = Application::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$application) {
            return response()->json([
                'message' => 'Application not found.'
            ], 404);
        }

        if (!$application->canBeEdited()) {
            return response()->json([
                'message' => 'Documents cannot be uploaded for this application in its current status.'
            ], 403);
        }

        // Handle file upload
        $file = $request->file('file');
        $storedFilename = 'app_' . $application->id . '_' . $request->document_type . '_' . time() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('application_documents', $storedFilename, 'public');

        // Create document record
        $document = ApplicationDocument::create([
            'application_id' => $application->id,
            'document_type' => $request->document_type,
            'file_path' => $path,
            'original_filename' => $file->getClientOriginalName(),
            'file_name' => $file->getClientOriginalName(),
            'stored_filename' => $storedFilename,
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'uploaded_by' => $user->id,
            'notes' => $request->description,
            'description' => $request->description,
            'is_verified' => false,
        ]);

        return response()->json([
            'message' => 'Document uploaded successfully.',
            'document' => [
                'id' => $document->id,
                'document_type' => $document->document_type,
                'file_name' => $document->original_filename,
                'file_url' => url(Storage::url($document->file_path)),
                'file_size' => $document->file_size,
                'uploaded_at' => $document->created_at,
            ]
        ], 201);
    }

    /**
     * Delete a document
     */
    public function deleteDocument(Request $request, $applicationId, $documentId): JsonResponse
    {
        $user = $request->user();
        
        $application = Application::where('id', $applicationId)
            ->where('user_id', $user->id)
            ->first();

        if (!$application) {
            return response()->json([
                'message' => 'Application not found.'
            ], 404);
        }

        if (!$application->canBeEdited()) {
            return response()->json([
                'message' => 'Documents cannot be deleted in the current application status.'
            ], 403);
        }

        $document = ApplicationDocument::where('id', $documentId)
            ->where('application_id', $applicationId)
            ->first();

        if (!$document) {
            return response()->json([
                'message' => 'Document not found.'
            ], 404);
        }

        // Delete file from storage
        Storage::disk('public')->delete($document->file_path);

        // Delete record
        $document->delete();

        return response()->json([
            'message' => 'Document deleted successfully.'
        ], 200);
    }

    /**
     * Submit an application (change status from draft to submitted)
     */
    public function submit(Request $request, $id): JsonResponse
    {
        $user = $request->user();
        
        $application = Application::where('id', $id)
            ->where('user_id', $user->id)
            ->with('documents')
            ->first();

        if (!$application) {
            return response()->json([
                'message' => 'Application not found.'
            ], 404);
        }

        if ($application->status !== 'draft' && $application->status !== 'correction_required') {
            return response()->json([
                'message' => 'Application cannot be submitted in its current status.'
            ], 403);
        }

        // Validate required documents
        $requiredDocTypes = ['transcript', 'certificate', 'id_card'];
        $uploadedDocTypes = $application->documents->pluck('document_type')->unique()->toArray();
        
        $missingDocs = array_diff($requiredDocTypes, $uploadedDocTypes);
        
        if (!empty($missingDocs)) {
            return response()->json([
                'message' => 'Please upload all required documents before submitting.',
                'missing_documents' => $missingDocs
            ], 400);
        }

        DB::beginTransaction();
        try {
            // Update status
            $application->update([
                'current_status' => 'submitted',
                'status' => 'submitted',
                'submitted_at' => now(),
            ]);

            // Create status history
            ApplicationStatusHistory::create([
                'application_id' => $application->id,
                'previous_status' => 'draft',
                'new_status' => 'submitted',
                'status' => 'submitted',
                'changed_by' => $user->id,
                'notes' => 'Application submitted by applicant',
                'remarks' => 'Application submitted by applicant',
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Application submitted successfully. You will be notified of the review outcome.',
                'application' => $this->formatApplicationResponse($application->load(['admissionPeriod', 'department', 'occupation', 'qualificationLevel']))
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to submit application.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Format application response
     */
    private function formatApplicationResponse(Application $application, bool $includeHistory = false): array
    {
        $data = [
            'id' => $application->id,
            'application_number' => $application->application_number,
            'status' => $application->status,
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
            'previous_school_name' => $application->previous_school_name,
            'previous_school_address' => $application->previous_school_address,
            'grade_10_result' => $application->grade_10_result,
            'grade_12_result' => $application->grade_12_result,
            'has_disability' => $application->has_disability,
            'disability_description' => $application->disability_description,
            'documents' => $application->documents ? $application->documents->map(function($doc) {
                return [
                    'id' => $doc->id,
                    'document_type' => $doc->document_type,
                    'file_name' => $doc->original_filename,
                    'file_url' => url(Storage::url($doc->file_path)),
                    'file_size' => $doc->file_size,
                    'is_verified' => $doc->is_verified,
                    'uploaded_at' => $doc->created_at,
                ];
            }) : [],
            'can_edit' => $application->canBeEdited(),
            'submitted_at' => $application->submitted_at,
            'reviewed_at' => $application->reviewed_at,
            'created_at' => $application->created_at,
            'updated_at' => $application->updated_at,
            'student' => $application->student ? [
                'id' => $application->student->id,
                'student_id' => $application->student->student_id,
                'academic_year' => $application->student->academic_year,
                'enrollment_date' => $application->student->enrollment_date ? $application->student->enrollment_date->format('d/m/Y') : null,
                'status' => $application->student->status,
            ] : null,
        ];

        if ($includeHistory && $application->relationLoaded('statusHistories')) {
            $data['status_history'] = $application->statusHistories->map(function($history) {
                return [
                    'status' => $history->status,
                    'remarks' => $history->remarks,
                    'changed_at' => $history->created_at,
                ];
            });
        }

        return $data;
    }
}
