---
title: Isipadu kerja tanah
summary: Baca isipadu potongan, tambakan dan bersih antara tanah sedia ada dan permukaan yang dicadangkan, bagi setiap pelantar dan koridor serta jumlahnya, dan fahami kaedah grid di sebaliknya.
keywords: isipadu, kerja tanah, potongan, tambakan, bersih, potongan dan tambakan, kuantiti, kaedah grid, perbandingan permukaan, permukaan isipadu, yard padu, meter padu
from: 299d7bc7
---

Sebaik sahaja pelantar atau koridor diratakan tanpa masalah, CivilCraft membandingkan permukaan yang dicadangkan dengan tanah sedia ada dan melaporkan potongan dan tambakan. Nombor dikemas kini dengan setiap perubahan.

## Di mana hendak dibaca

- **Kerja tanah** dalam panel kanan apabila tiada apa-apa dipilih (pandangan **Projek**), apabila terdapat sekurang-kurangnya satu pelantar atau satu koridor.
- **Kerja tanah** dalam panel kanan apabila pelantar dipilih (jumlah yang sama untuk keseluruhan projek).
- Baris di bawah tetapan koridor, dengan potongan dan tambakan koridor itu sendiri.

Blok **Kerja tanah** memaparkan:

- **Potongan**, **Tambakan** dan **Bersih** (dengan "tambakan" atau "potongan" selepasnya, yang mana lebih besar)
- satu baris bagi setiap item apabila terdapat lebih daripada satu, contohnya "Pelantar 1: potongan 120.4 yd padu, tambakan 310.2 yd padu"
- baris kaedah: "Kaedah grid: tanah sedia ada dan permukaan yang diratakan disampel setiap 0.5 ft di dalam garisan persilangan cerun (92,891 sel). Tiada faktor pengembangan atau pengecutan digunakan."

Isipadu dalam yard padu dalam projek kaki dan meter padu dalam projek meter.

## Hantar ke TakeoffCraft

Untuk menentukan harga kerja tanah, pilih {{ui:Hantar ke TakeoffCraft}} di bahagian bawah blok **Kerja tanah**. CivilCraft menyimpan fail kuantiti (`<site>.quantities.json`) dengan dua kuantiti: potongan dan tambakan, dalam yard padu (projek kaki) atau meter padu (projek meter), sama dengan nombor dalam blok itu, hingga dua titik perseratus. Buka dalam TakeoffCraft dengan **Buka pengukuran kuantiti**, atau lepaskannya di sana: ia menjadi dua item yang boleh anda tentukan harganya ([Potongan dan tambakan daripada CivilCraft](app:takeoffcraft/earthwork#cut-and-fill-from-civilcraft)). Hantar semula selepas perubahan dan buka fail baharu: item yang sama mengambil nombor baharu.

Hanya jumlah yang dihantar, supaya tiada apa-apa dikira dua kali; nota fail menyenaraikan potongan dan tambakan setiap pelantar dan koridor.

## Bagaimana ia dikira

CivilCraft menggunakan **kaedah grid**:

1. Satu grid sel persegi diletakkan ke atas kawasan di dalam setiap garisan persilangan cerun.
2. Pada pusat setiap sel, kedua-dua permukaan disampel.
3. Setiap sel dikira sebagai prisma: perbezaan ketinggian darab luas sel. Di mana permukaan yang dicadangkan lebih rendah, ia dipotong; lebih tinggi, ia tambakan.
4. Sel-sel dijumlahkan.

Saiz sel dipilih untuk anda supaya segi empat tepat di sekeliling kawasan yang diratakan memegang kira-kira 250,000 sel, dibundarkan kepada nilai kemas (1, 2 atau 5 kali kuasa sepuluh). Anda belum boleh menetapkannya sendiri. Baris kaedah memberitahu saiz dan bilangan sel. Sel yang lebih kecil lebih tepat di sepanjang tepi; bagi sel penuh antara satah rata, hasilnya tepat.

## Perkara yang perlu diketahui

- Hanya kawasan di dalam garisan persilangan cerun dikira. Tanah di luarnya tidak berubah.
- Pelantar atau koridor yang bermasalah tidak diratakan masuk dan tidak menambah apa-apa. Jika blok menyatakan "Belum ada isipadu: pelantar perlu diratakan tanpa masalah.", cari kotak merah di atasnya.
- Di mana item bertindih, item yang kemudian menggantikan yang terdahulu di dalam garisan persilangan cerunnya, dan pertindihan dikira sekali.
- Tiada faktor pengembangan atau pengecutan digunakan. Darabkan hasilnya sendiri jika anda memerlukan isipadu asal, longgar atau dipadatkan.
- Pengupasan tanah atas, kedalaman turapan dan subgred, serta isipadu prisma TIN-ke-TIN belum tersedia.

## Menyemak hasil

- Hidupkan {{ui:Diratakan (dicadangkan)}} di bawah **Paparan** dan lihat kontur di dalam garisan persilangan cerun.
- Gerakkan penunjuk ke atas kawasan yang diratakan: bar status memaparkan **Tanah** dan **Diratakan**. Perbezaannya ialah kedalaman potongan atau tambakan di tempat itu.
- Untuk koridor, bacaan dalam pandangan profil menunjukkan potongan atau tambakan pada garis tengah di setiap stesen.
