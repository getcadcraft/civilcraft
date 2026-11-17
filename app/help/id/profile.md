---
title: Merancang profil vertikal
summary: Buka tampilan profil, mulai profil desain dari tanah, tambahkan dan seret PVI, atur panjang kurva vertikal, dan baca kelandaian, nilai K, serta titik tinggi dan rendah.
keywords: profil, alinyemen vertikal, pvi, kurva vertikal, kelandaian, nilai k, puncak, lengkung cekung, bvc, evc, tampilan profil, kelandaian akhir, fg, profil tanah eksisting, garis fitur dalam profil, persilangan, proyeksi, tepi trotoar, parit, label
from: e9182bfa
---

Setiap alinyemen memiliki satu profil desain: daftar PVI (stasiun dan elevasi) yang dihubungkan oleh kelandaian lurus, dengan kurva vertikal parabola simetris di setiap PVI antara yang memiliki panjang. Profil tanah eksisting diambil sampelnya dari permukaan untuk Anda.

## Buka tampilan profil

1. Pilih alinyemen (klik dengan {{ui:Pilih}}).
2. Tekan {{key:R}}, atau klik {{ui:Profil}} di bilah alat, atau {{ui:Tampilan profil}} di bagian bawah panel kanan.
   Tampilan profil terbuka di bawah denah dengan tanah eksisting sepanjang alinyemen. Dengan dua alinyemen atau lebih, pilih salah satu di daftar di sisi kiri bilah profil.

Tampilan selalu menampilkan seluruh alinyemen dan meregangkan elevasi untuk mengisi panel; besaran pelebihan ditampilkan di pojok kiri bawah, misalnya "Pelebihan vertikal 10×". Tampilan tidak dapat di-zoom atau digeser.

Gerakkan penunjuk di sepanjang profil: bilah menampilkan stasiun, elevasi tanah dan desain, kelandaian serta galian atau timbunan di titik itu, dan sebuah titik mengikuti di alinyemen pada denah.

## Mulai profil desain

1. Di panel kanan di bawah **Profil desain**, klik {{ui:Mulai dari tanah}}.
   Dua PVI ditempatkan di tanah pada dua ujung alinyemen, dihubungkan oleh satu kelandaian lurus. Bilah status menyatakan "Profil desain dimulai di tanah pada kedua ujung. Aktifkan Tambah PVI dan klik untuk menambahkan perubahan kelandaian; beri panjang kurva di tabel."

Jika alinyemen tidak memotong permukaan, Anda akan mendapat "Alinyemen ini tidak memiliki tanah di bawahnya untuk dimulai." Maka tambahkan PVI dengan mengklik (bagian berikutnya).

## Tambah PVI

1. Tekan {{key:I}}, atau klik {{ui:Tambah PVI}} di bilah profil. Tombol tetap ditekan.
2. Klik di profil tempat Anda ingin perubahan kelandaian. PVI ditambahkan di stasiun dan elevasi tersebut, dibulatkan ke 0,01, dan dipilih.
3. Tambahkan sebanyak yang Anda perlukan, lalu tekan {{key:I}} lagi untuk berhenti menambah.

Klik di tempat yang sudah ada PVI ditolak ("Sudah ada PVI di …"). PVI selalu tetap dalam urutan stasiun.

## Sesuaikan PVI

- **Seret** PVI di profil untuk memindahkannya. Ia tidak dapat melewati tetangganya. Pemindahan adalah satu langkah urungkan.
- **Ketik** nilai yang tepat di tabel PVI di panel kanan: **Stasiun**, **Elevasi**, dan **Kurva L** (panjang kurva vertikal). Tekan {{key:Enter}} setelah setiap nilai.
- **Hapus** PVI dengan tanda x di ujung barisnya, atau pilih (klik) dan tekan {{key:Delete}}. Saat tampilan profil memiliki fokus, {{key:Backspace}} juga menghapusnya.

PVI pertama dan terakhir tidak pernah mendapat kurva.

## Kurva vertikal

1. Ketik panjang di **Kurva L** untuk PVI antara, misalnya 200.
2. Kurva digambar berpusat pada PVI. Profil dan panel kanan menampilkan jenisnya (puncak atau lengkung cekung), L dan K, stasiun dan elevasi BVC dan EVC, serta titik tinggi atau rendahnya jika ada di dalam kurva.

K dihitung dari L (K = L dibagi selisih aljabar kelandaian, dalam persen). Anda mengetik L; mengetik K secara langsung belum tersedia.

Jika kurva vertikal tidak muat, kotak merah menjelaskan alasannya: ia masuk kembali ke PVI atau kurva sebelumnya, atau melewati PVI berikutnya, dan berapa ruang yang tersedia di sisi itu (kurva memerlukan setengah panjangnya di setiap sisi PVI-nya). Tombolnya menetapkan **kurva terpanjang yang muat**, beserta K-nya, sebagai satu langkah ({{key:Mod+Z}} membatalkannya). Atau jauhkan PVI-nya.

## Baca faktanya

Di bawah tabel PVI, sebuah daftar memberikan setiap kelandaian dalam persen ("Kelandaian 1: +1.25%") dan setiap kurva, misalnya "Puncak di 2+00.00: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)", lalu "Titik tinggi 1+62.40, 254.12".

Jika PVI tidak mencapai kedua ujung alinyemen, catatan akan menyatakannya. Koridor hanya dibangun di tempat profil dan alinyemen tumpang tindih.

## Garis fitur dalam profil

Garis fitur juga ditampilkan di tampilan profil, sehingga Anda dapat melihat tepi trotoar, parit, atau puncak dinding terhadap profil jalan.

- Di tempat garis fitur **memotong** alinyemen, profil menampilkan belah ketupat kecil di stasiun dan elevasi tersebut, diberi label dengan nama garis dan elevasinya di sana (elevasi garis itu sendiri, dihitung sepanjang segmen yang memotong).
- Ketik jarak di {{ui:Sejajar dalam jarak}} untuk juga menggambar garis fitur yang **berjalan di sisi** alinyemen dalam jarak itu, sebagai garis putus-putus pada elevasinya sendiri. Kosong atau 0 hanya menampilkan persilangan.
- Tanda dan label mengikuti setiap perubahan: pindahkan verteks, ketik kelandaian, atau naikkan garis, dan profil langsung menampilkan elevasi yang baru.
- Klik belah ketupat persilangan untuk memilih garis fitur itu; garis yang dipilih digambar dengan warna sorot.
- {{ui:Garis fitur}} di bilah profil menyembunyikan atau menampilkan semuanya. Kedua pengaturan disimpan bersama proyek.

Lihat [Garis fitur](topic:feature-lines).

## Berikutnya

- [Sweep koridor jalan](topic:corridor) sepanjang alinyemen dan profil ini.
- Profil ditulis ke LandXML bersama alinyemen; lihat [Pertukaran LandXML](topic:landxml).
