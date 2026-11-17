---
title: Garis sampel dan penampang melintang
summary: Potong penampang tegak lurus alinyemen, lihat tanah, desain, serta galian dan timbunan di setiap stasiun, dan dapatkan volume dengan rata-rata luas ujung.
keywords: diagram angkutan massa, kurva massa, titik seimbang, susut, mengembang, jarak angkut, material pinjam, material buangan, lembar penampang, lembar penampang melintang, pdf penampang, penampang, penampang melintang, garis sampel, tampilan penampang, galian, timbunan, luas, rata-rata luas ujung, volume galian dan timbunan, pekerjaan tanah, stasiun, offset, csv
from: 5060173c
---

Penampang melintang menunjukkan jalan seperti akan dibangun: melintang alinyemen di satu stasiun, tanah yang ada, desain (koridor atau pad yang sudah diratakan), serta galian dan timbunan di antara keduanya.

## Tambah garis sampel

1. Pilih sebuah alinyemen. Di **Properti**, di bawah **Garis sampel**, klik {{ui:Tambah garis sampel}}.
2. Atur **Setiap** (jaraknya: 50 ft atau 20 m untuk memulai), **Lebar kiri** dan **Lebar kanan** (seberapa jauh setiap penampang meraih dari sumbu).
3. Untuk memotong penampang di stasiun tertentu, ketik di **Tambah stasiun** (misalnya `2+35`) dan tekan {{key:Enter}}.

Penampang dipotong pada setiap kelipatan penuh dari jarak itu, di kedua ujung alinyemen, di awal dan akhir setiap lengkung (PC dan PT), dan di stasiun yang Anda tambahkan. Garis sampel tampil di denah sebagai garis abu-abu melintang alinyemen; garis itu juga diekspor ke DXF, DWG, dan PDF pada layer C-ROAD-SCTN. Setiap perubahan adalah satu langkah: {{key:Mod+Z}} membatalkannya.

## Tampilan penampang

Buka dengan {{ui:Tampilan penampang}} di **Properti** alinyemen, {{ui:Penampang}} di bawah **Permukaan** › {{ui:Lainnya}}, atau {{key:X}}. Ini menggantikan tampilan profil di bawah denah.

- Telusuri penampang dengan panah di bilahnya, daftar stasiun, atau {{key:Left}} dan {{key:Right}} saat tampilan penampang difokuskan ({{key:Home}} dan {{key:End}} untuk yang pertama dan terakhir).
- Garis abu-abu adalah tanah yang ada, garis merah adalah desain. Galian diberi warna oranye, timbunan hijau. Titik koridor diberi tanda: CL (sumbu jalan), EOP (tepi perkerasan), SH (bahu), dan DL (daylight).
- Header menampilkan stasiun, luas galian dan timbunan penampang ini, serta pembesaran vertikal. **Paskan** mengisi panel; pilih 1× untuk melihat penampang sesuai skala sebenarnya.
- Garis tebal pada denah menunjukkan penampang mana yang tampil di layar.

## Lembar penampang

{{ui:Lembar penampang (PDF)}} di bawah **Garis sampel** menaruh setiap penampang pada halaman PDF, dalam baris dari kiri ke kanan dan atas ke bawah menurut urutan stasiun. Pilih **Kertas**, **Skala denah** (skala horizontal penampang), dan **Pembesaran profil** (1×, 2×, 5×, atau 10×); dialog menyebutkan berapa penampang muat di satu halaman dan berapa halaman yang dihasilkan.

Setiap penampang menampilkan kisi dengan offset dan elevasi, tanah (putus-putus), desain, galian dan timbunan yang diberi warna (oranye dan hijau), titik koridor, serta di bawahnya stasiun dan luas galian dan timbunannya. Setiap penampang pada lembar digambar dengan ukuran yang sama, cukup tinggi untuk yang terbesar; bila itu tidak muat di halaman pada pembesaran Anda, CivilCraft memakai yang terbesar yang muat dan menyatakannya. Strip judul menyebutkan alinyemen, stasiun pada halaman itu, skala, dan "Lembar 1 dari 3".

## Volume dengan rata-rata luas ujung

Di antara dua penampang yang bertetangga, volumenya adalah rata-rata dari kedua luasnya dikali jarak antara stasiunnya. Bilah menampilkan total untuk alinyemen, dan {{ui:CSV}} mengunduh luas dan volume setiap penampang beserta total berjalannya (yard kubik untuk proyek kaki, meter kubik untuk proyek metrik).

**Properti** menampilkan total yang sama di samping volume metode kisi dari [Volume galian dan timbunan](topic:volumes). Keduanya adalah perkiraan yang berbeda: penampang yang lebih rapat membuatnya lebih dekat, dan di jalan lurus di tanah datar keduanya sama.

:::note
Galian dan timbunan hanya dihitung di dalam area yang diratakan (garis daylight koridor atau pad), seperti metode kisi. Tanpa koridor atau pad, desainnya adalah tanahnya, sehingga penampang tidak menunjukkan galian atau timbunan.
:::

## Diagram angkutan massa

**Diagram angkutan massa** di bawah **Garis sampel** menggambar diagram angkutan massa dari volume rata-rata luas ujung yang sama: sepanjang stasiun, total berjalan dari galian dikurangi timbunan.

- **Susut (−) atau mengembang (+) galian** menyatakan berapa yang dihasilkan satu yard kubik galian setelah ditempatkan sebagai timbunan: −10 % (nilai awal, nilai sementara) berarti menyusut menjadi 0.9; batuan yang mengembang mungkin +5 %. Gunakan angka dari laporan geoteknik Anda.
- Di tempat garis naik, jalan berada di galian; di tempat turun, di timbunan. Di atas nol (diberi warna oranye) tanah berpindah ke arah stasiun naik; di bawah nol (hijau), ke arah stasiun turun.
- **Titik seimbang** adalah tempat garis memotong nol: di antara dua titik itu galian dan timbunan seimbang. Tabel mencantumkan setiap ruas yang seimbang, volume yang dipindahkan (titik tertinggi atau terendahnya), dan jarak angkut rata-rata (luas yang diberi warna dibagi volume itu).
- Bila garis berakhir tidak di nol, sisanya adalah **material buangan** (di atas) atau **material pinjam** (di bawah). Pada ruas terakhir itu hanya tanah di luar level tempat garis berakhir yang dihitung sebagai dipindahkan.

**CSV** menyimpan ordinat massa di setiap penampang, ruasnya, dan faktornya.
