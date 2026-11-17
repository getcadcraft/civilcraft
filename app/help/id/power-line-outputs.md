---
title: Tabel, kuantitas, lembar, dan GIS saluran listrik
summary: Tabel penarikan dan tiang, kuantitas material untuk spreadsheet atau TakeoffCraft, lembar denah dan profil dengan laporan kajian dalam satu PDF, serta lapisan GIS dengan data setiap aset.
keywords: tabel penarikan, tabel tiang, kuantitas, daftar material, takeoffcraft, lembar, laporan, pdf, lembar profil, gis, geopackage, shapefile, geojson, kml
from: bee6fb2d
---

Semua ini ada di bawah {{ui:Lainnya}} di grup Saluran listrik.

| Keluaran | Yang Anda dapatkan |
|---|---|
| {{ui:Tabel penarikan…}} | Per bagian, tegangan horizontal dan andongan setiap bentang pada setiap suhu; simpan sebagai CSV. {{ui:Simpan tabel tiang (CSV)}}: peran setiap tiang, item, tanah, pemasangan, beban terbesar, nominal, OK, saran, pondasi, ayunan, uplift |
| {{ui:Kuantitas…}} | Konduktor (panjang katenari × konduktor × sirkuit + 2 % untuk jumper dan ujung mati), tiang dan peralatan menurut item pustaka, kabel, parit, galian, duct, sambungan. CSV, Excel, atau file kuantitas TakeoffCraft |
| {{ui:Lembar dan laporan…}} | Satu PDF: denah; lembar profil untuk setiap saluran dengan konduktor pada kasus beban yang Anda pilih dan strip panjang bentang, andongan, dan jarak bebas terendah; serta laporan kajian (set aturan, bagian, tabel penarikan, tiang, setiap pemeriksaan) |
| {{ui:Ekspor ke GIS…}} | Tiang, bentang, rute kabel, peralatan, dan penghalang sebagai lapisan dengan datanya (tinggi, beban, andongan, jarak bebas, apa yang gagal), sebagai GeoPackage, shapefile, GeoJSON, KML, atau KMZ |

GeoJSON dan KML memerlukan sistem koordinat proyek ([Sistem koordinat](topic:coordinate-systems)); tanpa itu, GeoPackage dan shapefile membawa angka proyek itu sendiri.
