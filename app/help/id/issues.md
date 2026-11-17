---
title: Isu dan BCF
summary: Sematkan masalah pada denah, stasiun alinyemen, titik permukaan atau pipa, beri status dan komentar, lalu tukar isu sebagai file BCF 2.1 bersama file LandXML.
keywords: isu, bcf, komentar, markup, kekurangan, cacat, lokasi, pin, status, terbuka, diselesaikan, ditutup, format kolaborasi BIM, landxml, masalah
from: e44153b1
---

Isu adalah catatan yang disematkan pada suatu tempat di gambar CivilCraft Anda, dengan judul, status, dan komentar. Gunakan isu untuk memberi tahu staf lapangan atau program lain apa yang perlu diperiksa, dan untuk membaca kembali jawaban mereka.

## Tambahkan isu

1. Buka **Permukaan, Lainnya, Isu (BCF)...**
2. Ketik judul dan apa yang salah.
3. Pilih tempat penyematan: pusat tampilan denah, titik permukaan di pusat, sebuah stasiun dari alinyemen yang dipilih (ketik stasiun dan offset, kanan bernilai positif), atau pipa, bangunan, atau garis fitur yang dipilih.
4. Tekan **Tambahkan isu**. Pin tampil di denah sebagai berlian kecil dengan nomornya.

Klik judul isu untuk memperbesar tampilan ke isu tersebut, ubah statusnya di daftar (Terbuka, Aktif, Diselesaikan, Ditutup), dan tambahkan komentar. Setiap perubahan adalah satu langkah urungkan, dan isu disimpan dalam file proyek.

## Tukar sebagai BCF

- **Ekspor BCF** menulis file BCF 2.1 dengan satu topik per isu: judul, status, komentar, dan satu viewpoint dengan kamera denah ortogonal serta pin.
- **Impor BCF** membaca file BCF (file 2.0 dan 3.0 dibaca sejauh sesuai dengan 2.1). Topik dengan guid yang sudah Anda miliki akan memperbarui isu tersebut (status, komentar baru) alih-alih menambahkan isu kedua.
- **Dari Masalah** membuat isu dari setiap entri terbuka di panel Masalah yang menyebutkan lokasinya.

BCF membawa koordinat proyek ini dalam meter, tanpa pergeseran. Program lain harus berada dalam sistem koordinat yang sama dengan file LandXML Anda agar pin tepat sasaran. Elemen yang ditunjuk pin (alinyemen, stasiun, offset, pipa) dibawa sebagai label yang diawali "cc:", yang dibaca kembali oleh CivilCraft.

## Yang tidak diperiksa

Pin dan viewpoint hanya diuji dengan menulis file lalu membacanya kembali di CivilCraft. Belum ada program BIM lain yang membukanya. Apakah "view to world scale" pada BCF berarti tinggi penuh atau setengah tinggi tampilan berbeda antarprogram: CivilCraft menulis tinggi penuh.
