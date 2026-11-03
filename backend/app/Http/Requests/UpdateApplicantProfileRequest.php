<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateApplicantProfileRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Ethiopian naming convention
            'first_name' => ['sometimes', 'required', 'string', 'max:100'],
            'father_name' => ['sometimes', 'required', 'string', 'max:100'],
            'grandfather_name' => ['sometimes', 'required', 'string', 'max:100'],
            
            // Personal information
            'gender' => ['sometimes', 'required', 'in:male,female'],
            'date_of_birth' => ['sometimes', 'required', 'date', 'before:today', 'after:1940-01-01'],
            'nationality' => ['sometimes', 'required', 'string', 'max:100'],
            
            // Photo upload
            'photo' => ['nullable', 'image', 'mimes:jpeg,jpg,png', 'max:2048'],
            
            // Contact information
            'phone' => ['sometimes', 'required', 'string', 'regex:/^(\+251|0)[79]\d{8}$/'],
            'email' => ['nullable', 'email', 'max:255'],
            
            // Ethiopian address system
            'region' => ['sometimes', 'required', 'string', 'max:100'],
            'zone' => ['sometimes', 'required', 'string', 'max:100'],
            'woreda' => ['sometimes', 'required', 'string', 'max:100'],
            'kebele' => ['sometimes', 'required', 'string', 'max:100'],
            'house_number' => ['nullable', 'string', 'max:50'],
            
            // Emergency contact
            'emergency_contact_name' => ['sometimes', 'required', 'string', 'max:255'],
            'emergency_contact_phone' => ['sometimes', 'required', 'string', 'regex:/^(\+251|0)[79]\d{8}$/'],
            'emergency_contact_relationship' => ['sometimes', 'required', 'string', 'max:100'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'first_name.required' => 'First name is required.',
            'father_name.required' => 'Father name is required.',
            'grandfather_name.required' => 'Grandfather name is required.',
            'gender.in' => 'Gender must be either male or female.',
            'date_of_birth.before' => 'Date of birth must be in the past.',
            'phone.regex' => 'Phone number must be a valid Ethiopian phone number.',
            'emergency_contact_phone.regex' => 'Emergency contact phone must be a valid Ethiopian phone number.',
            'photo.image' => 'Photo must be an image file.',
            'photo.mimes' => 'Photo must be a JPEG or PNG file.',
            'photo.max' => 'Photo size must not exceed 2MB.',
        ];
    }
}
