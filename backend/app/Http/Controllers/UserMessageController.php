<?php

namespace App\Http\Controllers;

use App\Mail\KorisnickaPoruka;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class UserMessageController extends Controller
{
    public function proslediPoruku(Request $request){

        $validator=Validator::make($request->all(),[
            'ime'=>'required|string|max:255',
            'email'=>'required|email|string|max:255',
            'poruka'=>'required|string',
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
