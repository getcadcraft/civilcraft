---
title: Referensi bilah alat
summary: Setiap tombol bilah alat di CivilCraft, apa fungsinya, pintasannya, dan kapan tombol itu redup atau menolak.
keywords: bilah alat, tombol, perintah, alat, file, ekspor, permukaan, desain, edit, tampilan, menu
from: 4c4352bc
---

Bilah alat berjalan di bagian atas aplikasi dalam tujuh grup. Setiap tombol menampilkan tooltip dan pintasannya saat Anda mengarahkan kursor padanya.

## File

| Tombol | Pintasan | Fungsinya |
|---|---|---|
| {{ui:Baru}} | tidak ada | Memulai proyek kosong. Menanyakan dulu jika ada perubahan yang belum disimpan. |
| {{ui:Buka}} | {{key:Mod+O}} | Membuka file titik (CSV, TXT), LandXML, atau proyek CivilCraft. |
| {{ui:Simpan}} | {{key:Mod+S}} | Mengunduh proyek sebagai `<name>.civilcraft.json`. |

## Ekspor

| Tombol | Pintasan | Fungsinya |
|---|---|---|
| {{ui:LandXML}} | tidak ada | Mengunduh `<name>.xml`: titik, permukaan, alinyemen, profil, dan jaringan pipa sebagai LandXML 1.2. "Belum ada yang diekspor." saat proyek kosong. |
| {{ui:DXF}} | tidak ada | Mengunduh `<name>.dxf`: garis denah sebagai R12 DXF. |
| {{ui:PDF}} | {{key:Mod+P}} | Membuka **Plot denah ke PDF**. "Belum ada yang bisa diplot." saat proyek kosong. |

## Permukaan

| Tombol | Pintasan | Fungsinya |
|---|---|---|
| {{ui:Breakline}} | {{key:B}} | Klik titik survei secara berurutan, {{key:Enter}} untuk selesai. Breakline mengambil elevasi titik-titik tersebut. |
| {{ui:Batas}} | {{key:O}} | Klik sudut-sudut batas luar, {{key:Enter}} untuk selesai. Menggantikan batas yang ada. |

Keduanya menampilkan "Belum ada permukaan: buka titik survei terlebih dahulu." saat belum ada permukaan.

## Desain

| Tombol | Pintasan | Fungsinya |
|---|---|---|
| {{ui:Alinyemen}} | {{key:A}} | Klik PI secara berurutan, {{key:Enter}} untuk selesai. |
| {{ui:Pad}} | {{key:G}} | Klik sudut-sudut pad, {{key:Enter}} untuk selesai. Seperti alat permukaan, ia memberi peringatan jika belum ada permukaan; pad hanya dapat digrading pada permukaan. |
| {{ui:Pipa}} | {{key:P}} | Klik bangunan dari hulu ke hilir (klik yang sudah ada untuk menyambungnya), {{key:Enter}} untuk selesai. |
| {{ui:Profil}} | {{key:R}} | Menampilkan atau menyembunyikan tampilan profil di bawah denah. |

## Edit

| Tombol | Pintasan | Fungsinya |
|---|---|---|
| {{ui:Urungkan}} | {{key:Mod+Z}} | Mengurungkan perubahan terakhir (hingga 200). Redup saat tidak ada yang bisa diurungkan. |
| {{ui:Ulangi}} | {{key:Mod+Y}} | Mengulangi apa yang diurungkan. Redup saat tidak ada yang bisa diulangi. |
| {{ui:Salin}} | {{key:Mod+C}} | Menyalin titik survei yang dipilih, dan menempatkannya di papan klip sebagai baris titik yang dapat dibaca spreadsheet. Redup sampai titik dipilih. |
| {{ui:Tempel}} | {{key:Mod+V}} | Menempelkan titik: titik mengikuti penunjuk, dan satu klik meletakkannya dengan nomor yang tidak dimiliki titik lain. Baris titik yang disalin di spreadsheet juga dapat ditempel. |
| {{ui:Lainnya}} | tidak ada | Membuka menu di bawah. |

Menu {{ui:Lainnya}}:

| Item | Pintasan | Fungsinya |
|---|---|---|
| {{ui:Potong}} | {{key:Mod+X}} | Menyalin titik yang dipilih lalu menghapusnya (satu langkah urungkan). |
| {{ui:Salin}} | {{key:Mod+C}} | Sama seperti tombol {{ui:Salin}}. |
| {{ui:Tempel}} | {{key:Mod+V}} | Sama seperti tombol {{ui:Tempel}}. |
| {{ui:Tempel di tempat yang sama}} | {{key:Mod+Shift+V}} | Menempelkan titik pada koordinatnya sendiri, dengan nomor yang tidak dimiliki titik lain. |
| {{ui:Duplikat}} | {{key:Mod+D}} | Salinan titik yang dipilih mengikuti penunjuk; klik di tempat ia diletakkan. Papan klip tidak diubah. |
| {{ui:Hapus}} | {{key:Delete}} | Menghapus titik survei yang dipilih, atau alinyemen, pad, bangunan (beserta pipanya), pipa, atau PVI yang dipilih. |
| {{ui:Pilih semua titik}} | {{key:Mod+A}} | Memilih setiap titik survei. |
| {{ui:Batalkan pilihan}} | {{key:Esc}} | Menghapus pilihan. |

