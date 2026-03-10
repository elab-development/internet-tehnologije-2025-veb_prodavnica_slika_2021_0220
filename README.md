# 🖼️ Veb Prodavnica Slika

Veb aplikacija za prodaju umetničkih slika razvijena kao seminarski rad.

---

## 👥 Tim

| Ime i prezime | Broj indeksa |
|---|---|
| Lazar Milosavljević | 220/2021 |
| Jovan Radoičić | 200/2021 |

---

## 🚀 Tehnologije

### Backend
- **Laravel 12** + **PHP 8.2**
- **MySQL 8.0** (lokalno) / **Neon PostgreSQL** (produkcija)
- **Laravel Sanctum** — autentifikacija tokenima
- **Laravel Queue** — asinhrono slanje emailova (`later` sa delayom)
- **Mailtrap** — email sandbox za testiranje
- **Cloudinary** — cloud skladištenje slika
- **L5-Swagger** — automatska API dokumentacija
- **Pest** — testiranje

### Frontend
- **React 18** (Create React App)
- **Bootstrap** — stilizovanje
- **Axios** — HTTP klijent
- **Google Charts API** — vizualizacija mesečne statistike
- **Leaflet** — interaktivna mapa galerije
- **Jest** — testiranje

### DevOps
- **Docker** — kontejnerizacija za deployment
- **GitHub Actions** — CI/CD pipeline
- **Render** — cloud hosting (backend + frontend)

---

## ✨ Funkcionalnosti

- 🔐 Registracija, prijava, odjava, verifikacija emaila, reset lozinke
- 👥 Role-based pristup: `gost`, `kupac`, `slikar`, `admin`
- 🖼️ CRUD operacije za porudžbine, slike, tehnike slikanja, popuste i korisnike
- ☁️ Upload i skladištenje slika na Cloudinary
- 🔍 Napredno filtriranje slika (cena, dimenzije, tehnike, dostupnost) + sortiranje + paginacija
- 🛒 Kreiranje porudžbina (gost i ulogovani korisnik)
- 🎁 Automatski popusti — praznici i popust za ulogovane korisnike (10%)
- 📧 Email notifikacije za kupce i privilegovane korisnike (queue, delay 10s po korisniku)
- 📊 Mesečna statistika porudžbina (Google Charts)
- 🗺️ Interaktivna mapa lokacije galerije (Leaflet)
- 📖 Swagger API dokumentacija

---

## 📦 Instalacija i pokretanje

### Preduslovi
- PHP 8.2+
- Composer
- Node.js 18+
- MySQL 8.0
- Mailtrap nalog (za email testiranje) - neophodno za registraciju i reset lozinke
- Cloudinary nalog (za upload slika)

### Backend

```bash
# 1. Kloniranje repozitorijuma
git clone <repo-url>
cd backend

# 2. Instalacija zavisnosti
composer install

# 3. Konfiguracija okruženja
cp .env.example .env
php artisan key:generate

# 4. Podešavanje .env
DB_DATABASE=web_shop
DB_USERNAME=root
DB_PASSWORD=

MAIL_MAILER=smtp
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=<mailtrap_user>
MAIL_PASSWORD=<mailtrap_pass>

FRONTEND_URL=http://localhost:3000

CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>

# 5. Migracije i seederi
php artisan migrate --seed

# 6. Storage link (za lokalni razvoj)
php artisan storage:link

# 7. Pokretanje servera
php artisan serve

# 8. Queue worker (za slanje emailova)
php artisan queue:work --sleep=10 --tries=3
```

### Frontend

```bash
cd frontend

npm install

npm start
```

### CI/CD Pipeline

Svaki push na `main` granu automatski pokreće sledeći pipeline:

```
push na main
      ↓
✅ Automatsko pokretanje testova (Pest + Jest)
      ↓
🐳 Docker build i push na DockerHub
      ↓
🚀 Automatski deploy na Render (backend + frontend)
```

Ako testovi ne prođu — Docker build i deploy se **ne izvršavaju**.

---

### Docker (alternativno)

```bash
# Pokretanje cele aplikacije kroz Docker
docker compose up --build -d

# Migracije
docker compose exec backend php artisan migrate --seed
```

