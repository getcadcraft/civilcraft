---
title: Jaringan utilitas dan OpenStreetMap
summary: Lintasan air, saluran pembuangan, drainase hujan, gas, daya dan telekomunikasi dengan material, ukuran, tutupan dan pemilik; data OpenStreetMap dari file JSON Overpass; perpotongan, potongan parit dan volume; layer layanan dalam DWG, DXF dan PDF; segmen pipa dan kabel IFC.
keywords: utilitas, jaringan, osm, openstreetmap, overpass, pipa, kabel, gas, saluran pembuangan, drainase, telekomunikasi, daya, air, hidran, manhole, parit, perpotongan, tinggi bebas, tutupan, kedalaman, dwg, ifc, georeferensi, layer
from: 8a85dace
---

Gambar layanan terpendam pada suatu lokasi sebagai satu jaringan per layanan, periksa tempat jaringan-jaringan tersebut saling berpotongan, lalu kirim keluar sebagai layer gambar dan sebagai IFC.

## Membuat lintasan

Buka **Permukaan, Lainnya, Jaringan utilitas...**

- **Buat lintasan dari pilihan** mengubah alinyemen, garis fitur, atau pipa yang dipilih menjadi lintasan dari layanan yang Anda pilih. Kemudian isi material, ukuran (mm), tutupan (kedalaman ke bagian atas pipa atau kabel) dan pemilik pada tabel.
- **Baca data OpenStreetMap** membaca file JSON Overpass yang Anda simpan (kueri dengan `out geom;`). Proyek memerlukan sistem koordinat terlebih dahulu, karena posisi OpenStreetMap berupa lintang dan bujur. Jaringan pipa (menurut zat yang dialirkan), kabel daya dan telekomunikasi bawah tanah, hidran, manhole dan drainase hujan dibaca; objek lain dihitung sebagai tidak disertakan dan disebutkan dalam pesan. Saluran udara tidak disertakan.
- **Tambahkan peta OpenStreetMap** menambahkan peta OpenStreetMap di bawah denah. Peta hanya tergambar selama layer peta dari internet diaktifkan di Pengaturan.

## Pemeriksaan dan keluaran

- **Perpotongan**: lintasan dari layanan yang berbeda yang berpotongan pada denah didaftarkan beserta tinggi bebas di antara keduanya jika ada permukaan tanah; nilai minimum adalah nilai sementara yang Anda atur, bukan angka dari suatu standar.
- **Parit**: setiap lintasan memiliki parit (ukuran pipa ditambah tinggi bebas di setiap sisi, kemiringan sisi, alas) beserta volumenya. Total ditampilkan di jendela dan di CSV.
- **Gambar**: lintasan dan titik berada pada layer layanan (misalnya U-WATR-RUN, U-POWR-RUN), sehingga ikut ke PDF, DXF dan DWG.
- **IFC**: lintasan masuk ke ekspor IFC sebagai segmen pipa dan segmen kabel, dengan hidran, katup, dan bak, satu sistem per layanan, dalam sistem koordinat proyek.

## Data OpenStreetMap

Data OpenStreetMap merupakan hak cipta kontributor OpenStreetMap dan dilisensikan di bawah ODbL. Atribusi ditambahkan ke gambar, CSV dan IFC. Jika Anda membagikan file yang memuat data OpenStreetMap, pertahankan atribusinya dan baca ketentuan berbagi-serupa pada lisensi tersebut.

## Yang belum dibuat

Lintasan belum dapat digambar titik demi titik pada denah dengan alat, dan perpotongan belum digambar pada tampilan profil (perhitungannya sudah dibuat). Kedalaman, ukuran dan tinggi bebas dimulai sebagai nilai sementara: gunakan angka standar Anda sendiri.
