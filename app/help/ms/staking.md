---
title: Buat laporan penandaan tapak
summary: Senaraikan pancang sepanjang penjajaran pada stesen dan ofset, atau titik ukur berdekatan, dengan stesen, ofset, utaraan, timuran, aras reka bentuk dan aras tanah serta potongan atau tambakan, dan simpan laporan sebagai CSV atau PDF.
keywords: penandaan tapak, pancang, laporan pancang, lembaran potongan, lembaran kecerunan, stesen, ofset, potongan, tambakan, susun atur, penandaan pembinaan, seperti dibina
from: d8a4e9f1
---

Pilih penjajaran dan klik **Laporan penandaan tapak** dalam **Sifat**nya.

## Pancang pada stesen dan ofset

1. **Dari** dan **hingga**: stesen yang akan dipancang (1+50 atau 150).
2. **setiap**: sela. Pancang diletakkan pada setiap gandaan sela itu, di kedua-dua hujung, dan (dengan kotak ditandakan) di tempat lengkung penjajaran bermula dan berakhir.
3. **Ofset**: kiri dan kanan penjajaran, melihat ke arah kenaikan stesen: `12 L, 0, 12 R`, `L12 CL R12` atau `-12, 0, 12` (kiri ialah tanda tolak). Penjajaran dengan koridor bermula dengan tepi turapan dan bahu jalan.
4. **Nombor dari** dan **dengan awalan** menamakan pancang: 1, 2, 3, atau S101, S102.

## Titik ukur berdekatan penjajaran

Pilih **titik ukur berdekatan penjajaran** dan sejauh mana. Setiap titik dalam jarak itu mendapat stesen dan ofsetnya, reka bentuk di situ, dan aras sendirinya sebagai tanah: semakan titik yang dipancang atau dirakam seperti dibina.

## Apa yang dikatakan laporan

| Lajur | Maksudnya |
|---|---|
| Titik | Nama pancang, atau nombor titik ukur |
| Stesen, Ofset | Kedudukannya sepanjang penjajaran: L kiri, R kanan |
| Northing, Easting | Koordinatnya |
| Aras reka bentuk | Permukaan koridor yang digred di situ (dari garis persilangan cerun ke garis persilangan cerun), jika tidak profil reka bentuk pada paksi tengah |
| Aras tanah | Permukaan sedia ada di situ, atau aras titik ukur itu sendiri |
| Potong/tambak | C apabila tanah di atas reka bentuk (potong turun), F apabila di bawah (tambak naik), hingga dua tempat perpuluhan |

Pancang tanpa aras reka bentuk (di luar koridor, atau pada penjajaran tanpa aras reka bentuk jauh dari paksi tengah) tidak mempunyai potongan atau tambakan; dialog memberitahu berapa banyak.

## Simpan

- **CSV**: satu baris tajuk, kemudian lajur di atas, serta potongan atau tambakan sebagai nombor berjenis tanda (tanah tolak reka bentuk) untuk hamparan dan pengumpul data.
- **PDF**: halaman jadual pada kertas yang anda pilih, satu pancang setiap baris, potongan dalam warna jingga dan tambakan dalam hijau, dengan jalur tajuk seperti helaian lain.

:::note
Pancang dikira daripada reka bentuk dalam projek. Semak dengan pelan yang diluluskan sebelum apa-apa dibina.
:::
