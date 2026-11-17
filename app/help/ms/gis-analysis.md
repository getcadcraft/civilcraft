---
title: Analisis lapisan GIS
summary: Penampan, tindihan (persilangan, kesatuan, padam, larutkan), cantum ruang, pilih mengikut atribut dan ukur lapisan GIS dalam projek, setiap satu sebagai lapisan baharu yang boleh dibuat asal.
keywords: gis, analisis, penampan, tindihan, persilangan, kesatuan, padam, klip, larutkan, cantum ruang, cantum, pilih mengikut atribut, pertanyaan, di mana, ungkapan, statistik, luas, panjang, perimeter, ukur, lot, hak laluan, garis sekatan, shapefile, geopackage, jadual atribut
from: a6b2d3f9
---

Apabila projek mempunyai lapisan GIS (lihat [Import data GIS](topic:gis-import)), butang **Analisis** dalam kumpulan GIS (ditaip `GISANALYSIS`, `ANALYZE` atau `BUFFER`) membuka panel dengan lima tab. Panel kekal terbuka di sebelah pelan, jadi apa yang anda pilih dilukis pada pelan semasa anda bekerja.

Setiap alat yang menghasilkan sesuatu **menambah lapisan baharu** dan membiarkan lapisan yang dibacanya kekal seperti asal. Setiap satu ialah satu langkah buat asal: {{ui:Buat asal}} dalam panel (atau Ctrl+Z) mengalih keluar lapisan baharu. Eksport hasilnya seperti mana-mana lapisan dengan [Eksport data as-built untuk GIS](topic:gis-export) sebagai shapefile, GeoJSON atau GeoPackage.

Jadual penuh lapisan, dengan isihan, penyuntingan dan kalkulator medan, terdapat dalam [Bekerja dengan jadual atribut lapisan](topic:gis-table); mewarnakan mengikut medan dibincangkan dalam [Gayakan lapisan mengikut atribut](topic:gis-symbology).

Semua dikerjakan pada pelan, dalam unit projek (kaki atau meter). Projek sentiasa berada dalam sistem terunjur atau tempatan, jadi jarak 50 bermaksud 50 kaki atau 50 meter, bukan darjah. Ketinggian (z) tidak disimpan dalam keputusan.

## Penampan

Melukis zon pada jarak tertentu di sekeliling setiap ciri, sebagai lapisan poligon baharu. Titik menjadi bulatan, garisan menjadi koridor dengan hujung membulat, dan poligon membesar. Jarak **negatif** mengecilkan poligon (segi empat sama 100 kali 100 yang dikecilkan sebanyak 5 menjadi 90 kali 90; jika dikecilkan sebanyak 60, tiada apa yang tinggal dan panel memberitahu anda). Ambil jarak daripada medan nombor untuk memberi setiap ciri jaraknya sendiri, atau tandakan **Gabungkan semua penampan menjadi satu bentuk** untuk melarutkannya.

Bahagian membulat ialah garis lurus yang dilukis di dalam lengkung sebenar, jadi penampan sedikit lebih kecil daripada bulatan tepat: lebih kurang 0.6 % dari segi luas pada tetapan biasa, dan 0.16 % pada Halus. Gunakan Halus untuk apa-apa yang akan anda ukur.

## Tindihan

| Alat | Apa yang anda perolehi |
|---|---|
| Persilangan | Bahagian di mana lapisan input bertemu poligon tindihan, setiap satu dengan medan kedua-dua lapisan. Garisan dan titik dipotong mengikut poligon. |
| Kesatuan | Kedua-dua lapisan poligon dipotong sepanjang tepi satu sama lain: bahagian yang dikongsi membawa medan kedua-dua lapisan, selebihnya membawa medan satu lapisan (medan lapisan satu lagi kosong). |
| Padam | Poligon input dengan poligon tindihan dikeluarkan. Medan kekal bersama input. Ciri yang dipadam sepenuhnya ditinggalkan (panel mengira jumlahnya). |
| Larutkan | Menggabungkan poligon yang bersentuh atau bertindih, sama ada semuanya atau satu bentuk bagi setiap nilai medan. Menambah `COUNT` dan `AREA`. |

