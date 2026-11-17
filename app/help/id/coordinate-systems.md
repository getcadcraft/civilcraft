---
title: Atur sistem koordinat proyek
summary: Tentukan sistem koordinat survei agar CivilCraft menampilkan lintang dan bujur, menempatkan file GIS dan layer peta, serta menulis file .prj. Pilih berdasarkan kode, nama, koordinatnya sendiri, atau dari file .prj.
keywords: sistem koordinat, crs, epsg, srid, state plane, spcs, utm, nad83, wgs 84, proyeksi, prj, wkt, datum, lintang, bujur, lat long, geografis, grid, georeferensi, georeferencing, atur sistem koordinat
from: 964250e2
---

Koordinat proyek hanyalah angka biasa sampai Anda menyebutkan artinya. Mengatur sistem koordinat **tidak pernah memindahkan apa pun**: ia hanya memberi tahu CivilCraft bahwa, misalnya, E 6,150,000 N 2,080,000 adalah koordinat state plane zona 6 California dalam US survey feet. Setelah CivilCraft mengetahuinya:

- bilah status menampilkan lintang dan bujur penunjuk,
- file GIS dalam sistem lain (shapefile, GeoJSON, GeoPackage, grid elevasi, LiDAR) dikonversi ke dalam proyek saat dibuka,
- layer peta dapat digambar di bawah denah ([Tampilkan layer peta di bawah denah](topic:map-layers)),
- ekspor ke format GIS membawa sistem tersebut (file `.prj` untuk shapefile, kode EPSG untuk GeoPackage dan GeoTIFF).

## Pilih sistem

1. Pilih {{ui:Koordinat}} di grup {{ui:GIS}} pada bilah alat. Dialog **Sistem koordinat** terbuka. Di bagian atasnya tertulis proyek saat ini berada dalam sistem apa, atau **Tidak ada — koordinat hanyalah angka**.
2. Temukan sistemnya dengan salah satu cara berikut:
   - **Cari**: ketik kode EPSG (`2277`, `EPSG:2277`) atau kata dari nama (`texas central`, `utm 14n`, `lambert-93`). Kode didaftar mulai dari yang Anda ketik; kata didaftar untuk sistem yang namanya memuat semua kata itu.
   - {{ui:Sistem yang cocok dengan koordinat ini}} (jika proyek memiliki titik atau permukaan): CivilCraft membaca bagian tengah proyek Anda dalam setiap sistem dari keluarga satuan proyek dan mendaftar sistem yang area penggunaannya memuat titik itu. Koordinat state plane biasanya cocok hanya dengan beberapa zona: proyek di Texas pada E 3,115,000 N 10,070,000 US survey feet cocok dengan empat varian Texas Central (NAD83, NAD83(2011), HARN, NSRS2007). Setiap entri menunjukkan di mana bagian tengah proyek Anda berada.
   - **Dekat (lintang, bujur)** dan {{ui:Sarankan}}: ketik lokasi tapaknya, misalnya `30.27, -97.74` atau `30°16′N 97°44′W`, dan CivilCraft mendaftar sistem proyeksi yang area-nya memuat lokasi itu, grid nasional dan negara bagian lebih dulu.
   - {{ui:Baca file .prj…}}: buka file `.prj` yang menyertai shapefile atau gambar. CivilCraft mencocokkannya dengan daftarnya berdasarkan perhitungan proyeksi (sehingga `.prj` yang menamai datum secara berbeda tetap menemukan sistem yang benar) dan memberi tahu sistem apa itu; jika tidak ada yang cocok persis, deskripsi file itu sendiri yang dipakai. Anda juga dapat menjatuhkan `.prj` ke dalam dialog, atau membuka atau menjatuhkan satu ke denah saja.
3. Klik sebuah sistem dalam daftar. Di bawah **Dipilih** ditampilkan nama, kode EPSG, satuan, seberapa baik datumnya terikat ke WGS 84, area penggunaannya dalam lintang dan bujur, serta di mana bagian tengah proyek Anda jatuh di dalamnya.
4. Biarkan **Grid** terpilih (untuk sebagian besar proyek; lihat [Koordinat tanah dan lokal](topic:ground-and-local-coordinates) untuk yang lain) dan pilih {{ui:Terapkan}}.

Bilah status sekarang menampilkan lintang dan bujur penunjuk di samping E dan N. Mengatur sistem adalah satu langkah urungkan: {{key:Mod+Z}} membatalkannya.

:::note
Satuannya harus sama: proyek dalam feet menerima sistem dalam US survey feet atau international feet, proyek dalam meter menerima sistem dalam meter. CivilCraft menjelaskan penolakan (misalnya "Proyek dalam feet tetapi sistem ini dalam meter…"). Proyek feet dengan sistem US survey foot memakai survey feet: "ft" proyek berarti foot milik sistem itu. Sistem geografis (lintang dan bujur, seperti WGS 84 itu sendiri) tidak dapat menjadi sistem proyek: gambar memerlukan easting dan northing.
:::

## Ubah atau hapus sistem

Buka {{ui:Koordinat}} lagi, pilih sistem lain dan pilih {{ui:Terapkan}}. Jika proyek memiliki titik atau desain, CivilCraft bertanya **Apakah koordinatnya sudah dalam … ?**

