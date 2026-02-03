<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Galerija>
 */
class GalerijaFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'naziv'=>'Galerija savremene umetnosti',
            'adresa'=>'Kej Kola srpskih sestara Niš',
            'longitude'=>21.895278,
            'latitude'=>43.321972
        ];
    }
}
