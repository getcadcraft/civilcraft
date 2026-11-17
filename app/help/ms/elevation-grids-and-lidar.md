---
title: Grid ketinggian dan LiDAR
summary: Bina tanah sedia ada daripada DEM (GeoTIFF atau grid ASCII) atau titik LiDAR (LAS, LAZ) — pilih kawasan, jarangkan data, pilih kelas dan semak unit aras — dan pulangkan permukaan sebagai grid ketinggian GeoTIFF.
keywords: dem, dtm, grid ketinggian, geotiff, tif, grid ascii, asc, lidar, las, laz, awan titik, kelas, tanah, penjarangan, nodata, raster, eksport geotiff, gis
from: c8b2d18a
---

Data ketinggian awam datang dalam dua cara: **grid ketinggian** (DEM: satu ketinggian bagi setiap sel persegi, biasanya GeoTIFF `.tif` atau grid ASCII `.asc`) dan **titik LiDAR** (berjuta-juta pantulan laser dalam fail `.las`, atau `.laz` apabila dimampatkan). CivilCraft menukar mana-mana satu kepada titik ukur atau permukaan, dalam pelayar: tiada apa yang dimuat naik.

## Buka fail

1. Klik {{ui:Buka}} (atau {{ui:Import}} dalam kumpulan GIS) dan pilih fail, atau seret ke pelan. Bagi grid ASCII, pilih fail `.prj`-nya juga, supaya CivilCraft tahu sistem koordinatnya.
2. Kotak dialog import menunjukkan apa yang dinyatakan fail tentang dirinya: saiznya, sel atau titiknya, sistem koordinatnya, kedudukannya dalam latitud dan longitud, dan julat ketinggiannya. Bagi LiDAR, ia mula-mula membaca setiap titik sekali untuk mengira **kelas** (bar kemajuan menunjukkan sejauh mana ia; {{ui:Batal}} menghentikannya).

GeoTIFF dengan tiga atau empat jalur (merah, hijau, biru) ialah gambar, bukan ketinggian: ia dihantar ke lapisan peta sebaliknya.

## Pilih apa yang hendak dibawa masuk

- **Kawasan**: {{ui:Lingkungan projek dan margin}} (taip margin), {{ui:Apa yang dipaparkan pelan sekarang}}, atau {{ui:Keseluruhan fail}}. Hanya bahagian fail itu dibaca.
- **Jarangkan kepada**: jarak antara titik yang anda dapat, dalam unit projek. Baris di bawah tetapan menunjukkan berapa banyak titik yang diberikan semasa anda menaip. Bagi grid, CivilCraft mengekalkan setiap sel kedua, ketiga … jadi aras kekal tepat seperti fail; ia tidak pernah mengira purata sel. Bagi LiDAR, kawasan dipotong kepada petak bersaiz itu dan satu titik dikekalkan bagi setiap petak: {{ui:Titik yang paling hampir dengan pusat setiap sel}} (lalai), {{ui:Titik paling rendah dalam setiap sel}} (sesuai apabila fail tiada kelas tanah: tanah berada di bawah pokok) atau {{ui:Purata titik setiap sel}}.
- **Kelas** (LiDAR): tanah (kelas 2) ditandakan apabila fail mempunyainya; bangunan, pokok dan hingar dikecualikan. Apabila tiada kelas tanah, setiap kelas ditandakan, dan dialog menyatakannya.
- **Tanah** (LiDAR, 0.8): awan dron tiada kelas tanah. Apabila fail tiada, dialog bermula pada {{ui:Cari tanah sendiri (awan dron, tiada kelas tanah)}}: setiap kelas kecuali hingar dibaca, titik paling rendah dalam setiap sel dikekalkan, dan kemudian CivilCraft mengeluarkan bangunan, pokok dan titik rendah terpencil dengan penapis morfologi progresif (Zhang dan lain-lain, 2003) yang boleh anda arahkan: **Objek terbesar untuk dikeluarkan** (lebar bangunan terbesar; tingkap membesar sehingga menutupinya; 0 bermaksud 20 sel) dan **Cerun tanah paling curam**. Kerja dilakukan pada grid titik terendah, jadi awan berpuluh juta titik tidak menelan kos lebih daripada bilangan selnya (penjarangan ialah satu laluan aliran). Jarak ialah sel: sel yang lebih kasar lebih pantas dan terlepas objek kecil kurang daripada yang anda jangkakan, sel yang lebih halus mengekalkan lebih butiran tanah. Laporan menyatakan berapa banyak titik dikekalkan sebagai tanah, berapa banyak sel dikeluarkan sebagai objek dan berapa banyak titik rendah terpencil digugurkan. Pada tinjauan dron 300 m rekaan dengan lima bangunan, 70 pokok dan 200 titik terpencil rendah, titik yang dikekalkan berada dalam lingkungan 3 cm daripada rupa bumi sebenar dan tiada bumbung atau kanopi dikekalkan.
- **Aras dalam fail**: meter, kaki atau kaki tinjauan AS. Apabila fail menyatakannya, unitnya sudah dipilih. Apabila tidak, anda mesti memilih: dialog menunjukkan julat aras mengikut kedua-dua cara supaya anda dapat tahu yang mana masuk akal untuk tapak.
- **Import sebagai** (grid sahaja): {{ui:Titik ukur (DEM huraian)}}, atau {{ui:Permukaan itu sendiri (grid segi tiga)}}.

