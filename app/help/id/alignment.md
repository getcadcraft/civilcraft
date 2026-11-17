---
title: Susun alinyemen horizontal
summary: Gambar alinyemen menurut PI-nya, atur jari-jari tikungan dan stasiun awal, pindahkan PI, serta baca data tikungan dan stasiun dan offset.
keywords: alinyemen, tidak ada solusi, tikungan tidak muat, jari-jari terbesar, jari-jari terkecil, jari-jari minimum, kecepatan rencana, tumpang tindih, as jalan, pi, tikungan horizontal, jari-jari, penomoran stasiun, tangen, buat alinyemen, tata letak alinyemen, pc, pt, stasiun offset
from: 8c5df4aa
---

Alinyemen di CivilCraft adalah rangkaian tangen melalui titik perpotongan (PI), dengan tikungan lingkaran di setiap PI interior yang memiliki jari-jari. Alinyemen diberi stasiun dari stasiun awal yang Anda pilih. Sebuah proyek dapat memuat banyak alinyemen.

## Gambar alinyemen

1. Tekan {{key:A}}, atau klik {{ui:Alinyemen}} di grup **Desain**.
   Petunjuknya berbunyi "Alinyemen: klik PI berurutan. Enter atau klik ganda untuk selesai, Backspace membuang yang terakhir, Esc membatalkan."
2. Klik PI pertama (awal alinyemen).
3. Klik setiap PI berikutnya secara berurutan. Garis merah mengikuti penunjuk dan menampilkan panjang serta bearing tangen yang sedang Anda gambar, misalnya "212.40 ft  U 63°12'05" T".
4. Klik PI terakhir (akhir alinyemen).
5. Tekan {{key:Enter}}.
   Alinyemen digambar dengan stasiun dan dipilih. Bilah status menampilkan, misalnya, "Alinyemen 1: 386.36 ft, tikungan jari-jari 100 ft jika muat. Ubah jari-jari di Properti; Profil (R) untuk merancang kelandaiannya."

Saat menggambar: {{key:Backspace}} menghapus PI terakhir, {{key:Esc}} membatalkan, dan menyeret pada ruang kosong menggeser tanpa menambah PI.

:::warning
Selesaikan dengan {{key:Enter}}. Klik ganda juga menyelesaikan, tetapi di build ini menjatuhkan PI yang Anda klik ganda. Klik PI terakhir sekali, lalu tekan {{key:Enter}}.
:::

Setiap PI interior mendapat tikungan 100 ft (30 m di proyek meter), atau jari-jari bulat terbesar yang muat di setengah setiap tangen jika 100 ft tidak muat. PI yang sangat tajam atau lurus tembus tidak mendapat tikungan.

## Atur jari-jari dan koordinat

Dengan alinyemen dipilih, panel kanan menampilkan **Alinyemen**:

1. **Nama** dan **Stasiun awal**. Ketik stasiun sebagai `10+00` (kaki) atau `0+500` (meter), atau sebagai angka biasa. Lihat [Satuan, stasiun, dan format angka](topic:units-and-stations).
2. **Panjang** dan **Stasiun akhir** dihitung untuk Anda.
3. Tabel **PI** mencantumkan **Easting** dan **Northing** setiap PI, serta **Jari-jari** untuk setiap PI interior. Ketik nilai baru lalu tekan {{key:Enter}}.
   - Jari-jari 0 membuat titik sudut tanpa tikungan.
   - PI pertama dan terakhir tidak pernah memiliki jari-jari.
   - Tanda x kecil di ujung baris menghapus PI itu (alinyemen mempertahankan minimal dua).
4. Baca daftar **Tikungan**: untuk setiap tikungan, stasiun PC dan PT-nya, jari-jari R, sudut defleksi Δ dan arahnya (kiri atau kanan), panjang L, tangen T, eksternal E, dan tali busur.
5. Garis di bawah tikungan memberikan bearing tangen pertama.

## Saat tikungan tidak muat

Jika tikungan membutuhkan tangen lebih panjang daripada yang tersedia di antara PI-nya, alinyemen tidak memiliki solusi: alinyemen tidak digambar dengan benar sampai Anda memperbaikinya, dan ia dikeluarkan dari ekspor LandXML. Kotak merah menjelaskan alasannya dengan angka, dan menawarkan apa yang akan muat:

- "Tikungan di PI 2 dan PI 3 membutuhkan 240.00 ft tangen di antara keduanya (130.00 + 110.00), tetapi PI berjarak 180.00 ft." — atau, jika hanya salah satu yang memiliki tikungan, "Tikungan di PI 2 membutuhkan 240.00 ft tangen menuju PI 1 …".
- Tombol untuk setiap PI mengatur **jari-jari terbesar yang muat** di sana dengan tikungan lainnya tetap seperti semula (jari-jari itu juga harus muat di tangen PI yang lain). Jika kedua PI memiliki tikungan, **Keduanya** memperkecil kedua jari-jari secara proporsional sehingga tepat bertemu.
- Jika satu tikungan saja lebih panjang dari tangen, kotak menyatakan bahwa tidak ada tikungan di PI lain yang dapat muat selama tikungan itu sebesar itu.
- PI yang berbalik lurus ke belakang tidak dapat menerima tikungan; kotak menawarkan **Tanpa tikungan di PI n**.