Nama medan yang dimiliki kedua-dua lapisan disimpan untuk lapisan pertama, dan nama lapisan kedua ditulis dengan `_2`. Ciri dalam satu lapisan tidak sepatutnya bertindih antara satu sama lain: jika ya, Kesatuan mengira pertindihan itu dalam kedua-duanya.

## Cantum

Cantum ruang menyalin atribut daripada lapisan **sumber** ke setiap ciri **sasaran** yang bertemu dengannya, dan memberikan lapisan baharu dengan bentuk sasaran. Pilih bila mereka bertemu: bersentuh atau bertindih, sasaran terletak di dalam poligon sumber, sasaran memegang ciri sumber, ciri sumber terdekat (dengan had pilihan), atau mana-mana ciri sumber dalam jarak tertentu.

Apabila beberapa ciri sumber sepadan, anda mengambil atribut ciri pertama (yang terdekat, bagi cantum terdekat dan cantum jarak; `DISTANCE` ditambah), atau **mengira dan menjumlahkan medan nombornya**: `COUNT`, dan `SUM_`, `MEAN_`, `MIN_`, `MAX_` bagi setiap medan nombor. Nyahtanda **Kekalkan ciri sasaran yang tidak sepadan** untuk meninggalkannya. Medan yang dicantum kosong di tempat yang tiada padanan, dan panel mengira yang tidak sepadan.

## Pilih

Taip soalan tentang atribut atau bentuk, tekan **Pilih**, dan ciri dilukis pada pelan bersama kiraannya, jadual dan jumlah luas, panjang atau nombor. Kemudian jadikan ia lapisan tersendiri, zum kepadanya, atau kosongkan pilihan.

| Anda boleh tulis | Contoh |
|---|---|
| Medan mengikut nama; guna "petikan" atau [kurungan] jika nama mengandungi ruang | `VALUE`, `"Lot Number"` |
| Nombor, 'teks', true, false, null | `Use_ = 'Res'` |
| `=` `!=` `<>` `<` `<=` `>` `>=` | `VALUE >= 250` |
| `contains` `startswith` `endswith` `like` `ilike` (teks tidak peka huruf besar; dalam `like`, `%` ialah mana-mana rentetan dan `_` ialah satu huruf) | `Notes contains 'corner'` |
| `is null`, `is not null` (nilai kosong dikira sebagai null) | `Notes is null` |
| `in (…)`, `not in (…)`, `between … and …` | `Use_ in ('Com', 'Ind')` |
| `+ - * /` dan kurungan | `VALUE / 2 > 100` |
| `and`, `or`, `not` | `Use_ = 'Res' and VALUE > 200` |
| Nilai bentuk `$area` `$perimeter` `$length` `$x` `$y` `$vertices` | `$area > 5000` |

Soalan yang tidak lengkap atau menamakan medan yang tiada dalam lapisan ditolak dengan ayat yang menyatakan di mana.

## Ukur

Menunjukkan jumlah luas dan perimeter, panjang atau bilangan lapisan, dan **menambah medan** padanya: `AREA` dan `PERIMETER` untuk poligon, `LENGTH` untuk garisan (panjang pada pelan), `X` dan `Y` untuk titik. Medan yang sudah wujud tidak sekali-kali ditimpa: yang baharu dinamakan `AREA_2`. Ini ialah satu langkah buat asal. **Statistik** memberikan kiraan, jumlah, min, maksimum dan minimum bagi medan nombor, secara pilihan untuk setiap nilai medan lain.

:::note
Pengiraan di sebalik alat ini dikerjakan dengan tangan dalam ujian (`node bin/test-civilcraft-gisanalysis.mjs`): contohnya, lot 100 kali 100 di bawah zon 100 kali 80 bersilang dalam 3,000 tambah 3,000, dan garisan 100 panjang yang ditampan sebanyak 10 ialah 2,000 tambah satu bulatan.
:::
