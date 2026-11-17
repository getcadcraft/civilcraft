---
title: Masukkan poligon dan sesuaikan dengan aturan kompas
summary: Ketik sudut lapangan atau bearing dan jarak, periksa salah penutup sudut dan linear serta presisinya, sesuaikan dengan aturan kompas, dan tambahkan stasiun sebagai titik survei atau lingkaran sebagai persil.
keywords: poligon, poligon tertutup, lingkaran, sudut kanan, backsight, bearing, jarak, penutupan, salah penutup, presisi, aturan kompas, bowditch, penyesuaian, survei
from: 56ce5a8c
---

Poligon adalah rangkaian ukuran garis: di setiap stasiun ada sudut (atau bearing) dan jarak ke stasiun berikutnya. Klik **Masukkan poligon** di bawah **Poligon** di panel kanan saat tidak ada yang dipilih.

## Titik awal dan akhir

1. **Mulai di titik survei**: nomornya. Atau ketik northing dan easting.
2. **Garis sebagai**: **Sudut kanan dan jarak**, atau **Bearing dan jarak**.
3. Dengan sudut, tentukan titik acuannya: **Titik survei backsight**, atau **azimutnya** (dari stasiun pertama ke backsight, searah jarum jam dari utara).
4. **Akhir**: **kembali ke titik awal (loop)**, atau **pada titik survei** dan nomornya (poligon terbuka di antara titik yang sudah diketahui).

## Ketik garis-garisnya

Satu garis per baris: sudut atau bearing, lalu jarak, lalu nama untuk stasiun yang dicapai jika Anda mau:

- Sudut kanan, diputar searah jarum jam di stasiun tempat garis berangkat, dari stasiun di belakang ke stasiun berikutnya: `270°00'10" 125.50 B`. `270-00-10`, `270 00 10` dan `270.0028` juga bisa.
- Bearing: `N 45°30'15" E 125.50 B`, atau azimut sebagai satu kata: `AZ 45-30-15 125.50 B`.
- Pada loop dengan sudut, akhiri dengan `close` dan sudut di titik awal lagi, diputar dari stasiun terakhir ke stasiun kedua: `close 270°00'05"`. Itulah yang memeriksa sudut.

Baris yang tidak bisa dibaca akan didaftar beserta nomor barisnya. Kata "feet", koma, dan baris komentar `#` boleh digunakan.

## Baca salah penutup

Saat Anda mengetik, dialog menampilkan:

- **Salah penutup sudut**: seberapa jauh sudut dari penutupan, dan bagian yang diambil setiap sudut. Tanpa sudut penutup, sudut tidak diperiksa, dan kesalahan di dalamnya akan muncul di salah penutup linear.
- **Salah penutup linear**: seberapa jauh ujung poligon dari tempat seharusnya, dan ke arah mana.
- **Presisi**: panjang poligon dibagi salah penutup linear: 1 : 10,000 berarti 1 ft dalam 10,000 ft.
- Stasiun setelah penyesuaian, dan seberapa jauh masing-masing bergeser.

## Penyesuaian

Pertama, salah penutup sudut dibagi rata ke semua sudut. Lalu salah penutup linear dibagi ke garis-garis dengan aturan kompas (Bowditch): setiap stasiun bergeser berlawanan dengan salah penutup, sebanding dengan panjang yang ditempuh untuk mencapainya, sehingga poligon berakhir persis di tempat yang seharusnya.

:::note
Aturan kompas adalah penyesuaian standar, bukan kuadrat terkecil, dan tidak menimbang sudut terhadap jarak. Apakah presisinya cukup baik adalah keputusan Anda sendiri, berdasarkan standar Anda dan yurisdiksi setempat.
:::

## Gunakan hasilnya

- **Tambahkan sebagai titik survei**: stasiun yang sudah disesuaikan menjadi titik survei dengan nama yang Anda berikan (jika tidak, nomor kosong berikutnya), deskripsi `TRAV`, tanpa elevasi. Stasiun terakhir loop adalah titik awalnya, jadi tidak ditambahkan dua kali. Satu langkah: {{key:Mod+Z}} membatalkannya.
- **Tambahkan sebagai persil** (loop): stasiun yang sudah disesuaikan menjadi [persil](topic:parcels), dengan label dan deskripsi hukumnya.
- **Laporan (CSV)**: baris penutupan, lalu arah, jarak, koordinat tidak disesuaikan dan disesuaikan, serta koreksi untuk setiap stasiun.
