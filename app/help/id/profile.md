---
title: Rancang profil vertikal
summary: Buka tampilan profil, mulai profil desain dari tanah, tambah dan seret PVI, atur panjang lengkung vertikal, dan baca kelandaian, nilai K, serta titik tertinggi dan terendah.
keywords: profil, alinyemen vertikal, pvi, lengkung vertikal, kelandaian, nilai k, puncak cembung, lengkung cekung, bvc, evc, tampilan profil, elevasi rencana, fg, profil tanah asli, garis fitur dalam profil, perlintasan, diproyeksikan, kereb, parit, label
from: dbb1f32d
---

Setiap alinyemen memiliki satu profil desain: daftar PVI (stasiun dan elevasi) yang dihubungkan oleh kelandaian lurus, dengan lengkung vertikal parabola simetris di setiap PVI antara yang memiliki panjang. Profil tanah asli diambil dari permukaan untuk Anda.

## Buka tampilan profil

1. Pilih alinyemen (klik dengan {{ui:Pilih}}).
2. Tekan {{key:R}}, atau klik {{ui:Profil}} di bilah alat, atau {{ui:Tampilan profil}} di bagian bawah panel kanan.
   Tampilan profil terbuka di bawah denah dengan tanah asli di sepanjang alinyemen. Dengan dua alinyemen atau lebih, pilih salah satu di daftar di sisi kiri bilah profil.

Tampilan mulanya memperlihatkan seluruh alinyemen dan meregangkan elevasi agar memenuhi panel; eksagerasinya tercetak di pojok kiri bawah, misalnya "Eksagerasi vertikal 10×".

## Perbesar dan geser profil

- **Zoom:** putar roda mouse (atau cubit pada trackpad) dan tampilan membesar atau mengecil di sekitar penunjuk. Tahan {{key:Shift}} untuk memperbesar stasiun saja, atau {{key:Alt}} untuk memperbesar elevasi saja (itu mengubah eksagerasi). Dengan tampilan profil difokuskan, tombol plus dan minus memperbesar di tengah.
- **Geser:** seret dengan tombol mouse kanan atau tengah, atau geser dengan dua jari pada trackpad.
- **Paskan:** klik dua kali profil atau tekan {{key:F}} untuk menampilkan seluruh alinyemen lagi.

Menyunting PVI mempertahankan zoom yang Anda pilih; tampilan tidak kembali ke paskan.

Gerakkan penunjuk di sepanjang profil: bilah menampilkan stasiun, elevasi tanah dan rancangan, kelandaian serta galian atau timbunan di sana, dan sebuah titik mengikuti di alinyemen pada denah.

## Mulai profil desain

1. Di panel kanan, di bawah **Profil desain**, klik {{ui:Mulai dari tanah}}.
   Dua PVI diletakkan di tanah pada kedua ujung alinyemen, dihubungkan oleh satu kelandaian lurus. Bilah status menyatakan "Profil desain dimulai dari tanah di kedua ujung. Nyalakan Tambah PVI dan klik untuk menambah perubahan kelandaian; beri panjang lengkung di tabel."

Jika alinyemen tidak memotong permukaan, Anda akan melihat "Alinyemen ini tidak memiliki tanah di bawahnya untuk memulai." Dalam hal itu, tambahkan PVI dengan mengklik (bagian berikutnya).

## Tambah PVI

1. Tekan {{key:I}}, atau klik {{ui:Tambah PVI}} di bilah profil. Tombol tetap tertekan.
2. Klik di profil tempat Anda ingin perubahan kelandaian. PVI ditambahkan pada stasiun dan elevasi itu, dibulatkan ke 0.01, dan dipilih.
3. Tambahkan sebanyak yang Anda perlukan, lalu tekan {{key:I}} lagi untuk berhenti menambah.

Klik di tempat yang sudah ada PVI ditolak ("Sudah ada PVI di …"). PVI selalu berada dalam urutan stasiun.

## Snap saat menambah atau menyeret

Tombol **Snap** di bilah profil aktif sejak awal. Selama aktif, PVI yang Anda tambah atau seret mendarat di PVI terdekat, titik tanah, stasiun PVI, atau garis tanah, dan sebuah label di samping penanda menyatakan yang mana. Tahan {{key:Alt}} untuk titik bebas di mana saja.

## Sesuaikan PVI

