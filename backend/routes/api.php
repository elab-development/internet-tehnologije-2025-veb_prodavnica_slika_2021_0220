<?php

use App\Http\Controllers\Authentication\EmailVerificationController;
use App\Http\Controllers\Authentication\ForgotPasswordController;
use App\Http\Controllers\Authentication\LoginController;
use App\Http\Controllers\Authentication\LogoutController;
use App\Http\Controllers\Authentication\RegisterController;
use App\Http\Controllers\GalerijaController;
use App\Http\Controllers\PopustController;
use App\Http\Controllers\PorudzbinaController;
use App\Http\Controllers\SlikaController;
use App\Http\Controllers\TehnikaController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;



Route::post('/password/forgot', [ForgotPasswordController::class, 'sendResetLink']);


Route::get('/password/reset', [ForgotPasswordController::class, 'showResetForm'])
    ->name('password.reset.form');

Route::post('/password/reset', [ForgotPasswordController::class, 'resetPassword'])
    ->name('password.reset.submit');






// Route::post('/register', [RegisterController::class, 'register']);

Route::post('/register', [RegisterController::class, 'register']);

Route::get('/verify/email/{id}',[EmailVerificationController::class,'verify'])
->name('verification.verify');

Route::post('/login', [LoginController::class, 'login']);


Route::middleware(['auth:sanctum','role:kupac'])->group(function(){

    Route::post('/logout',[LogoutController::class,'logout']);

    Route::get('/porudzbine/moje',[PorudzbinaController::class,'moje']);

    Route::post('/porudzbine-clan',[PorudzbinaController::class,'storeUlogovani']);

});

Route::get('/email/verify/{id}', [EmailVerificationController::class, 'verify'])
    ->name('verification.verify');

// dodaj za dodavanje, izmenu i brisanje prodavca


// Route::get('/user', function (Request $request) {
//     return $request->user();
// })->middleware('auth:sanctum');

Route::resource('/galerija',GalerijaController::class);


//dodavanje,izmena i brisanja admin
Route::get('/tehnike',[TehnikaController::class,'index']);
Route::get('/tehnike/{id}',[TehnikaController::class,'show']);
// Route::post('/tehnike',[TehnikaController::class,'store']);
// Route::delete('/tehnike/{id}',[TehnikaController::class,'destroy']);
// Route::put('/tehnike/{id}',[TehnikaController::class,'update']);


//dodavanje,izmena i brisanja admin
Route::get('/slike',[SlikaController::class,'index']);
Route::get('/slike/{id}',[SlikaController::class,'show']);
// Route::post('/slike',[SlikaController::class,'store']);
// Route::delete('/slike/{id}',[SlikaController::class,'destroy']);
// Route::put('/slike/{id}',[SlikaController::class,'update']);
Route::get('/slike-pag',[SlikaController::class,'allPicturesPaginatedFiltered']); //ako dodas ->whereNumber('id'); mozes staviti i /slike/pag i ne mora ici ispred ove linije (ne dolazi do {id}=pag...)
// Route::post('/slike/{id}',[SlikaController::class,'update']); // + _method = PUT kao param 
//^ovde smo stavili POST i simuliramo put tako sto prosledimo _method = PUT kao parametar u form-data
//to je neophodno jer PUT ne prepoznaje podatke iz form-data nego samo raw
//koristimo form-data kao bismo omogucili pravilno izvrsenje upload-a fotografije
Route::get('/slike-najnovije',[SlikaController::class,'latest']);


//kreiranje kupac, gost; gledanje svojih kupac; gledanje svih, izmena i brisanje admin;
// Route::get('/porudzbine',[PorudzbinaController::class,'index']);
// Route::get('/porudzbine/{id}',[PorudzbinaController::class,'show']); //ako dodas ->whereNumber('id'); mozes staviti i /porudzbine/pag i ne mora ici ispred ove linije (ne dolazi do {id}=pag...)
Route::post('/porudzbine',[PorudzbinaController::class,'storeGost']);
// Route::delete('/porudzbine/{id}',[PorudzbinaController::class,'destroy']);
// Route::put('/porudzbine/{id}',[PorudzbinaController::class,'update']);
// Route::get('/porudzbine/kupac/{userId}',[PorudzbinaController::class,'vratiSvePorudzbineKupca']);//ovo brises?
// Route::get('/porudzbine-pag',[PorudzbinaController::class,'allOrdersPaginated']);
// Route::get('/porudzbine/export/csv',[PorudzbinaController::class,'exportCsv']);    //prebaci u middleware




// Route::get('/popusti',[PopustController::class,'index']);
// Route::get('/popusti/{id}',[PopustController::class,'show']);
// Route::post('/popusti',[PopustController::class,'store']);
// Route::delete('/popusti/{id}',[PopustController::class,'destroy']);
// Route::put('/popusti/{id}',[PopustController::class,'update']);




Route::middleware(['auth:sanctum','role:admin,slikar'])->group(function(){
    // slike
    Route::post('/slike', [SlikaController::class, 'store']);
    Route::post('/slike/{id}', [SlikaController::class, 'update']);
    Route::delete('/slike/{id}', [SlikaController::class, 'destroy']);

    // tehnike
    Route::post('/tehnike', [TehnikaController::class, 'store']);
    Route::put('/tehnike/{id}', [TehnikaController::class, 'update']);
    Route::delete('/tehnike/{id}', [TehnikaController::class, 'destroy']);

    // porudžbine – administracija
    Route::get('/porudzbine', [PorudzbinaController::class, 'index']);
    Route::get('/porudzbine/{id}', [PorudzbinaController::class, 'show']);
    Route::put('/porudzbine/{id}', [PorudzbinaController::class, 'update']);
    Route::delete('/porudzbine/{id}', [PorudzbinaController::class, 'destroy']);
    Route::get('/porudzbine-pag', [PorudzbinaController::class, 'allOrdersPaginated']);
    Route::get('/porudzbine/export/csv', [PorudzbinaController::class, 'exportCsv']);

    // popusti
    Route::get('/popusti',[PopustController::class,'index']);
    Route::get('/popusti/{id}',[PopustController::class,'show']);
    Route::post('/popusti',[PopustController::class,'store']);
    Route::delete('/popusti/{id}',[PopustController::class,'destroy']);
    Route::put('/popusti/{id}',[PopustController::class,'update']);
    // Route::get('/popusti-aktivni',[PopustController::class,'aktivniPopusti']);

});
Route::get('/popusti-aktivni',[PopustController::class,'aktivniPopusti']);