Satu import mengambil paling banyak 500,000 titik. Apabila pilihan akan memberi lebih, dialog menyatakan berapa banyak lebihnya dan jarak apa yang sesuai, dan {{ui:Import}} kekal tidak aktif.

Klik {{ui:Import}}. Bar kemajuan menunjukkan bacaan; {{ui:Batal}} menghentikannya dan tiada apa yang berubah.

:::warning
Unit menegak ialah perangkap yang biasa. Banyak DEM satah negeri mempunyai easting dan northing dalam kaki tetapi aras dalam meter. Semak julat yang dipaparkan dialog berbanding apa yang anda tahu tentang tapak.
:::

## Apa yang anda dapat

- **Titik ukur**: dinomborkan selepas nombor titik tertinggi anda, dengan huraian `DEM` (grid) atau `LIDAR`, supaya ia membentuk satu kumpulan titik di bawah **Titik** dan membina permukaan seperti mana-mana titik lain. Mengimportnya ialah satu langkah: {{key:Mod+Z}} membuat asalnya.
- **Permukaan itu sendiri**: TIN grid, dua segi tiga bagi setiap sel, dibahagi pada pepenjuru barat daya ke timur laut. Segi tiga yang bucunya tiada data ditinggalkan, jadi lompong dalam data kekal sebagai lompong. Permukaan sama dengan grid pada setiap titik grid dan ialah satah rata dalam setiap segi tiga di antaranya. Ia menggantikan permukaan projek (dialog bertanya dahulu); {{key:Mod+Z}} mengembalikan permukaan sebelumnya. Tajuk panel kiri menyatakan **Permukaan (daripada grid ketinggian)**.

## Sistem koordinat

- Jika projek mempunyai sistem koordinat dan fail menamakan sistem lain, setiap titik ditukar kepada sistem projek (dan kepada koordinat tanah atau setempatnya apabila ia mempunyainya).
- Jika projek tiada dan sistem fail berada dalam unit projek (kaki atau meter), dialog menawarkan untuk menjadikannya sistem koordinat projek, dalam langkah buat asal yang sama dengan titik.
- Jika fail berada dalam latitud dan longitud, atau dalam meter bagi projek kaki, dialog meminta anda memilih sistem koordinat projek dahulu.
- Jika fail tidak menyatakannya, nombornya diambil sebagai koordinat projek. Anda boleh memilih sistem fail sebaliknya.

## Eksport permukaan sebagai GeoTIFF

1. Klik {{ui:Eksport}} dalam kumpulan GIS.
2. Dalam bahagian GeoTIFF pilih permukaan (tanah sedia ada atau permukaan terbentuk) dan saiz sel. Lalai diambil daripada tepi segi tiga purata permukaan. Dialog menunjukkan saiz grid yang akan ditulisnya.
3. Klik {{ui:Muat turun GeoTIFF}}.

Fail ialah satu jalur aras titik apungan 32-bit dalam unit projek, meliputi luas permukaan; sel di luar permukaan ialah "tiada data" (−3.4028235e38). Nilai setiap sel ialah aras permukaan pada pusat sel. Koordinat ialah koordinat **grid**: projek dalam koordinat tanah atau setempat ditukar semula kepada grid. Fail menamakan sistem koordinat projek dengan kod EPSG-nya; sistem tanpa kod EPSG tidak ditulis, dan dialog memberi amaran supaya anda memberitahu jabatan GIS sistem yang mana ia.

## Apa yang telah diperiksa

- Pembaca grid GeoTIFF dan ASCII telah diperiksa terhadap GDAL (melalui rasterio), pustaka yang kebanyakan program GIS gunakan untuk membaca fail ini: grid float 32-bit dan integer 16-bit, berjubin dan berjalur, DEFLATE dan LZW, nodata, skala dan ofset, pixel-is-point, grid UTM, grid satah negeri dalam kaki tinjauan AS dan grid latitud/longitud — setiap nilai sama.
- Pembaca LAS dan LAZ telah diperiksa terhadap laspy: LAS 1.2 dan 1.4, format titik 0, 1, 3, 6, 7 dan 8, dengan dan tanpa sistem koordinat, dan LAZ yang ditulis oleh bahagian belakang yang serasi dengan LASzip — setiap titik sama.
- Koordinat yang ditukar telah diperiksa terhadap PROJ hingga 1 mm.
- GeoTIFF yang dieksport telah dibaca semula oleh GDAL: sistem koordinat, kedudukan sel, nodata, unit, dan nilai sama dengan permukaan hingga 0.0001.
- Tiada apa di sini yang telah dibuka dalam program GIS atau CAD lain.

## Belum dibina

- Perubahan datum menegak (model geoid): aras digunakan seperti yang dimiliki fail.
- Data bentuk gelombang, pantulan LiDAR selain mengikut kelas, warna dan keamatan.
- Beberapa jalur, gambaran keseluruhan, atau fail melebihi 200 MB.
- Menulis LAS atau LAZ daripada permukaan atau daripada alat ini (add-on [Awan titik](topic:point-clouds) menulis awan yang telah dibersihkan sebagai LAS 1.4 atau LAZ).
