<?php

namespace App\Http\Controllers\Api;

use App\Models\Service;
use Illuminate\Http\Request;

class ServiceController extends ApiController
{
    /**
     * Get all active services
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $services = Service::where('is_active', true)
            ->orderBy('type')
            ->orderBy('title')
            ->get();

        return $this->successResponse($services);
    }

    /**
     * Get services by type
     *
     * @param string $type
     * @return \Illuminate\Http\JsonResponse
     */
    public function getByType($type)
    {
        $services = Service::where('is_active', true)
            ->where('type', $type)
            ->orderBy('title')
            ->get();

        return $this->successResponse($services);
    }

    /**
     * Get a specific service
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $service = Service::where('is_active', true)->find($id);

        if (!$service) {
            return $this->notFoundResponse('Service not found');
        }

        return $this->successResponse($service);
    }
}
