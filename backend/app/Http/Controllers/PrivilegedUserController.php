<?php

namespace App\Http\Controllers;

use App\Http\Resources\SlikaResource;
use App\Models\Porudzbina;
use App\Models\Slika;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class PrivilegedUserController extends Controller
{

    //DODAJ LOGIKU ZA BANOVANJE KUPACA KOJI NPR. NE PREUZIMAJU POSILJE NAKON PORUCIVANJA (SOFT DELETE ILI FORCE DELETE)
    //dodavanje,brisanje,izmenu tehnika,popusta i slika (imas dodavanje slika)
    
    /**
     * Display a listing of the resource.
     */
    public function mesecniBrojPorudzbina()
    {
        
        //Carbon::now()->subMonths(12) daje datum od pre 12 meseci 

        // $porudbine=Porudzbina::select(DB::raw('DATE_FORMAT(created_at, "%Y-%m") as period'),
        //                               DB::raw('COUNT(*) as brojP'))

        // ->where('created_at','>=',Carbon::now()->subMonths(12))  
        // ->groupBy('period')
        // ->orderBy('period','asc')
        // ->pluck('brojP','period');  

        // key:value  , period:brojP

        $driver = DB::connection()->getDriverName();

        if ($driver === 'sqlite') {
            $format = "strftime('%Y-%m', created_at)";           //za sqlite kojeg koriste testovi
        } elseif ($driver === 'pgsql') {
            $format = "TO_CHAR(created_at, 'YYYY-MM')";          //za postgreSql kojeg koristi cloud platforma (tipa render)
        } else { // mysql
            $format = "DATE_FORMAT(created_at, '%Y-%m')";        //za regularni mysql
        }

        $porudbine = DB::table('porudzbine')
            ->selectRaw("$format as period, COUNT(*) as brojP")  //sirov sql
            ->groupBy('period')
            ->orderBy('period')
            ->pluck('brojP', 'period');

        // SELECT 
        // DATE_FORMAT(created_at, '%Y-%m') as period,
        // COUNT(*) as brojP
        // FROM porudzbine
        // WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        // GROUP BY period
        // ORDER BY period ASC

        $rezultat=[];

        for($i=11;$i>=0;$i--){

            $datum=Carbon::now()->subMonths($i);  //datum je u 1. iteraciji najdalji (mart 2025.) u poslednjoj (feb 2026.)

            $period=$datum->format("Y-m");

            $rezultat[]=[                           //dodaje na kraj niza

                'Mesec'=> $datum->format("M Y"),    //Jan 2026
                'Porudzbine' => $porudbine[$period] ?? 0   //$period koristimo kao kljuc da dobijemo vrednost iz asocijativnog niza $porudzbine (brojP)
            ];                                             //?? 0  znaci da ako ne postoji vrednost sa datim kljucem ($porudbine[$period]) dodelis value 0
    
        }

        return response()->json($rezultat,200);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function dodajSliku(Request $request)
    {
        $validator=Validator::make($request->all(),[
            'galerija_id'=>['nullable','integer','exists:galerija,id'],
            // 'putanja_fotografije'=>['nullable','string',new PostojiPutanjaSlike()],
            'putanja_fotografije'=>['nullable','image','mimes:jpg,png,jpeg','max:2048'], //treba: php artisan storage:link
            'cena'=>['required','numeric','min:0'],
            'naziv'=>['required','string','max:50'],
            'visina_cm'=>['required','numeric','min:0'],
            'sirina_cm'=>['required','numeric','min:0'],
            'dostupna'=>['required','boolean'],

            'tehnike'=>['required','array','min:1'], //niz id-jeva tehnika
            'tehnike.*'=>['integer','exists:tehnike,id']
          ]);
        if($validator->fails()){
            return response()->json([
                'message'=>'Validacija nije prosla.',
                'errors'=>$validator->errors()
            ],422);
        }
        $data=$validator->validated();

        if($request->hasFile('putanja_fotografije')){

            $file=$request->file('putanja_fotografije');

            $extension=$file->getClientOriginalExtension(); //jpg npr.
            $fileName=Str::slug($request->naziv) . '.' . $extension;  //Str::slug(string) dodaje - na prazna mesta i na jos nacina prilagodjava string url-u (radi kao URL.createObjectUrl(string)) gde je string deo ili ceo file path

            $path=$file->storeAs('fotografije',$fileName,'public');

            // $path=$request->file('putanja_fotografije')->store('fotografije','public');  //necemo ovako da bismo mu mi kreirali ime (da ne bude random)
            $data['putanja_fotografije']=$path;
        }

        $tehnike=$data['tehnike'];

        unset($data['tehnike']); //brise tehnike(kljuc asoc niza) iz $data jer nemamo tu kolonu u tabeli slike

        $slika=Slika::create($data);

        $slika->tehnike()->sync($tehnike);  //pomocu relacije tehnike pristupa pivot tabeli, preko sync (detach+attach) fje azurira tehnike vezane za ovu sliku(posto se kreira slika onda samo dodaje prosledjene tehnike iz request-a)

        $slika->load(['galerija','tehnike']); //preko fje/relacije tehnike() ucitava iz pivot tabele iz baze tehnike koje su vezane za ovu sliku

        return response()->json(new SlikaResource($slika),201);
    }


    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $user)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        //
    }
}
