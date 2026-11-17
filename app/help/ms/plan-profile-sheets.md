---
title: Helaian pelan dan profil
summary: Plot penjajaran sebagai satu set helaian pelan dan profil dalam satu PDF, dengan garis padanan di antaranya.
keywords: pelan dan profil, helaian, plot, pdf, garis padanan, penghasilan pelan, pelan jalan, plot profil, eksagerasi menegak, set helaian
from: 34b4ec78
---

Helaian pelan dan profil ialah cara pelan jalan biasanya dilukis: setiap helaian menunjukkan satu bahagian jalan dua kali, pelan di atas dan profil di bawah, pada skala mengufuk yang sama, supaya sesuatu stesen berada di tempat yang sama dalam kedua-duanya.

## Hasilkan helaian

1. Pilih penjajaran. Dalam **Properties**, klik {{ui:Plan and profile sheets}}.
2. Pilih **Kertas**, **Skala pelan** dan **Eksagerasi profil** (berapa kali profil dilukis lebih tinggi daripada panjangnya; mulakan dengan 10×). Kotak dialog menyatakan berapa banyak helaian yang terhasil dan berapa bahagian penjajaran yang ditunjukkan setiap helaian.
3. Untuk memplot sebahagian penjajaran, tukar **Dari stesen** dan **Ke stesen**.
4. Klik {{ui:Download PDF}}. PDF itu mempunyai satu halaman bagi setiap helaian.

## Apa yang ada pada helaian

| Bahagian | Yang ditunjukkan |
|---|---|
| Pelan | Semua yang ada pada pelan (kontur, titik ukur, penjajaran dan penomboran stesennya, koridor, pelantar, garis ciri, paip, garis sampel) diputar supaya bahagian ini merentangi helaian, dengan anak panah utara diputar mengikutnya |
| Garis padanan | Garis dash-dot yang bersudut tepat dengan penjajaran di setiap hujung yang bersambung ke helaian lain, dilabel "Garis padanan sta 5+50.00, lihat helaian 2" |
| Profil | Permukaan sedia ada (putus-putus), profil reka bentuk (merah), cerun setiap bahagian lurus dan PVI, aras, L dan K bagi setiap lengkung menegak; stesen di sepanjang bahagian bawah, aras di kedua-dua belah |
| Jalur tajuk | Nama projek, julat stesen penjajaran, "Helaian 1 daripada 3", skala mengufuk dan menegak serta eksagerasi |

Panjang bahagian bagi setiap helaian ialah panjang yang dibenarkan oleh tetingkap pelan pada skala itu, dibundarkan ke bawah kepada 50 ft (20 m) tepat pada bahagian panjang, atau 10 ft (5 m) tepat pada bahagian pendek.

:::note
Apabila aras profil tidak muat pada eksagerasi yang anda pilih, CivilCraft melukis setiap helaian pada nilai terbesar antara 10×, 5×, 4×, 2× dan 1× yang muat, dan bar status akan menyatakannya. Penjajaran melengkung diputar mengikut arah dari titik mula ke titik akhir setiap bahagian, jadi jalan mungkin naik atau turun sedikit pada helaian.
:::
