---
title: Merancang taman dari awal sampai akhir
summary: Sepuluh langkah arsitek lanskap, dari survei sampai set terbit, dengan apa yang dilakukan ruang kerja Lanskap untuk tiap langkah saat ini dan apa yang belum dilakukannya.
keywords: tutorial, panduan langkah demi langkah, cara, desain lanskap, desain taman, mulai, contoh, sampel, survei, garis gambar, medan, penanaman, jadwal, lembar, terbit, satu proyek
from: 87900bf5
---

Desain lanskap berputar: survei, sketsa, garis gambar, tanah, area, level, penanaman, jadwal, lembar, lalu kembali lagi. Ini adalah sepuluh langkahnya, beserta apa yang tersedia untuk tiap langkah. Jika suatu langkah masih memiliki kekurangan, hal itu disebutkan di **Belum dibuat** di akhir, dan tidak disembunyikan di dalam langkah.

Anda dapat mengikuti di lokasi contoh, atau di gambar survei Anda sendiri. Dengan gambar Anda sendiri, mulailah dari langkah 1.

## 1. Impor data survei

{{ui:Surface}} › {{ui:Linework from a drawing…}}, pilih gambar survei (DWG 2000–2018 atau DXF). Periksa satuannya, ambil kontur, polyline 3D, dan batas untuk permukaan, serta blok titik sebagai titik survei. Bagian **Level survei dan pemeriksaan** membaca level yang ditulis sebagai teks atau sebagai atribut dan mendaftar apa yang tampak janggal (satuan, sistem koordinat, jarak dari nol, kontur datar, level aneh, titik ganda) sebelum Anda menambahkan apa pun. Lihat [Periksa gambar survei saat impor](topic:survey-check) dan [Buka DWG atau DXF sebagai garis gambar](topic:open-dwg-dxf). Atur sistem koordinat dengan {{ui:Coordinate system…}}.

## 2. Sketsa tangan

Lembar di atas kertas, seperti survei lama atau cetakan yang sudah dicoret, dimasukkan dengan {{ui:Scan…}} (Mulai dari pindaian): ia ditempatkan dengan skala atau pada koordinat yang diketahui di bawah denah, dan dapat ditelusuri menjadi garis gambar. ModelCraft membaca foto sketsa tangan (File › Impor foto sketsa…). CivilCraft sendiri tidak memiliki alat untuk sketsa tangan: tempatkan lembar di bawah denah dan gambar di atasnya.

## 3. Dari sketsa ke garis gambar

Gambar garis fitur dan batas di atas survei di CivilCraft, atau gambar di gambar 2D. Lanskap › Lainnya › {{ui:From a line}} mengubah garis menjadi perkerasan, area tanam, dinding, anak tangga, garis fitur, dan lainnya, tetap terhubung: pindahkan garisnya, dan objeknya ikut bergerak. Lihat [Objek dari garis gambar](topic:objects-from-lines). Di SuperCad Studio, buka tapak, gambar, dan model bangunan dalam satu proyek: ruang kerja **Lanskap** memiliki alat dari semuanya, dan garis yang dipilih di gambar 2D dapat menjadi objek lanskap yang mengikutinya (Ctrl+K, {{ui:Landscape object from the picked drawing line}}).

## 4. Tanah rencana

Buka {{ui:Surface}} › {{ui:More}} › {{ui:Landscape workspace}}. Bangun tanah rencana dengan {{ui:Platform}}, {{ui:Berm}}, {{ui:Swale}}, dan area grading dengan level titik serta kontur; perkerasan, jalur, dinding, ramp, dan anak tangga yang Anda tambahkan ikut di-grading ke dalam permukaan rencana yang sama. Tanah eksisting tidak pernah berubah. {{ui:Levels}} › {{ui:Ground modifiers…}} mendaftar semua yang membentuk tanah dalam satu urutan, dengan galian dan timbunan untuk masing-masing. Lihat [Grading](topic:landscape-grading) dan [Pengubah tanah dan level langsung](topic:ground-modifiers).

## 5. Perkerasan dan area tanam

{{ui:Hardscape}} › {{ui:Paving}}, {{ui:Path}}, {{ui:Wall}}, {{ui:Kerb}}, {{ui:Ramp}}, dan {{ui:Steps}}. {{ui:Areas}} menggambar area rumput, bedengan, padang rumput, atau penutup tanah beserta susunannya; ia memotong dirinya sendiri di sekitar perkerasan, dinding, dan anak tangga. {{ui:Bed}} mengisi area sesuai jarak tanam, dari campuran tanaman. Lihat [Hardscape](topic:hardscape), [Area tanam](topic:planted-areas), dan [Penanaman](topic:planting).

## 6. Level, kemiringan, dan sambungan

