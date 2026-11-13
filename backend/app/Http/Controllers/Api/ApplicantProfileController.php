<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreApplicantProfileRequest;
use App\Http\Requests\UpdateApplicantProfileRequest;
use App\Models\ApplicantProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ApplicantProfileController extends Controller
{
    /**
     * Get the authenticated user's profile
     */
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();
        $profile = $user->applicantProfile;

        if (!$profile) {
            return response()->json([
                'message' => 'Profile not found. Please create your profile.',
                'profile' => null
            ], 404);
        }

        return response()->json([
            'profile' => $this->formatProfileResponse($profile)
        ], 200);
    }

    /**
     * Create a new applicant profile
     */
    public function store(StoreApplicantProfileRequest $request): JsonResponse
    {
        $user = $request->user();

        // Check if profile already exists
        if ($user->applicantProfile) {
            return response()->json([
                'message' => 'Profile already exists. Use update endpoint to modify.'
            ], 409);
        }

        $data = $request->validated();
        $data['user_id'] = $user->id;

        if (isset($data['phone'])) {
            $data['phone_number'] = $data['phone'];
        }

        // Handle photo upload
        if ($request->hasFile('photo')) {
            $data['profile_photo_path'] = $this->handlePhotoUpload($request->file('photo'), $user->id);
        }

        $profile = ApplicantProfile::create($data);

        return response()->json([
            'message' => 'Profile created successfully.',
            'profile' => $this->formatProfileResponse($profile)
        ], 201);
    }

    /**
     * Update the authenticated user's profile
     */
    public function update(UpdateApplicantProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $profile = $user->applicantProfile;

        if (!$profile) {
            return response()->json([
                'message' => 'Profile not found. Please create your profile first.'
            ], 404);
        }

        $data = $request->validated();

        if (isset($data['phone'])) {
            $data['phone_number'] = $data['phone'];
        }

        // Handle photo upload
        if ($request->hasFile('photo')) {
            // Delete old photo if exists
            if ($profile->profile_photo_path) {
                Storage::disk('public')->delete($profile->profile_photo_path);
            }
            $data['profile_photo_path'] = $this->handlePhotoUpload($request->file('photo'), $user->id);
        }

        $profile->update($data);

        return response()->json([
            'message' => 'Profile updated successfully.',
            'profile' => $this->formatProfileResponse($profile)
        ], 200);
    }

    /**
     * Delete the authenticated user's profile photo
     */
    public function deletePhoto(Request $request): JsonResponse
    {
        $user = $request->user();
        $profile = $user->applicantProfile;

        if (!$profile || !$profile->profile_photo_path) {
            return response()->json([
                'message' => 'No photo to delete.'
            ], 404);
        }

        // Delete the photo file
        Storage::disk('public')->delete($profile->profile_photo_path);

        // Update profile
        $profile->update(['profile_photo_path' => null]);

        return response()->json([
            'message' => 'Photo deleted successfully.'
        ], 200);
    }

    /**
     * Handle photo upload
     */
    private function handlePhotoUpload($file, $userId): string
    {
        $filename = 'applicant_' . $userId . '_' . time() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs('applicant_photos', $filename, 'public');
        return $path;
    }

    /**
     * Format profile response
     */
    private function formatProfileResponse(ApplicantProfile $profile): array
    {
        return [
            'id' => $profile->id,
            'first_name' => $profile->first_name,
            'father_name' => $profile->father_name,
            'grandfather_name' => $profile->grandfather_name,
            'full_name' => $profile->first_name . ' ' . $profile->father_name . ' ' . $profile->grandfather_name,
            'gender' => $profile->gender,
            'date_of_birth' => $profile->date_of_birth ? $profile->date_of_birth->format('Y-m-d') : null,
            'nationality' => $profile->nationality,
            'photo_url' => $profile->profile_photo_path ? url(Storage::url($profile->profile_photo_path)) : null,
            'phone' => $profile->phone_number,
            'email' => $profile->email ?: ($profile->user ? $profile->user->email : ''),
            'address' => [
                'region' => $profile->region,
                'zone' => $profile->zone,
                'woreda' => $profile->woreda,
                'kebele' => $profile->kebele,
                'house_number' => $profile->house_number ?? '',
            ],
            'emergency_contact' => [
                'name' => $profile->emergency_contact_name,
                'phone' => $profile->emergency_contact_phone,
                'relationship' => $profile->emergency_contact_relationship,
            ],
            'created_at' => $profile->created_at,
            'updated_at' => $profile->updated_at,
        ];
    }
}
