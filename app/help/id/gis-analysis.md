---
title: Analisis lapisan GIS
summary: Buffer, overlay (irisan, gabungan, hapus, lebur), spatial join, pilih menurut atribut, dan ukur lapisan GIS dalam proyek, masing-masing sebagai lapisan baru yang dapat Anda urungkan.
keywords: gis, analisis, buffer, overlay, intersect, union, erase, clip, dissolve, spatial join, join, pilih menurut atribut, kueri, where, ekspresi, statistik, area, length, perimeter, ukur, persil, easement, sempadan, shapefile, geopackage, tabel atribut
from: a6b2d3f9
---

Setelah proyek memiliki lapisan GIS (lihat [Impor data GIS](topic:gis-import)), tombol **Analisis** di grup GIS (diketik `GISANALYSIS`, `ANALYZE` atau `BUFFER`) membuka panel dengan lima tab. Panel tetap terbuka di samping denah, sehingga apa pun yang Anda pilih digambar di denah selama Anda bekerja.

Setiap alat yang membuat sesuatu **menambahkan lapisan baru** dan membiarkan lapisan yang dibacanya tetap seperti semula. Setiap hasil adalah satu langkah urungkan: {{ui:Urungkan}} di panel (atau Ctrl+Z) menghapus lapisan baru. Ekspor hasilnya seperti lapisan lain dengan [Ekspor data as-built untuk GIS](topic:gis-export) sebagai shapefile, GeoJSON atau GeoPackage.

Tabel lengkap sebuah lapisan, dengan pengurutan, pengeditan, dan kalkulator kolom, ada di [Bekerja dengan tabel atribut lapisan](topic:gis-table); pewarnaan menurut kolom ada di [Beri gaya lapisan menurut atribut](topic:gis-symbology).

Semuanya dikerjakan di denah, dalam satuan proyek (ft atau m). Proyek selalu berada dalam sistem terproyeksi atau lokal, sehingga jarak 50 berarti 50 ft atau 50 m, bukan derajat. Ketinggian (z) tidak disimpan dalam hasil.

## Buffer

Menggambar zona dengan jarak tertentu di sekeliling setiap fitur, sebagai lapisan poligon baru. Titik menjadi lingkaran, garis menjadi koridor dengan ujung membulat, dan poligon membesar. Jarak **negatif** mengecilkan poligon (persegi 100 × 100 yang dikecilkan 5 menjadi 90 × 90; jika dikecilkan 60, tidak ada yang tersisa, dan panel memberitahukannya). Ambil jarak dari kolom angka untuk memberi setiap fitur jaraknya sendiri, atau centang **Gabungkan semua buffer menjadi satu bentuk** untuk meleburnya.

Bagian yang membulat dibentuk dari potongan lurus yang digambar di dalam kurva sebenarnya, sehingga buffer sedikit lebih kecil daripada lingkaran eksak: sekitar 0.6 % dalam luas pada pengaturan normal, 0.16 % pada Halus. Gunakan Halus untuk apa pun yang akan Anda ukur.

## Overlay

| Alat | Yang Anda dapatkan |
|---|---|
| Irisan (Intersect) | Potongan tempat lapisan masukan bertemu poligon overlay, masing-masing dengan kolom dari kedua lapisan. Garis dan titik dipotong mengikuti poligon. |
| Gabungan (Union) | Kedua lapisan poligon dipotong sepanjang tepi satu sama lain: potongan bersama membawa kolom kedua lapisan, sisanya membawa kolom satu lapisan (kolom lapisan lainnya kosong). |
| Hapus (Erase) | Poligon masukan dengan poligon overlay dikeluarkan. Kolom tetap milik masukan. Fitur yang terhapus seluruhnya dibuang (panel menghitungnya). |
| Lebur (Dissolve) | Menggabungkan poligon yang bersentuhan atau tumpang tindih, semuanya atau satu bentuk untuk setiap nilai kolom. Menambahkan `COUNT` dan `AREA`. |

