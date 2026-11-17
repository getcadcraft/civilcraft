---
title: Daftar tanaman
summary: Sekitar 420 tanaman umum beriklim sedang dan Mediterania dengan ukuran, ketahanan, cahaya, dan air, dapat dicari dalam bahasa apa pun, ditambah daftar Anda sendiri yang disimpan bersama proyek.
keywords: daftar tanaman, basis data tanaman, spesies, nama botani, nama umum, palet tanaman, daftar pembibitan, zona ketahanan, csv, impor tanaman, ekspor tanaman, tanaman saya, daftar pohon, daftar semak, tumbuhan, pustaka tanaman
from: 7ed09e7e
---

Bagian **Tanaman** di panel kiri mencantumkan setiap tanaman yang dapat Anda tempatkan. Klik satu untuk melihat ukurannya dan menjadikannya tanaman yang digunakan oleh **Tanaman**, **Bedengan**, dan **Pagar tanaman**.

## Cari dan saring

Ketik di **Cari**: kata apa pun dari nama tanaman dalam bahasa apa pun (Inggris, Spanyol, Portugis), nama botaninya, jenisnya, atau kata dalam catatannya. Setiap kata yang Anda ketik harus cocok, sehingga `quercus evergreen` menemukan ek hijau abadi. Aksen tidak berpengaruh.

Persempit daftar dengan **Jenis**, **Cahaya**, **Air**, dan **Zona ketahanan** (zona USDA tempat lokasi Anda berada: tanaman dicantumkan jika zona tersebut berada dalam rentangnya).

## Data yang dimiliki tanaman

| Kolom | Arti |
|---|---|
| Jenis | Pohon, semak, pagar, rumput (termasuk hamparan rumput), perennial, penutup tanah, atau tanaman merambat |
| Saat dewasa | Tinggi dan lebar tajuk tanaman yang tumbuh di kebun atau jalan, dalam meter |
| Saat ditanam | Ukuran saat ditanam, dan potnya |
| Jarak | Dari pusat ke pusat di bedengan atau sepanjang pagar |
| Zona ketahanan | Zona USDA tempat tanaman ini biasanya tahan |
| Cahaya, air, tanah | Kebutuhannya |
| Catatan | Kegunaan dan peringatan, seperti bagian beracun atau tanaman yang menyebar |

:::note
Daftar bawaan ditulis untuk CadCraft dari pengetahuan hortikultura umum: ukuran khas, dibulatkan. Daftar ini bukan katalog pembibit mana pun. Periksa ukuran dan ketahanan dengan pembibit setempat. Tanaman invasif yang paling terkenal di Semenanjung Iberia dan sebagian besar dunia beriklim sedang sengaja tidak dimasukkan, dan beberapa tanaman yang invasif di suatu tempat diberi catatan.
:::

## Tanaman Anda sendiri

- **Tambahkan ke daftar proyek ini** menyalin tanaman ke daftar milik proyek, yang disimpan bersama proyek. Tanaman dalam daftar Anda menggantikan tanaman bawaan dengan kunci yang sama, sehingga Anda dapat mengubah ukurannya untuk wilayah Anda.
- **Impor daftar tanaman…** membaca CSV (atau file tanaman). CSV membutuhkan kolom nama botani dan, idealnya, jenis, tinggi, dan lebar; nama kolom dengan kata Anda sendiri juga berfungsi (Latin, Common name, Height, Spread, Width, Zone). Koma, titik koma, atau tab, serta koma desimal, dibaca. Ukuran tanam, jarak, dan pot yang kosong diisi nilai wajar sesuai jenisnya.
- **Simpan sebagai CSV** menyimpan daftar Anda (atau, jika kosong, tanaman yang ditampilkan pencarian) untuk dibuka di spreadsheet.

Daftar tanaman dibaca seperti file dari luar pada umumnya: apa pun yang tidak dapat dipakai akan dilewati dan dihitung.

## Tanaman di aplikasi lain

Daftar tanaman adalah satu pustaka untuk setiap aplikasi CadCraft: BimCraft dan ModelCraft memuat daftar yang sama, tetapi fitur Tempatkan dari pustaka mereka sendiri belum menawarkan tanaman. Saat ini tanaman mencapai model BIM melalui IFC lanskap CivilCraft (setiap tanaman sebagai `IfcGeographicElement`). Lihat [Penanaman](topic:planting#ifc).