- {{ui:Ya — tidak ada yang berpindah}}: angka tetap seperti semula dan hanya artinya yang berubah. Gunakan ini ketika sistem lama dipilih secara keliru.
- {{ui:Tidak — konversikan}}: setiap titik survei, breakline, batas, PI alinyemen, sudut pad dan struktur dikonversi dari sistem lama ke sistem baru, dalam satu langkah urungkan. Permukaan yang dibaca dari LandXML sebagai segitiga tidak dapat dikonversi; bangun ulang dari titik-titik terlebih dahulu.

{{ui:Buang sistem}} menghapus sistem (tidak ada yang berpindah). Layer GIS yang sudah ada dalam proyek tetap di tempatnya.

## Lintang dan bujur di bilah status

Selama proyek memiliki sistem, bilah status menampilkan lintang dan bujur penunjuk pada WGS 84, misalnya `30°18′00.00″ N  97°42′00.00″ W`. Pilih derajat desimal sebagai gantinya di bawah {{ui:Pengaturan}}, {{ui:CivilCraft}}, **Lintang dan bujur** ([Pengaturan CivilCraft](topic:settings)). Dengan koordinat tanah atau lokal, pembacaan melewati langkah itu terlebih dahulu, sehingga tepat untuk titik di bawah penunjuk.

## Seberapa baik pergeseran datum

Lintang, bujur, GeoJSON dan layer peta semuanya berada pada WGS 84. Ikatan setiap sistem ke WGS 84 ditampilkan dalam dialog:

| Yang dikatakan dialog | Artinya |
|---|---|
| WGS 84 itu sendiri | Tidak ada pergeseran sama sekali. |
| NAD83 dianggap WGS 84 | Keduanya berbeda satu atau dua meter di sebagian besar Amerika Utara, paling banyak beberapa meter. Baik untuk layer peta dan konteks lokasi; tidak untuk kontrol survei. |
| Diketahui sekitar *n* m (angka dari EPSG) | Pergeseran yang dipublikasikan; layer peta dan GeoJSON bisa meleset sekitar segitu. |
| Tidak diketahui untuk datum ini | Tidak ada pergeseran yang dipublikasikan tanpa file grid: layer peta dan GeoJSON bisa meleset ratusan meter. |
| Dari file pergeseran grid … | File pergeseran grid sedang digunakan (di bawah): dalam sekitar 10 cm dari NAD83 di dalam grid. |

Koordinat proyek Anda sendiri tidak pernah melalui pergeseran datum: hanya yang dikonversi ke atau dari lintang dan bujur. Datum vertikal dan model geoid tidak ditangani (elevasi tidak pernah dikonversi). Jika pergeseran terbaik memerlukan file grid, daftar memuat pergeseran terpublikasi yang lebih kasar dan dialog menampilkan akurasinya (sistem NAD27, misalnya, sekitar 20 m), sampai Anda menambahkan grid.

## File pergeseran grid

Untuk sistem NAD27, **File pergeseran grid** dalam dialog sistem koordinat menempatkan lintang dan bujur, file GIS dan layer peta dalam sekitar 10 cm dari NAD83, bukan sekitar 20 m:

- **Unduh** grid yang disarankan untuk area sistem (NADCON5 untuk Amerika Serikat daratan, NADCON untuk Alaska, NTv2 untuk Kanada) dari cdn.proj.org, server grid publik PROJ. Hanya nama file grid yang dikirim.
- Atau **Tambah file grid…** yang sudah Anda miliki: NTv2 (`.gsb`) atau grid PROJ GeoTIFF (`.tif`), hingga 20 MB.

Grid disimpan dalam file proyek, sehingga ikut bersama proyek. Bagian ini menyatakan apakah bagian tengah proyek berada di dalam grid: di luar grid, tidak ada pergeseran yang diterapkan sama sekali, jadi gunakan grid yang mencakup tapak. **Berhenti memakai grid** kembali ke pergeseran kasar. Setiap perubahan adalah satu langkah: {{key:Mod+Z}} membatalkannya.

Layer GIS yang sudah ada dalam proyek tetap di tempatnya ketika grid berubah; impor ulang untuk menempatkannya melalui grid. Koordinat proyek tidak pernah berpindah.

## Yang diperiksa

- Setiap konversi dibandingkan dengan PROJ (pyproj 3.7.1 dengan PROJ 9.5.1), pustaka koordinat yang paling banyak dipakai program GIS, pada lebih dari 330 sistem: state plane dalam US survey feet dan feet, UTM utara dan selatan, Lambert-93, British National Grid, GDA2020 MGA, New Zealand Transverse Mercator dan web Mercator di antaranya. Easting dan northing sepakat hingga 1 cm dengan pergeseran datum yang sama (kebanyakan jauh di bawah 1 mm), dan perhitungan proyeksi sepakat dengan definisi PROJ sendiri hingga 1 cm.
- File `.prj` yang ditulis PROJ dalam dua bentuk umum (ESRI dan OGC) dibaca kembali untuk 105 sistem: 208 dari 210 cocok dengan kode EPSG persisnya dan dua lainnya dengan sistem yang memiliki perhitungan sama pada elipsoid yang sama. File `.prj` yang ditulis CivilCraft dibaca oleh PROJ sebagai sistem yang sama. File `.prj` ESRI untuk sistem stereografis kutub (UPS, Alaska polar) tidak dapat dibaca; pilih sistem tersebut berdasarkan kode.
- Lintang dan bujur di bilah status sepakat dengan PROJ hingga 0.01″ di peramban.
