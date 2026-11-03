<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ApplicantProfileController;
use App\Http\Controllers\Api\DepartmentController;
use App\Http\Controllers\Api\OccupationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public routes
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now()->toIso8601String(),
        'service' => 'Hawagalan TVET College API',
    ]);
});

// Authentication routes (public)
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// Public reference data
Route::prefix('reference')->group(function () {
    Route::get('/departments', [DepartmentController::class, 'index']);
    Route::get('/departments/{id}', [DepartmentController::class, 'show']);
    Route::get('/occupations', [OccupationController::class, 'index']);
    Route::get('/occupations/{id}', [OccupationController::class, 'show']);
});

// Protected routes (require authentication)
Route::middleware(['auth:sanctum'])->group(function () {
    // Auth routes
    Route::prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/user', [AuthController::class, 'user']);
    });
    
    // Applicant profile routes
    Route::prefix('profile')->group(function () {
        Route::get('/', [ApplicantProfileController::class, 'show']);
        Route::post('/', [ApplicantProfileController::class, 'store']);
        Route::put('/', [ApplicantProfileController::class, 'update']);
        Route::delete('/photo', [ApplicantProfileController::class, 'deletePhoto']);
    });
});
