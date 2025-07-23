# Organized

## Deskripsi

Organized adalah sistem digitalisasi klub karate yang dirancang untuk mengelola keanggotaan, administrasi, acara atau kegiatan, dan keuangan secara terpusat. Proyek ini bertujuan untuk menyederhanakan operasional klub karate melalui platform digital yang terintegrasi.

---

## Teknologi

Organized dibangun dengan teknologi sebagai berikut.
| Bagian | Teknologi |
| ------ | ------ |
| Runtime | Node.js |
| Package Manager | PNPM |
| Database | MongoDB |
| Backend | NestJS, Typescript, Prisma |
| Frontend | React, Typescript, DaisyUI |
| Mobile | (SEGERA) |

---

## Struktur

Repository ini mengikuti struktur _monorepo_ yang terbagi menjadi beberapa folder sebagai berikut.

- `api/`: Berisi kode proyek API backend yang dibangun dengan NestJS dan mengelola interaksi database melalui Prisma.
- `client/`: Berisi kode UI untuk dashboard admin web.
- `mobile/`: Akan menjadi folder UI untuk aplikasi mobile (SEGERA).

---

## Fitur Utama

Organized menyediakan serangkaian fitur yang terbagi dalam beberapa kategori untuk mendukung operasional klub karate:

### 1. Autentikasi dan Otorisasi

- **Autentikasi:** Menggunakan **JSON Web Tokens (JWT)**. Pengguna akan login menggunakan email dan password terdaftar.
- **Otorisasi (RBAC):** Menerapkan Role-Based Access Control (RBAC) yang memungkinkan pengguna mengakses dan mengubah data berdasarkan _role_ mereka. _Role_ terbagi menjadi:
  - `globalRoles`: Peran global yang terdiri atas "unAssociated", "admin", "coachManager", dan "examiners".
  - `branchRoles`: Peran spesifik pengguna di tiap cabang, seperti "member", "branchManager", "branchSupport", dan "coach".

### 2. Manajemen Anggota

- Pendaftaran Anggota: Pengguna dapat mendaftarkan diri melalui web dan secara otomatis mendapatkan `globalRoles` "unAssociated" sebelum terdaftar di cabang manapun.
- Pilihan Cabang: Pengguna dapat melihat profil cabang untuk pertimbangan sebelum mendaftar.
- Penentuan Pelatih: Pelatih (`coach` di cabang) dapat ditentukan oleh Admin pusat (`admin` di global) atau Manajer Cabang (`branchManager` di cabang).

### 3. Latihan dan Kehadiran

- Jadwal Latihan: Pelatih (`coach` di cabang) dapat membuat jadwal latihan berdasarkan hari dan jam yang ditentukan.
- Materi Latihan: Pelatih dapat menambahkan materi yang akan dijadikan bahan latihan pada jadwal mendatang, dan dapat dilihat oleh Anggota (`member` di cabang).
- Presensi Peserta: Pelatih dapat membuat dan mengelola kehadiran atau presensi peserta latihan.

### 4. Ujian Kenaikan Tingkat

- Pengelolaan Ujian: Ujian kenaikan dibuat oleh Pelatih (`coach` di cabang) yang juga dapat mengatur Penguji (`examiners` di cabang).
- Pendaftaran Peserta: Pelatih dapat mengatur peserta ujian dengan dua opsi: otomatis (dihitung 80% + 4 kehadiran) atau manual.
- Penilaian: Penilaian hanya dapat diberikan oleh Penguji dengan kriteria sebagai berikut:

  | Kategori | Rentang Nilai |
  | :------- | :------------ |
  | Kihon    | A, B, C       |
  | Kata     | A, B, C       |
  | Kumite   | A, B, C       |

