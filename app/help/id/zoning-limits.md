---
title: Periksa massa terhadap batas zonasi yang Anda ketik
summary: Ketik sempadan sebuah lot baris demi baris, batas tinggi, bidang paparan langit, koefisien lantai bangunan, dan koefisien dasar bangunan, lihat amplop yang dapat dibangun di denah, dan baca massa mana yang melanggar batas mana.
keywords: zonasi, sempadan, sempadan depan, sempadan samping, sempadan belakang, amplop, area dapat dibangun, batas tinggi, bidang paparan langit, FAR, KDB, lot, persil, peraturan, pemeriksaan kode
from: 3e267b31
---

**CivilCraft tidak memuat kode zonasi.** Aplikasi ini tidak mengenal aturan kota mana pun dan tidak menyediakan pustakanya. Setiap angka di halaman ini adalah angka yang Anda ketik dari peraturan daerah Anda sendiri, dan setiap hasil menyatakan bahwa hasil itu diukur terhadap batas yang Anda ketik. Ini adalah cara melihat bagaimana batas-batas lot membentuk bangunan, bukan keputusan apakah suatu desain diizinkan.

## Ketik batasnya

Di **Properti**, di bawah **Massa bangunan**, pilih **Persil** (atau pilih massa: batas persilnya ditampilkan di bawahnya). Lalu isi yang berlaku; biarkan kotak kosong untuk "tanpa batas":

- **Garis jalan**: garis lot di jalan. **Sempadan depan** berlaku untuk garis ini, **sempadan belakang** untuk garis yang paling berseberangan dengannya, dan **sempadan samping** untuk sisanya.
- **Batas tinggi**.
- **Bidang paparan langit**: bidang ini dimulai dari ketinggian pada garis lot dan naik sebesar nilai yang Anda ketik untuk setiap 1 jarak ke arah dalam, diukur dari garis jalan atau dari setiap garis lot (2 berarti 2 banding 1). Tinggi yang diizinkan di atas suatu titik adalah yang terendah dari bidang dan batas tinggi.
- **Koefisien lantai bangunan** (luas lantai kotor massa pada lot dibagi luas lot) dan **Koefisien dasar bangunan** (jejak dasar massa dibagi luas lot, diketik dalam persen).

## Amplop

Centang **Tampilkan amplop di denah** untuk menggambarnya pada layer `A-MASS-ENVL`. Amplop adalah lot yang diperkecil dari setiap garis lot sebesar sempadan garis itu sendiri, dengan garis offset bertemu di sudut potong miring. Garis lot yang berupa lengkung diperlakukan sebagai tali busur pendek dalam toleransi 0.01 dari lengkung. Lot cembung dan cekung sama-sama berfungsi. Jika sempadan saling tumpang tindih (sempadan dalam pada lot sempit atau sangat cekung), tidak ada amplop, dan Properti menyatakannya; coba jarak yang lebih kecil.

## Hasil

Di bawah kotak isian, setiap massa dan setiap batas mendapat satu baris, dengan centang atau silang:

- **sempadan**: luas massa yang berada di luar amplop;
- **tinggi**: tinggi massa dibandingkan dengan tinggi terbesar yang diizinkan di atas jejak dasarnya (prisma dengan satu tinggi dibatasi oleh tinggi terendah yang diizinkan di salah satu sudutnya);
- **koefisien lantai bangunan** dan **koefisien dasar bangunan**: semua massa pada persil dijumlahkan.
