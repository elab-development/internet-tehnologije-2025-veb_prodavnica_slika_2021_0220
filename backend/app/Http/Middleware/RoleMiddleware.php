<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    { //...roles je slicno kao u python-u *args (proizvoljan broj parametara), mi ove parametre prosledjujemo kroz middleware u api.php (roles:slikar,admin)
        $user=Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Niste prijavljeni.'], 401);
        }

        if (!in_array($user->uloga, $roles ,true)) {
            return response()->json(['message' => 'Nemate ovlascenja.'], 403);
        }

        return $next($request);
    }
}
