---
title: Grading untuk lanskap
summary: Platform, berm, swale, dan grading bebas dengan level titik dan kontur yang Anda seret, galian dan timbunan langsung, analisis kemiringan, panah aliran, dan genangan, semuanya dalam permukaan rencana CivilCraft.
keywords: dinding penahan, retaining wall, retaining walls, sisi vertikal, vertical side, dinding alih-alih lereng, wall instead of slope, lereng per sisi, side slope per side, timbunan, embankment, grading, grading lanskap, landscape grading, platform, teras, terrace, pad, berm, gundukan, mound, swale, level titik, spot elevation, spot level, kontur, contours, sunting kontur, edit contours, galian dan timbunan, cut and fill, pekerjaan tanah, earthwork, analisis kemiringan, slope analysis, aksesibilitas, accessibility, lereng curam, steep slopes, panah aliran, flow arrows, drainase, drainage, genangan, ponding, air tergenang, puddles
from: e1559eb9
---

Semua di sini di-grading ke dalam **permukaan rencana** dengan grading yang sama seperti pad dan koridor. **Tanah yang ada** tidak pernah diubah, dan Pekerjaan tanah menghitung semuanya. Menu Grading berada di grup Lanskap.

## Platform

{{ui:Grading}} › {{ui:Platform}}, lalu klik sudut-sudutnya dan tekan {{key:Enter}}. Platform dimulai dari elevasi tanah rata-rata di bawahnya; ketik **Elevasi** untuk mengaturnya, atau kosongkan agar kembali mengikuti tanah. **Kemiringan** dalam % dan **Menghadap ke** dalam derajat (0 = timur, 90 = utara) memiringkannya. Sisinya di-grading ke tanah pada **Lereng galian** dan **Lereng timbunan** (horizontal terhadap 1).

## Lereng per sisi dan dinding penahan

Di bawah **Sisi dan dinding penahan tanah** pada Properti pad, platform, atau berm, setiap sisi dapat di-grading dengan caranya sendiri. Sisi 1 berjalan dari sudut pertama yang Anda klik ke yang kedua, sisi 2 dari yang kedua ke yang ketiga, dan seterusnya.

- **Semua sisi**: **Berlereng** memakai lereng galian dan timbunan di atas untuk setiap sisi; **Vertikal: dinding penahan** memasang dinding di setiap sisi.
- Per sisi: **Lereng di atas**, **Lerengnya sendiri** (ketik lereng galian dan timbunan untuk sisi itu) atau **Vertikal (dinding penahan)**.
- Ketik lereng sebagai `3` atau `3:1` (horizontal terhadap 1 vertikal), `33%` atau `18.4°`; ditampilkan sebagai H:1. **Lereng galian** dan **Lereng timbunan** milik pad itu sendiri memakai cara yang sama.
- Sisi vertikal tidak memiliki timbunan tanggul: dinding penahan berjalan di sepanjang tepi, dari pad turun ke tanah yang ada (pada timbunan) atau dari tanah turun ke pad (pada galian). **Tebal dinding** (mulai dari 0.3 m atau 1 ft) adalah seberapa jauh tanah bertangga dari tepi pad ke tanah yang ada. Volume galian dan timbunan tidak menghitung tanggul yang sudah tidak dimiliki sisi itu.
- Jika dinding bertemu sisi berlereng, lereng membungkus ujung dinding; dua dinding bertemu dengan sudut miring (mitre).
- Di bawah kolom isian: panjang dinding, muka terbuka (tinggi × panjang), tinggi tertinggi dan rata-rata.

Denah menggambar muka luar setiap dinding dengan garis pendek melintangnya serta tingginya di kedua ujung dan di titik tertinggi (pada layer dinding penahan, yang juga masuk ke DXF dan DWG). Tampilan 3D menampilkan dinding sebagai solid (Tampilkan › Dinding penahan), dan ekspor GLB, OBJ, dan USD menyertakannya. Potongan melintang tepi menampilkan langkahnya.

**Peringatan** (di Properti, dan di panel Masalah): dinding yang lebih tinggi dari **Beri peringatan di atas tinggi dinding** (mulai dari 1.0 m atau 3.3 ft) "mungkin memerlukan dinding rekayasa atau izin; periksa aturan setempat", dan, saat Anda mengetik **Lereng tercuram yang dapat ditahan tanah**, sisi mana pun yang lereng galian atau timbunannya lebih curam dari itu. Ini hanya peringatan: grading tetap dibangun. Setiap perubahan adalah satu langkah untuk {{key:Mod+Z}}.

## Berm

{{ui:Grading}} › {{ui:Berm}}: gundukan yang puncaknya berada **Tinggi** di atas tanah rata-rata di bawahnya, sisinya di-grading ke luar.

## Swale

{{ui:Grading}} › {{ui:Swale}}, lalu klik sepanjang swale **searah aliran air** dan tekan {{key:Enter}}. Atur **Kedalaman**, **Lebar dasar** (0 untuk bentuk V), dan **Lereng sisi**. Tanpa **Kemiringan**, dasarnya mengikuti tanah, berada pada kedalaman di bawahnya, dan tidak pernah naik; ketik kemiringan agar dasarnya memiliki kemiringan tetap sejak titik awalnya.

## Elevasi titik dan kontur

1. {{ui:Grading}} › {{ui:Area grading}}: klik garis tepi area yang ingin Anda bentuk.
2. {{ui:Grading}} › {{ui:Elevasi titik}}: klik di dalam area. Ketik elevasinya di Properti, atau gunakan tombol ▲ ▼.
3. {{ui:Grading}} › {{ui:Sunting kontur}}: klik sebuah kontur di dalam area untuk mengambilnya sebagai garis yang dapat Anda bentuk ulang.

Pilih sebuah titik atau kontur dan **seret** (atau titiknya) pada denah: permukaan mengikuti saat Anda melepas, sebagai satu langkah urungkan. Di dalam area, tanah dibangun ulang dari tepinya (tempat ia bertemu tanah yang ada), elevasi titik, dan kontur yang disunting.

## Galian dan timbunan, langsung

Properti setiap objek grading menampilkan **Galian** dan **Timbunan**-nya serta seluruh tapak, dengan metode grid yang dipakai Pekerjaan tanah, saat Anda mengubahnya. Masalah (di luar permukaan, garis tepi yang berpotongan dengan dirinya sendiri) didaftar di sana.

## Pemeriksaan grading

Di bagian **Pemeriksaan grading** di sebelah kiri:

- **Analisis kemiringan** memberi warna permukaan menurut kemiringan: sampai batas landai, di antaranya, dan lebih curam dari batas curam (mulai dari 5 % dan 33.3 %: 1:20 yang lazim untuk jalur aksesibel dan 1:3 untuk pemotongan rumput). Keterangan menyatakan berapa luas area yang masuk ke tiap kelas. Area curam juga dicetak pada lembar.
- **Panah aliran dan genangan** menggambar arah aliran air dan melingkari setiap tempat yang akan tergenang, beserta kedalamannya; bagian tersebut menyatakan berapa tempat, yang terdalam, dan berapa banyak air yang ditampungnya.

Pemeriksaan membaca permukaan rencana jika ada yang di-grading, jika tidak tanah yang ada.
