<?php

namespace App\Http\Controllers\Authentication;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

use OpenApi\Attributes as OA;

class LogoutController extends Controller
{
    #[OA\Post(
        path: '/api/logout',
        summary: 'Odjava korisnika',
        description: 'Briše sve Sanctum tokene trenutno ulogovanog korisnika.',
        tags: ['Autentifikacija'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Uspešna odjava'),
            new OA\Response(response: 401, description: 'Neautorizovan')
        ]
    )]
    public function logout(Request $request){

        //$user=$request->user(); //isto kao Auth::user()

        $user=$request->user();
        $user->tokens()->delete();

        return response()->json([
            'message'=>'Uspesno ste odjavljeni'
        ],200);
    }
}
