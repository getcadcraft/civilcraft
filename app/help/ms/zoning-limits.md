---
title: Semak jisim terhadap had zonasi yang anda taip
summary: Taip jarak sisihan lot baris demi baris, had ketinggian, satah pendedahan langit, nisbah luas lantai dan liputan, lihat sampul yang boleh dibina pada pelan, dan baca jisim mana yang melanggar had mana.
keywords: zonasi, jarak sisihan, sisihan, depan, sisi, belakang, sampul, kawasan boleh dibina, had ketinggian, satah pendedahan langit, nisbah luas lantai, FAR, liputan, lot, undang-undang kecil, semakan kod
from: 3e267b31
---

**CivilCraft tidak mempunyai kod zonasi di dalamnya.** Ia tidak mengetahui peraturan mana-mana bandar dan tidak menyediakan pustaka peraturan tersebut. Setiap nombor dalam halaman ini ialah satu yang anda taip, diambil daripada undang-undang kecil anda sendiri, dan setiap keputusan menyatakan bahawa ia diukur terhadap had yang anda taip. Ia ialah cara untuk melihat bagaimana had lot membentuk bangunan, bukan keputusan sama ada reka bentuk dibenarkan.

## Taip had

Dalam **Sifat**, di bawah **Jisim bangunan**, pilih **Lot** (atau pilih jisim: had lotnya ditunjukkan di bawahnya). Kemudian isi apa yang terpakai; biarkan kotak kosong untuk "tiada had":

- **Garisan jalan**: garisan lot di jalan. **Jarak sisihan depan** digunakan padanya, **Jarak sisihan belakang** pada garisan yang paling bertentangan dengannya, dan **Jarak sisihan sisi** pada yang lain.
- **Had ketinggian**.
- **Satah langit**: ia bermula pada ketinggian di garisan lot dan naik sebanyak jumlah yang anda taip untuk setiap 1 larian ke dalam, diukur dari garisan jalan atau dari setiap garisan lot (2 bermaksud 2 hingga 1). Ketinggian yang dibenarkan ke atas sesuatu titik ialah yang paling rendah antara satah dan had ketinggian.
- **Nisbah luas lantai** (luas lantai kasar jisim pada lot dibahagi dengan luas lot) dan **Liputan** (jejak kaki mereka dibahagi dengan luas lot, ditaip dalam peratus).

## Sampul

Tandakan **Tunjukkan sampul pada pelan** untuk melukisnya pada lapisan `A-MASS-ENVL`. Sampul ialah lot yang dikurangkan dari setiap garisan lot dengan jarak sisihan garisan itu sendiri, dengan garisan ofset bertemu pada sudut serong. Garisan lot yang dibentuk daripada lengkung diambil sebagai perentas pendek dalam lingkungan 0.01 daripada lengkung. Lot cembung dan cekung kedua-duanya berfungsi. Jika jarak sisihan berlipat ke atas dirinya sendiri (jarak sisihan dalam yang besar pada lot sempit atau sangat cekung), tiada sampul wujud, dan Sifat menyatakannya; cuba jarak yang lebih kecil.

## Keputusan

Di bawah kotak, setiap jisim dan setiap had mendapat satu baris, dengan tanda betul atau silang:

- **jarak sisihan**: luas jisim yang berada di luar sampul;
- **ketinggian**: ketinggian jisim berbanding ketinggian paling dibenarkan ke atas jejaknya (prisma satu ketinggian dihadkan oleh ketinggian paling rendah yang dibenarkan di mana-mana bucunya);
- **nisbah luas lantai** dan **liputan**: semua jisim pada lot ditambah bersama.
