---
title: Nilai awal dan placeholder
summary: Setiap nilai yang dimulai CivilCraft, untuk proyek baru, tampilan, alinyemen, pad, koridor, jaringan pipa, volume dan plot, serta mana yang merupakan placeholder untuk diganti.
keywords: default, pengaturan, nilai awal, placeholder, kriteria desain, standar, aturan, asumsi
from: fbfc7432
---

CivilCraft tidak memiliki dialog pengaturan atau templat. Ini adalah nilai-nilai yang dimulai oleh hal-hal di dalamnya. Nilai yang ditandai **placeholder** tidak diambil dari standar apa pun: gantilah dengan kriteria proyek Anda sebelum Anda mengandalkan sebuah pemeriksaan atau kuantitas.

## Proyek baru

| Pengaturan | Nilai |
|---|---|
| Nama | Tapak tanpa judul (nama file titik pertama menggantikannya) |
| Satuan | US feet |
| Nama permukaan | Tanah asli |
| Grup titik | Setiap grup dimulai sebagai {{ui:Titik}} |
| Tepi luar terpanjang | 0 (simpan setiap segitiga) |
| Langkah urungkan yang disimpan | 200 |

## Tampilan

| Pengaturan | Nilai |
|---|---|
| Permukaan | {{ui:Tanah asli}} |
| Kontur setiap | 1 (ft atau m) |
| Major setiap | kontur ke-5 |
| Pita | 8 |
| Nyala | Kontur, label kontur, titik, breakline, tepi permukaan, pipa |
| Mati | Segitiga, pita elevasi, panah kemiringan, label titik |

## Alinyemen dan profil

| Pengaturan | Nilai |
|---|---|
| Nama | Alinyemen 1, Alinyemen 2 … |
| Stasiun awal | 0+00 |
| Radius lengkung pada setiap PI antara | 100 ft atau 30 m, lebih kecil jika itu tidak muat di setengah tiap tangen |
| Profil desain | Tidak ada sampai Anda memulainya; {{ui:Mulai dari tanah}} menempatkan PVI di tanah pada setiap ujung |
| Panjang lengkung vertikal | 0 (tanpa lengkung) sampai Anda mengetiknya |

## Pad

| Pengaturan | Nilai |
|---|---|
| Nama | Pad 1, Pad 2 … |
| Elevasi | Tanah di tengah pad, dibulatkan ke 0.1 (0 jika tengahnya berada di luar permukaan) |
| Lereng galian | 2 : 1 (placeholder) |
| Lereng timbunan | 3 : 1 (placeholder) |

## Rakitan koridor (placeholder)

| Pengaturan | US feet | Meter |
|---|---|---|
| Lebar lajur | 12 ft | 3.6 m |
| Kemiringan lajur | 2% | 2% |
| Lebar bahu | 4 ft | 1.2 m |
| Kemiringan bahu | 4% | 4% |
| Lereng galian | 2 : 1 | 2 : 1 |
| Lereng timbunan | 3 : 1 | 3 : 1 |
| Penampang setiap | 10 ft | 5 m |

## Jaringan pipa

| Pengaturan | US feet | Meter |
|---|---|---|
| Nama dan jenis | Storm, storm | Storm, storm |
| Kemiringan terkecil (placeholder) | 0.50% | 0.50% |
| Tutupan terkecil (placeholder) | 2 ft | 0.6 m |
| Penurunan di struktur (placeholder) | 0.10 ft | 0.03 m |
| Diameter struktur baru | 48 in | 1200 mm |
| Diameter pipa baru | 12 in | 300 mm |
| Kedalaman sump | 0 | 0 |
| Rim | Dari permukaan | Dari permukaan |

Jaringan pipa yang dibuka dari LandXML juga memakai aturan ini, karena LandXML tidak membawanya.

## Volume

| Pengaturan | Nilai |
|---|---|
| Metode | Grid, diambil sampel di tengah sel di dalam garis daylight |
| Ukuran sel | Dipilih agar persegi panjang pembatas area yang digrading memuat sekitar 250.000 sel (1, 2 atau 5 kali pangkat sepuluh) |
| Pengembangan dan penyusutan | Tidak ada |

## Plot

| Pengaturan | Nilai |
|---|---|
| Area | {{ui:Semuanya}} |
| Kertas | Tabloid 11 × 17 in (proyek feet), ISO A3 (proyek meter); selalu lanskap |
| Skala | Skala terbesar dalam daftar yang muat |
| Tinta | {{ui:Warna layer}} |

Label DXF diukur untuk skala tempat semuanya muat pada Tabloid (feet) atau A3 (meter).
