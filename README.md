# IPS BE THE ONE — XII IPS, MAN 3 BANJAR
> **ONE CLASS. ONE STORY. ONE FOREVER.**

Website buku kenangan kelas sinematik 3D premium yang terinspirasi dari tampilan antarmuka Netflix. Dibuat khusus untuk mengabadikan setiap momen, cerita, dan persaudaraan keluarga besar **XII IPS MAN 3 Banjar**. Dilengkapi dengan visual depth 3D interaktif, katalog horizontal, profil lengkap anggota, lorong galeri memori, serta panel administrator untuk mengelola seluruh konten secara dinamis tanpa perlu menyentuh kode program.

---

## 🌟 Fitur Utama

### 1. Desain Sinematik Bergaya Netflix
- **Tema Visual Premium**: Background hitam pekat `#080808`, panel gelap `#141414`, aksen merah ikonik Netflix `#E50914`, dan tipografi putih kontras `#FFFFFF`.
- **Navbar Transparan Dinamis**: Transparan saat berada di puncak halaman dan bertransisi halus menjadi gelap dengan efek *backdrop blur* saat halaman digulir.
- **Hero Banner Sinematik**: Menampilkan foto kelas beresolusi tinggi, vignette gelap melengkung khas Netflix, tagline kelas, dan tombol aksi "Jelajahi Kenangan" & "Album & Galeri".
- **Katalog Baris Horizontal (Netflix Carousels)**: Carousel geser horizontal dengan tombol navigasi kiri-kanan dan efek perbesaran halus (*hover zoom scale-105*).
- **Detail Anggota Interaktif**: Modal pop-up sinematik menampilkan foto beresolusi tinggi, nama lengkap, nama panggilan, jabatan, tanggal lahir, hobi, cita-cita, motto hidup, pesan kenangan, dan tombol Instagram.
- **Galeri Foto & Video Lightbox**: Lorong waktu memori dengan filter album, pratinjau media, tombol unduh, dan lightbox layar penuh (*full-screen preview*).
- **Pesan Rahasia (NGL Memory)**: Wadah pesan anonim untuk saling berbagi apresiasi, cerita lucu, dan pesan perpisahan dengan fitur like serta balasan resmi admin.

### 2. Kedalaman Visual 3D (Three.js & React Three Fiber)
- **Partikel Sinematik**: Debu bintang dan partikel merah melayang di angkasa gelap.
- **Orbital Light Lines**: Garis orbital melengkung bercahaya neon merah yang berotasi perlahan di latar belakang.
- **Paralaks Kursor**: Kamera bergerak halus merespons pergerakan kursor mouse pengguna.
- **Aksesibilitas & Performa**: Tersedia mode performa (`AUTO`, `HIGH`, `MEDIUM`, `LOW`), sakelar *Reduced Motion*, dan fallback 2D otomatis jika perangkat tidak mendukung WebGL.

### 3. Keamanan & Login Tersembunyi
- **Ikon Admin Rahasia**: Ikon kecil berukuran 28px di pojok kiri atas navbar, tidak mencolok tanpa teks permanen untuk menjaga estetika publik.
- **Rute Admin Khusus**:
  - Halaman Login: `/xii-social-panel/login`
  - Dashboard: `/xii-social-panel/dashboard`
- **Autentikasi Backend Berlapis**:
  - Hashing password menggunakan algoritma **bcrypt**.
  - Token sesi terlindungi dengan cookie `HttpOnly`, `SameSite=Lax`, dan signed cookie.
  - **Rate Limiting Login**: Maksimal 5 kali percobaan gagal per IP dalam 15 menit untuk mencegah serangan *brute force*.
  - Validasi ketat tipe file (MIME type) dan pembatasan ukuran maksimal 15MB untuk unggahan.
  - Endpoint publik `/api/public/all` disanitasi sehingga tidak membocorkan hash password maupun data tersembunyi.

