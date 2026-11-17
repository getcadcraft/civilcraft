---
title: Rujukan bar alat
summary: Setiap butang bar alat dalam CivilCraft, fungsinya, pintasannya, dan bila ia dimalapkan atau menolak.
keywords: bar alat, butang, arahan, alat, fail, eksport, permukaan, reka bentuk, sunting, paparan, menu
from: 4c4352bc
---

Bar alat berjalan merentasi bahagian atas aplikasi dalam tujuh kumpulan. Setiap butang menunjukkan tip alatnya dan pintasannya apabila anda menuding kursor padanya.

## Fail

| Butang | Pintasan | Fungsi |
|---|---|---|
| {{ui:Baharu}} | tiada | Memulakan projek kosong. Bertanya dahulu jika ada perubahan yang belum disimpan. |
| {{ui:Buka}} | {{key:Mod+O}} | Membuka fail titik (CSV, TXT), LandXML atau projek CivilCraft. |
| {{ui:Simpan}} | {{key:Mod+S}} | Memuat turun projek sebagai `<name>.civilcraft.json`. |

## Eksport

| Butang | Pintasan | Fungsi |
|---|---|---|
| {{ui:LandXML}} | tiada | Memuat turun `<name>.xml`: titik, permukaan, penjajaran, profil dan rangkaian paip sebagai LandXML 1.2. "Tiada apa-apa untuk dieksport lagi." apabila projek kosong. |
| {{ui:DXF}} | tiada | Memuat turun `<name>.dxf`: garisan pelan sebagai R12 DXF. |
| {{ui:PDF}} | {{key:Mod+P}} | Membuka **Plot pelan ke PDF**. "Tiada apa-apa untuk diplot lagi." apabila projek kosong. |

## Permukaan

| Butang | Pintasan | Fungsi |
|---|---|---|
| {{ui:Garis putus}} | {{key:B}} | Klik titik ukur mengikut urutan, {{key:Enter}} untuk selesai. Garis putus mengambil aras titik-titik itu. |
| {{ui:Sempadan}} | {{key:O}} | Klik bucu sempadan luar, {{key:Enter}} untuk selesai. Menggantikan sebarang sempadan. |

Kedua-duanya memaparkan "Tiada permukaan lagi: buka titik ukur dahulu." apabila tiada permukaan.

## Reka bentuk

| Butang | Pintasan | Fungsi |
|---|---|---|
| {{ui:Penjajaran}} | {{key:A}} | Klik PI mengikut urutan, {{key:Enter}} untuk selesai. |
| {{ui:Pelantar}} | {{key:G}} | Klik bucu pelantar, {{key:Enter}} untuk selesai. Seperti alat permukaan, ia memberi amaran apabila tiada permukaan; pelantar hanya digred pada permukaan. |
| {{ui:Paip}} | {{key:P}} | Klik struktur dari hulu ke hilir (klik satu yang sedia ada untuk menyambungnya), {{key:Enter}} untuk selesai. |
| {{ui:Profil}} | {{key:R}} | Menunjukkan atau menyembunyikan pandangan profil di bawah pelan. |

## Sunting

| Butang | Pintasan | Fungsi |
|---|---|---|
| {{ui:Buat asal}} | {{key:Mod+Z}} | Membuat asal perubahan terakhir (sehingga 200). Dimalapkan apabila tiada apa untuk dibuat asal. |
| {{ui:Buat semula}} | {{key:Mod+Y}} | Membuat semula apa yang telah dibuat asal. Dimalapkan apabila tiada apa untuk dibuat semula. |
| {{ui:Salin}} | {{key:Mod+C}} | Menyalin titik ukur yang dipilih, dan meletakkannya pada papan keratan sebagai baris titik yang boleh diambil oleh hamparan. Dimalapkan sehingga titik dipilih. |
| {{ui:Tampal}} | {{key:Mod+V}} | Menampal titik: ia mengikut penuding, dan klik meletakkannya dengan nombor yang tiada titik lain ada. Baris titik yang disalin dalam hamparan juga boleh ditampal. |
| {{ui:Lagi}} | tiada | Membuka menu di bawah. |

Menu {{ui:Lagi}}:

| Item | Pintasan | Fungsi |
|---|---|---|
| {{ui:Potong}} | {{key:Mod+X}} | Menyalin titik yang dipilih dan memadamkannya (satu langkah buat asal). |
| {{ui:Salin}} | {{key:Mod+C}} | Sama seperti butang {{ui:Salin}}. |
| {{ui:Tampal}} | {{key:Mod+V}} | Sama seperti butang {{ui:Tampal}}. |
| {{ui:Tampal di tempat yang sama}} | {{key:Mod+Shift+V}} | Menampal titik pada koordinat sendiri, dengan nombor yang tiada titik lain ada. |
| {{ui:Pendua}} | {{key:Mod+D}} | Satu salinan titik yang dipilih mengikut penuding; klik tempat ia pergi. Papan keratan tidak diubah. |
| {{ui:Padam}} | {{key:Delete}} | Memadamkan titik ukur yang dipilih, atau penjajaran, pelantar, struktur (bersama paipnya), paip atau PVI yang dipilih. |
| {{ui:Pilih semua titik}} | {{key:Mod+A}} | Memilih setiap titik ukur. |
| {{ui:Nyahpilih semua}} | {{key:Esc}} | Mengosongkan pilihan. |

