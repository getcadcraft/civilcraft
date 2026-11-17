---
title: Garis sampel dan keratan rentas
summary: Potong keratan tegak lurus kepada penjajaran, lihat tanah, reka bentuk serta potongan dan tambakan pada setiap stesen, dan dapatkan isipadu mengikut purata luas hujung.
keywords: gambar rajah jisim, titik seimbang, pengecutan, pembengkakan, jarak angkut, pinjaman, buangan, helaian keratan, helaian keratan rentas, pdf keratan, keratan, keratan rentas, garis sampel, paparan keratan, potong, tambakan, luas, purata luas hujung, isipadu, kerja tanah, stesen, ofset, csv
from: 5060173c
---

Keratan rentas menunjukkan jalan seperti yang akan dibina: merentasi penjajaran pada satu stesen, tanah sedia ada, reka bentuk (koridor atau pelantar yang dikerjakan) dan potongan serta tambakan di antaranya.

## Tambah garis sampel

1. Pilih penjajaran. Dalam **Sifat**, di bawah **Garis sampel**, klik {{ui:Tambah garis sampel}}.
2. Tetapkan **Setiap** (jarak: 50 kaki atau 20 m untuk permulaan), **Lebar kiri** dan **Lebar kanan** (sejauh mana setiap keratan sampai dari garis tengah).
3. Untuk memotong keratan pada stesen tertentu, taip ia dalam **Tambah stesen** (contohnya `2+35`) dan tekan {{key:Enter}}.

Keratan dipotong pada setiap gandaan keseluruhan jarak, di kedua-dua hujung penjajaran, pada permulaan dan akhir setiap lengkung (PC dan PT), dan pada stesen yang anda tambah. Garis sampel ditunjukkan pada pelan sebagai garis kelabu merentasi penjajaran; ia juga dikeluarkan dalam DXF, DWG dan PDF pada lapisan C-ROAD-SCTN. Setiap perubahan ialah satu langkah: {{key:Mod+Z}} membatalkannya.

## Paparan keratan

Bukanya dengan {{ui:Paparan keratan}} dalam **Sifat** penjajaran, {{ui:Keratan}} di bawah **Permukaan** › {{ui:Lagi}}, atau {{key:X}}. Ia menggantikan paparan profil di bawah pelan.

- Lalui keratan dengan anak panah dalam bar, senarai stesen, atau {{key:Left}} dan {{key:Right}} dengan paparan keratan difokuskan ({{key:Home}} dan {{key:End}} untuk yang pertama dan terakhir).
- Garisan kelabu ialah tanah sedia ada, garisan merah ialah reka bentuk. Potongan dilorek jingga, tambakan hijau. Titik koridor ditanda: CL (garis tengah), EOP (tepi turapan), SH (bahu) dan DL (persilangan cerun).
- Pengepala memberi stesen, luas potongan dan tambakan keratan ini, dan pembesaran menegak. **Muat** mengisi panel; pilih 1× untuk melihat keratan benar mengikut skala.
- Garisan tebal pada pelan menunjukkan keratan mana yang berada di skrin.

## Helaian keratan

{{ui:Helaian keratan (PDF)}} di bawah **Garis sampel** meletakkan setiap keratan pada halaman PDF, dalam baris dari kiri ke kanan dan atas ke bawah mengikut urutan stesen. Pilih **Kertas**, **Skala pelan** (skala mendatar keratan) dan **Pembesaran profil** (1×, 2×, 5× atau 10×); kotak dialog menyatakan berapa banyak keratan muat pada satu halaman dan berapa banyak halaman yang terhasil.

Setiap keratan menunjukkan grid dengan ofset dan ketinggian, tanah (putus-putus), reka bentuk, potongan dan tambakan dilorek (jingga dan hijau), titik koridor, dan di bawahnya stesennya serta luas potongan dan tambakannya. Setiap keratan pada helaian dilukis sama saiz, cukup tinggi untuk yang terbesar; apabila itu tidak muat pada halaman pada pembesaran anda, CivilCraft menggunakan yang terbesar yang muat dan menyatakannya. Jalur tajuk menamakan penjajaran, stesen pada halaman itu, skala dan "Helaian 1 daripada 3".

## Isipadu mengikut purata luas hujung

Antara dua keratan bersebelahan, isipadunya ialah purata dua luas mereka didarab dengan jarak antara stesen mereka. Bar menunjukkan jumlah bagi penjajaran, dan {{ui:CSV}} memuat turun luas dan isipadu setiap keratan dengan jumlah berjalan (ela padu untuk projek kaki, meter padu untuk projek meter).

**Sifat** menunjukkan jumlah yang sama di sebelah isipadu kaedah grid daripada [Isipadu kerja tanah](topic:volumes). Kedua-duanya ialah anggaran yang berbeza: keratan yang lebih rapat membawa keduanya lebih dekat, dan di jalan lurus atas tanah rata ia sama.

:::note
Potongan dan tambakan hanya dikira di dalam kawasan yang dikerjakan (garisan cahaya siang koridor atau pelantar), seperti kaedah grid. Tanpa koridor atau pelantar, reka bentuk ialah tanah, jadi keratan tidak menunjukkan potongan atau tambakan.
:::

## Angkutan jisim

**Angkutan jisim** di bawah **Garis sampel** melukis gambar rajah angkutan jisim daripada isipadu luas hujung yang sama: sepanjang stesen, jumlah berjalan potongan tolak tambakan.

- **Pengecutan (−) atau pembengkakan (+) potongan** menyatakan apa yang dihasilkan satu ela padu potongan apabila ia diletakkan sebagai tambakan: −10 % (nilai permulaan, nilai sementara) bermaksud ia mengecut kepada 0.9; batu yang membengkak mungkin +5 %. Gunakan angka laporan geoteknik anda.
- Di tempat garisan naik, jalan berada dalam potongan; di tempat ia turun, dalam tambakan. Di atas sifar (dilorek jingga) tanah bergerak ke arah stesen; di bawah sifar (hijau), ke arah bertentangan stesen.
- **Titik seimbang** ialah tempat garisan merentasi sifar: antara dua daripadanya, potongan dan tambakan seimbang. Jadual menyenaraikan setiap bahagian seimbang, isipadu yang dialihkan (titik tertinggi atau terendahnya) dan jarak angkut purata (kawasan dilorek dibahagi dengan isipadu itu).
- Di tempat garisan berakhir tidak pada sifar, apa yang tinggal ialah **buangan** (di atas) atau **pinjaman** (di bawah). Dalam bahagian terakhir itu hanya tanah di luar aras ia berakhir dikira sebagai dialihkan.

**CSV** menyimpan ordinat jisim pada setiap keratan, bahagian-bahagian dan faktornya.
