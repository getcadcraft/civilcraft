---
title: Perkerasan, dinding, dan tangga
summary: Perkerasan dengan kemiringan ke saluran atau kemiringan silang, pola dan lapisannya; jalur yang mengikuti tanah; dinding penahan dan dinding berdiri bebas dengan pondasi bertangga; kerb; ramp dan tangga yang diperiksa terhadap batasnya; ekspor IFC.
keywords: hardscape, perkerasan, paving, paver, patio, teras, terrace, kemiringan, drain, saluran, kemiringan silang, crossfall, herringbone, stretcher bond, jalur, path, jalan setapak, walkway, dinding penahan, retaining wall, dinding taman, garden wall, pondasi, footing, coping, kerb, kanstein, tepi, edging, ramp, aksesibilitas, accessibility, tangga, steps, stairs, tanjakan, risers, injakan, treads, bordes, landing
from: 51475877
---

Hardscape dihitung ulang dari tanah setiap kali, sehingga mengikuti medan dan dibuat ulang saat tanah atau garisnya berubah. Seret sudutnya pada denah seperti garis apa pun. Bukanya dari {{ui:Hardscape}} di grup Lanskap.

## Perkerasan

Klik sudut-sudutnya lalu tekan {{key:Enter}}. Di Properti:

- **Level**: kosong = rata-rata tanah di bawahnya.
- **Kemiringan**: level, **kemiringan silang** (% menuju suatu arah), atau **ke saluran**: CivilCraft meminta Anda mengklik lokasi saluran, lalu setiap sudut naik dari saluran dengan kemiringan tersebut. Panah pada denah menunjukkan kemiringannya.
- **Pola** (grid, stretcher bond, herringbone) dengan ukuran unit, sambungan, dan sudut; lebar **Tepi**. Pada lembar, sambungan yang lebih rapat dari satu milimeter tidak disertakan.
- Perkerasan merupakan bagian dari permukaan rencana. Lapisannya (paver, lapisan alas, dasar) masuk ke IFC dan kuantitas.

## Jalur

Klik sepanjang jalur dan tekan {{key:Enter}}. Jalur mengikuti tanah, dengan **Kemiringan silang** ke sisi kanannya. Jalur yang lebih curam dari **Paling curam yang diizinkan** diberi tanda `!` pada denah di lokasinya, dan Properti menyatakan seberapa curam kemiringannya.

## Dinding

Klik sepanjang dinding dan tekan {{key:Enter}}. Dinding bersifat **penahan** atau **berdiri bebas**. Tanpa **Atas**, dinding berdiri setinggi **Tinggi** di atas tanah sepanjang garisnya; ketik puncak untuk menahannya tetap rata. **Pondasi**-nya berada pada kedalaman tertentu di bawah tanah dan turun bertahap dalam langkah utuh, sehingga tetap rata di antara langkah-langkahnya. Properti memuat panjang, tinggi, luas muka, dan langkah pondasi dinding; denah memberi label puncak dan dasar dinding (TW / BW) di setiap ujung.

:::warning
Dinding penahan yang lebih tinggi dari 1.2 m (4 ft) diberi tanda: seorang insinyur yang merancangnya.
:::

## Kerb

Klik sepanjang kerb dan tekan {{key:Enter}}; atur lebarnya dan tinggi tonjolannya.

## Ramp

Klik dari bawah ke atas dan tekan {{key:Enter}}. Level diambil dari tanah di setiap ujung kecuali jika Anda mengetiknya. Ramp mendapat bordes setiap kenaikan 750 mm (2.5 ft) dan diperiksa terhadap **Paling curam yang diizinkan** (mulai dari 1:12) dan lebar minimum; Properti menyatakan berapa panjang yang diperlukannya.

## Tangga

Klik tepi depan anak tangga paling bawah, lalu di tempat anak tangga mencapai atas, dan tekan {{key:Enter}}. Jumlah tanjakan berasal dari tinggi dan **Tanjakan terbesar**; injakan dari aturan kenyamanan 2R + G ≈ 630 mm, tidak pernah di bawah **Injakan terkecil**; bordes setiap **Tanjakan per rangkaian paling banyak**. Properti menyatakan apakah tangga muat di antara kedua titik atau berapa panjang tambahan yang diperlukan.

:::note
Batas untuk ramp dan tangga adalah nilai default yang diberi label. Atur batas yang disyaratkan oleh kode bangunan Anda.
:::

## Hasil ekspor dari CivilCraft

- Lainnya › {{ui:Ekspor IFC lanskap}}: perkerasan dan jalur sebagai `IfcPavement`, dinding sebagai `IfcWall` (dinding penahan sebagai RETAININGWALL) beserta lapisannya, kerb sebagai `IfcKerb`, ramp sebagai `IfcRamp`, tangga sebagai `IfcStair` dengan tanjakan dan injakannya.
- **Kirim ke TakeoffCraft** pada jadwal tanaman membawa luas perkerasan dan volume lapisan, luas muka dan panjang dinding, panjang kerb, serta jumlah anak tangga.
- Lembar detail menggambar potongan setiap dinding, susunan lapisan setiap perkerasan, dan setiap rangkaian tangga. Lihat [Lembar lanskap](topic:landscape-sheets).
