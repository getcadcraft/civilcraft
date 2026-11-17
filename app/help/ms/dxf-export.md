---
title: Eksport pelan ke DXF
summary: Tulis garisan pelan sebagai DXF R12 pada lapisan yang dinamakan, dengan kontur pada arasnya dan garis putus dalam 3D, untuk mana-mana program CAD.
keywords: dxf, dwg, cad, eksport, garisan, r12, 2000, 2004, 2007, 2010, 2013, 2018, lapisan, kontur, pertukaran lukisan, peta asas, latar belakang
from: f2d8ede9
---

{{ui:DXF}} menulis apa yang dipaparkan pelan sebagai fail DXF dalam format R12, versi yang dibuka oleh setiap program CAD. Jika anda pernah menggunakan AutoCAD atau Civil 3D, buka atau selitkannya sama seperti mana-mana DXF lain.

## Eksport

1. Sediakan pelan mengikut cara yang anda mahukan untuk lukisan: di bawah **Paparan**, pilih permukaan (sedia ada atau cadangan), selang kontur, dan perkara yang dihidupkan (kontur, label, titik, label titik, {{ui:Segi tiga}}, {{ui:Garis putus}}, tepi permukaan, paip, anak panah cerun).
2. Klik {{ui:DWG/DXF}} dalam kumpulan **Eksport** dan pilih {{ui:DXF (R12, teks) — fail pertukaran biasa}}, kemudian {{ui:Muat turun}}.
3. Pelayar memuat turun `<name>.dxf`. Bar status menyatakan, sebagai contoh, "R12 DXF didieksport: 2,140 objek; label bersaiz untuk 1" = 40'. Jalur tidak dieksport."

Koordinat ditulis dalam unit projek anda, pada nilai sebenarnya (koordinat satah negeri kekal seperti asal). Tiada apa yang diskala atau dialihkan.

## Apa yang ada dalam fail

| Perkara | Entiti DXF | Lapisan |
|---|---|---|
| Kontur kecil dan utama | Polygaris 2D pada arasnya | C-TOPO-MINR, C-TOPO-MAJR |
| Label kontur | Teks | C-TOPO-TEXT |
| Segi tiga | Polygaris | C-TOPO-TINN |
| Garis putus dan sempadan | Polygaris 3D | C-TOPO-BRKL |
| Tepi permukaan | Polygaris | C-TOPO-BNDY |
| Anak panah cerun | Polygaris | C-TOPO-SLOP |
| Titik ukur dan labelnya | Titik (dengan aras), teks | V-NODE, V-NODE-TEXT |
| Garisan daripada kod garisan | Polygaris 3D | V-NODE-LINE |
| Garis tengah penjajaran | Garisan dan lengkok | C-ROAD-CNTR |
| Tanda stesen dan label | Polygaris, teks | C-ROAD-STAN |
| Tepi koridor | Polygaris | C-ROAD-CORR |
| Garis sampel | Polygaris | C-ROAD-SCTN |
| Pad, garis persilangan cerun, garis cerun | Polygaris | C-GRAD-PADS, C-GRAD-DAYL, C-GRAD-SLOP |
| Garis ciri | Polygaris 3D (lengkok sebagai keping dalam 0.01; lihat [Garis ciri](topic:feature-lines)) | C-GRAD-FEAT |
| Laluan sapuan | Polygaris, teks | C-ROAD-SWPT |
| Paip, struktur, label | Polygaris, teks | C-STRM-PIPE, C-STRM-STRC, C-STRM-TEXT |
| Paip dan struktur yang bermasalah | Polygaris | C-STRM-PROB |

Setiap lapisan mempunyai warna. Senarai penuh ada dalam [Lapisan pelan](topic:plan-layers).

## Saiz label

Teks mesti mempunyai saiz dalam unit lukisan. CivilCraft menentukan saiz label mengikut skala yang memuatkan keseluruhan pelan pada lembaran Tabloid (kaki) atau lembaran A3 (meter), dan menyatakan skala itu dalam mesej status. Jika anda mencetak pada skala lain dalam program CAD anda, skalakan teks di sana.

## Apa yang tidak dieksport

- Jalur ketinggian (skrin sahaja).
- Pandangan profil. Profil dieksport sebagai LandXML, bukan sebagai lukisan.
- Permukaan itu sendiri sebagai objek 3D. Gunakan LandXML untuk TIN, atau hidupkan {{ui:Segi tiga}} untuk mendapat tepinya sebagai garisan.
- Apa-apa yang anda matikan di bawah **Paparan**.

## DWG

{{ui:DWG/DXF}} turut menulis garisan yang sama sebagai lukisan DWG. Dialognya meminta format: DXF, atau DWG 2000, 2004, 2007, 2010, 2013 atau 2018. 2000 dibuka dalam hampir setiap program CAD, lama dan baharu; pilih versi yang lebih baharu apabila orang yang menerima lukisan itu memintanya. Pilihan anda diingat dalam pelayar ini.

1. Klik {{ui:DWG}} dalam kumpulan **Eksport**.
2. Pilih **Format** dan klik **Muat turun DWG**.
3. Pelayar memuat turun `<name>.dwg`. Bar status menyatakan apa yang dimasukkan, contohnya "DWG didieksport (format 2018): 12 polygaris, 40 label pada 9 lapisan".

DWG mempunyai lapisan, warna, kontur (sebagai polygaris pada arasnya), garis putus 3D, label dan titik yang sama seperti DXF, dalam koordinat yang sama. Nama lapisan yang tidak dapat disimpan dalam DWG akan ditukar, dan mesej status memaklumkannya. CivilCraft menulis DWG dengan kodnya sendiri, jadi tiada apa yang meninggalkan komputer anda.

### Lapisan peta dalam DWG

Lukisan DWG tidak boleh memuatkan gambar di dalamnya: program CAD memaparkan gambar yang terletak di sebelah lukisan. Apabila lapisan peta sedang dipaparkan, dialog menawarkan **Lapisan peta sebagai imej di sebelah lukisan**. Dengan pilihan ini ditandakan, muat turun ialah fail `.zip` yang mengandungi `<name>.dwg`, `<name>-map.png` (lapisan peta di atas keseluruhan lukisan, sehingga 4,096 piksel lebar) dan `<name>-map.pgw` (fail dunia, untuk program GIS). Lukisan memaparkan gambar sebagai imej pada lapisan G-MAP-IMAG, di tempatnya. Nyahzip fail ke dalam satu folder dan simpan bersama.