---

## 🌐 Pristup aplikaciji

| Servis | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000/api |
| Swagger dokumentacija | http://localhost:8000/api/documentation |

---

## 🌍 Produkcija

| Servis | URL |
|---|---|
| Frontend | https://danyart.onrender.com |
| Backend API | https://internet-tehnologije-backend.onrender.com/api |

---

## 🗂️ Struktura projekta

```
/
├── backend/                    # Laravel API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   ├── Middleware/
│   │   │   └── Resources/
│   │   ├── Models/
│   │   ├── Mail/
│   │   └── Console/Commands/
│   ├── database/
│   │   ├── migrations/
│   │   ├── seeders/
│   │   └── factories/
│   └── routes/
│       └── api.php
│
├── frontend/                   # React aplikacija
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── privileged-pages/
│   │   ├── modals/
│   │   └── api/
│   └── public/
│
├── docker/
│   ├── backend/Dockerfile
│   ├── frontend/Dockerfile
│   └── nginx/default.conf
├── docker-compose.yml
└── .github/workflows/ci-cd.yml
```

---

## 📧 Email funkcionalnosti

- **Verifikacija emaila** — pri registraciji
- **Reset lozinke** — token za reset kroz frontend modal
- **Notifikacija kupcu** — nakon kreirane porudžbine
- **Notifikacija adminu/slikaru** — nakon svake porudžbine (queue, delay 10s po korisniku)
- **Korisnički zahtev** — sa 0-5 upload-ovanih slika

---

## 🔍 Filtriranje slika

Endpoint `GET /api/slike-pag` podržava:

| Parametar | Opis |
|---|---|
| `per_page` | Broj slika po stranici (default: 12) |
| `dostupna` | Filtriranje po dostupnosti |
| `cena_min` / `cena_max` | Opseg cene |
| `visina_cm_min` / `visina_cm_max` | Opseg visine |
| `sirina_cm_min` / `sirina_cm_max` | Opseg širine |
| `tehnike[]` | Filtriranje po tehnikama |
| `sort_cena` | Sortiranje po ceni (`asc`/`desc`) |
| `sort_starost` | Sortiranje po datumu (`asc`/`desc`) |

---

## 🎁 Logika popusta

- **Popust za ulogovane korisnike** — automatski 10% na ukupnu cenu
- **Praznici** — posebni popusti koji se aktiviraju na određene datume
- Popusti se automatski primenjuju pri kreiranju porudžbine
- Članski popust se ne kombinuje sa prazničnim, uvek obračunava veći

---

## 👤 Upravljanje privilegovanim korisnicima

Kreiranje i izmena `admin` i `slikar` naloga vrši se kroz custom Artisan komandu:

```bash
php artisan user:create-privileged
```

Komanda interaktivno traži:
- Ime i prezime
- Email
- Ulogu (`admin` ili `slikar`)
- Lozinku (samo za admina — slikar dobija link za reset lozinke na email)

Lozinke se čuvaju kao **bcrypt hash** — nikad u plain text obliku.

---

## 🔒 Bezbednost

| Napad | Zaštita |
|---|---|
| **SQL Injection** | Eloquent ORM i Query Builder koriste PDO prepared statements — korisnički unos nikad nije direktno umetnut u SQL |
| **CSRF** | Laravel Sanctum koristi token autentifikaciju za API — CSRF token se dodaje na svaki zahtev kroz Axios interceptor |
| **XSS** | React automatski escapuje sve vrednosti pri renderovanju — korisnički unos se nikad ne injektuje kao sirovi HTML |
| **IDOR** | Middleware `role` proverava ulogu korisnika pre svakog zahteva — kupac ne može pristupiti admin rutama čak i ako zna ID resursa |
| **CORS** | Laravel CORS middleware (`config/cors.php`) dozvoljava zahteve samo sa whitelistovanih origin-a (frontend URL) |
| **Brute Force** | Laravel Sanctum tokeni se poništavaju pri odjavi — kompromitovani token ne može biti zloupotrebljen nakon logout-a |

---

## 🧪 Testiranje

```bash
cd backend
php artisan test
```
