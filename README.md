# Organized

## Deskripsi

Organized adalah sistem digitalisasi klub karate yang dirancang untuk mengelola keanggotaan, administrasi, acara atau kegiatan, dan keuangan secara terpusat.

## Teknologi

Organized dibangun dengan teknologi sebagai berikut.
| Bagian | Teknologi |
| ------ | ------ |
| Runtime | Node.js |
| Package Manager | PNPM |
| Database | MongoDB |
| Backend | NestJS, Typescript, Prisma |
| Frontend | React, Typescript, DaisyUI |

## Struktur

- Folder api adalah folder project API yang dibuat dengan NestJS dan Prisma
- Folder client adalah folder UI untuk dashboard admin
- Folder mobile adalah folder UI untuk mobile apps (SEGERA)

## Fitur

Terdapat beberapa kategori fitur yang dibangun pada Organized, antara lain sebagai berikut.

- Autentikasi dan Otorisasi
  - Autentikasi pada Organized menggunakan JWT. Pengguna akan login menggunakan email dan password yang terdaftar.
  - Otorisasi pada Organized menggunakan konsep RBAC dimana pengguna dapat mengakses dan merubah data berdasarkan role mereka yang terbagi ke dalam dua bentuk sebagai berikut.
    1. globalRoles
       globalRoles adalah role global yang terdiri atas "unAssociated", "admin", "coachManager", dan "examiners".
    2. branchRoles
       branchRoles adalah role pengguna di tiap cabang, dapat terdiri atas "member", "branchManager", "branchSupport","examiners", dan "coach".
- Manajemen Anggota
  - Pengguna dapat mendaftarkan diri melalui web
  - Pengguna mendapatkan globalRoles "unAssociated" dimana pengguna belum terdaftar sebagai apapun di cabang mana pun.
  - Pengguna dapat melihat terlebih dahulu profil dari cabang untuk menjadi pertimbangan memilih mendaftar ke cabang mana.
  - Pelatih ("coach" di cabang) dapat ditentukan oleh Admin pusat ("admin" di global) atau Manager Cabang ("coachManager" di cabang).
- Latihan dan Kehadiran
  - Pelatih ("coach" di cabang) dapat membuat jadwal latihan pada hari dan jam yang ditentukan.
  - Pelatih dapat menambahkan materi yang akan dijadikan bahan latihan pada jadwal mendatang dan dapat dilihat oleh Anggota ("member" di cabang).
  - Pelatih dapat membuat kehadiran atau presensi peserta.
- Ujian Kenaikan Tingkat

  - Ujian kenaikan dibuat oleh Pelatih ("coach" di cabang) dan dapat mengatur Penguji ("examiners" di cabang).
  - Pelatih dapat mengatur peserta ujian dengan dua opsi, otomatis (dihitung 80% + 4 kehadiran) dan manual.
  - Penilaian hanya dapat diberikan oleh Penguji dengan kriteria berikut.
    |Kategori|Rentang Nilai|
    |-------|-------|
    |Kihon|A, B, C|
    |Kata|A, B, C|
    |Kumite|A, B, C|
  - Hasil akhir ujian ditentukan secara otomatis berdasarkan nilai dengan ketentuan berikut.

    - Hasilnya adalah "special" atau naik dua tingkat jika semua kategori (kihon, kata, dan kumite) bernilai "A".
    - Hasilnya adalah "pass" atau naik tingkat jika kombinasi nilai kategori tidak cocok dengan kombinasi berikut. Kombinasi tersebut merupakan kombinasi untuk hasil "fail".

    | Kihon | Kata | Kumite |
    | ----- | ---- | ------ |
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

- Kegiatan Pusat

  Kegiatan pusat dapat berupa Latihan Gabungan beberapa cabang, Ujian Gabungan, kegiatan outdoor, atau acara multi cabang lainnya.

- Materi Latihan
  - Materi latihan dapat berupa text singkat yang diatur oleh Pelatih.
  - Dapat juga berupa video singkat atau foto referensi yang akan digunakan (SEGERA)
- Monitoring dan Laporan (SEGERA)
  - Admin pusat dapat melihat rincian berikut.
    - Ringkasan jumlah anggota aktif, pelatih aktif, cabang dan rinciannya.
    - Jadwal latihan hari ini
    - Ujian yang akan datang
  - Pelatih, Manager Cabang, dan Pengurus Cabang juga dapat melihat rincian dari cabang mereka.
  - Format laporan berupa PDF/Excel
- KTA (SEGERA)
  - Sistem dapat membuat kartu anggota dengan QR/Barcode yang dapat digunakan untuk presensi atau pendaftaran kegiatan
  - Dapat dicetak dan digunakan oleh seluruh bagian dari Organized
- Keuangan (SEGERA)
  - Mencatat laporan keuangan keluar masuk untuk cabang yang dapat berupa kas, iuran, atau pembyaran.
  - Menyediakan grafik arus keuangan.
