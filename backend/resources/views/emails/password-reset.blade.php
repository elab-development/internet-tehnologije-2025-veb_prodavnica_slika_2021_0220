<x-mail::message>
# Zdravo, {{ $user->ime }}

Primili smo zahtev za reset lozinke.

Klikni na dugme ispod da nastavis proces resetovanja lozinke.

<x-mail::button :url="$resetUrl">
Resetuj lozinku
</x-mail::button>

Ukoliko dugme ne radi, kopiraj i nalepi sledeći link u browser:

<a href="{{ $resetUrl }}">{{ $resetUrl }}</a>

Ako niste poslali ovaj zahtev, slobodno ignorišite poruku.

Pozdrav,<br>
{{ config('app.name') }}
</x-mail::message>

