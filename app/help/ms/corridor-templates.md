---
title: Templat koridor dan templat rupa bumi
summary: Bina templat kecil yang boleh digunakan semula (kerb dan longkang, kaki lima, dinding, parit), bina koridor daripadanya mengikut stesen dengan kiri dan kanan diasingkan, pecahkan penjajaran kepada beberapa koridor, dan letakkan lapisan bahan atas rupa bumi.
keywords: templat, pustaka templat, penciptaan templat, keratan jenis, himpunan, subhimpunan, komponen, kod titik, keadaan akhir, persilangan cerun, parit, dinding penahan, kerb, longkang, kaki lima, wilayah, julat stesen, beberapa koridor, berbilang koridor, kiri dan kanan, templat rupa bumi, tanah atas, turapan, asas, letak atas, bahan, kuantiti
from: ce70e58b
---

Templat ialah keratan rentas kecil yang anda lukis sekali dan guna semula: titik dengan ofset, cerun dan kod titik, serta komponen dengan bahan. Koridor boleh dibina daripada templat mengikut stesen, setiap sisi dengan templat turapannya sendiri dan keadaan akhirnya sendiri, dan templat yang sama boleh diletakkan atas rupa bumi.

:::warning
Templat contoh ialah tempat letak untuk bermula. Nombornya tidak diambil daripada mana-mana piawaian atau agensi. Seorang jurutera mesti menyemak setiap templat, dan setiap nilai yang anda berikan kepadanya, sebelum ia digunakan untuk reka bentuk.
:::

## Buka templat

Buka {{ui:Permukaan}} › {{ui:Lagi}} › {{ui:Templat koridor…}} (atau taip {{cmd:TEMPLATES}}). Tetingkap itu mempunyai tiga senarai:

- **Dalam projek ini**: templat yang digunakan oleh koridor dan templat rupa bumi projek ini. Ia disimpan dalam fail projek.
- **Pustaka saya**: templat yang disimpan dalam pelayar ini dan ditawarkan dalam setiap projek. Gunakan {{ui:Simpan ke Pustaka saya}} pada templat projek untuk menyimpannya.
- **Contoh**: dua lorong dengan lapisan, kerb dan longkang, kaki lima, persilangan cerun, parit, dinding penahan, tanah atas di bawah rupa bumi, dan turapan atas rupa bumi. Setiap satu ditanda "For checking by an engineer" (untuk semakan oleh jurutera).

{{ui:Guna dalam projek ini}} menyalin templat pustaka atau contoh ke dalam projek. {{ui:Eksport templat projek ini}} menyimpannya sebagai fail `.cctemplates.json`, dan {{ui:Import fail}} membaca satu ke dalam projek dan Pustaka saya. Gunakan fail itu untuk berkongsi templat atau memindahkannya ke komputer lain.

## Buat templat

{{ui:Templat baharu}} (atau {{ui:Sunting}} pada templat projek) membuka editor templat. Lukis bahagian kanan, keluar dari titik 0,0 templat; bahagian kiri menggunakan templat yang sama keluar ke kiri.

1. Beri nama dan jenis: **Turapan** (templat seterusnya dilampirkan di hujungnya), **Keadaan akhir** (ia bertemu tanah) atau **Templat rupa bumi**.
2. Tambah **nilai**: nombor bernama seperti lebar `w` atau cerun `s`. Kotak nombor di mana-mana dalam templat menerima nombor atau nama nilai; `-t` ialah nilai `t` yang dijadikan negatif. Koridor boleh memberi setiap penggunaan templat nilainya sendiri, jadi satu templat kerb melayani setiap ketinggian kerb.
3. Tambah **titik** mengikut tertib. Setiap satu diletakkan daripada titik sebelumnya (atau titik 0,0) mengikut kekangannya:

| Kekangan | Meletakkan titik |
|---|---|
| Ofset pada cerun | Ofset ke luar dan cerun (kenaikan setiap larian; −0.02 menurun 2%) |
| Ofset dan kenaikan | Ofset dan kenaikan |
| Lurus ke atas atau ke bawah | Kenaikan sahaja |
| Cerun sisi ke tanah | Keluar dari titiknya ke tanah, pada nisbah potongan di mana tanah berada di atas dan nisbah tambakan di mana ia berada di bawah |
| Ke tanah | Ofset, kemudian lurus ke atas atau ke bawah ke tanah |
| Dinding penahan | Dinding dengan ketebalan yang anda berikan: dalam potongan bahagian atasnya bertemu tanah di muka jalan, dalam tambakan jalan melintasinya dan muka luarnya turun ke tanah |

   Tandakan **Atas** untuk titik yang dilalui oleh permukaan siap. Titik atas terakhir ialah tempat templat seterusnya di sisi itu bermula. **Sasaran** membolehkan koridor mengalihkan titik: ofset atau arasnya datang daripada garisan.
4. Tambah **komponen**: bentuk tertutup melalui kod titik (`0` ialah titik 0,0), setiap satu dengan nama, bahan dan jenis. Luasnya memberikan isipadu.