Di bawah **Pemeriksaan grading**, centang **Analisis kemiringan** dan **Panah aliran dan genangan**. Jika air menggenang di depan teras, tambahkan {{ui:Swale}} di sekelilingnya. Properti memberi tahu berapa tanjakan yang dibutuhkan anak tangga dan apakah jumlahnya pas, serta di mana jalur lebih curam dari batasnya. Panel Masalah mendaftar tempat objek bertemu dengan buruk: dinding yang melebihi tinggi yang ditentukan, bedengan di atas perkerasan, anak tangga yang meleset dari bordesnya. {{ui:Spot level}} dan {{ui:Gradient arrow}} memberi label pada tanah dan memperbarui dirinya sendiri.

## 7. Penanaman

Di **Tanaman**, cari daftar tanaman (beberapa ratus jenis, atau daftar Anda sendiri), pilih satu, lalu pilih {{ui:Plant}}, {{ui:Bed}}, atau {{ui:Hedge}}. Atur ukuran dan label tanaman dari Lainnya. Lainnya › {{ui:Plant table}} mengedit catatan Anda sendiri: kultivar, ukuran pasokan, kerapatan, dan catatan spesifikasi. Setiap catatan dapat memuat simbol dan model 3D Anda sendiri (OBJ, STL, atau GLB), dan Lainnya › {{ui:Plant graphics}} menggambar tanaman lebih sederhana pada skala yang lebih kasar. Lihat [Daftar tanaman](topic:plant-list), [Catatan tanaman](topic:plant-records), dan [Grafik tanaman](topic:plant-graphics).

## 8. Kuantitas dan jadwal

Lainnya › {{ui:Worksheets}}: jadwal tanaman dan hardscape, serta jadwal Anda sendiri, tetap terhubung ke objek; simpan sebagai CSV atau XLSX, atau letakkan di lembar (lihat [Lembar kerja](topic:worksheets)). Lainnya › {{ui:Plant schedule…}} mengirim jumlahnya ke TakeoffCraft. Kuantitas hardscape ada di properti perkerasan, dinding, dan anak tangga. Irigasi memiliki daftar bahan sendiri: {{ui:Irrigation}} › **Periksa sistem…**. Lihat [Irigasi](topic:irrigation).

## 9. Gambar dan lembar

Lainnya › {{ui:Landscape sheets…}}: denah penanaman, grading, dan irigasi, beserta detailnya. {{ui:Levels}} › {{ui:Section line}} menggambar potongan melalui tanah, dinding, susunan, anak tangga, dan tanaman. Lihat [Lembar lanskap](topic:landscape-sheets) dan [Potongan dan set terbit](topic:landscape-sections).

## 10. Terbitkan

{{ui:Publish set (.zip)}} di dialog lembar membuat satu PDF dengan daftar lembar dan satu DWG per lembar. Lainnya › {{ui:Export landscape IFC}} memberikan tanaman dan hardscape kepada BimCraft. Simpan proyek: semuanya ada dalam satu file.

## Ubah satu hal: tangga

Intinya menyimpan semuanya dalam satu proyek adalah agar perubahan ikut terbawa. Cobalah dengan satu rangkaian anak tangga di antara dua teras:

1. Gambar garis rangkaian sebagai garis fitur (atau garis di gambar), lalu Lanskap › Lainnya › {{ui:From a line}} › {{ui:Steps}}. Di Properti anak tangga, centang **Membentuk tanah**, dan atur level bawah dan atas ke kedua teras.
2. Gambar bedengan tanaman di samping dan di bawah rangkaian dengan {{ui:Areas}}, dan perkerasan di teras. Bedengan memotong dirinya sendiri di sekitar anak tangga dan perkerasan, dan jadwal tanaman hanya menghitung yang ditanam.
3. Naikkan level atas rangkaian di Properti. Tanah rencana, level titik, panah kemiringan, serta galian dan timbunan berubah sekaligus. Jika rangkaian tidak lagi bertemu teras atas, panel Masalah menyebutkan selisihnya.
4. Pindahkan garis rangkaian. Anak tangga mengikuti garisnya dalam langkah urungkan yang sama; bedengan dipotong ulang dan dihitung ulang, dan lembar kerja serta jadwal menampilkan angka barunya.
5. Tekan Ctrl+Z sekali: garis, anak tangga, tanah, dan bedengan kembali bersama-sama.

Lihat [Pengubah tanah dan level langsung](topic:ground-modifiers), [Area tanam](topic:planted-areas), dan [Lembar kerja](topic:worksheets).

## Belum dibuat

Ini diminta dan belum ada di build ini:

- Dinding yang membentuk tanah (mereka melaporkan di mana mereka bertemu dengan tanah dan bagian atasnya dapat mengikutinya).
- Mengedit daftar tanaman Pustaka Anda sendiri di aplikasi (edit daftar proyek dan simpan sebagai file tanaman).
- Tekstur dan warna model tanaman GLB Anda sendiri (bentuknya dibaca; warna tanaman yang dipakai).

Lihat [Ruang kerja lanskap](topic:landscape) untuk setiap alat.