- **Seret** PVI di profil untuk memindahkannya. PVI tidak dapat melewati tetangganya. Pemindahan ini adalah satu langkah urungkan.
- **Ketik** nilai pasti di tabel PVI di panel kanan: **Stasiun**, **Elevasi**, **Kemiringan %**, dan **Panjang lengkung L** (panjang lengkung vertikal). Tekan {{key:Enter}} setelah tiap nilai.
- **Ambil** nilai dari profil: tombol kecil di samping stasiun atau elevasi PVI menunggu satu klik di tampilan profil dan mengisi nilai itu. Klik itu melakukan snap seperti Tambah PVI; tahan {{key:Alt}} untuk titik bebas; {{key:Esc}} membatalkan.
- **Kemiringan %** adalah kelandaian tangen yang dimulai dari PVI itu dan berakhir di PVI berikutnya. Mengetiknya menggeser elevasi **PVI berikutnya** (stasiunnya tidak pernah bergeser). Jika PVI berikutnya terkunci, elevasi PVI sebelumnya yang bergeser.
- **Kunci** PVI dengan gembok di ujung barisnya. PVI yang terkunci tidak ikut terseret, dan suntingan kemiringan tidak menggesernya. Jika kedua ujung tangen terkunci, kemiringannya tidak dapat berubah: bilah status menyatakannya, dan Anda harus membuka kunci salah satu ujung lebih dulu. Kunci disimpan dalam file.
- **Hapus** PVI dengan tanda x di ujung barisnya, atau pilih (klik) dan tekan {{key:Delete}}. Saat tampilan profil memiliki fokus, {{key:Backspace}} juga menghapusnya.

PVI pertama dan terakhir tidak pernah mendapat lengkung.

## Lengkung vertikal

1. Ketik panjang di **Panjang lengkung L** untuk PVI di antara, misalnya 200.
2. Lengkung digambar berpusat pada PVI. Profil dan panel kanan menampilkan jenisnya (puncak cembung atau lengkung cekung), L dan K, stasiun dan elevasi BVC serta EVC, dan titik tertinggi atau terendahnya jika ada di dalam lengkung.

K dihitung dari L (K = L dibagi selisih aljabar kelandaian, dalam persen). Anda mengetik L; mengetik K langsung belum tersedia.

Jika lengkung vertikal tidak muat, kotak merah menyatakan alasannya: ia masuk kembali ke PVI atau lengkung sebelumnya, atau melewati PVI berikutnya, dan berapa ruang yang tersedia di sisi itu (lengkung memerlukan setengah panjangnya di tiap sisi PVI). Tombolnya mengatur **lengkung terpanjang yang muat**, dengan K-nya, sebagai satu langkah ({{key:Mod+Z}} membatalkannya). Atau jauhkan PVI-nya.

## Baca faktanya

Di bawah tabel PVI, sebuah daftar memberi tiap kelandaian dalam persen ("Kelandaian 1: +1.25%") dan tiap lengkung, misalnya "Puncak cembung di 2+00.00: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)", lalu "Titik tertinggi 1+62.40, 254.12".

Jika PVI tidak mencapai kedua ujung alinyemen, sebuah catatan menyatakannya. Koridor hanya dibangun di tempat profil dan alinyemen tumpang tindih.

## Garis fitur dalam profil

Garis fitur juga tampil di tampilan profil, sehingga Anda dapat melihat kereb, parit, atau puncak dinding terhadap profil jalan.

- Di tempat garis fitur **memotong** alinyemen, profil menampilkan belah ketupat kecil di stasiun dan elevasi itu, diberi label dengan nama garisnya dan elevasinya di sana (elevasi garis itu sendiri, dihitung sepanjang segmen yang memotong).
- Ketik jarak di {{ui:Sejajar dalam jarak}} untuk juga menggambar garis fitur yang **berjalan di samping** alinyemen dalam jarak itu, sebagai garis putus-putus pada elevasinya sendiri. Kosong atau 0 hanya menampilkan perpotongan.
- Tanda dan label mengikuti setiap perubahan: pindahkan simpul, ketik kelandaian, atau naikkan garis, dan profil langsung menampilkan elevasi baru.
- Klik belah ketupat perpotongan untuk memilih garis fitur itu; garis yang dipilih digambar dengan warna sorotan.
- {{ui:Garis fitur}} di bilah profil menyembunyikan atau menampilkan semuanya. Kedua pengaturan disimpan bersama proyek.

Lihat [Garis fitur](topic:feature-lines).

## Berikutnya

- [Sweep koridor jalan](topic:corridor) sepanjang alinyemen dan profil ini.
- Profil ditulis ke LandXML bersama alinyemen; lihat [Ekspor LandXML](topic:landxml).
