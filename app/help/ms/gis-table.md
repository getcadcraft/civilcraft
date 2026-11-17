---
title: Bekerja dengan jadual atribut lapisan
summary: Lihat setiap ciri lapisan GIS sebagai jadual, isih dan tapis, pilih baris dan ciri bersama, betulkan nilai, tambah medan, kira nilai baharu dan simpan jadual sebagai CSV.
keywords: jadual atribut, jadual, medan, lajur, baris, isih, tapis, ungkapan, pilih, sunting, kalkulator medan, kira, tambah medan, namakan semula medan, alih keluar medan, csv, eksport, gis, shapefile, geopackage, simbologi
from: fd9d6c11
---

Buka jadual lapisan daripada menu **tiga titik** dalam senarai Lapisan GIS ({{ui:Jadual atribut…}}), daripada Permukaan › Lagi › {{ui:Jadual atribut}}, atau dengan menaip `ATTRIBUTES`, `ATTTABLE` atau `TABLE`. Jadual dibuka di sebelah pelan dan kekal terbuka semasa anda bekerja. Hanya baris yang kelihatan dilukis, jadi lapisan dengan beribu ciri dibuka dan digulung dengan pantas.

## Isih, tapis dan pilih

- **Isih:** klik tajuk lajur. Klik kedua membalikkannya, dan klik ketiga mengembalikan susunan asal fail. Nilai kosong sentiasa kekal di bawah. Isihan hanya menukar apa yang anda lihat, bukan lapisan.
- **Tapis:** taip dalam kotak tapis. Ungkapan seperti `AREA > 500 and USE = 'Res'` mengekalkan baris yang benar (perkataan yang sama dengan tab Pilih dalam [Analisis lapisan GIS](topic:gis-analysis): `=`, `<`, `like`, `contains`, `is null`, `in`, `between`, `and`, `or`, `not`, `$area`, `$length`). Apa-apa yang bukan ungkapan, seperti `oak maple`, mencari perkataan itu dalam setiap lajur.
- **Pilih baris:** klik satu baris. Ctrl+klik menambah atau mengalih keluar satu, Shift+klik memilih satu julat, dan {{ui:Pilih baris yang dipaparkan}} mengambil setiap baris yang lulus tapisan. Ciri yang dipilih dilukis pada pelan, dan klik pada ciri di pelan memilih barisnya di sini.
- Dengan baris dipilih, anda boleh {{ui:Zum}} kepadanya, membuat **lapisan daripada pilihan**, dan membaca jumlah luas atau panjang pada baris status.

## Betulkan nilai

Klik dua kali sel (atau bergerak ke sana dengan kekunci anak panah dan tekan Enter), taip nilai baharu dan tekan Enter. Esc membiarkannya seperti asal. Nilai mesti sesuai dengan lajur: nombor sebagai nombor, tarikh sebagai `YYYY-MM-DD`, ya/tidak sebagai yes, no, true atau false. Nilai yang tidak sesuai ditolak dengan ayat dan tiada apa berubah. Kotak kosong menjadikan nilai itu kosong. Setiap suntingan ialah satu langkah buat asal: {{ui:Buat asal}} dan {{ui:Buat semula}} berada di bahagian bawah jadual, dan Ctrl+Z berfungsi pada pelan.

## Medan

Di bawah **Medan** anda boleh menambah medan (teks, nombor, tarikh atau ya/tidak), menamakan semula, atau mengalih keluar medan. Medan baharu bermula kosong. Penamaan semula dibawa sepanjang: medan label dan [gaya mengikut atribut](topic:gis-symbology) lapisan berpindah ke nama baharu, dan mengalih keluar medan menggugurkan label dan gaya yang menggunakannya. Setiap satu ialah satu langkah buat asal yang memulihkan semuanya.

## Kalkulator medan

Menulis nilai ke dalam setiap baris (atau hanya baris yang dipilih) daripada medan lain baris itu, geometrinya dan beberapa fungsi. Pilih medan sedia ada atau **Medan baharu…**, dan beri nama dan jenisnya. Tiada apa yang dijalankan sebagai kod: ungkapan dibaca oleh penghurai kecil dengan senarai fungsi yang tetap.

| Kumpulan | Perkataan |
|---|---|
| Nombor | `+ - * /`, kurungan, `abs round(x, digits) floor ceil sqrt pow min max` |
| Teks | `upper lower trim len substr(text, from, count) left right replace concat` (teks diletakkan dalam 'petikan tunggal'; nama medan yang mengandungi ruang diletakkan dalam "petikan berganda" atau [kurungan segi empat]) |
| Memilih | `if(test, then, else)`, `coalesce(a, b, …)`, `num(x)`, `str(x)` |
| Tarikh | `year month day` bagi nilai `YYYY-MM-DD` |
| Geometri | `$area $perimeter $length $x $y $vertices`, dalam unit projek |

Hasil yang tidak boleh disimpan dalam jenis medan (teks dalam medan nombor) dibiarkan kosong dan dikira dalam mesej. Membahagi dengan sifar memberikan nilai kosong. Contohnya, `round($area / 43560, 2)` menulis ekar daripada kaki persegi.

## Eksport

{{ui:Eksport CSV}} menyimpan baris yang anda lihat (selepas tapisan dan isihan) sebagai fail CSV UTF-8 dengan nama medan pada baris pertama. Teks yang bermula dengan `=`, `+`, `-` atau `@` mendapat tanda petik tunggal di hadapan supaya hamparan tidak menjalankannya sebagai formula. Untuk menyimpan lapisan itu sendiri, gunakan [Eksport data as-built untuk GIS](topic:gis-export).

## Had

Jadual menunjukkan lapisan dalam satu susunan isihan dan satu tapisan pada satu masa. Baris tidak boleh ditambah atau dipadam di sini (buat lapisan baharu daripada pilihan sebaliknya), geometri tidak disunting, dan jenis medan tidak boleh ditukar selepas ia dibuat.
