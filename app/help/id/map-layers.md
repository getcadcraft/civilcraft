---
title: Tampilkan layer peta di bawah denah
summary: Tempatkan gambar yang memiliki georeferensi, ubin peta, server WMS atau WMTS, atau layanan peta di bawah denah sebagai konteks tapak, dengan pengaturan internet, opasitas, urutan, dan atribusi.
keywords: layer peta, peta dasar, latar belakang, udara, ortofoto, citra, satelit, raster, world file, pgw, jgw, tfw, wld, geotiff, gambar georeferensi, xyz, ubin, peta slippy, wms, wmts, getcapabilities, layanan peta, rest, mapserver, imageserver, usgs, national map, atribusi, opasitas
from: 32d7718e
---

Layer peta adalah gambar yang digambar di bawah desain Anda: foto udara dengan world file-nya, atau peta dari server di internet. Layer ini hanya konteks tapak di layar: layer ini **tidak** termasuk dalam cetakan PDF, ekspor DXF atau DWG, atau tampilan 3D.

Pilih {{ui:Map}} di grup {{ui:GIS}}. Dialog **Layer peta** mendaftar layer proyek dan menambahkan yang baru. Layer peta memerlukan sistem koordinat proyek ([Atur sistem koordinat proyek](topic:coordinate-systems)), kecuali gambar yang world file-nya memakai koordinat proyek itu sendiri.

## Pengaturan internet

CivilCraft tidak pernah meminta apa pun kepada server peta sampai Anda mengizinkannya: {{ui:Settings}}, {{ui:CivilCraft}}, **Layer peta dari internet**: **Mati** (awal) atau **Nyala**.

:::note
Saat nyala, CivilCraft meminta server peta yang Anda tambahkan untuk gambar area di layar. Gambar Anda tetap di komputer ini; server melihat area dan alamat internet Anda.
:::

Saat mati, layer internet tercantum di dialog tetapi diredupkan, dengan alasannya, dan tidak ada yang digambar atau diminta. Membuka proyek yang menyebutkan server peta juga tidak menghubunginya. Gambar dari file berfungsi dalam kedua keadaan. Tombol {{ui:Open Settings}} di dialog membawa Anda ke sana.

## Gambar yang memiliki georeferensi (berfungsi luring)

1. Di **Tambahkan layer**, biarkan **Gambar georeferensi** dan pilih file: gambarnya (PNG atau JPEG) **bersama** world file-nya (`.pgw` untuk PNG, `.jgw` untuk JPEG, atau `.wld`) dan, jika ada, `.prj`-nya. Anda juga dapat meletakkannya di denah bersamaan.
2. Tanpa `.prj`, CivilCraft bertanya sistem apa yang dipakai world file: {{ui:The project’s system}} (paling umum), {{ui:Pick a system…}}, atau, di proyek tanpa sistem, **Koordinat proyek**.
3. Gambar muncul di bawah denah, dan {{ui:Fit}} menyertakannya.

GeoTIFF RGB (foto udara yang disimpan sebagai GeoTIFF) membawa penempatan dan sistemnya sendiri: bukalah sendiri. Gambar disimpan **di dalam file proyek** (hingga 25 MB); gambar yang lebih besar ditolak dengan ukurannya, jadi simpan salinan yang lebih kecil (piksel lebih sedikit, atau JPEG).

## Ubin, WMS, WMTS, dan layanan peta

Nyalakan **Layer peta dari internet** terlebih dahulu. Kemudian, di **Tambahkan layer**:

| Dari | Yang ditempel | Yang dilakukan CivilCraft |
|---|---|---|
| URL ubin | Templat dengan `{z}`, `{x}`, dan `{y}` (atau `{-y}`), dan `{s}` untuk huruf server, misalnya `https://tile.example.org/{z}/{x}/{y}.png`. Beri nama dan atribusinya. | Ubin dalam web Mercator untuk area dan zoom di layar. |
| Server WMS | Alamat server, atau tautan GetCapabilities-nya. Pilih {{ui:Get the layers}}, lalu layernya. | Satu gambar area di layar, diminta dalam kode EPSG proyek saat server menyediakannya, jika tidak dalam web Mercator atau WGS 84. |
| Server WMTS | Alamat server, atau `WMTSCapabilities.xml`-nya. Pilih {{ui:Get the layers}}, lalu layer dan set matriks ubinnya. | Ubin dari set itu dalam sistem proyek jika ada, jika tidak web Mercator. |
| Layanan peta ArcGIS (REST) | URL yang berakhir dengan `/MapServer` atau `/ImageServer`. Pilih {{ui:Read the service}}. | Layanan web Mercator yang di-cache digambar dari ubinnya; yang lain diminta sebagai satu gambar area di layar. |

