<?php

namespace App\Http\Controllers;

use App\Http\Resources\PopustResource;
use App\Models\Popust;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Validator;
use PhpParser\Node\Stmt\TryCatch;

use OpenApi\Attributes as OA;

class PopustController extends Controller
{
    #[OA\Get(
        path: '/api/popusti',
        summary: 'Vraća sve popuste',
        tags: ['Popusti'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Lista svih popusta'),
            new OA\Response(response: 401, description: 'Neautorizovan')
        ]
    )]
    public function index()
    {
        return response()->json(PopustResource::collection(Popust::all()),200);
    }

    #[OA\Get(
        path: '/api/popusti-aktivni',
        summary: 'Vraća sve aktivne popuste',
        tags: ['Popusti'],
        security: [['sanctum' => []]],
        responses: [
            new OA\Response(response: 200, description: 'Lista aktivnih popusta'),
            new OA\Response(response: 401, description: 'Neautorizovan')
        ]
    )]
    public function aktivniPopusti()
    {
        return response()->json(PopustResource::collection(Popust::where('aktivan',true)->get()),200);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    #[OA\Post(
        path: '/api/popusti',
        summary: 'Kreiranje novog popusta',
        description: 'Kreira popust sa definisanim periodom važenja (dan/mesec od–do). Period ne sme biti duži od 31 dan. Podržani su popusti koji prelaze godišnju granicu (npr. 25.12 – 05.01).',
        tags: ['Popusti'],
        security: [['sanctum' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\MediaType(
                mediaType: 'application/json',
                schema: new OA\Schema(
                    required: ['aktivan', 'tip', 'procenat', 'danOd', 'mesecOd', 'danDo', 'mesecDo'],
                    properties: [
                        new OA\Property(property: 'aktivan', type: 'boolean', example: true),
                        new OA\Property(property: 'tip', type: 'string', maxLength: 50, example: 'praznik'),
                        new OA\Property(property: 'procenat', type: 'integer', minimum: 1, maximum: 100, example: 15),
                        new OA\Property(property: 'danOd', type: 'integer', minimum: 1, maximum: 31, example: 24),
                        new OA\Property(property: 'mesecOd', type: 'integer', minimum: 1, maximum: 12, example: 12),
                        new OA\Property(property: 'danDo', type: 'integer', minimum: 1, maximum: 31, example: 1),
                        new OA\Property(property: 'mesecDo', type: 'integer', minimum: 1, maximum: 12, example: 1),
                    ]
                )
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Popust kreiran'),
            new OA\Response(response: 401, description: 'Neautorizovan'),
            new OA\Response(response: 422, description: 'Validaciona greška (npr. period duži od 31 dan ili neispravan datum)')
        ]
    )]
    public function store(Request $request)
    {
        $validator=Validator::make($request->all(),[
            'aktivan'=>['required','boolean'],
            'tip'=>['required','string','max:50'],
            'procenat'=>['required','integer','between:1,100'],
            'danOd'=>['required','integer','between:1,31'],
            'mesecOd'=>['required','integer','between:1,12'],
            'danDo'=>['required','integer','between:1,31'],
            'mesecDo'=>['required','integer','between:1,12']
        ]);

        //$valid-Parametar funkcije je ono što TI NE ZNAŠ dok funkcija ne bude POZVANA. I/ili je menjas u closure
        //$request-Nakon use je ono što VEĆ ZNAŠ u trenutku kada funkciju DEFINIŠEŠ. I samo je citas u closure
        //PRVO I NAJVAŽNIJE PRAVILO (nadjačava sva ostala):
        //Ako API METODE eksplicitno definiše parametre callback-a onda mora imati paramtar koji definise to se ondosi na ono ->map(function(stavka){})
        //posto se $validator javio kao promenljiva vec mogao bi ici u u drugu zagradu vrv: $validator->after(function () use ($valid, $request) 
        $validator->after(function ($valid) use ($request){
            
            try {
                $datumOd=Carbon::createFromDate(2001,$request->mesecOd,$request->danOd);
                $datumDo=Carbon::createFromDate(2001,$request->mesecDo,$request->danDo);
                
                if($datumDo->lt($datumOd)){  //lt=less than
                    $datumDo->addYear(); //ne mora $datumOd=$datumOd->addYear();
                }

                $brojDana=$datumOd->diffInDays($datumDo)+1; //diffInDays = apsolutna vrednost razlike, dodajemo 1 dan jer popust treba da traje i tokom prosledjenih granicnih datuma 
            
                if($brojDana>31){
                    $valid->errors()->add(
                        'period',  //key
                        'Popust ne može trajati duže od 31 dan.' //message
                    );
                }

            } catch (\Exception $e) {
                $valid->errors()->add(
                    'period',
                    'Neispravan datum.'
                );
            }

        });

        if($validator->fails()){
            return response()->json([
                'message'=>'Validacija nije prosla.',
                'errors'=>$validator->errors()
            ],422);
        }

        $data=$validator->validated();

        $popust=Popust::create($data);

        return response()->json(new PopustResource($popust),201);

    }

    #[OA\Get(
        path: '/api/popusti/{id}',
        summary: 'Vraća jedan popust po ID-u',
        tags: ['Popusti'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Popust'),
            new OA\Response(response: 401, description: 'Neautorizovan'),
            new OA\Response(response: 404, description: 'Popust nije pronađen')
        ]
    )]
    public function show($id)
    {
        $popust=Popust::findOrFail($id);
        return response()->json(new PopustResource($popust),200);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Popust $popust)
    {
        //
    }

    #[OA\Put(
        path: '/api/popusti/{id}',
        summary: 'Izmena popusta',
        description: 'Sva polja su opciona. Ako se menja period (danOd/mesecOd/danDo/mesecDo), moraju se proslediti sva četiri datumska polja. Period ne sme biti duži od 31 dan.',
        tags: ['Popusti'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        requestBody: new OA\RequestBody(
            required: false,
            content: new OA\MediaType(
                mediaType: 'application/json',
                schema: new OA\Schema(
                    properties: [
                        new OA\Property(property: 'aktivan', type: 'boolean', example: false),
                        new OA\Property(property: 'tip', type: 'string', maxLength: 50, example: 'praznik'),
                        new OA\Property(property: 'procenat', type: 'integer', minimum: 1, maximum: 100, example: 20),
                        new OA\Property(property: 'danOd', type: 'integer', minimum: 1, maximum: 31, example: 24),
                        new OA\Property(property: 'mesecOd', type: 'integer', minimum: 1, maximum: 12, example: 12),
                        new OA\Property(property: 'danDo', type: 'integer', minimum: 1, maximum: 31, example: 31),
                        new OA\Property(property: 'mesecDo', type: 'integer', minimum: 1, maximum: 12, example: 12),
                    ]
                )
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Popust izmenjen'),
            new OA\Response(response: 401, description: 'Neautorizovan'),
            new OA\Response(response: 404, description: 'Popust nije pronađen'),
            new OA\Response(response: 422, description: 'Validaciona greška (npr. nepotpuni datumski podaci ili period duži od 31 dan)')
        ]
    )]
    public function update(Request $request, $id)
    {
        $popust=Popust::findOrFail($id);

        $validator=$validator=Validator::make($request->all(),[
            'aktivan'=>['sometimes','boolean'],
            'tip'=>['sometimes','string','max:50'],
            'procenat'=>['sometimes','integer','between:1,100'],
            
            'danOd'   => ['sometimes', 'integer', 'between:1,31'],
            'mesecOd' => ['sometimes', 'integer', 'between:1,12'],
            'danDo'   => ['sometimes', 'integer', 'between:1,31'],
            'mesecDo' => ['sometimes', 'integer', 'between:1,12']
        ]);
        
        $validator->after(function ($valid) use ($request){

            $podaci=['danOd' ,'mesecOd' ,'danDo' ,'mesecDo'];

            $unetiPodaci=collect($podaci)->filter(fn($p)=>$request->has($p));

            if($unetiPodaci->count()===0){
                return;
            }

            if($unetiPodaci->count()!==4){

                $valid->errors()->add(
                    'period',
                    'Da bi se trajanje popusta izmenilo neophodno je navesti sve podatke vezane za datume: danOd, mesecOd, danDo i mesecDo.'
                );
                return;
            }
            else{

                try {
            
                $datumOd=Carbon::createFromDate(2001,$request->mesecOd,$request->danOd);
                $datumDo=Carbon::createFromDate(2001,$request->mesecDo,$request->danDo);

                if($datumDo->lessThan($datumOd)){
                    $datumDo->addYear();
                }

                $brojDana=$datumDo->diffInDays($datumOd)+1;

                if($brojDana>31){

                    $valid->errors()->add(
                        'period',
                        'Popust moze trajati najvise 31 dan.'
                    );
                }
            } catch (\Exception $e) {

                    $valid->errors()->add(
                        'period',
                        'Neispravan datum.'
                    );
            }
            }
            
           
        });

        if($validator->fails()){
            return response()->json([
                'message'=>'Validacija nije prosla.',
                'errors'=>$validator->errors()
            ],422);
        }

        $data=$validator->validated();

        $popust->update($data);

        return response()->json(new PopustResource($popust),200);
    }

    #[OA\Delete(
        path: '/api/popusti/{id}',
        summary: 'Brisanje popusta',
        tags: ['Popusti'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Popust obrisan'),
            new OA\Response(response: 401, description: 'Neautorizovan'),
            new OA\Response(response: 404, description: 'Popust nije pronađen')
        ]
    )]
    public function destroy($id)
    {
        $popust=Popust::findOrFail($id);

        $popust->delete();

        return response()->json(['message'=>'Popust je obrisan'],200);
    }
}
