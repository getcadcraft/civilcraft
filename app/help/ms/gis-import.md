---
title: Import data GIS
summary: Bawa shapefile, GeoJSON dan GeoPackage ke dalam projek sebagai lapisan GIS, letakkannya melalui sistem koordinat yang betul, lihat atributnya, dan gunakannya untuk permukaan.
keywords: gis, label, label ciri, atribut pada pelan, kml, kmz, google earth, shapefile, shp, dbf, prj, zip, geojson, geopackage, gpkg, import, lapisan, atribut, sistem koordinat, epsg, latitud, longitud, kontur, lot, garis putus, sempadan
from: f6b235cc
---

Bandaraya dan jabatan GIS daerah menyerahkan konteks tapak sebagai fail GIS: lot, hak laluan, kontur, utiliti, kawalan ukur. CivilCraft membuka tiga jenis daripadanya sebagai **lapisan GIS** yang terletak di bawah reka bentuk anda pada pelan.

| Fail | Apa yang hendak dibuka |
|---|---|
| Shapefile | `.shp` bersama `.shx`, `.dbf`, `.prj` dan `.cpg` (pilih semuanya), atau fail `.zip` yang ia datang bersamanya. Zip yang mengandungi beberapa shapefile memberikan beberapa lapisan. |
| GeoJSON | Fail `.geojson` (fail `.json` yang baris pertamanya menyatakan `FeatureCollection` atau `Feature` juga berfungsi). |
| GeoPackage | Fail `.gpkg`. Setiap jadual ciri di dalamnya disenaraikan. |
| KML atau KMZ | Fail `.kml` (daripada Google Earth atau peta web), atau `.kmz` yang dizipkan. Setiap folder menjadi lapisan (dipecahkan kepada titik, garisan dan poligon apabila ia mengandungi beberapa jenis); nama penanda, huraian dan data lanjutannya menjadi atributnya. Ketinggian dalam meter dan latitud serta longitud, seperti dalam GeoJSON. |

Titik, multititik, garisan, poligon berlubang dan bentuk berbahagian banyak dibaca, dengan ketinggiannya (z) apabila fail mempunyainya. Nilai ukuran (M) ditinggalkan. Grid ketinggian dan LiDAR dibuka dengan cara yang sama: lihat [Grid ketinggian dan LiDAR](topic:elevation-grids-and-lidar).

## Buka fail

1. Klik {{ui:Import}} dalam kumpulan **GIS** (atau {{ui:Buka}}), pilih fail, atau lepaskannya pada pelan. Fail dibaca pada komputer ini; tiada apa dimuat naik.
2. Dialog **Import data GIS** menyenaraikan setiap lapisan yang dijumpai: jenisnya, berapa ciri (dan berapa tiada geometri), berapa medan atribut, dan sistem koordinat yang dinyatakan fail itu. Nyahtanda lapisan yang tidak anda mahu.
3. Baca bahagian **Sistem koordinat** (di bawah) dan baris **Apa yang akan berlaku**, kemudian klik {{ui:Import}}.
4. Lapisan muncul pada pelan dan di bawah **Lapisan GIS** dalam panel kiri. Import ialah satu langkah: {{key:Mod+Z}} membatalkannya.

Fail besar menunjukkan baris kemajuan di atas pelan dengan butang {{ui:Batal}}.

## Sistem koordinat

Fail GIS menyatakan kedudukan mereka melalui sistem koordinat (`.prj` shapefile, jadual rujukan ruang GeoPackage; GeoJSON sentiasa latitud dan longitud). CivilCraft menukar setiap lapisan daripada sistemnya sendiri kepada sistem projek. Ia tidak pernah meneka:

