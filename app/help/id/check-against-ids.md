---
title: Periksa ekspor IFC terhadap IDS klien
summary: Muat file .ids yang diberikan klien atau otoritas jalan kepada Anda dan lihat setiap elemen yang diekspor yang tidak memenuhinya di Masalah.
keywords: ids, information delivery specification, buildingsmart, persyaratan, serah terima, periksa, validasi, qa, ekspor ifc, ifc 4.3, alinyemen, jalan, pengadaan
from: 183d9a0e
---

## Yang akan Anda lakukan

Sebuah IDS (Information Delivery Specification, standar buildingSMART) adalah daftar apa yang harus dimuat sebuah IFC. Pengadaan publik sering mengirimkannya bersama pekerjaan. CivilCraft memeriksa IFC yang diekspor proyek ini, dalam versi IFC yang Anda pilih untuk ekspor, terhadap IDS itu dan mencantumkan setiap elemen yang kurang.

## Langkah

1. Buka proyek Anda.
2. Klik {{ui:IFC}} di grup Ekspor pada bilah alat. Di dialog, pilih versi IFC yang akan Anda serahkan.
3. Klik {{ui:Periksa terhadap IDS…}}.
4. Klik {{ui:Muat file .ids…}} dan pilih file. Tidak ada yang diunggah.
5. Baca hasilnya: setiap spesifikasi dengan {{ui:Lulus}} atau {{ui:Gagal}} dan jumlah elemen yang diterapkannya.
6. Buka Masalah ({{key:Ctrl+Shift+M}}) dan klik kegagalan untuk memilih alinyemen, pad, pipa, struktur, atau massa bangunan asalnya.

## Yang akan Anda lihat

- Satu peringatan untuk setiap elemen yang diekspor dan persyaratan yang tidak dipenuhinya, dengan nama spesifikasinya, apa yang diminta IDS, dan apa yang dimiliki ekspor.
- Laporan pemeriksaan (di Masalah) dimulai dengan IDS: judul, versi, penulis, dan jumlah setiap spesifikasi.

## Perlu diketahui

- IDS disimpan dalam file proyek, sehingga diperiksa lagi saat Anda membuka proyek. Memuat atau melupakannya adalah satu langkah yang dapat Anda urungkan.
- Setiap perubahan diperiksa lagi sebentar kemudian. Permukaan besar memerlukan waktu lebih lama untuk ditulis, sehingga pemeriksaan menunggu sedikit lebih lama di antara setiap proses.
- Pemeriksaan menggunakan file yang sama dengan yang ditulis ekspor {{ui:IFC}}, dalam versi yang terakhir dipilih di sana (IFC 4.3 jika Anda belum memilih).
- Angka dibandingkan dalam satuan SI: proyek dalam kaki dikonversi ke meter terlebih dahulu.

- Pola dalam IDS dibaca sebagai seluruh nilai. `^` di awal dan `$` di akhir juga diambil sebagai "seluruh nilai", seperti yang dimaksudkan sebagian besar file IDS.

## Berikutnya

- [Ekspor IFC](topic:ifc)
