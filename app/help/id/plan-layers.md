---
title: Layer denah
summary: Nama layer, warna, dan ketebalan garis tetap yang digunakan CivilCraft di layar, di DXF, dan di PDF, serta pengaturan tampilan yang mengendalikan masing-masing.
keywords: layer, nama layer, ncs, warna, aci, ketebalan garis, layer dxf, pdf, pengaturan tampilan, garis
from: c2aa8475
---

Semua yang ada di denah termasuk ke dalam sebuah layer. Namanya mengikuti pola layer sipil yang umum (disiplin, grup utama, grup minor). Layer bersifat tetap pada build ini: Anda tidak dapat mengganti namanya, mengubah warnanya, atau menambah layer sendiri. Di DXF, setiap layer memiliki nomor warna yang ditampilkan; di PDF dengan {{ui:Warna layer}}, warna yang sama digunakan, dan dengan {{ui:Hitam}} semuanya dicetak hitam.

| Layer | Berisi | Warna (nomor DXF) | Ditampilkan saat |
|---|---|---|---|
| C-TOPO-MINR | Kontur minor | Abu-abu (8) | {{ui:Kontur}} |
| C-TOPO-MAJR | Kontur mayor | Putih atau hitam (7) | {{ui:Kontur}} |
| C-TOPO-TEXT | Label kontur | Putih atau hitam (7) | {{ui:Kontur}} dan {{ui:Label kontur}} |
| C-TOPO-TINN | Tepi segitiga | Abu-abu (8) | {{ui:Segitiga}} |
| C-TOPO-BRKL | Breakline dan batas | Oranye (30) | {{ui:Breakline}} |
| C-TOPO-BNDY | Tepi permukaan | Putih atau hitam (7) | {{ui:Tepi permukaan}} |
| C-TOPO-SLOP | Panah kemiringan | Sian (4) | {{ui:Panah kemiringan}} |
| V-NODE | Titik survei | Hijau (3) | {{ui:Titik}} |
| V-NODE-TEXT | Label titik: nomor, elevasi, deskripsi | Hijau (3) | {{ui:Titik}} dan {{ui:Label titik}} |
| V-NODE-LINE | Garis dari kode garis (grup yang bukan breakline) | Hijau (3) | {{ui:Titik}} |
| C-ROAD-CNTR | Garis as alinyemen | Merah (1) | Selalu |
| C-ROAD-STAN | Tanda dan label stasiun, PC dan PT | Merah (1) | Selalu |
| C-ROAD-CORR | Tepi koridor | Kuning (2) | Selalu |
| C-ROAD-SCTN | Garis sampel (tempat potongan dibuat) | Abu-abu (8) | Saat alinyemen memiliki garis sampel |
| C-GRAD-PADS | Garis tepi pad | Biru (5) | Selalu |
| C-GRAD-DAYL | Garis daylight | Magenta (6) | Selalu |
| C-GRAD-SLOP | Garis kemiringan grading | Magenta (6) | Selalu |
| C-GRAD-FEAT | Garis fitur (3D) | Hijau (3) | Selalu |
| C-ROAD-SWPT | Jalur sapuan: garis tepi, jalur roda terluar, nama | Oranye (30) | Selalu |
| C-STRM-PIPE | Pipa | Biru (5) | {{ui:Pipa}} |
| C-STRM-STRC | Bangunan | Biru (5) | {{ui:Pipa}} |
| C-STRM-TEXT | Label pipa dan bangunan | Biru (5) | {{ui:Pipa}} |
| C-STRM-PROB | Pipa dan bangunan bermasalah | Merah (1) | {{ui:Pipa}} |

Breakline hanya digambar saat **Permukaan** di bawah **Tampilan** adalah {{ui:Tanah asli}}; batas digambar dengan permukaan mana pun.

## Ketebalan garis di PDF

| Ketebalan | Layer |
|---|---|
| 0.50 mm | Garis as alinyemen, pad, pipa, pipa bermasalah |
| 0.35 mm | Kontur mayor, garis daylight, bangunan |
| 0.25 mm | Breakline |
| 0.13 mm | Kontur minor |
| 0.09 mm | Tepi segitiga, garis kemiringan grading |
| 0.18 mm | Semua yang lain |

File DXF tidak memuat ketebalan garis; atur menurut layer di program CAD Anda.

## Ukuran label

Label diukur di atas kertas: label kontur 2.0 mm, label stasiun 1.8 mm, label PC dan PT serta label pipa dan bangunan 1.6 mm, label titik 1.5 mm. Label pipa memuat nama, diameter, dan kemiringan; label bangunan memuat nama dan rim. Di layar, ukurannya tetap sama saat Anda melakukan zoom. Di DXF, label diskalakan sesuai skala yang disebutkan dalam pesan ekspor; lihat [Ekspor denah ke DXF](topic:dxf-export).

## Tidak ditampilkan di layer mana pun

Pita elevasi hanya digambar di bawah garis di layar. Tampilan profil bukan bagian dari denah.