- **Projek mempunyai sistem koordinat** (ditetapkan dalam {{ui:Koordinat}}): setiap lapisan dengan sistemnya sendiri ditukar kepadanya, termasuk pelarasan tanah atau tempatan. Fail tanpa `.prj` mendapat dua pilihan: **Sama dengan projek** (nombornya dimuat seperti sedia ada) atau **Pilih sistem fail**.
- **Projek tiada sistem, dan fail berada dalam sistem terunjur dalam unit projek anda** (zon satah negeri dalam kaki ukur AS untuk projek kaki, contohnya): dialog menawarkan **Guna sistem itu sebagai sistem koordinat projek**. Ia ditetapkan dalam langkah buat asal yang sama dengan import. Tiada apa dalam projek bergerak; sistem itu hanya menyatakan maksud nombor. Anda boleh memilih sistem lain untuk projek sebaliknya, dan lapisan ditukar kepadanya.
- **Projek tiada sistem, dan fail berada dalam latitud dan longitud** (setiap GeoJSON) **atau dalam unit lain**: {{ui:Import}} dimalapkan sehingga anda memilih sistem koordinat projek. Pemilih bermula berhampiran data.
- **Kedua-dua projek dan fail tidak menamakan sistem**: nombor dimuat seperti sedia ada, dan dialog memberitahu begitu.

Ketinggian turut ditukar: ketinggian GeoJSON dalam meter (standard GeoJSON menyatakannya); ketinggian fail lain diambil dalam unit sistem mereka sendiri.

:::warning
Kedudukan dalam fail GeoJSON di luar ±180° longitud atau ±90° latitud bukanlah latitud dan longitud. Ciri tersebut ditinggalkan dan dialog memberitahu berapa banyak. Fail sebegini biasanya fail terunjur yang disimpan tanpa sistemnya; minta semula, atau minta shapefile dengan `.prj`nya.
:::

NAD83 dilayan sama seperti WGS 84 (sistem yang digunakan GeoJSON); kedua-duanya berbeza beberapa meter di Amerika Utara, jadi data GeoJSON boleh tersasar sebanyak itu. Jika anjakan terbaik memerlukan fail grid (NADCON bagi NAD27, contohnya), CivilCraft menggunakan anjakan kasar yang diterbitkan, dan dialog sistem koordinat menunjukkan betapa kasarnya (bagi NAD27, lebih kurang 20 m), sehingga anda menambah fail grid: lihat [Fail anjakan grid](topic:coordinate-systems).

## Lapisan GIS

Setiap baris di bawah **Lapisan GIS** mempunyai:

- kotak semak untuk memapar atau menyembunyikan lapisan (lapisan tersembunyi juga tidak dipilih);
- warnanya, dipilih daripada senarai;
- menu (tiga titik) dengan {{ui:Zum ke}}, {{ui:Guna untuk permukaan…}}, {{ui:Namakan semula…}} dan {{ui:Alih keluar}}.

Memapar, menyembunyi, menukar warna, menamakan semula dan mengalih keluar ialah langkah buat asal. Lapisan GIS disimpan dalam fail projek dan kembali apabila anda membukanya. Ia juga dikeluarkan bersama plot PDF pelan serta eksport DXF dan DWG, setiap satu pada lapisan yang dinamakan `GIS-` dan nombornya.

## Label ciri daripada atribut

Dalam menu {{ui:Lagi}} lapisan (tiga titik dalam **Lapisan GIS**), pilih medan di bawah **Label dengan**: setiap ciri menunjukkan nilainya pada pelan, dalam warna lapisan. Titik dilabel di sebelah titik, garisan sepanjang tengah bahagiannya yang terpanjang (diputar supaya boleh dibaca dari kiri ke kanan), dan poligon pada pusatnya. Nombor dipaparkan sehingga tiga titik perpuluhan. Label setinggi 1.8 mm di atas kertas pada sebarang skala, dan ia masuk ke plot PDF, DXF dan DWG. Pilih **Tiada label** untuk mengalihkannya; setiap perubahan ialah satu langkah ({{key:Mod+Z}} membatalkannya). Sesebuah lapisan melabel paling banyak 5,000 ciri.

