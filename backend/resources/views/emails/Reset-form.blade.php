<h2>Reset lozinke</h2>

@if(session('error'))
    <p style="color:red">{{ session('error') }}</p>
@endif

<form method="POST" action="{{ route('password.reset.submit') }}">
    @csrf

    <input type="hidden" name="token" value="{{ $token }}">
    <input type="hidden" name="email" value="{{ $email }}">

    <div>
        <label>Nova lozinka</label>
        <input type="password" name="password" required>
    </div>

    <div>
        <label>Potvrdi lozinku</label>
        <input type="password" name="password_confirmation" required>
    </div>

    <button type="submit">Resetuj lozinku</button>
</form>
