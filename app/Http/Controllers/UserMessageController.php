<?php

namespace App\Http\Controllers;

use App\Mail\KorisnickaPoruka;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

use OpenApi\Attributes as OA;

class UserMessageController extends Controller
{
    #[OA\Post(
        path: '/api/poruka-korisnika',
        summary: 'Korisnik šalje poruku privilegovanim korisnicima putem mejla',
        tags: ['User message'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\MediaType(
                mediaType: 'application/json',
                schema: new OA\Schema(
                    required: ['ime','email','poruka'],
                    properties: [
                        new OA\Property(property: 'ime', type: 'string', example: 'Marko'),
                        new OA\Property(property: 'email', type: 'string', example: 'marko@gmail.com'),
                        new OA\Property(property: 'poruka', type: 'string', example: 'Da li mogu da vidim sliku uživo?'),
                    ],
                    type: 'object'
                )
            )
        ),
        responses: [
            new OA\Response(response: 200,description: 'Poruka uspešno poslata'),
            new OA\Response(response: 422,description: 'Validaciona greška')
        ]
    )]
    // ['']  \  @
    public function proslediPoruku(Request $request){

        $validator=Validator::make($request->all(),[
            'ime'=>'required|string|max:255',
            'email'=>'required|email|string|max:255',
            'poruka'=>'required|string|1000',
            'slike'=>'sometimes|array',
            'slike.*'=>['image','mimes:jpg,png,jpeg','max:2048']
        ]);

        if($validator->fails()){
            return response()->json([
                'message'=>'Validacija nije prosla',
                'errors'=>$validator->errors()
            ],422);
        }

        $data=$validator->validated();

        $privilegedUsers=User::whereIn('uloga',['slikar','admin'])->get();

        foreach($privilegedUsers as $index=>$pu){

            if($index > 0) sleep(10);

            Mail::to($pu->email)
            ->send(
            new KorisnickaPoruka($pu,$data)
            );
        }

        // $slikar=User::where('uloga','slikar')->first();

        // Mail::to($slikar->email)
        // ->send(new KorisnickaPoruka($slikar,$data));

        return response()->json(['message' => 'Poruka uspešno poslata.'], 200);
    }
}
