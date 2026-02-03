<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class JobController extends Controller
{
    /**
     * List all deployment jobs for the authenticated user.
     */
    public function index(Request $request)
    {
        $jobs = \App\Models\DeploymentJob::whereHas('project', function ($query) use ($request) {
            $query->where('user_id', $request->user()->id);
        })
        ->with(['project', 'runner'])
        ->orderBy('created_at', 'desc')
        ->get();

        return response()->json([
            'jobs' => $jobs,
        ]);
    }

    /**
     * Create a new deployment job.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'branch' => 'sometimes|string|max:255',
        ]);

        // Verify the project belongs to the user
        $project = $request->user()->projects()->findOrFail($validated['project_id']);

        $job = \App\Models\DeploymentJob::create([
            'project_id' => $project->id,
            'branch' => $validated['branch'] ?? 'main',
            'status' => 'queued',
        ]);

        return response()->json([
            'message' => 'Deployment job created successfully',
            'job' => $job->load(['project', 'runner']),
        ], 201);
    }

    /**
     * Get details of a specific deployment job.
     */
    public function show(Request $request, string $id)
    {
        $job = \App\Models\DeploymentJob::whereHas('project', function ($query) use ($request) {
            $query->where('user_id', $request->user()->id);
        })
        ->with(['project', 'runner'])
        ->findOrFail($id);

        return response()->json([
            'job' => $job,
        ]);
    }
}
