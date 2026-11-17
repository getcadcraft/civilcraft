---
title: Tetapkan sistem koordinat projek
summary: Nyatakan sistem koordinat ukur itu, supaya CivilCraft menunjukkan latitud dan longitud, meletakkan fail GIS dan lapisan peta, serta menulis fail .prj. Pilih mengikut kod, mengikut nama, mengikut koordinat itu sendiri atau daripada fail .prj.
keywords: sistem koordinat, crs, epsg, srid, state plane, spcs, utm, nad83, wgs 84, unjuran, prj, wkt, datum, latitud, longitud, lat long, geografi, grid, georujukan, georeferencing, tetapkan sistem koordinat
from: 964250e2
---

Koordinat projek hanyalah nombor biasa sehinggalah anda menyatakan maksudnya. Menetapkan sistem koordinat **tidak pernah mengalihkan apa-apa**: ia memberitahu CivilCraft bahawa, sebagai contoh, E 6,150,000 N 2,080,000 ialah koordinat state plane zon 6 California dalam kaki ukur AS. Setelah ia tahu:

- bar status menunjukkan latitud dan longitud penunjuk,
- fail GIS dalam sistem lain (shapefile, GeoJSON, GeoPackage, grid ketinggian, LiDAR) ditukar ke dalam projek semasa ia dibuka,
- lapisan peta boleh dilukis di bawah pelan ([Tunjukkan lapisan peta di bawah pelan](topic:map-layers)),
- eksport ke format GIS membawa sistem itu (fail `.prj` untuk shapefile, kod EPSG untuk GeoPackage dan GeoTIFF).

## Pilih sistem

1. Pilih {{ui:Koordinat}} dalam kumpulan {{ui:GIS}} pada bar alat. Dialog **Sistem koordinat** dibuka. Di bahagian atas, ia menyatakan projek itu berada dalam sistem apa sekarang, atau **Tiada — koordinat hanyalah nombor**.
2. Cari sistem dengan salah satu cara berikut:
   - **Carian**: taip kod EPSG (`2277`, `EPSG:2277`) atau perkataan daripada nama (`texas central`, `utm 14n`, `lambert-93`). Kod disenaraikan bermula daripada yang anda taip; perkataan menyenaraikan sistem yang namanya mengandungi setiap perkataan.
   - {{ui:Sistem yang sesuai dengan koordinat ini}} (apabila projek mempunyai titik atau permukaan): CivilCraft membaca bahagian tengah projek anda dalam setiap sistem bagi keluarga unit projek dan menyenaraikan yang kawasan penggunaannya memuatkannya. Sistem state plane biasanya sesuai hanya dengan beberapa zon: projek di Texas pada E 3,115,000 N 10,070,000 kaki ukur AS sesuai dengan empat varian Texas Central (NAD83, NAD83(2011), HARN, NSRS2007). Setiap entri menunjukkan di mana bahagian tengah projek anda jatuh.
   - **Hampir (lat, long)** dan {{ui:Cadang}}: taip lokasi tapak, contohnya `30.27, -97.74` atau `30°16′N 97°44′W`, dan CivilCraft menyenaraikan sistem terunjur yang kawasannya memuatkannya, grid kebangsaan dan negeri dahulu.
   - {{ui:Baca fail .prj…}}: buka fail `.prj` yang datang bersama shapefile atau lukisan. CivilCraft memadankannya dengan senarainya melalui matematik unjuran (jadi fail `.prj` yang menamakan datum secara berbeza tetap menjumpai sistem yang betul) dan menyatakan sistem yang mana; apabila tiada yang tepat sepadan, huraian fail itu sendiri digunakan. Anda juga boleh menjatuhkan `.prj` pada dialog, atau membuka atau menjatuhkan satu pada pelan sahaja.
3. Klik satu sistem dalam senarai. Di bawah **Dipilih** ia menunjukkan nama, kod EPSG, unit, sejauh mana datumnya diikat kepada WGS 84, kawasan penggunaannya dalam latitud dan longitud, dan di mana bahagian tengah projek anda jatuh di dalamnya.
4. Biarkan **Grid** dipilih (kebanyakan projek; lihat [Koordinat tanah dan tempatan](topic:ground-and-local-coordinates) untuk yang lain) dan pilih {{ui:Guna}}.

Bar status kini menunjukkan latitud dan longitud penunjuk di sebelah E dan N. Menetapkan sistem ialah satu langkah buat asal: {{key:Mod+Z}} membatalkannya.

:::note
Unit mesti sepadan: projek dalam kaki memerlukan sistem dalam kaki ukur AS atau kaki antarabangsa, projek dalam meter memerlukan sistem dalam meter. CivilCraft menerangkan penolakan ("The project is in feet but this system is in meters…"). Projek kaki dengan sistem kaki ukur AS menggunakan kaki ukur: "ft" projek bermaksud kaki sistem itu. Sistem geografi (latitud dan longitud, seperti WGS 84 itu sendiri) tidak boleh menjadi sistem projek: lukisan memerlukan easting dan northing.
:::

## Tukar atau alih keluar sistem

Buka {{ui:Koordinat}} sekali lagi, pilih sistem lain dan pilih {{ui:Guna}}. Apabila projek mempunyai titik atau reka bentuk, CivilCraft bertanya **Adakah koordinat sudah berada dalam … ?**

