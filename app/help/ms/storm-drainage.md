---
title: Kira aliran ribut, saiz paip dan garis kecerunan hidraulik
summary: Lukis kawasan tadahan yang mengalir ke setiap struktur, jumlahkan aliran sepanjang rangkaian dengan kaedah rasional, tentukan saiz paip mengikut persamaan Manning, dan lihat di mana garis kecerunan hidraulik penuh atau mencapai permukaan.
keywords: saliran ribut, kawasan tadahan, kawasan saliran, kaedah rasional, pekali larian, masa penumpuan, keamatan hujan, idf, manning, saiz paip, garis kecerunan hidraulik, hgl, garis kecerunan tenaga, egl, limpahan, banjir, air hiliran
from: e44872ec
---

Saliran ribut berfungsi pada [rangkaian paip](topic:pipe-network): lukis rangkaian dahulu, kemudian kawasan yang mengalir ke dalamnya. Semuanya muncul di bawah **Saliran ribut** dalam panel kanan apabila tiada apa yang dipilih.

## Lukis kawasan tadahan

1. Klik **Lukis kawasan tadahan** di bawah **Saliran ribut**.
2. Klik bucu kawasan yang mengalir ke satu struktur. {{key:Enter}} atau klik dua kali untuk menamatkan; {{key:Backspace}} mengundur bucu terakhir, {{key:Esc}} berhenti.
3. Kawasan tadahan mengalir ke struktur di dalamnya, jika tiada, ke yang terdekat. **Sifat**nya dibuka: tetapkan namanya, **Pekali larian C** (bahagian hujan yang mengalir keluar, 0 hingga 1), **Masa penumpuan** dalam minit, dan struktur mana ia **Mengalir ke**.

**Lukis kawasan tadahan lain** dalam Sifatnya memulakan yang seterusnya. Klik di dalam kawasan tadahan pada pelan untuk memilihnya; {{key:Delete}} memadamkannya. Setiap perubahan ialah satu langkah: {{key:Mod+Z}} membuat asalnya.

## Tetapkan ribut reka bentuk

Keamatan hujan ialah i = a ÷ (tc + b) dipangkatkan dengan c, dalam inci sejam untuk projek kaki dan milimeter sejam untuk projek meter. Padankan **Keamatan a**, **b** dan **c** dengan lengkung keamatan-tempoh-kekerapan anda sendiri untuk tempoh pulangan yang anda reka bentuk.

:::warning
Lengkung keamatan permulaan, Manning n (0.013) dan kehilangan simpang (0.5) ialah nilai sementara, bukan piawaian. Tetapkannya daripada data hujan dan kriteria reka bentuk anda sendiri.
:::

- **Masa penumpuan terpendek**: tiada paip dikira pada masa yang lebih pendek (10 minit pada mulanya).
- **Manning n**: kekasaran paip.
- **Kehilangan simpang**: tinggi yang hilang di setiap struktur, sebagai bahagian daripada tinggi halaju V²/2g paip yang keluar darinya.
- **Aras air pada outlet**: air hiliran, di mana paip terakhir kosong. Biarkan kosong apabila outlet mengalir bebas.

## Bagaimana aliran dijumlahkan

Setiap paip membawa setiap kawasan tadahan di atasnya. Q = C × i × A, di mana C × A dijumlahkan sepanjang rangkaian dan i ialah keamatan pada masa penumpuan terpanjang bagi air yang sampai: masa kawasan itu sendiri, atau masa dari kawasan hulu tambah masa perjalanan melalui paip (panjang ÷ halaju apabila mengalir penuh). Q dalam kaki padu sesaat (A dalam ekar) atau meter padu sesaat (A dalam hektar).

## Saiz paip

Jadual di bawah **Aliran dan garis kecerunan** menunjukkan, bagi setiap paip, aliran, apa yang dibawanya apabila mengalir penuh pada cerunnya, halaju, kecerunan hidraulik di bahagian atas dan bahagian bawahnya, dan kedalaman alirannya.

**Saiz paip untuk aliran ini** memberi setiap paip saiz piawai terkecil yang membawa alirannya pada cerunnya sendiri (12 hingga 72 in, atau 300 hingga 1800 mm). Ia ialah satu langkah. Invert kekal di tempatnya: jika saiz berubah, gunakan {{ui:Tetapkan setiap invert daripada peraturan}} untuk mengekalkan penutup, kemudian semak jadual semula.

## Baca garis kecerunan

Garis kecerunan hidraulik (HGL) dikira dari outlet ke hulu:

- Paip yang mengalir separa penuh mempunyai HGL-nya pada permukaan air: invert tambah kedalaman normal.
- Apabila air di bawahnya lebih tinggi daripada mahkotanya, atau ia membawa lebih daripada yang mampu apabila mengalir penuh, ia mengalir penuh (dipenuhi lebihan) dan HGL-nya naik mengikut kecerunan geseran sepanjangnya.
- Di setiap struktur, HGL ialah HGL atas paip yang keluar tambah kehilangan simpang.
- Garis kecerunan tenaga (EGL) ialah HGL tambah tinggi halaju.

Paip yang mengalir penuh disenaraikan, dan begitu juga mana-mana struktur di mana HGL melebihi tebing: air mencapai permukaan di situ, dan struktur itu dibulatkan dengan warna merah pada pelan. Pilih paip atau struktur untuk melihat alirannya, kedalaman, halaju dan kedua-dua garis kecerunan dalam Sifatnya.

## Halakan ribut

Kaedah rasional memberi satu puncak untuk setiap paip. {{ui:Halakan ribut}} (di bawah hasil, dalam Sifat rangkaian) mengira keseluruhan ribut: larian setiap kawasan tadahan mengikut masa, dibawa ke bawah paip bersama masa perjalanan dan storan, dan ditambah di tempat ia bertemu.

1. Biarkan {{ui:Hujan berlangsung}} dan {{ui:Keamatan hujan}} kosong untuk menggunakan masa penumpuan terpanjang dan lengkung hujan di atas, atau taip sendiri.
2. Tekan {{ui:Halakan ribut}}. Jadual menyenaraikan, bagi setiap paip, aliran masuk dan keluar tertinggi, sejauh mana puncak keluar lebih rendah, berapa banyak kapasiti penuh paip yang digunakan, dan minit ia memuncak.
3. Setiap outlet mendapat carta kecil aliran melawan masa dan {{ui:Muat turun hidrograf (CSV)}}.

Kawasan tadahan menghantar keluar hujan yang dipuratakan pada masa penumpuannya, maka ribut yang lebih pendek daripada itu memuncak lebih rendah daripada C × i × A. Setiap paip dilaluan dengan kaedah Muskingum–Cunge, menggunakan kedalaman aliran yang telah ditemui oleh kaedah rasional. Dua cabang dengan masa penumpuan berbeza tidak memuncak serentak, maka jumlahnya lebih rendah daripada jumlah puncaknya.

Ini tidak memodelkan limpahan, air belakang, storan dalam struktur atau banjir. Paip yang puncak dilaluannya melebihi kapasiti penuhnya disenaraikan, dan airnya dihantar seolah-olah ia muat. Gunakannya untuk melihat masa dan pengurangan, bukan untuk menentukan saiz paip. Ia alat pengiraan: seorang jurutera perlu menyemaknya.

## Disimpan bersama projek

Kawasan tadahan dan tetapan ribut disimpan dalam fail projek. Ia belum ada dalam plot PDF, DWG atau DXF, atau LandXML: lihat [Belum dibina](topic:not-built-yet).
