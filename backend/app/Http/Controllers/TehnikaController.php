<?php

namespace App\Http\Controllers;

use App\Http\Resources\TehnikaResource;
use App\Models\Tehnika;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

use OpenApi\Attributes as OA;

class TehnikaController extends Controller
{
    #[OA\Get(
        path: '/api/tehnike',
        summary: 'Vraća sve tehnike',
        tags: ['Tehnike'],
        responses: [
            new OA\Response(response: 200, description: 'Lista tehnika')
        ]
    )]
    public function index()
    {
        return response()->json(TehnikaResource::collection(Tehnika::all()),200);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    #[OA\Post(
        path: '/api/tehnike',
        summary: 'Kreira novu tehniku',
        tags: ['Tehnike'],
        security: [['sanctum' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\MediaType(
                mediaType: 'application/json',
                schema: new OA\Schema(
                    required: ['naziv'],
                    properties: [
                        new OA\Property(property: 'naziv', type: 'string', example: 'Akvarel')
                    ],
                    type: 'object'
                )
            )
        ),
        responses: [
            new OA\Response(response: 201, description: 'Tehnika kreirana'),
            new OA\Response(response: 401, description: 'Neautorizovan'),
            new OA\Response(response: 403, description: 'Zabranjen pristup'),
            new OA\Response(response: 422, description: 'Validaciona greška')
        ]
    )]
    public function store(Request $request)
    {
        $validator=Validator::make($request->all(),[
            'naziv'=>['required','string','max:50']
        ]);
        if($validator->fails()){
            return response()->json([
                'message'=>'Validacija nije prosla.',
                'errors'=>$validator->errors()
            ],422);
        }
        $data=$validator->validated();
        $tehnika=Tehnika::create($data);
        return response()->json(new TehnikaResource($tehnika),201);
    }

    #[OA\Get(
        path: '/api/tehnike/{id}',
        summary: 'Vraća jednu tehniku',
        tags: ['Tehnike'],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Tehnika'),
            new OA\Response(response: 404, description: 'Tehnika nije pronađena')
        ]
    )]
    public function show($id)
    {
        return response()->json(new TehnikaResource(Tehnika::findOrFail($id)),200);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Tehnika $tehnika)
    {
        //
    }

    #[OA\Put(
        path: '/api/tehnike/{id}',
        summary: 'Ažurira tehniku',
        tags: ['Tehnike'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        requestBody: new OA\RequestBody(
            content: new OA\MediaType(
                mediaType: 'application/json',
                schema: new OA\Schema(
                    properties: [
                        new OA\Property(property: 'naziv', type: 'string', example: 'Akvarel')
                    ],
                    type: 'object'
                )
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Tehnika ažurirana'),
            new OA\Response(response: 400, description: 'Nema podataka za izmenu'),
            new OA\Response(response: 401, description: 'Neautorizovan'),
            new OA\Response(response: 403, description: 'Zabranjen pristup'),
            new OA\Response(response: 422, description: 'Validaciona greška')
        ]
    )]
    public function update(Request $request, $id)
    {
        $tehnika=Tehnika::findOrFail($id);

        $validator=Validator::make($request->all(),[
            'naziv'=>['sometimes','string','max:50']
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
        $tehnika->update($data);
        return response()->json(new TehnikaResource($tehnika),200);
    }

    #[OA\Delete(
        path: '/api/tehnike/{id}',
        summary: 'Briše tehniku',
        tags: ['Tehnike'],
        security: [['sanctum' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer'))
        ],
        responses: [
            new OA\Response(response: 200, description: 'Tehnika obrisana'),
            new OA\Response(response: 401, description: 'Neautorizovan'),
            new OA\Response(response: 403, description: 'Zabranjen pristup'),
            new OA\Response(response: 422, description: 'Tehnika se koristi na slikama')
        ]
    )]
    public function destroy($id)
    {
        $tehnika=Tehnika::findOrFail($id);
        
        $slikeSamoSaOvomTehnikom=$tehnika->slike()
        ->withCount(['tehnike as brojTehnika'])       //dodaje kljuc brojTehnika u asoc niz koji pravimo cija je vrednost broj tehnika za svaku sliku
        ->get()                                        //pretvaranje rezultata u kolekciju kao $tehnika->slike sa jos brojTehnika
        ->filter(fn($slika)=>$slika->brojTehnika===1); // ostaje samo slike sa 1 tehnikom (ovom), kombinacija arrow i closure(anonimne) fje

        if(!$slikeSamoSaOvomTehnikom->isEmpty()){
            $ids=$slikeSamoSaOvomTehnikom->pluck('id')->join(', ');
            return response()->json([
                'message'=>"Brisanje tehnike nije moguce, slike sa id: {$ids} imaju samo ovu tehniku."
            ],422);
        }

        $tehnika->slike()->detach();
        $tehnika->delete();

        return response()->json(['message'=>'Tehnika je obrisana'],200);
    }
}
