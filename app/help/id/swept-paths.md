---
title: Lintasan sapuan kendaraan
summary: Kendarai kendaraan dengan hingga tiga trailer di sepanjang garis fitur atau alinyemen, maju atau mundur, dan lihat area yang disapunya, lintasan rodanya, kemudinya, dan tempat ia terlipat (jackknife).
keywords: lintasan sapuan, lintasan belok, pelacakan kendaraan, template belok, kendaraan desain, truk, bus, trailer, semitrailer, mundur, jackknife, artikulasi, batas kemudi, offtracking, lintasan roda, dok bongkar muat, radius belok
from: 8caafb8a
---

Lintasan sapuan mengendarai kendaraan sepanjang garis dan menampilkan tanah yang dilewati badannya. Gunakan untuk memeriksa apakah truk dapat berbelok, mencapai dok bongkar muat, atau memundurkan trailer ke posisinya tanpa keluar dari perkerasan.

## Kendarai kendaraan sepanjang garis

1. Gambar garis yang diikuti kendaraan, searah perjalanan: garis fitur (lengkung boleh: tekan {{key:C}} saat menggambarnya, lihat [Garis fitur](topic:feature-lines)) atau alinyemen.
2. Pilih garis itu dan klik {{ui:Lintasan sapuan…}} di **Properti**-nya.
3. Di bawah **Mulai dari**, pilih kendaraan, lalu atur ukurannya dari kendaraan desain Anda sendiri: lebar, tonjolan depan, jarak sumbu roda, tonjolan belakang, lebar jejak dan **Batas kemudi**. Tambahkan hingga tiga trailer, masing-masing dengan lokasi sambungannya, panjangnya dari sambungan ke sumbunya, tonjolannya, dan **Artikulasi terbesar**.
4. Pilih **Mengemudi**: maju atau mundur. Klik {{ui:Jalankan}}.

:::warning
Kendaraan awal adalah nilai sementara, bukan standar. Atur ukurannya dari kendaraan desain yang dipakai proyek Anda.
:::

## Maju dan mundur

| Mengemudi | Yang mengikuti garis | Yang dihitung CivilCraft |
|---|---|---|
| **Maju** | Pusat sumbu depan | Tempat sumbu belakang dan setiap trailer berada, sudut kemudi, dan artikulasi |
| **Mundur** | Pusat sumbu terakhir (bagian belakang trailer) | Tempat setiap unit di depannya berada, dan kemudi yang diperlukan kabin untuk menempatkan trailer di sana |

Mundur adalah cara memeriksa gerakan mundur: tentukan di mana trailer seharusnya berada, dan CivilCraft memberi tahu apakah kabin dapat melakukannya.

## Baca hasilnya

Lintasan sapuan digambar di denah berwarna oranye: garis tepinya dan, putus-putus, lintasan roda terluar. Pilih (klik di dalamnya) untuk melihat di **Properti**:

- **Panjang yang dikendarai**, sudut **Kemudi** terbesar dan **Artikulasi** dibandingkan batasnya, serta **Area sapuan**.
- Masalah apa pun di sepanjang garis, dengan jaraknya: kemudi melewati batas, atau trailer berbelok melewati batas artikulasinya (ia terlipat).
- **Kendaraan di sepanjang garis**: geser penggeser untuk melihat kendaraan di titik mana pun, dengan kemudi dan artikulasinya di sana.

Ubah garis dan lintasan sapuan akan mengikutinya. {{ui:Edit kendaraan…}} mengubah ukuran; **Mengemudi** beralih antara maju dan mundur. Setiap perubahan adalah satu langkah: {{key:Mod+Z}} mengurungkannya. {{key:Delete}} menghapus lintasan sapuan yang dipilih (garisnya tetap).

Garis luar dan lintasan roda diekspor ke PDF, DXF dan DWG pada layer C-ROAD-SWPT.

## Cara dihitung

Setiap unit berputar terhadap garis sumbu belakangnya dan diseret oleh titik di depannya (sumbu depan, atau sambungan), model kecepatan rendah tanpa selip yang dipakai pemeriksaan lintasan sapuan. Area sapuan adalah gabungan dari semua garis badan di setiap posisi. Model ini tidak memperhitungkan kecepatan, selip ban, waktu yang dibutuhkan kemudi untuk berbelok, trailer yang ikut dikemudikan, atau jarak bebas di bawah badan.
