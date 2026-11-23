---
title: Garisan sampel dan keratan rentas
summary: Potong keratan tegak lurus kepada penjajaran, lihat tanah, reka bentuk serta potongan dan tambakan pada setiap stesen, dan dapatkan isipadu menggunakan kaedah purata luas hujung.
keywords: angkutan jisim, gambar rajah jisim, titik imbangan, pengecutan, pengembangan, jarak angkutan, pinjaman, buangan, helaian keratan, helaian keratan rentas, pdf keratan, keratan, keratan rentas, garis sampel, paparan keratan, potongan, tambakan, luas, purata luas hujung, isipadu hujung, kerja tanah, stesen, ofset, csv
from: 09639ce2
---

Keratan rentas menunjukkan jalan seperti yang akan dibina: merentasi penjajaran pada satu stesen, tanah sedia ada, reka bentuk (koridor atau pelantar yang digredkan) dan potongan serta tambakan di antaranya.

## Tambah garis sampel

1. Pilih penjajaran. Dalam **Sifat**, di bawah **Garis sampel**, klik {{ui:Tambah garis sampel}}.
2. Tetapkan **Setiap** (jarak: 50 ft atau 20 m untuk permulaan), **Lebar kiri** dan **Lebar kanan** (sejauh mana setiap keratan mencapai dari garis tengah).
3. Untuk memotong keratan pada stesen tertentu, taip dalam **Tambah stesen** (contohnya `2+35`) dan tekan {{key:Enter}}.

Keratan dipotong pada setiap gandaan penuh jarak, pada kedua-dua hujung penjajaran, pada permulaan dan penamat setiap lengkung (PC dan PT), dan pada stesen yang anda tambah. Garis sampel ditunjukkan pada pelan sebagai garis kelabu merentasi penjajaran; ia juga dieksport dalam DXF, DWG dan PDF pada lapisan C-ROAD-SCTN. Setiap perubahan ialah satu langkah: {{key:Mod+Z}} membuat asalnya.

## Paparan keratan

Buka dengan {{ui:Paparan keratan}} dalam **Sifat** penjajaran, {{ui:Keratan}} di bawah **Permukaan** › {{ui:Lagi}}, atau {{key:X}}. Ia menggantikan paparan profil di bawah pelan.

- Langkah melalui keratan dengan anak panah dalam bar, senarai stesen, atau {{key:Left}} dan {{key:Right}} apabila paparan keratan difokuskan ({{key:Home}} dan {{key:End}} untuk yang pertama dan terakhir).
- Garis kelabu ialah tanah sedia ada, garis merah ialah reka bentuk. Potongan berwarna jingga, tambakan hijau. Titik koridor ditanda: CL (garis tengah), EOP (tepi turapan), SH (bahu) dan DL (persilangan cerun).
- Pengepala memberi stesen, luas potongan dan tambakan keratan ini, dan pembesaran menegak. **Muat** memenuhi panel; pilih 1× untuk melihat keratan pada skala sebenar.
- Garis tebal pada pelan menunjukkan keratan mana yang dipaparkan.
- **Zum dan pan:** roda menzum sekitar penunjuk, dan menyeret mengalihkan paparan. {{ui:Muat}} (atau {{key:F}}, atau klik dua kali) memuatkan keseluruhan keratan semula.

## Ukur dalam keratan

1. Klik {{ui:Ukur}} dalam bar keratan, atau tekan {{key:M}}. Petunjuk berkata "Klik titik pertama, kemudian titik kedua."
2. Klik dua titik. Setiap satu melekat pada hujung garisan atau titik koridor (CL, EOP, SH, DL); tahan {{key:Alt}} untuk titik bebas.
3. Bacaan memberi jarak mengufuk (ΔH), jarak menegak (ΔV), cerun dalam peratus dengan nisbahnya, dan panjang lurus, dalam unit projek.

Klik sekali lagi untuk memulakan ukuran baharu. {{key:Esc}} mengosongkannya, dan {{key:M}} mematikan Ukur.

## Helaian keratan

