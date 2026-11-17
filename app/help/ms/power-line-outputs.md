---
title: Jadual talian kuasa, kuantiti, helaian dan GIS
summary: Jadual penarikan dan penyokong, kuantiti bahan untuk hamparan atau TakeoffCraft, helaian pelan dan profil dengan laporan kajian sebagai satu PDF, dan lapisan GIS dengan data setiap aset.
keywords: jadual penarikan, jadual penyokong, kuantiti, senarai bahan, takeoffcraft, helaian, laporan, pdf, helaian profil, gis, geopackage, shapefile, geojson, kml
from: bee6fb2d
---

Semua di sini berada di bawah {{ui:Lagi}} dalam kumpulan Talian kuasa.

| Output | Apa yang anda dapat |
|---|---|
| {{ui:Jadual penarikan…}} | Mengikut seksyen, tegangan mendatar dan lendutan setiap rentang pada setiap suhu; simpan sebagai CSV. {{ui:Simpan jadual penyokong (CSV)}}: peranan setiap penyokong, item, tanah, lampiran, beban terbesar, nominal, OK, cadangan, asas, ayunan, angkatan |
| {{ui:Kuantiti…}} | Konduktor (panjang lengkung rantai × konduktor × litar + 2 % untuk penyambung dan hujung mati), penyokong dan peralatan mengikut item pustaka, kabel, parit, penggalian, saluran, sambungan. CSV, Excel, atau fail kuantiti TakeoffCraft |
| {{ui:Helaian dan laporan…}} | Satu PDF: pelan; helaian profil untuk setiap talian dengan konduktor pada kes beban yang anda pilih dan jalur panjang rentang, lendutan serta ruang bebas terendah; dan laporan kajian (set peraturan, seksyen, jadual penarikan, penyokong, setiap semakan) |
| {{ui:Eksport ke GIS…}} | Penyokong, rentang, laluan kabel, peralatan dan halangan sebagai lapisan dengan datanya (ketinggian, beban, lendutan, ruang bebas, apa yang gagal), sebagai GeoPackage, shapefile, GeoJSON, KML atau KMZ |

GeoJSON dan KML memerlukan sistem koordinat projek ([Sistem koordinat](topic:coordinate-systems)); tanpanya, GeoPackage dan shapefile membawa nombor projek itu sendiri.
