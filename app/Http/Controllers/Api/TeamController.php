<?php

namespace App\Http\Controllers\Api;

use App\Models\Team;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class TeamController extends ApiController
{
    /**
     * Get all team members
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $team = Team::orderBy('is_highlighted', 'desc')
            ->orderBy('name')
            ->get()
            ->map(function ($member) {
                $member->image_url = $member->image ? Storage::url($member->image) : null;
                return $member;
            });

        return $this->successResponse($team);
    }

    /**
     * Get highlighted team members
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function highlighted()
    {
        $team = Team::where('is_highlighted', true)
            ->orderBy('name')
            ->get()
            ->map(function ($member) {
                $member->image_url = $member->image ? Storage::url($member->image) : null;
                return $member;
            });

        return $this->successResponse($team);
    }

    /**
     * Get a specific team member
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $member = Team::find($id);

        if (!$member) {
            return $this->notFoundResponse('Team member not found');
        }

        $member->image_url = $member->image ? Storage::url($member->image) : null;

        return $this->successResponse($member);
    }
}
