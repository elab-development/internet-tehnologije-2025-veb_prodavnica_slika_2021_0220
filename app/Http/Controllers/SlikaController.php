<?php

namespace App\Http\Controllers;

use App\Http\Resources\SlikaResource;
use App\Models\Slika;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

use App\Rules\PostojiPutanjaSlike;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpKernel\HttpCache\Store;

use OpenApi\Attributes as OA;

class SlikaController extends Controller
{
    #[OA\Get(
        path: '/api/slike',
        summary: 'Vraća sve slike',
        tags: ['Slike'],
        responses: [
            new OA\Response(response: 200, description: 'Lista slika')
        ]
    )]
    public function index() //Request $request
    {
        $slike=Slika::with(['galerija','tehnike'])->get();
        return response()->json(SlikaResource::collection($slike),200);
    }

    #[OA\Get(
        path: '/api/slike/latest',
        summary: 'Vraća 3 najnovije dostupne slike',
        tags: ['Slike'],
        responses: [
            new OA\Response(response: 200, description: 'Lista najnovijih slika')
        ]
    )]
    public function latest(){
        $slike=Slika::with(['galerija','tehnike'])
                            ->where('dostupna',true) //kad budes imao dovoljno slika u bazi otkomentarisaces ovo
                            ->orderBy('created_at','desc')
                            ->limit(3)
                            ->get();
        return response()->json(SlikaResource::collection($slike),200);

    }

    #[OA\Get(
        path: '/api/slike/filter',
        summary: 'Vraća paginirane i filtrirane slike',
        tags: ['Slike'],
        parameters: [
            new OA\Parameter(name: 'per_page', in: 'query', required: false, schema: new OA\Schema(type: 'integer', minimum: 1, maximum: 20)),
            new OA\Parameter(name: 'dostupna', in: 'query', required: false, schema: new OA\Schema(type: 'boolean')),
            new OA\Parameter(name: 'cena_min', in: 'query', required: false, schema: new OA\Schema(type: 'number', minimum: 0)),
            new OA\Parameter(name: 'cena_max', in: 'query', required: false, schema: new OA\Schema(type: 'number', minimum: 0)),
            new OA\Parameter(name: 'visina_cm_min', in: 'query', required: false, schema: new OA\Schema(type: 'integer', minimum: 0)),
            new OA\Parameter(name: 'visina_cm_max', in: 'query', required: false, schema: new OA\Schema(type: 'integer', minimum: 0)),
            new OA\Parameter(name: 'sirina_cm_min', in: 'query', required: false, schema: new OA\Schema(type: 'integer', minimum: 0)),
            new OA\Parameter(name: 'sirina_cm_max', in: 'query', required: false, schema: new OA\Schema(type: 'integer', minimum: 0)),
            new OA\Parameter(name: 'sort_cena', in: 'query', required: false, schema: new OA\Schema(type: 'string', enum: ['asc', 'desc'])),
            new OA\Parameter(name: 'sort_starost', in: 'query', required: false, schema: new OA\Schema(type: 'string', enum: ['asc', 'desc'])),
            new OA\Parameter(name: 'tehnike[]', in: 'query', required: false, schema: new OA\Schema(type: 'array', items: new OA\Items(type: 'integer')))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Paginirana lista slika'),
            new OA\Response(response: 422, description: 'Validaciona greška')
        ]
    )]
    public function allPicturesPaginatedFiltered(Request $request){

        $request->validate([           //isto kao $validator=Validator::make() + if($validator->fails())
            'per_page'   => 'sometimes|integer|min:1|max:20',
            'dostupna'   => 'sometimes|boolean',
            'cena_min'   => 'sometimes|numeric|min:0',
            'cena_max'   => 'sometimes|numeric|min:0',
            'visina_cm_min'  => 'sometimes|integer|min:0',
            'visina_cm_max'  => 'sometimes|integer|min:0',
            'sirina_cm_min'  => 'sometimes|integer|min:0',
            'sirina_cm_max'  => 'sometimes|integer|min:0',
            'sort_cena'  => 'sometimes|in:asc,desc',
            'sort_starost'=> 'sometimes|in:asc,desc',
            'tehnike'    => 'sometimes|array|min:1',
            'tehnike.*'  => 'integer|exists:tehnike,id',
        ]);
        
        $perPage=$request->get('per_page',12);

        $query=Slika::with(['tehnike']);
        
        // $ukupanBrojSlika=$query->count();
        
        if($request->filled('dostupna')){
            $query->where('dostupna',$request->get('dostupna')); //isto kao $query=$query->where...
        }

        if($request->filled('cena_min')){
            $query->where('cena','>=',$request->get('cena_min'));
        }
        if($request->filled('cena_max')){
            $query->where('cena','<=',$request->get('cena_max'));
        }

        if($request->filled('visina_cm_min')){
            $query->where('visina_cm','>=',$request->get('visina_cm_min'));
        }
        if($request->filled('visina_cm_max')){
            $query->where('visina_cm','<=',$request->get('visina_cm_max'));
        }

        if($request->filled('sirina_cm_min')){
            $query->where('sirina_cm','>=',$request->get('sirina_cm_min'));
        }
        if($request->filled('sirina_cm_max')){
            $query->where('sirina_cm','<=',$request->get('sirina_cm_max'));
        }


        if ($request->filled('tehnike')) {         //*ispod ove metode je ekvivalentan sql upit
           
            $tehnike = $request->get('tehnike');

            $query->whereHas('tehnike', function ($q) use ($tehnike) { //tehnike je naziv relacije //spoljni query (ulazimo u pivot tabelu i u njoj proveravamo)
                $q->whereIn('tehnike.id', $tehnike);                   //tehnike je naziv tabele //unutrasnji query - slike kojima bar jedna tehnika ima id kao jedna od prosledjenih tehnika za filtriranje
            });

            // foreach ($tehnike as $tehnikaId) {                                //ovo je logika ako zelimo da slika mora da ima sve prosledjene tehnike
            //     $query->whereHas('tehnike', function ($q) use ($tehnikaId) {
            //         $q->where('tehnike.id', $tehnikaId);
            //     });
            // }
        }


        if ($request->filled('sort_cena') &&
            in_array($request->get('sort_cena'), ['asc', 'desc'])) {

                $query->orderBy('cena', $request->get('sort_cena'));
        }

        if($request->filled('sort_starost') && 
            in_array($request->get('sort_starost'),['asc','desc'])){

                $query->orderBy('created_at',$request->get('sort_starost'));
        }

        $paginator=$query->paginate($perPage);
        
        // $ukupanBrojStrana=$ukupanBrojSlika/$perPage;
        //ceil kao round (samo zaokruzuje na najveci integer)

        // return SlikaResource::collection($paginator);
        return response()->json([
            'slike' => SlikaResource::collection($paginator),
            'ukupanBrojStrana'=> $paginator->lastPage() 
            ] ,200);
    }

    /*
        SELECT DISTINCT slike.*
        FROM slike
        AND EXISTS (
        SELECT 1
        FROM tehnike
        INNER JOIN slika_tehnika
            ON tehnike.id = slika_tehnika.tehnika_id
            WHERE slika_tehnika.slika_id = slike.id
            AND tehnike.id IN (1, 3))

            ili 

        SELECT DISTINCT slike.*
        FROM slike
        JOIN slika_tehnika ON slike.id = slika_tehnika.slika_id
        WHERE slika_tehnika.tehnika_id IN (1,3);
    */

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    // #[OA\Post(
    //     path: '/api/slike',
    //     summary: 'Kreira novu sliku',
    //     tags: ['Slike'],
    //     security: [['sanctum' => []]],
    //     requestBody: new OA\RequestBody(
    //         required: true,
    //         content: new OA\MediaType(
    //             mediaType: 'multipart/form-data',
    //             schema: new OA\Schema(
    //                 required: ['galerija_id', 'cena', 'naziv', 'visina_cm', 'sirina_cm', 'dostupna', 'tehnike'],
    //                 properties: [
    //                     new OA\Property(property: 'galerija_id', type: 'integer', example: 1),
    //                     new OA\Property(property: 'putanja_fotografije', type: 'string', format: 'binary'),
    //                     new OA\Property(property: 'cena', type: 'number', example: 150.00),
    //                     new OA\Property(property: 'naziv', type: 'string', example: 'Jutarnji pejzaž'),
    //                     new OA\Property(property: 'visina_cm', type: 'number', example: 60),
    //                     new OA\Property(property: 'sirina_cm', type: 'number', example: 80),
    //                     new OA\Property(property: 'dostupna', type: 'boolean', example: true),
    //                     new OA\Property(property: 'tehnike', type: 'array', items: new OA\Items(type: 'integer'), example: [1, 2])
    //                 ],
    //                 type: 'object'
    //             )
    //         )
    //     ),
    //     responses: [
    //         new OA\Response(response: 201, description: 'Slika kreirana'),
    //         new OA\Response(response: 401, description: 'Neautorizovan'),
    //         new OA\Response(response: 403, description: 'Zabranjen pristup'),
    //         new OA\Response(response: 422, description: 'Validaciona greška')
    //     ]
    // )]
    public function store(Request $request)
    {
        $validator=Validator::make($request->all(),[
            'galerija_id'=>['required','integer','exists:galerija,id'], //nullable?
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
            $path=$request->file('putanja_fotografije')->store('fotografije','public');
            $data['putanja_fotografije']=$path;
        }

        $tehnike=$data['tehnike'];

        unset($data['tehnike']); //brise tehnike(kljuc asoc niza) iz $data jer nemamo tu kolonu u tabeli slike

        $slika=Slika::create($data);

        $slika->tehnike()->sync($tehnike);  //pomocu relacije tehnike pristupa pivot tabeli, preko sync (detach+attach) fje azurira tehnike vezane za ovu sliku(posto se kreira slika onda samo dodaje prosledjene tehnike iz request-a)

        $slika->load(['galerija','tehnike']); //preko fje/relacije tehnike() ucitava iz pivot tabele iz baze tehnike koje su vezane za ovu sliku

        return response()->json(new SlikaResource($slika),201);
    }

    #[OA\Get(
        path: '/api/slike/{id}',
        summary: 'Vraća jednu sliku',
        tags: ['Slike'],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Slika'),
            new OA\Response(response: 404, description: 'Slika nije pronađena')
        ]
    )]
    public function show($id)
    {
        $slika=Slika::with(['galerija','tehnike'])->findOrFail($id);
        return response()->json(new SlikaResource($slika),200);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Slika $slika)
    {
        //
    }

    #[OA\Post(
        path: '/api/slike/{id}',
        summary: 'Ažurira sliku (koristi POST + _method=PUT zbog multipart/form-data)',
        tags: ['Slike'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        requestBody: new OA\RequestBody(
            content: new OA\MediaType(
                mediaType: 'multipart/form-data',
                schema: new OA\Schema(
                    properties: [
                        new OA\Property(property: '_method', type: 'string', example: 'PUT'),
                        new OA\Property(property: 'galerija_id', type: 'integer', example: 1),
                        new OA\Property(property: 'putanja_fotografije', type: 'string', format: 'binary'),
                        new OA\Property(property: 'cena', type: 'number', example: 200.00),
                        new OA\Property(property: 'naziv', type: 'string', example: 'Jutarnji pejzaž'),
                        new OA\Property(property: 'visina_cm', type: 'number', example: 60),
                        new OA\Property(property: 'sirina_cm', type: 'number', example: 80),
                        new OA\Property(property: 'dostupna', type: 'boolean', example: true),
                        new OA\Property(property: 'tehnike', type: 'array', items: new OA\Items(type: 'integer'), example: [1, 3])
                    ],
                    type: 'object'
                )
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Slika ažurirana'),
            new OA\Response(response: 400, description: 'Nema podataka za izmenu'),
            new OA\Response(response: 401, description: 'Neautorizovan'),
            new OA\Response(response: 403, description: 'Zabranjen pristup'),
            new OA\Response(response: 422, description: 'Validaciona greška')
        ]
    )]
    public function update(Request $request, $id)
    {
        $slika=Slika::findOrFail($id);
        $validator=Validator::make($request->all(),[
            'galerija_id'=>['sometimes','integer','exists:galerija,id'],
            'putanja_fotografije'=>['nullable','image','mimes:jpg,png,jpeg','max:2048'],
            'cena'=>['sometimes','numeric','min:0'],
            'naziv'=>['sometimes','string','max:50'],
            'visina_cm'=>['sometimes','numeric','min:0'],
            'sirina_cm'=>['sometimes','numeric','min:0'],
            'dostupna'=>['sometimes','boolean'],

            'tehnike'=>['sometimes','array','min:1'],
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

            // if($slika->putanja_fotografije){                                    //ovo je ako zelimo da se fotografija obrise prilikom brisanja slike
            //     Storage::disk('public')->delete($slika->putanja_fotografije);
            // }

            $path=$request->file('putanja_fotografije')->store('fotografije','public');  //php artisan storage:link! trenutna implementacija omogucava da se preko http zahteva doda fotografija u storage ali da bi ona bila dostupna frontendu mora se pokrenuti php artisan storage:link
            $data['putanja_fotografije']=$path;
        }
        
        if(empty($data) && !$request->hasFile('putanja_fotografije')){
            return response()->json([
                'message' => 'Nema podataka za izmenu.'
            ], 400);
        }

        if(isset($data['tehnike'])){   //proverava da li postoji kljuc tehnike
            
            $tehnike=$data['tehnike'];
            unset($data['tehnike']);
            $slika->tehnike()->sync($tehnike);
        }
        
        $slika->update($data);

        // $slika->load('tehnike');
        $slika->load(['galerija','tehnike']);
        return response()->json(new SlikaResource($slika),200);
    
    }

    #[OA\Delete(
        path: '/api/slike/{id}',
        summary: 'Briše sliku',
        tags: ['Slike'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Slika obrisana'),
            new OA\Response(response: 401, description: 'Neautorizovan'),
            new OA\Response(response: 403, description: 'Zabranjen pristup'),
            new OA\Response(response: 404, description: 'Slika nije pronađena')
        ]
    )]
    public function destroy($id)
    {
        $slika=Slika::findOrFail($id);

        // if($slika->putanja_fotografije){      //ovo je ako zelimo da se fotografija obrise prilikom brisanja slike
        //     Storage::disk('public')->delete($slika->putanja_fotografije);
        // }

        $slika->tehnike()->detach(); //brise iz pivota veze sa ovom slikom i bez cascade
        $slika->delete();

        return response()->json(['message'=>'Slika je obrisana'],200);
    }
}