{{ui:Helaian keratan (PDF)}} di bawah **Garis sampel** meletakkan setiap keratan pada halaman PDF, dalam baris dari kiri ke kanan dan atas ke bawah mengikut tertib stesen. Pilih **Kertas**, **Skala pelan** (skala mengufuk keratan) dan **Pembesaran profil** (1×, 2×, 5× atau 10×); dialog menyatakan berapa keratan muat dalam satu halaman dan berapa halaman yang terhasil.

Setiap keratan menunjukkan grid dengan ofset dan aras, tanah (putus-putus), reka bentuk, potongan dan tambakan yang diteduhkan (jingga dan hijau), titik koridor, dan di bawahnya stesennya serta luas potongan dan tambakannya. Setiap keratan pada helaian dilukis dengan saiz yang sama, cukup tinggi untuk yang terbesar; apabila itu tidak muat pada halaman pada pembesaran anda, CivilCraft menggunakan yang terbesar yang muat dan menyatakannya. Jalur tajuk menamakan penjajaran, stesen pada halaman itu, skala dan "Helaian 1 daripada 3".

## Potongan dan tambakan diukur kepada apa

Koridor boleh mempunyai lapisan di bawah turapan: lapisan turapan, komponen templat, trek. Pilihan **Isipadu diukur kepada** dalam bar keratan memilih sehingga apa potongan dan tambakan dikira:

- **Permukaan bawah** (permulaan): ke bahagian bawah komponen itu, supaya potongan termasuk kedalaman binaan turapan.
- **Permukaan atas**: ke bahagian atas reka bentuk sahaja, seperti sebelum komponen dikira.

Luas dalam pengepala, isipadu di bawah, CSV dan angkutan jisim semuanya mengikut pilihan ini, dan ia disimpan bersama projek.

## Isipadu mengikut purata luas hujung

Antara dua keratan bersebelahan, isipadu ialah purata dua luasnya didarab jarak antara stesennya. Bar menunjukkan jumlah bagi penjajaran, dan {{ui:CSV}} memuat turun setiap luas dan isipadu keratan dengan jumlah berjalan (yard padu bagi projek kaki, meter padu bagi projek metrik).

**Sifat** menunjukkan jumlah yang sama di sebelah isipadu kaedah grid daripada [Isipadu kerja tanah](topic:volumes). Kedua-duanya ialah anggaran yang berbeza: keratan yang lebih rapat mendekatkannya, dan pada jalan lurus di atas tanah rata ia sama.

:::note
Potongan dan tambakan hanya dikira di dalam kawasan yang digredkan (garis persilangan cerun koridor atau pelantar), seperti kaedah grid. Tanpa koridor atau pelantar, reka bentuknya ialah tanah itu sendiri, jadi keratan tidak menunjukkan potongan atau tambakan.
:::

## Angkutan jisim

**Angkutan jisim** di bawah **Garis sampel** melukis gambar rajah angkutan jisim daripada isipadu luas hujung yang sama: sepanjang stesen, jumlah berjalan potongan tolak tambakan.

- **Pengecutan (−) atau pengembangan (+) potongan** menyatakan apa yang dihasilkan satu yard padu potongan apabila ia diletakkan sebagai tambakan: −10 % (nilai permulaan, nilai ganti) bermaksud ia mengecut kepada 0.9; batu yang mengembang mungkin +5 %. Gunakan angka daripada laporan geoteknik anda.
- Di tempat garis naik, jalan berada dalam potongan; di tempat ia turun, dalam tambakan. Di atas sifar (diteduhkan jingga) tanah bergerak ke arah stesen naik; di bawah sifar (hijau), ke arah stesen turun.
- **Titik imbangan** ialah tempat garis merentasi sifar: antara dua daripadanya potongan dan tambakan seimbang. Jadual menyenaraikan setiap bahagian yang seimbang, isipadu yang dipindahkan (titik tertinggi atau terendahnya) dan jarak angkutan purata (luas teduhan dibahagi isipadu itu).
- Di tempat garis berakhir tidak pada sifar, apa yang tinggal ialah **buangan** (di atas) atau **pinjaman** (di bawah). Pada bahagian terakhir itu hanya tanah melebihi aras tempat ia berakhir dikira sebagai dipindahkan.

**CSV** menyimpan ordinat jisim pada setiap keratan, bahagian dan faktor.
