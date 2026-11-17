---
title: Turapan, dinding dan tangga
summary: Turapan dengan kejatuhan ke longkang atau kecerunan silang, corak dan binaannya; laluan yang mengikut tanah; dinding penahan dan dinding berdiri bebas dengan tapak asas berperingkat; kerb; tanjakan dan tangga yang disemak mengikut hadnya; IFC keluar.
keywords: landskap keras, turapan, jubin, patio, teres, kejatuhan, longkang, kecerunan silang, corak tulang ikan, ikatan stretcher, laluan, lorong pejalan kaki, dinding penahan, dinding taman, tapak asas, penutup, kerb, curb, pinggir, tanjakan, kebolehcapaian, tangga, anak tangga, tegak, tapak tangga, pendaratan
from: 51475877
---

Landskap keras dikira semula daripada tanah setiap kali, jadi ia mengikut rupa bumi dan dijana semula apabila tanah atau garisnya beralih. Seret bucunya pada pelan seperti mana-mana garisan. Buka daripada {{ui:Landskap keras}} dalam kumpulan Landskap.

## Turapan

Klik bucu dan tekan {{key:Enter}}. Dalam **Sifat**:

- **Aras**: kosong = purata tanah di bawahnya.
- **Kejatuhan**: aras, **kecerunan silang** (% ke arah tertentu) atau **ke longkang**: CivilCraft meminta anda klik tempat longkang itu, kemudian setiap bucu naik dari longkang pada kejatuhan itu. Anak panah pada pelan menunjukkan kejatuhan.
- **Corak** (grid, ikatan stretcher, tulang ikan) dengan saiz unit, sambungan dan sudut; lebar **Pinggir**. Pada helaian, sambungan yang kurang daripada satu milimeter ditinggalkan.
- Turapan ialah sebahagian daripada permukaan yang dicadangkan. Lapisannya (jubin, lapisan alas, asas) masuk ke dalam IFC dan kuantiti.

## Laluan

Klik sepanjang laluan dan tekan {{key:Enter}}. Ia mengikut tanah, dengan **Kecerunan silang** ke sebelah kanannya. Laluan yang lebih curam daripada **Cerun paling curam dibenarkan** ditandai `!` pada pelan di tempat ia berada, dan Sifat memberitahu betapa curamnya.

## Dinding

Klik sepanjang dinding dan tekan {{key:Enter}}. Dinding ialah **penahan** atau **berdiri bebas**. Tanpa **Atas**, ia berdiri setinggi **Ketinggian** di atas tanah sepanjang laluannya; taip bahagian atas untuk memegangnya rata. **Tapak asas** terletak pada kedalaman tetap di bawah tanah dan turun dalam langkah penuh, jadi ia kekal rata di antara langkah-langkah tersebut. Sifat memberikan panjangnya, ketinggian, luas muka dan langkah tapak asasnya; pelan melabelkan bahagian atas dan bawah dinding (TW / BW) di setiap hujung.

:::warning
Dinding penahan yang lebih tinggi daripada 1.2 m (4 ft) ditandai: jurutera yang mereka bentuknya.
:::

## Kerb

Klik sepanjang kerb dan tekan {{key:Enter}}; tetapkan lebar dan ketinggian timbulnya.

## Tanjakan

Klik dari bawah ke atas dan tekan {{key:Enter}}. Aras diambil daripada tanah di setiap hujung melainkan anda menaipnya. Tanjakan mendapat pendaratan setiap kenaikan 750 mm (2.5 ft) dan disemak terhadap **Cerun paling curam dibenarkan** (1:12 sebagai permulaan) serta lebar minimum; Sifat memberitahu berapa panjang ia perlukan.

## Tangga

Klik tepi hadapan anak tangga bawah, kemudian tempat tangga sampai ke atas, dan tekan {{key:Enter}}. Bilangan tegak datang daripada ketinggian dan **Tegak terbesar**; langkah (going) daripada peraturan keselesaan 2R + G ≈ 630 mm, tidak pernah kurang daripada **Langkah terkecil**; pendaratan setiap **Tegak setiap penerbangan paling banyak**. Sifat memberitahu sama ada ia muat antara dua titik atau berapa panjang lagi ia perlukan.

:::note
Had untuk tanjakan dan tangga ialah nilai lalai berlabel. Tetapkan yang dikehendaki oleh kod bangunan anda.
:::

## Di luar CivilCraft

- Lagi › {{ui:Eksport IFC landskap}}: turapan dan laluan sebagai `IfcPavement`, dinding sebagai `IfcWall` (dinding penahan sebagai RETAININGWALL) dengan lapisannya, kerb sebagai `IfcKerb`, tanjakan sebagai `IfcRamp`, tangga sebagai `IfcStair` dengan tegak dan tapaknya.
- **Hantar ke TakeoffCraft** pada jadual tanaman membawa luas turapan dan isipadu lapisan, luas muka dinding dan panjangnya, panjang kerb serta bilangan langkah tangga.
- Helaian perincian melukis keratan setiap dinding, binaan setiap turapan dan setiap penerbangan tangga. Lihat [Helaian landskap](topic:landscape-sheets).
