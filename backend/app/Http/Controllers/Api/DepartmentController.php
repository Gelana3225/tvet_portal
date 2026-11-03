<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Department;
use Illuminate\Http\JsonResponse;

class DepartmentController extends Controller
{
    /**
     * Get all active departments
     */
    public function index(): JsonResponse
    {
        $departments = Department::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'code', 'description']);

        return response()->json([
            'departments' => $departments
        ], 200);
    }

    /**
     * Get a specific department with its occupations
     */
    public function show($id): JsonResponse
    {
        $department = Department::where('is_active', true)
            ->with(['occupations' => function($query) {
                $query->where('is_active', true)
                      ->orderBy('name');
            }])
            ->find($id);

        if (!$department) {
            return response()->json([
                'message' => 'Department not found.'
            ], 404);
        }

        return response()->json([
            'department' => [
                'id' => $department->id,
                'name' => $department->name,
                'code' => $department->code,
                'description' => $department->description,
                'occupations' => $department->occupations->map(function($occupation) {
                    return [
                        'id' => $occupation->id,
                        'name' => $occupation->name,
                        'code' => $occupation->code,
                        'description' => $occupation->description,
                    ];
                })
            ]
        ], 200);
    }
}
