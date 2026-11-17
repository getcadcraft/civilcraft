---
title: Format fail titik
summary: Susunan lajur yang dibaca CivilCraft, cara ia mencari pemisah dan baris pengepala, nama pengepala yang dikenalinya, dan cara setiap baris disemak.
keywords: pnezd, penzd, pnez, penz, nezd, enzd, nez, enz, csv, txt, pnt, xyz, format fail titik, lajur, pengepala, pemisah
from: 84fab42e
---

Fail titik ialah teks biasa, satu titik setiap baris. CivilCraft membacanya dalam pelayar; tiada apa-apa dimuat naik.

## Susunan lajur

Huruf menamakan lajur dari kiri ke kanan: **P** nombor atau nama titik, **N** utara, **E** timur, **Z** ketinggian, **D** huraian.

| Susunan | Lajur | Contoh baris |
|---|---|---|
| PNEZD | titik, utara, timur, ketinggian, huraian | `101,2080000.00,6150000.00,250.00,GRD` |
| PENZD | titik, timur, utara, ketinggian, huraian | `101,6150000.00,2080000.00,250.00,GRD` |
| PNEZ | titik, utara, timur, ketinggian | `101,2080000.00,6150000.00,250.00` |
| PENZ | titik, timur, utara, ketinggian | `101,6150000.00,2080000.00,250.00` |
| NEZD | utara, timur, ketinggian, huraian | `2080000.00,6150000.00,250.00,GRD` |
| ENZD | timur, utara, ketinggian, huraian | `6150000.00,2080000.00,250.00,GRD` |
| NEZ | utara, timur, ketinggian | `2080000.00 6150000.00 250.00` |
| ENZ | timur, utara, ketinggian | `6150000.00 2080000.00 250.00` |

Susunan tanpa P menomborkan titik 1, 2, 3 … mengikut susunan dalam fail. X ialah timur dan Y ialah utara.

## Pemisah

CivilCraft melihat 20 baris pertama dan memilih yang pertama daripada ini yang muncul pada sekurang-kurangnya 60% daripadanya: koma, tab, koma bertitik. Jika tidak, ia memisahkan mengikut jujukan ruang kosong.

- Dalam fail berpisah koma, tab dan koma bertitik, medan dalam tanda petik berganda boleh mengandungi pemisah (`"FL, NORTH"`), dan `""` di dalam petikan ialah satu tanda petik.
- Dalam fail berpisah ruang, huraian di hujung baris boleh mengandungi ruang: segala yang berada selepas lajur koordinat terakhir ialah huraian.
- Baris yang bermula dengan `#`, `;` atau `//`, dan baris kosong, dilangkau.
- Tanda susunan bait (BOM) di permulaan fail diabaikan.

## Baris pengepala

Baris pertama dianggap sebagai pengepala apabila kurang daripada dua medannya ialah nombor. Jika setiap medan pengepala ialah nama yang dikenali CivilCraft, susunan lajur diambil daripadanya ("daripada baris pengepala"). Nama dipadankan tanpa mengira huruf besar atau kecil, ruang, titik, garis bawah, sempang dan kurungan:

| Lajur | Nama yang dikenali |
|---|---|
| P | pt, pnt, point, point no, point number, number, no, id, name, pt#, point#, # |
| N | n, north, northing, y, y coord, lat, latitude |
| E | e, east, easting, x, x coord, lon, long, longitude |
| Z | z, elev, elevation, el, height, h, z coord, rl |
| D | d, desc, description, code, raw description, full description, note, notes, feature |

Jika mana-mana nama pengepala tidak dikenali, atau nama-nama itu tidak membentuk salah satu daripada lapan susunan, pengepala dilangkau dan susunan dianggarkan daripada bilangan lajur.

:::warning
Pengepala yang menamakan kedua-dua lajur latitud (`lat`, `latitude`) dan lajur longitud (`lon`, `long`, `longitude`) dibaca sebagai darjah, bukan sebagai utara dan timur. Pada {{ui:Import}} titik ditukar melalui sistem koordinat projek, dan projek tanpa sistem koordinat akan meminta anda memilihnya dahulu. Baris di luar ±90° latitud atau ±180° longitud ditolak. Lihat [Import data GIS](topic:gis-import#point-files-with-latitude-and-longitude).
:::

## Menganggar daripada bilangan lajur

Tanpa pengepala yang boleh digunakan dan dengan **Lajur** dibiarkan pada {{ui:Kesan}}:

- 5 lajur atau lebih: PNEZD.
- 4 lajur: PNEZ apabila lajur pertama ialah nombor bulat pada setiap baris sampel dan lajur keempat ialah nombor; sebaliknya NEZD.
- 3 lajur: NEZ.

PNEZD dan PENZD tidak dapat dibezakan daripada nombor. Anggaran mengikut **Baris titik** dalam [Tetapan CivilCraft](topic:settings): P, N, E, Z, D pada permulaan, atau P, E, N, Z, D (maka empat lajur dibaca sebagai PENZ dan tiga lajur sebagai ENZ). Dialog itu berkata "dianggarkan daripada bilangan lajur — semak sama ada utara dan timur tidak tertukar". Pilih susunan yang betul dalam **Lajur** jika pratonton kelihatan salah.

## Cara setiap baris disemak

- Baris boleh tidak mempunyai huraian.
- Utara dan timur mestilah nombor. Ketinggian boleh kosong (titik dikekalkan tetapi tidak digunakan dalam permukaan).
- Nombor titik boleh terdiri daripada sebarang teks (huruf juga, seperti `CP1`), tetapi tidak boleh kosong.
- Jika nombor titik berulang, baris pertama dikekalkan dan yang lain disenaraikan sebagai tidak dibaca.
- Huraian dikekalkan sehingga 200 aksara; aksara kawalan menjadi ruang.
- Sehingga 200 baris yang tidak dibaca dikekalkan untuk dialog (25 dipaparkan), dan kesemuanya dikira.

## Kumpulan titik

Kumpulan titik ialah perkataan pertama huraiannya dalam huruf besar. "GRD", "grd shot" dan "Grd" semuanya kumpulan GRD. Titik tanpa huraian berada dalam "(tiada huraian)". Lihat [Import titik tinjauan](topic:import-points).

## Menulis titik

CivilCraft belum mengeksport fail teks titik lagi. Titik dikeluarkan dalam LandXML (sebagai CgPoints), dalam fail projek, dan melalui {{ui:Eksport}} GIS sebagai shapefile, GeoPackage atau GeoJSON dengan medan P, N, E, Z dan D ([Eksport data as-built untuk GIS](topic:gis-export)). Lihat [Belum dibina](topic:not-built-yet).
