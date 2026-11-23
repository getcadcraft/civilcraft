---
title: Garis sampel dan penampang melintang
summary: Potong penampang tegak lurus terhadap alinyemen, lihat tanah, rancangan, serta galian dan timbunan di tiap stasiun, dan dapatkan volume dengan metode luas ujung rata-rata.
keywords: diagram angkutan massa, diagram massa, titik seimbang, penyusutan, pengembangan, jarak angkut, material pinjam, material buangan, lembar penampang, lembar penampang melintang, PDF penampang, penampang, penampang melintang, garis sampel, tampilan penampang, galian, timbunan, luas, luas ujung rata-rata, volume luas ujung, pekerjaan tanah, stasiun, offset, CSV
from: 09639ce2
---

Penampang melintang menampilkan jalan sebagaimana akan dibangun: melintang alinyemen pada satu stasiun, tanah asli, rancangan (koridor atau pad yang di-grading), serta galian dan timbunan di antara keduanya.

## Tambah garis sampel

1. Pilih alinyemen. Di **Properti**, di bawah **Garis sampel**, klik {{ui:Tambah garis sampel}}.
2. Atur **Setiap** (jaraknya: 50 ft atau 20 m sebagai awal), **Lebar kiri** dan **Lebar kanan** (seberapa jauh tiap penampang mencapai dari as jalan).
3. Untuk memotong penampang pada stasiun tertentu, ketik di **Tambah stasiun** (misalnya `2+35`) dan tekan {{key:Enter}}.

Penampang dipotong pada setiap kelipatan utuh jarak, di kedua ujung alinyemen, di awal dan akhir setiap lengkung (PC dan PT), serta pada stasiun yang Anda tambahkan. Garis sampel tampil di denah sebagai garis abu-abu melintang alinyemen; garis itu juga ikut ke DXF, DWG, dan PDF pada layer C-ROAD-SCTN. Setiap perubahan adalah satu langkah: {{key:Mod+Z}} membatalkannya.

## Tampilan penampang

Bukalah dengan {{ui:Tampilan penampang}} di **Properti** alinyemen, {{ui:Penampang}} di bawah **Permukaan** › {{ui:Lainnya}}, atau {{key:X}}. Tampilan ini menggantikan tampilan profil di bawah denah.

- Telusuri penampang dengan panah di bilahnya, daftar stasiun, atau {{key:Left}} dan {{key:Right}} saat tampilan penampang difokuskan ({{key:Home}} dan {{key:End}} untuk yang pertama dan terakhir).
- Garis abu-abu adalah tanah asli, garis merah adalah rancangan. Galian diarsir jingga, timbunan hijau. Titik koridor diberi tanda: CL (as jalan), EOP (tepi perkerasan), SH (bahu), dan DL (daylight).
- Header memberikan stasiun, luas galian dan timbunan penampang ini, serta eksagerasi vertikal. {{ui:Paskan}} mengisi panel; pilih 1× untuk melihat penampang sesuai skala sebenarnya.
- Garis tebal di denah menunjukkan penampang mana yang sedang tampil di layar.
- **Zoom dan geser:** roda mouse memperbesar di sekitar penunjuk, dan seretan menggeser tampilan. {{ui:Paskan}} (atau {{key:F}}, atau klik dua kali) memaskan seluruh penampang lagi.

## Ukur dalam penampang

1. Klik {{ui:Ukur}} di bilah penampang, atau tekan {{key:M}}. Petunjuknya berbunyi "Klik titik pertama, lalu titik kedua."
2. Klik dua titik. Tiap titik menempel ke ujung garis atau titik koridor (CL, EOP, SH, DL); tahan {{key:Alt}} untuk titik bebas.
3. Hasil bacaan memberikan jarak horizontal (ΔH), jarak vertikal (ΔV), kemiringan dalam persen dengan rasionya, dan panjang lurus, dalam satuan proyek.

Klik lagi untuk memulai pengukuran baru. {{key:Esc}} menghapusnya, dan {{key:M}} mematikan Ukur.

## Lembar penampang

