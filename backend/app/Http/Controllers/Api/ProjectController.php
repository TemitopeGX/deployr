<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $projects = $request->user()->projects()->with('deploymentJobs')->get();

        return response()->json([
            'projects' => $projects,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'repo_url' => 'required|url',
            'framework' => 'required|in:laravel,nextjs',
            'target' => 'required|in:vps,cpanel',
        ]);

        $project = $request->user()->projects()->create($validated);

        return response()->json([
            'message' => 'Project created successfully',
            'project' => $project,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, string $id)
    {
        $project = $request->user()->projects()->with('deploymentJobs')->findOrFail($id);

        return response()->json([
            'project' => $project,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $project = $request->user()->projects()->findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'repo_url' => 'sometimes|url',
            'framework' => 'sometimes|in:laravel,nextjs',
            'target' => 'sometimes|in:vps,cpanel',
        ]);

        $project->update($validated);

        return response()->json([
            'message' => 'Project updated successfully',
            'project' => $project,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, string $id)
    {
        $project = $request->user()->projects()->findOrFail($id);
        $project->delete();

        return response()->json([
            'message' => 'Project deleted successfully',
        ]);
    }
}
