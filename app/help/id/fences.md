---
title: Pagar
summary: Pagar di sepanjang garis, persil atau pad: tiang, rel, panel atau kisi, gerbang, miring atau bertangga mengikuti tanah, jadwal, simbol denah, dan elemen IFC. Juga tersedia untuk asisten.
keywords: pagar, tiang, rel, panel, kisi, gerbang, miring, bertangga, medan, jadwal, ifc, railing, batas
from: c0e7b84a
---

Buat pagar di sepanjang garis fitur, alinyemen, persil atau pad, dengan tiang dan gerbangnya ditempatkan untuk Anda.

## Membuat pagar

1. Pilih garis, persil atau pad.
2. Buka **Permukaan, Lainnya, Pagar...**
3. Pilih gaya (panel, rel atau kisi), miring atau bertangga, tinggi, jarak tiang, dan lebar gerbang, lalu pilih **Pagar sepanjang pilihan**, atau **Dengan gerbang** untuk menempatkan gerbang di tengah ruas lurus terpanjang.

Tiang ditempatkan di ujung, di setiap sudut (titik yang berbelok 20 derajat atau lebih), di kedua tepi setiap gerbang, dan di antara keduanya pada bentang yang sama, tidak ada yang lebih panjang dari jarak. Panel **miring** mengikuti tanah di antara tiangnya. Panel **bertangga** tetap datar dan bertangga di tiang; celah di bawah panel paling lebar di tiang sisi bawah lerengnya, dan jendela memberi peringatan jika celah itu melebihi batas, atau jika tanah naik melewati panel. Gerbang 6 kaki (1.8 m) atau lebih lebar mendapat dua daun; denah menampilkan daun terbuka beserta ayunannya.

## Jadwal dan keluaran

Setiap pagar menampilkan panjangnya, tiang menurut jenisnya, panel, gerbang, dan langkah, dengan jadwal **CSV** berisi tiang, panel, rel, kisi, dan gerbang. Denah memiliki layer pagar (C-FENC, C-FENC-POST, C-FENC-GATE) untuk PDF, DXF, dan DWG. Ekspor IFC memuat tiang (IfcMember, post), panel (IfcRailing, user defined fence panel), rel (IfcMember), dan gerbang (IfcDoor, gate), satu sistem per pagar.

## Dari asisten

`fence_build` membuat pagar (titik, atau garis, persil, atau pad yang bernama, dengan gerbang berdasarkan stasiun) dan `fence_list` mendaftar pagar beserta jadwalnya.

## Yang belum dibuat

Ukuran awal adalah pilihan yang umum, bukan ketentuan kode. Tipe dari Pustaka hanya dibawa sebagai nama. Gerbang harus berada dalam satu bentang lurus. BimCraft belum memiliki alat ini.
