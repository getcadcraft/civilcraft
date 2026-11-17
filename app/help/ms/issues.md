---
title: Isu dan BCF
summary: Pin masalah pada pelan, stesen penjajaran, titik permukaan atau paip, beri status dan komen, serta tukar isu sebagai fail BCF 2.1 bersama fail LandXML.
keywords: isu, isu, bcf, komen, penanda, kecacatan, kerosakan, tapak, pin, status, terbuka, diselesaikan, ditutup, format kerjasama BIM, landxml, masalah
from: e44153b1
---

Isu ialah nota yang dipin pada satu lokasi dalam lukisan CivilCraft anda, dengan tajuk, status dan komen. Gunakannya untuk memberitahu kakitangan tapak atau program lain perkara yang perlu diperiksa, dan untuk membaca semula jawapan mereka.

## Tambah isu

1. Buka **Permukaan, Lagi, Isu (BCF)...**
2. Taip tajuk dan apa yang tidak betul.
3. Pilih tempat untuk pin: pusat paparan pelan, titik permukaan di pusat, stesen penjajaran yang dipilih (taip stesen dan ofset, kanan ialah positif), atau paip, struktur atau garis ciri yang dipilih.
4. Tekan **Tambah isu**. Pin ditunjukkan pada pelan sebagai berlian kecil dengan nombornya.

Klik tajuk isu untuk zum kepadanya, tukar statusnya dalam senarai (Terbuka, Aktif, Diselesaikan, Ditutup) dan tambah komen. Setiap perubahan ialah satu langkah buat asal, dan isu disimpan dalam fail projek.

## Tukar isu sebagai BCF

- **Eksport BCF** menulis fail BCF 2.1 dengan satu topik bagi setiap isu: tajuk, status, komen, dan satu titik pandangan dengan kamera pelan ortogon serta pin.
- **Import BCF** membaca fail BCF (fail 2.0 dan 3.0 dibaca setakat yang sepadan dengan 2.1). Topik dengan guid yang sudah anda ada akan mengemas kini isu itu (status, komen baharu) dan bukannya menambah isu kedua.
- **Daripada Masalah** membuat isu daripada setiap entri terbuka dalam panel Masalah yang menyatakan lokasinya.

BCF membawa meter dalam koordinat projek ini sendiri, tanpa anjakan. Program lain mesti berada dalam sistem koordinat yang sama dengan fail LandXML anda supaya pin tepat di tempat yang betul. Elemen yang ditunjuk oleh pin (penjajaran, stesen, ofset, paip) dibawa sebagai label yang bermula dengan "cc:", dan CivilCraft membacanya semula.

## Perkara yang tidak disemak

Pin dan titik pandangan hanya diuji dengan menulis fail dan membacanya semula dalam CivilCraft. Belum ada program BIM lain yang membukanya, dan sama ada "view to world scale" dalam BCF bermaksud ketinggian penuh atau separuh ketinggian pandangan berbeza antara program: CivilCraft menulis ketinggian penuh.
