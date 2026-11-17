---
title: Reka bentuk taman, dari awal hingga akhir
summary: Sepuluh langkah arkitek landskap, dari tinjauan hingga set yang diterbitkan, dengan apa yang dilakukan Ruang kerja Landskap bagi setiap langkah hari ini dan apa yang belum dilakukannya.
keywords: tutorial, panduan langkah demi langkah, cara, reka bentuk landskap, reka bentuk taman, bermula, contoh, sampel, langkah demi langkah, tinjauan, garisan, tanah, penanaman, jadual, helaian, terbit, satu projek
from: 87900bf5
---

Reka bentuk landskap berkitaran: tinjauan, lakaran, garisan, tanah, kawasan, aras, penanaman, jadual, helaian, dan kembali semula. Inilah sepuluh langkahnya, dengan apa yang ada bagi setiap satu. Di mana satu langkah mempunyai jurang, ia dinamakan dalam **Belum dibina** di hujung, dan tidak disembunyikan dalam langkah itu.

Anda boleh mengikuti pada tapak sampel, atau pada lukisan tinjauan anda sendiri. Dengan lukisan anda sendiri, mulakan pada langkah 1.

## 1. Bawa masuk tinjauan

{{ui:Permukaan}} › {{ui:Garisan daripada lukisan…}}, pilih lukisan tinjauan (DWG 2000–2018 atau DXF). Semak unit, ambil kontur, polygaris 3D dan sempadan untuk permukaan, dan blok titik sebagai titik tinjauan. Bahagian **Aras tinjauan dan semakan** membaca aras yang ditulis sebagai teks atau sebagai atribut dan menyenaraikan apa yang kelihatan tidak kena (unit, sistem koordinat, jarak dari sifar, kontur rata, aras ganjil, titik berganda) sebelum anda menambah apa-apa. Lihat [Semak lukisan tinjauan semasa import](topic:survey-check) dan [Buka DWG atau DXF sebagai garisan](topic:open-dwg-dxf). Tetapkan sistem koordinat dengan {{ui:Sistem koordinat…}}.

## 2. Lakaran tangan

Helaian atas kertas, seperti tinjauan lama atau cetakan yang ditanda, dibawa masuk dengan {{ui:Imbas…}} (Mula daripada imbasan): ia diletakkan mengikut skala atau pada koordinat yang diketahui di bawah pelan, dan boleh dikesan menjadi garisan. ModelCraft membaca foto lakaran tangan (Fail › Import foto lakaran…). CivilCraft sendiri tiada alat untuk lakaran tangan: letakkan helaian di bawah pelan dan lukis di atasnya.

## 3. Lakaran kepada garisan

Lukis garisan ciri dan garis besar di atas tinjauan dalam CivilCraft, atau lukiskannya dalam lukisan 2D. Landskap › Lagi › {{ui:Daripada garisan}} menukar garisan kepada turapan, kawasan tanaman, dinding, anak tangga, garisan ciri dan lain-lain, dikekalkan berpaut: alih garisan dan objek akan mengikutinya. Lihat [Objek daripada garisan](topic:objects-from-lines). Dalam SuperCad Studio, buka tapak, lukisan dan model bangunan dalam satu projek: **Ruang kerja Landskap** mempunyai alat bagi kesemuanya, dan garisan yang dipilih dalam lukisan 2D boleh menjadi objek landskap yang mengikutinya (Ctrl+K, {{ui:Objek landskap daripada garisan lukisan yang dipilih}}).

## 4. Tanah cadangan

Buka {{ui:Permukaan}} › {{ui:Lagi}} › {{ui:Ruang kerja landskap}}. Bina tanah cadangan dengan {{ui:Pelantar}}, {{ui:Benteng tanah}}, {{ui:Parit resapan}} dan kawasan penggredan dengan aras titik dan kontur; turapan, laluan, dinding, ramp dan anak tangga yang anda tambah digred ke dalam permukaan cadangan yang sama. Tanah sedia ada tidak pernah berubah. {{ui:Aras}} › {{ui:Pengubah tanah…}} menyenaraikan semua yang membentuk tanah dalam satu susunan, dengan potongan dan tambakan bagi setiap satu. Lihat [Penggredan](topic:landscape-grading) dan [Pengubah tanah dan aras langsung](topic:ground-modifiers).

## 5. Turapan dan kawasan tanaman

{{ui:Landskap keras}} › {{ui:Turapan}}, {{ui:Laluan}}, {{ui:Dinding}}, {{ui:Kerb}}, {{ui:Ramp}} dan {{ui:Anak tangga}}. {{ui:Kawasan}} melukis laman, katil, padang rumput atau penutup tanah dengan binaannya; ia memotong sendiri di sekeliling turapan, dinding dan anak tangga. {{ui:Katil}} mengisi kawasan pada jarak tumbuhan, daripada campuran tumbuhan. Lihat [Landskap keras](topic:hardscape), [Kawasan tanaman](topic:planted-areas) dan [Penanaman](topic:planting).

## 6. Aras, cerun dan simpang

