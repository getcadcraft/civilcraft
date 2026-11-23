---
title: Sweep koridor jalan
summary: Nyalakan koridor untuk sebuah alinyemen, atur nilai lajur, bahu, dan lereng samping, lalu baca potongan, garis daylight, dan pekerjaan tanah yang dihasilkannya.
keywords: persimpangan, perpotongan, jalan bertemu jalan, jalan samping, persimpangan T, perlintasan, elevasi pad, gabung, sambung, superelevasi, super, kemiringan tikungan, runoff, runout, tabel nilai, kemiringan melintang, rotasi, koridor, rakitan, subrakitan, potongan tipikal, jalan, lajur, bahu, kemiringan melintang, lereng samping, daylight, galian, timbunan, potongan, target, target lebar, target elevasi, target offset, pelebaran, tepi perkerasan, mengikuti koridor lain
from: 6dcb92b3
---

Koridor menyapu satu potongan tipikal sederhana (sebuah rakitan) sepanjang alinyemen dan profil desainnya, menyesuaikannya dengan tanah asli, dan menambahkan hasilnya ke permukaan rencana. Sebuah alinyemen dapat memuat beberapa koridor pada rentang stasiun yang berbeda, dan koridor dapat dibangun dari templat yang dapat dipakai ulang per stasiun ([Templat koridor](topic:corridor-templates)). Rakitan sederhana di bawah ini sama di kedua sisi; untuk memberi tiap sisi bagiannya sendiri, lihat [Bangun tiap sisi dari bagian](topic:corridor#build-each-side-from-parts).

## Rakitan

Dari as jalan ke arah luar, pada tiap sisi:

1. sebuah **lajur** dengan lebar tertentu, menurun dari **punggung jalan** pada **kemiringan lajur**
2. sebuah **bahu** dengan lebar tertentu pada **kemiringan bahu**
3. sebuah **lereng samping** dari tepi bahu sampai bertemu tanah: **lereng galian** bila tanah berada di atas, **lereng timbunan** bila berada di bawah

Nilai awalnya adalah pengisi sementara, bukan standar desain:

| Nilai | US feet | Meter |
|---|---|---|
| Lebar lajur | 12 ft | 3.6 m |
| Kemiringan lajur | 2% | 2% |
| Lebar bahu | 4 ft | 1.2 m |
| Kemiringan bahu | 4% | 4% |
| Lereng galian | 2 : 1 | 2 : 1 |
| Lereng timbunan | 3 : 1 | 3 : 1 |
| Potongan setiap | 10 ft | 5 m |

Lereng samping dinyatakan horizontal terhadap vertikal (H:V): 3 : 1 berarti 3 ke samping untuk 1 ke bawah.

## Bangun koridor

Anda memerlukan alinyemen tanpa kesalahan dan profil desain dengan minimal dua PVI serta tanpa kesalahan.

1. Pilih alinyemen.
2. Di panel kanan, di bawah **Koridor**, centang **Sapu rakitan sepanjang profil desain**.
   Kolom-kolom muncul dan koridor langsung dibangun. Denah menampilkan tepi lajur dan bahu serta garis daylight; dengan {{ui:Rencana (grading)}} dipilih di bawah **Tampilan**, kontur menunjukkan tanah baru.
3. Ubah nilai apa pun: **Lebar lajur**, **Kemiringan lajur**, **Lebar bahu**, **Kemiringan bahu**, **Lereng galian**, **Lereng timbunan**, **Potongan setiap**. Tekan {{key:Enter}} setelah tiap nilai. Lereng galian, lereng timbunan, dan jarak potongan harus lebih dari 0.
4. Baca baris di bawah kolom-kolom, misalnya "39 potongan dari 0+00.00 sampai 3+86.36; galian 240.2 cu yd, timbunan 556.0 cu yd."

Potongan dibuat pada setiap langkah **Potongan setiap**, di kedua ujung, dan di awal serta akhir tiap lengkung horizontal dan vertikal. Tiap potongan dan garis yang melewatinya (as jalan, tepi lajur dan bahu, daylight) menjadi breakline dari permukaan rencana.

Untuk mematikan koridor, hapus centang kotaknya. Nilainya tetap disimpan untuk lain kali.

## Saat tidak bisa dibangun

Kotak merah di bawah kolom-kolom menjelaskan alasannya:

| Pesan | Yang harus dilakukan |
|---|---|
| "Koridor memerlukan profil desain tanpa kesalahan." | Tambahkan PVI, atau perbaiki lengkung vertikal yang saling tumpang tindih (lihat [Rancang profil vertikal](topic:profile)). |
| "Profil desain tidak tumpang tindih dengan alinyemen." | Pindahkan PVI ke rentang stasiun alinyemen. |
| "Koridor memerlukan minimal dua potongan pada permukaan." | Sebagian besar koridor berada di luar tanah asli. |
| "4 lereng samping keluar dari permukaan sebelum bertemu tanah." | Dekat tepi permukaan, lereng tidak dapat mencapai tanah. Jauhkan jalan dari tepi, atau kurangi tinggi timbunan atau galian di sana. |
| "Garis daylight koridor berpotongan (potongan saling tumpang tindih, misalnya di sisi dalam tikungan tajam). Gunakan radius lebih besar atau rakitan yang lebih sempit." | Potongan di sisi dalam tikungan tajam saling tumpang tindih. Perbesar radius atau persempit rakitan. |

Koridor yang bermasalah tidak di-grading dan tidak dihitung dalam pekerjaan tanah.

## Koridor dan pad bersama

Permukaan rencana dibangun secara berurutan: semua koridor lebih dulu, lalu semua pad. Di tempat grading pad tumpang tindih dengan koridor, pad yang menang. Di tempat item yang lebih belakangan tumpang tindih dengan jalan, hanya bagian jalan di dalam garis daylight item itu yang diganti; sisa jalan, dan breakline tanah apa pun yang dilewati jalan, tetap pada bentuknya. Volume dihitung di dalam semua garis daylight bersama; lihat [Volume pekerjaan tanah](topic:volumes).

## Superelevasi

Pada lengkung, jalan dapat dimiringkan ke arah dalam, sehingga lalu lintas terdorong lebih sedikit ke luar. Centang **Superelevasi lengkung** di bawah **Superelevasi** pada **Properti** alinyemen:

- Tiap lengkung lingkaran mengambil nilai **e** dari tabel nilai: baris pertama yang radiusnya dicapai lengkung (baris dengan nilai kosong mempertahankan punggung jalan normal). Tabel dan **Kelandaian relatif maksimum** (awalnya 0.5 %) adalah pengisi sementara, bukan standar: atur sesuai kriteria desain Anda sendiri. Tambah atau hapus baris sesuai kebutuhan.
- Lajur berputar terhadap as jalan. Sebelum lengkung, lajur sisi luar mendatar selama **runout** (punggung jalan normal ÷ e × runoff), lalu selama **runoff** (lebar lajur × e ÷ kelandaian) lajur sisi luar terus berputar sampai seluruh jalan miring sebesar e ke arah dalam; dua pertiga runoff berada sebelum lengkung dan sepertiga di atasnya. Setelah lengkung, hal yang sama terjadi secara terbalik.
- Bahu di sisi rendah tidak pernah lebih datar daripada lajurnya; di sisi tinggi ia mempertahankan kemiringannya sendiri (ia berguling).
- Tabel di bawahnya mencantumkan radius, nilai, runoff, dan runout tiap lengkung, serta tempat superelevasi penuh dimulai dan berakhir. **Diagram superelevasi** menggambar kemiringan melintang kedua lajur sepanjang stasiun (lajur kiri padat, lajur kanan putus-putus).
- Lengkung yang terlalu pendek untuk mencapai superelevasi penuh, atau dua lengkung yang transisinya tumpang tindih, dinyatakan dalam kotak di atas tabel.

Potongan, volume, tampilan 3D, dan lembar semuanya menampilkan jalan yang miring. Setiap perubahan adalah satu langkah: {{key:Mod+Z}} membatalkannya.

## Target

Target memindahkan satu titik pada satu sisi jalan ke sebuah garis: **Tepi perkerasan** atau **Tepi bahu**, pada sisi **Kiri** atau **Kanan**. Tiap potongan bertemu garis tegak lurus terhadap as jalan, hanya ke arah sisi itu, sehingga target di kanan tidak pernah menggeser sisi kiri.

| Mengatur | Yang terjadi di tempat potongan bertemu garis |
|---|---|
| **Lebar** | Titik berada pada garis: lajur (atau bahu) melebar atau menyempit sampai ke garis, dengan mempertahankan kemiringan melintangnya. |
| **Elevasi** | Titik mengambil elevasi garis di sana, pada offset-nya sendiri: kemiringan melintang lajur (atau bahu) mengikutinya. |

Garis dapat berupa garis fitur (apa pun **Penggunaannya**) atau garis dari koridor lain: as jalannya, tepi perkerasannya, tepi bahunya, atau garis daylight-nya. Garis dari koridor lain mengikuti koridor tersebut: ubah jalan lain, dan jalan ini akan mengikutinya. CivilCraft membangun koridor lain lebih dulu; dua koridor yang saling menargetkan dalam satu lingkaran ditolak di salah satu sisi, dan tabel menyebutkan yang mana.

1. Pilih alinyemen dan nyalakan koridornya.
2. Di bawah **Target**, klik {{ui:Tambah target}}.
3. Pilih **Sisi**, **Titik**, apa yang **Mengatur**, dan **Ke garis**. Tiap perubahan adalah satu langkah urungkan.

**Hasil** menyatakan di berapa potongan garis tercapai. Potongan yang tidak mencapainya (melewati ujung garis, atau berada di belakang as jalan) mempertahankan nilai rakitan. Garis yang dihapus membuat koridor kembali seperti sebelum target, dan tabel menyebutkannya. Satu sisi dapat memiliki satu target lebar dan satu target elevasi untuk tiap titik.

## Bangun tiap sisi dari bagian

Nyalakan **Bangun tiap sisi dari bagian** di pengaturan koridor. Tiap sisi kemudian memiliki daftar sendiri, dari as jalan ke arah luar: lajur, bahu, gutter, kereb, jalur tanaman, trotoar, dan terakhir lereng samping ke tanah (dengan rasio galian dan timbunannya sendiri). Mulailah dari {{ui:Jalan luar kota}} atau {{ui:Jalan perkotaan}}, tambah dan hapus bagian, pindahkan dengan panah, dan {{ui:Salin}} satu sisi ke sisi lainnya. Tiap perubahan adalah satu langkah urungkan.

Kemiringan melintang adalah penurunan menjauhi jalan, jadi trotoar yang mengalirkan air ke arah jalan bernilai negatif. Kereb adalah muka dengan tinggi yang Anda berikan, puncak dengan lebar yang Anda berikan, dan penurunan opsional di bagian belakang. Superelevasi memutar setiap lajur di baris pertama; gutter, kereb, jalur, dan trotoar menggantung dari tepi lajur sebagaimana dibangun. Target tetap menggeser ujung lajur dan bagian terakhir. Potongan melintang menandai flowline gutter, puncak dan belakang kereb, serta lainnya. Pada lengkung dengan spiral, runoff adalah spiral itu sendiri: punggung jalan rata di TS, superelevasi penuh di SC.

## Lapis perkerasan

Lajur, bahu, gutter, jalur tanaman, atau trotoar dapat memuat susunan lapisannya: di bawah bagian, {{ui:Tambah lapis}} menambahkan lapis dengan nama, material, tebal, dan jenisnya (permukaan, pengikat, fondasi, fondasi bawah, penutup, atau lainnya), dari atas ke bawah. Lapis tidak menggeser permukaan jalan (puncaknya adalah permukaan desain); tiap lapis berada di bawah bagiannya, dan kedalamannya diukur lurus ke bawah. Potongan melintang menggambar dasar tiap lapis sebagai garis putus-putus, dan {{ui:Lapis perkerasan: kuantitas}} mendaftar luas denah dan volume tiap lapis (luas sepanjang koridor dari potongannya, volume = luas × tebal). Ekspor IFC menulis tiap lapis sebagai elemen tersendiri dengan tebal dan materialnya (lihat [Ekspor dan impor IFC](topic:ifc)). Tebal yang Anda ketik adalah milik Anda: CivilCraft tidak menentukan ukuran perkerasan.

## Tempat jalan bertemu jalan, pad, dan jalur

Dengan {{ui:Gabungkan jalan dan pad yang bertemu}} aktif (aktif untuk setiap koridor), CivilCraft menggabungkan koridor dengan apa yang ditemuinya di denah:

- **Jalan yang berakhir di jalan lain** (ujung alinyemennya berada di atas jalan lain, atau dalam jarak sekitar setengah lebar perkerasannya sendiri dari tepi jalan itu) adalah jalan samping dari sebuah persimpangan. Jalan yang ditemui membuka tepinya untuk perkerasan jalan samping: di mulut persimpangan, bahu, kereb, jalur, dan trotoar dibuat mengikuti kemiringan melintang lajur dan digambar sebagai perkerasan. Jalan samping dibuat di atas permukaan jalan utama tempat keduanya tumpang tindih, dan dinaikkan atau diturunkan ke jalan utama di sepanjang pendekatan.
- **Dua jalan yang bersilangan** digabung dengan cara yang sama di kedua sisi. Jalan yang tercantum pertama di bawah Alinyemen adalah jalan menerus; yang lain mengikuti permukaannya melintasi.
- **Jalan yang berakhir di pad** (di dalamnya, atau dalam jarak sekitar setengah lebar perkerasannya dari tepinya) tiba di elevasi pad dan diratakan ke sana di sepanjang pendekatan.
- **Jalur** (Lanskap › Hardscape) berhenti di tepi luar jalan, setinggi trotoar atau bahu di sana, alih-alih berada di atas jalan. Jalur yang memotong jalan menjadi dua bagian. Ujung yang digambar sedikit pendek dari jalan (dalam jarak dua kali lebar jalur) diteruskan sampai ke tepinya.

Properti menyatakan apa yang digabungkan tiap koridor, berapa tinggi yang dinaikkan atau diturunkan di sana, dan sepanjang apa. Panjang itu adalah yang lebih besar dari 10 m (30 ft) dan dua puluh kali perubahannya, dan tidak pernah lebih dari 45% koridor. **Profil desain tidak diubah**: tampilan profil tetap menunjukkan garis kelandaian yang Anda gambar, sedangkan potongan, permukaan rencana, volume, dan tampilan 3D menunjukkan jalan sebagaimana sudah digabung. Untuk membuat sambungan tepat secara desain, pindahkan PVI terakhir ke elevasi yang dilaporkan Properti.

Matikan sakelar pada koridor untuk membiarkannya tepat seperti profil dan rakitannya; ia kemudian tidak ikut dalam persimpangan mana pun, baik sebagai jalan samping maupun jalan menerus. Jalan yang bertemu hampir sejajar (di bawah sekitar 20°) dibiarkan begitu saja, begitu pula jalur tanah.

Yang belum dilakukan persimpangan: belum ada pembulatan kereb (sudut tetap siku), belum ada lajur belok atau pulau, ujung jalan samping dipotong siku terhadap alinyemennya sendiri, dan koridor yang dibangun dari templat membuka tepinya dengan cara sederhana yang sama (parit atau dinding pada kondisi ujungnya diratakan melintasi mulut, tanpa gorong-gorong). Untuk pembulatan kereb di denah, segitiga pandang, dan marka, lihat [Tanah, jalan, survei, tambang, dan tautan](topic:soils-roads-survey-mines-links).

## Belum dibuat

Target untuk kemiringan daylight belum tersedia. Untuk koridor yang berubah di sepanjang jalan, dengan kiri dan kanan dipisahkan, gunakan [Templat koridor](topic:corridor-templates). Lihat [Belum dibuat](topic:not-built-yet).
