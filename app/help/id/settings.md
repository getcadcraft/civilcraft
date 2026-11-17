---
title: Pengaturan CivilCraft
summary: Pilih urutan kolom untuk baris titik yang disalin dan ditempel serta untuk menebak kolom sebuah berkas, cara titik yang ditempel diberi nomor, isi label titik, indikator sudut, pembesaran vertikal 3D, cara lintang dan bujur ditampilkan, dan apakah layer peta diambil dari internet.
keywords: pengaturan, preferensi, pnezd, penzd, urutan kolom, baris titik, beri nomor ulang, nomor titik, nomor awal, label titik, label, deskripsi, elevasi, kubus tampilan, ikon sumbu, penanda sudut, kompas, pembesaran vertikal, 3d, lintang, bujur, dms, derajat desimal, layer peta, internet, privasi
from: 64b9cb92
---

Buka {{ui:Pengaturan}} dengan ikon roda gigi di bilah aplikasi atau {{key:Mod+,}}. Tab pertama, {{ui:CivilCraft}}, memuat pengaturan yang menjadi milik aplikasi ini; {{ui:Umum}} memuat pengaturan yang dipakai bersama oleh setiap aplikasi CadCraft (tema, bilah alat, panel). Pengaturan CivilCraft hanya ada di dalam aplikasi: Anda mengubahnya di sini, dan peramban ini mengingatnya. {{ui:Atur ulang pengaturan CivilCraft}} mengembalikan setiap pengaturan ke nilai awalnya.

## Baris titik

**P, N, E, Z, D** (awal) atau **P, E, N, Z, D**: titik, utara, timur, elevasi, deskripsi, atau timur sebelum utara. Ini dipakai di tiga tempat:

- **Salin**: baris yang CivilCraft letakkan di papan klip sistem untuk spreadsheet.
- **Tempel**: baris yang ditempel dari spreadsheet atau berkas teks yang tidak memiliki baris judul.
- **Impor**: tebakan di dialog **Impor titik** bila sebuah berkas tidak memiliki baris judul (berkas dengan empat kolom dibaca sebagai PENZ, tiga kolom sebagai ENZ). Lihat [Format berkas titik](topic:point-file-formats).

Baris judul yang menamai kolomnya selalu menang, begitu juga pilihan dalam daftar **Kolom** di dialog impor.

## Nomor untuk titik yang ditempel

- **Pertahankan nomor kosong** (awal): titik yang ditempel mempertahankan nomornya bila tidak ada titik yang memilikinya; hanya titik yang bentrok yang mendapat nomor baru.
- **Selalu nomor baru**: setiap titik yang ditempel mendapat nomor baru, meskipun nomornya sendiri kosong.

**Nomor baru mulai dari**: biarkan kosong untuk menghitung dari satu lebih tinggi dari nomor tertinggi yang dipakai. Ketik sebuah angka, misalnya 5000, untuk memberi titik baru nomor mulai dari 5000; nomor yang sudah dipakai dilewati. Dua titik tidak pernah berbagi nomor dalam kedua kasus. Lihat [Pilih, salin, dan tempel titik survei](topic:copy-paste-points#point-numbers-never-clash).

## Label titik

Isi label titik saat {{ui:Label titik}} dihidupkan di bawah **Tampilan**: **Nomor**, **Nomor dan elevasi**, atau **Nomor, elevasi, dan deskripsi** (awal). Ekspor DXF, DWG, dan PDF menampilkan label yang sama dengan yang ada di layar.

## Indikator sudut

Apa yang muncul di sudut denah dan tampilan 3D: **Kubus tampilan** (awal), **Ikon sumbu**, atau **Tidak ada**.

- **Kubus tampilan** (kanan atas). Di denah ia menampilkan bagian atas, dengan cincin kompas: N adalah utara grid (ke atas pada denah). Klik sisi, tepi, atau sudut lain pada kubus, atau seretnya, dan [tampilan 3D](topic:site-3d) terbuka menghadap dari sana. {{ui:Beranda}} pada kubus denah memaskan denah.
- Pada tampilan 3D, kubus berputar bersama tampilan: klik sisi, tepi, atau sudut untuk melihat dari sana, seret kubus untuk mengorbit, seret cincin kompas untuk memutar tampilan terhadap vertikal, klik sebuah huruf untuk melihat dari sisi itu, dan gunakan {{ui:Beranda}} untuk tampilan iso seluruh lokasi. Saat melihat lurus ke sebuah sisi, panah kecil melangkah ke sisi berikutnya dan panah melengkung memutar tampilan seperempat putaran.
- **Ikon sumbu** (kiri bawah): penanda X kecil (timur) dan Y (utara) di denah, X, Y, dan Z (ke atas) di 3D.

## Pembesaran vertikal 3D

Seberapa jauh tampilan 3D meregangkan elevasi: **1×**, **2×** (awal), **3×**, **5×**, atau **10×**. Daftar pada bilah tampilan 3D adalah pengaturan yang sama, jadi mengubah salah satunya juga mengubah yang lain. Volume, profil, dan ekspor 3D tetap pada skala sebenarnya.

## Lintang dan bujur

Cara bilah status menampilkan lintang dan bujur penunjuk saat proyek memiliki sistem koordinat: **derajat, menit, dan detik** (awal, misalnya `30°18′00.00″ N`) atau **derajat desimal** (`30.300000° N`). Lihat [Atur sistem koordinat proyek](topic:coordinate-systems#latitude-and-longitude-in-the-status-bar).

## Layer peta dari internet

**Mati** (awal) atau **Hidup**. Saat hidup, CivilCraft meminta gambar area di layar dari server peta yang Anda tambahkan. Gambar Anda tetap berada di komputer ini; server melihat area tersebut dan alamat internet Anda. Saat mati, tidak ada server peta yang diminta apa pun, bahkan ketika proyek yang Anda buka menyebut salah satunya; gambar berkoordinat dari berkas tetap berfungsi dalam kedua kasus. Lihat [Tampilkan layer peta di bawah denah](topic:map-layers).

## Asisten

**Izinkan asisten AI dan skrip menggunakan CivilCraft** (mati di awal) memungkinkan asisten di komputer Anda menjangkau lokasi yang terbuka melalui CadCraft Studio: **Baca** menjelaskan lokasi dan memberikan titik, elevasi permukaan, stasiun, profil, volume, dan persil; **Edit** memungkinkannya memilih dan menambahkan titik survei; **Simpan** dan **Ekspor** memungkinkannya menyimpan proyek dan menulis LandXML atau DWG. **Folder yang boleh digunakan** (di Studio) adalah tempat ia boleh menyimpan dan mengekspor. **Aktivitas** mencantumkan panggilannya. Lihat [Biarkan asisten AI bekerja dengan lokasi Anda](topic:assistants).
