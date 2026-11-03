<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Occupation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OccupationController extends Controller
{
    /**
     * Get all active occupations
     */
    public function index(Request $request): JsonResponse
    {
        $query = Occupation::where('is_active', true)
            ->with('department:id,name,code');

        // Filter by department if provided
        if ($request->has('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        $occupations = $query->orderBy('name')->get();

        return response()->json([
            'occupations' => $occupations->map(function($occupation) {
                return [
                    'id' => $occupation->id,
                    'name' => $occupation->name,
                    'code' => $occupation->code,
                    'description' => $occupation->description,
                    'department' => $occupation->department ? [
                        'id' => $occupation->department->id,
                        'name' => $occupation->department->name,
                        'code' => $occupation->department->code,
                    ] : null
                ];
            })
        ], 200);
    }

    /**
     * Get a specific occupation
     */
    public function show($id): JsonResponse
    {
        $occupation = Occupation::where('is_active', true)
            ->with('department:id,name,code')
            ->find($id);

        if (!$occupation) {
            return response()->json([
                'message' => 'Occupation not found.'
            ], 404);
        }

        return response()->json([
            'occupation' => [
                'id' => $occupation->id,
                'name' => $occupation->name,
                'code' => $occupation->code,
                'description' => $occupation->description,
                'department' => $occupation->department ? [
                    'id' => $occupation->department->id,
                    'name' => $occupation->department->name,
                    'code' => $occupation->department->code,
                ] : null
            ]
        ], 200);
    }
}
