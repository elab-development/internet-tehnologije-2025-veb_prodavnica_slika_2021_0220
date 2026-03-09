<?php

namespace App\Http\Controllers\Authentication;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

use OpenApi\Attributes as OA;

class LoginController extends Controller
{
    #[OA\Post(
        path: '/api/login',
        summary: 'Prijava korisnika',
        description: 'Proverava kredencijale i vraća Sanctum token. Email mora biti verifikovan pre prijave.',
        tags: ['Autentifikacija'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\MediaType(
                mediaType: 'application/json',
                schema: new OA\Schema(
                    required: ['email', 'password'],
                    properties: [
                        new OA\Property(property: 'email', type: 'string', format: 'email', example: 'marko@example.com'),
                        new OA\Property(property: 'password', type: 'string', format: 'password', example: 'tajna123'),
                    ]
                )
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Uspešna prijava — vraća token i podatke o korisniku',
                content: new OA\MediaType(
                    mediaType: 'application/json',
                    schema: new OA\Schema(
                        properties: [
                            new OA\Property(property: 'message', type: 'string', example: 'Uspesno ste se prijavili'),
                            new OA\Property(property: 'token', type: 'string', example: '1|abc123xyz...'),
                            new OA\Property(property: 'user', type: 'object'),
                        ]
                    )
                )
            ),
            new OA\Response(response: 401, description: 'Pogrešan email ili lozinka'),
            new OA\Response(response: 403, description: 'Email nije verifikovan'),
            new OA\Response(response: 422, description: 'Validaciona greška')
        ]
    )]
    public function login(Request $request)
    {
        $validator=Validator::make($request->all(),[
            'email'=>'required|string|email',
            'password'=>'required|string'
        ]);
        if($validator->fails()){
            return response()->json([
                'message'=>'Validacija nije prosla.',
                'errors'=>$validator->errors()
            ],422);
        }
        $data=$validator->validated();

        if(!Auth::attempt($data)){ //pronalazi korisnika sa prosledjenim mejlom, hesira prosledjenu lozinku i poredi (hesiranu) prosledjenu sa onom (hesiranom) iz baze
            return response()->json([
                'message' => 'Pogrešan email ili lozinka.'
            ], 401);
        }

        $user=$request->user(); //isto kao $user = Auth::user(); 

        if ($user->email_verified_at==null) {
            return response()->json([
                'message' => 'Morate verifikovati email pre prijave.'
            ], 403);
        }

        $token = $user->createToken('api_token')->plainTextToken; 

        return response()->json([
            'message'=>'Uspesno ste se prijavili',
            'token' => $token,
            'user' => $user
        ],200);
    }
}

