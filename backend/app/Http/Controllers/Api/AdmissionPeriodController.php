<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdmissionPeriod;
use Illuminate\Http\JsonResponse;

class AdmissionPeriodController extends Controller
{
    /**
     * Get all active/open admission periods
     */
    public function index(): JsonResponse
    {
        $periods = AdmissionPeriod::whereIn('status', ['draft', 'open'])
            ->orderBy('opening_date', 'desc')
            ->get();

        return response()->json([
            'admission_periods' => $periods->map(function($period) {
                return $this->formatPeriodResponse($period);
            })
        ], 200);
    }

    /**
     * Get the currently active (open) admission period
     */
    public function active(): JsonResponse
    {
        $activePeriod = AdmissionPeriod::where('status', 'open')
            ->where('opening_date', '<=', now())
            ->where('closing_date', '>=', now())
            ->first();

        if (!$activePeriod) {
            return response()->json([
                'message' => 'No active admission period available.',
                'admission_period' => null
            ], 404);
        }

        return response()->json([
            'admission_period' => $this->formatPeriodResponse($activePeriod)
        ], 200);
    }

    /**
     * Get a specific admission period
     */
    public function show($id): JsonResponse
    {
        $period = AdmissionPeriod::find($id);

        if (!$period) {
            return response()->json([
                'message' => 'Admission period not found.'
            ], 404);
        }

        return response()->json([
            'admission_period' => $this->formatPeriodResponse($period)
        ], 200);
    }

    /**
     * Format admission period response
     */
    private function formatPeriodResponse(AdmissionPeriod $period): array
    {
        return [
            'id' => $period->id,
            'name' => $period->name,
            'academic_year' => $period->academic_year,
            'opening_date' => $period->opening_date,
            'closing_date' => $period->closing_date,
            'status' => $period->status,
            'description' => $period->description,
            'is_active' => $period->isActive(),
            'days_remaining' => $period->isActive() ? now()->diffInDays($period->closing_date) : null,
        ];
    }
}
