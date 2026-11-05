<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new applicant account
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        \Log::info('Registration attempt', [
            'email' => $request->email,
            'has_password' => !empty($request->password),
            'has_confirmation' => !empty($request->password_confirmation),
        ]);

        // Get the applicant role
        $applicantRole = Role::where('name', 'applicant')->first();

        if (!$applicantRole) {
            \Log::error('Applicant role not found');
            return response()->json([
                'message' => 'System configuration error. Please contact administrator.'
            ], 500);
        }

        // Create the user account
        $user = User::create([
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role_id' => $applicantRole->id,
            'is_active' => true,
        ]);

        \Log::info('User created successfully', ['user_id' => $user->id]);

        // Log the user in
        Auth::login($user);

        // Generate Sanctum API token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Registration successful.',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'role' => $user->role ? $user->role->name : 'applicant',
                'is_active' => $user->is_active,
            ]
        ], 201);
    }

    /**
     * Login with email and password
     */
    public function login(LoginRequest $request): JsonResponse
    {
        // Find user by email
        $user = User::where('email', $request->email)->first();

        // Verify credentials
        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Check if user is active
        if (!$user->is_active) {
            return response()->json([
                'message' => 'Your account has been deactivated. Please contact administrator.'
            ], 403);
        }

        // Log the user in
        Auth::login($user);

        // Update last login timestamp
        $user->update(['last_login_at' => now()]);

        // Generate Sanctum API token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful.',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'role' => $user->role ? $user->role->name : 'applicant',
                'is_active' => $user->is_active,
                'last_login_at' => $user->last_login_at,
            ]
        ], 200);
    }

    /**
     * Logout the authenticated user
     */
    public function logout(Request $request): JsonResponse
    {
        if ($request->user()) {
            $token = $request->user()->currentAccessToken();
            if ($token && method_exists($token, 'delete')) {
                $token->delete();
            }
        }

        Auth::guard('web')->logout();

        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return response()->json([
            'message' => 'Logout successful.'
        ], 200);
    }

    /**
     * Get the authenticated user's information
     */
    public function user(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.'
            ], 401);
        }

        return response()->json([
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'role' => $user->role ? $user->role->name : 'applicant',
                'is_active' => $user->is_active,
                'last_login_at' => $user->last_login_at,
            ]
        ], 200);
    }
}
