---
title: Hitung debit desain air limbah dan periksa saluran pembuangan
summary: Masukkan orang dan luas yang masuk di setiap lubang manhole jaringan air limbah; CivilCraft menjumlahkannya ke bawah jaringan, menghitung debit puncak dengan faktor puncak dan infiltrasi, lalu memeriksa kapasitas dan kecepatan setiap pipa.
keywords: air limbah, saluran pembuangan, saluran air limbah, air buangan, debit desain, debit puncak, faktor puncak, harmon, babbitt, infiltrasi, populasi, per kapita, persen terisi, pembersihan mandiri, kecepatan, ukuran pipa, lembar desain
from: 73ba197a
---

Debit desain air limbah bekerja pada [jaringan pipa](topic:pipe-network) ketika {{ui:Tipe}}-nya adalah {{ui:Air limbah}}. Jika tidak ada yang dipilih, panel kanan menampilkan **Debit desain air limbah** di tempat jaringan drainase badai akan menampilkan drainase badai.

## Masukkan apa yang masuk

1. Pilih sebuah manhole. Di bawah **Debit desain air limbah**, ketik {{ui:Orang yang masuk di sini}} dan {{ui:Area yang masuk di sini}} (hektar pada proyek meter, acre pada proyek kaki).
2. Untuk toko, kantor, atau industri, ketik orang setara: luas dikali orang per hektar (atau per acre) yang dipakai instansi Anda. Luas tetap dihitung untuk infiltrasi dalam kedua kasus.
3. Ulangi untuk setiap manhole tempat jalan atau kapling tersambung. Manhole yang tidak ada sambungannya tetap bernilai 0 untuk keduanya.

Setiap pipa membawa semua yang masuk di manhole hulunya dan di atasnya. Pilih sebuah manhole untuk melihat apa yang melewatinya.

## Pengaturan

| Pengaturan | Artinya |
|---|---|
| {{ui:Debit per orang}} | debit rata-rata satu orang per hari: liter (proyek meter) atau galon AS (proyek kaki) |
| {{ui:Infiltrasi}} | air tanah yang merembes masuk: liter per detik per hektar, atau galon per hari per acre |
| {{ui:Faktor puncak}} | Harmon, 1 + 14 / (4 + √P), atau Babbitt, 5 / P^0.2, dengan P adalah populasi dalam ribuan |
| {{ui:Faktor puncak paling sedikit}} / {{ui:Faktor puncak paling banyak}} | faktor ditahan di antara kedua nilai ini |
| {{ui:n Manning}} | untuk kapasitas dan kecepatan |
| {{ui:Kecepatan terkecil}} / {{ui:Kecepatan terbesar}} | pada kedalaman pipa untuk debit puncak itu sendiri |
| {{ui:Paling banyak dari kapasitas penuh}} | seberapa penuh pipa boleh terisi pada puncak, sebagai persen dari yang dialirkannya saat penuh |

Nilai awal adalah nilai sementara, bukan standar. Gunakan nilai yang diterbitkan instansi Anda.

## Yang dihitung

Untuk setiap pipa, sesuai urutan aliran:

- debit puncak = orang × debit per orang × faktor puncak + luas × infiltrasi
- kapasitas saat penuh (persamaan Manning pada kemiringan pipa), dan seberapa penuh debit puncak membuatnya
- kedalaman normal debit puncak dan kecepatan di situ

Tabel **Hasil air limbah** mencantumkan orang, faktor puncak, debit puncak (L/s, atau gpm dan kaki kubik per detik), persen terisi, dan kecepatan setiap pipa. Masalah dicantumkan di bawahnya: pipa yang lebih penuh dari batas, lebih lambat dari kecepatan terkecil (mungkin tidak membersihkan dirinya sendiri), lebih cepat dari kecepatan terbesar, atau tanpa kemiringan. {{ui:Pipa ukuran untuk debit ini}} memilih untuk setiap pipa ukuran standar terkecil (200 mm atau 8 inci ke atas) yang membawa debit puncaknya dalam batas; satu {{key:Mod+Z}} membatalkannya.

:::note
Ini adalah debit puncak tunak yang dihitung sebuah lembar desain, diperiksa terhadap lembar desain yang dipublikasikan sampai pembulatan cetaknya. Ini bukan model saluran dari waktu ke waktu: tidak ada hidrograf, tampungan, pompa, atau luapan. Lihat [Belum dibuat](topic:not-built-yet).
:::

Kecepatan dihitung dengan persamaan Manning dengan n yang sama pada setiap kedalaman. Beberapa bagan sebagian-penuh instansi membiarkan n berubah menurut kedalaman, yang menghasilkan kecepatan sedikit lebih rendah pada pipa yang terisi 60 sampai 70 persen (sekitar 3 persen lebih rendah).
