<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreApplicationRequest extends FormRequest
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
            'admission_period_id' => ['required', 'exists:admission_periods,id'],
            'department_id' => ['required', 'exists:departments,id'],
            'occupation_id' => ['required', 'exists:occupations,id'],
            'qualification_level_id' => ['required', 'exists:qualification_levels,id'],
            'previous_school_name' => ['required', 'string', 'max:255'],
            'previous_school_address' => ['required', 'string', 'max:255'],
            'grade_10_result' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'grade_12_result' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'has_disability' => ['required', 'boolean'],
            'disability_description' => ['nullable', 'required_if:has_disability,true', 'string', 'max:500'],
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
            'admission_period_id.required' => 'Admission period is required.',
            'admission_period_id.exists' => 'Selected admission period does not exist.',
            'department_id.required' => 'Department is required.',
            'department_id.exists' => 'Selected department does not exist.',
            'occupation_id.required' => 'Occupation is required.',
            'occupation_id.exists' => 'Selected occupation does not exist.',
            'qualification_level_id.required' => 'Qualification level is required.',
            'qualification_level_id.exists' => 'Selected qualification level does not exist.',
            'previous_school_name.required' => 'Previous school name is required.',
            'previous_school_address.required' => 'Previous school address is required.',
            'grade_10_result.numeric' => 'Grade 10 result must be a number.',
            'grade_10_result.min' => 'Grade 10 result must be at least 0.',
            'grade_10_result.max' => 'Grade 10 result must not exceed 100.',
            'grade_12_result.numeric' => 'Grade 12 result must be a number.',
            'grade_12_result.min' => 'Grade 12 result must be at least 0.',
            'grade_12_result.max' => 'Grade 12 result must not exceed 100.',
            'has_disability.required' => 'Disability status is required.',
            'disability_description.required_if' => 'Please describe your disability.',
        ];
    }
}
