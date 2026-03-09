<?php

namespace App\Http\Controllers;

use OpenApi\Attributes as OA;

#[OA\Info(
    version:"1.0.0",
    title: "Online image shop API",
    description: "API za upravljanje porudžbinama, slikama, tehnikama slikanja, popustima i korisnicima kroz autentifikaciju i autorizaciju"
)]
abstract class Controller
{
    //dodaj apstraktne metode (index,show, store,update,destroy)?
}
