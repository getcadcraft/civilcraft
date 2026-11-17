---
title: Susun jaringan pipa gravitasi
summary: Gambar ruas pipa drainase atau air limbah struktur demi struktur, atur aturan kemiringan, penutup, dan penurunan, biarkan CivilCraft menetapkan invert, dan perbaiki masalah yang didaftarnya.
keywords: pembuat struktur, tipe struktur, struktur persegi, catch basin, bingkai, penutup, tebal dinding, item pustaka, jaringan pipa, drainase, air limbah, saluran, struktur, manhole, inlet, invert, kemiringan, penurunan, rim, sump, pipa gravitasi
from: 10a3c14d
---

Proyek menampung satu jaringan pipa gravitasi, drainase atau air limbah. Jaringan itu terdiri dari struktur (manhole, inlet) dan pipa lurus di antaranya. Aliran mengikuti arah Anda menggambar. CivilCraft memeriksa tiap pipa dan struktur terhadap tiga aturan yang Anda atur, dan dapat mengatur setiap invert dari aturan tersebut.

## Gambar ruas

Anda dapat menggambar pipa tanpa permukaan, tetapi rim, penutup, dan invert otomatis membutuhkannya.

1. Tekan {{key:P}}, atau klik {{ui:Pipa}} di grup **Desain**.
   Petunjuknya berbunyi "Pipa: klik struktur dari atas ruas ke bawah (klik struktur yang sudah ada untuk menyambung). Enter selesai."
2. Klik tempat struktur hulu ditempatkan. Sebuah struktur ditempatkan.
3. Klik tiap struktur berikutnya di hilir. Untuk menyambung ke struktur yang sudah ada, klik padanya: bilah status menulis "Tersambung ke S3."
4. Tekan {{key:Enter}}.
   Pipa digambar, invertnya diatur dari aturan, dan bilah status menulis, misalnya, "3 pipa digambar, 12 invert diatur dari aturan; semua pemeriksaan lulus."

Struktur baru dinamai S1, S2 … dengan diameter 48 in (1200 mm). Pipa baru dinamai P1, P2 … dengan diameter 12 in (300 mm). Diameter dalam inci pada proyek kaki dan dalam milimeter pada proyek meter.

Selesaikan dengan {{key:Enter}}. Klik ganda juga berfungsi, tetapi saat Anda mengklik ganda struktur yang sudah ada untuk mengakhiri ruas di sana, sambungannya dibatalkan: klik sekali, lalu tekan {{key:Enter}}.

## Atur aturan Anda

Saat tidak ada yang dipilih, panel kanan (**Proyek**) memiliki blok **Jaringan pipa**:

| Pengaturan | Nilai awal | Arti |
|---|---|---|
| Tipe | Drainase | {{ui:Drainase}} atau {{ui:Air limbah}}; ditulis ke LandXML |
| Kemiringan minimum | 0.50% | Setiap pipa harus turun setidaknya sebesar ini |
| Penutup minimum | 2 ft (0.6 m) | Dari tanah ke puncak pipa, sepanjang pipa |
| Penurunan di struktur | 0.10 ft (0.03 m) | Invert keluaran harus berada setidaknya sejauh ini di bawah setiap invert masukan |

**Nilai awal ini hanyalah tempat pengisi, bukan standar.** Atur nilai yang disyaratkan instansi atau proyek Anda. Penutup diukur dari tanah ke puncak (invert ditambah diameter dalam); tebal dinding tidak dihitung. Di tempat pad atau koridor dibentuk, permukaan yang dibentuk adalah tanahnya.

## Biarkan CivilCraft menetapkan invert

- {{ui:Atur setiap invert dari aturan}} (di blok **Jaringan pipa**) mengatur semua pipa.
- {{ui:Atur invert-nya dari aturan}} (dengan satu pipa dipilih) hanya mengatur pipa itu.

Bekerja ke hilir, tiap ruas dimulai dengan penutup minimum di struktur hulunya, turun setidaknya sebesar kemiringan minimum, menurun sebesar penurunan di tiap struktur, dan menjadi lebih dalam di mana saja tanah di sepanjang pipa akan menyisakan penutup kurang dari minimum. Invert dibulatkan ke bawah ke 0.01, tidak pernah ke atas. Bilah status menulis "Invert diatur: penutup minimum di puncak tiap ruas, minimal kemiringan minimum, minimal penurunan di tiap struktur." atau menyebutkan apa yang tidak bisa dilakukannya.

## Sunting struktur dan pipa

Klik struktur atau pipa dengan {{ui:Pilih}} untuk melihatnya di panel kanan.

**Struktur**: **Nama**, **Rim**, **Kedalaman sump**, **Diameter**, lalu **Rim yang dipakai**, **Sump**, **Easting**, dan **Northing**, serta pipa masuk dan keluar beserta invertnya.

- Biarkan **Rim** kosong untuk mengambilnya dari permukaan; kotak kemudian menampilkan nilai permukaan dengan warna abu-abu. Ketik nilai untuk mengunci rim.
- Seret grip struktur di denah untuk memindahkannya. Pipanya ikut; invertnya tetap seperti semula, jadi periksa masalahnya setelah itu.

