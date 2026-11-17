---
title: Masukkan terabas dan laraskannya mengikut peraturan kompas
summary: Taip sudut medan atau bearing dan jarak, semak penutupan sudut dan linear serta kejituan, laraskan mengikut peraturan kompas, dan tambah stesen sebagai titik ukur atau gelung sebagai lot.
keywords: terabas, terabas tertutup, gelung, sudut kanan, bidikan belakang, bearing, jarak, penutupan, ralat penutupan, kejituan, peraturan kompas, bowditch, pelarasan, ukur
from: 56ce5a8c
---

Terabas ialah satu siri sisi yang diukur: pada setiap stesen ada satu sudut (atau bearing) dan satu jarak ke stesen seterusnya. Klik **Masukkan terabas** di bawah **Terabas** dalam panel kanan apabila tiada apa-apa dipilih.

## Di mana ia bermula dan berakhir

1. **Mula di titik ukur**: nombornya. Atau taip utara dan timur.
2. **Sisi sebagai**: **Sudut kanan dan jarak**, atau **Bearing dan jarak**.
3. Dengan sudut, nyatakan dari mana ia bermula: **Titik ukur bidikan belakang**, atau **azimutnya** (dari stesen pertama ke bidikan belakang, mengikut arah jam dari utara).
4. **Berakhir**: **kembali ke titik mula (gelung)**, atau **di titik ukur** dan nombornya (terabas terbuka antara titik yang diketahui).

## Taip sisi

Satu sisi pada satu baris, kemudian jarak, kemudian nama stesen yang dicapainya jika anda mahu:

- Sudut kanan, dipusingkan mengikut arah jam di stesen yang ditinggalkan sisi itu, dari stesen di belakang ke stesen seterusnya: `270°00'10" 125.50 B`. `270-00-10`, `270 00 10` dan `270.0028` juga berfungsi.
- Bearing: `N 45°30'15" E 125.50 B`, atau azimut sebagai satu perkataan: `AZ 45-30-15 125.50 B`.
- Pada gelung dengan sudut, akhiri dengan `close` dan sudut di titik mula sekali lagi, dipusingkan dari stesen terakhir ke stesen kedua: `close 270°00'05"`. Itulah yang menyemak sudut.

Baris yang tidak dapat dibaca akan disenaraikan beserta nombor barisnya. "feet", koma dan baris ulasan `#` tidak menjadi masalah.

## Baca penutupan

Semasa anda menaip, kotak dialog memaparkan:

- **Ralat penutupan sudut**: sejauh mana sudut tidak menutup, dan bahagian yang diambil oleh setiap sudut. Tanpa sudut penutup, sudut tidak disemak, dan sebarang ralat padanya akan muncul dalam ralat penutupan linear.
- **Ralat penutupan linear**: sejauh mana hujung terabas menyimpang daripada tempat yang sepatutnya, dan ke arah mana.
- **Kejituan**: panjang terabas dibahagi dengan ralat penutupan linear: 1 : 10,000 bermaksud 1 ft dalam 10,000 ft.
- Stesen selepas pelarasan, dan sejauh mana setiap stesen beralih.

## Pelarasan

Mula-mula ralat penutupan sudut diagihkan sama rata kepada sudut. Kemudian ralat penutupan linear diagihkan kepada sisi mengikut peraturan kompas (Bowditch): setiap stesen beralih berlawanan dengan ralat penutupan mengikut kadar panjang yang dilalui untuk sampai ke stesen itu, supaya terabas berakhir tepat di tempat yang sepatutnya.

:::note
Peraturan kompas ialah pelarasan piawai, bukan kuasa dua terkecil, dan ia tidak menimbang sudut berbanding jarak. Sama ada kejituan itu mencukupi ialah perkara untuk piawaian anda sendiri dan peraturan bidang kuasa anda.
:::

## Gunakan hasilnya

- **Tambah sebagai titik ukur**: stesen yang telah dilaraskan menjadi titik ukur dengan nama yang anda beri (jika tidak, nombor kosong yang seterusnya), penerangan `TRAV`, tanpa ketinggian. Stesen terakhir gelung ialah titik mulanya, jadi ia tidak ditambah dua kali. Satu langkah: {{key:Mod+Z}} membatalkannya.
- **Tambah sebagai lot** (gelung): stesen yang telah dilaraskan menjadi satu [lot](topic:parcels), dengan label dan huraian undang-undang.
- **Laporan (CSV)**: baris penutupan, kemudian arah, jarak, koordinat tidak dilaraskan dan dilaraskan, serta pembetulan bagi setiap stesen.
