---
title: Grid elevasi dan LiDAR
summary: Bangun tanah yang ada dari DEM (GeoTIFF atau grid ASCII) atau titik LiDAR (LAS, LAZ) — pilih area, jarangkan data, pilih kelas, dan periksa satuan elevasi — lalu kembalikan permukaan sebagai grid elevasi GeoTIFF.
keywords: dem, dtm, grid elevasi, geotiff, tif, grid ascii, asc, lidar, las, laz, point cloud, kelas, tanah, penjarangan, nodata, raster, ekspor geotiff, gis
from: c8b2d18a
---

Data elevasi publik datang dengan dua cara: **grid elevasi** (DEM: satu elevasi per sel persegi, biasanya GeoTIFF `.tif` atau grid ASCII `.asc`) dan **titik LiDAR** (jutaan pantulan laser dalam file `.las`, atau `.laz` jika dikompresi). CivilCraft mengubah keduanya menjadi titik survei atau permukaan, di dalam browser: tidak ada yang diunggah.

## Buka file

1. Klik {{ui:Buka}} (atau {{ui:Impor}} di grup GIS) dan pilih file, atau seret ke denah. Untuk grid ASCII, pilih juga file `.prj`-nya agar CivilCraft mengetahui sistem koordinatnya.
2. Dialog impor menampilkan apa yang dikatakan file tentang dirinya: ukuran, sel atau titik, sistem koordinatnya, lokasinya dalam lintang dan bujur, dan rentang elevasinya. Untuk LiDAR, file dibaca sekali penuh untuk menghitung **kelas** (bilah kemajuan menunjukkan sejauh mana; {{ui:Batal}} menghentikannya).

GeoTIFF dengan tiga atau empat band (merah, hijau, biru) adalah gambar, bukan elevasi: ia masuk ke layer peta.

## Pilih yang akan diimpor

- **Area**: {{ui:Batas proyek ditambah margin}} (ketik margin), {{ui:Yang ditampilkan denah sekarang}}, atau {{ui:Seluruh file}}. Hanya bagian itu dari file yang dibaca.
- **Jarangkan ke**: jarak antara titik yang Anda dapatkan, dalam satuan proyek. Garis di bawah pengaturan menunjukkan berapa banyak titik yang dihasilkan saat Anda mengetik. Untuk grid, CivilCraft mengambil setiap sel kedua, ketiga … sehingga elevasinya tetap persis seperti file; ia tidak pernah merata-ratakan sel. Untuk LiDAR, area dibagi menjadi kotak sebesar jarak itu dan satu titik diambil per kotak: {{ui:Titik terdekat ke pusat setiap sel}} (bawaan), {{ui:Titik terendah di setiap sel}} (baik ketika file tidak memiliki kelas tanah: tanahnya berada di bawah pepohonan), atau {{ui:Rata-rata titik di setiap sel}}.
- **Kelas** (LiDAR): tanah (kelas 2) dicentang bila file memilikinya; bangunan, pohon, dan noise tidak diambil. Jika tidak ada kelas tanah, semua kelas dicentang, dan dialog memberitahukannya.
- **Tanah** (LiDAR, 0.8): awan drone tidak memiliki kelas tanah. Jika file tidak memilikinya, dialog dimulai dengan {{ui:Temukan tanah sendiri (awan drone, tanpa kelas tanah)}}: setiap kelas kecuali noise dibaca, titik terendah di setiap sel diambil, lalu CivilCraft mengeluarkan bangunan, pohon, dan titik rendah yang menyimpang dengan filter morfologi progresif (Zhang dkk., 2003) yang dapat Anda atur: **Objek terbesar untuk dikeluarkan** (lebar bangunan terbesar; jendela tumbuh hingga menutupinya; 0 berarti 20 sel) dan **Kemiringan tanah tercuram**. Pekerjaan dilakukan pada grid titik terendah, sehingga awan berisi puluhan juta titik tidak lebih mahal daripada jumlah selnya (penjarangan adalah satu kali pembacaan streaming). Jarak adalah sel: sel yang lebih kasar lebih cepat dan lebih sedikit melewatkan objek kecil daripada yang Anda kira; sel yang lebih halus mempertahankan lebih banyak detail tanah. Laporan menyebutkan berapa titik yang disimpan sebagai tanah, berapa sel yang dikeluarkan sebagai objek, dan berapa titik rendah yang menyimpang dibuang. Pada survei drone 300 m buatan dengan lima bangunan, 70 pohon, dan 200 pencilan rendah, titik yang disimpan berada dalam 3 cm dari medan sebenarnya dan tidak ada atap atau tajuk yang tersimpan.
- **Elevasi dalam file**: meter, kaki, atau kaki survei AS. Jika file menyatakannya, satuannya sudah dipilih. Jika tidak, Anda harus memilih: dialog menampilkan rentang elevasi dalam kedua satuan agar Anda dapat melihat mana yang masuk akal untuk lokasi.
- **Impor sebagai** (hanya grid): {{ui:Titik survei (deskripsi DEM)}}, atau {{ui:Permukaan itu sendiri (grid segitiga)}}.

