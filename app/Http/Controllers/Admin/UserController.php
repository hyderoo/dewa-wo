<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Password;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Display a paginated listing of users.
     */
    public function index(Request $request)
    {
        // Get query parameters for pagination and search
        $perPage = $request->input('perPage', 10); // Default to 10 items per page
        $search = $request->input('search', '');
        $sortField = $request->input('sortField', 'name');
        $sortDirection = $request->input('sortDirection', 'asc');
        $roleFilter = $request->input('role', 'all');

        // Build the query
        $query = User::query();

        // Apply role filter if not 'all'
        if ($roleFilter !== 'all') {
            $query->where('role', $roleFilter);
        }

        // Apply search filter if provided
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Apply sorting
        $query->orderBy($sortField, $sortDirection);

        // Execute query with pagination
        $users = $query->paginate($perPage)->withQueryString();

        return Inertia::render('Admin/User/UserManagement', [
            'users' => $users,
            'filters' => [
                'search' => $search,
                'perPage' => $perPage,
                'sortField' => $sortField,
                'sortDirection' => $sortDirection,
                'role' => $roleFilter
            ]
        ]);
    }

    /**
     * Store a newly created user.
     */
    public function store(Request $request)
    {
        Log::info('User store request', [
            'data' => $request->except('password')
        ]);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users')
            ],
            'phone' => [
                'required',
                'string',
                'max:20',
                'regex:/^([0-9\s\-\+\(\)]*)$/', // Basic phone format validation
                'min:10'
            ],
            'password' => 'required|string|min:8',
            'role' => 'sometimes|string|in:admin,user',
        ], [
            'email.email' => 'Please enter a valid email address.',
            'email.unique' => 'This email address is already registered.',
            'phone.regex' => 'Please enter a valid phone number format.',
            'phone.min' => 'Phone number must be at least 10 characters.'
        ]);

        // Set default role if not provided
        if (!isset($validated['role'])) {
            $validated['role'] = 'user';
        }

        // Hash the password
        $validated['password'] = Hash::make($validated['password']);

        $user = User::create($validated);

        Log::info('User created', ['id' => $user->id, 'role' => $user->role]);

        return redirect()->route('admin.users')->with('toast', [
            'type' => 'success',
            'message' => 'User added successfully!'
        ]);
    }

    /**
     * Update the specified user.
     */
    public function update(Request $request, User $user)
    {
        Log::info('User update request', [
            'user_id' => $user->id,
            'data' => $request->except('password')
        ]);

        $rules = [
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id)
            ],
            'phone' => [
                'required',
                'string',
                'max:20',
                'regex:/^([0-9\s\-\+\(\)]*)$/', // Basic phone format validation
                'min:10'
            ],
            'role' => 'sometimes|string|in:admin,user',
        ];

        // Only validate password if it's provided
        if ($request->filled('password')) {
            $rules['password'] = 'string|min:8';
        }

        $validated = $request->validate($rules, [
            'email.email' => 'Please enter a valid email address.',
            'email.unique' => 'This email address is already registered.',
            'phone.regex' => 'Please enter a valid phone number format.',
            'phone.min' => 'Phone number must be at least 10 characters.'
        ]);

        // Hash the password if it's provided
        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        // Log the role change if it's changed
        if (isset($validated['role']) && $validated['role'] !== $user->role) {
            Log::info('User role changed', [
                'user_id' => $user->id,
                'old_role' => $user->role,
                'new_role' => $validated['role']
            ]);
        }

        $user->update($validated);

        Log::info('User updated', ['id' => $user->id]);

        return redirect()->route('admin.users')->with('toast', [
            'type' => 'success',
            'message' => 'User updated successfully!'
        ]);
    }

    /**
     * Remove the specified user.
     */
    public function destroy(User $user)
    {
        $userRole = $user->role;
        $user->delete();

        Log::info('User deleted', ['id' => $user->id, 'role' => $userRole]);

        return redirect()->back()->with('toast', [
            'type' => 'success',
            'message' => 'User deleted successfully!'
        ]);
    }

    /**
     * Reset the user's password directly (admin action).
     */
    public function resetPassword(Request $request, User $user)
    {
        $validated = $request->validate([
            'password' => 'required|string|min:8',
        ]);

        $user->update([
            'password' => Hash::make($validated['password'])
        ]);

        Log::info('User password reset by admin', ['id' => $user->id]);

        return redirect()->back()->with('toast', [
            'type' => 'success',
            'message' => 'Password reset successfully!'
        ]);
    }

    /**
     * Send password reset link to the user's email.
     */
    public function sendPasswordResetLink(Request $request, User $user)
    {
        // Send the password reset notification
        $status = Password::sendResetLink(['email' => $user->email]);

        Log::info('Password reset email request', [
            'user_id' => $user->id,
            'email' => $user->email,
            'status' => $status
        ]);

        if ($status === Password::RESET_LINK_SENT) {
            return redirect()->back()->with('toast', [
                'type' => 'success',
                'message' => 'Password reset link sent to the user\'s email!'
            ]);
        } else {
            return redirect()->back()->with('toast', [
                'type' => 'error',
                'message' => 'Failed to send password reset link. Please try again.'
            ]);
        }
    }
}
