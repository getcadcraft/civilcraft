---
title: Grading pad bangunan
summary: Gambar pad datar, atur elevasi dan kemiringan galian serta timbunannya, dan biarkan CivilCraft menyesuaikannya dengan tanah asli lalu menambahkannya ke permukaan rencana.
keywords: dinding penahan, dinding penahan tanah, sisi vertikal, dinding alih-alih lereng, kemiringan per sisi, timbunan, grading, pad, pad bangunan, daylight, garis fitur, grup grading, kemiringan galian, kemiringan timbunan, muka tanah jadi, permukaan rencana, grading tapak
from: 482319a6
---

Pad adalah area datar pada satu elevasi. Dari tepinya, CivilCraft menggrading ke luar dengan kemiringan galian Anda di tempat tanah lebih tinggi daripada pad, dan kemiringan timbunan Anda di tempat tanah lebih rendah, sampai kemiringan bertemu dengan tanah asli. Garis pertemuan itu adalah garis daylight. Pad dan lerengnya menggantikan tanah asli di dalam garis daylight untuk membentuk permukaan rencana.

## Gambar pad

Anda memerlukan permukaan tanah asli terlebih dahulu.

1. Tekan {{key:G}}, atau klik {{ui:Pad}} di grup **Desain**.
   Petunjuk berbunyi "Pad: klik sudut-sudutnya. Enter atau klik dua kali untuk selesai, Backspace menghapus sudut terakhir, Esc membatalkan."
2. Klik sudut-sudut pad secara berurutan, searah atau berlawanan arah jarum jam. Garis tepi biru mengikuti penunjuk.
3. Tekan {{key:Enter}} setelah sudut terakhir (minimal tiga).
   Pad digambar dan dipilih. Ia dimulai pada elevasi tanah di tengahnya, dibulatkan ke 0.1, dengan kemiringan galian 2 : 1 dan kemiringan timbunan 3 : 1. Bilah status menyatakan, misalnya, "Pad 1 pada elevasi 254.3 (tanah di tengahnya), galian 2:1, timbunan 3:1. Ubah di Properti."

:::warning
Selesaikan dengan {{key:Enter}}. Klik dua kali juga menyelesaikan, tetapi di build ini ia membuang sudut yang Anda klik dua kali. Klik sudut terakhir sekali, lalu tekan {{key:Enter}}.
:::

Garis pad tidak boleh berpotongan dengan dirinya sendiri ("Garis pad berpotongan dengan dirinya sendiri.").

## Atur elevasi dan kemiringan

Dengan pad terpilih, panel kanan menampilkan **Pad**:

1. **Nama**.
2. **Elevasi**: elevasi datar pad.
3. **Kemiringan galian** dan **Kemiringan timbunan**, sebagai H:V (2 berarti 2 : 1). Keduanya harus lebih dari 0.
4. **Luas pad** dan **Sudut** ditampilkan sebagai referensi.

Tekan {{key:Enter}} setelah setiap nilai. Garis daylight, permukaan rencana, dan volume langsung diperbarui.

Di bawah kolom, sebuah baris menampilkan misalnya "Garis daylight: 48 garis kemiringan (20 di galian, 28 di timbunan), terjauh 31.20 ft ke luar." Denah menampilkan garis daylight dan garis kemiringan dengan warna magenta.

## Cara daylight ditemukan

- Garis kemiringan keluar dari setiap tepi tegak lurus, kira-kira setiap dua puluh bagian dari ukuran pad.
- Di sudut luar, garis-garis itu menyebar setiap 10°, sehingga lereng melingkari sudut.
- Di sudut dalam, satu garis berjalan di sepanjang garis bagi, tempat kemiringan dari kedua tepi bertemu.
- Setiap garis naik dengan kemiringan galian atau turun dengan kemiringan timbunan sampai mencapai tanah.

## Kemiringan per sisi dan dinding penahan

Di bawah **Sisi dan dinding penahan** pada Properti pad, platform, atau tanggul, setiap sisi dapat digrading dengan caranya sendiri. Sisi 1 berjalan dari sudut pertama yang Anda klik ke sudut kedua, sisi 2 dari sudut kedua ke sudut ketiga, dan seterusnya.

