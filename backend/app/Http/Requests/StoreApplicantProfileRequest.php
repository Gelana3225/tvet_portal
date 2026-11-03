<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreApplicantProfileRequest extends FormRequest
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
            'first_name' => ['required', 'string', 'max:100'],
            'father_name' => ['required', 'string', 'max:100'],
            'grandfather_name' => ['required', 'string', 'max:100'],
            
            // Personal information
            'gender' => ['required', 'in:male,female'],
            'date_of_birth' => ['required', 'date', 'before:today', 'after:1940-01-01'],
            'nationality' => ['required', 'string', 'max:100'],
            
            // Photo upload
            'photo' => ['nullable', 'image', 'mimes:jpeg,jpg,png', 'max:2048'], // 2MB max
            
            // Contact information
            'phone' => ['required', 'string', 'regex:/^(\+251|0)[79]\d{8}$/'], // Ethiopian phone format
            'email' => ['nullable', 'email', 'max:255'],
            
            // Ethiopian address system
            'region' => ['required', 'string', 'max:100'],
            'zone' => ['required', 'string', 'max:100'],
            'woreda' => ['required', 'string', 'max:100'],
            'kebele' => ['required', 'string', 'max:100'],
            'house_number' => ['nullable', 'string', 'max:50'],
            
            // Emergency contact
            'emergency_contact_name' => ['required', 'string', 'max:255'],
            'emergency_contact_phone' => ['required', 'string', 'regex:/^(\+251|0)[79]\d{8}$/'],
            'emergency_contact_relationship' => ['required', 'string', 'max:100'],
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
            'gender.required' => 'Gender is required.',
            'gender.in' => 'Gender must be either male or female.',
            'date_of_birth.required' => 'Date of birth is required.',
            'date_of_birth.before' => 'Date of birth must be in the past.',
            'nationality.required' => 'Nationality is required.',
            'phone.required' => 'Phone number is required.',
            'phone.regex' => 'Phone number must be a valid Ethiopian phone number (e.g., +251912345678 or 0912345678).',
            'region.required' => 'Region is required.',
            'zone.required' => 'Zone is required.',
            'woreda.required' => 'Woreda is required.',
            'kebele.required' => 'Kebele is required.',
            'emergency_contact_name.required' => 'Emergency contact name is required.',
            'emergency_contact_phone.required' => 'Emergency contact phone is required.',
            'emergency_contact_phone.regex' => 'Emergency contact phone must be a valid Ethiopian phone number.',
            'emergency_contact_relationship.required' => 'Emergency contact relationship is required.',
            'photo.image' => 'Photo must be an image file.',
            'photo.mimes' => 'Photo must be a JPEG or PNG file.',
            'photo.max' => 'Photo size must not exceed 2MB.',
        ];
    }
}
