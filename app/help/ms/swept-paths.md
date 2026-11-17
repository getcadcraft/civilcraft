---
title: Laluan sapuan kenderaan
summary: Pandu kenderaan dengan sehingga tiga treler sepanjang garisan ciri atau penjajaran, ke hadapan atau mengundur, dan lihat kawasan yang disapunya, laluan rodanya, kawalan stereng dan tempat ia terlipat.
keywords: laluan sapuan, laluan pusingan, penjejakan kenderaan, templat pusingan, kenderaan reka bentuk, trak, bas, treler, semitreler, mengundur, undur, terlipat, artikulasi, kunci stereng, offtracking, laluan roda, dok pemuatan, jejari pusingan
from: 8caafb8a
---

Laluan sapuan memandu kenderaan sepanjang garisan dan menunjukkan tanah yang dilalui badannya. Gunakannya untuk menyemak sama ada trak boleh membelok di sudut, sampai ke dok pemuatan atau mengundurkan treler ke tempatnya tanpa keluar dari turapan.

## Pandu kenderaan sepanjang garisan

1. Lukis garisan yang diikuti kenderaan, mengikut arah perjalanan: garisan ciri (lengkung tidak mengapa: tekan {{key:C}} semasa melukisnya, lihat [Garisan ciri](topic:feature-lines)) atau penjajaran.
2. Pilih garisan itu dan klik {{ui:Laluan sapuan…}} dalam **Sifat**nya.
3. Di bawah **Mula dari**, pilih kenderaan, kemudian tetapkan saiznya daripada kenderaan reka bentuk anda sendiri: lebar, lebihan depan, jarak gandar, lebihan belakang, lebar jejak dan **Kunci stereng**. Tambah sehingga tiga treler, setiap satu dengan tempat ia disambung, panjangnya dari gandingan ke gandarnya, lebihannya dan **Artikulasi terbesar**.
4. Pilih **Pemanduan**: ke hadapan atau mengundur. Klik {{ui:Pandu}}.

:::warning
Kenderaan permulaan ialah nilai sementara, bukan piawaian. Tetapkan saiz daripada kenderaan reka bentuk yang digunakan oleh projek anda.
:::

## Ke hadapan dan mengundur

| Pemanduan | Apa yang mengikuti garisan | Apa yang CivilCraft kira |
|---|---|---|
| **Ke hadapan** | Pusat gandar depan | Di mana gandar belakang dan setiap treler pergi, sudut stereng dan artikulasi |
| **Mengundur** | Pusat gandar terakhir (bahagian belakang treler) | Di mana setiap unit di hadapan pergi, dan stereng yang diperlukan kabin untuk meletakkan treler di sana |

Mengundur ialah cara pergerakan undur diperiksa: nyatakan di mana treler patut pergi, dan CivilCraft memberitahu sama ada kabin boleh melakukannya.

## Baca hasil

Laluan sapuan dilukis pada pelan dalam warna jingga: garis luarnya dan, putus-putus, laluan roda terluar. Pilih (klik di dalamnya) untuk melihat dalam **Sifat**:

- **Panjang dipandu**, sudut **Stereng** terbesar dan **Artikulasi** berbanding had mereka, dan **Luas sapuan**.
- Sebarang masalah sepanjang garisan, dengan jaraknya: stereng melebihi kunci, atau treler membelok melebihi had artikulasinya (ia terlipat).
- **Kenderaan sepanjang garisan**: gerakkan peluncur untuk melihat kenderaan di mana-mana titik, dengan stereng dan artikulasinya di situ.

Ubah garisan dan laluan sapuan mengikutinya. {{ui:Sunting kenderaan…}} menukar saiz; **Pemanduan** bertukar antara ke hadapan dan mengundur. Setiap perubahan ialah satu langkah: {{key:Mod+Z}} membuat asalnya. {{key:Delete}} memadamkan laluan sapuan yang dipilih (garisan kekal).

Garis besar dan laluan roda pergi ke PDF, DXF dan DWG pada lapisan C-ROAD-SWPT.

## Cara ia dikira

Setiap unit berpusing mengelilingi garis gandar belakangnya dan diseret oleh titik di hadapannya (gandar depan, atau gandingan), iaitu model kelajuan rendah tanpa gelincir yang digunakan oleh semakan laluan sapuan. Kawasan sapuan ialah semua garis luar badan pada setiap kedudukan digabungkan. Ia tidak memodelkan kelajuan, gelincir tayar, masa stereng untuk membelok, stereng treler, atau kelegaan di bawah badan.
