<x-mail::message>
# Zdravo, {{ $primalac->ime }}

Pristigla je **nova poruka** sa sledećim podacima:

## Podaci o korisniku koji je poslao poruku
- **Ime:** {{ $poruka['ime'] }} 
- **Email:** {{ $poruka['email'] }}

---

## Poruka
- {{ $poruka['poruka'] }} 

---

@if(isset($poruka['slike']))
  {{-- slike su fajlovi, samo prikaži da su priložene --}}
  Priloženo {{ count($poruka['slike']) }} slika.
@endif

---

Hvala,  
{{ config('app.name') }}
</x-mail::message>