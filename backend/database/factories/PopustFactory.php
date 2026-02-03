<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Popust>
 */
class PopustFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'aktivan'=>$this->faker->boolean(90),
            'tip'=>$this->faker->randomElement(['crni_petak','nova_godina','uskrs','8_mart','dan_zaljubljenih']),
            'procenat'=>$this->faker->numberBetween(5,50),
            'danOd'=>$this->faker->numberBetween(1,31),
            'mesecOd'=>$this->faker->numberBetween(1,12),
            'danDo'=>$this->faker->numberBetween(1,31),
            'mesecDo'=>$this->faker->numberBetween(1,12),
        ];
    }
}
