---
title: Pengubah tanah dan level langsung
summary: Semua yang membentuk tanah rencana dalam satu daftar berurutan (yang lebih akhir menang jika tumpang tindih), galian dan timbunan per pengubah, pemeriksaan sambungan di panel Masalah, serta level titik dan panah kemiringan yang membaca tanah secara langsung.
keywords: pengubah tanah, tumpukan, urutan, tanah rencana, tanah yang ada, tumpang tindih, galian dan timbunan, sambungan, dinding penahan, tepi perkerasan, level dasar, bordes tangga, level titik, tinggi titik, panah kemiringan, label lereng, kemiringan
from: 3998a5b0
---

Tanah rencana = tanah yang ada + pengubah, sesuai urutan. Tanah yang ada tidak pernah diubah.

## Daftar

{{ui:Level}} › {{ui:Pengubah tanah…}} mencantumkan setiap objek yang membentuk tanah: platform, berm, swale, area grading, perkerasan dan jalur, area tanam dengan level akhir, serta tangga dan ramp yang kotak **Membentuk tanah**-nya dicentang (beserta level bawah dan atasnya). Jika dua objek tumpang tindih, yang **lebih akhir** menang. Seret baris, atau gunakan panah, untuk mengubah urutan; tanah langsung dibangun ulang. Setiap baris menampilkan galian dan timbunannya (yang dibentuknya setelah objek di atasnya), dengan total di bawah daftar.

## Pemeriksaan sambungan

Panel Masalah mencantumkan, dengan **Ke lokasi**:

- dinding yang sisi tingginya berada di atas puncaknya (tanah di atas dinding), atau yang sisi rendahnya memperlihatkan pondasinya;
- area tanaman yang level akhirnya berada di atas tepi perkerasan yang ditemuinya, atau lebih dari 150 mm yang lazim di bawahnya;
- tangga yang bagian bawah atau atasnya tidak bertemu dengan perkerasan tempat ia mendarat;
- dua pengubah yang tumpang tindih (yang lebih akhir menang di sana).

Dinding penahan dapat memiliki puncak yang mengikuti sisi tinggi tanah: tingginya dihitung ulang setiap kali tanah berubah.

## Dinding penahan yang membentuk tanah

Pilih dinding penahan dan centang **Membentuk tanah**. Jalur di bawah dinding (selebar tebal dinding) masuk ke daftar sebagai pengubah:

- tepi di **sisi tinggi** ditahan pada tanah di sana, stasiun demi stasiun, sehingga puncak dinding mengikuti sisi tinggi (dengan coping di atasnya). Ketik level **Atas**, dan sisi tinggi akan ditahan pada level itu dikurangi coping;
- tepi di **sisi rendah** ditahan pada level **Tanah yang ditahan di sisi rendah** yang Anda ketik, atau, jika dikosongkan, pada tanah di sana;
- sisi tinggi adalah sisi yang tanahnya lebih tinggi di sepanjang dinding, sehingga tidak pernah berbalik di sepanjang dinding;
- tanah di luar jalur tidak diubah, dan tanah yang ada tidak pernah diubah.

Seperti pengubah lainnya, ia berada dalam daftar, dan pengubah yang tercantum setelahnya menang jika tumpang tindih. Dinding yang level tertahannya di ujung lebih dari 150 mm yang lazim dari tanah yang ada di sana mendapat peringatan di panel Masalah (dengan **Ke lokasi**). Dinding berdiri bebas tidak membentuk tanah. Kotak ini nonaktif pada file dari build sebelumnya, sehingga file tersebut dibuka seperti semula.

## Level titik dan panah kemiringan

{{ui:Level titik}} (satu klik) dan {{ui:Panah kemiringan}} (dua klik) membaca tanah setiap kali digambar: pindahkan atau ubah level objek dan labelnya mengikuti. Di Properti pilih apakah label membaca tanah rencana atau tanah yang ada; label tanah yang ada ditampilkan dalam kurung. Panah menunjuk ke arah menurun dan menampilkan `1:20 (5.0 %)`.
