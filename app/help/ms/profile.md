---
title: Reka bentuk profil menegak
summary: Buka paparan profil, mulakan profil reka bentuk daripada tanah, tambah dan seret PVI, tetapkan panjang lengkung menegak, dan baca kecerunan, nilai K serta titik tinggi dan rendah.
keywords: profil, penjajaran menegak, pvi, lengkung menegak, kecerunan, nilai k, puncak, cekung, bvc, evc, paparan profil, kecerunan siap, fg, profil tanah sedia ada, garis ciri dalam profil, persilangan, diunjur, kerb, parit, label
from: dbb1f32d
---

Setiap penjajaran mempunyai satu profil reka bentuk: senarai PVI (stesen dan aras) yang dihubungkan oleh kecerunan lurus, dengan lengkung menegak parabola simetri di mana-mana PVI dalaman yang mempunyai panjang. Profil tanah sedia ada disampel daripada permukaan untuk anda.

## Buka paparan profil

1. Pilih penjajaran (klik dengan {{ui:Pilih}}).
2. Tekan {{key:R}}, atau klik {{ui:Profil}} pada bar alat, atau {{ui:Pandangan profil}} di bahagian bawah panel kanan.
   Paparan profil dibuka di bawah pelan dengan tanah sedia ada sepanjang penjajaran. Dengan dua atau lebih penjajaran, pilih satu dalam senarai di sebelah kiri bar profil.

Paparan bermula dengan menunjukkan keseluruhan penjajaran dan meregangkan aras untuk memenuhi panel; pembesaran ditunjukkan di sudut kiri bawah, contohnya "Pembesaran menegak 10×".

## Zum dan pan profil

- **Zum:** pusingkan roda tetikus (atau cubit pada pad sentuh) dan paparan menzum sekitar penunjuk. Tahan {{key:Shift}} untuk zum stesen sahaja, atau {{key:Alt}} untuk zum aras sahaja (itu menukar pembesaran). Dengan paparan profil difokuskan, kekunci tambah dan tolak menzum dari tengah.
- **Pan:** seret dengan butang tetikus kanan atau tengah, atau leret dengan dua jari pada pad sentuh.
- **Muat:** klik dua kali pada profil atau tekan {{key:F}} untuk menunjukkan seluruh penjajaran semula.

Menyunting PVI mengekalkan zum yang anda pilih; ia tidak melompat kembali ke muat.

Gerakkan penunjuk di sepanjang profil: bar menunjukkan stesen, aras tanah dan reka bentuk, kecerunan serta potongan atau tambakan di situ, dan titik mengikuti pada penjajaran dalam pelan.

## Mulakan profil reka bentuk

1. Dalam panel kanan di bawah **Profil reka bentuk**, klik {{ui:Mula dari tanah sedia ada}}.
   Dua PVI diletakkan di atas tanah pada dua hujung penjajaran, dihubungkan oleh satu kecerunan lurus. Bar status berkata "Profil reka bentuk dimulakan di tanah pada kedua-dua hujung. Hidupkan Tambah PVI dan klik untuk menambah titik perubahan kecerunan; beri panjang lengkung dalam jadual."

Jika penjajaran tidak merentasi permukaan, anda akan mendapat "Penjajaran ini tiada tanah di bawahnya untuk dimulakan." Kemudian tambah PVI dengan klik sebaliknya (bahagian seterusnya).

## Tambah PVI

1. Tekan {{key:I}}, atau klik {{ui:Tambah PVI}} dalam bar profil. Ia kekal ditekan.
2. Klik dalam profil di tempat anda mahu titik perubahan kecerunan. Satu PVI ditambah pada stesen dan aras itu, dibundarkan kepada 0.01, dan dipilih.
3. Tambah seberapa banyak yang anda perlukan, kemudian tekan {{key:I}} sekali lagi untuk berhenti menambah.

Klik di tempat yang sudah ada PVI ditolak ("Sudah ada PVI di …"). PVI sentiasa kekal dalam tertib stesen.

## Snap semasa menambah atau menyeret

Butang **Snap** dalam bar profil dihidupkan pada permulaan. Semasa ia hidup, PVI yang anda tambah atau seret jatuh pada PVI terdekat, titik tanah, stesen PVI atau garis tanah, dan label di sebelah penanda menyatakan yang mana. Tahan {{key:Alt}} untuk titik bebas, di mana-mana.

## Laraskan PVI