Lukisan mengikut setiap perubahan pada skala sebenar, dan senarai di bawahnya menyatakan apa yang salah (titik yang bertemu tanah sebelum hujung, nilai yang templat tidak miliki, komponen tanpa luas). {{ui:Tambah ke projek ini}} atau {{ui:Simpan}} menyimpannya, sebagai satu langkah buat asal.

## Bina koridor daripada templat

Pilih penjajaran dengan koridor dan, dalam Sifatnya, hidupkan {{ui:Bina daripada templat mengikut stesen}}. Koridor bermula dengan contoh dua lorong dan persilangan cerun pada kedua-dua sisi.

- **Wilayah.** Setiap wilayah bermula pada stesen dan berjalan ke stesen wilayah seterusnya. {{ui:Tambah kawasan}} menambah satu; tukar stesen permulaannya dalam kotaknya.
- **Kiri dan kanan diasingkan.** Setiap sisi bagi setiap wilayah mempunyai senarai **Turapan** sendiri, dari paksi tengah ke luar, dan **Keadaan akhir** sendiri: persilangan cerun, parit, dinding, atau mana-mana templat yang bertemu tanah. Tanpa keadaan akhir, sisi itu bersilang cerun di potongan dan tambakan koridor. {{ui:Salin dari kiri ke kanan}} menyalin satu sisi.
- **Nilai dan sasaran.** Di bawah setiap templat pada satu sisi, satu kotak bagi setiap nilai (kosong = nilai templat itu sendiri) dan, untuk titik yang mengambil sasaran, garisan ciri atau garisan koridor lain yang mengalihkannya.
- **Dari dan Ke** mengehadkan koridor kepada sebahagian penjajaran.

Keratan, garisan pelan bagi setiap kod titik, permukaan yang dicadangkan, pancang dan kerja tanah semuanya mengikut. Sifat menyenaraikan isipadu setiap komponen mengikut sisi dan wilayah (purata luas hujung sepanjang paksi tengah). Superelevasi dan sasaran tepi koridor tidak digunakan semasa koridor dibina daripada templat.

## Beberapa koridor pada satu penjajaran

Di bawah **Koridor pada penjajaran ini**, {{ui:Tambah koridor}} menambah koridor pada baki penjajaran: koridor pertama diberi stesen akhir di tengah (atau mengekalkan miliknya sendiri), dan yang baharu bermula di situ dengan wilayah templat terakhir yang pertama. Setiap koridor mempunyai nama, julat stesen, templat dan kerja tanahnya sendiri. Matikan satu dengan kotak {{ui:Hidup}}nya. Apabila dua julat bertindih, koridor kemudian meratakan di atas yang lebih awal.

## Templat rupa bumi

Templat rupa bumi meletakkan lapisan templat atas rupa bumi dari titik 0,0-nya: lapisan di bawah titik 0,0 masuk ke dalam tanah (tanah atas untuk dikupas), lapisan di atasnya duduk di atas tanah (asas dan turapan pada tempat letak). Lebar dan cerun tidak penting, hanya kedalaman setiap komponen di atas atau di bawah titik 0,0.

Buka {{ui:Permukaan}} › {{ui:Lagi}} › {{ui:Templat rupa bumi…}} (atau taip {{cmd:TERRAINTEMPLATES}}); blok itu juga ada dalam Sifat projek. {{ui:Tambah templat rupa bumi}} menambah satu dengan contoh tanah atas. Untuk setiap satu pilih:

- **templat** (nilainya boleh ditukar untuk yang ini),
- **rupa bumi**: tanah sedia ada atau permukaan yang dicadangkan,
- **bentuk** yang memotongnya: keseluruhan rupa bumi, lot, pelantar atau garis ciri tertutup. Beberapa templat rupa bumi boleh menggunakan bentuk berbeza pada rupa bumi yang sama.

Setiap lapisan menyenaraikan ketebalannya, luas pelan dan isipadu. Isipadu ialah luas pelan darab ketebalan, ketebalan diukur lurus ke bawah; luas diukur pada grid, dan luas yang diletakkan (bercerun) juga diberikan. Bentuk dilukis pada pelan pada lapisan C-TOPO-TMPL. Templat rupa bumi tidak mengubah permukaan yang dicadangkan.

## Bahan dan kuantiti

Blok Kerja tanah projek menyenaraikan **Bahan daripada templat**: setiap komponen koridor dan lapisan templat rupa bumi dengan isipadunya. {{ui:Hantar ke TakeoffCraft}} menulisnya ke dalam fail kuantiti selepas potongan dan tambakan, satu item setiap satu, dalam yard padu (projek kaki) atau meter padu.

## Fail

Templat, wilayah, koridor tambahan dan templat rupa bumi disimpan dalam fail projek. Projek yang tidak menggunakannya langsung disimpan seperti sebelum ini, dan binaan CivilCraft yang lebih lama membuka projek yang menggunakannya (ia mengabaikan templat dan membina himpunan koridor sendiri).
