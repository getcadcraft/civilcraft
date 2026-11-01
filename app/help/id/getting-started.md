---
title: Memulai CivilCraft
summary: Apa yang dilakukan CivilCraft, cara membukanya, dan sepuluh menit pertama dengan tapak contoh dari titik ke kontur, jalan, dan proyek tersimpan.
keywords: mulai, pertama kali, tapak contoh, pengantar, panduan cepat, tutorial, awal, proyek baru
from: c9b6dd8e
---

CivilCraft adalah aplikasi desain sipil dan tapak dalam keluarga CadCraft. Aplikasi ini mengambil titik survei dan mengubahnya menjadi permukaan (TIN) dengan kontur, lalu memungkinkan Anda menata alinyemen dengan profil rencana, menyapu koridor jalan sederhana, me-grading pad bangunan sampai daylight, memeriksa jaringan pipa gravitasi terhadap aturan Anda, dan melihat volume galian dan timbunan. CivilCraft membaca dan menulis LandXML, mengekspor denah sebagai DXF, dan mem-plot-nya ke PDF.

Jika Anda pernah memakai Civil 3D, gagasannya akan terasa akrab: titik, grup titik, breakline, alinyemen menurut PI, profil menurut PVI, koridor, grading, jaringan pipa. Cara kerjanya berbeda, dan jauh lebih kecil: tidak ada baris perintah, tidak ada gaya, dan tidak ada file gambar. Baca [Jika Anda berasal dari perangkat lunak sipil lain](topic:coming-from) sekali sebelum pekerjaan nyata pertama Anda.

## Yang Anda perlukan

