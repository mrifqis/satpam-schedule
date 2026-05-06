````md
# Jadwal Jaga Satpam Webview

Aplikasi web sederhana untuk menampilkan jadwal jaga satpam dalam bentuk kalender bulanan. Jadwal dibuat otomatis berdasarkan pola rotasi petugas, tetapi admin tetap dapat mengganti jadwal tertentu secara manual.

Project ini cocok untuk kebutuhan internal kantor, pos jaga, unit layanan, atau organisasi kecil yang membutuhkan jadwal piket sederhana berbasis web tanpa VPS.

## Fitur

- Menampilkan jadwal jaga dalam bentuk kalender bulanan
- Mendukung dua shift per hari:
  - Siang
  - Malam
- Jadwal otomatis berdasarkan pola rotasi petugas
- Mendukung perubahan jadwal manual oleh admin
- Perubahan jadwal disimpan di database
- Jadwal yang diubah manual ditandai di kalender
- Rekap jumlah jaga per bulan untuk setiap petugas
- Halaman publik hanya untuk melihat jadwal
- Halaman admin untuk mengganti atau mengembalikan jadwal
- Dapat berjalan tanpa VPS menggunakan Netlify dan Supabase

## Teknologi yang Digunakan

- Frontend: Vite + Vanilla JavaScript
- Hosting: Netlify
- Backend ringan: Netlify Functions
- Database: Supabase PostgreSQL
- Version control: GitHub

## Arsitektur Singkat

```text
User membuka web
        |
        v
Frontend Netlify
        |
        v
Netlify Functions
        |
        v
Supabase Database
````

Jadwal dasar tidak disimpan seluruhnya di database. Sistem menghitung jadwal otomatis dari tanggal awal dan urutan petugas.

Database hanya menyimpan jadwal yang diubah secara manual oleh admin.

## Pola Jadwal

Contoh pola awal:

```text
Rabu Siang  : Made
Rabu Malam  : Irfan
Kamis Siang : Hendra
Kamis Malam : Made
Jumat Siang : Irfan
Jumat Malam : Hendra
```

Urutan petugas:

```js
const guards = ["Made", "Irfan", "Hendra"];
```

Urutan shift:

```js
const shifts = ["Siang", "Malam"];
```

Tanggal dasar:

```js
const baseDate = new Date(2026, 4, 6);
```

Catatan:

```text
new Date(2026, 4, 6) berarti 6 Mei 2026
karena bulan di JavaScript dimulai dari 0.
Januari = 0
Februari = 1
Maret = 2
April = 3
Mei = 4
```

Dengan konfigurasi tersebut:

```text
6 Mei 2026 Siang = Made
6 Mei 2026 Malam = Irfan
7 Mei 2026 Siang = Hendra
7 Mei 2026 Malam = Made
```

## Struktur Folder

```text
satpam-schedule/
├─ index.html
├─ admin.html
├─ package.json
├─ netlify.toml
├─ .gitignore
├─ src/
│  ├─ main.js
│  ├─ admin.js
│  └─ style.css
└─ netlify/
   └─ functions/
      ├─ get-schedule.js
      ├─ save-override.js
      └─ delete-override.js
```

## Halaman Aplikasi

### Halaman Publik

```text
/
```

Fungsi:

* melihat kalender jadwal jaga
* memilih bulan dan tahun
* melihat rekap jumlah jaga bulanan

### Halaman Admin

```text
/admin.html
```

Fungsi:

* mengganti petugas pada tanggal dan shift tertentu
* mengembalikan jadwal ke pola otomatis
* menyimpan catatan perubahan

## Persyaratan

Sebelum menjalankan project ini, pastikan sudah memiliki:

* Node.js
* Git
* Akun GitHub
* Akun Netlify
* Akun Supabase

## Instalasi Lokal

Clone repository:

```bash
git clone https://github.com/USERNAME/satpam-schedule.git
cd satpam-schedule
```

Install dependency:

```bash
npm install
```

Install Netlify CLI:

```bash
npm install -g netlify-cli
```

## Setup Database Supabase

Buat project baru di Supabase, lalu masuk ke menu:

```text
SQL Editor
```

Jalankan SQL berikut:

```sql
create table public.schedule_overrides (
  id bigserial primary key,
  shift_date date not null,
  shift_name text not null check (shift_name in ('Siang', 'Malam')),
  guard_name text not null check (guard_name in ('Made', 'Irfan', 'Hendra')),
  note text,
  created_at timestamptz default now()
);

create unique index schedule_overrides_unique_shift
on public.schedule_overrides (shift_date, shift_name);