Item yang tidak dapat bekerja saat ini akan redup, dan tooltip-nya menjelaskan alasannya. Rincian: [Pilih, salin, dan tempel titik survei](topic:copy-paste-points).

Urungkan mencakup perubahan pada desain, pengaturan permukaan, dan titik survei (tempel, potong, duplikat, hapus). Urungkan tidak mencakup pengaturan tampilan, dan membuka atau mengimpor file apa pun akan menghapusnya.

## GIS

| Tombol | Pintasan | Fungsinya |
|---|---|---|
| {{ui:Koordinat}} | tidak ada | Membuka dialog **Sistem koordinat**: nyatakan sistem yang dipakai proyek, atau gunakan koordinat tanah atau lokal. Lihat [Atur sistem koordinat proyek](topic:coordinate-systems) dan [Koordinat tanah dan lokal](topic:ground-and-local-coordinates). |
| {{ui:Impor}} | tidak ada | Mengimpor data GIS: shapefile, GeoJSON, GeoPackage, grid elevasi, dan LiDAR. Lihat [Impor data GIS](topic:gis-import). |
| {{ui:Ekspor}} | tidak ada | Mengekspor data as-built untuk departemen GIS. Lihat [Ekspor data as-built untuk GIS](topic:gis-export). |
| {{ui:Analisis}} | tidak ada | Membuka panel analisis GIS: buffer, overlay, spatial join, pilih berdasarkan atribut, ukur. Lihat [Analisis layer GIS](topic:gis-analysis). |
| {{ui:Tabel atribut}} | tidak ada | Di Permukaan › {{ui:Lainnya}}. Membuka tabel atribut layer GIS: urutkan, saring, pilih, sunting, tambah kolom, hitung, simpan sebagai CSV. Lihat [Bekerja dengan tabel atribut layer](topic:gis-table). |
| {{ui:Peta}} | tidak ada | Membuka dialog **Layer peta**: gambar bergeoreferensi, atau server peta yang Anda tambahkan, digambar di bawah denah. Lihat [Tampilkan layer peta di bawah denah](topic:map-layers). |

Alat GIS dimuat saat pertama kali Anda memakai salah satu tombol ini, membuka file GIS, atau membuka proyek yang memiliki sistem koordinat atau layer GIS.

## Tampilan

| Tombol | Pintasan | Fungsinya |
|---|---|---|
| {{ui:Pilih}} | {{key:V}} atau {{key:Esc}} | Klik untuk memilih alinyemen, pad, bangunan, pipa, dan titik ({{key:Shift}} dan klik atau seret menambahkan titik); seret grip untuk memindahkan PI, sudut pad, dan bangunan. |
| {{ui:Paskan}} | {{key:F}} | Memperbesar denah agar permukaan, titik, alinyemen, dan pad terlihat (di tampilan 3D: menampilkan semuanya). |
| {{ui:3D}} | {{key:D}} | Menampilkan lokasi dalam 3D di atas denah, atau kembali ke denah. Bilah di atas tampilan 3D mengatur tampilan, pembesaran vertikal, pewarnaan, dan apa yang ditampilkan, serta mengekspor GLB atau OBJ. Lihat [Lihat lokasi dalam 3D](topic:site-3d). |

## Tombol di panel

| Tombol | Di mana | Fungsinya |
|---|---|---|
| {{ui:Buka situs contoh}} | Kotak di denah kosong | Memuat survei contoh (membutuhkan koneksi, kecuali CivilCraft disimpan untuk penggunaan luring) |
| {{ui:Buang batas}} | Panel kiri, Permukaan | Menghapus batas luar |
| {{ui:Buang breakline gambar}} | Panel kiri, Permukaan | Menghapus setiap breakline yang digambar dengan alat (bukan grup breakline) |
| {{ui:Bangun ulang permukaan dari titik}} | Panel kiri, Permukaan (hanya permukaan LandXML) | Membuang TIN LandXML dan membangun dari titik; tidak dapat diurungkan |
| {{ui:Mulai dari tanah}} | Panel kanan, Alinyemen | Memulai profil desain dengan PVI di tanah pada setiap ujung |
| {{ui:Tampilan profil}} | Panel kanan, Alinyemen | Membuka tampilan profil untuk alinyemen ini |
| {{ui:Tambah PVI}} | Bilah profil | Saat ditekan, klik di profil akan menambahkan PVI |
| {{ui:Atur setiap invert dari aturan}} | Panel kanan, Jaringan pipa | Mengatur invert setiap pipa dari aturan |
| {{ui:Atur invert-nya dari aturan}} | Panel kanan, Pipa | Mengatur invert pipa ini dari aturan |