- Hasil Akhir Ujian: Ditentukan secara otomatis berdasarkan nilai dengan ketentuan:

  - **"special" (naik dua tingkat):** Jika semua kategori (kihon, kata, dan kumite) bernilai "A".
  - **"pass" (naik satu tingkat):** Jika kombinasi nilai kategori tidak termasuk dalam kombinasi "fail" berikut.
  - **"fail" (tidak naik tingkat):** Jika kombinasi nilai kategori cocok dengan salah satu kombinasi berikut:

    | Kihon | Kata | Kumite |
    | :---- | :--- | :----- |
    | A     | C    | C      |
    | B     | C    | C      |
    | C     | A    | A      |
    | C     | A    | B      |
    | C     | A    | C      |
    | C     | B    | A      |
    | C     | B    | B      |
    | C     | B    | C      |
    | C     | C    | A      |
    | C     | C    | B      |
    | C     | C    | C      |

### 5. Kegiatan Pusat

- Mendukung pengelolaan kegiatan multi-cabang seperti Latihan Gabungan, Ujian Gabungan, kegiatan _outdoor_, dan acara lainnya.

### 6. Materi Latihan

- Materi latihan dapat berupa teks singkat yang diatur oleh Pelatih.
- Dukungan untuk video singkat atau foto referensi (SEGERA).

### 7. Monitoring dan Laporan (SEGERA)

- **Admin Pusat:** Dapat melihat ringkasan jumlah anggota aktif, pelatih aktif, cabang beserta rinciannya, jadwal latihan hari ini, dan ujian yang akan datang.
- **Pengurus Cabang:** Pelatih, Manajer Cabang, dan Pengurus Cabang dapat melihat rincian aktivitas dan data spesifik untuk cabang mereka.
- **Format Laporan:** Laporan akan tersedia dalam format PDF/Excel.

### 8. KTA (Kartu Tanda Anggota) (SEGERA)

- Sistem dapat membuat kartu anggota digital dengan QR/Barcode untuk presensi atau pendaftaran kegiatan.
- Dapat dicetak dan digunakan oleh seluruh bagian dari Organized.

### 9. Keuangan (SEGERA)

- Mencatat laporan keuangan keluar-masuk untuk cabang (kas, iuran, pembayaran).
- Menyediakan grafik arus keuangan untuk monitoring.

---

## Getting Started

Untuk menjalankan Organized secara lokal, ikuti langkah berikut.

### Requirements

- Node.js (v18 atau lebih tinggi direkomendasikan)
- PNPM (Package Manager)
- MongoDB Instance

### MongoDB Configuration

- MongoDB dapat dijalankan lokal atau melalui docker
- Jalankan mongodb dengan nama container yang anda mau
- Buat user baru di collection admin dengan username dan password yang anda mau (catat untuk menggunakan di file _.env_)

### Installation

**1. Kloning repositori**

```bash
git clone https://github.com/Firmansyahp16/Portofolio/tree/organized
cd organized
```

**2. Install Dependencies**

```bash
cd api/
pnpm install
# Jalankan ini untuk menginisialisasi dan membuat prisma client
pnpm migrate
cd ../client
pnpm install
```

**3. Buat file _.env_ untuk API**

```bash
DATABASE_URL="mongodb://user:password@localhost:27017/organized?authSource=admin"
JWT_SECRET="supersecretkey"
PORT=3000
```

**4. Jalankan API**

```bash
cd api
pnpm start:dev
```

API akan berjalan di `http://localhost:3000`

**5. Jalankan Dashboard**

```bash
cd client
pnpm run dev
```

Dashboard akan berjalan di `http://localhost:5173`

**6. Eksplorasi Dashboard**

- Untuk mencoba semua fitur di dashboard, login dengan menggunakan `admin@mail.com` dengan password `Admin123`

**7. Prisma Migrate**

Jika nantinya akan ada perubahan pada schema database yang digunakan, maka dapat merubah `schema.prisma` lalu menjalankan perintah berikut.

```bash
pnpm migrate
```

---

## Kontak

Untuk pertanyaan atau saran, bisa melalui berikut.

- [Email](mailto:firman.jka@gmail.com)
- [LinkedIn](https://www.linkedin.com/in/firmansyah-putra-p/)
