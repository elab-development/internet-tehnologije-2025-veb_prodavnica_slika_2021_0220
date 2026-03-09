<?php

namespace App\Http\Controllers\Authentication;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

use OpenApi\Attributes as OA;

class EmailVerificationController extends Controller
{
    #[OA\Get(
        path: '/api/verify/email/{id}',
        summary: 'Verifikacija email adrese',
        description: 'Potvrđuje email korisnika putem potpisanog linka iz verifikacionog emaila. Nakon uspešne verifikacije preusmerava na frontend. Link je vremenski ograničen i mora imati validan Laravelov potpis.',
        tags: ['Autentifikacija'],
        parameters: [
            new OA\Parameter(
                name: 'id',
                in: 'path',
                required: true,
                description: 'ID korisnika',
                schema: new OA\Schema(type: 'integer')
            ),
            new OA\Parameter(
                name: 'expires',
                in: 'query',
                required: true,
                description: 'Unix timestamp isteka linka (dodaje Laravel automatski)',
                schema: new OA\Schema(type: 'integer')
            ),
            new OA\Parameter(
                name: 'signature',
                in: 'query',
                required: true,
                description: 'HMAC potpis linka (dodaje Laravel automatski)',
                schema: new OA\Schema(type: 'string')
            ),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Email već verifikovan'),
            new OA\Response(response: 302, description: 'Verifikacija uspešna — preusmeravanje na frontend (?verified=true)'),
            new OA\Response(response: 401, description: 'Link je istekao ili potpis nije validan'),
            new OA\Response(response: 404, description: 'Korisnik nije pronađen')
        ]
    )]
    public function verify(Request $request, $id)
    {
        if (!$request->hasValidSignature()) {
            return response()->json([
                'message' => 'Verifikacioni link je istekao ili nije validan.'
            ], 401);
        }

        $user = User::findOrFail($id);

        if ($user->email_verified_at) {
            return response()->json([
                'message' => 'Email je već verifikovan.'
            ],200);
        }

        $user->email_verified_at=now(); //direktno pristupa bazi
        $user->save();

        // $user->update([   //update koristi fillable tj. atribute modela da pristupi bazi
        //     'email_verified_at' => now()   //mi nemamo ovaj atr...
        // ]);

        return redirect(
            config('app.frontend_url') . '/?verified=true'     //config('app.frontend_url') u config folderu imamo app.php u kom postoji (mi smo ga dodali) key 'frontend_url' ciji value je u .env (to je url: localhost:3000) (i to smo dodali mi)
        );
    }
}
