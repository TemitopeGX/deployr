<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    /**
     * Register a new user.
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
        ]);

        $user = \App\Models\User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
            'api_token' => \Illuminate\Support\Str::random(80),
        ]);

        return response()->json([
            'message' => 'User registered successfully',
            'user' => $user,
            'api_token' => $user->api_token,
        ], 201);
    }

    /**
     * Login user and return API token.
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = \App\Models\User::where('email', $validated['email'])->first();

        if (!$user || !\Illuminate\Support\Facades\Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials',
            ], 401);
        }

        // Generate new API token if not exists
        if (!$user->api_token) {
            $user->api_token = \Illuminate\Support\Str::random(80);
            $user->save();
        }

        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
            'api_token' => $user->api_token,
        ]);
    }

    /**
     * Logout user (revoke API token).
     */
    public function logout(Request $request)
    {
        $user = $request->user();
        
        if ($user) {
            $user->api_token = null;
            $user->save();
        }

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    /**
     * Get authenticated user.
     */
    public function me(Request $request)
    {
        return response()->json([
            'user' => $request->user(),
        ]);
    }
}
