---
title: Ekspor denah ke DXF
summary: Tulis garis denah sebagai DXF R12 pada layer bernama, dengan kontur pada elevasinya dan breakline dalam 3D, untuk program CAD apa pun.
keywords: dxf, dwg, cad, ekspor, garis gambar, r12, 2000, 2004, 2007, 2010, 2013, 2018, layer, kontur, pertukaran gambar, peta dasar, latar belakang
from: f2d8ede9
---

{{ui:DXF}} menulis apa yang ditampilkan denah sebagai file DXF dalam format R12, versi yang dibuka oleh setiap program CAD. Jika Anda pernah memakai AutoCAD atau Civil 3D, buka atau sisipkan file itu seperti DXF lain.

## Ekspor

1. Atur denah sesuai keinginan gambar Anda: di bawah **Tampilan**, pilih permukaan (yang ada atau yang diusulkan), interval kontur, dan hal-hal yang dinyalakan (kontur, label, titik, label titik, segitiga, breakline, tepi permukaan, pipa, panah kemiringan).
2. Klik {{ui:DWG/DXF}} di grup **Ekspor** dan pilih {{ui:DXF (R12, teks): file pertukaran sederhana}}, lalu {{ui:Unduh}}.
3. Browser mengunduh `<name>.dxf`. Bilah status menampilkan, misalnya, "Diekspor DXF R12: 2,140 objek; label berukuran untuk 1" = 40'. Band tidak diekspor."

Koordinat ditulis dalam satuan proyek Anda, pada nilai sebenarnya (koordinat state plane tetap seperti aslinya). Tidak ada yang diskalakan atau dipindahkan.

## Isi file

| Hal | Entitas DXF | Layer |
|---|---|---|
| Kontur minor dan mayor | Polyline 2D pada elevasinya | C-TOPO-MINR, C-TOPO-MAJR |
| Label kontur | Teks | C-TOPO-TEXT |
| Segitiga | Polyline | C-TOPO-TINN |
| Breakline dan batas | Polyline 3D | C-TOPO-BRKL |
| Tepi permukaan | Polyline | C-TOPO-BNDY |
| Panah kemiringan | Polyline | C-TOPO-SLOP |
| Titik survei dan labelnya | Titik (dengan elevasi), teks | V-NODE, V-NODE-TEXT |
| Garis dari kode garis | Polyline 3D | V-NODE-LINE |
| Garis sumbu alinyemen | Garis dan busur | C-ROAD-CNTR |
| Tanda stasiun dan labelnya | Polyline, teks | C-ROAD-STAN |
| Tepi koridor | Polyline | C-ROAD-CORR |
| Garis sampel | Polyline | C-ROAD-SCTN |
| Pad, garis daylight, garis lereng | Polyline | C-GRAD-PADS, C-GRAD-DAYL, C-GRAD-SLOP |
| Garis fitur | Polyline 3D (busur sebagai potongan dalam 0.01; lihat [Garis fitur](topic:feature-lines)) | C-GRAD-FEAT |
| Jalur putar | Polyline, teks | C-ROAD-SWPT |
| Pipa, bangunan, dan labelnya | Polyline, teks | C-STRM-PIPE, C-STRM-STRC, C-STRM-TEXT |
| Pipa dan bangunan bermasalah | Polyline | C-STRM-PROB |

Setiap layer memiliki warna. Daftar lengkapnya ada di [Layer denah](topic:plan-layers).

## Ukuran label

Teks harus memiliki ukuran dalam satuan gambar. CivilCraft mengukur label untuk skala tempat seluruh denah muat di lembar Tabloid (kaki) atau lembar A3 (meter), dan menyebutkan skala tersebut di pesan status. Jika Anda mencetak pada skala lain di program CAD, skalakan teks di sana.

## Yang tidak diekspor

- Band elevasi (hanya di layar).
- Tampilan profil. Profil diekspor sebagai LandXML, bukan sebagai gambar.
- Permukaan itu sendiri sebagai objek 3D. Gunakan LandXML untuk TIN, atau nyalakan {{ui:Segitiga}} untuk mendapatkan tepinya sebagai garis.
- Apa pun yang Anda matikan di bawah **Tampilan**.

## DWG

{{ui:DWG/DXF}} juga menulis garis yang sama sebagai gambar DWG. Dialognya meminta format: DXF, atau DWG 2000, 2004, 2007, 2010, 2013 atau 2018. Format 2000 dibuka di hampir setiap program CAD, lama maupun baru; pilih versi yang lebih baru ketika pihak yang menerima gambar memintanya. Pilihan Anda diingat di browser ini.

1. Klik {{ui:DWG}} di grup **Ekspor**.
2. Pilih **Format** dan klik **Unduh DWG**.
3. Browser mengunduh `<name>.dwg`. Bilah status menyebutkan apa yang masuk, misalnya "Diekspor DWG (format 2018): 12 polyline, 40 label pada 9 layer".

DWG memuat layer, warna, kontur (sebagai polyline pada elevasinya), breakline 3D, label, dan titik yang sama dengan DXF, dalam koordinat yang sama. Nama layer yang tidak dapat ditampung DWG akan diubah, dan pesan status memberitahukannya. CivilCraft menulis DWG dengan kodenya sendiri, jadi tidak ada yang keluar dari komputer Anda.

### Layer peta di DWG

Gambar DWG tidak dapat memuat gambar raster di dalamnya: program CAD menampilkan gambar yang berada di samping gambar. Saat layer peta sedang ditampilkan, dialog menawarkan **Layer peta sebagai gambar di samping gambar**. Jika dicentang, unduhan berupa `.zip` yang berisi `<name>.dwg`, `<name>-map.png` (layer peta di seluruh gambar, hingga 4,096 piksel lebarnya) dan `<name>-map.pgw` (file dunia, untuk program GIS). Gambar menampilkan gambar raster itu sebagai image pada layer G-MAP-IMAG, di tempatnya. Ekstrak file ke satu folder dan simpan bersama-sama.
