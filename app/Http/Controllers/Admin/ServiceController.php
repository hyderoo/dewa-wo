<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ServiceController extends Controller
{
    /**
     * Display a listing of services.
     */
    public function index()
    {
        $services = Service::orderBy('type')->orderBy('title')->get();

        return Inertia::render('Admin/Service/ServiceManagement', [
            'services' => $services,
            'toast' => session('toast')
        ]);
    }

    /**
     * Store a newly created service.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'icon' => 'required|string|max:50',
            'type' => ['required', Rule::in(['premium', 'additional', 'exclusive'])],
            'features' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        Service::create($request->all());

        return redirect()->route('admin.services')->with('toast', [
            'type' => 'success',
            'message' => 'Service created successfully.'
        ]);
    }

    /**
     * Update the specified service.
     */
    public function update(Request $request, Service $service)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'icon' => 'required|string|max:50',
            'type' => ['required', Rule::in(['premium', 'additional', 'exclusive'])],
            'features' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        $service->update($request->all());

        return redirect()->route('admin.services')->with('toast', [
            'type' => 'success',
            'message' => 'Service updated successfully.'
        ]);
    }

    /**
     * Remove the specified service.
     */
    public function destroy(Service $service)
    {
        $service->delete();

        return redirect()->route('admin.services')->with('toast', [
            'type' => 'success',
            'message' => 'Service deleted successfully.'
        ]);
    }

    /**
     * Toggle service active status
     */
    public function toggleStatus(Service $service)
    {
        $service->update([
            'is_active' => !$service->is_active
        ]);

        return redirect()->route('admin.services')->with('toast', [
            'type' => 'success',
            'message' => $service->is_active
                ? 'Service activated successfully.'
                : 'Service deactivated successfully.'
        ]);
    }
}
