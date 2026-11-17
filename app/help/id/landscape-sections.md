---
title: Potongan lanskap dan set terbit
summary: Garis potongan yang memotong tanah eksisting dan tanah rencana, dinding dengan pondasinya, susunan perkerasan dan area tanam, anak tangga, serta tanaman pada ukuran dewasa, pada lembarnya sendiri; satu set terbit dengan daftar lembar, satu PDF, dan satu DWG per lembar.
keywords: potongan, potongan melintang, tampak, penanda potongan, garis potongan, terbit, set lembar, daftar lembar, daftar gambar, set pdf, dwg per lembar
from: 7271ac50
---

{{ui:Levels}} › {{ui:Section line}}: klik titik awal dan titik akhir. Potongan diberi nama A, B, C… (ganti namanya di Properti). Sebuah potongan menggambar, sepanjang garisnya:

- tanah eksisting (putus-putus) dan tanah rencana;
- dinding beserta pondasinya, di tempat garis memotongnya;
- susunan perkerasan dan jalur, serta mulsa dan tanah pucuk area tanam (setelah clipping), menggantung di bawah permukaan jadi;
- anak tangga dalam profil;
- tanaman dalam jarak yang ditetapkan dari garis, sebagai siluet pada ukuran dewasa.

Properti menetapkan jarak tersebut dan pembesaran vertikal. Di dialog Lembar, **Potongan** menempatkannya pada lembarnya sendiri, hingga empat per lembar, masing-masing pada skala standar yang muat.

## Set terbit

{{ui:Publish set (.zip)}} di dialog Lembar membuat, dalam satu .zip:

- satu PDF yang dibuka dengan **daftar lembar**, lalu setiap lembar lanskap, dinomori L-1, L-2… (penanaman, grading, irigasi, detail, potongan, lembar kerja);
- **satu DWG per lembar denah** dengan layer lembar itu (nama `L-*` dipertahankan) dan satu DWG per gambar potongan.

Setiap garis potongan di denah menyatakan lembar tempatnya berada (`A / L-5`); nomornya dihitung ulang dari set setiap kali, jadi menambah, menghapus, atau mengganti nama potongan akan menomori ulang.