### 4. Panel Administrator Lengkap (Full CRUD)
Admin dapat mengelola seluruh konten website tanpa mengubah source code:
1. **Identitas & Hero**: Nama kelas, nama sekolah, tahun angkatan, tagline ("ONE CLASS. ONE STORY. ONE FOREVER."), foto hero banner, logo kelas, dan teks pembuka/penutup.
2. **Anggota Kelas**: Tambah anggota baru, edit profil biodata, hapus, cari, atur urutan (*reorder*), impor data format JSON, dan sembunyikan profil (*toggle visibility*).
3. **Struktur Kelas**: Kelola hierarki jabatan (Wali Kelas, Pengurus Inti, Seksi-Seksi) dan tetapkan anggota ke dalam jabatan.
4. **Guru & Wali Kelas**: Kelola profil pembimbing utama, foto, gelar, deskripsi dedikasi, dan tautan sosial media.
5. **Galeri & Album**: Buat album kenangan baru, unggah foto/video ke server, tentukan sampul album, atur metadata tanggal/lokasi/tag orang, dan toggle izin download.
6. **Latar Belakang & Efek 3D**: Atur warna tema, posisi background, blur, opasitas overlay, dan preset 3D per seksi.
7. **Musik & Audio**: Kelola musik latar pengiring kenangan, volume, putar otomatis, dan efek audio.
8. **Pesan Rahasia NGL**: Moderasi pesan masuk, sembunyikan pesan tidak pantas, dan berikan balasan resmi pengurus.
9. **Mode Pemeliharaan (Maintenance)**: Kunci akses publik dengan pesan kustom saat sedang melakukan pembaruan konten.
10. **Backup & Restore**: Unduh arsip lengkap data website dalam format JSON dan pulihkan data (*restore*) kapan saja dengan konfirmasi keamanan.

---

## 🛠️ Arsitektur & Teknologi

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Motion (Framer Motion), Lucide Icons
- **3D Engine**: Three.js, React Three Fiber, React Three Drei
- **Backend**: Express.js, Node.js v20+, Cookie Parser, Multer, Bcrypt.js
- **Penyimpanan Persisten**: Database file terstruktur JSON (`data/data_store.json`) dan media storage (`public/uploads/`)

---

## 🚀 Panduan Instalasi & Penggunaan

### 1. Prasyarat Sistem
- **Node.js**: Versi 20.x atau lebih baru
- **NPM**: Versi 10.x atau lebih baru

### 2. Kloning Repositori & Instalasi
```bash
# Kloning repositori
git clone https://github.com/fahmigambutt/ipsbetheone.git
cd ipsbetheone

# Instal seluruh dependensi
npm install --legacy-peer-deps
```

### 3. Konfigurasi Environment
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Isi konfigurasi kunci keamanan:
```env
PORT=3000
NODE_ENV=development
SESSION_SECRET=ips_be_the_one_super_secret_session_key_2026
```

### 4. Menjalankan di Mode Development
```bash
npm run dev
```
Buka browser di: [http://localhost:3000](http://localhost:3000)

### 5. Build & Jalankan di Mode Production
```bash
# Kompilasi aset Vite
npm run build

# Menjalankan server Express
npm run start
```

---

## 🔐 Akses Administrator (Provisioning)

- **URL Login Admin**: [http://localhost:3000/xii-social-panel/login](http://localhost:3000/xii-social-panel/login)
- **Kredensial Awal**:
  - **Username**: `admin`
  - **Password**: `admin`
- **Wajib Ganti Password**: Saat login pertama kali, sistem akan mendeteksi status password awal dan mewajibkan admin mengganti password baru sebelum mengakses modul lainnya.
- **Ikon Rahasia**: Pada halaman utama, klik ikon perisai kecil di sudut paling kiri atas bilah navigasi untuk langsung membuka halaman login admin.

---

## 📦 Penyimpanan Data & Backup

1. **File Database**: Seluruh data tersimpan otomatis di `data/data_store.json`. File ini bertahan secara permanen saat server direstart.
2. **File Media**: Foto dan media yang diunggah tersimpan di folder `public/uploads/`.
3. **Backup Otomatis**: Melalui menu **Backup & Restore** di dashboard admin, klik tombol **Unduh Backup JSON** untuk mengamankan data website secara berkala.

---

## 🌐 Panduan Deployment

### Vercel / Netlify
Proyek sudah menyertakan konfigurasi `vercel.json` dan serverless entry point di folder `api/[...path].ts`. Untuk hosting serverless, pastikan media statis menggunakan CDN atau penyimpanan cloud (seperti Cloudinary / Supabase Storage).

### VPS (Ubuntu / Debian / Docker)
```bash
# Jalankan menggunakan PM2
npm install -g pm2
npm run build
pm2 start server.ts --name "ipsbetheone" --interpreter tsx
pm2 save
pm2 startup
```

---

## 📜 Lisensi & Penghargaan
Didedikasikan dengan penuh cinta dan kebanggaan untuk seluruh keluarga besar kelas **XII IPS MAN 3 Banjar (Angkatan 2025/2026)**.

*ONE CLASS. ONE STORY. ONE FOREVER.*

