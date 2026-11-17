---
title: Satuan, stasiun, dan format angka
summary: Proyek dalam kaki dan meter, cara stasiun, kelandaian, lereng sisi, bearing, luas, volume, dan ukuran pipa ditulis dan diketik, serta apa yang terjadi saat satuan diubah.
keywords: ketik panjang, aritmetika, kalkulator, jumlah, pecahan, kaki dan inci, 4+7/16, satuan, kaki, kaki survei AS, meter, metrik, imperial, format stasiun, stasiunisasi, kelandaian, persen, lereng sisi, h:v, bearing, yard kubik, diameter
from: 0b9b5b6b
---

## Satuan proyek

Proyek menggunakan **kaki AS** atau **meter** (**Satuan** di panel kiri). Setiap koordinat, elevasi, panjang, dan stasiun dalam proyek menggunakan satuan itu.

:::warning
Mengubah **Satuan** mengubah label, format stasiun, nilai default, dan cara file ditulis. Satuan **tidak** mengonversi angka apa pun. Situs yang diukur dalam kaki lalu diganti ke meter tetap memiliki angka yang sama, kini dibaca sebagai meter. Bilah status menulis "Satuan sekarang meter. Koordinat tidak dikonversi." Atur satuan agar sesuai dengan data Anda sebelum mendesain.
:::

Yang bergantung pada satuan:

| | Kaki AS | Meter |
|---|---|---|
| Format stasiun | `12+34.56` (stasiun 100 ft) | `1+234.567` (stasiun 1000 m) |
| Interval kontur yang tersedia | 0.25 sampai 20 ft | 0.1 sampai 10 m |
| Luas | ft² | m² |
| Volume | yd³ | m³ |
| Diameter pipa dan bangunan | inci | milimeter |
| Radius lengkung default | 100 ft | 30 m |
| Tanda stasiun di denah | setiap 50 ft, label setiap 100 ft | setiap 20 m, label setiap 100 m |
| Skala plot | 1" = 5' sampai 1" = 1000' | 1:50 sampai 1:10000 |
| Satuan panjang LandXML | USSurveyFoot | meter |

Proyek baru dimulai dalam kaki, atau dalam meter jika satuan panjang yang diberi bintang di {{ui:Pengaturan}} › {{ui:Umum}} › {{ui:Satuan}} adalah satuan metrik. Daftar **Satuan** menampilkan satuan yang diaktifkan di sana, dan selalu menampilkan satuan milik proyek. Jika satuan luas atau volume diberi bintang di sana (acre, hektare, acre-feet …), luas dan volume dilaporkan dalam satuan itu, bukan kolom di atas. Lihat [Satuan, nilai yang diketik, dan daftar satuan](common:unit-lists).

Saat Anda membuka LandXML, proyek mengambil satuan file itu. File dalam kaki internasional dibuka sebagai proyek kaki; angkanya tidak diubah.

## Mengetik panjang dan jumlah

Setiap kotak yang menerima panjang atau elevasi membaca lebih dari angka biasa: tekan {{key:Enter}} dan kotak menampilkan hasilnya dalam satuan proyek.

| Anda mengetik | Di proyek kaki | Di proyek meter |
|---|---|---|
| `12.5` | 12.5 ft | 12.5 m |
| `12'6"`, `12' 6 1/2"`, `6"`, `3 ft 6 in` | 12.5 ft, 12.54 ft, 0.5 ft, 3.5 ft | panjang yang sama dalam meter |
| `4 7/16`, `4-7/16` | 4.4375 ft | 4.4375 m |
| `450 mm`, `1.2 m`, `90 cm` | dalam kaki | 0.45 m, 1.2 m, 0.9 m |
| `10 US ft`, `3 ch`, `2 rd`, `0.5 mi`, `1 km` | 10 ft, dan lainnya dalam kaki survei AS | panjang yang sama dalam meter |
| `4+7/16`, `12'6" + 3/4"`, `(24'-0")/3`, `2*450mm` | jumlahnya, dalam kaki | jumlahnya, dalam meter |

