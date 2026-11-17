---
title: Bekerja dengan tabel atribut lapisan
summary: Lihat setiap fitur lapisan GIS sebagai tabel, urutkan dan saring, pilih baris dan fitur bersamaan, perbaiki nilai, tambahkan kolom, hitung nilai baru, dan simpan tabel sebagai CSV.
keywords: tabel atribut, tabel, kolom, baris, urutkan, saring, ekspresi, pilih, edit, kalkulator kolom, hitung, tambah kolom, ganti nama kolom, hapus kolom, csv, ekspor, gis, shapefile, geopackage, simbologi
from: fd9d6c11
---

Buka tabel lapisan dari menu **tiga titik** di daftar Lapisan GIS ({{ui:Tabel atribut…}}), dari Permukaan › {{ui:Lainnya}} › {{ui:Tabel atribut}}, atau dengan mengetik `ATTRIBUTES`, `ATTTABLE`, atau `TABLE`. Tabel terbuka di samping denah dan tetap terbuka saat Anda bekerja. Hanya baris yang terlihat yang digambar, sehingga lapisan dengan ribuan fitur terbuka dan digulir dengan cepat.

## Urutkan, saring, dan pilih

- **Urutkan:** klik judul kolom. Klik kedua membalik urutannya, klik ketiga mengembalikan urutan berkas. Nilai kosong selalu tetap di bawah. Pengurutan hanya mengubah apa yang Anda lihat, tidak pernah lapisannya.
- **Saring:** ketik di kotak saring. Ekspresi seperti `AREA > 500 and USE = 'Res'` menyimpan baris yang bernilai benar (kata-kata yang sama dengan tab Pilih di [Analisis lapisan GIS](topic:gis-analysis): `=`, `<`, `like`, `contains`, `is null`, `in`, `between`, `and`, `or`, `not`, `$area`, `$length`). Apa pun yang bukan ekspresi, seperti `oak maple`, mencari kata-kata itu di setiap kolom.
- **Pilih baris:** klik sebuah baris. Ctrl+klik menambah atau menghapus satu, Shift+klik memilih satu rangkaian, dan {{ui:Pilih baris yang ditampilkan}} memilih setiap baris yang lolos saringan. Fitur yang dipilih digambar di denah, dan klik pada fitur di denah memilih barisnya di sini.
- Dengan baris terpilih Anda dapat {{ui:Zoom}} ke sana, membuat **lapisan dari pilihan**, dan membaca total luas atau panjang di baris status.

## Perbaiki nilai

Klik dua kali sel (atau pindah dengan tombol panah dan tekan Enter), ketik nilai baru, lalu tekan Enter. Escape membiarkannya seperti semula. Nilai harus sesuai dengan kolomnya: angka sebagai angka, tanggal sebagai `YYYY-MM-DD`, ya/tidak sebagai yes, no, true, atau false. Nilai yang tidak sesuai ditolak dengan sebuah kalimat dan tidak ada yang berubah. Kotak kosong membuat nilai menjadi kosong. Setiap edit adalah satu langkah urungkan: {{ui:Urungkan}} dan {{ui:Ulangi}} ada di bagian bawah tabel, dan Ctrl+Z berfungsi di denah.

## Kolom

Di bawah **Kolom** Anda dapat menambah kolom (teks, angka, tanggal, atau ya/tidak), mengganti namanya, atau menghapusnya. Kolom baru dimulai kosong. Penggantian nama ikut berubah: kolom label dan [gaya menurut atribut](topic:gis-symbology) lapisan berpindah ke nama baru, dan menghapus kolom akan membuang label dan gaya yang memakainya. Masing-masing adalah satu langkah urungkan yang mengembalikan semuanya.

## Kalkulator kolom

Menulis nilai ke setiap baris (atau hanya baris yang dipilih) dari kolom lain baris itu, geometrinya, dan beberapa fungsi. Pilih kolom yang ada atau **Kolom baru…** dan beri nama serta tipe. Tidak ada yang dijalankan sebagai kode: ekspresi dibaca oleh parser kecil dengan daftar fungsi tetap.

| Grup | Kata |
|---|---|
| Angka | `+ - * /`, kurung, `abs round(x, digits) floor ceil sqrt pow min max` |
| Teks | `upper lower trim len substr(text, from, count) left right replace concat` (teks ditulis dalam 'tanda kutip tunggal'; nama kolom yang mengandung spasi ditulis dalam "tanda kutip ganda" atau [kurung siku]) |
| Memilih | `if(test, then, else)`, `coalesce(a, b, …)`, `num(x)`, `str(x)` |
| Tanggal | `year month day` dari nilai `YYYY-MM-DD` |
| Geometri | `$area $perimeter $length $x $y $vertices`, dalam satuan proyek |

Hasil yang tidak dapat disimpan dalam tipe kolom (teks dalam kolom angka) dibiarkan kosong dan dihitung dalam pesan. Membagi dengan nol menghasilkan nilai kosong. Misalnya, `round($area / 43560, 2)` menulis acre dari kaki persegi.

## Ekspor

{{ui:Ekspor CSV}} menyimpan baris yang Anda lihat (setelah saringan dan pengurutan) sebagai berkas CSV UTF-8 dengan nama kolom di baris pertama. Teks yang diawali `=`, `+`, `-`, atau `@` diberi tanda kutip satu di depannya agar spreadsheet tidak menjalankannya sebagai rumus. Untuk menyimpan lapisannya sendiri, gunakan [Ekspor data as-built untuk GIS](topic:gis-export).

## Batasan

Tabel menampilkan lapisan dalam satu urutan pengurutan dan satu saringan dalam satu waktu. Baris tidak dapat ditambah atau dihapus di sini (buat lapisan baru dari pilihan), geometri tidak diedit, dan tipe kolom tidak dapat diubah setelah dibuat.
