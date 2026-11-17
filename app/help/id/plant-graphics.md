---
title: Grafik tanaman menurut skala, simbol sendiri, dan tanaman 3D
summary: Cara tanaman digambar di denah pada setiap skala gambar dan tingkat detail, serta cara sebuah rekaman tanaman mendapatkan simbol sendiri (SVG, atau blok DXF/DWG) dan model 3D sendiri (OBJ, STL, atau GLB).
keywords: grafik tanaman, simbol tanaman, simbol menurut skala, tingkat detail, level detail, lingkaran sederhana, garis tepi, simbol rinci, simbol sendiri, blok, svg, dxf, dwg, tanaman 3d, model 3d sendiri, obj, stl, glb, gltf, model pohon, tanaman dalam 3d
from: 875837d9
---

## Simbol denah menurut skala

Lanskap › {{ui:Lainnya}} › {{ui:Grafik tanaman}} mengatur cara tanaman digambar di denah. **Otomatis, menurut skala** memilih salah satu dari tiga tingkat berdasarkan skala gambar:

- **Lingkaran sederhana** (lebih kasar dari 1:500): lingkaran sebesar lebar tajuk tanaman.
- **Garis tepi dengan pusat** (dari 1:500 hingga 1:200): lingkaran dan tanda silang kecil di pusatnya.
- **Simbol rinci** (lebih halus dari 1:200): simbol milik rekaman jika ada, jika tidak simbol bawaan.

Ubah kedua skala dengan **Sederhana dari 1:** dan **Garis tepi dari 1:**, atau pilih satu tingkat untuk setiap skala. Setiap set lembar di dialog Lembar memiliki **Detail tanaman di denah** sendiri, sehingga denah tapak 1:500 dan denah penanaman 1:100 dapat berbeda. Pengaturan disimpan bersama proyek.

## Simbol sendiri

Pilih tanaman di bagian Tanaman dan tekan {{ui:Simbol sendiri…}}. Simbol ini membaca file SVG, atau blok dari gambar DXF atau DWG (jika gambar memiliki beberapa blok, Anda memilih salah satu). Simbol disesuaikan dengan lebar tajuk tanaman dan digambar pada tingkat rinci. Simbol disimpan di dalam proyek, sehingga file ikut terbawa bersamanya.

- SVG dibaca untuk garis, polyline, poligon, persegi panjang, lingkaran, elips, dan path. Skrip, gaya, tautan, dan gambar di dalamnya tidak pernah diperiksa. Transformasi tidak diterapkan: Anda diberi tahu jika file memilikinya, sehingga ratakan dulu di program gambar Anda.
- Batas: 512 KB SVG dan 2000 bentuk. File yang lebih besar ditolak beserta alasannya.

## Tanaman 3D sendiri

{{ui:Model 3D sendiri…}} pada rekaman yang sama membaca file **OBJ**, **STL**, atau **GLB**. Lalu, di Grafik tanaman, atur **Tanaman dalam 3D** ke **Model sendiri tiap rekaman**: setiap tanaman dari rekaman itu menampilkan model Anda, diskalakan ke tinggi dan lebar tajuknya. Rekaman tanpa model sendiri tetap memakai bentuk bawaan. Pilih **Massa sederhana** untuk tampilan cepat pada tapak yang besar.

GLB dibaca hanya untuk bentuknya:

- Semua yang dibutuhkan model harus berada di dalam file .glb. Model yang menunjuk ke file lain (.bin terpisah, atau gambar melalui alamatnya) ditolak: tidak ada yang diunduh.
- Geometri terkompresi atau terkemas (Draco, meshopt, posisi terkuantisasi) tidak dibaca. Ekspor tanpa kompresi.
- Tekstur dan warna dalam file tidak digunakan: model digambar dengan warna tanaman itu sendiri. Tekstur tetap diperiksa, dan tekstur yang lebih dari 4096 piksel per sisi ditolak.
- Batas: file 32 MB, 50 000 segitiga (menghitung setiap salinan bagian yang ditempatkan lebih dari sekali), 64 gambar, dan 16 MB gambar.

Setiap batas menolak file beserta alasannya; tidak ada yang setengah terbaca yang disimpan. Satu langkah urungkan memberi rekaman simbol atau modelnya, dan {{ui:Hapus simbol sendiri}} atau {{ui:Hapus model 3D sendiri}} menghapusnya kembali.

Lihat [Rekaman tanaman](topic:plant-records) untuk rekaman itu sendiri, dan [Lihat tapak dalam 3D](topic:site-3d).
