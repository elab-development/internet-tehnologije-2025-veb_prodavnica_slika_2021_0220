<x-mail::message>
# Zdravo, {{ $user->ime }}

Pristigla je **nova porudžbina** sa sledećim podacima:

---

## Podaci o porudžbini
- **Ukupna cena:** {{ number_format($porudzbina->ukupna_cena, 2) }} RSD

@if ($porudzbina->tip_popusta_ss)
- **Popust:** {{ $porudzbina->procenat_popusta_ss }}%
@endif

- **Konačna cena:** **{{ number_format($porudzbina->konacna_cena, 2) }} RSD**

---

## Podaci o kupcu
- **Ime i prezime:** {{ $porudzbina->ime }} {{ $porudzbina->prezime }}
- **Telefon:** {{ $porudzbina->telefon }}

---

## Adresa isporuke
{{ $porudzbina->adresa }}  
{{ $porudzbina->postanski_broj }} {{ $porudzbina->grad }}  

---

## Stavke porudžbine
@foreach ($porudzbina->stavke as $stavka)
- **{{ $stavka->naziv }}**
  <!-- - Količina: {{ $stavka->kolicina }} -->
  - Naziv slike: {{ $stavka->slika->naziv }} 
  - Cena: {{ number_format($stavka->cena, 2) }} RSD
  <!-- - Ukupno: {{ number_format($stavka->kolicina * $stavka->cena, 2) }} RSD -->
@endforeach

---

Hvala,  
{{ config('app.name') }}
</x-mail::message>

