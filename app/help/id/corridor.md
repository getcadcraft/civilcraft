---
title: Sapu koridor jalan
summary: Nyalakan koridor untuk sebuah alinyemen, atur nilai lajur, bahu dan lereng samping, dan baca penampang, garis daylight serta pekerjaan tanah yang dihasilkannya.
keywords: superelevasi, super, kemiringan tikungan, runoff, runout, tabel rate, kemiringan melintang, rotasi, koridor, rakitan, subrakitan, potongan tipikal, jalan, lajur, bahu, lereng samping, daylight, galian, timbunan, penampang, target, target lebar, target elevasi, target offset, pelebaran, tepi perkerasan, ikuti koridor lain
from: 91303189
---

Koridor menyapu satu potongan tipikal sederhana (sebuah rakitan) sepanjang alinyemen dan profil desainnya, menggradingnya ke tanah asli, lalu menambahkan hasilnya ke permukaan rencana. Sebuah alinyemen dapat memuat beberapa koridor pada rentang stasiun yang berbeda, dan sebuah koridor dapat dibangun dari templat yang dapat dipakai ulang menurut stasiun ([Templat koridor](topic:corridor-templates)). Rakitan sederhana di bawah ini sama di kedua sisi; untuk memberi setiap sisi bagiannya sendiri, lihat [Bangun setiap sisi dari bagian](topic:corridor#build-each-side-from-parts).

## Rakitan

Dari as jalan ke luar, pada setiap sisi:

1. sebuah **lajur** dengan lebar tertentu, yang menurun dari punggung jalan pada **kemiringan lajur**
2. sebuah **bahu** dengan lebar tertentu pada **kemiringan bahu**
3. sebuah **lereng samping** dari tepi bahu sampai bertemu tanah: **lereng galian** di tempat tanah lebih tinggi, dan **lereng timbunan** di tempat tanah lebih rendah

Nilai awalnya adalah placeholder, bukan standar desain:

| Nilai | US feet | Meter |
|---|---|---|
| Lebar lajur | 12 ft | 3.6 m |
| Kemiringan lajur | 2% | 2% |
| Lebar bahu | 4 ft | 1.2 m |
| Kemiringan bahu | 4% | 4% |
| Lereng galian | 2 : 1 | 2 : 1 |
| Lereng timbunan | 3 : 1 | 3 : 1 |
| Penampang setiap | 10 ft | 5 m |

Kemiringan lereng samping adalah horizontal terhadap vertikal (H:V): 3 : 1 berarti 3 ke samping untuk 1 ke bawah.

## Bangun koridor

Anda memerlukan alinyemen tanpa kesalahan dan profil desain dengan setidaknya dua PVI dan tanpa kesalahan.

1. Pilih alinyemen.
2. Di panel kanan, di bawah **Koridor**, centang **Sapu rakitan sepanjang profil desain**.
   Kolom-kolom muncul dan koridor langsung dibangun. Denah menampilkan tepi lajur dan bahu serta garis daylight; dengan {{ui:Rencana (grading)}} dipilih di bawah **Tampilan**, kontur menampilkan tanah baru.
3. Ubah nilai apa pun: **Lebar lajur**, **Kemiringan lajur**, **Lebar bahu**, **Kemiringan bahu**, **Lereng galian**, **Lereng timbunan**, **Penampang setiap**. Tekan {{key:Enter}} setelah setiap nilai. Galian, timbunan dan jarak penampang harus lebih dari 0.
4. Baca baris di bawah kolom-kolom, misalnya "39 penampang dari 0+00.00 sampai 3+86.36; galian 240.2 cu yd, timbunan 556.0 cu yd."

Penampang dipotong pada setiap langkah **Penampang setiap**, di ujung-ujungnya, dan di awal serta akhir setiap lengkung horizontal dan vertikal. Setiap penampang dan garis yang melaluinya (as jalan, tepi lajur dan bahu, daylight) menjadi breakline dari permukaan rencana.

Untuk mematikan koridor, hapus centang kotaknya. Nilainya disimpan untuk lain waktu.

## Saat tidak dapat dibangun

Kotak merah di bawah kolom-kolom menjelaskan alasannya:

| Pesan | Yang harus dilakukan |
|---|---|
| "Koridor memerlukan profil desain tanpa kesalahan." | Tambahkan PVI, atau perbaiki lengkung vertikal yang tumpang tindih (lihat [Desain profil vertikal](topic:profile)). |
| "Profil desain tidak tumpang tindih dengan alinyemen." | Pindahkan PVI ke rentang stasiun alinyemen. |
| "Koridor memerlukan setidaknya dua penampang pada permukaan." | Sebagian besar koridor berada di luar tanah asli. |
| "4 lereng samping melintasi permukaan sebelum bertemu tanah." | Dekat tepi permukaan, lereng tidak dapat mencapai tanah. Jauhkan jalan dari tepi, atau turunkan tinggi timbunan atau galian di sana. |
| "Garis daylight koridor saling berpotongan (penampang tumpang tindih, misalnya di sisi dalam tikungan tajam). Gunakan radius yang lebih besar atau rakitan yang lebih sempit." | Penampang di sisi dalam tikungan tajam saling tumpang tindih. Perbesar radius atau persempit rakitan. |

Koridor yang bermasalah tidak di-grading masuk dan tidak dihitung dalam pekerjaan tanah.

## Koridor dan pad bersama-sama

Permukaan rencana dibangun secara berurutan: setiap koridor lebih dulu, lalu setiap pad. Di tempat grading pad tumpang tindih dengan koridor, pad yang menang. Volume dihitung di dalam semua garis daylight sekaligus; lihat [Volume pekerjaan tanah](topic:volumes).

## Superelevasi

Melalui tikungan, jalan dapat dimiringkan ke arah dalam, sehingga lalu lintas didorong lebih sedikit ke luar. Centang **Superelevasi tikungan** di bawah **Superelevasi** pada **Properti** alinyemen:

- Setiap lengkung lingkaran mengambil rate **e** dari tabel rate: baris pertama yang dicapai radius lengkung itu (baris dengan rate kosong mempertahankan punggung normal). Tabel dan **Gradien relatif maksimum** (mulai dari 0.5 %) adalah placeholder, bukan standar: atur dari kriteria desain Anda sendiri. Tambah atau hapus baris sesuai kebutuhan.
- Lajur berputar terhadap as jalan. Sebelum tikungan, lajur luar dibuat datar sepanjang **runout** (punggung normal ÷ e × runoff), lalu sepanjang **runoff** (lebar lajur × e ÷ gradien) lajur luar terus berputar sampai seluruh jalan miring e ke arah dalam; dua pertiga runoff berada sebelum tikungan dan sepertiga berada di atasnya. Setelah tikungan, hal yang sama terjadi secara terbalik.
- Bahu di sisi rendah tidak pernah lebih datar daripada lajurnya; di sisi tinggi ia mempertahankan kemiringannya sendiri (ia berguling).
- Tabel di bawahnya mendaftar radius, rate, runoff dan runout setiap tikungan serta di mana superelevasi penuh dimulai dan berakhir. **Diagram superelevasi** menggambar kemiringan melintang kedua lajur sepanjang stasiun (lajur kiri padat, lajur kanan putus-putus).
- Tikungan yang terlalu pendek untuk mencapai superelevasi penuh, atau dua tikungan yang transisinya tumpang tindih, dinyatakan dalam kotak di atas tabel.

Penampang, volume, tampilan 3D dan lembar semuanya menampilkan jalan yang miring. Setiap perubahan adalah satu langkah: {{key:Mod+Z}} membatalkannya.

## Target

Target memindahkan satu titik pada satu sisi jalan ke sebuah garis: **Tepi perkerasan** atau **Tepi bahu**, pada sisi **Kiri** atau **Kanan**. Setiap penampang bertemu garis itu tegak lurus terhadap as jalan, hanya ke luar pada sisi itu, sehingga target di kanan tidak pernah memindahkan sisi kiri.

| Mengatur | Yang terjadi di tempat penampang bertemu garis |
|---|---|
| **Lebar** | Titik berada di garis: lajur (atau bahu) melebar atau menyempit sampai garis itu, dengan tetap mempertahankan kemiringan melintangnya. |
| **Elevasi** | Titik mengambil elevasi garis di sana, pada offset miliknya sendiri: kemiringan melintang lajur (atau bahu) mengikuti. |

Garis dapat berupa garis fitur (apa pun **Penggunaannya**) atau garis dari koridor lain: as jalannya, tepi perkerasan, tepi bahu, atau garis daylight. Garis koridor mengikuti koridor itu: ubah jalan yang lain dan jalan ini ikut berubah. CivilCraft membangun koridor lain lebih dulu; dua koridor yang akan saling menargetkan dalam sebuah lingkaran ditolak di satu sisi, dan tabel menyatakan yang mana.

1. Pilih alinyemen dan nyalakan koridornya.
2. Di bawah **Target**, klik {{ui:Tambah target}}.
3. Pilih **Sisi**, **Titik**, apa yang **Mengatur** dan **Ke garis**. Setiap perubahan adalah satu langkah urungkan.

**Hasil** menyatakan di berapa penampang garis itu tercapai. Penampang yang tidak mencapainya (melewati ujung garis, atau berada di belakang as jalan) mempertahankan nilai rakitan. Garis yang dihapus membuat koridor kembali seperti sebelum target, dan tabel menyatakannya. Satu sisi dapat memiliki satu target lebar dan satu target elevasi untuk setiap titik.

## Bangun setiap sisi dari bagian

Nyalakan **Bangun setiap sisi dari bagian** di bawah pengaturan koridor. Setiap sisi kemudian memiliki daftarnya sendiri, dari as jalan ke luar: lajur, bahu, talang, kerb, jalur tanaman, trotoar, dan terakhir lereng samping ke tanah (dengan rasio galian dan timbunannya sendiri). Mulai dari {{ui:Jalan luar kota}} atau {{ui:Jalan perkotaan}}, tambahkan dan hapus bagian, pindahkan dengan panah, dan {{ui:Salin}} satu sisi ke sisi lain. Setiap perubahan adalah satu langkah urungkan.

Kemiringan melintang adalah penurunan menjauh dari jalan, sehingga trotoar yang mengalirkan air ke arah jalan bernilai negatif. Kerb adalah muka dengan tinggi yang Anda berikan, puncak dengan lebar yang Anda berikan, dan penurunan opsional di bagian belakang. Superelevasi memutar setiap lajur di baris pertama; talang, kerb, jalur dan trotoar menggantung dari tepi lajur sebagaimana dibangun. Target tetap menggeser ujung lajur dan bagian terakhir. Penampang melintang menandai garis aliran talang, puncak dan belakang kerb, serta lainnya. Pada tikungan dengan spiral, runoff adalah spiral itu: punggung datar di TS, superelevasi penuh di SC.

## Lapis perkerasan

Lajur, bahu, talang, jalur tanaman atau trotoar dapat memuat susunan lapisannya. Di bawah bagian itu, {{ui:Tambah lapis}} menambahkan satu lapis dengan nama, material, ketebalan dan jenisnya (permukaan, binder, base, subbase, capping atau lainnya), dari atas ke bawah. Lapis tidak menggerakkan permukaan jalan (puncaknya adalah permukaan desain); setiap lapis berada di bawah bagiannya, dengan kedalaman diukur lurus ke bawah. Penampang melintang menggambar dasar setiap lapis sebagai garis putus-putus, dan {{ui:Lapis perkerasan: kuantitas}} mendaftar luas denah dan volume setiap lapis (luas sepanjang koridor dari penampangnya, volume = luas × ketebalan). Ekspor IFC menuliskan setiap lapis sebagai elemennya sendiri dengan ketebalan dan materialnya (lihat [Ekspor dan impor IFC](topic:ifc)). Ketebalan yang Anda ketik adalah milik Anda: CivilCraft tidak menentukan ukuran perkerasan.

## Yang belum dibangun

Target untuk kemiringan daylight belum tersedia. Untuk koridor yang berubah di sepanjang jalan, dengan kiri dan kanan dipisahkan, gunakan [Templat koridor](topic:corridor-templates). Lihat [Belum dibangun](topic:not-built-yet).
