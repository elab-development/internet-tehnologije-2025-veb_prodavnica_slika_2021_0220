<?php

namespace App\Http\Controllers\Authentication;

use App\Http\Controllers\Controller;
use App\Mail\ResetPasswordMail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ForgotPasswordController extends Controller
{
    public function sendResetLink(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validacija nije prosla.',
                'errors' => $validator->errors()
            ], 422);
        }




        

        $email = $validator->validated()['email'];

        $user = User::where('email', $email)->first();

        if (!$user) {
            return response()->json([
                'message' => 'Ako nalog postoji poslali smo instrukcije za reset lozinke.'
            ], 200);
        }

        $token = Str::random(64);

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            [
                'token' => Hash::make($token),
                'created_at' => now()
            ]
        );

        // $resetUrl=config('app.frontend_url',config('app.url')) .
        // '/reset-password?token=' . urlencode($token) . 
        // '&email=' . urlencode($user->email);

        //OVO JE BACKEND URL (ne frontend)
        $resetUrl = route(
            'password.reset.form', 
            [
            'token' => $token,
            'email' => $user->email
            ]
        ); //"pozivamo" rutu sa imenom password.reset.form iz api.php, koju smo prethodno napravili,i dodeljujemo token i email.
            // Mi je koristimo da napravimo url.
        //http://localhost/password/reset?token=XXX&email=YYY //laravel samo doda ovo ?expires=1703448600&signature=abc123xyz


        Mail::to($user->email)->send(
            new ResetPasswordMail($user, $resetUrl)
        );
        //usera sa proverenim podacima i kreirani url saljemo kao parametre prilikom poziva ResetPasswordMail
        //u ResetPasswordMail smo morali samo da kreiramo public User-a i url i da ih inicijalizujemo u konstruktoru, naslov mejla eventualno izmenimo, i pomocu markdown za telo mejla pozivamo emails.password-reset (struktuiran mejl u blade/php-u)
        //klikom korisnika na verifikuj mejl(resetuj lozinku) dugme u mailtrap-u ruta(koju smo prosledili i stranica na koju dolazimo klikom) 
        //->poziva ForgotPasswordController i preko showResetForm metode se otvara blade/php forma za unos nove lozinke i nakon klika na 'submit' se prebacujemo na rutu koja poziva metodu resetPassword iz istog controller-a i ona proverava novu lozinku
      
        return response()->json([
            'message' => 'Ako nalog postoji poslali smo instrukcije za reset lozinke.'
        ], 200);
    }

    //  METODA za PRIKAZ FORME
    public function showResetForm(Request $request)
    {
        return view(
            'emails.Reset-form',
            [
            'token' => $request->token,
            'email' => $request->email
            ]
        );
    }


    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required|string',
            'email' => 'required|string|email',
            'password' => 'required|string|min:6|confirmed'
        ]);

        if($validator->fails()){
            return response()->json([
                'message'=>'Validacija nije prosla.',
                'errors'=>$validator->errors()
            ],422);
        }

        $data = $validator->validated();
        
        $record = DB::table('password_reset_tokens')
            ->where('email', $data['email'])
            ->first();

        if(!$record){
            return response()->json([
                'message'=>'Neispravan token ili email.'
            ],400);
        }

        $created_at=Carbon::parse($record->created_at);
        if($created_at->addMinutes(60)->isPast()){
            return response()->json([
                'message'=>'Token je istekao. Posaljite novi zahtev za reset lozinke.'
            ],400);
        }

        if(!Hash::check($data['token'],$record->token)){
            return response()->json([
                'message'=>'Neispravan token.'
            ],400);
        }

        $user = User::where('email', $data['email'])->firstOrFail();
        $user->password = Hash::make($data['password']);
        $user->save();

        DB::table('password_reset_tokens')
            ->where('email', $data['email'])
            ->delete();

        return response()->json([
                'message'=>'Lozinka je uspesno resetovana. Mozete se prijaviti sa novom lozinkom.'
            ],200);
    }

}

