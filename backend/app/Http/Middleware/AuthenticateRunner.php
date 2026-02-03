<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateRunner
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json([
                'message' => 'Unauthenticated. Runner token required.',
            ], 401);
        }

        $runner = \App\Models\Runner::where('token', $token)->first();

        if (!$runner) {
            return response()->json([
                'message' => 'Invalid runner token.',
            ], 401);
        }

        // Store runner in request for later use
        $request->attributes->set('runner', $runner);

        return $next($request);
    }
}
