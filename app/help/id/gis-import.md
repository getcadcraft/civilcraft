---
title: Impor data GIS
summary: Bawa shapefile, GeoJSON, dan GeoPackage ke dalam proyek sebagai lapisan GIS, tempatkan melalui sistem koordinat yang tepat, lihat atributnya, dan gunakan untuk permukaan.
keywords: gis, label, beri label fitur, atribut pada denah, kml, kmz, google earth, shapefile, shp, dbf, prj, zip, geojson, geopackage, gpkg, impor, lapisan, atribut, sistem koordinat, epsg, lintang, bujur, kontur, persil, breakline, batas
from: f6b235cc
---

Dinas GIS kota dan kabupaten menyerahkan konteks lokasi dalam bentuk berkas GIS: persil, easement, kontur, utilitas, titik kontrol survei. CivilCraft membuka tiga jenis dari berkas ini sebagai **lapisan GIS** yang berada di bawah desain Anda di denah.

| Berkas | Yang dibuka |
|---|---|
| Shapefile | `.shp` bersama `.shx`, `.dbf`, `.prj`, dan `.cpg` (pilih semuanya), atau `.zip` tempat mereka berasal. Zip yang memuat beberapa shapefile menghasilkan beberapa lapisan. |
| GeoJSON | Berkas `.geojson` (berkas `.json` yang baris pertamanya menyebut `FeatureCollection` atau `Feature` juga bisa). |
| GeoPackage | Berkas `.gpkg`. Setiap tabel fitur di dalamnya didaftar. |
| KML atau KMZ | Berkas `.kml` (dari Google Earth atau peta web), atau `.kmz` yang dizip. Setiap folder menjadi satu lapisan (dibagi menjadi titik, garis, dan poligon jika memuat beberapa jenis); nama placemark, deskripsi, dan data tambahan menjadi atributnya. Tinggi dalam meter dan dalam lintang serta bujur, seperti pada GeoJSON. |

Titik, multititik, garis, poligon berlubang, dan bentuk multi-bagian dibaca, beserta elevasinya (z) jika berkas memilikinya. Nilai pengukuran (M) diabaikan. Grid elevasi dan LiDAR dibuka dengan cara yang sama: lihat [Grid elevasi dan LiDAR](topic:elevation-grids-and-lidar).

## Buka berkas

1. Klik {{ui:Impor}} di grup **GIS** (atau {{ui:Buka}}), pilih berkasnya, atau letakkan di denah. Berkas dibaca di komputer ini; tidak ada yang diunggah.
2. Dialog **Impor data GIS** mendaftar setiap lapisan yang ditemukan: jenisnya, jumlah fitur (dan berapa yang tanpa geometri), jumlah kolom atribut, serta sistem koordinat yang disebut berkas. Hapus centang lapisan yang tidak Anda inginkan.
3. Baca bagian **Sistem koordinat** (di bawah) dan baris **Yang akan terjadi**, lalu klik {{ui:Impor}}.
4. Lapisan muncul di denah dan di bawah **Lapisan GIS** pada panel kiri. Impor adalah satu langkah: {{key:Mod+Z}} membatalkannya.

Berkas besar menampilkan baris progres di atas denah dengan tombol {{ui:Batal}}.

## Sistem koordinat

Berkas GIS menyatakan lokasinya melalui sistem koordinat (`.prj` pada shapefile, tabel referensi spasial pada GeoPackage; GeoJSON selalu lintang dan bujur). CivilCraft mengonversi setiap lapisan dari sistemnya sendiri ke sistem proyek. Ia tidak pernah menebak:

- **Proyek memiliki sistem koordinat** (diatur di {{ui:Koordinat}}): setiap lapisan dengan sistemnya sendiri dikonversi ke dalamnya, termasuk penyesuaian tanah atau lokal. Berkas tanpa `.prj` mendapat dua pilihan: **Sama dengan proyek** (angkanya dimuat apa adanya) atau **Pilih sistem berkas**.
- **Proyek tidak memiliki sistem, dan berkas berada dalam sistem terproyeksi dengan satuan proyek Anda** (misalnya zona state plane dalam US survey ft untuk proyek kaki): dialog menawarkan **Gunakan sistem itu sebagai sistem koordinat proyek**. Ini diatur dalam langkah urungkan yang sama dengan impor. Tidak ada yang di proyek bergerak; sistem hanya menyatakan arti angkanya. Anda dapat memilih sistem lain untuk proyek sebagai gantinya, dan lapisan dikonversi ke dalamnya.
- **Proyek tidak memiliki sistem, dan berkas berada dalam lintang dan bujur** (setiap GeoJSON) **atau dalam satuan lain**: {{ui:Impor}} tetap abu-abu sampai Anda memilih sistem koordinat proyek. Pemilih mulai dari dekat data.
- **Baik proyek maupun berkas tidak menyebut sistem**: angkanya dimuat apa adanya, dan dialog menyatakannya.

Elevasi juga dikonversi: tinggi GeoJSON dalam meter (standar GeoJSON menyatakannya); tinggi berkas lain diambil dalam satuan sistemnya sendiri.

:::warning
Posisi dalam berkas GeoJSON di luar bujur ±180° atau lintang ±90° bukan lintang dan bujur. Fitur tersebut dibuang dan dialog menyebutkan jumlahnya. Berkas seperti ini biasanya berupa berkas terproyeksi yang disimpan tanpa sistemnya; minta ulang, atau minta shapefile dengan `.prj`-nya.
:::

