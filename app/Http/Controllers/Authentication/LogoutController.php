<?php

namespace App\Http\Controllers\Authentication;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LogoutController extends Controller
{
    public function logout(Request $request){

        //$user=$request->user(); //isto kao Auth::user()

        $user=$request->user();
        $user->tokens()->delete();

        return response()->json([
            'message'=>'Uspesno ste odjavljeni'
        ],200);
    }
}