Di bawah **Semakan penggredan**, tandakan **Analisis cerun** dan **Anak panah aliran dan pengumpulan air**. Jika air bertakung di sebelah teres, tambah {{ui:Parit resapan}} di sekelilingnya. Sifat memberitahu anda berapa banyak tegak yang diperlukan anak tangga dan sama ada ia muat, dan di mana laluan lebih curam daripada hadnya. Panel Masalah menyenaraikan tempat objek bertemu dengan tidak baik: dinding yang terlalu tinggi, katil di atas turapan, anak tangga yang tidak sampai ke pelantarnya. {{ui:Aras titik}} dan {{ui:Anak panah kecerunan}} melabelkan tanah dan mengemas kini sendiri.

## 7. Penanaman

Dalam **Tumbuhan**, cari senarai tumbuhan (beberapa ratus spesies, atau senarai anda sendiri), pilih satu, dan {{ui:Tumbuhan}}, {{ui:Katil}} atau {{ui:Pagar hidup}}. Tetapkan saiz dan label tumbuhan daripada Lagi. Lagi › {{ui:Jadual tumbuhan}} menyunting rekod anda sendiri: kultivar, saiz yang dibekalkan, ketumpatan, nota spesifikasi. Setiap rekod boleh membawa simbol dan model 3D anda sendiri (OBJ, STL atau GLB), dan Lagi › {{ui:Grafik tumbuhan}} melukis tumbuhan dengan lebih ringkas pada skala yang lebih kasar. Lihat [Senarai tumbuhan](topic:plant-list), [Rekod tumbuhan](topic:plant-records) dan [Grafik tumbuhan](topic:plant-graphics).

## 8. Kuantiti dan jadual

Lagi › {{ui:Lembaran kerja}}: jadual tumbuhan dan landskap keras, serta jadual anda sendiri, kekal berpaut kepada objek; simpannya sebagai CSV atau XLSX atau letakkannya pada helaian (lihat [Lembaran kerja](topic:worksheets)). Lagi › {{ui:Jadual tumbuhan…}} menghantar kiraan kepada TakeoffCraft. Kuantiti landskap keras terdapat dalam Sifat turapan, dinding dan anak tangga. Pengairan mempunyai senarai bahannya sendiri: {{ui:Pengairan}} › **Semak sistem…**. Lihat [Pengairan](topic:irrigation).

## 9. Lukisan dan helaian

Lagi › {{ui:Helaian landskap…}}: pelan penanaman, penggredan dan pengairan, dengan perincian. {{ui:Aras}} › {{ui:Garisan keratan}} melukis keratan melalui tanah, dinding, binaan, anak tangga dan tumbuhan. Lihat [Helaian landskap](topic:landscape-sheets) dan [Keratan dan set penerbitan](topic:landscape-sections).

## 10. Terbitkan

{{ui:Set penerbitan (.zip)}} dalam kotak dialog helaian menghasilkan satu PDF dengan senarai helaian dan satu DWG bagi setiap helaian. Lagi › {{ui:Eksport IFC landskap}} memberikan BimCraft tumbuhan dan landskap keras. Simpan projek: semuanya berada dalam satu fail.

## Ubah satu perkara: tangga

Tujuan menyimpan semuanya dalam satu projek ialah perubahan dibawa sehingga ke hujung. Cuba dengan satu deretan anak tangga antara dua teres:

1. Lukis garisan deretan itu sebagai garisan ciri (atau garisan dalam lukisan), kemudian Landskap › Lagi › {{ui:Daripada garisan}} › {{ui:Anak tangga}}. Dalam Sifat anak tangga, tandakan **Membentuk tanah**, dan tetapkan aras bawah dan atas kepada dua teres itu.
2. Lukis katil tanaman di sebelah dan di bawah deretan itu dengan {{ui:Kawasan}}, dan turapan di atas teres. Katil memotong sendiri di sekeliling anak tangga dan turapan, dan jadual tumbuhan hanya mengira apa yang ditanam.
3. Naikkan aras atas deretan itu dalam Sifat. Tanah cadangan, aras titik, anak panah kecerunan serta potongan dan tambakan berubah serta-merta. Jika deretan itu tidak lagi bertemu teres atas, panel Masalah memberitahu sejauh mana.
4. Alih garisan deretan itu. Anak tangga mengikut garisannya dalam langkah buat asal yang sama; katil dipotong semula dan dikira semula, dan lembaran kerja serta jadual menunjukkan nombor baharu.
5. Tekan Ctrl+Z sekali: garisan, anak tangga, tanah dan katil kembali bersama-sama.

Lihat [Pengubah tanah dan aras langsung](topic:ground-modifiers), [Kawasan tanaman](topic:planted-areas) dan [Lembaran kerja](topic:worksheets).

## Belum dibina

Ini diminta tetapi tiada dalam binaan ini:

- Dinding yang membentuk tanah (ia melaporkan di mana ia bertemu dengannya dan bahagian atasnya boleh mengikutinya).
- Menyunting senarai tumbuhan Pustaka anda dalam aplikasi (sunting senarai projek dan simpannya sebagai fail tumbuhan).
- Tekstur dan warna model tumbuhan GLB anda sendiri (bentuknya dibaca; warna tumbuhan digunakan).

Lihat [Ruang kerja Landskap](topic:landscape) untuk setiap alat.