Nama kolom yang dimiliki kedua lapisan dipertahankan untuk lapisan pertama, dan milik lapisan kedua ditulis dengan `_2`. Fitur di dalam satu lapisan sebaiknya tidak saling tumpang tindih: jika tumpang tindih, Gabungan menghitung tumpang tindih itu di kedua lapisan.

## Join

Spatial join menyalin atribut dari lapisan **sumber** ke setiap fitur **target** yang bertemu dengannya, dan menghasilkan lapisan baru dengan bentuk target. Pilih kapan keduanya dianggap bertemu: bersentuhan atau tumpang tindih, target berada di dalam poligon sumber, target memuat fitur sumber, fitur sumber terdekat (dengan batas opsional), atau fitur sumber mana pun dalam jarak tertentu.

Ketika beberapa fitur sumber cocok, Anda mengambil atribut dari fitur pertama (yang terdekat, untuk join terdekat dan join jarak; `DISTANCE` ditambahkan), atau **menghitungnya dan menjumlahkan kolom angkanya**: `COUNT`, serta `SUM_`, `MEAN_`, `MIN_`, `MAX_` untuk setiap kolom angka. Hapus centang **Simpan fitur target yang tidak menemukan kecocokan** untuk membuangnya. Kolom hasil join kosong di tempat tidak ada yang cocok, dan panel menghitung yang tidak cocok.

## Pilih

Ketik pertanyaan tentang atribut atau bentuk, tekan **Pilih**, dan fitur digambar di denah dengan jumlahnya, sebuah tabel, serta total luas, panjang, atau jumlah. Lalu jadikan fitur-fitur itu lapisan tersendiri, zoom ke sana, atau hapus pilihannya.

| Yang bisa Anda tulis | Contoh |
|---|---|
| Kolom menurut nama; gunakan "tanda kutip" atau [kurung siku] jika nama mengandung spasi | `VALUE`, `"Lot Number"` |
| Angka, 'teks', true, false, null | `Use_ = 'Res'` |
| `=` `!=` `<>` `<` `<=` `>` `>=` | `VALUE >= 250` |
| `contains` `startswith` `endswith` `like` `ilike` (teks tidak peduli huruf besar-kecil; pada `like`, `%` berarti rangkaian karakter apa pun dan `_` berarti satu huruf) | `Notes contains 'corner'` |
| `is null`, `is not null` (nilai kosong dihitung sebagai null) | `Notes is null` |
| `in (…)`, `not in (…)`, `between … and …` | `Use_ in ('Com', 'Ind')` |
| `+ - * /` dan kurung | `VALUE / 2 > 100` |
| `and`, `or`, `not` | `Use_ = 'Res' and VALUE > 200` |
| Nilai bentuk `$area` `$perimeter` `$length` `$x` `$y` `$vertices` | `$area > 5000` |

Pertanyaan yang belum lengkap atau menyebut kolom yang tidak dimiliki lapisan akan ditolak dengan kalimat yang menunjukkan letaknya.

## Ukur

Menampilkan total luas dan keliling, panjang, atau jumlah lapisan, dan **menambahkan kolom** ke dalamnya: `AREA` dan `PERIMETER` untuk poligon, `LENGTH` untuk garis (panjang pada denah), `X` dan `Y` untuk titik. Kolom yang sudah ada tidak pernah ditimpa: kolom baru dinamai `AREA_2`. Ini adalah satu langkah urungkan. **Statistik** memberikan jumlah, total, rata-rata, nilai minimum dan maksimum dari sebuah kolom angka, opsional untuk setiap nilai dari kolom lain.

:::note
Pemeriksaan di balik alat-alat ini dikerjakan secara manual dalam pengujian (`node bin/test-civilcraft-gisanalysis.mjs`): misalnya, persil 100 × 100 di bawah zona 100 × 80 berpotongan menjadi 3,000 ditambah 3,000, dan garis sepanjang 100 yang di-buffer sebesar 10 adalah 2,000 ditambah sebuah lingkaran.
:::
