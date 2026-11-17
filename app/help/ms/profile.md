---
title: Reka bentuk profil menegak
summary: Buka pandangan profil, mulakan profil reka bentuk daripada tanah sedia ada, tambah dan seret PVI, tetapkan panjang lengkung menegak, dan baca kecerunan, nilai K serta titik tinggi dan rendah.
keywords: profil, penjajaran menegak, pvi, lengkung menegak, kecerunan, nilai k, puncak, lembah, bvc, evc, pandangan profil, aras siap, fg, profil tanah sedia ada, garis ciri dalam profil, persilangan, diunjurkan, kerb, parit, label
from: e9182bfa
---

Setiap penjajaran mempunyai satu profil reka bentuk: senarai PVI (stesen dan ketinggian) yang disambungkan oleh kecerunan lurus, dengan lengkung menegak parabola simetri pada mana-mana PVI dalaman yang mempunyai panjang. Profil tanah sedia ada disampel daripada permukaan untuk anda.

## Buka pandangan profil

1. Pilih penjajaran (klik dengan {{ui:Pilih}}).
2. Tekan {{key:R}}, atau klik {{ui:Profil}} dalam bar alat, atau {{ui:Pandangan profil}} di bahagian bawah panel kanan.
   Pandangan profil dibuka di bawah pelan dengan tanah sedia ada di sepanjang penjajaran. Dengan dua penjajaran atau lebih, pilih satu dalam senarai di sebelah kiri bar profil.

Pandangan sentiasa menunjukkan keseluruhan penjajaran dan meregangkan ketinggian untuk memenuhi panel; eksagerasi dicetak di sudut kiri bawah, contohnya "Pembesaran menegak 10×". Ia tidak zum atau pan.

Gerakkan penunjuk di sepanjang profil: bar menunjukkan stesen, ketinggian tanah dan reka bentuk, kecerunan serta tebuk atau timbus di situ, dan titik mengikuti pada penjajaran dalam pelan.

## Mulakan profil reka bentuk

1. Dalam panel kanan di bawah **Profil reka bentuk**, klik {{ui:Mula dari tanah sedia ada}}.
   Dua PVI diletakkan di atas tanah pada dua hujung penjajaran, disambungkan oleh satu kecerunan lurus. Bar status berkata "Profil reka bentuk dimulakan pada tanah sedia ada di kedua-dua hujung. Hidupkan Tambah PVI dan klik untuk menambah titik pecah kecerunan; beri panjang lengkung dalam jadual."

Jika penjajaran tidak merentasi permukaan, anda mendapat "Penjajaran ini tiada tanah di bawahnya untuk dimulakan." Kemudian tambah PVI dengan klik sebaliknya (bahagian seterusnya).

## Tambah PVI

1. Tekan {{key:I}}, atau klik {{ui:Tambah PVI}} dalam bar profil. Ia kekal ditekan.
2. Klik dalam profil di tempat anda mahu titik pecah kecerunan. PVI ditambah pada stesen dan ketinggian itu, dibundarkan kepada 0.01, dan dipilih.
3. Tambah seberapa banyak yang diperlukan, kemudian tekan {{key:I}} sekali lagi untuk berhenti menambah.

Klik di tempat yang sudah ada PVI ditolak ("Sudah ada PVI di …"). PVI sentiasa kekal dalam susunan stesen.

## Laraskan PVI

- **Seret** PVI dalam profil untuk mengalihkannya. Ia tidak boleh melepasi jirannya. Pengalihan ialah satu langkah buat asal.
- **Taip** nilai tepat dalam jadual PVI dalam panel kanan: **Stesen**, **Ketinggian** dan **Lengkung L** (panjang lengkung menegak). Tekan {{key:Enter}} selepas setiap satu.
- **Alih keluar** PVI dengan x di hujung barisnya, atau pilih ia (klik) dan tekan {{key:Delete}}. Apabila pandangan profil mempunyai fokus, {{key:Backspace}} turut mengalih keluarnya.

PVI pertama dan terakhir tidak pernah menerima lengkung.

## Lengkung menegak

1. Taip panjang dalam **Lengkung L** untuk PVI dalaman, contohnya 200.
2. Lengkung dilukis berpusat pada PVI. Profil dan panel kanan menunjukkan jenisnya (puncak atau lembah), L dan K, stesen dan ketinggian BVC serta EVC, serta titik tinggi atau rendahnya apabila ada satu dalam lengkung.

K dikira daripada L (K = L dibahagi dengan beza algebra kecerunan, dalam peratus). Anda taip L; menaip K terus belum tersedia.

Jika lengkung menegak tidak muat, kotak merah menerangkan sebabnya: ia berjalan kembali ke dalam PVI atau lengkung sebelumnya, atau melepasi PVI seterusnya, dan berapa banyak ruang di sebelah itu (lengkung memerlukan separuh panjangnya di setiap sisi PVInya). Butangnya menetapkan **lengkung terpanjang yang muat**, dengan K-nya, sebagai satu langkah ({{key:Mod+Z}} membuat asalnya). Atau alihkan PVI berjauhan.

## Baca fakta

Di bawah jadual PVI, senarai memberikan setiap kecerunan dalam peratus ("Kecerunan 1: +1.25%") dan setiap lengkung, contohnya "Puncak pada 2+00.00: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)", kemudian "Titik tinggi 1+62.40, 254.12".

Jika PVI tidak mencapai kedua-dua hujung penjajaran, nota memberitahu anda. Koridor hanya dibina di tempat profil dan penjajaran bertindih.

## Garis ciri dalam profil

Garis ciri turut dipaparkan dalam pandangan profil, supaya anda dapat melihat kerb, parit atau puncak dinding terhadap profil jalan.

- Di tempat garis ciri **merentasi** penjajaran, profil menunjukkan berlian kecil pada stesen dan ketinggian itu, dilabelkan dengan nama garisan dan ketinggiannya di situ (ketinggian garisan itu sendiri, dikira sepanjang segmen yang merentas).
- Taip jarak dalam {{ui:Bersebelahan dalam}} untuk turut melukis garis ciri yang **berjalan di sebelah** penjajaran dalam jarak itu, sebagai garis putus-putus pada ketinggian masing-masing. Kosong atau 0 hanya menunjukkan persilangan.
- Tanda dan label mengikuti setiap perubahan: alihkan bucu, taip kecerunan atau naikkan garisan, dan profil menunjukkan ketinggian baharu serta-merta.
- Klik berlian persilangan untuk memilih garis ciri itu; garisan terpilih dilukis dalam warna sorotan.
- {{ui:Garis ciri}} dalam bar profil menyembunyikan atau menunjukkan semuanya. Kedua-dua tetapan disimpan bersama projek.

Lihat [Garis ciri](topic:feature-lines).

## Seterusnya

- [Sapu koridor jalan](topic:corridor) sepanjang penjajaran dan profil ini.
- Profil ditulis ke LandXML bersama penjajaran; lihat [Tukar LandXML](topic:landxml).
