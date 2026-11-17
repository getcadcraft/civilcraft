---
title: Alamat ke lokasi
summary: Ubah alamat menjadi yang perlu diketahui sebuah lokasi: persil, bangunan di sekitarnya, zonasi, tanah, dan zona banjir, dari data terbuka yang Anda minta dengan tombol atau bawa sebagai file, lalu serahkan ke BimCraft sebagai saran.
keywords: alamat, geocode, lokasi, persil, bangunan, zonasi, tanah, banjir, data terbuka, openstreetmap, fema, ssurgo, usgs, konteks, ccsite, bimcraft
from: 125d848a
---

## Fungsinya

Permukaan › Lainnya › Alamat ke lokasi menjawab, untuk satu titik: persil mana yang memuatnya, bangunan di sekitarnya, zonasi, tanah, dan zona banjir. Datanya terbuka: file yang Anda tambahkan (GeoJSON, shapefile, KML, GeoPackage) dan, jika Anda mengaktifkan add-on, tombol yang masing-masing meminta satu layanan terbuka.

## Cara menggunakannya

1. Ketik alamat lalu tekan tombol pencarian alamat (add-on "Pencarian alamat"), atau ketik lintang dan bujur.
2. Tambahkan layer: file dengan "Tambahkan file", atau tombol sumber lain (zona banjir, bangunan, tanah, tinggi tanah, persil kabupaten). Layanan hanya diminta saat Anda menekan tombolnya; tidak ada yang diambil saat mulai.
3. Tekan tombol jalankan untuk jawaban dalam kata-kata, dengan CSV.
4. "Simpan lokasi sebagai file" atau "Kirim ke BimCraft sebagai saran" memberikan garis batas ke BimCraft atau ModelCraft; mereka mendaftarkannya dan hanya menambahkan yang Anda centang.

## Yang perlu diketahui

- Pencarian alamat melewati getcadcraft.com, yang meminta layanan OpenStreetMap Nominatim untuk Anda (paling banyak satu permintaan per detik; jawaban disimpan 90 hari sehingga alamat yang sama tidak diminta dua kali; hanya hash alamat yang disimpan, tidak pernah siapa yang meminta). Tombol lain langsung dari peramban Anda ke layanan mereka.
- Setiap sumber memiliki lisensinya sendiri (OpenStreetMap adalah ODbL: pertahankan baris kredit).
- Layer hanya sebaik data terbuka di wilayah Anda. Periksa hal yang penting terhadap survei.
