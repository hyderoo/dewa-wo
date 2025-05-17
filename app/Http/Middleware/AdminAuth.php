<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Firebase\JWT\ExpiredException;
use App\Models\User;
use Symfony\Component\HttpFoundation\Response;

class AdminAuth
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if user is already authenticated via session
        if (Auth::check()) {
            $user = Auth::user();
            if ($user->role === 'admin') {
                return $next($request);
            }
        }

        // If not authenticated via session, check JWT token from cookie
        $token = $request->cookie('admin_token');

        if (!$token) {
            return redirect()->route('admin.login')->with('status', 'Please login to access the admin area.');
        }

        try {
            // Decode the JWT token
            $decoded = JWT::decode($token, new Key(config('app.key'), 'HS256'));

            // Check if the token has a valid role claim
            if (!isset($decoded->role) || $decoded->role !== 'admin') {
                return redirect()->route('admin.login')->with('status', 'You do not have admin privileges.');
            }

            // Find the user and authenticate them
            $user = User::find($decoded->sub);

            if (!$user || $user->role !== 'admin') {
                return redirect()->route('admin.login')->with('status', 'User not found or not an admin.');
            }

            // Login the user via session for this request
            Auth::login($user);

            return $next($request);
        } catch (ExpiredException $e) {
            // Token has expired
            return redirect()->route('admin.login')->with('status', 'Your session has expired. Please login again.');
        } catch (\Exception $e) {
            // Invalid token
            return redirect()->route('admin.login')->with('status', 'Invalid authentication token. Please login again.');
        }
    }
}