**Tipe**: pilih salah satu tipe struktur jaringan (di bawah), atau tidak ada untuk struktur bulat dengan diameternya sendiri.

**Pipa**: **Nama**, struktur tempat ia berjalan di antaranya, **Diameter**, **Invert atas**, **Invert bawah**, lalu **Panjang**, **Kemiringan**, dan **Penutup minimum**.

Tekan {{key:Enter}} setelah tiap nilai.

## Baca dan perbaiki masalah

Blok **Jaringan pipa** mendaftar setiap masalah (hingga 40); klik salah satu untuk memilih pipa atau struktur. Pipa atau struktur yang dipilih mendaftar masalahnya sendiri. Jika tidak ada yang dipilih, tertulis "Setiap pipa dan struktur lulus aturan."

| Pesan (contoh) | Yang harus dilakukan |
|---|---|
| "P2 mengalir naik (-0.40%)." atau "… mengalir datar …" | Tukar invert, atau atur dari aturan. |
| "P2 pada 0.30% lebih datar dari minimum 0.50%." | Turunkan invert hilir atau naikkan invert hulu. |
| "P3 memiliki 1.40 penutup 35 di sepanjangnya, kurang dari minimum 2." | Turunkan pipa; atur invertnya dari aturan. |
| "Di S3, P4 keluar pada 245.20, kurang dari 0.1 di bawah P3 yang masuk pada 245.25." | Turunkan invert atas pipa keluaran. |
| "Puncak P1 berada di atas rim S1." | Pipa terlalu tinggi untuk struktur. |
| "S2 memiliki 2 pipa yang keluar darinya; jaringan gravitasi seharusnya hanya memiliki satu jalan keluar dari tiap struktur." | Hapus satu pipa keluar, atau gambar ulang ke arah yang benar. |
| "Pipa membentuk lingkaran; aliran harus berakhir di keluaran." | Sebuah ruas digambar kembali ke dirinya sendiri; hapus satu pipa. |
| "S5 berada di luar permukaan dan tidak memiliki elevasi rim." | Ketik rim, atau pindahkan struktur ke permukaan. |
| "P6 sebagian berada di luar permukaan; penutup di sana tidak diketahui." | Perluas permukaan, atau terima bahwa penutup tidak diperiksa di sana. |
| "P7 belum memiliki invert." | Ketik invertnya, atau atur dari aturan. |

Pipa dan struktur bermasalah juga ditandai merah di denah.

## Tipe struktur

Tipe struktur adalah struktur yang dibangun dari parameternya: manhole, inlet, bak sambungan, atau keluaran, **bulat** (diameter dalam) atau **persegi** (lebar dan panjang dalam), dengan **tebal dinding**, **pelat lantai**, **sump** di bawah pipa terendah, dan **bingkai dan penutup** (bukaan bulat atau persegi, tinggi bingkai). Tipe milik jaringan, di bawah **Tipe struktur** di Properti proyek.

1. Klik {{ui:Tipe bangunan baru}}. Dialog menggambar struktur di denah dan potongan saat Anda mengetik.
2. Klik {{ui:Tambahkan tipe}}.
3. Pilih struktur dan pilih tipenya di bawah **Tipe**. Ia mengambil ukuran dan sump tipe itu; sump-nya sendiri masih bisa diubah.

Edit tipe, dan setiap struktur bertipe itu mengikuti ukurannya. Hapus tipe, dan strukturnya tetap sebagai struktur bulat dengan lebar yang sama. Tiap perubahan adalah satu langkah: {{key:Mod+Z}} membatalkannya.

Struktur persegi digambar di denah, DXF, DWG, dan PDF, dan di 3D sebagai persegi dengan panjangnya mengikuti pipa keluarannya; pipa mulai dari dindingnya. LandXML menulisnya sebagai struktur persegi (`RectStruct`) dengan tebal dindingnya, dan membaca struktur seperti itu kembali sebagai tipe.

### Bagikan tipe lewat pustaka

{{ui:Simpan sebagai item pustaka}} menulis tipe sebagai item pustaka CadCraft (file `.json`): simbol denahnya, badan 3D hingga kedalaman khas, dan setiap ukurannya. Unggah ke pustaka untuk membagikannya. {{ui:Buka item pustaka}} membaca struktur yang disimpan dengan cara ini kembali ke jaringan, dikonversi ke satuan proyek. Item pustaka yang bukan struktur buatan CivilCraft ditolak, dengan alasannya.

## Hapus

Pilih pipa dan tekan Delete untuk menghapusnya. Menghapus struktur juga menghapus pipa yang terhubung dengannya. Di Mac, tekan Fn lalu Delete, atau klik {{ui:Hapus}}.

## Belum dibuat

Aliran, ukuran pipa, dan garis gradien hidraulik ada di [Drainase](topic:storm-drainage). Katalog pipa, pipa tidak bulat, pipa di tampilan profil, pipa melengkung, dan lebih dari satu jaringan per proyek belum tersedia. Lihat [Belum dibuat](topic:not-built-yet).
