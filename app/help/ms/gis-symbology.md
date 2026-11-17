---
title: Gayakan lapisan mengikut atribut
summary: Warnakan ciri lapisan GIS mengikut nilai medan (satu warna bagi setiap nilai, atau mengikut julat nombor), saiz titik mengikut nombor, isi poligon dengan warna dan tunjuk petunjuk pada pelan.
keywords: simbologi, gaya, warna, dikategorikan, bergred, nilai unik, sela sama, kuantil, pemecahan semula jadi, jenks, julat, buta warna, petunjuk, saiz, titik, koroplet, kelas, gis
from: a3a69add
---

Buka menu **tiga titik** lapisan dalam senarai Lapisan GIS dan pilih {{ui:Gaya mengikut atribut…}}.

## Tiga gaya

- **Simbol tunggal:** warna lapisan, seperti sebelumnya.
- **Dikategorikan:** satu warna bagi setiap nilai berbeza bagi mana-mana medan. Sehingga lapan nilai mendapat lapan warna Okabe-Ito (dipilih supaya kekal berasingan bagi jenis buta warna yang biasa); dengan lebih banyak nilai, tujuh yang paling kerap mendapat warna masing-masing dan selebihnya berkongsi kelas kelabu **Lain-lain**. Ciri tanpa nilai berwarna kelabu.
- **Bergred:** medan nombor dipotong kepada 2 hingga 9 julat, setiap satu dengan warna daripada rangkaian warna. Nilai pada sempadan masuk ke julat yang lebih rendah.

## Cara julat dipotong

| Kaedah | Sempadan |
|---|---|
| Sela sama | Julat dari nilai terkecil ke terbesar dibahagikan kepada lebar yang sama. Nilai 0 hingga 30 dalam tiga julat: 0, 10, 20, 30. |
| Kuantil | Lebih kurang bilangan ciri yang sama dalam setiap julat. Sempadan dibaca daripada nilai yang disusun dengan interpolasi garis lurus biasa: bagi 1 hingga 10 dalam dua julat, sempadannya ialah 5.5. |
| Pemecahan semula jadi (Jenks) | Potongan yang meninggalkan penyebaran paling sedikit dalam setiap julat, supaya kelompok nilai yang serupa kekal bersama. Pada lebih daripada 1,500 nilai, ia bekerja pada 1,500 nilai yang diletakkan sama jarak dan menyatakannya. |

## Warna

Viridis dan Cividis berjalan dari gelap ke cerah dengan perubahan kecerahan yang stabil, jadi susunan julat masih boleh dibaca walaupun dalam kelabu atau dengan buta warna. Blues ialah cerah ke gelap. Merah ke biru ialah rangkaian dua hala bagi nilai di sekitar titik tengah. **Balikkan warna** membalikkan mana-mana daripadanya. Dialog menyenaraikan julat dan bilangan ciri dalam setiap satu sebelum anda menggunakannya.

## Saiz, isian dan petunjuk

- **Saiz titik mengikut** medan nombor menjadikan segi empat setiap titik lebih besar semakin besar nilainya, antara dua saiz yang anda berikan (separuh sisi, dalam milimeter di atas kertas).
- **Isi bahagian dalam poligon** mengisi setiap poligon dengan warna kelasnya (lubang kekal kosong). Isian hanya pada skrin; plot dan DXF/DWG menunjukkan garis luar berwarna.
- **Tunjuk petunjuk pada pelan** melukis kelas, kiraannya dan julat saiz di bahagian kiri bawah pelan. Petunjuk hanya pada skrin; ia tidak termasuk dalam plot.
- Untuk melabel ciri dengan medan, gunakan **Label dengan** dalam menu yang sama.

Gaya disimpan dalam fail projek. Binaan yang tidak mengenali gaya membuka fail dengan warna lapisan. Plot, DXF dan DWG membawa kelas sebagai lapisan berasingan yang dinamakan mengikut lapisan dan kelas, dalam warna CAD asas sembilan yang paling hampir. Lapisan dengan lebih daripada 200,000 ciri dilukis dalam satu warna.
