<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\JobController;
use App\Http\Controllers\Api\RunnerController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Protected routes (require API token via custom middleware)
Route::middleware('auth.token')->group(function () {
    // Auth
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    
    // Projects
    Route::apiResource('projects', ProjectController::class);
    
    // Deployment Jobs
    Route::get('/jobs', [JobController::class, 'index']);
    Route::post('/jobs', [JobController::class, 'store']);
    Route::get('/jobs/{id}', [JobController::class, 'show']);
    
    // Runners (user management)
    Route::get('/runners', [RunnerController::class, 'index']);
    Route::post('/runners', [RunnerController::class, 'register']);
    Route::delete('/runners/{id}', [RunnerController::class, 'destroy']);
});

// Runner routes (require runner token)
Route::prefix('runner')->middleware('auth.runner')->group(function () {
    Route::get('/jobs', [RunnerController::class, 'pollJobs']);
    Route::post('/jobs/{id}/claim', [RunnerController::class, 'claimJob']);
    Route::post('/jobs/{id}/status', [RunnerController::class, 'updateStatus']);
    Route::post('/jobs/{id}/logs', [RunnerController::class, 'appendLogs']);
    Route::post('/heartbeat', [RunnerController::class, 'heartbeat']);
});
