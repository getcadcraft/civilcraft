---
title: Perkerasan, dinding, dan tangga
summary: Perkerasan dengan kemiringan ke drainase atau kemiringan melintang, pola dan susunan lapisannya; jalur yang mengikuti tanah; dinding penahan dan dinding berdiri bebas dengan pondasi bertangga; kereb; ramp dan tangga yang diperiksa terhadap batasnya; IFC keluar.
keywords: hardscape, perkerasan, paving block, teras, halaman, kemiringan, drainase, kemiringan melintang, herringbone, stretcher bond, jalur, jalur pejalan kaki, dinding penahan, dinding taman, pondasi telapak, mahkota dinding, kereb, kereb, tepi, ramp, aksesibilitas, tangga, anak tangga, tanjakan, injakan, bordes
from: d34b4466
---

Hardscape dihitung ulang dari tanah setiap kali, sehingga mengikuti medan dan dibuat ulang ketika tanah atau garisnya berubah. Seret sudutnya di denah seperti garis lainnya. Bukalah dari {{ui:Hardscape}} di grup Lanskap.

## Perkerasan

Klik sudut-sudutnya dan tekan {{key:Enter}}. Di Properti:

- **Elevasi**: kosong = rata-rata tanah di bawahnya.
- **Kemiringan**: datar, **kemiringan melintang** (% ke suatu arah), atau **ke drainase**: CivilCraft meminta Anda mengklik tempat drainase berada, lalu setiap sudut naik dari drainase dengan kemiringan tersebut. Panah di denah menunjukkan kemiringannya.
- **Pola** (kisi, stretcher bond, herringbone) dengan ukuran unit, nat, dan sudut; **lebar tepi**. Pada lembar, nat yang lebih rapat dari satu milimeter dihilangkan.
- Perkerasan adalah bagian dari permukaan rencana. Lapisannya (paving block, lapis pasir, lapis pondasi) masuk ke IFC dan kuantitas.

## Jalur

Klik sepanjang jalur dan tekan {{key:Enter}}. Jalur mengikuti tanah, dengan **Kemiringan melintang** ke sisi kanannya. Jalur yang lebih curam dari **Kemiringan terbesar yang diizinkan** diberi tanda `!` di denah di tempatnya, dan Properti menyatakan seberapa curam jadinya.

Di tempat jalur bertemu jalan yang dibangun koridor, jalur berhenti di tepi luar jalan, setinggi trotoar atau bahu di sana, pada permukaan rencana dan di tampilan 3D. Jalur yang memotong jalan digrading dan ditampilkan sebagai dua bagian, dan ujung yang digambar pendek hingga dua kali lebar jalur dari jalan diteruskan sampai ke tepinya. Denah tetap menampilkan jalur sebagaimana Anda gambar, dan panjang serta luasnya menghitung seluruh garis. Lihat [Sweep koridor jalan](topic:corridor).

## Dinding

Klik sepanjang dinding dan tekan {{key:Enter}}. Dinding bersifat **penahan** atau **berdiri bebas**. Tanpa **Atas**, dinding berdiri setinggi **Tinggi** di atas tanah sepanjang garisnya; ketik nilai atas untuk menahannya tetap rata. **Pondasi**-nya berada pada kedalaman tertentu di bawah tanah dan turun bertahap dalam langkah utuh, sehingga tetap rata di antara langkah-langkahnya. Properti memberi panjang, tinggi, luas muka, dan langkah pondasinya; denah memberi label puncak dan dasar dinding (TW / BW) di tiap ujung.

:::warning
Dinding penahan yang lebih tinggi dari 1.2 m (4 ft) diberi tanda: seorang insinyur yang merancangnya.
:::

## Kereb

Klik sepanjang kereb dan tekan {{key:Enter}}; atur lebar dan tinggi mukanya.

## Ramp

Klik dari bawah ke atas dan tekan {{key:Enter}}. Elevasinya diambil dari tanah di tiap ujung kecuali Anda mengetikkannya. Ramp mendapat bordes setiap kenaikan 750 mm (2.5 ft) dan diperiksa terhadap **Kemiringan terbesar yang diizinkan** (awalnya 1:12) dan lebar minimum; Properti menyatakan berapa panjang yang dibutuhkannya.

## Tangga

Klik tepi muka anak tangga paling bawah, lalu di tempat tangga mencapai puncak, dan tekan {{key:Enter}}. Jumlah tanjakan berasal dari tinggi dan **Tanjakan terbesar**; injakan dari aturan kenyamanan 2R + G ≈ 630 mm, tidak pernah di bawah **Injakan terkecil**; satu bordes setiap **Tanjakan per anak tangga paling banyak**. Properti menyatakan apakah tangga muat di antara kedua titik atau berapa panjang tambahan yang dibutuhkannya.

:::note
Batas untuk ramp dan tangga adalah default berlabel. Atur batas yang diwajibkan kode bangunan Anda.
:::

## Di luar CivilCraft

- {{ui:Lainnya}} › {{ui:Ekspor IFC lanskap}}: perkerasan dan jalur sebagai `IfcPavement`, dinding sebagai `IfcWall` (dinding penahan sebagai RETAININGWALL) dengan lapisannya, kereb sebagai `IfcKerb`, ramp sebagai `IfcRamp`, dan tangga sebagai `IfcStair` dengan tanjakan serta injakannya.
- **Kirim ke TakeoffCraft** pada jadwal tanaman membawa luas perkerasan dan volume lapisan, luas muka dan panjang dinding, panjang kereb, serta jumlah anak tangga.
- Lembar rincian menggambar penampang tiap dinding, susunan tiap perkerasan, dan setiap anak tangga. Lihat [Lembar lanskap](topic:landscape-sheets).