Satu impor memuat paling banyak 500.000 titik. Jika pilihan menghasilkan lebih banyak, dialog menyebutkan berapa selisihnya dan jarak apa yang akan muat, dan {{ui:Impor}} tetap nonaktif.

Klik {{ui:Impor}}. Bilah kemajuan menunjukkan pembacaan; {{ui:Batal}} menghentikannya dan tidak ada yang berubah.

:::warning
Satuan vertikal adalah jebakan yang umum. Banyak DEM state plane memiliki easting dan northing dalam kaki tetapi elevasi dalam meter. Periksa rentang yang ditampilkan dialog terhadap apa yang Anda ketahui tentang lokasi.
:::

## Yang Anda dapatkan

- **Titik survei**: diberi nomor setelah nomor titik tertinggi Anda, dengan deskripsi `DEM` (grid) atau `LIDAR`, sehingga membentuk satu grup titik di bawah **Titik** dan membangun permukaan seperti titik lainnya. Mengimpornya adalah satu langkah: {{key:Mod+Z}} mengeluarkannya lagi.
- **Permukaan itu sendiri**: TIN grid, dua segitiga per sel, dibagi pada diagonal barat daya ke timur laut. Segitiga dengan sudut yang tidak memiliki data dibuang, sehingga lubang dalam data tetap menjadi lubang. Permukaan sama dengan grid di setiap titik grid dan merupakan bidang datar di dalam setiap segitiga di antaranya. Permukaan ini menggantikan permukaan proyek (dialog bertanya dulu); {{key:Mod+Z}} mengembalikan permukaan sebelumnya. Judul panel kiri bertuliskan **Permukaan (dari grid elevasi)**.

## Sistem koordinat

- Jika proyek memiliki sistem koordinat dan file menyebut sistem lain, setiap titik dikonversi ke sistem proyek (dan ke koordinat tanah atau lokal jika titik tersebut memilikinya).
- Jika proyek tidak punya sistem koordinat dan sistem file berada dalam satuan proyek (kaki atau meter), dialog menawarkan untuk menjadikannya sistem koordinat proyek, dalam langkah undo yang sama dengan titik-titiknya.
- Jika file dalam lintang dan bujur, atau dalam meter untuk proyek kaki, dialog meminta Anda memilih sistem koordinat proyek terlebih dahulu.
- Jika file tidak menyebutkannya, angkanya diambil sebagai koordinat proyek. Anda dapat memilih sistem file sebagai gantinya.

## Ekspor permukaan sebagai GeoTIFF

1. Klik {{ui:Ekspor}} di grup GIS.
2. Di bagian GeoTIFF, pilih permukaan (tanah yang ada atau permukaan yang sudah digrading) dan ukuran sel. Bawaannya berasal dari rata-rata sisi segitiga permukaan. Dialog menampilkan ukuran grid yang akan ditulis.
3. Klik {{ui:Unduh GeoTIFF}}.

File berupa satu band elevasi floating point 32-bit dalam satuan proyek, pada cakupan permukaan; sel di luar permukaan adalah "no data" (−3.4028235e38). Nilai setiap sel adalah elevasi permukaan di pusat sel. Koordinatnya adalah koordinat **grid**: proyek dalam koordinat tanah atau lokal dikonversi kembali ke grid. File menyebut sistem koordinat proyek dengan kode EPSG-nya; sistem tanpa kode EPSG tidak ditulis, dan dialog memperingatkan Anda untuk memberi tahu departemen GIS sistem mana yang dimaksud.

## Yang telah diperiksa

- Pembaca GeoTIFF dan grid ASCII diperiksa terhadap GDAL (melalui rasterio), pustaka yang paling banyak dipakai program GIS untuk membaca file ini: grid float 32-bit dan integer 16-bit, berubin dan berstrip, DEFLATE dan LZW, nodata, skala dan offset, pixel-is-point, grid UTM, grid state plane dalam kaki survei AS, dan grid lintang/bujur — setiap nilai sama.
- Pembaca LAS dan LAZ diperiksa terhadap laspy: LAS 1.2 dan 1.4, format titik 0, 1, 3, 6, 7, dan 8, dengan dan tanpa sistem koordinat, serta LAZ yang ditulis oleh backend yang kompatibel dengan LASzip — setiap titik sama.
- Koordinat yang dikonversi diperiksa terhadap PROJ hingga 1 mm.
- GeoTIFF hasil ekspor dibaca kembali oleh GDAL: sistem koordinat, posisi sel, nodata, satuan, dan nilai yang sama dengan permukaan hingga 0.0001.
- Belum pernah dibuka di program GIS atau CAD lain.

## Belum dibuat

- Perubahan datum vertikal (model geoid): elevasi dipakai sebagaimana file menyimpannya.
- Data bentuk gelombang, pantulan LiDAR selain menurut kelas, serta warna dan intensitas.
- Beberapa band, ikhtisar (overview), atau file lebih dari 200 MB.
- Menulis LAS atau LAZ dari permukaan atau dari alat ini (add-on [Point cloud](topic:point-clouds) menulis awan yang sudah dibersihkan sebagai LAS 1.4 atau LAZ).
