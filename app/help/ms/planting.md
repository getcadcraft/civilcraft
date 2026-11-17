---
title: Pelan penanaman dan jadual
summary: Letak tumbuhan tunggal, katil tanaman yang diisi pada jarak tumbuhan dengan campuran tumbuhan mengikut peratusan, dan pagar hidup; labelkannya; kira dalam jadual tumbuhan untuk hamparan atau TakeoffCraft.
keywords: pelan penanaman, jadual tumbuhan, katil tanaman, penanaman besar-besaran, pagar hidup, pokok, pokok renek, penutup tanah, jarak, jarak segi tiga, kiraan tumbuhan, kuantiti, label, kanopi, simbol tumbuhan, ifc, takeoff
from: ab49eab5
---

## Letak tumbuhan

1. Pilih satu tumbuhan dalam **Tumbuhan** di sebelah kiri.
2. Klik {{ui:Plant}}, kemudian klik pada pelan: setiap klik meletakkan satu tumbuhan. Tekan {{key:Esc}} untuk berhenti.

Simbol tumbuhan dilukis pada lebarnya ketika matang; Lagi › {{ui:Show at planting size}} melukis setiap tumbuhan pada saiz ia ditanam. Pokok berada di atas tanah di bawahnya: apabila anda menggred tapak kemudian, ia mengikut tanah. Untuk menetapkan tumbuhan pada aras tertentu, taip aras itu dalam **Elevation** dalam Properties.

## Katil tanaman

1. Pilih tumbuhan utama, klik {{ui:Bed}} dan klik sudut katil. Tekan {{key:Enter}} (atau klik sudut pertama sekali lagi) untuk menutupnya.
2. Katil dipenuhi dengan tumbuhan itu pada jaraknya, dalam corak **segi tiga** (yang lazim: setiap tumbuhan berada pada jarak yang sama daripada enam yang lain), setengah jarak dari tepi.
3. Dalam Properties, **Tambah tumbuhan** mencampurkan tumbuhan yang dipilih di sebelah kiri. Tetapkan **Bahagian %** bagi setiap tumbuhan: katil mengambil tepat sebanyak itu daripada setiap satu, tersebar merentasinya. **Campur semula** mengacak semula kedudukannya.

Biarkan **Jarak** kosong untuk menggunakan jarak tumbuhan itu sendiri (diberatkan mengikut bahagiannya); taip satu nilai untuk menggunakannya bagi setiap tumbuhan. **Corak** boleh segi empat sama, dan **Baris pada** memutar baris.

## Pagar hidup

Pilih tumbuhan pagar hidup, klik {{ui:Hedge}}, klik sepanjang pagar dan tekan {{key:Enter}}. Tumbuhan diletakkan sepanjang garisan pada jaraknya, dipusatkan supaya kedua-dua hujung mempunyai margin yang sama. Pagar hidup boleh terdiri daripada **dua baris, berselang-seli**, pada jarak yang ditetapkan.

## Label

Tumbuhan tunggal dilabelkan dengan tetapan label (`{name}` secara lalai); taip label sendiri untuk satu tumbuhan dalam Properties. Katil dilabelkan dengan kiraan setiap tumbuhan, pagar hidup dengan kiraannya. Lagi › {{ui:Plant labels}} menghidupkan dan mematikan label. Medan label: `{name}`, `{botanical}`, `{size}` (bekas), `{qty}`, `{height}`, `{spread}`, `{container}`.

## Jadual tumbuhan

Lagi › {{ui:Plant schedule…}} mengira setiap tumbuhan mengikut spesies, daripada tumbuhan tunggal, katil dan pagar hidup bersama-sama, dengan saiz penanamannya. Simpan sebagai **CSV** atau **XLSX**, atau **Hantar ke TakeoffCraft**: fail kuantiti yang dibuka TakeoffCraft untuk menentukan harga tumbuhan (bersama kuantiti perkerasan dan pengairan di sebelahnya).

## IFC

Lagi › {{ui:Export landscape IFC}} menyimpan landskap sebagai fail IFC (IFC 4.3) yang boleh dipegang oleh model BIM: setiap tumbuhan ialah `IfcGeographicElement` jenis VEGETATION, ditaip mengikut spesiesnya dengan sifat tumbuhan (nama botani, saiz, ketahanan, air, cahaya), setiap katil dan pagar hidup ialah satu elemen dengan kiraannya, di atas tapak. BimCraft membukanya di sebelah bangunan.