- Peramban desktop versi terbaru: Chrome, Edge, Firefox, atau Safari. Lihat [Peramban](common:browsers).
- Mouse atau trackpad dan keyboard, atau layar sentuh: di sana menggambar memiliki tombol {{ui:Selesai}}, {{ui:Urungkan titik}}, dan {{ui:Batal}} di layar (lihat [Mouse, trackpad, dan sentuh](topic:keyboard#mouse-trackpad-and-touch)).
- Denah digambar dalam 2D dengan canvas peramban. [Tampilan 3D](topic:site-3d) memakai grafis WebGL peramban; jika tidak dapat dimulai, bilah status menyebutkan alasannya dan denah tetap berfungsi.
- Tanpa akun dan tanpa unggahan. File dibuka di komputer Anda dan disimpan sebagai unduhan. Lihat [File Anda](common:your-files).

:::note
CivilCraft saat ini berjalan sebagai build peramban awal yang masih dikembangkan. Build desktop belum tersedia, dan penyimpanan cloud belum tersedia. Semua yang Anda buat tetap berada di komputer Anda sampai Anda menyimpan atau mengekspornya.
:::

## Membuka CivilCraft

1. Buka CivilCraft di peramban Anda.
2. Tunggu layar terisi: bilah alat di atas, panel di kiri, denah di tengah, dan panel **Properti** di kanan.
3. Pada denah kosong, Anda melihat kotak berjudul **Mulai dengan titik survei**. Kotak ini mencantumkan langkah pertama dan memiliki tautan, {{ui:Buka tapak contoh}}.

Untuk memakai CivilCraft tanpa koneksi nanti, klik {{ui:Simpan untuk offline}} di bilah aplikasi dan tunggu {{ui:Siap offline}}. Salinan itu menyertakan bantuan ini, tapak contoh, serta pustaka 3D dan GIS. Lihat [Offline](common:offline). Tekan {{key:F1}} atau klik {{ui:Bantuan}} kapan saja untuk membuka bantuan ini di samping aplikasi.

## Sepuluh menit pertama Anda: tapak contoh

Tapak contoh adalah survei kecil dalam kaki AS: 276 titik pada koordinat state plane, sebuah punggungan, sebuah parit dengan flowline dan dua puncak tebing. Tapak ini disertakan dengan aplikasi, sehingga Anda dapat mengikutinya tanpa file sendiri.

1. Klik {{ui:Buka tapak contoh}} di kotak pada denah.
   Dialog **Impor titik** terbuka. Dialog menyatakan "276 titik dibaca sebagai PNEZD (dari baris header), dipisahkan koma." dan menampilkan baris pertama.
2. Klik {{ui:Impor}}.
   Denah terisi titik, kontur, dan tepi permukaan. Bilah status di bagian bawah menyatakan titik telah diimpor dan berapa segitiga yang dimiliki permukaan (546).
3. Lihat panel kiri di bawah **Titik**. Titik dikelompokkan menurut kata pertama deskripsinya: CP, FL, GRD, RIDGE, TBN, TBS, dan TREE.
4. Di kolom **Permukaan** tabel itu, atur **FL**, **RIDGE**, **TBN**, dan **TBS** ke {{ui:Breakline}}.
   Permukaan dibangun ulang seketika. Fakta **Permukaan** kini menyatakan "Breakline: 4", dan kontur menekuk tajam di sepanjang flowline dan punggungan, bukan memotong melintasinya.
5. Gerakkan penunjuk di atas denah. Bilah status menampilkan easting dan northing di bawah penunjuk serta elevasi tanah di sana.
6. Di bawah **Tampilan**, atur {{ui:Kontur setiap}} ke 0,5 ft dan nyalakan {{ui:Pita elevasi}}. Rampa warna muncul dengan legenda di bawah kotak centang. Matikan pita lagi setelah selesai.

Kini Anda memiliki permukaan tanah asli. Berikutnya, sebuah jalan.

## Menata jalan pendek

1. Tekan {{key:A}} (atau klik {{ui:Alinyemen}} di grup **Rencana**).
2. Klik tiga titik melintasi tapak, satu per satu. Garis merah mengikuti penunjuk dan menampilkan panjang dan bearing tangen berikutnya.
3. Tekan {{key:Enter}} untuk menyelesaikan.
   Alinyemen muncul dengan stasiun. Panel kanan menampilkan **Alinyemen**: panjangnya, tabel PI, dan lengkung pada PI tengah (radius 100 ft, atau lebih kecil jika 100 ft tidak muat).
4. Di panel kanan, di bawah **Profil rencana**, klik {{ui:Mulai dari tanah}}.
   Tampilan profil terbuka di bawah denah dengan tanah asli dan kelandaian rencana lurus dari ujung ke ujung.
5. Tekan {{key:I}} untuk menyalakan {{ui:Tambah PVI}}, lalu klik sekali di tampilan profil di dekat bagian tengah. Sebuah PVI muncul.
6. Di tabel PVI di kanan, ketik panjang lengkung (misalnya 100) di kotak **Curve L** pada PVI tengah lalu tekan {{key:Enter}}. Profil kini memiliki lengkung vertikal, dengan nilai K-nya berlabel.
7. Di bawah **Koridor**, centang **Sapukan rakitan sepanjang profil rencana**.
   Jalan di-grading ke dalam tanah: lajur, bahu, dan lereng samping sampai daylight. Blok **Pekerjaan tanah** menampilkan galian dan timbunan.

Jangan khawatir soal nilai yang persis. Setiap angka dapat diubah di panel kanan, dan {{key:Mod+Z}} mengurungkan perubahan terakhir.

## Menyimpan pekerjaan Anda

1. Ketik nama di **Nama** di bagian atas panel kiri.
2. Tekan {{key:Mod+S}} (atau klik {{ui:Simpan}}).
   Peramban mengunduh file yang dinamai sesuai tapak, berakhiran `.civilcraft.json`. File itu memuat titik, pengaturan permukaan, alinyemen, profil, koridor, pad, dan pipa.
3. Untuk melanjutkan nanti, klik {{ui:Buka}} (atau tekan {{key:Mod+O}}) dan pilih file itu, atau letakkan di denah.

:::warning
Tidak ada penyimpanan otomatis. Jika Anda menutup tab dengan perubahan yang belum disimpan, peramban bertanya apakah akan pergi; jika Anda pergi, perubahan hilang. Simpanlah sesering mungkin.
:::

## Langkah selanjutnya

- [Mengimpor titik survei](topic:import-points) dengan file Anda sendiri.
- [Membangun dan menyempurnakan permukaan](topic:build-surface) dengan breakline dan batas.
- [Layar, bagian demi bagian](topic:workspace).
- [Tombol dan mouse](topic:keyboard).
