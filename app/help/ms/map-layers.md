---
title: Papar lapisan peta di bawah pelan
summary: Letakkan gambar bergeoreferens, jubin peta, pelayan WMS atau WMTS atau perkhidmatan peta di bawah pelan sebagai konteks tapak, dengan tetapan internet, kelegapan, susunan dan atribusi.
keywords: lapisan peta, peta asas, latar belakang, udara, ortofoto, imej, satelit, raster, fail dunia, pgw, jgw, tfw, wld, geotiff, imej bergeoreferens, xyz, jubin, peta slippy, wms, wmts, getcapabilities, perkhidmatan peta, rest, mapserver, imageserver, usgs, national map, atribusi, kelegapan
from: 32d7718e
---

Lapisan peta ialah gambar yang dilukis di bawah reka bentuk anda: foto udara dengan fail dunianya, atau peta daripada pelayan di internet. Ia konteks tapak pada skrin sahaja: ia **tidak** ada dalam plot PDF, eksport DXF atau DWG, atau paparan 3D.

Pilih {{ui:Peta}} dalam kumpulan {{ui:GIS}}. Kotak dialog **Lapisan peta** menyenaraikan lapisan projek dan menambah yang baharu. Lapisan peta memerlukan sistem koordinat projek ([Tetapkan sistem koordinat projek](topic:coordinate-systems)), kecuali gambar yang fail dunianya menggunakan koordinat projek itu sendiri.

## Tetapan internet

CivilCraft tidak sekali-kali meminta apa-apa daripada pelayan peta sehingga anda membenarkannya: {{ui:Tetapan}}, {{ui:CivilCraft}}, **Lapisan peta daripada internet**: **Mati** (permulaan) atau **Hidup**.

:::note
Apabila hidup, CivilCraft meminta pelayan peta yang anda tambah untuk gambar kawasan pada skrin. Lukisan anda kekal pada komputer ini; pelayan melihat kawasan dan alamat internet anda.
:::

Semasa ia mati, lapisan internet disenaraikan dalam kotak dialog tetapi dimalapkan, dengan sebabnya, dan tiada apa dilukis atau diminta. Membuka projek yang menamakan pelayan peta juga tidak menghubungi mereka. Gambar daripada fail berfungsi dalam kedua-dua keadaan. Butang {{ui:Buka Tetapan}} dalam kotak dialog membawa anda ke sana.

## Gambar bergeoreferens (berfungsi luar talian)

1. Dalam **Tambah lapisan**, kekalkan **Gambar bergeoreferens** dan pilih fail: gambar (PNG atau JPEG) **bersama** fail dunianya (`.pgw` untuk PNG, `.jgw` untuk JPEG, atau `.wld`) dan, jika ada, `.prj`-nya. Anda juga boleh melepaskannya pada pelan bersama-sama.
2. Tanpa `.prj`, CivilCraft bertanya sistem mana yang digunakan oleh fail dunia: {{ui:Sistem projek}} (paling lazim), {{ui:Pilih sistem…}}, atau, dalam projek tanpa sistem, **Koordinat projek**.
3. Gambar muncul di bawah pelan dan {{ui:Muat}} memasukkannya.

GeoTIFF RGB (foto udara yang disimpan sebagai GeoTIFF) membawa penempatan dan sistemnya sendiri: buka ia sendiri. Gambar itu disimpan **di dalam fail projek** (sehingga 25 MB); yang lebih besar ditolak dengan saiznya, jadi simpan salinan yang lebih kecil (piksel lebih sedikit, atau JPEG).

## Jubin, WMS, WMTS dan perkhidmatan peta

Hidupkan **Lapisan peta daripada internet** dahulu. Kemudian, dalam **Tambah lapisan**:

| Daripada | Apa untuk ditampal | Apa yang CivilCraft lakukan |
|---|---|---|
| URL jubin | Templat dengan `{z}`, `{x}` dan `{y}` (atau `{-y}`), dan `{s}` untuk huruf pelayan, contohnya `https://tile.example.org/{z}/{x}/{y}.png`. Beri nama dan atribusinya. | Jubin dalam web Mercator untuk kawasan dan zum pada skrin. |
| Pelayan WMS | Alamat pelayan, atau pautan GetCapabilities-nya. Pilih {{ui:Dapatkan lapisan}}, kemudian lapisan. | Satu gambar kawasan pada skrin, diminta dalam kod EPSG projek apabila pelayan menawarkannya, jika tidak dalam web Mercator atau WGS 84. |
| Pelayan WMTS | Alamat pelayan, atau `WMTSCapabilities.xml`-nya. Pilih {{ui:Dapatkan lapisan}}, kemudian lapisan dan set matriks jubin. | Jubin daripada set itu dalam sistem projek apabila ada, jika tidak web Mercator. |
| Perkhidmatan peta ArcGIS (REST) | URL yang berakhir dengan `/MapServer` atau `/ImageServer`. Pilih {{ui:Baca perkhidmatan}}. | Perkhidmatan web Mercator yang di-cache dilukis daripada jubinnya; yang lain diminta untuk satu gambar kawasan pada skrin. |