alter table public.schedule_overrides enable row level security;
```

Tabel `schedule_overrides` digunakan untuk menyimpan jadwal yang diubah manual.

Contoh data:

| shift_date | shift_name | guard_name | note               |
| ---------- | ---------- | ---------- | ------------------ |
| 2026-05-10 | Siang      | Made       | Tukar jaga         |
| 2026-05-12 | Malam      | Hendra     | Penyesuaian jadwal |

## Environment Variables

Buat file `.env` di root project:

```env
SUPABASE_URL=isi_project_url_supabase
SUPABASE_SECRET_KEY=isi_secret_key_supabase
ADMIN_PASSWORD=isi_password_admin
```

Contoh:

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SECRET_KEY=sb_secret_xxxxxxxxx
ADMIN_PASSWORD=admin123
```

Penting:

* Jangan commit file `.env`
* Jangan taruh `SUPABASE_SECRET_KEY` di frontend
* Secret key hanya boleh digunakan di Netlify Functions

Pastikan `.gitignore` berisi:

```gitignore
node_modules
dist
.env
```

## Menjalankan Project Secara Lokal

Gunakan perintah:

```bash
netlify dev
```

Biasanya aplikasi akan berjalan di:

```text
http://localhost:8888
```

Halaman publik:

```text
http://localhost:8888
```

Halaman admin:

```text
http://localhost:8888/admin.html
```

## Build Project

Untuk membuat versi production:

```bash
npm run build
```

Hasil build akan berada di folder:

```text
dist/
```

## Deploy ke Netlify

1. Push project ke GitHub
2. Masuk ke Netlify
3. Pilih `Add new project`
4. Pilih `Import an existing project`
5. Hubungkan ke repository GitHub
6. Gunakan konfigurasi berikut:

```text
Build command: npm run build
Publish directory: dist
```

7. Tambahkan environment variables di Netlify:

```text
SUPABASE_URL
SUPABASE_SECRET_KEY
ADMIN_PASSWORD
```

8. Deploy ulang site

## File `netlify.toml`

Project ini menggunakan konfigurasi Netlify berikut:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[functions]
  directory = "netlify/functions"
  node_bundler = "esbuild"
