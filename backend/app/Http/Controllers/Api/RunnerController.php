<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Runner;
use App\Models\DeploymentJob;

class RunnerController extends Controller
{
    /**
     * Register a new runner.
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $runner = $request->user()->runners()->create([
            'name' => $validated['name'],
            'token' => \Illuminate\Support\Str::random(80),
            'status' => 'online',
            'last_seen_at' => now(),
        ]);

        return response()->json([
            'message' => 'Runner registered successfully',
            'runner' => $runner,
            'token' => $runner->token, // Only shown once during registration
        ], 201);
    }

    /**
     * Poll for available jobs (runner endpoint).
     * Requires runner token authentication.
     */
    public function pollJobs(Request $request)
    {
        // Get runner by token
        $token = $request->bearerToken();
        $runner = Runner::where('token', $token)->firstOrFail();

        // Update last seen
        $runner->update([
            'status' => 'online',
            'last_seen_at' => now(),
        ]);

        // Find an available job (queued, not claimed by any runner)
        $job = DeploymentJob::where('status', 'queued')
            ->whereNull('runner_id')
            ->with('project')
            ->oldest()
            ->first();

        if (!$job) {
            return response()->json([
                'job' => null,
                'message' => 'No jobs available',
            ]);
        }

        return response()->json([
            'job' => $job,
        ]);
    }

    /**
     * Claim a job (runner endpoint).
     */
    public function claimJob(Request $request, string $id)
    {
        $token = $request->bearerToken();
        $runner = Runner::where('token', $token)->firstOrFail();

        $job = DeploymentJob::findOrFail($id);

        // Only allow claiming if job is queued and not claimed
        if ($job->status !== 'queued' || $job->runner_id !== null) {
            return response()->json([
                'message' => 'Job already claimed or not available',
            ], 409);
        }

        $job->update([
            'runner_id' => $runner->id,
            'status' => 'running',
            'started_at' => now(),
        ]);

        return response()->json([
            'message' => 'Job claimed successfully',
            'job' => $job->load('project'),
        ]);
    }

    /**
     * Update job status (runner endpoint).
     */
    public function updateStatus(Request $request, string $id)
    {
        $token = $request->bearerToken();
        $runner = Runner::where('token', $token)->firstOrFail();

        $job = DeploymentJob::where('id', $id)
            ->where('runner_id', $runner->id)
            ->firstOrFail();

        $validated = $request->validate([
            'status' => 'required|in:running,completed,failed',
            'logs' => 'sometimes|string',
        ]);

        $updateData = [
            'status' => $validated['status'],
        ];

        if (isset($validated['logs'])) {
            $updateData['logs'] = $validated['logs'];
        }

        if (in_array($validated['status'], ['completed', 'failed'])) {
            $updateData['completed_at'] = now();
        }

        $job->update($updateData);

        return response()->json([
            'message' => 'Job status updated successfully',
            'job' => $job,
        ]);
    }

    /**
     * Append logs to a job (runner endpoint).
     */
    public function appendLogs(Request $request, string $id)
    {
        $token = $request->bearerToken();
        $runner = Runner::where('token', $token)->firstOrFail();

        $job = DeploymentJob::where('id', $id)
            ->where('runner_id', $runner->id)
            ->firstOrFail();

        $validated = $request->validate([
            'logs' => 'required|string',
        ]);

        $currentLogs = $job->logs ?? '';
        $job->update([
            'logs' => $currentLogs . "\n" . $validated['logs'],
        ]);

        return response()->json([
            'message' => 'Logs appended successfully',
        ]);
    }

    /**
     * Heartbeat to update runner status (runner endpoint).
     */
    public function heartbeat(Request $request)
    {
        $token = $request->bearerToken();
        $runner = Runner::where('token', $token)->firstOrFail();

        $runner->update([
            'status' => 'online',
            'last_seen_at' => now(),
        ]);

        return response()->json([
            'message' => 'Heartbeat received',
            'runner' => $runner,
        ]);
    }

    /**
     * List all runners for the authenticated user.
     */
    public function index(Request $request)
    {
        $runners = $request->user()->runners()->get();

        return response()->json([
            'runners' => $runners,
        ]);
    }

    /**
     * Delete a runner.
     */
    public function destroy(Request $request, string $id)
    {
        $runner = $request->user()->runners()->findOrFail($id);
        $runner->delete();

        return response()->json([
            'message' => 'Runner deleted successfully',
        ]);
    }
}
