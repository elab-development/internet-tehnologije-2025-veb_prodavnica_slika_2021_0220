<?php

use App\Models\Galerija;
use App\Models\Slika;
use App\Models\Tehnika;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Number;

uses(RefreshDatabase::class);

test('neulogovani korisnik ne moze da dodaje slike',function(){

    Storage::fake('public');

    $data=Slika::factory()->make()->toArray();

    $tehnika = Tehnika::factory()->create();

    $galerija = Galerija::factory()->create();

    $data['tehnike'] = [$tehnika->id];
    $data['galerija_id'] = $galerija->id;

    $data['putanja_fotografije'] = UploadedFile::fake()->create('test.jpg', 100, 'image/jpeg');

    $r=$this->postJson('/api/slike',$data);
    $r->assertStatus(401);
});

test('kupac ne moze da dodaje slike',function(){

    $user=User::factory()->create([
        'uloga'=>'kupac'
    ]);

    Storage::fake('public');

    $data=Slika::factory()->make()->toArray();

    $tehnika = Tehnika::factory()->create();

    $galerija = Galerija::factory()->create();

    $data['tehnike'] = [$tehnika->id];
    $data['galerija_id'] = $galerija->id;

    $data['putanja_fotografije'] = UploadedFile::fake()->create('test.jpg', 100, 'image/jpeg');

    $r=$this->actingAs($user)->postJson('/api/slike',$data);
    $r->assertStatus(403);
});

test('nije moguce dodati sliku bez obaveznih polja',function(){

    $user=User::factory()->create([
        'uloga'=>'admin'
    ]);

    $response=$this->actingAs($user)->postJson('/api/slike',[]);
    $response->assertStatus(422);
});



test('funkcija ispravno dodaje sliku u bazu podataka', function(){

    Storage::fake('public');  //ovako postJson nece dodati lazni fajl iz testa u storage (nego u fake public)

    $user=User::factory()->create(['uloga'=>'admin']);

    $tehnika = Tehnika::factory()->create();

    $galerija = Galerija::factory()->create();

    $responseGet1=$this->actingAs($user)->getJson('/api/slike');
    $brojSlikaGet1=count($responseGet1->json());  //$responseGet1->json() daje niz asoc nizova (data)

    $data=Slika::factory()->make()->toArray();
    //^Slika::factory()->make() se od varijante sa create() razlikuje po tome sto se objekat kreira ali se ne upisuje u bazu
    //^toArray pravi asoc niz od atributa kreiranog objekta

    // preko Uploaded::fake()->create(fname,size,mime) mi laziramo fajl (sliku sa .jpeg ekstenzijom)
    $data['putanja_fotografije'] = UploadedFile::fake()->create('test.jpg', 100, 'image/jpeg');
    $data['tehnike'] = [$tehnika->id];
    $data['galerija_id'] = $galerija->id;
    

    $responsePost=$this->actingAs($user)->postJson('/api/slike',$data); //postJson
    $responsePost->assertStatus(201);

    $responsePost->assertJsonFragment([   //proverava da li u response (u body-u) postoje ovi parovi key:value
        'cena'=>(float) $data['cena'],
        'naziv'=>$data['naziv']
    ]);

    $this->assertDatabaseHas('slike',[
        'cena'=>(float) $data['cena'],
        'naziv'=>$data['naziv']
    ]);

    $responseGet2=$this->actingAs($user)->getJson('/api/slike');        //getJson
    $brojSlikaGet2=count($responseGet2->json());

    $this->assertEquals($brojSlikaGet1+1,$brojSlikaGet2);
});
