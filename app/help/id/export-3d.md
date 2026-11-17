---
title: Ekspor lokasi dalam 3D
summary: Simpan apa yang ditampilkan tampilan 3D sebagai file GLB atau OBJ untuk program 3D lain, dalam meter dengan Y ke atas, di sekitar titik asal lokal yang dicatat file.
keywords: glb, gltf, obj, ekspor 3d, ekspor model, mesin game, visualisasi, penampil 3d, meter, y ke atas, titik asal, titik asal lokal, state plane
from: 07d23992
---

Tampilan 3D mengekspor apa yang ditampilkannya sebagai model 3D yang dapat dibuka program lain: penampil 3D, pemodel, mesin game, atau alat visualisasi.

## Ekspor

1. Buka tampilan 3D ({{key:D}}) dan pilih apa yang tampil dengan {{ui:Tampilkan}}. Yang disembunyikan tidak diekspor.
2. Klik {{ui:GLB}} atau {{ui:OBJ}} di bilah.
   File diunduh sebagai "*nama proyek*-3d.glb" atau "-3d.obj", dan bilah status menyebutkan titik asalnya.

## Isi file

| | GLB | OBJ |
|---|---|---|
| Permukaan | Mesh dengan normal dan warna band atau permukaan | Mesh dengan normal (tanpa warna) |
| Pipa dan bangunan | Mesh bulat, yang bermasalah dalam merah | Mesh bulat |
| Kontur, breakline, alinyemen, tanda, garis koridor, dan pad | Garis, masing-masing set dalam warnanya | Rekaman garis (`l`) |
| Titik survei | Titik | Rekaman titik (`p`) |

Setiap set menyimpan namanya ("Tanah yang ada", "Pipa", "Kontur mayor" dan seterusnya), sehingga Anda dapat menyembunyikan atau memberi gaya padanya di program lain.

## Satuan, sumbu, dan titik asal

- **Meter.** Proyek kaki dikonversi dari kaki survei AS (1 ft = 1200/3937 m).
- **Y ke atas**, konvensi yang lazim untuk format ini: easting menjadi +X, elevasi +Y, dan northing −Z.
- **Skala sebenarnya.** Penguatan vertikal tampilan tidak diterapkan.
- **Titik asal lokal.** Koordinat state plane berada dalam jutaan kaki, terlalu besar untuk angka presisi tunggal yang disimpan format ini, sehingga file ditulis relatif terhadap titik asal yang berdekatan: titik asal tanah yang ada sendiri untuk easting dan northing, dan elevasi terendahnya dibulatkan ke bawah. Titik asal, dalam satuan proyek, dicatat di file: dalam GLB sebagai `extras` pada scene dan node teratasnya, dalam OBJ sebagai baris komentar dekat bagian atas (`# origin easting … northing … elevation …`). Untuk menempatkan model kembali ke koordinat proyek, tambahkan titik asal (setelah mengonversi meter kembali ke kaki pada proyek kaki).

## Belum dibuat

- Mengekspor tampilan dengan penguatan vertikal, atau mengekspor dalam satuan proyek alih-alih meter.
- Tekstur, file material untuk OBJ (.mtl), dan properti per objek (nama pipa dan bangunan hanya ada di CivilCraft).
- Mengekspor koridor sebagai solid terpisah, atau tampilan profil dalam 3D.
