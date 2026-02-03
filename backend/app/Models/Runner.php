<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Runner extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'token',
        'status',
        'last_seen_at',
    ];

    protected $hidden = [
        'token',
    ];

    protected $casts = [
        'last_seen_at' => 'datetime',
    ];

    /**
     * Get the user that owns the runner.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the deployment jobs assigned to this runner.
     */
    public function deploymentJobs()
    {
        return $this->hasMany(DeploymentJob::class);
    }
}
