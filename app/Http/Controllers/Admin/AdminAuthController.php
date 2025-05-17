<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Firebase\JWT\JWT;
use Illuminate\Support\Facades\Cookie;

class AdminAuthController extends Controller
{
    /**
     * Show the admin login form.
     */
    public function showLoginForm()
    {
        return Inertia::render('Admin/Auth/AdminLogin');
    }

    /**
     * Handle an authentication attempt for admin.
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // First check if the user exists and has admin role
        $user = User::where('email', $credentials['email'])->first();

        if (!$user || $user->role !== 'admin') {
            throw ValidationException::withMessages([
                'general' => 'These credentials do not match our records or you do not have admin privileges.',
            ]);
        }

        // Then attempt login
        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();

            // Generate JWT token
            $token = $this->generateJwtToken($user);

            // Set the token in a HTTP-only cookie
            Cookie::queue('admin_token', $token, 60 * 24, null, null, false, true); // 24 hours

            Log::info('Admin login successful', ['user_id' => $user->id]);

            return redirect()->intended(route('admin.dashboard'));
        }

        throw ValidationException::withMessages([
            'general' => 'The provided credentials do not match our records.',
        ]);
    }

    /**
     * Log the admin out of the application.
     */
    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        // Remove the JWT cookie
        Cookie::queue(Cookie::forget('admin_token'));

        Log::info('Admin logout successful');

        return redirect()->route('admin.login');
    }

    /**
     * Generate a JWT token for the authenticated admin user.
     */
    private function generateJwtToken(User $user)
    {
        $payload = [
            'iss' => config('app.url'), // Issuer
            'aud' => config('app.url'), // Audience
            'iat' => time(), // Issued at time
            'exp' => time() + (60 * 60 * 24), // Expiration (24 hours)
            'sub' => $user->id, // Subject (user ID)
            'role' => 'admin', // User role
            'email' => $user->email, // User email
        ];

        return JWT::encode($payload, config('app.key'), 'HS256');
    }
}
