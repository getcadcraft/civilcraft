---
title: Sunting titik survei
summary: Ubah nomor, koordinat, elevasi, atau deskripsi satu titik, atau seret ke tempat baru di denah.
keywords: sunting titik, pindahkan titik, ubah elevasi, beri nomor ulang, nomor titik, deskripsi, seret, northing, easting, perbaiki titik, bidikan rusak
from: 375ae2e9
---

Bidikan yang gagal, tinggi rambu yang keliru, deskripsi yang salah ketik: perbaiki satu titik itu, dan permukaannya akan mengikuti.

## Ubah nilai titik

1. Dengan {{ui:Pilih}}, klik titik di denah. **Properti** menampilkan nomor, easting, northing, elevasi, dan deskripsinya dalam kotak.
2. Ketik nilai baru dan tekan {{key:Enter}} (atau klik di luar kotak). Biarkan **Elevasi** kosong untuk titik tanpa elevasi.
3. Permukaan, kontur, dan semua yang dibangun di atasnya langsung diperbarui.

Setiap perubahan adalah satu langkah: {{key:Mod+Z}} mengurungkannya dan {{key:Mod+Y}} mengulanginya. Nilai yang tidak dapat digunakan CivilCraft (nomor yang sudah dimiliki titik lain, huruf dalam koordinat) ditolak: kotaknya diberi garis tepi dan bilah status menyebutkan alasannya.

Kode deskripsi baru membuat grup titik baru, sama seperti impor (lihat [Bangun permukaan](topic:build-surface)).

## Pindahkan titik di denah

1. Pilih titik (titik itu akan diberi cincin).
2. Seret cincin itu. Bilah status menampilkan easting dan northing tujuannya.
3. Lepaskan untuk memindahkan; elevasinya tetap. Tekan {{key:Esc}} sebelum melepaskan untuk mengembalikannya.

## Breakline mengikuti titik

Breakline yang digambar dengan alat {{ui:Breakline}} menyalin titik-titik yang dilewatinya. Saat Anda memindahkan titik atau mengubah elevasinya, sudut breakline di titik itu ikut bergerak, dalam langkah yang sama. Grup breakline yang dibuat dari deskripsi selalu dibangun ulang dari titik.

:::note
Permukaan yang dibaca dari file LandXML mempertahankan segitiganya sendiri: suntingan titik hanya mengubahnya setelah {{ui:Bangun ulang permukaan dari titik}}.
:::
