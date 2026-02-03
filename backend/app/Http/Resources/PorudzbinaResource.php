<?php

namespace App\Http\Resources;

use App\Models\Popust;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PorudzbinaResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */

    public static $wrap = 'porudzbina'; // pogasi response()->json() iz controller-a ako hoces da imas nazive response-a u postman-u
    public function toArray(Request $request): array
    {
        return [
            'id'=>$this->id,
            'user_id'=>$this->user_id,
            'user'=>$this->whenLoaded('user'),
            'popust_id'=>$this->popust_id,
            'procenat_popusta_ss'=>(int)$this->procenat_popusta_ss,	
            'tip_popusta_ss'=>$this->tip_popusta_ss,
            'popust'=>new PopustResource($this->whenLoaded('popust')),
            'datum'=>$this->datum->format('Y-m-d'),
            'ukupna_cena'=>(float)$this->ukupna_cena,
            'konacna_cena'=>(float)$this->konacna_cena,
            'ime'=>$this->ime,
            'prezime'=>$this->prezime,
            'drzava'=>$this->drzava,
            'grad'=>$this->grad,
            'adresa'=>$this->adresa,
            'postanski_broj'=>$this->postanski_broj,
            'telefon'=>$this->telefon,
            'poslato'=>(boolean)$this->poslato,
            'stavke'=>StavkaResource::collection($this->whenLoaded('stavke'))
        ];
    }
}
