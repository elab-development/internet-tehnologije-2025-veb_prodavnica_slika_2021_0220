<?php

use App\Models\Porudzbina;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

uses(RefreshDatabase::class);        //radi migrate:fresh koji pred svaki test dropuje sve tabele pa izvrsava sve migracije, u okviru sqlite baze za testiranje koja je definisana u phpunit.xml fajlu (kao sto je mysql u .env)

beforeEach(function () {
    Carbon::setTestNow(Carbon::create(2026, 2, 15));
});

afterEach(function () {
    Carbon::setTestNow(); // vraća normalno ponašanje
});

// sprečava stvarne datume
    //Carbon::setTestNow(Carbon::create(2026, 2, 15)); //Carbon::setTestNow kaže Carbonu "pretvaraj se da je uvek ovo trenutni datum dok testovi traju".
                                                    //cilj je da rezultati testova uvek butu isti bez obzira kada se pokrecu (deterministicki testovi)
    //^zato Carbon::now() vraca ^2026, 2, 15



test('neulogovani korisnik ne moze da vidi mesecni broj porudzbina', function () {

    
    $response = $this->getJson('/api/mesecniBrojPorudzbina');     //$this je instanca test case klase

    $response->assertStatus(401);
});

test('kupac ne moze da vidi mesecni broj porudzbina', function () {

    $user = User::factory()->create([
        'uloga' => 'kupac'
    ]);

    $response = $this->actingAs($user)
                     ->getJson('/api/mesecniBrojPorudzbina');

    $response->assertStatus(403);
});

test('admin moze da vidi mesecni broj porudzbina', function () {

    $user = User::factory()->create([
        'uloga' => 'admin'
    ]);

    $response = $this->actingAs($user)
                     ->getJson('/api/mesecniBrojPorudzbina');

    $response->assertStatus(200);
});

test('slikar moze da vidi mesecni broj porudzbina', function () {

    $user = User::factory()->create([
        'uloga' => 'slikar'
    ]);

    $response = $this->actingAs($user)
                     ->getJson('/api/mesecniBrojPorudzbina');

    $response->assertStatus(200);
});

test('mesecni broj porudzbina se vraca za prethodnih 12 meseci', function () {
    

    $user = User::factory()->create([
        'uloga' => 'admin'
    ]);

    $response = $this->actingAs($user)
                     ->getJson('/api/mesecniBrojPorudzbina');

    $response->assertStatus(200);   //status mora biti ok (200)

    $response->assertJsonCount(12); // niz json objekata mora imati 12 elemenata (za svaki mesec)

    $response->assertJsonStructure([
        '*' => ['Mesec', 'Porudzbine']  // svaki json objekat iz niza mora imati ova 2 kljuca
    ]);

    $response->assertJsonFragment(['Mesec'=>'Mar 2025']); //provera da li postoji u response-u (u body-u) ova kombinacija key: value (mi proveravamo za prvi i poslednji mesec koji treba da vrati)
    $response->assertJsonFragment(['Mesec'=>'Feb 2026']);
});

test('funkcija ispravno broji mesecne porudzbine', function () {

    //Carbon::setTestNow(Carbon::create(2026, 2, 15));

    Porudzbina::factory()->count(3)->create([
        'created_at' => Carbon::now()->subMonths(1)
    ]);

    $user = User::factory()->create([
        'uloga' => 'slikar'
    ]);

    $response = $this->actingAs($user)                          //response={status:200,headers:...,body:(JSON string),..}
                     ->getJson('/api/mesecniBrojPorudzbina');


    $data = $response->json();     //[['Mesec'=>'Jan 2026','Porudzbine'=>3]]        //ovim data dobija kod iz body-a kao niz asoc nizova, taj kod je bio u JSON string formatu 

    $januar = collect($data)->firstWhere('Mesec', 'Jan 2026');    //collect($data) obmotava php array u laravel collection (kako bi otkljucali korisne fje poput firstWhere) 

    $this->assertEquals(3, $januar['Porudzbine']);

    $response->assertStatus(200);
});







