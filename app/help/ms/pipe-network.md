---
title: Atur rangkaian paip graviti
summary: Lukis laluan paip saliran ribut atau kumbahan struktur demi struktur, tetapkan peraturan kecerunan, penutup dan turunan anda, biarkan CivilCraft menetapkan aras inver, dan betulkan masalah yang disenaraikannya.
keywords: pembina struktur, jenis struktur, struktur segi empat tepat, takungan kemasukan, bingkai, penutup, ketebalan dinding, item pustaka, rangkaian paip, saliran ribut, kumbahan, pembetung, struktur, lubang periksa, lubang masuk, aras inver, kecerunan, turunan, bibir, sump, paip graviti
from: 10a3c14d
---

Sesuatu projek mengandungi satu rangkaian paip graviti, saliran ribut atau kumbahan. Ia terdiri daripada struktur (lubang periksa, lubang masuk) dan paip lurus di antaranya. Aliran berjalan mengikut arah yang anda lukis. CivilCraft menyemak setiap paip dan struktur berdasarkan tiga peraturan yang anda tetapkan, dan boleh menetapkan setiap aras inver daripada peraturan itu.

## Lukis satu larian

Anda boleh melukis paip tanpa permukaan, tetapi bibir, penutup dan aras inver automatik memerlukannya.

1. Tekan {{key:P}}, atau klik {{ui:Paip}} dalam kumpulan **Reka bentuk**.
   Petunjuk berbunyi "Paip: klik struktur dari atas larian ke bawah (klik yang sedia ada untuk menyambungnya). Enter menamatkan."
2. Klik di mana struktur hulu diletakkan. Satu struktur diletakkan.
3. Klik setiap struktur seterusnya di hilir. Untuk menyambung kepada struktur yang sedia ada, klik padanya: bar status berbunyi "Disambungkan S3."
4. Tekan {{key:Enter}}.
   Paip dilukis, aras invernya ditetapkan daripada peraturan, dan bar status berbunyi, contohnya, "3 paip dilukis, 12", aras inver ditetapkan daripada peraturan; setiap semakan lulus."

Struktur baharu dinamakan S1, S2 … dengan diameter 48 in (1200 mm). Paip baharu dinamakan P1, P2 … dengan diameter 12 in (300 mm). Diameter dalam inci bagi projek kaki dan milimeter bagi projek meter.

Tamatkan dengan {{key:Enter}}. Klik dua kali juga berfungsi, tetapi apabila anda klik dua kali pada struktur sedia ada untuk menamatkan larian di situ, sambungan digugurkan: klik sekali, kemudian tekan {{key:Enter}}.

## Tetapkan peraturan anda

Apabila tiada apa dipilih, panel kanan (**Projek**) mempunyai blok **Rangkaian paip**:

| Tetapan | Nilai permulaan | Maksud |
|---|---|---|
| Jenis | Saliran ribut | {{ui:Saliran ribut}} atau {{ui:Kumbahan}}; ditulis ke LandXML |
| Kecerunan minimum | 0.50% | Setiap paip mesti menurun sekurang-kurangnya sebanyak ini |
| Penutup minimum | 2 ft (0.6 m) | Dari tanah ke puncak paip, sepanjang paip |
| Turunan dalam struktur | 0.10 ft (0.03 m) | Aras inver outlet mesti sekurang-kurangnya sejauh ini di bawah setiap aras inver masukan |

**Nilai permulaan ini ialah tempat letak sementara, bukan piawaian.** Tetapkan nilai yang diperlukan oleh agensi atau projek anda. Penutup diukur dari tanah ke puncak (aras inver ditambah diameter dalaman); ketebalan dinding tidak dikira. Di mana pelantar atau koridor digred, permukaan yang digred ialah tanah.

## Biarkan CivilCraft menetapkan aras inver

- {{ui:Tetapkan setiap invert daripada peraturan}} (dalam blok **Rangkaian paip**) menetapkan semua paip.
- {{ui:Tetapkan invert paipnya daripada peraturan}} (dengan satu paip dipilih) menetapkan paip itu sahaja.

Bekerja ke hilir, setiap larian bermula dengan sekurang-kurangnya penutup minimum di struktur atas, menurun sekurang-kurangnya kecerunan minimum, menurunkan sekurang-kurangnya turunan melalui setiap struktur, dan menjadi lebih dalam di mana sahaja tanah sepanjang paip akan meninggalkan penutup kurang daripada penutup minimum. Aras inver dibundarkan ke bawah kepada 0.01, tidak pernah ke atas. Bar status berbunyi "Invert ditetapkan: penutup minimum di bahagian atas setiap larian, sekurang-kurangnya kecerunan minimum, sekurang-kurangnya turunan dalam setiap struktur." atau menamakan apa yang tidak dapat dilakukannya.

## Sunting struktur dan paip

Klik struktur atau paip dengan {{ui:Pilih}} untuk melihatnya dalam panel kanan.

**Struktur**: **Nama**, **Bibir**, **Kedalaman sump**, **Diameter**, kemudian **Bibir digunakan**, **Sump**, **Easting** dan **Northing**, serta paip masuk dan keluar dengan inver-inver mereka.

- Biarkan **Bibir** kosong untuk mengambilnya daripada permukaan; kotak kemudian memaparkan nilai permukaan dalam warna kelabu. Taip nilai untuk menetapkan bibir.
- Seret grip struktur pada pelan untuk mengalihkannya. Paipnya mengikut; invertnya kekal seperti sebelumnya, jadi semak masalah selepas itu.