Tidak ada server yang disediakan sebelumnya. Contoh publik, semuanya dari USGS National Map (domain publik):

- WMS: `https://basemap.nationalmap.gov/arcgis/services/USGSTopo/MapServer/WMSServer`
- WMTS: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/WMTS/1.0.0/WMTSCapabilities.xml`
- Layanan peta: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer` (juga `USGSImageryOnly` untuk foto udara)

Banyak departemen GIS kota dan kabupaten menerbitkan WMS atau layanan peta sendiri; halaman GIS mereka memberikan alamatnya. Server yang meminta masuk atau kunci tidak berfungsi: CivilCraft tidak mengirim nama pengguna, kata sandi, atau kunci.

## Cara layer digambar

- Gambar dalam sistem selain sistem proyek diubah bentuknya ke dalam sistem proyek: gambar dipotong menjadi beberapa bagian, masing-masing diletakkan sehingga berada dalam seperempat piksel layar dari tempat konversi yang tepat menempatkannya.
- Ubin dipilih untuk area dan zoom di layar: tidak pernah lebih dari 64 untuk satu tampilan, dan 6 sekaligus. Saat Anda menggeser atau melakukan zoom, permintaan untuk tampilan lama dibatalkan. Sekitar 200 ubin disimpan dalam memori (tidak ada yang disimpan di disk).
- Gambar WMS atau layanan peta diminta setelah tampilan berhenti bergerak; sampai gambar itu tiba, gambar terakhir tetap di tempatnya.
- Atribusi tiap layer di layar tampil kecil di pojok kanan bawah denah.

## Mengubah, mengurutkan, dan menghapus layer

Di dialog, setiap layer memiliki kotak centang untuk menampilkan atau menyembunyikannya, penggeser **Opasitas**, panah untuk menggambarnya lebih awal (lebih bawah) atau lebih akhir (di atas), tombol zoom (untuk gambar), dan tombol hapus. Layer pertama dalam daftar digambar di bagian bawah. Setiap perubahan adalah satu langkah urungkan.

## Saat layer tidak menampilkan apa pun

Alasannya muncul sekali di bilah status dan tetap di bawah nama layer di dialog:

| Pesan | Yang harus dilakukan |
|---|---|
| Mati: layer peta dari internet dimatikan di Pengaturan. | Nyalakan **Layer peta dari internet**. |
| Memerlukan sistem koordinat proyek | Atur di {{ui:Coordinates}}. |
| Server tidak mengizinkan halaman ini menggunakan gambarnya (CORS), atau tidak dapat dijangkau. | Server tidak mengizinkan halaman web memakai gambarnya, atau sedang mati. Setelah empat penolakan CivilCraft berhenti meminta; sembunyikan lalu tampilkan layer untuk mencoba lagi. |
| Server menjawab 404 … / Server mengirim text/xml, bukan gambar: … | URL, layer, atau gaya salah, atau pesan server menyebutkan apa yang diinginkannya. |
| Layer ini tidak tersedia dalam sistem proyek, web Mercator, atau WGS 84 | Server tidak dapat menggambar di tempat CivilCraft dapat menempatkannya. |

## Apa yang diperiksa

- Nomor ubin diperiksa terhadap pengubinan web Mercator standar; jawaban WMS 1.1.1 dan 1.3.0, WMTS, dan layanan peta dibaca dari file yang ditulis tangan dan dari jawaban nyata yang disimpan dari USGS National Map dan server OpenStreetMap terrestris. Permintaan WMS 1.3.0 menempatkan lintang terlebih dahulu untuk EPSG:4326, sebagaimana diatur standar.
- Pengubahan bentuk dibandingkan dengan konversi per piksel yang tepat menggunakan angka PROJ: dalam 0.13 px untuk ubin, gambar WMS, dan gambar seukuran kabupaten, pada skala tapak maupun saat diperkecil.
- Gambar dengan world file-nya dan GeoTIFF RGB yang ditulis GDAL (melalui rasterio) digambar di tempat penempatannya menunjukkan, diperiksa piksel demi piksel di browser.
- Di browser, terhadap server pengganti di komputer uji: ubin jatuh di ubin tempat PROJ menempatkan tiap titik, gambar WMS jatuh dalam 2 px, paling banyak 6 permintaan berjalan sekaligus, dan saat pengaturan mati tidak ada permintaan yang keluar dari halaman. Layanan peta USGS National Map di atas juga dibaca dan digambar secara langsung di browser sekali (ubinnya tiba dan digambar, dengan teks hak ciptanya); server publik lainnya hanya dibaca dari jawaban yang disimpan.
