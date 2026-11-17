---
title: Periksa gambar survei saat impor
summary: Baca elevasi yang ditulis sebagai teks atau dalam atribut blok sebagai titik survei, dan periksa DWG atau DXF untuk satuan yang salah, tidak ada sistem koordinat, titik asal yang jauh, kontur yang datar, elevasi yang janggal, dan titik ganda sebelum membangun tanah darinya.
keywords: pemeriksaan survei, pemeriksaan impor, elevasi survei, elevasi titik, elevasi teks, elevasi sebagai teks, atribut, satuan, sistem koordinat, jauh dari titik asal, kontur di nol, pencilan, titik ganda, masalah, arsitek lanskap, gambar survei
from: d46acd24
---

Gambar survei bisa terlihat benar dan tetap salah untuk sebuah tanah: satuannya mungkin ditebak, konturnya mungkin datar di ketinggian 0, atau elevasinya mungkin ditulis sebagai teks yang sama sekali bukan geometri. Bagian **Elevasi survei dan pemeriksaan** pada dialog {{ui:Garis}} (lihat [Buka DWG atau DXF sebagai garis](topic:open-dwg-dxf)) membaca elevasi tersebut dan memberi tahu apa yang tampak salah sebelum apa pun ditambahkan.

## Elevasi yang ditulis sebagai teks atau dalam atribut

Banyak gambar survei memberi elevasi titik sebagai teks kecil di samping tanda silang, seperti `104.37` atau `EL 104.37`, atau sebagai atribut dari blok titik. Ini bukan garis, sehingga pembaca garis membiarkannya. Bagian ini mencantumkan berapa banyak yang ditemukan dan memungkinkan Anda mengambilnya sebagai **titik survei**:

1. Centang **Ambil … elevasi sebagai titik survei**. Pilihan ini awalnya tidak dicentang, karena tidak setiap angka dalam gambar adalah ketinggian.
2. Teks dibaca jika berupa elevasi tersendiri: angka dengan bagian desimal (`104.37`, `+104,37`, `-3.50`), atau angka setelah `EL`, `ELEV`, `RL`, `FFL`, `GL`, `TW`, `BW`, `INV`, `Z` atau `LEVEL`, dengan `m`, `ft` atau `'` opsional setelahnya. Angka bulat saja (`12`) dibaca sebagai nomor lot atau lembar, bukan elevasi; teks seperti `GATE 3` atau tanggal tidak pernah dibaca. Kode format teks diabaikan.
3. Untuk atribut blok, pilih **Atribut blok yang memuat elevasi**. CivilCraft menemukan sendiri tag bernama ELEV, Z, LEVEL, RL atau yang serupa; pilih yang lain dari daftar jika gambar memakai tag sendiri. Pilihan ini diingat untuk nama file tersebut di komputer ini, sehingga saat dibuka lagi dimulai dengan tag yang sama. Tag yang Anda pilih juga menganggap bilangan bulat sebagai elevasi.
4. Klik {{ui:Tambah}}. Titik-titik diberi nomor setelah nomor tertinggi dalam proyek, setiap titik diberi deskripsi dengan layer-nya (atau bloknya), dan ketinggian dikonversi ke satuan proyek seperti bagian gambar lainnya. Semuanya adalah satu langkah: {{key:Mod+Z}} menghapus titik-titik tersebut.

Teks berada di titik sisipnya sendiri (atau titik perataannya jika ada). Teks di dalam blok tidak dibaca, dan gambar tidak pernah diubah.

## Pemeriksaan

Pemeriksaan dijalankan pada apa yang akan Anda masukkan dan mencantumkan apa yang ditemukannya, satu baris untuk setiap jenis masalah:

| Isinya | Artinya |
|---|---|
| **Satuan tidak dinyatakan** | Gambar tidak menyatakan satuannya, sehingga angkanya dibaca sebagai satuan proyek. Periksa satu jarak yang Anda ketahui. |
| **Satuan dikonversi** | Satuan gambar berbeda dari proyek dan diskalakan (catatan, bukan kesalahan). |
| **Data membentang … km** atau **… m** | Jangkauannya lebih besar dari 200 km atau lebih kecil dari setengah meter, yang biasanya berarti satuan yang salah (milimeter dibaca sebagai meter, atau sebaliknya). |
| **Tidak ada sistem koordinat** | Proyek tidak memilikinya. Ini adalah peringatan jika data berada jauh dari nol, seperti koordinat state plane atau grid nasional. Lihat [Sistem koordinat](topic:coordinate-systems). |
| **Jauh dari titik asal** | Data berada lebih dari 100 km dari nol. Jauh dari nol, tampilan 3D dan ekspor kehilangan presisi dan bergetar. |
| **Layer kontur … tidak memiliki ketinggian** | Layer yang dinamai seperti kontur (TOPO, CONT, CNTR, CONTOUR) berisi garis di ketinggian 0, sehingga tanah yang dibangun darinya akan datar. |
| **Elevasi tepat 0** | Beberapa elevasi bernilai 0 padahal elevasi khasnya jauh dari itu: kemungkinan ketinggian yang hilang. |
| **Elevasi jauh dari yang lain** | Beberapa elevasi berada jauh di luar yang lain (diukur terhadap tengah semua elevasi, sehingga lokasi curam dengan rentang lebar tidak ditandai), atau di atas 9,000 m atau di bawah -11,000 m. |
| **Titik di atas titik lain** | Dua titik di tempat yang sama dengan elevasi yang sama, atau dengan elevasi berbeda. |

Setelah Anda klik {{ui:Tambah}}, baris yang sama masuk ke **Masalah**, satu untuk setiap jenis, dengan nama file, sehingga Anda dapat kembali kepadanya. Pemeriksaan menilai gambarnya; pemeriksaan tidak mengubah apa pun di dalamnya, dan tidak menghentikan Anda dari menggunakan gambar tersebut.

:::tip
Ketika pemeriksaan mengatakan kontur datar di 0 dan ada elevasi yang ditulis sebagai teks, ambil elevasi tersebut sebagai titik survei: sering kali elevasi itu membawa ketinggian sebenarnya yang tidak dimiliki garis kontur.
:::

## Yang tidak diperiksa

Pemeriksaan tidak membandingkan gambar dengan survei kedua, dan tidak dapat memastikan sistem koordinat apa yang dipakai gambar: pemeriksaan hanya memberi tahu bahwa belum ada yang diatur.
