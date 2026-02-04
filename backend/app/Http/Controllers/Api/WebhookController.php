<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Project;
use App\Models\DeploymentJob;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    public function handleGitHub(Request $request)
    {
        Log::info('GitHub Webhook received', $request->all());

        $repoUrl = $request->input('repository.html_url');
        $ref = $request->input('ref'); // e.g. "refs/heads/master"
        $branch = str_replace('refs/heads/', '', $ref);

        if (!$repoUrl || !$branch) {
            return response()->json(['message' => 'Invalid payload'], 400);
        }

        // Find projects matching this repo URL
        $projects = Project::where('repo_url', 'like', "%$repoUrl%")->get();

        if ($projects->isEmpty()) {
            return response()->json(['message' => 'Project not found for ' . $repoUrl], 404);
        }

        foreach ($projects as $project) {
            // Create a new deployment job
            DeploymentJob::create([
                'project_id' => $project->id,
                'branch' => $branch,
                'status' => 'queued',
            ]);

            Log::info("Auto-deploy triggered for project: {$project->name} on branch: {$branch}");
        }

        return response()->json(['message' => 'Deployment jobs created']);
    }
}
