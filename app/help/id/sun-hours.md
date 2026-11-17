---
title: Hitung jam matahari di lokasi
summary: Pilih hari (atau musim) dan zona waktu, lalu lihat jam sinar matahari langsung pada setiap dinding setiap massa bangunan dan pada tanah di sekitarnya, dengan tanah digambar di denah dan angkanya sebagai CSV.
keywords: matahari, jam matahari, bayangan, naungan, akses matahari, jam siang, fasad, dinding, musim, solstis, ekuinoks, zona waktu, waktu musim panas, lintang, bujur, CSV, raster
from: 4e32a314
---

**Jam matahari** menghitung jam sinar matahari langsung yang mencapai setiap dinding setiap massa bangunan dan tanah di sekitarnya, pada hari yang Anda pilih atau dirata-ratakan selama satu musim. Massa bangunan dan tanahnya sendiri menimbulkan bayangan; tidak ada yang lain (tidak ada pohon, tidak ada tetangga yang belum Anda gambar). Cahaya langit yang bukan sinar matahari langsung tidak dihitung.

## Sebelum mulai

Posisi matahari berasal dari garis lintang dan bujur lokasi, yang diambil dari **sistem koordinat** proyek. Proyek tanpa sistem koordinat akan ditolak dengan pesan: atur dulu (**Koordinat** di grup GIS). Garis lintang dan bujur yang diketik manual akan berupa tebakan, sehingga tidak ada kotak untuk keduanya.

## Hitung

Di **Properti**, di bawah **Massa bangunan**, **Jam matahari**:

1. Pilih **Hari**. Awalnya adalah hari ketika matahari paling rendah di tempat Anda (21 Desember, atau 21 Juni di belahan bumi selatan). Untuk satu musim, centang **Selama satu musim**, pilih **Hari terakhir** dan berapa hari jaraknya untuk pengambilan sampel.
2. Ketik **Zona waktu**: nama seperti `America/Mexico_City`, atau selisih dari UTC seperti `-6`. Nama mengikuti aturan waktu musim panas zona itu untuk hari tersebut; selisih yang Anda ketik dipakai persis seperti yang diketik, jadi gunakan yang berlaku pada hari itu. Baris di bawah kotak memberi tahu selisih yang ditemukan.
3. Pilih seberapa sering matahari ditempatkan (setiap 5, 10, 15 atau 30 menit), lalu **Hitung jam matahari**. Satu musim berjalan di pekerja latar belakang; **Hentikan** membatalkannya.

## Yang Anda dapatkan

- Tabel per massa: **dinding terburuk**, **rata-rata** dan **dinding terbaik**, dalam jam per hari, dan tabel setiap dinding dengan arah hadapnya serta jamnya per lantai.
- Tanah di sekitar massa, digambar di denah dari gelap (tanpa matahari) hingga kuning (paling banyak yang diterima sel mana pun), dengan keterangannya. Sel di bawah massa dibiarkan kosong. **Tampilkan tanah di denah** mematikannya.
- **Dinding sebagai CSV** dan **Tanah sebagai CSV** menyimpan angkanya.

Untuk satu musim, angkanya adalah rata-rata per hari dari hari-hari yang diambil sampelnya. Tidak ada yang disimpan dalam proyek: hasilnya untuk dilihat, dan menjalankannya lagi akan membuatnya kembali.

## Perlu diketahui

- Sebuah dinding menghitung suatu momen sebagai cerah hanya jika menghadap matahari dan tidak ada yang menghalangi. Dinding yang menghadap ke arah lain tidak mendapat apa-apa.
- Tanah diambil sampelnya pada kisi yang bergantung pada ukuran lokasi, dan posisi matahari dihitung di tengah setiap langkah waktu, sehingga jamnya akurat sampai sebesar langkah yang Anda pilih.
- Posisi matahari adalah rumus astronomi yang dipublikasikan, akurat sampai sekitar satu menit busur.
