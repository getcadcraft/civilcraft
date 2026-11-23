---
title: Turapan, dinding dan tangga
summary: Turapan dengan kecerunan ke longkang atau cerun silang, corak dan binaannya; laluan yang mengikut tanah; dinding penahan dan dinding berdiri bebas dengan asas bertangga; kerb; ramp dan tangga yang disemak mengikut hadnya; IFC keluar.
keywords: landskap keras, turapan, batu turapan, patio, teres, kecerunan, longkang, cerun silang, tulang ikan, ikatan bata, laluan, jalan pejalan kaki, dinding penahan, dinding taman, asas, kemuncak dinding, kerb, tepi, ramp, kebolehcapaian, tangga, anak tangga, tegak, tapak, pendaratan
from: d34b4466
---

Landskap keras dikira semula daripada tanah setiap kali, jadi ia mengikut rupa bumi dan dijana semula apabila tanah atau garisnya beralih. Seret bucunya pada pelan seperti mana-mana garis. Buka dari {{ui:Landskap keras}} dalam kumpulan Landskap.

## Turapan

Klik bucu dan tekan {{key:Enter}}. Dalam Sifat:

- **Aras**: kosong = purata tanah di bawahnya.
- **Kecerunan**: mendatar, **cerun silang** (% ke arah tertentu) atau **ke longkang**: CivilCraft meminta anda klik di mana longkang diletakkan, kemudian setiap bucu naik dari longkang pada kecerunan itu. Anak panah pada pelan menunjukkan kecerunan.
- **Corak** (grid, ikatan bata, tulang ikan) dengan saiz unit, sambungan dan sudut; lebar **Pinggiran**. Pada helaian, sambungan yang lebih dekat daripada satu milimeter tidak dimasukkan.
- Turapan ialah sebahagian daripada permukaan dicadangkan. Lapisannya (batu turapan, alas, asas) dimasukkan ke dalam IFC dan kuantiti.

## Laluan

Klik sepanjang laluan dan tekan {{key:Enter}}. Ia mengikut tanah, dengan **Cerun silang** ke sisi kanannya. Laluan yang lebih curam daripada **Paling curam dibenarkan** ditanda `!` pada pelan di tempat ia berada, dan Sifat menyatakan betapa curamnya.

Apabila laluan bertemu jalan yang dibina oleh koridor, ia berhenti di tepi luar jalan, sama aras dengan kaki lima atau bahu di situ, dalam permukaan dicadangkan dan dalam paparan 3D. Laluan yang merentasi jalan digredkan dan ditunjukkan sebagai dua bahagian, dan hujung yang dilukis sehingga dua kali lebar laluan pendek dari jalan dibawa terus ke tepinya. Pelan masih menunjukkan laluan seperti yang anda lukis, dan panjang serta luasnya mengira keseluruhan garisan. Lihat [Sweep koridor jalan](topic:corridor).

## Dinding

Klik sepanjang dinding dan tekan {{key:Enter}}. Dinding ialah **penahan** atau **berdiri bebas**. Tanpa **Atas**, ia berdiri setinggi **Ketinggian** di atas tanah sepanjang laluannya; taip bahagian atas untuk mengekalkannya mendatar. **Asasnya** terletak pada kedalaman tetap di bawah tanah dan menurun dalam langkah penuh, jadi ia kekal mendatar di antaranya. Sifat memberi panjang, ketinggian, luas muka dan langkah asasnya; pelan melabelkan bahagian atas dan bawah dinding (TW / BW) di setiap hujung.

:::warning
Dinding penahan yang lebih tinggi daripada 1.2 m (4 ft) ditandakan: seorang jurutera mereka bentuknya.
:::

## Kerb

Klik sepanjang kerb dan tekan {{key:Enter}}; tetapkan lebarnya dan ketinggian menegaknya.

## Ramp

Klik dari bawah ke atas dan tekan {{key:Enter}}. Aras diambil daripada tanah di setiap hujung melainkan anda menaipnya. Ramp mendapat pendaratan setiap kenaikan 750 mm (2.5 ft) dan disemak dengan **Paling curam dibenarkan** (1:12 untuk permulaan) dan lebar minimum; Sifat menyatakan berapa panjang yang diperlukannya.

## Tangga

Klik tepi hadapan anak tangga bawah, kemudian di tempat tangga sampai ke atas, dan tekan {{key:Enter}}. Bilangan tegak datang daripada ketinggian dan **Tegak terbesar**; langkah daripada peraturan keselesaan 2R + G ≈ 630 mm, tidak sekali-kali di bawah **Langkah terkecil**; pendaratan setiap **Tegak setiap rangkaian paling banyak**. Sifat menyatakan sama ada ia muat di antara kedua-dua titik atau berapa panjang lagi yang diperlukan.

:::note
Had untuk ramp dan tangga ialah nilai lalai yang dilabelkan. Tetapkan yang diperlukan oleh kod bangunan anda.
:::

## Di luar CivilCraft

- Lagi › {{ui:Eksport IFC landskap}}: turapan dan laluan sebagai `IfcPavement`, dinding sebagai `IfcWall` (dinding penahan sebagai RETAININGWALL) dengan lapisannya, kerb sebagai `IfcKerb`, ramp sebagai `IfcRamp`, tangga sebagai `IfcStair` dengan tegak dan tapaknya.
- **Hantar ke TakeoffCraft** bagi jadual tumbuhan membawa luas turapan dan isipadu lapisan, luas dan panjang muka dinding, panjang kerb dan bilangan tangga.
- Helaian butiran melukis keratan setiap dinding, binaan setiap turapan dan setiap rangkaian tangga. Lihat [Helaian landskap](topic:landscape-sheets).
