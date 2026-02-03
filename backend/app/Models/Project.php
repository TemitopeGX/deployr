<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'repo_url',
        'framework',
        'target',
    ];

    /**
     * Get the user that owns the project.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the deployment jobs for the project.
     */
    public function deploymentJobs()
    {
        return $this->hasMany(DeploymentJob::class);
    }
}
