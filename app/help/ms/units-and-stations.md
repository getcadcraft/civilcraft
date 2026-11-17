---
title: Unit, stesen dan format nombor
summary: Projek kaki dan meter, cara stesen, kecerunan, cerun sisi, bearing, luas, isipadu dan saiz paip ditulis dan ditaip, serta apa yang berlaku apabila unit ditukar.
keywords: taip panjang, aritmetik, kalkulator, hasil tambah, pecahan, kaki dan inci, 4+7/16, unit, kaki, US survey feet, meter, metrik, imperial, format stesen, stesen, kecerunan, peratus, cerun sisi, h:v, bearing, yard padu, diameter
from: 0b9b5b6b
---

## Unit projek

Projek ialah dalam **US feet** atau **meter** (**Unit** dalam panel kiri). Setiap koordinat, ketinggian, panjang dan stesen dalam projek adalah dalam unit itu.

:::warning
Menukar **Unit** menukar label, format stesen, nilai lalai dan cara fail ditulis. Ia **tidak** menukar sebarang nombor. Tapak yang diukur dalam kaki dan ditukar kepada meter mengekalkan nombor yang sama, kini dibaca sebagai meter. Bar status menyatakan "Unit kini meter. Koordinat tidak ditukar." Tetapkan unit supaya sepadan dengan data anda sebelum mereka bentuk.
:::

Perkara yang bergantung pada unit:

| | US feet | Meter |
|---|---|---|
| Format stesen | `12+34.56` (stesen 100 ft) | `1+234.567` (stesen 1000 m) |
| Sela kontur yang ditawarkan | 0.25 hingga 20 ft | 0.1 hingga 10 m |
| Luas | sq ft | sq m |
| Isipadu | cu yd | cu m |
| Diameter paip dan struktur | inci | milimeter |
| Jejari lengkung lalai | 100 ft | 30 m |
| Tanda stesen pada pelan | setiap 50 ft, label setiap 100 ft | setiap 20 m, label setiap 100 m |
| Skala plot | 1" = 5' hingga 1" = 1000' | 1:50 hingga 1:10000 |
| Unit linear LandXML | USSurveyFoot | meter |

Projek baharu bermula dalam kaki, atau dalam meter apabila unit panjang yang ditanda dalam {{ui:Tetapan}} › {{ui:Umum}} › {{ui:Unit}} ialah unit metrik. Senarai **Unit** memaparkan unit yang diaktifkan di sana, dan sentiasa unit projek itu sendiri. Dengan unit luas atau isipadu yang ditanda di sana (ekar, hektar, ekar-kaki …), luas dan isipadu dilaporkan dalam unit itu dan bukannya lajur di atas. Lihat [Unit, nilai yang ditaip dan senarai unit](common:unit-lists).

Apabila anda membuka LandXML, projek mengambil unit fail itu. Fail dalam kaki antarabangsa dibuka sebagai projek kaki; nombornya tidak diubah.

## Menaip panjang dan hasil tambah

Mana-mana kotak yang menerima panjang atau ketinggian membaca lebih daripada nombor biasa: tekan {{key:Enter}} dan kotak itu memaparkan hasilnya dalam unit projek.

| Anda taip | Dalam projek kaki | Dalam projek meter |
|---|---|---|
| `12.5` | 12.5 ft | 12.5 m |
| `12'6"`, `12' 6 1/2"`, `6"`, `3 ft 6 in` | 12.5 ft, 12.54 ft, 0.5 ft, 3.5 ft | panjang yang sama dalam meter |
| `4 7/16`, `4-7/16` | 4.4375 ft | 4.4375 m |
| `450 mm`, `1.2 m`, `90 cm` | dalam kaki | 0.45 m, 1.2 m, 0.9 m |
| `10 US ft`, `3 ch`, `2 rd`, `0.5 mi`, `1 km` | 10 ft, dan yang lain dalam US survey feet | panjang yang sama dalam meter |
| `4+7/16`, `12'6" + 3/4"`, `(24'-0")/3`, `2*450mm` | hasil tambahnya, dalam kaki | hasil tambahnya, dalam meter |

