---
title: Eksport tapak dalam 3D
summary: Simpan apa yang dipaparkan oleh paparan 3D sebagai fail GLB atau OBJ untuk program 3D lain, dalam meter dengan Y ke atas, di sekitar asal setempat yang dicatat oleh fail.
keywords: glb, gltf, obj, eksport 3d, eksport model, enjin permainan, visualisasi, pemapar 3d, meter, y ke atas, asal, asal setempat, satah negeri
from: 07d23992
---

Paparan 3D mengeksport apa yang dipaparkannya sebagai model 3D yang boleh dibuka oleh program lain: pemapar 3D, pemodel, enjin permainan atau alat visualisasi.

## Eksport

1. Buka paparan 3D ({{key:D}}) dan pilih apa yang dipaparkan dengan {{ui:Tunjuk}}. Apa yang tersembunyi tidak dieksport.
2. Klik {{ui:GLB}} atau {{ui:OBJ}} pada bar.
   Fail dimuat turun sebagai "*nama projek*-3d.glb" atau "-3d.obj", dan bar status menyatakan asalnya.

## Apa yang dikandungi fail

| | GLB | OBJ |
|---|---|---|
| Permukaan | Jejaring dengan normal dan warna jalur atau permukaan | Jejaring dengan normal (tiada warna) |
| Paip dan struktur | Jejaring bulat, yang bermasalah dalam merah | Jejaring bulat |
| Kontur, garis putus, penjajaran, tanda, garis koridor dan pad | Garisan, setiap set dalam warnanya | Rekod garisan (`l`) |
| Titik ukur | Titik | Rekod titik (`p`) |

Setiap set mengekalkan namanya ("Tanah sedia ada", "Paip", "Kontur utama" dan seterusnya), supaya anda boleh menyembunyikan atau menggayakannya dalam program lain.

## Unit, paksi dan asal

- **Meter.** Projek kaki ditukar daripada kaki tinjauan AS (1 ft = 1200/3937 m).
- **Y ke atas**, konvensyen biasa bagi format ini: easting menjadi +X, aras +Y, dan northing −Z.
- **Skala sebenar.** Pembesaran menegak paparan tidak digunakan.
- **Asal setempat.** Koordinat satah negeri berjuta kaki, terlalu besar untuk nombor ketepatan tunggal yang disimpan oleh format ini, jadi fail ditulis secara relatif kepada asal berdekatan: asal tanah sedia ada sendiri bagi easting dan northing, dan aras terendahnya dibundarkan ke bawah. Asal, dalam unit projek, dicatat dalam fail: dalam GLB sebagai `extras` pada scene dan nod atasnya, dalam OBJ sebagai baris komen berhampiran bahagian atas (`# origin easting … northing … elevation …`). Untuk meletakkan semula model dalam koordinat projek, tambah asal (selepas menukar meter kembali kepada kaki bagi projek kaki).

## Belum dibina

- Mengeksport paparan yang dibesarkan, atau mengeksport dalam unit projek dan bukan meter.
- Tekstur, fail bahan untuk OBJ (.mtl) dan sifat setiap objek (nama paip dan struktur hanya ada dalam CivilCraft).
- Mengeksport koridor sebagai pepejal berasingan, atau pandangan profil dalam 3D.
