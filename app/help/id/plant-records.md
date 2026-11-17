---
title: Rekaman tanaman, kultivar, dan ukuran pasok
summary: Daftar tanaman proyek Anda sendiri sebagai tabel: kultivar, ukuran pasok (pot, bola akar, lingkar batang, batang bersih), kerapatan, catatan spesifikasi, CSV masuk dan keluar; setiap tanaman yang ditempatkan menyebutkan ukuran; simbol tanaman menurut skala serta simbol dan model 3D sendiri.
keywords: tabel tanaman, basis data tanaman, kultivar, varietas, ukuran pasok, pot, bola akar, rootball, akar telanjang, lingkar batang, batang bersih, kerapatan, tanaman per meter persegi, spesifikasi, catatan spesifikasi, simbol tanaman, blok, simbol sendiri, tanaman 3D, tingkat detail, skala
from: 12251beb
---

Buka {{ui:Tabel tanaman}} dari menu {{ui:Lainnya}} grup Lanskap, atau dari bagian Tanaman. Setiap baris adalah rekaman tanaman dalam daftar proyek ini sendiri (rekaman dari daftar tanaman disalin saat Anda menambahkannya). Setiap perubahan diperiksa seperti file yang diimpor, dan merupakan satu langkah urungkan.

## Kolom

- **Nama botani**, **Nama umum**, **Jenis**, **Tinggi**, dan **Lebar tajuk** saat dewasa (meter).
- **Jarak** (dari pusat ke pusat) atau **Kerapatan** (tanaman per m²). Bedengan dari rekaman dengan kerapatan dan tanpa jarak diisi pada kerapatan tersebut, sesuai polanya sendiri (segitiga atau persegi).
- **Ukuran pasok**: satu entri untuk setiap ukuran, dipisahkan `;`. Setiap entri berisi id, jenis (`container`, `rootball`, `wrapped`, `bareroot`, `plug`, `seed`), lalu salah satu dari: volume `10L`, tinggi `h0.6`, lebar `s0.4`, lingkar batang `g14-16` (cm), batang bersih `st1.8`. Contoh: `c10 container 10L h0.6; rb rootball h3 g14-16 st1.8`.
- **Kultivar**: nama dipisahkan `;`. Kultivar menyimpan ukuran dan catatannya sendiri ketika file yang Anda impor memilikinya.
- **Catatan spesifikasi**.

{{ui:Duplikat}} menyalin baris dengan kunci baru; {{ui:Simpan sebagai CSV}} dan {{ui:Simpan sebagai file tanaman}} menulis daftar (baris CSV untuk kultivar berada di bawah spesiesnya, dengan `cultivar_of`). Mengimpor CSV atau file tanaman akan menggabungkannya.

## Daftar tanaman Pustaka Anda

Masuk ke akun CadCraft Anda (Pengaturan, Add-on Anda, Masuk) dan tabel tanaman dapat memakai daftar yang Anda simpan di Pustaka:

- {{ui:Dari daftar Pustaka saya}} membawa item tanaman Anda sendiri (termasuk yang masih menunggu tinjauan). Tanaman yang sudah ada di sini diperbarui dari Pustaka; kultivar, ukuran pasok, kerapatan, dan spesifikasi yang Anda tambahkan di sini tetap disimpan.
- {{ui:Simpan sebagai daftar tanaman}} menyimpan setiap baris sebagai item tanaman Pustaka Anda sendiri, satu item per spesies: tanaman baru menjadi item baru, tanaman yang berubah menjadi versi baru, dan yang tidak berubah dibiarkan. Centang kotak terlebih dahulu: menyimpan akan memberikan tanaman kepada publik di bawah CC0. Unggahan publik pertama dari orang yang belum tepercaya diperiksa oleh orang sebelum tampil, seperti setiap unggahan.

Pustaka menyimpan rekaman tanaman dasar. Kultivar, ukuran pasok, kerapatan, dan catatan spesifikasi tetap berada di proyek dan di file tanaman ({{ui:Simpan sebagai file tanaman}}); dialog menyebutkan berapa banyak baris yang terpengaruh setiap kali Anda menyimpan.

## Tanaman yang ditempatkan menyebut ukuran

Pilih tanaman, pagar, atau baris campuran dari bedengan atau area tanam: ketika rekaman memiliki kultivar atau ukuran pasok, {{ui:Kultivar dan ukuran}} memilih salah satunya. Jadwal tanaman kemudian menghitung menurut spesies, kultivar, dan ukuran, dan label dapat menampilkannya: `{botanical} '{cultivar}' {size}` atau `{full}`.

## Simbol tanaman menurut skala

{{ui:Grafik tanaman}} (Lanskap › Lainnya) mengatur cara tanaman digambar di denah: **otomatis** (lebih kasar dari 1:500 lingkaran sebesar lebar tajuk, antara 1:200 dan 1:500 garis tepi dengan pusatnya, lebih halus simbol rinci; kedua skala dapat diubah) atau satu tingkat untuk setiap skala. Dialog Lembar memiliki **Detail tanaman di denah** sendiri untuk set tersebut.

Pada rekaman di bagian Tanaman, {{ui:Simbol sendiri…}} membaca SVG, atau blok gambar DXF/DWG, dan menggambarnya sebesar lebar tajuk tanaman pada tingkat rinci. {{ui:Model 3D sendiri…}} membaca OBJ, STL, atau GLB; di Grafik tanaman pilih **Model sendiri tiap rekaman** untuk melihatnya dalam 3D. File dibatasi (512 KB SVG, 2000 bentuk, 50 000 segitiga) dan disimpan di dalam proyek. Transformasi SVG tidak diterapkan (Anda diberi tahu jika file memilikinya). Lihat [Grafik tanaman menurut skala, simbol sendiri, dan tanaman 3D](topic:plant-graphics) untuk tingkatnya, batasnya, dan isi GLB.