Setiap penanda panjang dari tabel satuan bersama berfungsi, dengan ukuran persisnya: kaki sebuah proyek adalah kaki survei AS, sehingga `10 US ft` adalah 10 dan `3 ch` (rantai kaki internasional) adalah 197.9996. Gunakan `+ - * /` dan kurung, serta `abs`, `round`, `ceil`, dan `floor`. Tanda hubung yang ditulis di dalam panjang termasuk bagiannya (`24'-6"`, `6-1/2`); dengan spasi di sekelilingnya, ia mengurangi (`24' - 6"` = 23.5 ft). Angka biasa mengalikan atau membagi panjang, dan menjadi panjang dalam satuan proyek saat ditambahkan ke panjang. Jika CivilCraft tidak dapat membaca yang Anda ketik, kotak akan ditandai dan bilah status menunjukkan di mana.

Stasiun bukan jumlah: `10+00` di kotak stasiun adalah stasiun 10+00. Kelandaian dalam persen, nomor titik, dan deskripsi dibaca apa adanya.

## Stasiun

Stasiun adalah jarak sepanjang alinyemen, ditulis dengan tanda plus:

- Kaki: bagian sebelum plus adalah ratusan kaki. `12+34.56` adalah 1,234.56 ft.
- Meter: bagian sebelum plus adalah ribuan meter. `1+234.567` adalah 1,234.567 m.
- Stasiun negatif menyimpan tanda di depannya: `-0+50.00`.

Di mana pun Anda mengetik stasiun (**Stasiun awal**, **Stasiun** sebuah PVI), Anda dapat mengetiknya dengan plus (`12+34.56`) atau sebagai angka biasa (`1234.56`). Spasi diabaikan.

## Kelandaian dan lereng

- **Kelandaian** (profil, pipa, kemiringan jalur dan bahu) dalam persen: `+1.25%` naik ke arah stasiun, `-0.50%` turun.
- **Lereng sisi** (potongan dan timbunan pad, potongan dan timbunan koridor) adalah horizontal terhadap vertikal: `3` berarti 3 : 1, tiga ke samping untuk satu ke atas atau bawah.
- **K** untuk lengkung vertikal adalah panjangnya dibagi perubahan kelandaian dalam persen.

## Bearing dan sudut

Bearing adalah bearing kuadran dalam derajat, menit, dan detik: `N 63°12'05" E`. Defleksi lengkung (Δ) memakai derajat, menit, dan detik yang sama, dengan "kiri" atau "kanan".

## Offset

Offset dari alinyemen adalah jarak tegak lurus terhadapnya, ditandai **L** (kiri) atau **R** (kanan) saat melihat ke arah stasiun yang naik.

## Tampilan angka

- Koordinat dan elevasi menampilkan 2 desimal di panel dan bilah status (3 untuk titik survei yang dipilih).
- Luas dan volume dikelompokkan per ribuan: `128,250 ft²`, `454.9 yd³`.
- Koordinat tidak pernah dikelompokkan, sehingga dapat disalin apa adanya.

## Koordinat

CivilCraft bekerja di bidang datar: easting ke kanan, northing ke atas. Pekerjaan desain selalu dilakukan dalam koordinat terproyeksi (state plane, UTM, atau grid lokal). Anda dapat memberi tahu CivilCraft sistem koordinat apa yang dipakai, dan apakah itu koordinat grid, tanah, atau lokal; lalu CivilCraft menampilkan lintang dan bujur serta menempatkan file GIS dan layer peta, tetapi tidak pernah mengubah satuan atau memindahkan koordinat Anda sendiri. Lihat [Atur sistem koordinat proyek](topic:coordinate-systems) dan [Koordinat tanah dan lokal](topic:ground-and-local-coordinates). Nilai state plane yang besar (jutaan kaki) tidak masalah; CivilCraft bekerja relatif terhadap lokasi secara internal untuk menjaga presisi.