```

## API Functions

### 1. Ambil Jadwal

Endpoint:

```text
/.netlify/functions/get-schedule?month=5&year=2026
```

Method:

```text
GET
```

Fungsi:

* mengambil data perubahan jadwal dari Supabase
* hanya mengambil data sesuai bulan dan tahun yang dipilih

Contoh response:

```json
{
  "overrides": [
    {
      "id": 1,
      "shift_date": "2026-05-10",
      "shift_name": "Siang",
      "guard_name": "Made",
      "note": "Tukar jaga",
      "created_at": "2026-05-06T00:00:00.000Z"
    }
  ]
}
```

### 2. Simpan Perubahan Jadwal

Endpoint:

```text
/.netlify/functions/save-override
```

Method:

```text
POST
```

Contoh body:

```json
{
  "adminPassword": "admin123",
  "shiftDate": "2026-05-10",
  "shiftName": "Siang",
  "guardName": "Made",
  "note": "Tukar jaga"
}
```

Fungsi:

* menyimpan perubahan jadwal
* jika tanggal dan shift sudah pernah diubah, data lama akan diperbarui

### 3. Hapus Perubahan Jadwal

Endpoint:

```text
/.netlify/functions/delete-override
```

Method:

```text
POST
```

Contoh body:

```json
{
  "adminPassword": "admin123",
  "shiftDate": "2026-05-10",
  "shiftName": "Siang"
}
```

Fungsi:

* menghapus perubahan manual
* jadwal akan kembali mengikuti pola otomatis

## Cara Mengubah Nama Petugas

Ubah daftar petugas di file:

```text
src/main.js
```

Cari bagian:

```js
const guards = ["Made", "Irfan", "Hendra"];
```

Ubah sesuai kebutuhan, misalnya:

```js
const guards = ["Budi", "Agus", "Rizal"];
```

Lakukan juga penyesuaian di:

```text
src/admin.js
admin.html
netlify/functions/save-override.js
Supabase SQL check constraint
```

Jika jumlah petugas berubah, sistem rotasi tetap dapat berjalan, tetapi constraint database dan pilihan form harus ikut disesuaikan.

## Cara Mengubah Shift

Default shift:

```js
const shifts = ["Siang", "Malam"];
```

Jika ingin menambah shift, misalnya menjadi:

```js
const shifts = ["Pagi", "Siang", "Malam"];
```

Maka perlu menyesuaikan:

* `src/main.js`
* `admin.html`
* `save-override.js`
* `delete-override.js`
* constraint database di Supabase

## Cara Mengubah Tanggal Dasar

Di file:

```text
src/main.js
```

Cari:

```js
const baseDate = new Date(2026, 4, 6);
```

Ubah sesuai tanggal awal jadwal.

Contoh:

```js
const baseDate = new Date(2026, 0, 1);
```

Artinya:

```text
1 Januari 2026
```

## Cara Kerja Jadwal Otomatis

Sistem menghitung jumlah shift sejak tanggal dasar.

Contoh:

```text
Tanggal dasar: 6 Mei 2026
Shift pertama: Siang
Petugas pertama: Made
```

Kemudian sistem menghitung:

```text
totalShiftIndex = selisihHari * jumlahShiftPerHari + indexShiftDalamHari
```

Lalu menentukan petugas:

```text
guardIndex = totalShiftIndex % jumlahPetugas
```

Dengan cara ini, jadwal dapat dihitung otomatis untuk bulan dan tahun berapa pun.

## Cara Kerja Override

Jadwal dasar dihitung otomatis.

Jika ada data override di Supabase, maka jadwal otomatis diganti dengan data dari database.

Contoh:

Jadwal otomatis:

```text
10 Mei 2026 Siang = Irfan
```

Data override:

```text
10 Mei 2026 Siang = Made
```

Maka yang ditampilkan di kalender:

```text
10 Mei 2026 Siang = Made
Diganti dari Irfan
```

## Rekap Bulanan

Rekap bulanan dihitung dari jadwal aktual, bukan hanya jadwal dasar.

Artinya, jika ada perubahan manual, maka rekap akan mengikuti jadwal yang sudah diubah.

Contoh:

```text
Made
Siang: 10
Malam: 11
Total: 21
```

## Catatan Keamanan

Project ini menggunakan sistem admin sederhana berbasis password global.

Untuk penggunaan internal kecil, pendekatan ini cukup sederhana dan mudah dijalankan.

Namun, untuk penggunaan produksi yang lebih serius, disarankan menambahkan:

* login admin
* Supabase Auth
* role user/admin
* audit log perubahan
* pembatasan akses halaman admin
* rate limiting
* proteksi tambahan pada Netlify Functions

Jangan pernah menyimpan secret key di kode frontend.

## Pengembangan Lanjutan

Beberapa fitur yang dapat dikembangkan:

* Login admin menggunakan Supabase Auth
* Role pengguna:

  * admin
  * satpam
  * viewer
* Form pengajuan tukar jaga oleh satpam
* Persetujuan atau penolakan tukar jaga oleh admin
* Riwayat perubahan jadwal
* Export jadwal ke PDF
* Export jadwal ke Excel
* Notifikasi WhatsApp atau Telegram
* Tampilan mobile yang lebih baik
* Mode cetak jadwal bulanan
* Filter berdasarkan nama petugas
* Rekap tahunan
* Dashboard statistik jaga
* Multi lokasi atau multi pos jaga

## Troubleshooting

### 1. Kalender muncul, tetapi data perubahan tidak tampil

Cek:

* environment variables di Netlify
* nama tabel Supabase
* function `get-schedule.js`
* apakah data memang ada di tabel `schedule_overrides`

### 2. Error password admin salah

Cek nilai:

```text
ADMIN_PASSWORD
```

di file `.env` lokal atau di environment variables Netlify.

### 3. Error Supabase unauthorized

Cek:

```text
SUPABASE_URL
SUPABASE_SECRET_KEY
```

Pastikan secret key benar dan tidak tertukar dengan anon key.

### 4. Function tidak ditemukan

Pastikan struktur folder benar:

```text
netlify/functions/get-schedule.js
netlify/functions/save-override.js
netlify/functions/delete-override.js
```

Pastikan `netlify.toml` sudah benar:

```toml
[functions]
  directory = "netlify/functions"
```

### 5. Setelah deploy, perubahan tidak muncul

Coba lakukan redeploy di Netlify:

```text
Deploys
↓
Trigger deploy
↓
Deploy site
```

Pastikan environment variables sudah dimasukkan di Netlify, bukan hanya di file `.env` lokal.

## Lisensi

Project ini dapat menggunakan lisensi MIT agar bebas digunakan, dimodifikasi, dan dikembangkan kembali.

Contoh file `LICENSE`:

```text
MIT License

Copyright (c) 2026

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files, to deal in the Software
without restriction, including without limitation the rights to use, copy,
modify, merge, publish, distribute, sublicense, and/or sell copies of the Software,
subject to the conditions of the MIT License.
```

## Kontribusi

Kontribusi sangat terbuka.

Beberapa cara berkontribusi:

* membuat issue untuk bug
* mengusulkan fitur baru
* memperbaiki dokumentasi
* menambahkan autentikasi
* memperbaiki tampilan
* menambahkan export PDF atau Excel

## Kredit

Project ini dibuat sebagai contoh aplikasi jadwal jaga sederhana menggunakan Netlify Functions dan Supabase.

```