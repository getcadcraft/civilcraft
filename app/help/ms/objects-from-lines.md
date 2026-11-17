---
title: Objek daripada garisan, kekal dipautkan
summary: Buat turapan, kawasan tanaman, bidang tanaman, pagar hidup, laluan, dinding, kerb, anak tangga, tanjakan, platform, parit landai atau garis ciri daripada garisan; ia mengikut apabila garisan bergerak, sehingga anda memutuskan pautan.
keywords: daripada garisan, garisan, DWG, DXF, pautan, dipautkan, ikut, jana semula, putuskan pautan, garis ciri, garis ciri daripada garisan, lapisan diimport, garis besar, supercad studio, garisan lukisan
from: eb67a0c6
---

{{ui:Daripada garisan}} (Landskap › {{ui:Lagi}}): klik garis ciri, atau garisan atau garis besar bagi lapisan DWG/DXF yang diimport. Garisan tertutup boleh menghasilkan turapan, kawasan rumput, bidang tanaman, padang, penutup tanah, bidang atau platform; garisan terbuka menghasilkan laluan, dinding, kerb, anak tangga (titik pertama dan terakhirnya), tanjakan, pagar hidup atau parit landai. Mana-mana jenis boleh menghasilkan **garis ciri**, kecuali garis ciri itu sendiri.

## Garis ciri daripada garisan

Garis ciri yang dibuat daripada garisan mengambil titik-titiknya, ditutup jika garisan itu tertutup. Arasnya dibentangkan pada tanah sedia ada (0 jika belum ada), dan penggunaannya ialah **Mati**: ia tidak membentuk tanah sehingga anda memilih penggunaan dan menetapkan arasnya dalam Sifatnya. Apabila garisan bergerak, garis ciri dengan bilangan titik yang sama mengekalkan setiap aras yang anda tetapkan; apabila garisan bertambah atau berkurang titik, aras dibentangkan semula pada tanah. Lihat [Garis ciri](topic:feature-lines).

Objek baharu mengekalkan **pautan** kepada garisannya. Apabila garisan bergerak (anda menyeret titiknya, atau lukisan dialihkan atau dibaca semula), objek mengambil bentuk baharu dalam langkah buat asal yang sama, dan melalui pengubah suai tanah, tanah cadangan turut mengikut. Sifat memaparkan apa yang ia dipautkan; {{ui:Putuskan pautan}} menjadikannya bebas.

Garisan disemak dahulu: garisan memerlukan sekurang-kurangnya 2 titik (3 bagi garis besar), paling banyak 5000, nombor nyata; garis besar mesti tertutup dan tidak boleh bersilang sendiri. Garisan yang gagal tidak digunakan: objek kekal seperti sebelumnya dan panel Masalah menyatakan sebabnya. Jika garisan dipadam, objek kekal dan panel Masalah mencatatkannya.

## Dalam SuperCad Studio

Buka tapak dan lukisan 2D dalam projek yang sama. Pilih satu garisan atau polygaris dalam lukisan 2D, tekan Ctrl+K dan jalankan {{ui:Objek landskap daripada garisan lukisan yang dipilih}}: CivilCraft bertanya apa yang hendak dibuat, seperti di atas, dan objek kekal dipautkan kepada garisan lukisan itu. Selepas anda menukar garisan dalam lukisan, Ctrl+K {{ui:Kemas kini landskap daripada lukisan}} menjadikan objek mengikut, satu langkah buat asal bagi setiap garisan. Fail pautan projek merekodkan objek mana yang mengikut garisan mana. Bantuan SuperCad Studio sendiri mempunyai topik Landskap.
