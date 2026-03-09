<?php

namespace App\Http\Controllers\Authentication;

use App\Http\Controllers\Controller;
use App\Mail\VerifyEmail;                 //
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;      //
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Validator;

use OpenApi\Attributes as OA;

class RegisterController extends Controller
{
    #[OA\Post(
        path: '/api/register',
        summary: 'Registracija novog korisnika',
        description: 'Kreira novi korisnički nalog i šalje email sa verifikacionim linkom. Link je vremenski ograničen na 60 minuta.',
        tags: ['Autentifikacija'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\MediaType(
                mediaType: 'application/json',
                schema: new OA\Schema(
                    required: ['ime', 'prezime', 'email', 'password', 'password_confirmation'],
                    properties: [
                        new OA\Property(property: 'ime', type: 'string', maxLength: 50, example: 'Marko'),
                        new OA\Property(property: 'prezime', type: 'string', maxLength: 50, example: 'Marković'),
                        new OA\Property(property: 'email', type: 'string', format: 'email', maxLength: 255, example: 'marko@example.com'),
                        new OA\Property(property: 'password', type: 'string', format: 'password', minLength: 6, example: 'tajna123'),
                        new OA\Property(property: 'password_confirmation', type: 'string', format: 'password', minLength: 6, example: 'tajna123'),
                    ]
                )
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Registracija uspešna — verifikacioni email je poslat'),
            new OA\Response(response: 422, description: 'Validaciona greška (npr. email već postoji, lozinke se ne poklapaju)')
        ]
    )]
    public function register(Request $request)
    {
        $validator=Validator::make($request->all(),[
            'ime'=>'required|string|max:50',
            'prezime'=>'required|string|max:50',
            'email'=>'required|string|email|max:255|unique:users,email',
            'password'=>'required|string|min:6|confirmed'//password_confirmation
        ]);         //dodaj rule za password da mora imati odredjenu vrstu karaktera
        if($validator->fails()){
            return response()->json([
                'message'=>'Validacija nije prosla.',
                'errors'=>$validator->errors()
            ],422);
        }
        $data=$validator->validated();
        $user=User::create($data);

        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addMinutes(60),
            [
            'id' => $user->id
            ]
        );  //koristimo rutu sa imenom verification.verify iz api.php, koju smo prethodno napravili,i dodeljujemo id i kad istice.
            // Mi je koristimo da napravimo url.
        //http://localhost/verify/email/5?expires=1703448600&signature=abc123xyz //laravel samo doda ovo ?expires=1703448600&signature=abc123xyz


        Mail::to($user->email)->send(           //usera sa proverenim podacima i kreirani url saljemo kao parametre prilikom poziva VerifyEmail
            new VerifyEmail($user, $verificationUrl)   //u VerifyEmail smo morali samo da kreiramo public User-a i url i da ih inicijalizujemo u konstruktoru, naslov mejla eventualno izmenimo, i pomocu markdown za telo mejla pozivamo emails.verify-email (struktuiran mejl u blade/php-u)
                                                //klikom korisnika na verifikuj mejl dugme u mailtrap-u ruta(koju smo prosledili i stranica na koju dolazimo klikom) poziva Controller za verifikaciju i preko verify metode ona proverava ovaj url i ako je validan proverava da li je korisnik vec verifikovan i ispisuje odgovarajucu poruku
        );

        return response()->json([
            'message' => 'Registracija uspešna. Proverite email radi verifikacije.'
        ], 201);
    }
}