- {{ui:Ya — tiada apa beralih}}: nombor kekal seperti sedia ada dan hanya maksudnya yang berubah. Gunakan ini apabila sistem lama dipilih secara silap.
- {{ui:Tidak — tukarkan}}: setiap titik ukur, garis putus, sempadan, PI penjajaran, bucu pelantar dan struktur ditukar daripada sistem lama ke sistem baharu, dalam satu langkah buat asal. Permukaan yang dibaca daripada LandXML sebagai segi tiga tidak boleh ditukar; bina semula daripada titik dahulu.

{{ui:Alih keluar sistem}} membuang sistem itu (tiada apa beralih). Lapisan GIS yang sedia ada dalam projek kekal di tempatnya.

## Latitud dan longitud dalam bar status

Semasa projek mempunyai sistem, bar status menunjukkan latitud dan longitud penunjuk pada WGS 84, contohnya `30°18′00.00″ N  97°42′00.00″ W`. Pilih darjah perpuluhan sebaliknya di bawah {{ui:Tetapan}}, {{ui:CivilCraft}}, **Latitud dan longitud** ([Tetapan CivilCraft](topic:settings)). Dengan koordinat tanah atau tempatan, bacaan melalui langkah itu dahulu, jadi ia betul untuk titik di bawah penunjuk.

## Sejauh mana baik anjakan datum

Latitud, longitud, GeoJSON dan lapisan peta semuanya pada WGS 84. Ikatan setiap sistem kepada WGS 84 ditunjukkan dalam dialog:

| Apa yang dikatakan dialog | Maksudnya |
|---|---|
| WGS 84 itu sendiri | Tiada anjakan langsung. |
| NAD83 dianggap sebagai WGS 84 | Kedua-duanya berbeza sebanyak satu atau dua meter di kebanyakan kawasan Amerika Utara, paling banyak beberapa meter. Sesuai untuk lapisan peta dan konteks tapak; bukan untuk kawalan ukur. |
| Diketahui kira-kira *n* m (angka EPSG) | Anjakan yang diterbitkan; lapisan peta dan GeoJSON boleh tersasar kira-kira sebanyak itu. |
| Tidak diketahui untuk datum ini | Tiada anjakan yang diterbitkan tanpa fail grid: lapisan peta dan GeoJSON mungkin tersasar sehingga ratusan meter. |
| Daripada fail anjakan grid … | Fail anjakan grid sedang digunakan (di bawah): dalam lingkungan kira-kira 10 cm daripada NAD83 di dalam grid. |

Koordinat projek anda sendiri tidak pernah melalui anjakan datum: hanya apa yang ditukar ke atau dari latitud dan longitud. Datum menegak dan model geoid tidak dikendalikan (aras tidak pernah ditukar). Di tempat anjakan terbaik memerlukan fail grid, senarai membawa anjakan diterbitkan yang lebih kasar dan dialog menunjukkan ketepatannya (sistem NAD27, sebagai contoh, kira-kira 20 m), sehingga anda menambah grid.

## Fail anjakan grid

Untuk sistem NAD27, **Fail anjakan grid** dalam dialog sistem koordinat meletakkan latitud dan longitud, fail GIS dan lapisan peta dalam lingkungan kira-kira 10 cm daripada NAD83 dan bukan kira-kira 20 m:

- **Muat turun** grid yang dicadangkan untuk kawasan sistem itu (NADCON5 untuk Amerika Syarikat bersebelahan, NADCON untuk Alaska, NTv2 untuk Kanada) daripada cdn.proj.org, pelayan grid awam PROJ. Hanya nama fail grid dihantar.
- Atau **Tambah fail grid…** jika anda sudah ada: NTv2 (`.gsb`) atau grid PROJ GeoTIFF (`.tif`), sehingga 20 MB.

Grid disimpan dalam fail projek, jadi ia ikut projek itu. Bahagian itu menyatakan sama ada bahagian tengah projek berada di dalam grid: di luar, tiada anjakan dikenakan langsung, jadi gunakan grid yang meliputi tapak. **Berhenti guna grid** kembali kepada anjakan kasar. Setiap perubahan ialah satu langkah: {{key:Mod+Z}} membatalkannya.

Lapisan GIS yang sudah ada dalam projek kekal di tempatnya apabila grid berubah; import semula untuk meletakkannya melalui grid. Koordinat projek anda tidak pernah beralih.

## Apa yang telah diperiksa

- Setiap penukaran dibandingkan dengan PROJ (pyproj 3.7.1 dengan PROJ 9.5.1), pustaka koordinat yang kebanyakan program GIS gunakan, pada lebih 330 sistem: state plane dalam kaki ukur AS dan kaki, UTM utara dan selatan, Lambert-93, British National Grid, GDA2020 MGA, New Zealand Transverse Mercator dan web Mercator antara yang lain. Easting dan northing sepadan hingga 1 cm dengan anjakan datum yang sama (kebanyakannya kurang daripada 1 mm), dan matematik unjuran sepadan dengan takrifan PROJ sendiri hingga 1 cm.
- Fail `.prj` yang ditulis oleh PROJ dalam kedua-dua bentuk biasa (ESRI dan OGC) dibaca semula untuk 105 sistem: 208 daripada 210 sepadan dengan kod EPSG tepat mereka dan dua yang lain dengan sistem yang mempunyai matematik sama pada elipsoid yang sama. Fail `.prj` yang ditulis CivilCraft dibaca oleh PROJ sebagai sistem yang sama. Fail `.prj` ESRI untuk sistem stereografik kutub (UPS, Alaska kutub) tidak boleh dibaca; pilih sistem tersebut mengikut kod.
- Latitud dan longitud dalam bar status sepadan dengan PROJ hingga 0.01″ dalam pelayar.