**Jenis**: pilih salah satu jenis struktur rangkaian (di bawah), atau tiada untuk struktur bulat dengan diameternya sendiri.

**Paip**: **Nama**, struktur yang ia berjalan di antaranya, **Diameter**, **Invert atas**, **Invert bawah**, kemudian **Panjang**, **Kecerunan** dan **Penutup minimum**.

Tekan {{key:Enter}} selepas setiap nilai.

## Baca dan betulkan masalah

Blok **Rangkaian paip** menyenaraikan setiap masalah (sehingga 40); klik satu untuk memilih paip atau struktur. Paip atau struktur yang dipilih menyenaraikan masalahnya sendiri. Jika tiada, ia berbunyi "Setiap paip dan struktur lulus peraturan."

| Mesej (contoh) | Apa yang perlu dilakukan |
|---|---|
| "P2 menaik (-0.40%)." atau "… mendatar …" | Tukar invert, atau tetapkannya daripada peraturan. |
| "P2 pada 0.30% lebih mendatar daripada minimum 0.50%." | Turunkan invert hilir atau naikkan invert hulu. |
| "P3 mempunyai 1.40 penutup 35 sepanjangnya, kurang daripada minimum 2." | Turunkan paip; tetapkan invertnya daripada peraturan. |
| "Dalam S3, P4 keluar pada 245.20, kurang daripada 0.1 di bawah P3 masuk pada 245.25." | Turunkan invert atas paip outlet. |
| "Puncak P1 berada di atas bibir S1." | Paip terlalu tinggi untuk struktur. |
| "S2 mempunyai 2 paip keluar daripadanya; rangkaian graviti sepatutnya mempunyai satu jalan keluar bagi setiap struktur." | Alih keluar satu paip keluar, atau lukis semula mengikut arah yang betul. |
| "Paip membentuk gelung; aliran mesti berakhir di outlet." | Larian dilukis kembali kepada dirinya; padam satu paip. |
| "S5 berada di luar permukaan dan tiada aras bibir." | Taip bibir, atau alihkan struktur ke atas permukaan. |
| "P6 sebahagiannya berada di luar permukaan; penutup di situ tidak diketahui." | Lanjutkan permukaan, atau terima bahawa penutup tidak disemak di situ. |
| "P7 belum mempunyai invert." | Taip invertnya, atau tetapkannya daripada peraturan. |

Paip dan struktur bermasalah juga ditandakan dengan merah pada pelan.

## Jenis struktur

Jenis struktur ialah struktur yang dibina daripada parameternya: lubang periksa, lubang masuk, kotak simpang atau outlet, **bulat** (diameter dalaman) atau **segi empat tepat** (lebar dan panjang dalaman), dengan **ketebalan dinding**, **papak lantai**, **sump** di bawah paip terendah dan **bingkai dan penutup** (bukaan bulat atau segi empat tepat, ketinggian bingkai). Jenis tergolong dalam rangkaian, di bawah **Jenis struktur** dalam Sifat projek.

1. Klik {{ui:Jenis struktur baharu}}. Kotak dialog melukis struktur dalam pelan dan dalam keratan semasa anda menaip.
2. Klik {{ui:Tambah jenis}}.
3. Pilih struktur dan pilih jenis di bawah **Jenis**. Ia mengambil saiz dan sump jenis itu; sump sendiri masih boleh diubah.

Sunting jenis dan setiap struktur jenis itu mengikut saiznya. Alih keluar jenis dan strukturnya kekal sebagai struktur bulat dengan lebar yang sama. Setiap perubahan ialah satu langkah: {{key:Mod+Z}} membatalkannya.

Struktur segi empat tepat dilukis pada pelan, dalam DXF, DWG dan PDF, dan dalam 3D sebagai segi empat tepat dengan panjangnya di sepanjang paip outletnya; paip bermula di dindingnya. LandXML menulisnya sebagai struktur segi empat tepat (`RectStruct`) dengan ketebalan dindingnya, dan membaca semula struktur sedemikian sebagai jenis.

### Kongsi jenis melalui pustaka

{{ui:Simpan sebagai item pustaka}} menulis jenis itu sebagai item pustaka CadCraft (fail `.json`): simbol pelannya, badan 3D kepada kedalaman tipikal, dan setiap saiz. Muat naik ke pustaka untuk berkongsinya. {{ui:Buka item pustaka}} membaca semula struktur yang disimpan dengan cara ini ke dalam rangkaian, ditukar kepada unit projek. Item pustaka yang bukan struktur yang dibuat dalam CivilCraft ditolak, dengan sebabnya.

## Padam

Pilih paip dan tekan {{key:Delete}} untuk mengalihkannya. Memadam struktur turut mengalih keluar paip yang bersambung dengannya. Pada Mac, tekan Fn dan padam, atau klik {{ui:Padam}}.

## Belum dibina

Aliran, saiz paip dan garis kecerunan hidraulik ada dalam [Saliran ribut](topic:storm-drainage). Katalog paip, paip bukan bulat, paip dalam paparan profil, paip melengkung dan lebih daripada satu rangkaian bagi setiap projek belum tersedia. Lihat [Belum dibina](topic:not-built-yet).
