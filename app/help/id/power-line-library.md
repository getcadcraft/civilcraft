---
title: Pustaka saluran listrik Anda
summary: Buat konduktor, kabel bawah tanah, tiang, peralatan, dan jenis parit Anda sendiri, dalam kategori yang Anda namai, dan bagikan sebagai file.
keywords: pustaka, konduktor, kabel, tiang, penyangga, travers, isolator, perlengkapan, kabel penahan, guy, stay, transformator, kabinet, sambungan, parit, kategori, csv, impor, ekspor
from: 88733744
---

Bagian **Pustaka** di ruang kerja Saluran listrik menyimpan setiap item yang dapat digunakan oleh saluran atau kabel. Tidak ada yang terikat pada negara atau pabrikan: Anda membuat item yang Anda gunakan.

## Tiga jenis item

| Jenis | Tempat | Bisa Anda ubah? |
|---|---|---|
| **Contoh** | Disertakan dengan CivilCraft, dengan angka generik yang kami hitung dari sifat material | Tidak: {{ui:Salin ke pustaka saya}} dulu |
| **Dalam proyek** | Datang bersama file proyek yang Anda buka | Tidak: {{ui:Salin ke pustaka saya}} dulu |
| **Milik saya** | Item Anda sendiri, disimpan di peramban ini | Ya, dan perubahan langsung disimpan |

Setiap proyek menyimpan salinan setiap item yang digunakannya, sehingga proyek terbuka di komputer mana pun dengan konduktor dan tiangnya sendiri.

:::warning
Item contoh hanyalah contoh: periksa setiap angka dengan data pemasok Anda. Kabel bawah tanah sengaja tidak memiliki kapasitas arus, karena hal itu bergantung pada cara kabel dipasang.
:::

## Membuat item

1. Di **Pustaka**, pilih **Jenis** (konduktor udara, kabel bawah tanah, tiang, peralatan, atau jenis parit).
2. Klik {{ui:Item baru}}, atau pilih contoh lalu klik {{ui:Salin ke pustaka saya}} atau {{ui:Duplikat}}.
3. Isi kolomnya. Kolom yang diberi tanda `*` adalah yang dibutuhkan pemeriksaan; item yang kekurangan satu diberi tanda `!` dan dicantumkan di bawah **Pemeriksaan** saat sebuah saluran menggunakannya.
4. Berikan **Kategori**, dengan `/` di antara tingkatan: `Udara/TR/Berkas`, `Tiang/Beton/12 m`. Pohon mengikuti kategori Anda.

Yang dibutuhkan setiap jenis:

| Jenis | Dibutuhkan untuk pemeriksaan |
|---|---|
| Konduktor udara | penampang, diameter, massa per meter, kekuatan putus, modulus elastisitas, muai termal |
| Kabel bawah tanah | inti, penampang, tegangan, diameter, resistansi, kapasitas arus |
| Tiang | panjang keseluruhan, beban nominal (diambil pada titik di bawah puncak), kedalaman di dalam tanah |
| Peralatan | jenisnya; beban peringkat untuk travers, perlengkapan, dan kabel penahan; jarak fasa dan jatuh untuk travers; panjang untuk isolator; sudut untuk kabel penahan |
| Jenis parit | kedalaman, lebar, selimut tanah di atas kabel |

## Bagikan

- {{ui:Simpan pustaka saya}} menyimpan setiap item milik Anda sebagai satu file `.cclines.json`; {{ui:Buka pustaka…}} membacanya kembali (item dengan kunci yang sama digantikan).
- {{ui:Simpan sebagai CSV}} menyimpan jenis yang sedang Anda lihat sebagai spreadsheet; {{ui:Buka pustaka…}} membaca kembali CSV jenis itu. Kolom boleh dalam urutan apa pun; file berpemisah titik koma boleh memakai koma desimal.
