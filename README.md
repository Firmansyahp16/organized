# Organized

## Deskripsi

Organized adalah sistem digitalisasi klub karate yang dirancang untuk mengelola keanggotaan, administrasi, acara atau kegiatan, dan keuangan secara terpusat.

## Teknologi

Organized dibangun dengan teknologi sebagai berikut.
| Bagian | Teknologi |
| ------ | ------ |
| Database | MongoDB |
| Backend | Loopback 4, Typescript |
| Frontend | React, Typescript, DaisyUI |

## Fitur

Terdapat beberapa kategori fitur yang dibangun pada Organized, antara lain sebagai berikut.

- Autentikasi dan Otorisasi
  Autentikasi pada Organized menggunakan JWT. Pengguna akan login menggunakan email dan password yang terdaftar. Otorisasi pada Organized menggunakan konsep RBAC dimana pengguna dapat mengakses dan merubah data berdasarkan role mereka yang terbagi ke dalam dua bentuk sebagai berikut. 1. globalRoles
  globalRoles adalah role global yang terdiri atas "unAssociated", "admin", "coachManager", dan "examiners". 2. branchRoles
  branchRoles adalah role pengguna di tiap cabang, dapat terdiri atas "member", "branchManager", "branchSupport","examiners", dan "coach".
- Manajemen Anggota
  1. Pengguna dapat mendaftarkan diri melalui web
  2. Pengguna mendapatkan globalRoles "unAssociated" dimana pengguna belum terdaftar sebagai apapun di cabang mana pun.
  3. Pengguna dapat melihat terlebih dahulu profil dari cabang untuk menjadi pertimbangan memilih mendaftar ke cabang mana.
  4. Pelatih ("coach" di cabang) dapat ditentukan oleh Admin pusat ("admin" di global) atau Manager Cabang ("coachManager" di cabang).
- Latihan dan Kehadiran
  1. Pelatih ("coach" di cabang) dapat membuat jadwal latihan pada hari dan jam yang ditentukan.
  2. Pelatih dapat menambahkan materi yang akan dijadikan bahan latihan pada jadwal mendatang dan dapat dilihat oleh Anggota ("member" di cabang).
  3. Pelatih dapat membuat kehadiran atau presensi peserta.
- Ujian Kenaikan Tingkat
  1. Ujian kenaikan dibuat oleh Pelatih ("coach" di cabang) dan dapat mengatur Penguji ("examiners" di cabang).
  2. Pelatih dapat mengatur peserta ujian dengan dua opsi, otomatis (dihitung 80% + 4 kehadiran) dan manual.
  3. Penilaian hanya dapat diberikan oleh Penguji dengan kriteria berikut.
     |Kategori|Rentang Nilai|
     |-------|-------|
     |Kihon|A, B, C|
     |Kata|A, B, C|
     |Kumite|A, B, C|
  4. Hasil akhir ujian ditentukan secara otomatis berdasarkan nilai dengan ketentuan berikut.
     a. Hasilnya adalah "special" atau naik dua tingkat jika semua kategori (kihon, kata, dan kumite) bernilai "A".
     b. Hasilnya adalah "fail" atau gagal jika kombinasi nilai kategori cocok dengan kombinasi berikut.
     |Kihon|Kata|Kumite|
     |---|---|---|
     |A|C|C|
     |B|C|C|
     |C|A|A|
     |C|A|B|
     |C|A|C|
     |C|B|A|
     |C|B|B|
     |C|B|C|
     |C|C|A|
     |C|C|B|
     |C|C|C|
     c. Hasilnya "pass" atau lulus jika tidak menghasilkan "special" atau "fail".
- Kegiatan Pusat
  Kegiatan pusat dapat berupa Latihan Gabungan beberapa cabang, Ujian Gabungan, kegiatan outdoor, atau acara multi cabang lainnya.
- Materi Latihan
  1. Materi latihan dapat berupa text singkat yang diatur oleh Pelatih.
     <span style="color:red">2. Dapat juga berupa video singkat atau foto referensi yang akan digunakan (SEGERA)</span>
- Monitoring dan Laporan
- KTA
- Keuangan
