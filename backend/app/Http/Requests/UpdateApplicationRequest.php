<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateApplicationRequest extends FormRequest
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
            'department_id' => ['sometimes', 'required', 'exists:departments,id'],
            'occupation_id' => ['sometimes', 'required', 'exists:occupations,id'],
            'qualification_level_id' => ['sometimes', 'required', 'exists:qualification_levels,id'],
            'previous_school_name' => ['sometimes', 'required', 'string', 'max:255'],
            'previous_school_address' => ['sometimes', 'required', 'string', 'max:255'],
            'grade_10_result' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'grade_12_result' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'has_disability' => ['sometimes', 'required', 'boolean'],
            'disability_description' => ['nullable', 'string', 'max:500'],
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
            'department_id.exists' => 'Selected department does not exist.',
            'occupation_id.exists' => 'Selected occupation does not exist.',
            'qualification_level_id.exists' => 'Selected qualification level does not exist.',
            'grade_10_result.numeric' => 'Grade 10 result must be a number.',
            'grade_10_result.max' => 'Grade 10 result must not exceed 100.',
            'grade_12_result.numeric' => 'Grade 12 result must be a number.',
            'grade_12_result.max' => 'Grade 12 result must not exceed 100.',
        ];
    }
}
