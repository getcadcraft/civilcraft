---
title: Nilai permulaan dan nilai sementara
summary: Setiap nilai yang CivilCraft mulakan dengannya, untuk projek baharu, paparan, penjajaran, pelantar, koridor, rangkaian paip, isipadu dan plot, dan yang mana merupakan nilai sementara untuk digantikan.
keywords: lalai, tetapan, nilai permulaan, nilai sementara, kriteria reka bentuk, piawaian, peraturan, andaian
from: fbfc7432
---

CivilCraft tidak mempunyai dialog tetapan atau templat. Ini ialah nilai yang perkara mula dengannya. Nilai yang ditanda **nilai sementara** tidak diambil daripada mana-mana piawaian: gantikannya dengan kriteria projek anda sebelum anda bergantung pada semakan atau kuantiti.

## Projek baharu

| Tetapan | Nilai |
|---|---|
| Nama | Tapak tanpa nama (nama fail titik pertama menggantikannya) |
| Unit | Kaki AS |
| Nama permukaan | Tanah sedia ada |
| Kumpulan titik | Setiap kumpulan bermula sebagai {{ui:Titik}} |
| Tepi luar terpanjang | 0 (simpan setiap segi tiga) |
| Langkah buat asal yang disimpan | 200 |

## Paparan

| Tetapan | Nilai |
|---|---|
| Permukaan | {{ui:Tanah sedia ada}} |
| Kontur setiap | 1 (ft atau m) |
| Utama setiap | Kontur ke-5 |
| Jalur | 8 |
| Hidup | Kontur, label kontur, titik, garis putus, tepi permukaan, paip |
| Mati | Segi tiga, jalur aras, anak panah cerun, label titik |

## Penjajaran dan profil

| Tetapan | Nilai |
|---|---|
| Nama | Penjajaran 1, Penjajaran 2 … |
| Stesen permulaan | 0+00 |
| Jejari lengkung pada setiap PI dalaman | 100 ft atau 30 m, lebih kecil jika itu tidak muat dalam separuh setiap tangen |
| Profil reka bentuk | Tiada sehingga anda memulakan satu; {{ui:Mula dari tanah sedia ada}} meletakkan PVI di atas tanah pada setiap hujung |
| Panjang lengkung menegak | 0 (tiada lengkung) sehingga anda menaipkan satu |

## Pelantar

| Tetapan | Nilai |
|---|---|
| Nama | Pelantar 1, Pelantar 2 … |
| Aras | Tanah di tengah pelantar, dibundarkan kepada 0.1 (0 jika tengah berada di luar permukaan) |
| Cerun potongan | 2 : 1 (nilai sementara) |
| Cerun tambakan | 3 : 1 (nilai sementara) |

## Himpunan koridor (nilai sementara)

| Tetapan | Kaki AS | Meter |
|---|---|---|
| Lebar lorong | 12 ft | 3.6 m |
| Cerun lorong | 2% | 2% |
| Lebar bahu | 4 ft | 1.2 m |
| Cerun bahu | 4% | 4% |
| Cerun potongan | 2 : 1 | 2 : 1 |
| Cerun tambakan | 3 : 1 | 3 : 1 |
| Keratan setiap | 10 ft | 5 m |

## Rangkaian paip

| Tetapan | Kaki AS | Meter |
|---|---|---|
| Nama dan jenis | Saliran ribut, saliran ribut | Saliran ribut, saliran ribut |
| Kecerunan terkecil (nilai sementara) | 0.50% | 0.50% |
| Penutup terkecil (nilai sementara) | 2 ft | 0.6 m |
| Penurunan dalam struktur (nilai sementara) | 0.10 ft | 0.03 m |
| Diameter struktur baharu | 48 in | 1200 mm |
| Diameter paip baharu | 12 in | 300 mm |
| Kedalaman sump | 0 | 0 |
| Rim | Dari permukaan | Dari permukaan |

Rangkaian paip yang dibuka daripada LandXML menggunakan peraturan ini juga, kerana LandXML tidak membawanya.

## Isipadu

| Tetapan | Nilai |
|---|---|
| Kaedah | Grid, disampel pada pusat sel di dalam garisan persilangan cerun |
| Saiz sel | Dipilih supaya segi empat tepat sempadan kawasan yang diratakan memuatkan kira-kira 250,000 sel (1, 2 atau 5 kali kuasa sepuluh) |
| Kembang dan kecut | Tiada |

## Plot

| Tetapan | Nilai |
|---|---|
| Kawasan | {{ui:Semua}} |
| Kertas | Tabloid 11 × 17 in (projek kaki), ISO A3 (projek meter); sentiasa landskap |
| Skala | Skala tersenarai terbesar yang muat |
| Dakwat | {{ui:Warna lapisan}} |

Label DXF disaiz untuk skala yang mana semuanya muat pada Tabloid (kaki) atau A3 (meter).