Tiada pelayan dipratetap. Contoh awam, semuanya daripada USGS National Map (domain awam):

- WMS: `https://basemap.nationalmap.gov/arcgis/services/USGSTopo/MapServer/WMSServer`
- WMTS: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/WMTS/1.0.0/WMTSCapabilities.xml`
- Perkhidmatan peta: `https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer` (juga `USGSImageryOnly` untuk foto udara)

Banyak jabatan GIS bandar dan daerah menerbitkan WMS atau perkhidmatan peta mereka sendiri; halaman GIS mereka memberikan alamatnya. Pelayan yang meminta log masuk atau kunci tidak berfungsi: CivilCraft tidak menghantar nama pengguna, kata laluan atau kunci.

## Cara lapisan dilukis

- Gambar dalam sistem selain sistem projek diubah bentuk ke dalamnya: gambar dipotong kepada kepingan, setiap satu diletakkan supaya berada dalam sukuan piksel skrin daripada tempat penukaran tepat meletakkannya.
- Jubin dipilih untuk kawasan pada skrin dan zum: tidak lebih daripada 64 untuk satu paparan, 6 pada satu masa. Apabila anda pan atau zum, permintaan untuk paparan lama dibatalkan. Kira-kira 200 jubin disimpan dalam memori (tiada apa disimpan pada cakera).
- Gambar WMS atau perkhidmatan peta diminta sebaik sahaja paparan berhenti bergerak; sehingga ia tiba, yang terakhir kekal di tempatnya.
- Atribusi setiap lapisan pada skrin dipaparkan kecil di bahagian bawah kanan pelan.

## Tukar, susun dan buang lapisan

Dalam kotak dialog setiap lapisan mempunyai kotak semak untuk menunjuk atau menyembunyikannya, peluncur **Kelegapan**, anak panah untuk melukisnya lebih awal (lebih bawah) atau lebih lewat (di atas), butang zum (gambar) dan butang buang. Lapisan pertama dalam senarai dilukis di bahagian bawah. Setiap perubahan ialah satu langkah buat asal.

## Apabila lapisan tidak memaparkan apa-apa

Sebabnya muncul sekali dalam baris status dan kekal di bawah nama lapisan dalam kotak dialog:

| Mesej | Apa yang perlu dilakukan |
|---|---|
| Mati: lapisan peta daripada internet dimatikan dalam Tetapan. | Hidupkan **Lapisan peta daripada internet**. |
| Memerlukan sistem koordinat projek. | Tetapkannya di bawah {{ui:Koordinat}}. |
| Pelayan tidak membenarkan halaman ini menggunakan gambarnya (CORS), atau tidak dapat dihubungi. | Pelayan tidak membenarkan halaman web menggunakan gambarnya, atau ia sedang tidak berfungsi. Selepas empat penolakan CivilCraft berhenti meminta; sembunyikan dan tunjukkan lapisan untuk mencuba semula. |
| Pelayan menjawab 404 … / Pelayan menghantar text/xml, bukan imej: … | URL, lapisan atau gaya salah, atau mesej pelayan menyatakan apa yang dikehendakinya. |
| Lapisan ini tidak ditawarkan dalam sistem projek, web Mercator atau WGS 84. | Pelayan tidak dapat melukis di tempat CivilCraft boleh meletakkannya. |

## Apa yang telah disemak

- Nombor jubin disemak dengan jubinan web Mercator piawai; jawapan WMS 1.1.1 dan 1.3.0, WMTS dan perkhidmatan peta dibaca daripada fail tulisan tangan dan daripada jawapan sebenar yang disimpan daripada USGS National Map dan pelayan OpenStreetMap terrestris; permintaan WMS 1.3.0 meletakkan latitud dahulu untuk EPSG:4326, seperti yang dinyatakan oleh piawaian.
- Ubah bentuk dibandingkan dengan penukaran tepat setiap piksel melalui nombor PROJ: dalam 0.13 px untuk jubin, gambar WMS dan gambar bersaiz daerah, pada skala tapak dan dizum keluar.
- Gambar dengan fail dunianya dan GeoTIFF RGB yang ditulis oleh GDAL (melalui rasterio) dilukis di tempat penempatannya menyatakan, disemak piksel demi piksel dalam pelayar.
- Dalam pelayar, terhadap pelayan gantian pada komputer ujian: jubin jatuh ke dalam jubin tempat PROJ meletakkan setiap titik, gambar WMS jatuh dalam 2 px, paling banyak 6 permintaan berjalan serentak, dan dengan tetapan mati tiada permintaan keluar dari halaman. Perkhidmatan peta USGS National Map di atas juga dibaca dan dilukis secara langsung dalam pelayar sekali (jubinnya tiba dan dilukis, dengan teks hak ciptanya); pelayan awam lain dibaca daripada jawapan yang disimpan sahaja.