Setiap tombol adalah satu langkah: {{key:Mod+Z}} mengembalikan jari-jari. Jari-jari yang ditawarkan dibulatkan ke bawah hingga 0.01 sehingga selalu muat.

### Jari-jari minimum rancangan

Ketik **Jari-jari minimum rancangan** (misalnya dari kecepatan rencana Anda) agar setiap tikungan diperiksa terhadapnya; biarkan kosong jika tidak ada. Tikungan di bawah minimum itu dicantumkan dengan tombol untuk **jari-jari terkecil yang memenuhi minimum**, jika jari-jari itu muat. Jika tidak muat, kotak menyatakannya dan memberikan jari-jari terbesar yang diizinkan tangen, sehingga Anda tahu untuk memindahkan PI atau menurunkan minimum.

## Pindahkan PI di denah

1. Dengan {{ui:Pilih}} aktif, klik alinyemen untuk memilihnya. Gagang persegi muncul di PI-nya.
2. Seret gagang. Alinyemen, stasiunnya, profil, dan koridor mengikuti.
3. Lepaskan. Pemindahan adalah satu langkah urungkan.

Menambahkan PI di antara dua PI yang ada belum tersedia: hapus alinyemen dan gambar ulang, atau ketik koordinat baru untuk PI yang Anda miliki.

## Baca stasiun dan offset

Gerakkan penunjuk di atas denah. Bilah status menampilkan alinyemen terdekat (atau yang dipilih) dengan stasiun dan offset, **L** atau **R** memandang ke arah kenaikan stasiun, misalnya "Alinyemen 1: STA 2+15.30, offset 18.42 R". Di luar salah satu ujungnya, ditambahkan "(di luar ujung)".

## Yang digambar

Di denah, di DXF, dan di PDF: as jalan (tangen sebagai garis, tikungan sebagai busur sebenarnya), tanda setiap 50 ft (20 m) dengan tanda lebih panjang dan label stasiun setiap 100 satuan, serta tanda PC dan PT yang diberi label dengan stasiunnya.

## Hapus alinyemen

Pilih dan tekan {{key:Delete}}, atau klik {{ui:Hapus}} di bilah alat atau di bagian bawah panel kanan. Profil dan koridornya ikut terhapus. {{key:Mod+Z}} mengembalikannya.

:::mac
Di keyboard Mac, tombol berlabel **delete** berfungsi sebagai {{key:Backspace}} bagi peramban dan tidak menghapus pilihan. Tekan {{key:Delete}} (Fn dan delete), atau gunakan tombol {{ui:Hapus}}.
:::

## Berikutnya

- [Rancang profil vertikal](topic:profile).
## Kecepatan rencana dan kelas

Di bawah Properti alinyemen, **Kecepatan rencana** (km/h atau mph) dan **Kelas rencana** disimpan bersama alinyemen, disimpan dalam proyek, dan ditulis ke IFC (Pset_RoadDesignCriteriaCommon). CivilCraft tidak memiliki tabel yang menghubungkan kecepatan dengan jari-jari minimum, jadi tidak ada yang diperiksa dari keduanya: atur **Jari-jari minimum** dari standar rancangan Anda sendiri.

## Spiral

Tikungan dapat memiliki spiral klotoid di kedua ujungnya: tangen, spiral, tikungan, spiral, tangen. Di tabel PI, ketik panjang di **Spiral masuk** dan **Spiral keluar** untuk PI yang memiliki jari-jari. PI tetap di tempatnya; tikungan bergerak masuk untuk memberi ruang, sehingga jarak tangen bertambah sebesar offset spiral. Kedua panjang boleh berbeda, dan PI dengan satu panjang hanya mendapat spiral di ujung itu.

Daftar tikungan kemudian menampilkan TS, SC, CS, dan ST (tangen ke spiral, spiral ke tikungan, tikungan ke spiral, spiral ke tangen) dengan sudut spiral θs, jarak tangen, dan jarak eksternal. Stasiun berjalan sepanjang spiral seperti di tempat lain. Spiral yang bersama-sama memutar lebih banyak daripada tikungan ditolak dengan menyebut PI-nya; spiral yang lebih panjang dari yang diizinkan tangen adalah tumpang tindih, sama seperti tikungan lainnya. Superelevasi menggunakan spiral sebagai runoff-nya (lihat [Koridor](topic:corridor)).
