---
title: Kunci deskripsi dan kode garis
summary: Ubah kode lapangan menjadi grup titik dengan deskripsi, dan gabungkan titik berkode menjadi garis (mulai, akhir, tutup) yang menjadi breakline.
keywords: kunci deskripsi, kode lapangan, kode garis, figur, linework, mulai, akhir, tutup, grup titik, kode, kode survei, data collector, breakline, kerb, tepi perkerasan
from: b3d1af8d
---

Regu survei memberi kode pada setiap tembakan di lapangan: `EP` untuk tepi perkerasan, `TC` untuk puncak kerb, `BLDG` untuk sudut bangunan. Kode adalah kata pertama dari deskripsi titik. CivilCraft mengelompokkan titik berdasarkan kode itu, dan mengubah kode garis yang mengikutinya menjadi garis.

## Kode garis

Kode garis adalah kata tepat setelah kode lapangan:

| Deskripsi | Artinya |
|---|---|
| `EP B` | Mulai garis tepi perkerasan baru di titik ini |
| `EP` | Lanjutkan garis EP saat ini |
| `EP E` | Akhiri garis EP saat ini di titik ini |
| `BLDG C` | Tutup bangunan: hubungkan titik ini kembali ke titik pertama garis |

Titik dengan kode yang sama digabungkan menurut urutan nomor titik. Kode yang berbeda adalah garis yang berbeda meskipun berbagi grup, sehingga `EP1` dan `EP2` memberi dua tepi sekaligus. Kode yang tidak pernah memakai kode garis digabungkan melalui semua titiknya, seperti pada versi sebelumnya.

Garis dalam grup yang dipakai sebagai **Breakline** menjadi breakline, satu per garis, sehingga kerb yang terputus tidak direntangkan melintasi celahnya. Garis dalam grup lain digambar pada denah (layer V-NODE-LINE) dan ikut ke DXF, DWG dan PDF.

Kata untuk mulai, akhir dan tutup adalah `B`, `BEG`, `START`; `E`, `END`; dan `C`, `CLO`, `CLOSE`. Ubah kata-kata itu, atau matikan kode garis, di dialog di bawah ini.

## Kunci deskripsi

Kunci deskripsi mengubah kode menjadi grup titik, penggunaan, dan deskripsi panjang.

1. Di bawah **Titik**, klik {{ui:Kunci deskripsi dan kode garis}}.
2. Klik {{ui:Tambah kunci}} dan isi barisnya:
   - **Kode**: kode lapangan yang dicocokkan. `*` berarti karakter apa pun dan `?` berarti satu karakter, sehingga `EP*` menangkap EP, EP1 dan EP12.
   - **Grup**: grup titik tempat titik-titik ini bergabung (kosong = kode itu sendiri). `EP*` dengan grup `EP` menempatkan EP1 dan EP2 dalam satu grup selama keduanya tetap menjadi garis terpisah.
   - **Penggunaan**: Titik, Breakline atau Dikeluarkan, untuk saat grup pertama muncul (atau biarkan tabel **Titik** yang menentukannya).
   - **Deskripsi**: nama panjang, ditampilkan di **Properti** titik.
3. Kolom **Titik** menghitung titik yang ditangkap setiap kunci saat Anda mengetik. Kunci pertama yang cocok untuk sebuah kode menang.
4. Klik {{ui:Terapkan}}. Grup, permukaan dan denah mengikuti dalam satu langkah: {{key:Mod+Z}} membatalkannya.

Sebuah grup mempertahankan penggunaan yang Anda berikan di tabel **Titik**; penggunaan kunci hanya mengaturnya untuk grup yang baru. Kunci dan kode garis disimpan dalam file proyek.