Mana-mana tanda panjang dari jadual unit kongsi berfungsi, dengan saiz tepatnya: kaki projek ialah US survey feet, jadi `10 US ft` ialah 10 dan `3 ch` (rantai kaki antarabangsa) ialah 197.9996. Guna `+ - * /` dan kurungan, serta `abs`, `round`, `ceil` dan `floor`. Tanda sempang yang ditulis dalam panjang adalah sebahagian daripadanya (`24'-6"`, `6-1/2`); dengan ruang di sekelilingnya, ia menolak (`24' - 6"` = 23.5 ft). Nombor biasa mendarab atau membahagi panjang, dan ialah panjang dalam unit projek apabila ditambah kepada satu panjang. Jika CivilCraft tidak dapat membaca apa yang anda taip, kotak itu ditanda dan bar status menyatakan di mana.

Stesen bukan hasil tambah: `10+00` dalam kotak stesen ialah stesen 10+00. Kecerunan dalam peratus, nombor titik dan huraian dibaca sebagaimana adanya.

## Stesen

Stesen ialah jarak sepanjang penjajaran, ditulis dengan tanda tambah:

- Kaki: bahagian sebelum tanda tambah ialah ratusan kaki. `12+34.56` ialah 1,234.56 ft.
- Meter: bahagian sebelum tanda tambah ialah ribuan meter. `1+234.567` ialah 1,234.567 m.
- Stesen negatif mengekalkan tanda di hadapan: `-0+50.00`.

Di mana sahaja anda menaip stesen (**Stesen mula**, **Stesen** PVI), anda boleh menaipnya dengan tanda tambah (`12+34.56`) atau sebagai nombor biasa (`1234.56`). Ruang diabaikan.

## Kecerunan dan cerun

- **Kecerunan** (profil, paip, cerun lorong dan bahu) dalam peratus: `+1.25%` naik mengikut stesen, `-0.50%` turun.
- **Cerun sisi** (potongan dan tambakan pelantar, potongan dan tambakan koridor) ialah mengufuk kepada menegak: `3` bermaksud 3 : 1, tiga melintang bagi satu naik atau turun.
- **K** bagi lengkung menegak ialah panjangnya dibahagi dengan perubahan kecerunan dalam peratus.

## Bearing dan sudut

Bearing ialah bearing kuadran dalam darjah, minit dan saat: `N 63°12'05" E`. Pesongan lengkung (Δ) menggunakan darjah, minit dan saat yang sama, dengan "kiri" atau "kanan".

## Ofset

Ofset daripada penjajaran ialah jarak tegak lurus kepadanya, ditanda **L** (kiri) atau **R** (kanan) apabila melihat mengikut arah stesen.

## Paparan nombor

- Koordinat dan ketinggian menunjukkan 2 titik perpuluhan dalam panel dan bar status (3 bagi titik ukur yang dipilih).
- Luas dan isipadu dikelompokkan mengikut ribuan: `128,250 sq ft`, `454.9 cu yd`.
- Koordinat tidak pernah dikelompokkan, supaya ia boleh disalin sebagaimana adanya.

## Koordinat

CivilCraft berfungsi dalam satah rata: timur ke kanan, utara ke atas. Kerja reka bentuk sentiasa dilakukan dalam koordinat terunjur (state plane, UTM atau grid tempatan). Anda boleh memberitahu CivilCraft sistem koordinat yang digunakan, dan sama ada ia koordinat grid, tanah atau tempatan; kemudian ia memaparkan latitud dan longitud serta meletakkan fail GIS dan lapisan peta, tetapi ia tidak pernah menukar unit atau mengalihkan koordinat anda dengan sendirinya. Lihat [Tetapkan sistem koordinat projek](topic:coordinate-systems) dan [Koordinat tanah dan tempatan](topic:ground-and-local-coordinates). Nilai state plane yang besar (berjuta kaki) tidak menjadi masalah; CivilCraft berfungsi secara relatif kepada tapak secara dalaman untuk mengekalkan kejituan.
