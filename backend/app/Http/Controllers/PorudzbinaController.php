<?php

namespace App\Http\Controllers;

use App\Http\Resources\PorudzbinaResource;
use App\Mail\CustomerNotificationMail;
use App\Mail\PrivilegedNotificationMail;
use App\Models\Popust;
use App\Models\Porudzbina;
use App\Models\Slika;
use App\Models\Stavka;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

use function Pest\Laravel\options;

class PorudzbinaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $porudzbine=Porudzbina::with(['user','stavke.slika','popust'])->get();
        return response()->json(PorudzbinaResource::collection($porudzbine),200);
    }

    
    public function allOrdersPaginated(Request $request)
    {
        $perPage=$request->get('per_page',10);

        $query=Porudzbina::with(['user','stavke.slika']);

        $query->orderBy('poslato','asc') //glavni kriterijum za filtriranje
              ->orderBy('datum','asc'); //prvo 0 pa 1 tj. false pa true

        $paginator=$query->paginate($perPage);

        return PorudzbinaResource::collection($paginator);
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
    public function storeGost(Request $request)
    {
        //izostavljena drzava jer ce se za sada podrazumevati Srbija, i ukupnaCena jer nju mi racunamo, i rb stavki isto mi postavljamo, i status tj polje poslato (false), i danasnji datum sami unosimo
        $validator=Validator::make($request->all(),[
            // 'popust_id'=>['nullable','integer','exists:popusti,id'],
            'ime'=>['required','string','max:30'],
            'prezime'=>['required','string','max:30'],
            'grad'=>['required','string','max:30'],
            'adresa'=>['required','string','max:100'],
            'postanski_broj'=>['required','string','max:20'],
            'telefon'=>['required','string','max:30'],

            'stavke'=>['required','array','min:1'],
            'stavke.*.slika_id'=>['required','integer','exists:slike,id'],
            // 'stavke.*.cena'=>['required','numeric','min:0'],  //cena se izvlaci iz baze, dodati popust 
            'stavke.*.kolicina'=>['required','integer','min:1'],
        ]);

        if($validator->fails()){
            return response()->json([
                'message'=>'Validacija nije prosla.',
                'errors'=>$validator->errors()
            ],422);
        }

        $data=$validator->validated();

        $slike=Slika::whereIn('id',collect($data['stavke'])->pluck('slika_id'))  //SELECT * FROM slike WHERE id IN (5, 12);
                                   ->get()->keyBy('id');                         //dobijamo mapu po id tj. asoc niz ciji su kljucevi id slika a vrednosti objekti slike


        $today = Carbon::today(); // današnji datum sa godinom

        // uzimamo sve aktivne popuste i filtriramo prema datumu
        $popust = Popust::where('aktivan', true)->get()->filter(function ($p) use ($today) {

            // kreiramo datumOd i datumDo u tekućoj godini
            $datumOd = Carbon::create($today->year, $p->mesecOd, $p->danOd);
            $datumDo = Carbon::create($today->year, $p->mesecDo, $p->danDo);

            // ako datumDo je manji od datumOd:
            if ($datumDo->lt($datumOd)) {
                
                //SLUČAJ A: Danas je kraj godine (npr. 28. Decembar 2025)
                //// Opseg: 25.12.2025 -> 05.01.2026
                $datumDoA=$datumDo->copy()->addYear();
                if($today->between($datumOd,$datumDoA)){
                    return true;
                }

                // SLUČAJ B: Danas je početak godine (npr. 2. Januar 2025)
                //// Opseg: 25.12.2024 -> 05.01.2025 
                $datumOdB=$datumOd->copy()->subYear();
                if($today->between($datumOdB,$datumDo)){
                    return true;
                }

                return false;
            }


            // proveravamo da li današnji datum spada u period
            return $today->between($datumOd, $datumDo);

        })->sortByDesc('procenat')->first(); // ako postoji više popusta, uzmi najveći

        if(!$popust){

            $data['popust_id']=null;
            $data['procenat_popusta_ss']=0;
            $data['tip_popusta_ss']=null;
        }
        else{            

            $data['popust_id']=$popust->id;
            $data['procenat_popusta_ss']=$popust->procenat;
            $data['tip_popusta_ss']='praznik';
        }

        DB::beginTransaction();

        try {

            $ukupnaCena=0;

            foreach($data['stavke'] as $stavka){

                $slika=$slike[$stavka['slika_id']];

                if(!$slika->dostupna){
                    throw new \Exception("Slika '{$slika->naziv}' nije dostupna.");
                }

                $ukupnaCena+=$slika->cena*$stavka['kolicina'];
            }

            $konacnaCena=$ukupnaCena*(1-($data['procenat_popusta_ss']/100));

            $porudzbina=Porudzbina::create([
                'user_id'=>null,
                'datum'=>now(),             //eloquent na osnovu $casts iz modela sam konkvertuje iz datetime ili string u date koji baza ocekuje
                'ukupna_cena'=>$ukupnaCena,
                'ime'=>$data['ime'],
                'prezime'=>$data['prezime'],
                'grad'=>$data['grad'],
                'adresa'=>$data['adresa'],
                'postanski_broj'=>$data['postanski_broj'],
                'telefon'=>$data['telefon'],
                'poslato'=>false,

                'popust_id'=>isset($data['popust_id']) ? $data['popust_id'] : null,
                'procenat_popusta_ss'=>$data['procenat_popusta_ss'],
                'tip_popusta_ss'=>$data['tip_popusta_ss'],
                'konacna_cena'=>$konacnaCena,
            ]);

            foreach($data['stavke'] as $index => $stavka){

                $slika=$slike[$stavka['slika_id']];

                $slika->update(['dostupna'=>false]);

                Stavka::create([
                    'porudzbina_id'=>$porudzbina->id,
                    'slika_id'=>$stavka['slika_id'],
                    'rb'=>$index+1,
                    'cena'=>$slika->cena,
                    'kolicina'=>$stavka['kolicina']
                ]);
            }

            DB::commit();

            $porudzbina->load(['popust','user','stavke.slika']);


            //-mailtrap, mozda da dodas dugme za odlazak na sajt
            $privilegedUsers=User::whereIn('uloga',['admin','slikar'])->get();

            foreach($privilegedUsers as $index=>$pu){

                Mail::to($pu->email)
                ->later(
                    now()->addSeconds($index*10),  //delay
                    new PrivilegedNotificationMail($pu, $porudzbina)
                );

            }
            //

            return response()->json(new PorudzbinaResource($porudzbina),201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message'=>'Neuspesno kreiranje porudzbine.',
                'error'=>$e->getMessage()
            ],500);
        }
    }


    public function storeUlogovani(Request $request)
    {
        //izostavljena drzava jer ce se za sada podrazumevati Srbija, i ukupnaCena jer nju mi racunamo, i rb stavki isto mi postavljamo, i status tj polje poslato (false), i danasnji datum sami unosimo
        $validator=Validator::make($request->all(),[
            'user_id'=>['nullable','integer','exists:users,id'],
            'popust_id'=>['nullable','integer','exists:popusti,id'],
            'ime'=>['required','string','max:30'],
            'prezime'=>['required','string','max:30'],
            'grad'=>['required','string','max:30'],
            'adresa'=>['required','string','max:100'],
            'postanski_broj'=>['required','string','max:20'],
            'telefon'=>['required','string','max:30'],

            'stavke'=>['required','array','min:1'],
            'stavke.*.slika_id'=>['required','integer','exists:slike,id'],
            // 'stavke.*.cena'=>['required','numeric','min:0'],  //cena se izvlaci iz baze, dodati popust 
            'stavke.*.kolicina'=>['required','integer','min:1'],
        ]);

        if($validator->fails()){
            return response()->json([
                'message'=>'Validacija nije prosla.',
                'errors'=>$validator->errors()
            ],422);
        }

        $data=$validator->validated();

        $userId=$request->user()->id;

        $slike=Slika::whereIn('id',collect($data['stavke'])->pluck('slika_id'))  //SELECT * FROM slike WHERE id IN (5, 12);
                                   ->get()->keyBy('id');                         //dobijamo mapu po id tj. asoc niz ciji su kljucevi id slika a vrednosti objekti slike

        
        
        $today = Carbon::today(); // današnji datum sa godinom

        // uzimamo sve aktivne popuste i filtriramo prema datumu
        $popust = Popust::where('aktivan', true)
                ->get()
                ->filter(function ($p) use ($today) {

            // kreiramo datumOd i datumDo u tekućoj godini
            $datumOd = Carbon::create($today->year, $p->mesecOd, $p->danOd);
            $datumDo = Carbon::create($today->year, $p->mesecDo, $p->danDo);

            // ako datumDo je manji od datumOd, znači da prelazi u sledeću godinu
            if ($datumDo->lt($datumOd)) {
                
                //SLUČAJ A: Danas je kraj godine (npr. 28. Decembar 2025)
                //// Opseg: 25.12.2025 -> 05.01.2026
                $datumDoA=$datumDo->copy()->addYear();
                if($today->between($datumOd,$datumDoA)){
                    return true;
                }

                // SLUČAJ B: Danas je početak godine (npr. 2. Januar 2025)
                //// Opseg: 25.12.2024 -> 05.01.2025 
                $datumOdB=$datumOd->copy()->subYear();
                if($today->between($datumOdB,$datumDo)){
                    return true;
                }

                return false;
            }

            
            
            // proveravamo da li današnji datum spada u period
            return $today->between($datumOd, $datumDo);

        })->sortByDesc('procenat')->first(); //sortByDesc sluzi za sortiranje php kolekcije koju smo pomocu get dobili, orderby bi moglo pre get i sluzi za sortiranje u bazi ako postoji više popusta, uzmi najveći

        if(!$popust){

            $data['popust_id']=null;
            $data['procenat_popusta_ss']=10;   //ulogovani ima difoltno 10%
            $data['tip_popusta_ss']='ulogovan';
        }
        else{            

            $data['popust_id']=$popust->id;
            $data['procenat_popusta_ss']=$popust->procenat;
            $data['tip_popusta_ss']='praznik';
        }

        DB::beginTransaction();

        try {

            $ukupnaCena=0;

            foreach($data['stavke'] as $stavka){

                $slika=$slike[$stavka['slika_id']];

                if(!$slika->dostupna){
                    throw new \Exception("Slika '{$slika->naziv}' nije dostupna.");
                }

                $ukupnaCena+=$slika->cena*$stavka['kolicina'];
            }

            $konacnaCena=$ukupnaCena*(1-($data['procenat_popusta_ss']/100));

            $porudzbina=Porudzbina::create([
                'user_id'=>$userId,          //isset($data['user_id']) ? $data['user_id'] : null,
                'datum'=>now(),             //eloquent na osnovu $casts iz modela sam konkvertuje iz datetime ili string u date koji baza ocekuje
                'ukupna_cena'=>$ukupnaCena,
                'ime'=>$data['ime'],
                'prezime'=>$data['prezime'],
                'grad'=>$data['grad'],
                'adresa'=>$data['adresa'],
                'postanski_broj'=>$data['postanski_broj'],
                'telefon'=>$data['telefon'],
                'poslato'=>false,

                'popust_id'=>isset($data['popust_id']) ? $data['popust_id'] : null,
                'procenat_popusta_ss'=>$data['procenat_popusta_ss'],
                'tip_popusta_ss'=>$data['tip_popusta_ss'],
                'konacna_cena'=>$konacnaCena,
            ]);

            foreach($data['stavke'] as $index => $stavka){

                $slika=$slike[$stavka['slika_id']];

                Stavka::create([
                    'porudzbina_id'=>$porudzbina->id,
                    'slika_id'=>$stavka['slika_id'],
                    'rb'=>$index+1,
                    'cena'=>$slika->cena,
                    'kolicina'=>$stavka['kolicina']
                ]);
            }

            DB::commit();

            $porudzbina->load(['popust','user','stavke.slika']);


            //-mailtrap, mogao bi da dodas dugme kojim se prebacujes direktno na sajt u emails.notify-privileged
            
            $user=$request->user();
            Mail::to($user->email)->send(
                new CustomerNotificationMail($user)
            );
            
            $privilegedUsers=User::whereIn('uloga',['admin','slikar'])->get();

            foreach($privilegedUsers as $index=>$pu){

                Mail::to($pu->email)
                ->later(                                    //da bi later() radio, mora da run-uje-> php artisan queue:work --sleep=10 --tries=3 
                    now()->addSeconds($index+10),  //delay
                    new PrivilegedNotificationMail($pu, $porudzbina)
                );

            }
            //

            return response()->json(new PorudzbinaResource($porudzbina),201);




        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message'=>'Neuspesno kreiranje porudzbine.',
                'error'=>$e->getMessage()
            ],500);
        }

    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $porudzbina=Porudzbina::with(['popust','user','stavke.slika'])->findOrFail($id);
        return response()->json(new PorudzbinaResource($porudzbina),200);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Porudzbina $porudzbina)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $porudzbina=Porudzbina::findOrFail($id);

        $validator=Validator::make($request->all(),[
            'user_id'=>['nullable','integer','exists:users,id'],
            'popust_id'=>['nullable','integer','exists:popusti,id'],
            'datum'=>['sometimes','date'],
            'ime'=>['sometimes','string','max:30'],
            'prezime'=>['sometimes','string','max:30'],
            'grad'=>['sometimes','string','max:30'],
            'adresa'=>['sometimes','string','max:100'],
            'postanski_broj'=>['sometimes','string','max:20'],
            'telefon'=>['sometimes','string','max:30'],
            'poslato'=>['sometimes','boolean'],
            

            'stavke'=>['sometimes','array','min:1'],
            'stavke.*.slika_id'=>['integer','exists:slike,id'],
            // 'stavke.*.cena'=>['numeric','min:0'],
            'stavke.*.kolicina'=>['integer','min:1'],

            // 'tip_popusta_ss'=>['nullable','string','max:30']
        ]);

        if($validator->fails()){
            return response()->json([
                'message'=>'Validacija nije prosla.',
                'errors'=>$validator->errors()
            ],422);
        }

        $data=$validator->validated();

        if(empty($data)){
            return response()->json([
                'message' => 'Nema podataka za izmenu.'
            ], 400);
        }

        DB::beginTransaction();

        try {
            
            if(isset($data['stavke'])){

                $ukupnaCena=0;

                $porudzbina->stavke()->delete();

                foreach($data['stavke'] as $index=>$stavka){

                    $slika=Slika::findOrFail($stavka['slika_id']);
                    
                    $ukupnaCena+=$slika->cena*$stavka['kolicina'];
                    Stavka::create([
                        'porudzbina_id'=>$porudzbina->id,
                        'slika_id'=>$stavka['slika_id'],
                        'rb'=>$index+1,
                        'cena'=>$slika->cena,
                        'kolicina'=>$stavka['kolicina']
                    ]);
                }
                
                $data['ukupna_cena']=$ukupnaCena;
                unset($data['stavke']);
            }

            if(!isset($data['ukupna_cena'])){ //ako nisi menjao stavke tj. ukCenu

                $data['ukupna_cena']=$porudzbina->ukupna_cena;

            }
            
            $popustId = array_key_exists('popust_id', $data) //kao isset je ali je true cak i kad je prosledjen null, za razliku od isset
                ? $data['popust_id']
                : $porudzbina->popust_id;

            if ($popustId !== null) {

                $popust = Popust::findOrFail($popustId);
                $data['popust_id'] = $popustId;
                $data['procenat_popusta_ss'] = $popust->procenat;
                $data['tip_popusta_ss'] = 'praznik';

            }
            elseif(isset($data['user_id'])){

                $data['procenat_popusta_ss']=10;
                $data['tip_popusta_ss']='ulogovan';
            }
            else{
                $data['procenat_popusta_ss']=0;
                $data['tip_popusta_ss']=null;
            }

            $data['konacna_cena']=$data['ukupna_cena']*(1-($data['procenat_popusta_ss']/100));
            
            $porudzbina->update($data);

            DB::commit();

            $porudzbina->load(['popust','user','stavke.slika']);

            return response()->json(new PorudzbinaResource($porudzbina),200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message'=>'Neuspesna izmena porudzbine.',
                'error'=>$e->getMessage()
            ],500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $porudzbina=Porudzbina::findOrFail($id);

        $porudzbina->stavke()->delete();

        $porudzbina->delete();

        return response()->json(['message'=>'Porudzbina je obrisana.'],200);
    }

    public function vratiSvePorudzbineKupca($userId){
        $user=User::findOrFail($userId);
        $porudzbine=$user->porudzbine()->with(['stavke.slika','popust'])->get();
        return response()->json(PorudzbinaResource::collection($porudzbine),200);
    }

    public function moje(Request $request){

        $userId=$request->user()->id;

        $porudzbine=Porudzbina::with(['stavke.slika','popust'])->where('user_id',$userId)
        ->orderByDesc('datum')
        ->get();

        return response()->json(PorudzbinaResource::collection($porudzbine),200);
    }


    public function exportCsv(Request $request) //dodaj popust kao kolonu
    {
        // (opciono) ako kasnije dodaš role
        // abort_unless($request->user()->is_admin, 403);

        $porudzbine = Porudzbina::with([
            'user',
            'stavke.slika'
        ])
        ->orderBy('poslato', 'asc')
        ->orderBy('datum', 'asc')
        ->get();

        $columns = [
            'ID porudzbine',
            'Datum',
            'Kupac',
            'Email',
            'Grad',
            'Adresa',
            'Telefon',
            'Ukupna cena',
            'Konacna cena',
            'Popust',
            'Tip popusta',
            'Poslato',
            'Stavke'
        ];

        $callback = function () use ($porudzbine, $columns) {

            $file = fopen('php://output', 'w');     //stream, kako ne bismo cuvali u memoriji fajl nego ga direktno slali u body od response
            //php://output JESTE: specijalni PHP stream, kanal ka HTTP response telu, direktna veza ka browseru

            // UTF-8 BOM (da Excel pravilno cita čćšđž)
            fprintf($file, chr(0xEF).chr(0xBB).chr(0xBF));

            // header
            fputcsv($file, $columns, ';');

            foreach ($porudzbine as $p) {

                // Stavke u jednom polju
                $stavke = $p->stavke->map(function ($stavka) {  //moze i arrow: $stavke = $p->stavke->map(fn ($stavka) => $stavka->slika->naziv . " ({$stavka->cena} RSD)")->join(', ');
                    return $stavka->slika->naziv . " ({$stavka->cena} RSD)"; // isto moze: $stavka->slika->naziv . ' (' . $stavka->cena . ' rsd)' //napomena: ovo $stavka->slika->naziv se ne moze interpolirati jer je lancano (ima 2+ strelice) i uslov je takolje da se koristi " a ne ' 
                })->join(', ');

                fputcsv($file, [
                    $p->id,
                    $p->datum ? $p->datum->format('Y-m-d') : null,
                    trim($p->ime . ' ' . $p->prezime),
                    optional($p->user)->email,
                    $p->grad,
                    $p->adresa,
                    $p->telefon,
                    $p->ukupna_cena,
                    $p->konacna_cena,
                    $p->procenat_popusta_ss,
                    $p->tip_popusta_ss ? $p->tip_popusta_ss : '/',
                    $p->poslato ? 'DA' : 'NE',
                    $stavke
                ], ';');
            }

            fclose($file);
        };

        $fileName = 'porudzbine_' . now()->format('Ymd_His') . '.csv';

        return response()->stream($callback, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="' . $fileName . '"',
        ]);
    }

}

