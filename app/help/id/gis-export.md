---
title: Ekspor data as-built untuk GIS
summary: Serahkan titik survei, kontur, alinyemen, pad, pipa, dan bangunan ke dinas GIS kota atau kabupaten sebagai shapefile, GeoPackage, GeoJSON, atau KML, dalam koordinat grid dari sistem koordinat proyek.
keywords: gis, ekspor, kml, kmz, google earth, as-built, asbuilt, shapefile, shp, zip, geopackage, gpkg, geojson, pipa, bangunan, utilitas, kota, kabupaten, grid, tanah, epsg, prj
from: bba4fea5
---

Banyak kota dan kabupaten meminta data as-built dalam format GIS saat proyek ditutup: di mana pipa dan bangunan dipasang, elevasi akhir, dan as jalan. **GIS › Ekspor** menulis apa yang dimiliki CivilCraft sebagai lapisan GIS, satu untuk setiap jenis objek.

## Sebelum Anda mengekspor

1. Atur sistem koordinat proyek di {{ui:Koordinat}}. Dinas GIS perlu tahu di mana angkanya berada; tanpa sistem, berkasnya memuat angka proyek sendiri dan tidak menyebut sistem apa pun.
2. Periksa permukaan, alinyemen, pad, dan jaringan pipa sesuai cara yang Anda inginkan untuk diserahkan.
3. Tanyakan ke dinas format dan sistem koordinat apa yang mereka inginkan. Banyak yang masih meminta shapefile dalam zona state plane setempat; sistem yang lebih baru menerima GeoPackage.

## Ekspor

1. Klik {{ui:Ekspor}} di grup **GIS**.
2. Di bawah **Apa**, centang jenis yang akan dikirim. Setiap jenis menampilkan jumlah fiturnya; jenis yang belum ada isinya akan berwarna abu-abu.
3. Di bawah **Sebagai**, pilih format.
4. Baca catatan tentang koordinat dan satuan, lalu klik tombol unduh. Baris status menyebutkan apa yang dimasukkan dan nama kolom mana yang dipendekkan.

Dialog juga memuat ekspor grid elevasi ({{ui:Permukaan sebagai grid elevasi GeoTIFF}}); lihat [Grid elevasi dan LiDAR](topic:elevation-grids-and-lidar).

## Isi setiap jenis

| Jenis | Bentuk | Kolom |
|---|---|---|
| Titik survei | Titik dengan elevasi | `P` nomor titik, `N` northing, `E` easting, `Z` elevasi, `D` deskripsi |
| Kontur tanah asli, dari permukaan yang sudah digrading | Garis pada elevasinya | `ELEV` |
| Breakline | Garis dengan elevasi | `NAME` |
| Batas permukaan | Poligon (batas yang digambar, jika tidak ada, tepi permukaan) | `NAME` |
| Alinyemen | Sumbu jalan | `NAME`, `LENGTH`, `STA_START`, `STA_END` (stasiun sebagai angka biasa) |
| Pad | Poligon pada elevasi pad | `NAME`, `ELEV`, `AREA` |
| Garis daylight | Garis dengan elevasi (pad dan koridor) | `NAME` |
| Garis fitur koridor | Garis dengan elevasi: as, tepi perkerasan, bahu | `NAME`, `CODE` (CL, EOP_L, EOP_R, SH_L, SH_R) |
| Pipa | Garis dari invert atas ke invert bawah | `NAME`, `FROM`, `TO`, `DIA`, `DIA_UNIT`, `INV_UP`, `INV_DN`, `SLOPE` (persen), `LENGTH`, `NETWORK` |
| Bangunan | Titik pada rim | `NAME`, `RIM`, `INVERT` (invert pipa terendah di sana), `SUMP`, `DIA`, `DIA_UNIT` |
| Setiap lapisan GIS | Seperti saat diimpor | Kolomnya sendiri |

Panjang, stasiun, dan elevasi dalam satuan proyek (US survey ft atau m). Diameter pipa dan bangunan dalam inci untuk proyek dalam kaki dan dalam milimeter untuk proyek dalam meter; `DIA_UNIT` menunjukkan yang mana.

## Format

- **Shapefile**: satu `.zip` dengan shapefile untuk setiap jenis (`.shp`, `.shx`, `.dbf`), file `.cpg` yang menyatakan teksnya UTF-8, dan `.prj` yang menyebut sistem koordinat. Bentuk dengan elevasi ditulis sebagai tipe Z shapefile. Nama kolom yang lebih dari 10 karakter dipendekkan, sebagaimana diwajibkan format, dan baris status mencantumkannya.
- **GeoPackage**: satu file `.gpkg` dengan satu tabel untuk setiap jenis, sistem koordinat disimpan beserta kode EPSG-nya. Satu file, bukan banyak; nama kolom yang panjang tetap utuh.
- **KML** atau **KMZ** (KML yang dizip): satu file lintang dan bujur untuk Google Earth dan peta web, satu folder per jenis, setiap fitur berupa placemark yang dinamai dari kolom NAME dengan setiap kolom sebagai data tambahan; tinggi dalam meter (altitude mode absolute). Seperti GeoJSON, format ini memerlukan sistem koordinat proyek.
- **GeoJSON**: satu file lintang dan bujur (standar GeoJSON tidak mengizinkan yang lain) dengan setiap fitur membawa properti `kind` (`pipes`, `structures`, …) agar penerima dapat memisahkannya. Tinggi dikonversi ke meter, sebagaimana diminta standar; tinggi tetap pada datum vertikal proyek Anda (CivilCraft tidak memiliki model geoid). Proyek tanpa sistem koordinat tidak dapat mengekspor GeoJSON, dan dialog menjelaskan alasannya.

## Grid, bukan tanah

Dinas GIS menyimpan data mereka dalam koordinat **grid** dari sebuah sistem koordinat. Jika proyek Anda memakai koordinat tanah atau lokal (diatur di {{ui:Koordinat}}), setiap koordinat dikonversi kembali ke grid saat keluar: angka dalam berkas berbeda dari denah menurut faktor skala Anda (dan rotasi, untuk sistem lokal). Kolom titik `N` dan `E` juga berisi nilai grid. Dialog akan mengingatkan Anda.

:::tip
Kirim catatan singkat bersama berkas: sistem koordinat dan kode EPSG-nya, datum vertikal elevasi Anda, satuan, dan isi setiap berkas.
:::

## Yang sudah diperiksa

- Setiap berkas yang ditulis dibaca kembali oleh GDAL, pustaka yang dipakai kebanyakan program GIS untuk membaca berkas ini: setiap bentuk, elevasi, dan atribut, jumlah fitur, serta sistem koordinat sebagai kode EPSG-nya (`.prj` dan GeoPackage). Pembaca kami sendiri juga membacanya kembali dengan hasil yang sama.
- Berkas GeoJSON mengikuti RFC 7946: bujur sebelum lintang, tanpa anggota `crs`, cincin luar berlawanan arah jarum jam dan lubang searah jarum jam; posisi cocok dengan PROJ hingga 2 mm.
- Sebuah proyek koordinat tanah telah diekspor dan setiap titik diperiksa terhadap koordinat grid-nya.
- Belum ada yang dibuka di program GIS lain. Periksa penyerahan pertama dengan dinas sebelum mengandalkannya.
