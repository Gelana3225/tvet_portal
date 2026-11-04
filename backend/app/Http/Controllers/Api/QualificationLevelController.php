<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\QualificationLevel;
use Illuminate\Http\JsonResponse;

class QualificationLevelController extends Controller
{
    /**
     * Get all active qualification levels
     */
    public function index(): JsonResponse
    {
        $levels = QualificationLevel::where('is_active', true)
            ->orderBy('id')
            ->get(['id', 'name', 'code', 'description']);

        return response()->json([
            'qualification_levels' => $levels
        ], 200);
    }

    /**
     * Get a specific qualification level
     */
    public function show($id): JsonResponse
    {
        $level = QualificationLevel::where('is_active', true)->find($id);

        if (!$level) {
            return response()->json([
                'message' => 'Qualification level not found.'
            ], 404);
        }

        return response()->json([
            'qualification_level' => [
                'id' => $level->id,
                'name' => $level->name,
                'code' => $level->code,
                'description' => $level->description,
            ]
        ], 200);
    }
}