Item yang tidak boleh bertindak sekarang dimalapkan, dan tip alatnya menyatakan sebabnya. Butiran: [Pilih, salin dan tampal titik ukur](topic:copy-paste-points).

Buat asal meliputi suntingan kepada reka bentuk, tetapan permukaan dan titik ukur (tampal, potong, pendua, padam). Ia tidak meliputi tetapan paparan, dan membuka atau mengimport sebarang fail mengosongkannya.

## GIS

| Butang | Pintasan | Fungsi |
|---|---|---|
| {{ui:Koordinat}} | tiada | Membuka dialog **Sistem koordinat**: nyatakan sistem mana projek berada, atau gunakan koordinat tanah atau tempatan. Lihat [Tetapkan sistem koordinat projek](topic:coordinate-systems) dan [Koordinat tanah dan tempatan](topic:ground-and-local-coordinates). |
| {{ui:Import}} | tiada | Mengimport data GIS: shapefile, GeoJSON, GeoPackage, grid ketinggian dan LiDAR. Lihat [Import data GIS](topic:gis-import). |
| {{ui:Eksport}} | tiada | Mengeksport data seperti dibina untuk jabatan GIS. Lihat [Eksport data seperti dibina untuk GIS](topic:gis-export). |
| {{ui:Analisis}} | tiada | Membuka panel analisis GIS: penampan, overlay, sambungan ruang, pilih mengikut atribut, ukur. Lihat [Analisis lapisan GIS](topic:gis-analysis). |
| {{ui:Jadual atribut}} | tiada | Dalam Permukaan › {{ui:Lagi}}. Membuka jadual atribut lapisan GIS: isih, tapis, pilih, sunting, tambah medan, kira, simpan sebagai CSV. Lihat [Kerja dengan jadual atribut lapisan](topic:gis-table). |
| {{ui:Peta}} | tiada | Membuka dialog **Lapisan peta**: gambar yang digeorujukan, atau pelayan peta yang anda tambah, dilukis di bawah pelan. Lihat [Tunjukkan lapisan peta di bawah pelan](topic:map-layers). |

Alat GIS dimuatkan kali pertama anda menggunakan salah satu butang ini, membuka fail GIS, atau membuka projek yang mempunyai sistem koordinat atau lapisan GIS.

## Paparan

| Butang | Pintasan | Fungsi |
|---|---|---|
| {{ui:Pilih}} | {{key:V}} atau {{key:Esc}} | Klik untuk memilih penjajaran, pelantar, struktur, paip dan titik ({{key:Shift}} dan klik atau seretan menambah titik); seret grip untuk mengalihkan PI, bucu pelantar dan struktur. |
| {{ui:Muat}} | {{key:F}} | Zum pelan untuk menunjukkan permukaan, titik, penjajaran dan pelantar (dalam paparan 3D: menunjukkan semua). |
| {{ui:3D}} | {{key:D}} | Menunjukkan tapak dalam 3D di atas pelan, atau kembali ke pelan. Bar di atas paparan 3D menetapkan pandangan, eksagerasi, pewarnaan dan apa yang ditunjukkan, serta mengeksport GLB atau OBJ. Lihat [Lihat tapak dalam 3D](topic:site-3d). |

## Butang dalam panel

| Butang | Di mana | Fungsi |
|---|---|---|
| {{ui:Buka tapak contoh}} | Kotak pada pelan kosong | Memuatkan tinjauan contoh (memerlukan sambungan, melainkan CivilCraft disimpan untuk kegunaan luar talian) |
| {{ui:Alih keluar sempadan}} | Panel kiri, Permukaan | Mengambil sempadan luar |
| {{ui:Alih keluar garis putus yang dilukis}} | Panel kiri, Permukaan | Mengalih keluar setiap garis putus yang dilukis dengan alat itu (bukan kumpulan garis putus) |
| {{ui:Bina semula permukaan daripada titik}} | Panel kiri, Permukaan (hanya permukaan LandXML) | Membuang TIN LandXML dan membina daripada titik; tidak boleh dibuat asal |
| {{ui:Mula dari tanah sedia ada}} | Panel kanan, Penjajaran | Memulakan profil reka bentuk dengan PVI di atas tanah pada setiap hujung |
| {{ui:Pandangan profil}} | Panel kanan, Penjajaran | Membuka pandangan profil untuk penjajaran ini |
| {{ui:Tambah PVI}} | Bar profil | Semasa ditekan, klik dalam profil menambah PVI |
| {{ui:Tetapkan setiap invert daripada peraturan}} | Panel kanan, Rangkaian paip | Menetapkan invert setiap paip daripada peraturan |
| {{ui:Tetapkan invert paipnya daripada peraturan}} | Panel kanan, Paip | Menetapkan invert paip ini daripada peraturan |
