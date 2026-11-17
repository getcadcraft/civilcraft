---
title: Menu, kekunci dan tetikus
summary: Pilih gaya menu yang sepadan dengan cara anda sudah bekerja, beri mana-mana arahan kekunci anda sendiri, pindahkan arahan antara tab reben, dan tetapkan apa yang dilakukan roda dan butang tetikus dalam pelan dan dalam 3D.
keywords: gaya menu, menu, reben, reben civil, bar alat, baris arahan, klasik lukisan, pintasan papan kekunci, pintasan, kekunci, sesuaikan, petakan semula, tetikus, roda, invert, arah zum, butang tengah, butang kanan, pan, orbit, eksport, import, bertukar, biasa
from: 07ac73a0
---

Arahan CivilCraft adalah sama tidak kira bagaimana anda mencapainya. **Gaya menu** hanya menentukan di mana arahan itu berada pada skrin, apa namanya di sana dan kekunci mana yang menjalankannya, supaya anda boleh mengekalkan tabiat sedia ada. Pilih satu dalam {{ui:Tetapan}} ({{key:Mod+,}}) › {{ui:CivilCraft}} › {{ui:Menu, kekunci dan tetikus}}; perubahan berkuat kuasa serta-merta, dan pelayar ini mengingatinya.

## Tiga gaya

| Gaya | Yang anda dapat |
|---|---|
| {{ui:CivilCraft}} | Bar alat CivilCraft sendiri (Fail, Eksport, Permukaan, Reka bentuk, Sunting, GIS, Pandangan) dan kekunci tunggal: {{key:A}} penjajaran, {{key:G}} pelantar, {{key:P}} paip, {{key:B}} garis putus, {{key:O}} sempadan, {{key:L}} garis ciri, {{key:R}} profil, {{key:X}} keratan, {{key:E}} kecerunan, {{key:D}} 3D, {{key:F}} muat, {{key:V}} pilih. Permulaan. |
| {{ui:Klasik lukisan}} | Reben kecil ({{ui:Laman utama}}, {{ui:Selit}}, {{ui:Output}}) dan baris arahan, untuk orang yang menaip arahan: ALIGNMENT, PAD, PIPE, FEATURELINE, BREAKLINE, PROFILE, SECTIONS, U (buat asal), ZOOM, 3D, PLOT, LANDXML, XATTACH, MAPIMPORT, HELP. Mula menaip di mana-mana dan huruf dihantar ke baris arahan; {{key:Enter}} menjalankan, {{key:Enter}} tanpa apa-apa mengulang arahan terakhir, {{key:Esc}} mengosongkannya. Butang tengah melakukan pan. |
| {{ui:Reben civil}} | Tab butang besar seperti program reka bentuk civil mengumpulkan alatnya: {{ui:Laman utama}} (data tanah, cipta reka bentuk, pandangan profil dan keratan), {{ui:Permukaan}}, {{ui:Ubah suai}}, {{ui:Geolokasi}}, {{ui:Pandangan}} dan {{ui:Output}}, dengan menu {{ui:Fail}} dan butang pantas di sebelah kanan. Kekunci tunggal kekal. Butang tengah melakukan pan pada pelan; dalam 3D butang tengah melakukan pan dan {{key:Shift}} dengan butang tengah melakukan orbit. |

Setiap gaya mengekalkan kekunci {{key:Mod}}: {{key:Mod+Z}}, {{key:Mod+Y}}, {{key:Mod+S}}, {{key:Mod+O}}, {{key:Mod+P}}, {{key:Mod+C}}, {{key:Mod+X}}, {{key:Mod+V}}, {{key:Mod+D}}, {{key:Mod+A}}.

:::tip
Kekunci yang tergolong dalam susun atur CivilCraft tetapi telah diberikan kepada arahan lain oleh gaya anda tidak melakukan apa-apa, dan bar status menyatakan ke mana arahannya pergi ("Dalam Kekunci saya, Pad ialah Ctrl+Alt+G"). {{key:Delete}}, {{key:Esc}}, {{key:Enter}}, {{key:Tab}}, {{key:Space}} dan kekunci anak panah sentiasa mengekalkan maksudnya, dan semasa anda melukis garisan, titiknya mengekalkan kekunci mereka ({{key:Backspace}}, {{key:Enter}}).
:::

## Sesuaikan mengikut kehendak anda

1. Pilih gaya yang paling hampir dengan kehendak anda, kemudian klik {{ui:Sesuaikan…}}.
2. Pada {{ui:Kekunci dan menu}}, cari arahan (kotak carian membantu). {{ui:Tambah kekunci}} dan tekan kekunci itu, atau dua kekunci berturut-turut untuk kekunci dua huruf. Klik kekunci untuk mengalihkannya keluar.
3. Dengan reben, {{ui:Tempat ia berada}} memindahkan arahan ke tab dan panel lain, ke menu {{ui:Fail}}, atau ke {{ui:Kekunci sahaja}}.
4. Pada {{ui:Tetikus}}, tetapkan roda, butang yang melakukan pan pada pelan, dan apa yang dilakukan setiap butang dalam paparan 3D.
5. Beri nama dan klik {{ui:Simpan}}.

Menyimpan gaya terbina dalam mencipta salinan anda sendiri ("Reben Civil Saya"); yang terbina dalam tidak pernah berubah. Kekunci yang diberikan kepada dua arahan, atau kekunci yang akan dijalankan sebelum kekunci dua huruf sempat ditaip, dipaparkan dengan warna merah dan mesti dibetulkan sebelum anda boleh menyimpan.

## Tetikus

- **Roda tetikus**: {{ui:Skrol ke atas mengezum masuk}} (permulaan) atau {{ui:Skrol ke atas mengezum keluar}}, dan kelajuannya, pada pelan dan dalam 3D. Cubitan pada pad jejak sentiasa melakukan zum mengikut arah jari anda bergerak.
- **Pan pelan dengan**: butang tengah, butang kanan, atau kedua-duanya. {{key:Space}} dan seret juga melakukan pan. Butang kiri sentiasa memilih dan melukis.
- **Seret dalam paparan 3D**: {{ui:Milik setiap paparan}} mengekalkan butang CivilCraft (kiri melakukan orbit, kanan melakukan pan). Atau tetapkan setiap butang kepada orbit, pan, zum atau tiada apa; {{key:Shift}} dengan butang itu menukar orbit dan pan. Klik tanpa seret tetap memilih.

## Bawa bersama anda

{{ui:Eksport}} menyimpan gaya yang digunakan sebagai fail `.ccinput.json` kecil; {{ui:Import…}} menambah satu, dari komputer lain atau rakan sekerja. Fail yang diimport hanya boleh merujuk arahan CivilCraft sendiri: apa-apa lain di dalamnya ditinggalkan dan dikira dalam bar status. {{ui:Padam gaya ini}} mengalih keluar gaya milik anda sendiri.

:::note
Tetapan ini kekal dalam pelayar ini. {{ui:Gunakan gaya ini dalam setiap aplikasi}} di bawah kad gaya menjadikan setiap aplikasi dibuka dalam gaya yang sepadan (bar alat sendiri, reben atau Klasik lukisan), dengan perubahan yang anda buat dalam setiap aplikasi. CivilCraft tidak mempunyai gaya bar menu: apabila bar menu aplikasi lain dipilih untuk setiap aplikasi, CivilCraft mengekalkan bar alatnya sendiri.
:::

Berkaitan: [Papan kekunci dan tetikus](topic:keyboard) · [Tetapan CivilCraft](topic:settings) · [Berpindah dari perisian civil lain](topic:coming-from)
