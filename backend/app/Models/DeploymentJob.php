<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeploymentJob extends Model
{
    protected $fillable = [
        'project_id',
        'runner_id',
        'status',
        'branch',
        'commit_hash',
        'logs',
        'started_at',
        'completed_at',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    /**
     * Get the project that owns the deployment job.
     */
    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the runner assigned to this deployment job.
     */
    public function runner()
    {
        return $this->belongsTo(Runner::class);
    }
}