{{ui:Lembar penampang (PDF)}} di bawah **Garis sampel** menempatkan setiap penampang pada halaman PDF, dalam baris dari kiri ke kanan dan atas ke bawah menurut urutan stasiun. Pilih **Kertas**, **Skala denah** (skala horizontal penampang), dan **Eksagerasi profil** (1×, 2×, 5×, atau 10×); dialog menyatakan berapa penampang yang muat per halaman dan berapa halaman yang dihasilkan.

Tiap penampang menampilkan kisi dengan offset dan elevasi, tanah (putus-putus), rancangan, galian dan timbunan yang diarsir (jingga dan hijau), titik koridor, serta di bawahnya stasiun dan luas galian dan timbunannya. Setiap penampang di lembar digambar dengan ukuran sama, cukup tinggi untuk yang paling besar; bila itu tidak muat di halaman pada eksagerasi Anda, CivilCraft memakai yang terbesar yang muat dan memberi tahu Anda. Jalur judul menyebut nama alinyemen, stasiun di halaman itu, skala, dan "Lembar 1 dari 3".

## Galian dan timbunan diukur sampai mana

Koridor dapat memiliki lapisan di bawah perkerasan: lapis perkerasan, komponen templat, dan trek. Pilihan **Volume diukur sampai** di bilah penampang menentukan sampai mana galian dan timbunan diukur:

- **Permukaan bawah** (awal): sampai dasar komponen-komponen itu, sehingga galian mencakup kedalaman susunan perkerasan.
- **Permukaan atas**: hanya sampai puncak rancangan, seperti sebelum komponen dihitung.

Luas di header, volume di bawah, CSV, dan diagram angkutan massa mengikuti pilihan ini, dan pilihan itu disimpan bersama proyek.

## Volume dengan luas ujung rata-rata

Di antara dua penampang yang bertetangga, volumenya adalah rata-rata dari kedua luasnya dikalikan jarak antara stasiunnya. Bilah menampilkan total untuk alinyemen, dan {{ui:CSV}} mengunduh luas dan volume tiap penampang dengan total berjalan (yard kubik untuk proyek kaki, meter kubik untuk proyek metrik).

**Properti** menampilkan total yang sama di samping volume metode grid dari [Volume pekerjaan tanah](topic:volumes). Keduanya adalah perkiraan yang berbeda: penampang yang lebih rapat membuatnya lebih dekat, dan pada jalan lurus di tanah datar keduanya sama.

:::note
Galian dan timbunan hanya dihitung di dalam area yang di-grading (garis daylight koridor atau pad), seperti pada metode grid. Tanpa koridor atau pad, rancangan adalah tanah itu sendiri, sehingga penampang tidak menunjukkan galian atau timbunan.
:::

## Diagram angkutan massa

**Diagram angkutan massa** di bawah **Garis sampel** menggambar diagram angkutan massa dari volume luas ujung yang sama: sepanjang stasiun, total berjalan dari galian dikurangi timbunan.

- **Penyusutan (−) atau pengembangan (+) galian** menyatakan apa yang dihasilkan satu yard kubik galian setelah dipasang sebagai timbunan: −10 % (nilai awal, pengisi sementara) berarti menyusut menjadi 0.9; batu yang mengembang mungkin +5 %. Gunakan angka dari laporan geoteknik Anda.
- Di tempat garis naik, jalan berada di galian; tempat garis turun, di timbunan. Di atas nol (diarsir jingga) tanah bergerak naik stasiun; di bawah nol (hijau), turun stasiun.
- **Titik seimbang** adalah tempat garis memotong nol: di antara dua titik, galian dan timbunan seimbang. Tabel mendaftar tiap ruas yang seimbang, volume yang dipindahkan (titik tertinggi atau terendahnya), dan jarak angkut rata-rata (area yang diarsir dibagi volume itu).
- Di tempat garis berakhir tidak di nol, sisanya adalah **material buangan** (di atas) atau **material pinjam** (di bawah). Di ruas terakhir itu, hanya tanah di luar level tempat ia berakhir yang dihitung sebagai dipindahkan.

**CSV** menyimpan ordinat massa di setiap penampang, ruas-ruasnya, dan faktornya.
