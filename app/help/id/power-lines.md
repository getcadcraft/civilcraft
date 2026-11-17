---
title: Ruang kerja saluran listrik
summary: Saluran udara dan kabel bawah tanah di lokasi Anda, dengan pustaka Anda sendiri, andongan dan tegangan di bawah kasus beban Anda, pemeriksaan jarak bebas dan kekuatan, tabel penarikan, kuantitas, lembar, dan ekspor GIS.
keywords: saluran listrik, power line, saluran udara, listrik, distribusi, tiang, penyangga, konduktor, andongan, tegangan, penarikan, jarak bebas, kabel bawah tanah, parit, ruang kerja, utilitas
from: 638dd856
---

Ruang kerja Saluran listrik menempatkan saluran udara dan kabel bawah tanah di lokasi CivilCraft yang sudah Anda miliki: titik survei yang sama, tanah yang sama, file proyek yang sama.

:::warning
Alat bantu desain. Ruang kerja menghitung andongan, tegangan, jarak bebas, dan beban dari **kasus beban dan batas** Anda sendiri; tidak ada standar negara yang dibangun di dalamnya. Seorang insinyur memeriksa setiap hasil terhadap standar yang berlaku sebelum apa pun dibangun.
:::

## Buka

Pilih {{ui:Permukaan}} › {{ui:Lainnya}} › {{ui:Ruang kerja saluran listrik}}, atau **Saluran listrik** di bawah Ruang kerja. Bilah alat kemudian menampilkan grup **Saluran listrik**; grup Desain dan GIS dikesampingkan. Pilih **Civil** di bawah Ruang kerja untuk kembali. CivilCraft mengingat ruang kerja yang terakhir Anda gunakan di komputer ini.

Panel kiri mendapat dua bagian di bagian atasnya:

- **Saluran listrik**: kasus beban dan batas Anda, saluran dan kabel dalam proyek, serta **Pemeriksaan**, yang selalu mutakhir. Klik sebuah pemeriksaan untuk memilih hal yang dimaksudnya.
- **Pustaka**: konduktor, kabel, tiang, peralatan, dan jenis parit Anda sendiri. Lihat [Pustaka saluran listrik Anda](topic:power-line-library).

## Apa yang ada di grup Saluran listrik

| Alat | Fungsinya | Topik |
|---|---|---|
| **Saluran** | Saluran udara: klik setiap tiang | [Gambar saluran udara](topic:overhead-line) |
| **Tiang** | Tambahkan tiang pada sebuah bentang | [Gambar saluran udara](topic:overhead-line) |
| **Kabel** | Rute kabel bawah tanah di dalam parit | [Kabel bawah tanah](topic:underground-cables) |
| **Peralatan** | Kabinet, transformator, sambungan, atau sumber tempat jaringan diberi daya | [Kabel bawah tanah](topic:underground-cables) |
| **Penghalang** | Sesuatu yang dilintasi saluran: jalan, bangunan, saluran lain | [Pemeriksaan](topic:power-line-checks) |
| **Profil** | Profil saluran: tanah, tiang, dan konduktor pada setiap kasus beban | [Gambar saluran udara](topic:overhead-line#the-line-profile) |
| **Lainnya** | Kasus beban dan batas, tabel penarikan, kuantitas, lembar dan laporan, GIS, file kajian | [Andongan dan tegangan](topic:sag-and-tension), [Keluaran](topic:power-line-outputs), [File kajian](topic:power-line-study-file) |

Setiap yang Anda tambahkan adalah satu langkah urungkan, disimpan di file proyek, dan digambar di denah pada layer bernama `C-POWR-…`, sehingga ekspor DXF, DWG, dan PDF juga membawanya.