- **Semua sisi**: **Miring** menggunakan kemiringan galian dan timbunan di atas pada setiap sisi; **Vertikal: dinding penahan** menempatkan dinding di setiap sisi.
- Per sisi: **Kemiringan di atas**, **Kemiringan sendiri** (ketik kemiringan galian dan timbunan untuk sisi itu), atau **Vertikal (dinding penahan)**.
- Ketik kemiringan sebagai `3` atau `3:1` (horizontal terhadap 1 vertikal), `33%`, atau `18.4°`; ia ditampilkan sebagai H:1. **Kemiringan galian** dan **Kemiringan timbunan** milik pad menerima format yang sama.
- Sisi vertikal tidak memiliki timbunan tanggul: dinding penahan berjalan di sepanjang tepi, dari pad turun ke tanah asli (pada timbunan) atau dari tanah turun ke pad (pada galian). **Tebal dinding** (mulanya 0.3 m atau 1 ft) adalah seberapa jauh tanah bertangga dari tepi pad ke tanah asli. Volume galian dan timbunan tidak menyertakan timbunan tanggul yang sudah tidak ada pada sisi itu.
- Tempat dinding bertemu sisi miring, lereng melingkari ujung dinding; dua dinding bertemu dengan sambungan miter.
- Di bawah kolom: panjang dinding, muka terbuka (tinggi × panjang), tinggi tertinggi, dan tinggi rata-rata.

Denah menggambar muka luar setiap dinding dengan tanda pendek melintangnya dan tingginya di kedua ujung serta di titik tertinggi (pada lapisan dinding penahan, yang juga masuk ke DXF dan DWG). Tampilan 3D menampilkan dinding sebagai solid (Tampilkan › Dinding penahan), dan ekspor GLB, OBJ, serta USD menyertakannya. Potongan melintang tepi menampilkan tangganya.

**Peringatan** (di Properti, dan di panel Masalah): dinding yang lebih tinggi dari **Peringatkan di atas tinggi dinding** (mulanya 1.0 m atau 3.3 ft) "mungkin memerlukan dinding rekayasa atau izin; periksa aturan setempat", dan, ketika Anda mengetik **Kemiringan tanah paling curam**, sisi mana pun yang kemiringan galian atau timbunannya lebih curam dari itu. Ini hanya peringatan: grading tetap dibangun. Setiap perubahan adalah satu langkah untuk {{key:Mod+Z}}.

## Pindahkan sudut

Pilih pad, lalu seret pegangan persegi di sudut. Setiap seretan adalah satu langkah urungkan. Menambah atau menghapus sudut belum tersedia: hapus pad dan gambar ulang.

## Ketika tidak bisa digrading

Kotak merah di bawah **Pekerjaan tanah** menyebut pad dan masalahnya:

| Pesan | Yang harus dilakukan |
|---|---|
| "3 garis kemiringan keluar dari permukaan sebelum bertemu dengannya: pad terlalu dekat dengan tepi permukaan atau terlalu tinggi/rendah." | Geser pad menjauh dari tepi permukaan, atau dekatkan elevasinya ke tanah. |
| "Garis daylight berpotongan dengan dirinya sendiri (kemiringan dari sisi pad yang berbeda saling bertabrakan). Bentuk ulang pad atau ubah kemiringannya." | Biasanya terjadi pada pad sempit atau berbentuk L pada galian dalam atau timbunan tinggi. Lebarkan pad, ratakan selisihnya, atau curamkan kemiringannya. |
| "Garis pad berpotongan dengan dirinya sendiri." | Gambar ulang sudut-sudut secara berurutan mengelilingi pad. |

Pad yang bermasalah dikeluarkan dari permukaan rencana dan volume sampai diperbaiki.

## Lihat hasilnya

1. Di bawah **Tampilan**, atur **Permukaan** ke {{ui:Rencana (grading)}}.
   Kontur kini mendatar melintasi pad dan mengikuti kemiringan ke luar sampai garis daylight.
2. Arahkan penunjuk ke pad: bilah status menampilkan elevasi **Tanah** dan **Hasil grading**.
3. Baca galian dan timbunan di bawah **Pekerjaan tanah**; lihat [Volume pekerjaan tanah](topic:volumes).

Pad digrading setelah koridor, sesuai urutan digambarnya. Pad yang lebih baru menggantikan apa pun yang lebih awal di dalam garis daylight-nya sendiri.

## Hapus pad

Pilih pad dan tekan {{key:Delete}} (di Mac, Fn dan delete), atau klik {{ui:Hapus}}.

## Belum dibuat

Pad bersifat datar: pad miring, garis fitur dengan kelandaian yang bervariasi, bench, serta grading ke jarak atau target elevasi belum tersedia. Lihat [Belum dibuat](topic:not-built-yet).