- **Seret** PVI dalam profil untuk mengalihkannya. Ia tidak boleh melepasi jirannya. Pengalihan ialah satu langkah buat asal.
- **Taip** nilai tepat dalam jadual PVI dalam panel kanan: **Stesen**, **Aras**, **Cerun %** dan **Lengkung L** (panjang lengkung menegak). Tekan {{key:Enter}} selepas setiap satu.
- **Pilih** nilai daripada profil: butang kecil di sebelah stesen atau aras PVI menunggu satu klik dalam paparan profil dan mengisi nilai itu. Klik itu melekat seperti Tambah PVI; tahan {{key:Alt}} untuk titik bebas; {{key:Esc}} membatalkan.
- **Cerun %** ialah kecerunan tangen yang bermula pada PVI itu dan berjalan ke yang seterusnya. Menaipnya mengalihkan aras PVI **seterusnya** (stesennya tidak pernah beralih). Jika PVI seterusnya dikunci, aras PVI sebelumnya beralih sebaliknya.
- **Kunci** PVI dengan mangga kunci di hujung barisnya. PVI yang dikunci tidak diseret, dan suntingan cerun tidak mengalihkannya. Jika kedua-dua hujung tangen dikunci, cerunnya tidak boleh berubah: bar status menyatakannya, dan anda buka kunci satu hujung dahulu. Kunci disimpan dalam fail.
- **Alih keluar** PVI dengan x di hujung barisnya, atau pilih (klik) dan tekan {{key:Delete}}. Apabila paparan profil mempunyai fokus, {{key:Backspace}} juga mengalih keluarnya.

PVI pertama dan terakhir tidak sekali-kali mengambil lengkung.

## Lengkung menegak

1. Taip panjang dalam **Lengkung L** bagi PVI dalaman, contohnya 200.
2. Lengkung dilukis berpusat pada PVI. Profil dan panel kanan menunjukkan jenisnya (puncak atau cekung), L dan K, stesen dan aras BVC dan EVC, serta titik tinggi atau rendahnya apabila ada di dalam lengkung.

K dikira daripada L (K = L dibahagi perbezaan algebra kecerunan, dalam peratus). Anda taip L; menaip K secara langsung belum tersedia.

Jika lengkung menegak tidak muat, kotak merah menyatakan sebabnya: ia terlanggar ke belakang PVI atau lengkung sebelumnya, atau melepasi PVI seterusnya, dan berapa banyak ruang di sebelah itu (lengkung memerlukan separuh panjangnya di setiap sisi PVInya). Butangnya menetapkan **lengkung terpanjang yang muat**, dengan K-nya, sebagai satu langkah ({{key:Mod+Z}} membuat asalnya). Atau alihkan PVI berjauhan.

## Baca faktanya

Di bawah jadual PVI, senarai memberi setiap kecerunan dalam peratus ("Kecerunan 1: +1.25%") dan setiap lengkung, contohnya "Puncak pada 2+00.00: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)", kemudian "Titik tinggi 1+62.40, 254.12".

Jika PVI tidak mencapai kedua-dua hujung penjajaran, nota menyatakannya. Koridor hanya dibina di tempat profil dan penjajaran bertindih.

## Garis ciri dalam profil

Garis ciri turut ditunjukkan dalam paparan profil, supaya anda dapat melihat kerb, parit atau bahagian atas dinding berbanding profil jalan.

- Di tempat garis ciri **merentasi** penjajaran, profil menunjukkan satu berlian kecil pada stesen dan aras itu, dilabelkan dengan nama garis dan arasnya di situ (aras garis itu sendiri, dikira sepanjang segmen yang merentas).
- Taip jarak dalam {{ui:Bersebelahan dalam}} untuk turut melukis garis ciri yang **berjalan di sebelah** penjajaran dalam jarak itu, sebagai garis putus-putus pada aras masing-masing. Kosong atau 0 hanya menunjukkan persilangan.
- Tanda dan label mengikut setiap perubahan: alihkan bucu, taip kecerunan atau naikkan garis, dan profil menunjukkan aras baharu serta-merta.
- Klik berlian persilangan untuk memilih garis ciri itu; garis yang dipilih dilukis dalam warna sorotan.
- {{ui:Garis ciri}} dalam bar profil menyembunyikan atau menunjukkan semuanya. Kedua-dua tetapan disimpan bersama projek.

Lihat [Garis ciri](topic:feature-lines).

## Seterusnya

- [Sweep koridor jalan](topic:corridor) sepanjang penjajaran dan profil ini.
- Profil ditulis ke LandXML bersama penjajaran; lihat [Tukar LandXML](topic:landxml).