## Lihat satu ciri

Dengan {{ui:Pilih}} dihidupkan, klik satu ciri. **Sifat** menunjukkan lapisannya, ciri yang mana, bentuknya (bahagian, lubang, bucu), ketinggiannya, fail asalnya dan sistem koordinat fail itu, kemudian setiap atribut dalam jadual. Atribut hanya boleh dibaca: CivilCraft memaparkan data GIS seperti yang diterima, ia tidak menyuntingnya.

Apabila kedua-dua titik dan garisan berada di bawah penuding, titik diutamakan; di dalam poligon, poligon terkecil dipilih.

## Guna untuk permukaan

Buka menu lapisan dan pilih {{ui:Guna untuk permukaan…}} (atau butang dalam **Sifat**). Apa yang ditawarkan bergantung pada lapisan:

| Lapisan | Boleh menjadi |
|---|---|
| Garisan dengan ketinggian (garisan 3D) | Garis putus pada ketinggian mereka sendiri |
| Garisan tanpa ketinggian tetapi dengan medan nombor (kontur) | Garis putus pada ketinggian dalam medan yang anda pilih |
| Poligon | Sempadan permukaan (poligon yang dipilih, atau jika tiada, yang terbesar), atau garis putus sepanjang tepinya |
| Titik dengan ketinggian, atau dengan medan ketinggian | Titik ukur, diterangkan dengan nama lapisan supaya membentuk kumpulan titik |

Setiap penggunaan ialah satu langkah buat asal yang menyalin geometri ke dalam projek; lapisan itu sendiri kekal seperti sedia ada. Ketinggian diambil dalam unit projek.

## Fail titik dengan latitud dan longitud

Fail titik yang pengepala lajurnya menamakan lajur **latitude** dan **longitude** (`lat`, `latitude`, `lon`, `long`, `longitude`) dibaca sebagai darjah, bukan sebagai utara dan timur. Dialog import menyatakannya. Pada {{ui:Import}}, titik ditukar kepada sistem koordinat projek; projek tanpa sistem meminta anda memilihnya dahulu. Darjah tidak sekali-kali dimuat sebagai kaki. Baris di luar ±90° latitud atau ±180° longitud ditolak dengan sebabnya. Lajur ketinggian diambil seperti sedia ada, dalam unit projek.

## Fail LandXML yang menamakan sistem koordinat

Apabila fail LandXML yang anda buka mempunyai elemen `CoordinateSystem` (kod EPSG, perihalan WKT atau nama sistem), CivilCraft menawarkannya sebagai sistem koordinat projek. Tiada apa yang bergerak jika anda menerimanya; sistem itu hanya menyatakan maksud nombor.

## Apa yang telah diperiksa

- Setiap pembaca dibandingkan dengan GDAL, perpustakaan yang kebanyakan program GIS gunakan untuk membaca fail ini, pada fail yang GDAL tulis: shapefile setiap jenis dengan dan tanpa ketinggian, garisan berbahagian banyak, poligon berlubang, geometri kosong, atribut teks, nombor, tarikh dan benar/palsu, teks UTF-8 dan Windows-1252 dengan dan tanpa `.cpg`, zip beberapa shapefile, GeoJSON dengan setiap jenis geometri, dan GeoPackage dengan empat jadual. Setiap geometri, ketinggian dan atribut dipadankan.
- Kedudukan yang ditukar daripada latitud dan longitud, serta daripada UTM, dipadankan dengan PROJ (perpustakaan unjuran di sebalik GDAL) dalam 3 mm.
- Fail rosak (terpotong, menipu saiznya, zip rosak, GeoPackage rosak) memberikan satu mesej ringkas; tiada yang tergantung.
- Tiada apa di sini yang telah dibuka dalam program GIS lain lagi, dan geodatabase fail, KML dan KMZ belum dibaca lagi (lihat [Belum dibina](topic:not-built-yet)).
