<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PopustResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'=>$this->id,
            'aktivan'=>(boolean)$this->aktivan,
            'tip'=>$this->tip,
            'procenat'=>(int)$this->procenat,
            // 'traje_tokom'=>"{$this->danOd}.{$this->mesecOd}. - {$this->danDo}.{$this->mesecDo}."
            'danOd'=>(int)$this->danOd,
            'mesecOd'=>(int)$this->mesecOd,
            'danDo'=>(int)$this->danDo,
            'mesecDo'=>(int)$this->mesecDo
        ];
    }   
}
