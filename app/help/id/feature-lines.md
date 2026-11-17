---
title: Garis fitur
summary: Gambar garis 3D yang Anda beri kelandaian titik demi titik, buat offset bertangga darinya, dan gunakan sebagai breakline tanah atau sebagai pad miring dalam desain.
keywords: busur, kurva, radius, busur 3d, heliks, kanstein melengkung, overlay kelandaian, overlay elevasi, panah kelandaian, garis fitur, kelandaian, kemiringan, elevasi, offset bertangga, offset, breakline, kanstein, parit, berm, pad miring, daylight, grading, polyline 3d
from: d55b25fb
---

Garis fitur adalah garis dengan elevasi di setiap titik sudut: kanstein, garis aliran parit, puncak berm, atau tepi pad miring. Anda mengatur elevasinya dengan angka atau dengan kelandaian, menyalinnya ke samping dengan langkah naik atau turun, dan memilih apa yang dilakukan permukaan terhadapnya.

## Gambar satu

1. Pilih **Permukaan** › {{ui:Lainnya}} › {{ui:Garis fitur}}, atau tekan {{key:L}}.
2. Klik titik-titik sudutnya di denah. Klik pada titik survei mengambil tempat dan elevasi titik itu; di tempat lain, titik sudut mengambil elevasi tanah yang ada di sana.
3. Tekan {{key:Enter}} untuk menyelesaikan garis terbuka, atau klik titik sudut pertama lagi untuk menutupnya.

Garis baru dipilih dan dimulai sebagai breakline dari tanah yang ada, berada di atas tanah.

## Busur

Sebuah segmen dapat berupa busur dalam denah yang ujung-ujungnya berada pada elevasi berbeda: sudut kanstein, parit melengkung, rampa yang berbelok. Kelandaiannya berjalan rata sepanjang busur, dan panjangnya diukur di sepanjang kurva.

- **Saat menggambar:** tekan {{key:C}} (pada layar sentuh, {{ui:Busur}} di bilah di atas denah) untuk menyalakan busur. Setelah satu titik sudut, klik titik pada kurva, lalu klik tempat busur berakhir. Tekan {{key:C}} lagi untuk segmen lurus. {{key:Backspace}} menghapus titik pada kurva lebih dulu.
- **Setelahnya:** di **Properti**, ketik radius dan arah belokannya di kotak **Busur** pada titik sudut, misalnya `50 L` atau `50 R` (kiri atau kanan saat Anda berjalan sepanjang garis), lalu tekan {{key:Enter}}. Kosongkan kotak untuk membuat segmen lurus kembali. Radius yang lebih kecil dari setengah segmen ditolak.

Garis yang dipilih menampilkan radius setiap busur di samping kelandaiannya. **Panjang** adalah sepanjang busur dalam denah; **Panjang 3D** juga menghitung kenaikan dan penurunan. Offset bertangga mempertahankan busur: busur di sisi luar tikungan membesar, yang di dalam menyusut, dan offset yang melewati pusat busur ditolak.

Permukaan, tampilan 3D, serta DXF dan DWG mengambil setiap busur sebagai potongan lurus pendek yang tetap dalam 0.01 dari kurva. LandXML menyimpannya sebagai busur (lihat **Busur di file lain** di bawah).

## Atur elevasi dan kelandaian

**Properti** mencantumkan titik sudut dengan jaraknya sepanjang garis, **Elevasi**-nya, dan **Kelandaian ke berikutnya** (dalam persen). Ketik salah satunya dan tekan {{key:Enter}}:

- Elevasi hanya memindahkan titik sudut itu.
- Kelandaian mengatur elevasi di ujung jauh segmennya; titik sudut sesudahnya tetap di tempatnya, sehingga kelandaian segmen berikutnya berubah.

Juga di **Properti**:

| Aksi | Apa yang dilakukannya |
|---|---|
| **Naikkan atau turunkan semua sebesar** | Menambahkan tinggi yang Anda ketik ke setiap titik sudut. |
| {{ui:Elevasi dari tanah}} | Mengembalikan setiap titik sudut ke tanah yang ada (titik yang berada di luar permukaan tetap pada elevasinya, dan didaftar). |
| {{ui:Satu kelandaian, pertama ke terakhir}} | Mempertahankan elevasi pertama dan terakhir, dan menempatkan titik di antaranya pada satu kelandaian yang rata. |

