---
title: Rekod tumbuhan, kultivar dan saiz bekalan
summary: Senarai tumbuhan projek anda sendiri sebagai jadual: kultivar, saiz bekalan (bekas, bebola akar, lilitan, batang bebas), ketumpatan, nota spesifikasi, CSV masuk dan keluar; setiap tumbuhan yang diletakkan menamakan saiz; simbol tumbuhan mengikut skala dan simbol serta model 3D sendiri anda.
keywords: jadual tumbuhan, pangkalan data tumbuhan, kultivar, varieti, saiz bekalan, bekas, bebola akar, akar bebola, akar terdedah, lilitan, batang bebas, ketumpatan, tumbuhan per meter persegi, spesifikasi, nota spesifikasi, simbol tumbuhan, blok, simbol sendiri, tumbuhan 3D, tahap perincian, skala
from: 12251beb
---

Buka {{ui:Plant table}} daripada menu {{ui:More}} kumpulan Landskap, atau daripada bahagian Tumbuhan. Setiap baris ialah rekod tumbuhan dalam senarai projek ini sendiri (rekod daripada senarai tumbuhan disalin apabila anda menambahnya). Setiap suntingan diperiksa seperti fail yang diimport, dan ia merupakan satu langkah buat asal.

## Lajur

- **Nama botani**, **Nama biasa**, **Jenis**, **Ketinggian** dan **Lebar** pada matang (meter).
- **Jarak** (pusat ke pusat) atau **Ketumpatan** (tumbuhan per m²). Katil bagi rekod yang mempunyai ketumpatan dan tiada jarak diisi pada ketumpatan itu, mengikut corak tersendiri (segi tiga atau segi empat sama).
- **Saiz bekalan**: satu entri bagi setiap saiz, dipisahkan dengan `;`. Setiap entri ialah id, satu jenis (`container`, `rootball`, `wrapped`, `bareroot`, `plug`, `seed`) dan kemudian mana-mana daripada: isipadu `10L`, ketinggian `h0.6`, lebar `s0.4`, lilitan `g14-16` (cm), batang bebas `st1.8`. Contoh: `c10 container 10L h0.6; rb rootball h3 g14-16 st1.8`.
- **Kultivar**: nama dipisahkan dengan `;`. Satu kultivar mengekalkan saiz dan nota sendiri apabila fail yang diimport mempunyainya.
- **Nota spesifikasi**.

{{ui:Duplicate}} menyalin satu baris di bawah kunci baharu; {{ui:Save as CSV}} dan {{ui:Save as a plants file}} menulis senarai itu (baris CSV bagi kultivar terletak di bawah spesiesnya, dengan `cultivar_of`). Mengimport CSV atau fail tumbuhan menggabungkannya.

## Senarai tumbuhan Pustaka anda sendiri

Log masuk ke akaun CadCraft anda (Tetapan, Add-on anda, Log masuk) dan jadual tumbuhan boleh menggunakan senarai yang anda simpan dalam Pustaka:

- {{ui:From my Library list}} membawa masuk item tumbuhan anda sendiri (termasuk yang masih menunggu semakan). Tumbuhan yang sudah anda ada di sini dikemas kini daripada Pustaka; kultivar, saiz bekalan, ketumpatan dan spesifikasi yang anda tambah di sini dikekalkan.
- {{ui:Save as a plant list}} menyimpan setiap baris sebagai item tumbuhan Pustaka anda sendiri, satu item bagi setiap spesies: tumbuhan baharu menjadi item baharu, tumbuhan yang diubah menjadi versi baharu, dan yang tidak berubah dibiarkan. Tandakan kotak dahulu: menyimpan memberikan tumbuhan kepada orang ramai di bawah CC0. Muat naik awam pertama daripada seseorang yang belum dipercayai disemak oleh manusia sebelum ia muncul, seperti setiap muat naik.

Pustaka menyimpan rekod tumbuhan asas. Kultivar, saiz bekalan, ketumpatan dan nota spesifikasi kekal dalam projek dan dalam fail tumbuhan ({{ui:Save as a plants file}}); kotak dialog menyatakan berapa baris yang terjejas setiap kali anda menyimpan.

## Tumbuhan yang diletakkan menamakan saiz

Pilih satu tumbuhan, satu pagar hidup, atau satu baris campuran bagi katil atau kawasan tanaman: apabila rekod mempunyai kultivar atau saiz bekalan, {{ui:Cultivar and size}} memilih salah satu. Jadual tumbuhan kemudian mengira mengikut spesies, kultivar dan saiz, dan label boleh memaparkannya: `{botanical} '{cultivar}' {size}` atau `{full}`.

## Simbol tumbuhan mengikut skala

{{ui:Plant graphics}} (Landskap › Lagi) menetapkan cara tumbuhan dilukis dalam pelan: **automatik** (lebih kasar daripada 1:500 bulatan pada lebar, antara 1:200 dan 1:500 lakaran dengan pusatnya, lebih halus simbol terperinci; kedua-dua skala boleh diubah) atau satu tahap untuk setiap skala. Kotak dialog Helaian mempunyai **Butiran tumbuhan dalam pelan** sendiri untuk set itu.

Pada rekod dalam bahagian Tumbuhan, {{ui:Own symbol…}} membaca SVG, atau satu blok lukisan DXF/DWG, dan melukisnya pada lebar tumbuhan pada tahap terperinci. {{ui:Own 3D model…}} membaca OBJ, STL atau GLB; dalam Grafik tumbuhan pilih **Model sendiri bagi setiap rekod** untuk melihatnya dalam 3D. Fail dihadkan (512 KB SVG, 2000 bentuk, 50 000 segi tiga) dan disimpan dalam projek. Transformasi SVG tidak digunakan (anda dimaklumkan apabila fail mempunyainya). Lihat [Grafik tumbuhan, simbol sendiri anda dan tumbuhan 3D](topic:plant-graphics) untuk tahap, had dan apa yang boleh dikandungi GLB.
