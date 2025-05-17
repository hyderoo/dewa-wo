<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Team;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class TeamController extends Controller
{
    public function index()
    {
        $teams = Team::all();
        return Inertia::render('Admin/Team/TeamManagement', [
            'teams' => $teams
        ]);
    }

    public function store(Request $request)
    {
        // Log the request for debugging
        Log::info('Team store request', [
            'has_file' => $request->hasFile('image'),
            'all_data' => $request->all()
        ]);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'role' => 'required|string|max:255',
            'description' => 'required|string',
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
            'instagram' => 'nullable|url|max:255',
            'linkedin' => 'nullable|url|max:255',
            'is_highlighted' => 'boolean',
        ]);

        // Handle image upload - now required
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('team_photos', 'public');
            $validated['image'] = '/storage/' . $imagePath;

            // Log successful file upload
            Log::info('Image uploaded successfully', ['path' => $imagePath]);
        } else {
            // This shouldn't happen due to validation, but log it if it does
            Log::error('Image validation passed but no file present');
            return redirect()->back()->withErrors([
                'image' => 'Image upload failed. Please try again.'
            ]);
        }

        // If this member is highlighted, remove highlight from others
        if ($request->boolean('is_highlighted')) {
            Team::where('is_highlighted', true)->update(['is_highlighted' => false]);
        }

        $team = Team::create($validated);

        // Log team creation
        Log::info('Team member created', ['id' => $team->id]);

        return redirect()->route('admin.teams')->with('toast', [
            'type' => 'success',
            'message' => 'Team member added successfully!'
        ]);
    }

    public function update(Request $request, Team $team)
    {
        // Log the request for debugging
        Log::info('Team update request', [
            'has_file' => $request->hasFile('image'),
            'team_id' => $team->id,
            'request_data' => $request->all()
        ]);

        // If image is uploaded, we need to validate form fields
        $rules = [
            'name' => 'sometimes|required|string|max:255',
            'role' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'instagram' => 'nullable|url|max:255',
            'linkedin' => 'nullable|url|max:255',
            'is_highlighted' => 'boolean',
        ];

        // Only require image for new uploads
        if ($request->hasFile('image')) {
            $rules['image'] = 'required|image|mimes:jpeg,png,jpg,gif|max:2048';
        }

        $validated = $request->validate($rules);

        // Get current data for any fields not in the request
        $teamData = $team->toArray();
        foreach ($teamData as $key => $value) {
            if (!isset($validated[$key]) && !in_array($key, ['id', 'created_at', 'updated_at'])) {
                $validated[$key] = $value;
            }
        }

        // Handle image upload if provided
        if ($request->hasFile('image')) {
            // Delete old image if it exists and is not the default
            if ($team->image && !str_contains($team->image, 'tim.jpg')) {
                $oldPath = str_replace('/storage/', '', $team->image);
                if (Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                    Log::info('Old image deleted', ['path' => $oldPath]);
                }
            }

            $imagePath = $request->file('image')->store('team_photos', 'public');
            $validated['image'] = '/storage/' . $imagePath;

            // Log successful file upload
            Log::info('Updated image uploaded successfully', ['path' => $imagePath]);
        } else {
            if ($request->input('image') === null) {
                unset($validated['image']);
            }
        }

        // If this member is highlighted, remove highlight from others
        if ($request->boolean('is_highlighted') && !$team->is_highlighted) {
            Team::where('is_highlighted', true)->update(['is_highlighted' => false]);
        }

        $team->update($validated);

        // Log successful update
        Log::info('Team member updated', ['id' => $team->id]);

        return redirect()->route('admin.teams')->with('toast', [
            'type' => 'success',
            'message' => 'Team member updated successfully!'
        ]);
    }

    public function destroy(Team $team)
    {
        // Delete the image file if it's not the default
        if ($team->image && !str_contains($team->image, 'tim.jpg')) {
            $imagePath = str_replace('/storage/', '', $team->image);
            if (Storage::disk('public')->exists($imagePath)) {
                Storage::disk('public')->delete($imagePath);
                Log::info('Team image deleted during team removal', ['path' => $imagePath]);
            }
        }

        $team->delete();

        // Log successful deletion
        Log::info('Team member deleted', ['id' => $team->id]);

        return redirect()->back()->with('toast', [
            'type' => 'success',
            'message' => 'Team member deleted successfully!'
        ]);
    }
}