Garis yang dipilih menampilkan elevasinya di titik sudut dan kelandaiannya di sepanjang segmen pada denah. Seret titik sudut dengan {{ui:Pilih}} untuk memindahkannya; elevasinya tetap.

## Offset bertangga

Di bawah **Offset bertangga**, ketik **Jarak** (positif ke kanan arah garis, negatif ke kiri), lalu tinggi (naik atau turun sebesar) atau kemiringan dalam persen, dan klik {{ui:Buat garis offset}}. Salinannya adalah garis fitur baru: misalnya, sisi belakang kanstein 0.5 ft ke samping dan 0.5 ft lebih tinggi, atau tepi parit 6 ft ke luar pada 2 %. Jarak yang akan melipat salinan ke atas dirinya sendiri pada tikungan tajam ditolak.

## Kelandaian dan elevasi di layar

Tekan {{key:E}}, atau centang **Kelandaian dan elevasi pada garis fitur** di bawah **Tampilan**, untuk melihat kelandaian setiap garis fitur di sepanjang setiap segmen (dengan panah kecil yang menunjuk ke bawah) dan elevasinya di titik sudut. Ini hanya tampil di layar: tidak ada yang ditambahkan ke gambar, dan PDF, DXF, serta DWG tetap seperti semula. Segmen pendek dan titik sudut yang padat dibiarkan tanpa label sampai Anda memperbesar. Garis yang dipilih selalu menampilkan kelandaian dan elevasinya sendiri.

## Di tampilan profil

Garis fitur yang memotong alinyemen tampil di tampilan profil alinyemen itu, dengan nama dan elevasinya di titik potong; garis yang berjalan di sampingnya juga dapat ditampilkan. Lihat [Rancang profil vertikal](topic:profile).

## Yang dilakukan permukaan terhadapnya

Pilih **Gunakan**:

| Gunakan | Yang terjadi |
|---|---|
| Breakline dari tanah yang ada | Tanah yang ada melewati garis pada elevasinya, seperti breakline yang digambar. |
| Digrading ke dalam desain | Garis **tertutup** menjadi pad miring: permukaan usulan di dalamnya digrading ke tepinya. Aktifkan **Daylight ke tanah** untuk menjalankan lereng galian dan timbunan (horizontal terhadap 1 vertikal) dari tepinya ke tanah, seperti pad; setiap lereng dimulai pada elevasi tepi di sana. |
| Hanya digambar | Garis tetap di denah dan keluar dalam DXF, DWG, dan PDF (layer C-GRAD-FEAT, polyline 3D), tetapi permukaan mengabaikannya. |

Volume, potongan, dan tampilan 3D menyertakan garis fitur yang digrading ke dalam desain, seperti pad. Setiap perubahan adalah satu langkah: {{key:Mod+Z}} mengurungkannya.

## Berbagi garis dengan tim Anda

Dalam gambar yang dibuka dari file cloud Anda di CadCraft Studio, pada paket tim, **Properti** proyek (saat tidak ada yang dipilih) memiliki bagian **Tim** dengan {{ui:Garis tim…}}: garis yang dibagikan tim Anda, masing-masing dengan revisinya, tanpa perlu memilih garis fitur lebih dulu. Pilih garis untuk membagikannya, dorong revisi baru, tarik revisi tim, atau berhenti berbagi. Di luar pengaturan itu, bagian tersebut menyebutkan apa yang dibutuhkannya.

## Busur di file lain

| File | Yang terjadi pada garis fitur dengan busur |
|---|---|
| Proyek CivilCraft | Dipertahankan persis. |
| LandXML | Ditulis sebagai fitur denah berisi garis dan busur dengan elevasinya, dan dibaca kembali dengan busurnya. Garis fitur dari program lain masuk sebagai **Hanya digambar**: pilih **Gunakan**-nya untuk memasukkannya ke permukaan. |
| DWG dan DXF | Polyline 3D tidak dapat menampung busur, sehingga garis ditulis sebagai potongan pendek yang tetap dalam 0.01 dari setiap busur. CivilCraft juga mencatat di gambar potongan mana yang merupakan busur: saat Anda membuka gambar sebagai garis gambar, {{ui:Garis fitur}} mengembalikan garis sebagai garis fitur dengan busurnya. Program lain melihat polyline 3D biasa. |
