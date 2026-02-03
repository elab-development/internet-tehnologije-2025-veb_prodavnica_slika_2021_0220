<?php

namespace App\Console\Commands;

use App\Mail\ResetPasswordMail;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;


class CreatePrivilegedUser extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:create-privileged';

    // signature je nastavak na php artisan -> tako se poziva ovaj konzolni unos korisnika

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Kreira admina ili slikara';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('=== Kreiranje privilegovanog korisnika ===');

        $ime=trim($this->ask('Unesi ime'));

        $prezime=trim($this->ask('Unesi prezime'));

        $email=trim($this->ask('Unesi email'));

        $uloga=$this->choice(
            'Izaberi ulogu',
            ['slikar','admin'],
            0
        );

        $podaci=[
            'ime'=>$ime,
            'prezime'=>$prezime,
            'email'=>$email,
            // 'password'=>$password,
            // 'password_confirmation'=>$password_confirmation,
            'uloga'=>$uloga
        ];
        $pravila=[
            'ime'=>['required','string','max:50'],
            'prezime'=>['required','string','max:50'],
            'email'=>['required','string','max:255','email'],         //,'unique:users,email' ovo je samo za create
            // 'password'=>['required','string','min:6','confirmed'],
            'uloga'=>['required','in:slikar,admin']
        ];

        if($uloga==='admin'){

            //unos
            $password=$this->secret('Unesi password');
            $password_confirmation=$this->secret('Potvrdi password');

            //podaci
            $podaci['password']=$password;
            $podaci['password_confirmation']=$password_confirmation;

            //validacija
            $pravila['password']=['required','string','min:6','confirmed'];

        }

        $validator=Validator::make($podaci,$pravila);

        if($validator->fails()){

            $this->error("Validacija nije prosla.");
            
            foreach($validator->errors()->all() as $error){
                $this->line(' - ' . $error);
            }

            return Command::FAILURE;
        }
        
        $data=$validator->validated();

        $generatedPassword=Str::random(32);

        $data['password']=$data['uloga']==='admin' ? Hash::make($data['password']) : Hash::make($generatedPassword);

        unset($data['password_confirmation']);

        $user=User::updateOrCreate(

            ['email'=>$data['email']],//po cemu se trazi user za update ako postoji i dodaje ako ne
            
            $data    //vrednosti koje se azuriraju/dodaju
        );

        $user->email_verified_at=Carbon::now();
        $user->save();


        if($user->uloga==='slikar'){
            
            // -mailtrap
            $token = Str::random(64);

            DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $user->email],
                [
                    'token' => Hash::make($token),
                    'created_at' => now()
                ]
            );
            
            $resetUrl=route(
                'password.reset.form',
                [
                    'token'=>$token,
                    'email'=>$user->email
                ]
            );

            Mail::to($user->email)->send(
                new ResetPasswordMail($user,$resetUrl)
            );
            //
        }
        

        $this->info('Mozete pronaci korisnika sa unetim podacima u bazi.');

        $this->line("Ime: {$user->ime}");
        $this->line("Prezime: {$user->prezime}");
        $this->line("Email: {$user->email}");
        $this->line("Uloga: {$user->uloga}");

        return Command::SUCCESS;
    }
}

//mailtrap - ovo je skracena varijanta za reset lozinke koja zahteva u modelu User -> use CanResetPassword; i ove donje rute u web.php. Takodje koristi genericki mail na engleskom u mailtrap-u
        
        // Route::get('/password/reset/{token}', [ForgotPasswordController::class, 'showResetForm'])
        // ->name('password.reset');

        // Route::post('/password/reset', [ForgotPasswordController::class, 'resetPassword'])
        // ->name('password.update');

        // //
        // Password::sendResetLink([   //dole je uradjeno peske sa Mail::to...
        //     'email' => $user->email,
        // ]);
        // //
