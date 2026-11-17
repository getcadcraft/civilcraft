---
title: Lapisan pelan
summary: Nama lapisan, warna dan ketebalan garisan yang tetap yang digunakan CivilCraft pada skrin, dalam DXF dan dalam PDF, serta tetapan paparan yang mengawal setiap satu.
keywords: lapisan, nama lapisan, ncs, warna, aci, ketebalan garisan, lapisan dxf, pdf, tetapan paparan, garisan
from: c2aa8475
---

Setiap perkara pada pelan tergolong dalam satu lapisan. Nama-namanya mengikut corak lapisan sivil yang lazim (disiplin, kumpulan utama, kumpulan kecil). Lapisan ditetapkan dalam binaan ini: anda tidak boleh menamakannya semula, menukar warnanya atau menambah lapisan sendiri. Dalam DXF, setiap lapisan mempunyai nombor warna yang ditunjukkan; dalam PDF dengan {{ui:Layer colors}}, warna yang sama digunakan, dan dengan {{ui:Black}} semua perkara dicetak hitam.

| Lapisan | Mengandungi | Warna (nombor DXF) | Dipaparkan apabila |
|---|---|---|---|
| C-TOPO-MINR | Kontur kecil | Kelabu (8) | {{ui:Contours}} |
| C-TOPO-MAJR | Kontur utama | Putih atau hitam (7) | {{ui:Contours}} |
| C-TOPO-TEXT | Label kontur | Putih atau hitam (7) | {{ui:Contours}} dan {{ui:Contour labels}} |
| C-TOPO-TINN | Tepi segi tiga | Kelabu (8) | {{ui:Triangles}} |
| C-TOPO-BRKL | Garis putus dan sempadan | Oren (30) | {{ui:Breaklines}} |
| C-TOPO-BNDY | Tepi permukaan | Putih atau hitam (7) | {{ui:Surface edge}} |
| C-TOPO-SLOP | Anak panah cerun | Sian (4) | {{ui:Slope arrows}} |
| V-NODE | Titik ukur | Hijau (3) | {{ui:Points}} |
| V-NODE-TEXT | Label titik: nombor, aras, huraian | Hijau (3) | {{ui:Points}} dan {{ui:Point labels}} |
| V-NODE-LINE | Garisan daripada kod garisan (kumpulan yang bukan garis putus) | Hijau (3) | {{ui:Points}} |
| C-ROAD-CNTR | Garis tengah penjajaran | Merah (1) | Sentiasa |
| C-ROAD-STAN | Tanda dan label stesen, PC dan PT | Merah (1) | Sentiasa |
| C-ROAD-CORR | Tepi koridor | Kuning (2) | Sentiasa |
| C-ROAD-SCTN | Garis sampel (tempat keratan dibuat) | Kelabu (8) | Apabila penjajaran mempunyai garis sampel |
| C-GRAD-PADS | Garis luar pelantar | Biru (5) | Sentiasa |
| C-GRAD-DAYL | Garis persilangan cerun | Magenta (6) | Sentiasa |
| C-GRAD-SLOP | Garis cerun pembentukan permukaan | Magenta (6) | Sentiasa |
| C-GRAD-FEAT | Garis ciri (3D) | Hijau (3) | Sentiasa |
| C-ROAD-SWPT | Laluan larian: garis luar, laluan roda paling luar, nama | Oren (30) | Sentiasa |
| C-STRM-PIPE | Paip | Biru (5) | {{ui:Pipes}} |
| C-STRM-STRC | Struktur | Biru (5) | {{ui:Pipes}} |
| C-STRM-TEXT | Label paip dan struktur | Biru (5) | {{ui:Pipes}} |
| C-STRM-PROB | Paip dan struktur yang bermasalah | Merah (1) | {{ui:Pipes}} |

Garis putus hanya dilukis semasa **Permukaan** di bawah **Paparan** ialah {{ui:Existing ground}}; sempadan dilukis dengan mana-mana permukaan.

## Ketebalan garisan dalam PDF

| Ketebalan | Lapisan |
|---|---|
| 0.50 mm | Garis tengah penjajaran, pelantar, paip, paip bermasalah |
| 0.35 mm | Kontur utama, garis persilangan cerun, struktur |
| 0.25 mm | Garis putus |
| 0.13 mm | Kontur kecil |
| 0.09 mm | Tepi segi tiga, garis cerun pembentukan permukaan |
| 0.18 mm | Yang lain |

Fail DXF tidak membawa ketebalan garisan; tetapkannya mengikut lapisan dalam program CAD anda.

## Saiz label

Label bersaiz mengikut kertas: label kontur 2.0 mm, label stesen 1.8 mm, label PC dan PT serta label paip dan struktur 1.6 mm, label titik 1.5 mm. Label paip memberikan nama, diameter dan cerun; label struktur memberikan nama dan bibir. Pada skrin, saiznya kekal sama apabila anda zum. Dalam DXF, saiznya diskalakan mengikut skala yang dinyatakan dalam mesej eksport; lihat [Eksport pelan ke DXF](topic:dxf-export).

## Tidak dipaparkan pada mana-mana lapisan

Jalur aras dilukis di bawah garisan hanya pada skrin. Paparan profil bukan sebahagian daripada pelan.