NAD83 diperlakukan sama dengan WGS 84 (sistem yang dipakai GeoJSON); keduanya berbeda beberapa meter di Amerika Utara, sehingga data GeoJSON dapat meleset sejauh itu. Jika pergeseran terbaik memerlukan berkas grid (misalnya NADCON untuk NAD27), CivilCraft menggunakan pergeseran kasar yang dipublikasikan, dan dialog sistem koordinat menunjukkan seberapa kasar (untuk NAD27, sekitar 20 m), sampai Anda menambahkan grid: lihat [Berkas pergeseran grid](topic:coordinate-systems).

## Lapisan GIS

Setiap baris di bawah **Lapisan GIS** memiliki:

- kotak centang untuk menampilkan atau menyembunyikan lapisan (lapisan tersembunyi juga tidak dipilih);
- warnanya, dipilih dari daftar;
- menu (tiga titik) dengan {{ui:Zoom ke}}, {{ui:Gunakan untuk permukaan…}}, {{ui:Ganti nama…}}, dan {{ui:Buang}}.

Menampilkan, menyembunyikan, mengubah warna, mengganti nama, dan membuang adalah langkah urungkan. Lapisan GIS disimpan dalam berkas proyek dan muncul kembali saat Anda membukanya. Lapisan ini juga ikut dalam plot PDF denah serta ekspor DXF dan DWG-nya, masing-masing pada lapisan bernama `GIS-` dan nomornya.

## Beri label fitur dari atribut

Di menu {{ui:Lainnya}} lapisan (tiga titik di **Lapisan GIS**), pilih kolom di bawah **Beri label dengan**: setiap fitur menampilkan nilainya di denah, dalam warna lapisan. Titik diberi label di samping titik, garis di sepanjang tengah bagian terpanjangnya (diputar agar terbaca dari kiri ke kanan), dan poligon di pusatnya. Angka ditampilkan hingga tiga desimal. Label setinggi 1.8 mm di atas kertas pada skala apa pun, dan ikut masuk ke plot PDF, DXF, dan DWG. Pilih **Tanpa label** untuk menghapusnya; setiap perubahan adalah satu langkah ({{key:Mod+Z}} membatalkannya). Sebuah lapisan memberi label paling banyak 5,000 fitur.

## Lihat sebuah fitur

Dengan {{ui:Pilih}} aktif, klik sebuah fitur. **Properti** menampilkan lapisannya, fitur yang mana, bentuknya (bagian, lubang, simpul), elevasinya, berkas asalnya dan sistem koordinat berkas itu, lalu setiap atribut dalam tabel. Atribut hanya-baca: CivilCraft menampilkan data GIS sebagaimana adanya, dan tidak mengeditnya.

Titik mengalahkan garis jika keduanya berada di bawah penunjuk; di dalam poligon, poligon terkecil yang dipilih.

## Gunakan untuk permukaan

Buka menu lapisan dan pilih {{ui:Gunakan untuk permukaan…}} (atau tombol di **Properti**). Yang ditawarkan bergantung pada lapisan:

| Lapisan | Dapat menjadi |
|---|---|
| Garis dengan elevasi (garis 3D) | Breakline pada elevasinya sendiri |
| Garis tanpa elevasi tetapi dengan kolom angka (kontur) | Breakline pada elevasi di kolom yang Anda pilih |
| Poligon | Batas permukaan (poligon yang dipilih, atau yang terbesar), atau breakline di sepanjang tepinya |
| Titik dengan elevasi, atau dengan kolom elevasi | Titik survei, dideskripsikan dengan nama lapisan sehingga membentuk grup titik |

Setiap penggunaan adalah satu langkah urungkan yang menyalin geometri ke dalam proyek; lapisannya sendiri tetap seperti semula. Elevasi diambil dalam satuan proyek.

## File titik dengan lintang dan bujur

Berkas titik yang header-nya menyebut kolom **latitude** dan **longitude** (`lat`, `latitude`, `lon`, `long`, `longitude`) dibaca sebagai derajat, bukan sebagai northing dan easting. Dialog impor menyatakannya. Pada {{ui:Impor}}, titik-titik dikonversi ke sistem koordinat proyek; proyek tanpa sistem akan meminta Anda memilihnya terlebih dahulu. Derajat tidak pernah dimuat sebagai kaki. Baris di luar lintang ±90° atau bujur ±180° ditolak beserta alasannya. Kolom elevasi diambil apa adanya, dalam satuan proyek.

## Berkas LandXML yang menyebut sistem koordinat

Ketika berkas LandXML yang Anda buka memiliki elemen `CoordinateSystem` (kode EPSG, deskripsi WKT, atau nama sistem), CivilCraft menawarkannya sebagai sistem koordinat proyek. Tidak ada yang bergerak jika Anda menerimanya; sistem hanya menyatakan arti angkanya.

## Yang sudah diperiksa

- Setiap pembaca dibandingkan dengan GDAL, pustaka yang dipakai kebanyakan program GIS untuk membaca berkas ini, pada berkas yang ditulis GDAL: shapefile dari setiap jenis dengan dan tanpa elevasi, garis multi-bagian, poligon berlubang, geometri kosong, atribut teks, angka, tanggal, dan benar/salah, teks UTF-8 dan Windows-1252 dengan dan tanpa `.cpg`, zip beberapa shapefile, GeoJSON dengan setiap jenis geometri, dan GeoPackage dengan empat tabel. Setiap geometri, elevasi, dan atribut cocok.
- Posisi yang dikonversi dari lintang dan bujur, serta dari UTM, cocok dengan PROJ (pustaka proyeksi di balik GDAL) hingga 3 mm.
- Berkas rusak (terpotong, ukurannya tidak sesuai, zip rusak, GeoPackage rusak) menghasilkan satu pesan sederhana; tidak ada yang macet.
- Belum ada yang dibuka di program GIS lain, dan geodatabase file, KML, serta KMZ belum dibaca (lihat [Belum dibuat](topic:not-built-yet)).
