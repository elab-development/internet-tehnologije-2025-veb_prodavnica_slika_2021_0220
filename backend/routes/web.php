<?php

use App\Http\Controllers\Authentication\ForgotPasswordController;
use Illuminate\Support\Facades\Route;

// Route::get('/', function () {
//     return view('welcome');
// });


Route::get('/password/reset/{token}', [ForgotPasswordController::class, 'showResetForm'])
    ->name('password.reset');

Route::post('/password/reset', [ForgotPasswordController::class, 'resetPassword'])
    ->name('password.update');
