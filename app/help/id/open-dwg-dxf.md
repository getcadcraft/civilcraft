---
title: Buka DWG atau DXF sebagai garis
summary: Buka garis gambar pada denah, lapisan demi lapisan, gunakan kontur, polyline 3D, dan garis besar tertutupnya untuk permukaan, serta ubah blok titiknya menjadi titik survei.
keywords: cek survei, elevasi teks, dwg, dxf, cad, gambar, garis, kontur, breakline, batas, polyline, polyline 3d, lapisan, peta dasar, topo, gambar survei, blok, referensi blok, titik survei dari blok, atribut, blok titik, titik sisip
from: da0f4c58
---

Survei topografi sering datang sebagai gambar: kontur sebagai polyline pada elevasinya, breakline sebagai polyline 3D, dan garis batas situs sebagai polyline tertutup. CivilCraft membuka **ruang model** gambar sebagai lapisan di denah, dan dapat langsung mengubah garis-garis itu menjadi permukaan.

## Buka gambar

1. Klik {{ui:Garis}} di grup **Permukaan** (atau {{ui:Buka}}, atau letakkan file di denah) dan pilih file `.dwg` atau `.dxf`. Gambar dibaca di komputer ini; tidak ada yang diunggah. DWG dari 2000 hingga 2018 dan DXF ASCII dapat dibaca.
2. Dialog **Garis** mencantumkan lapisan gambar yang berisi garis, bentuk tertutup, atau titik, dan apakah lapisan itu memiliki **elevasi**. Lapisan yang dimatikan di gambar mulai tidak tercentang. Teks, hatch, dimensi, dan objek lain yang bukan garis dihitung dan dibiarkan (dialog menyebutkan apa saja).
3. Periksa **Satuan gambar**. Bila gambar menyatakan satuannya, CivilCraft mengonversinya ke satuan proyek (milimeter menjadi meter, meter menjadi kaki, inci menjadi kaki). Gambar dalam kaki dibaca sebagai kaki survei AS tanpa penskalaan: keduanya berbeda 2 bagian per juta, dan menskalakan koordinat state plane dengan selisih itu akan menggeser koordinat hingga beberapa kaki. Bila gambar tidak menyatakan satuannya, angkanya dibaca dalam satuan proyek; pilih satuan yang benar dari daftar jika tidak sesuai.
4. Di **Gunakan untuk permukaan**, pilih apa yang diberikan tiap lapisan kepada permukaan (atau biarkan **Hanya tampilkan**). Lapisan yang dinamai seperti kontur (TOPO, CONT, CNTR) dan memiliki elevasi mulai sebagai breakline.
5. Klik {{ui:Tambah}}. Lapisan muncul di bawah **Lapisan GIS** di panel kiri; setiap penggunaan dimasukkan ke permukaan. Setiap bagian adalah satu langkah tersendiri: {{key:Mod+Z}} mengembalikannya satu per satu.

## Apa yang bisa diberikan tiap jenis lapisan

| Lapisan berisi | Gunakan untuk permukaan |
|---|---|
| Kontur (polyline pada elevasi) | Breakline pada elevasi garisnya sendiri, atau pada field ELEV |
| Polyline 3D | Breakline pada elevasinya sendiri |
| Garis besar tertutup | Batas permukaan (bentuk tertutup terbesar, atau yang Anda pilih) |
| Titik dengan elevasi | Titik survei, dideskripsikan dengan nama lapisan |
| Garis pada elevasi 0 (garis denah) | Tidak ada: tetap di denah sebagai gambar dasar |

Gambar yang ditulis CivilCraft menyimpan garis fiturnya sebagai polyline 3D yang mengingat busurnya. Dialog kemudian menampilkan **Garis fitur**: biarkan tercentang untuk mengembalikannya sebagai garis fitur dengan busur dan penggunaannya (satu langkah urungkan), atau hilangkan centang untuk membacanya sebagai garis biasa seperti lapisan lain.

Nanti, gunakan {{ui:Gunakan untuk permukaan}} di menu lapisan pada **Lapisan GIS** untuk melakukan hal yang sama pada lapisan yang hanya Anda tampilkan.

## Titik survei dari blok

Gambar survei sering membawa titiknya sebagai blok: simbol kecil di tiap bidikan, dengan atribut untuk nomor titik, deskripsi, dan elevasi. Ketika gambar memiliki referensi blok, dialog memiliki bagian **Titik survei dari blok**:

1. Centang blok yang akan diambil (tabel menyebutkan berapa referensi tiap blok, di lapisan mana, dan atribut apa), atau centang lapisan untuk mengambil setiap referensi blok di atasnya.
2. Pilih asal **nomor**, **deskripsi**, dan **elevasi** tiap titik: sebuah atribut, nama blok atau lapisan, nomor bebas berikutnya, atau Z titik sisip. CivilCraft mulai dari atribut yang mungkin (PT, DESC, ELEV, dan sejenisnya), dan mengambil elevasi dari atribut hanya ketika blok berada di nol.
3. Hilangkan centang lapisan garis jika Anda hanya ingin titiknya, lalu klik {{ui:Tambah}}.

Tiap referensi menjadi satu titik survei di titik sisipnya. Hanya referensi yang ditempatkan di ruang model yang dihitung; blok yang bersarang di dalam blok lain tidak. Nomor yang sudah ada di proyek, atau yang dipakai dua kali dalam gambar, mendapat nomor baru setelah yang tertinggi, dan atribut elevasi yang bukan angka membuat titik itu tanpa elevasi; bilah status menghitung keduanya. Gambar tidak pernah diubah, dan tiap titik mengingat bloknya: Properti-nya menampilkan **Dari blok** dengan blok, lapisan, dan handle. Menambahkan titik adalah satu langkah, jadi {{key:Mod+Z}} menghapus semuanya.

## Elevasi berupa teks, dan pemeriksaan

Elevasi titik yang ditulis sebagai teks (atau dalam atribut blok yang bukan blok titik survei) bukan garis. Bagian **Elevasi survei dan pemeriksaan** dapat mengambilnya sebagai titik survei, dan mencantumkan apa yang tampak janggal pada gambar: satuan, sistem koordinat, jarak dari nol, kontur datar, elevasi ganjil, titik ganda. Lihat [Periksa gambar survei saat impor](topic:survey-check).

## Cara gambar dibaca

- Busur, lingkaran, elips, segmen polyline melengkung, dan spline menjadi potongan lurus pendek (setiap 5° paling jauh).
- Referensi blok digambar di tempat ditempatkannya, termasuk blok bersarang; isi blok pada lapisan 0 mengambil lapisan referensinya.
- Objek yang digambar di bidang lain (arah ekstrusi berbeda) ditempatkan dalam koordinat dunia.
- Tiap objek mendapat tiga field: LAYER, TYPE (jenis objek), dan ELEV (elevasinya bila semua titiknya sama).
- Koordinat diambil apa adanya: gambar harus memakai koordinat yang sama dengan proyek (misalnya zona state plane yang sama). Gambar tertaut (xref) tidak dibuka: bukalah sendiri.

:::tip
Gambar kontur memberi permukaan terbaik dengan beberapa elevasi titik di puncak bukit dan cekungan, tempat kontur saja meninggalkan segitiga datar. Tambahkan sebagai titik survei, atau dari lapisan titik di gambar.
:::
