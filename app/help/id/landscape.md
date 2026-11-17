---
title: Ruang kerja Lanskap
summary: Denah penanaman, grading, perkerasan, dinding, anak tangga, irigasi, dan lembar lanskap di atas tapak yang sama, permukaan yang sama, dan file yang sama dengan pekerjaan sipil.
keywords: lanskap, arsitektur lanskap, taman, penanaman, tanaman, pohon, grading, hardscape, perkerasan, irigasi, sprinkler, ruang kerja, desain tapak, denah lanskap
from: eea929d1
---

Ruang kerja Lanskap menempatkan alat desain lanskap pada tapak CivilCraft yang sudah Anda miliki: titik survei yang sama, tanah eksisting yang sama, permukaan rencana yang sama, dan file proyek yang sama.

## Membukanya

Pilih {{ui:Surface}} › {{ui:More}} › {{ui:Landscape workspace}}. Bilah alat kemudian menampilkan pilihan **Ruang kerja** dan grup **Lanskap**, dan grup Surface, Design, serta GIS menyingkir untuk memberi ruang. Pilih **Civil** di bawah Ruang kerja untuk kembali. CivilCraft mengingat ruang kerja yang terakhir Anda gunakan di komputer ini.

Panel kiri mendapat tiga bagian baru di bagian atas:

- **Tanaman**: daftar tanaman, untuk mencari dan memilih apa yang akan Anda tempatkan. Lihat [Daftar tanaman](topic:plant-list).
- **Pemeriksaan grading**: analisis kemiringan, panah aliran, dan genangan. Lihat [Grading](topic:landscape-grading).
- **Irigasi**: kepala dan pipa yang akan Anda tempatkan berikutnya, serta pengaturan sumber air. Lihat [Irigasi](topic:irrigation).

## Isi grup Lanskap

| Alat | Fungsinya | Topik |
|---|---|---|
| **Plant**, **Bed**, **Hedge** | Tanaman tunggal, bedengan yang diisi sesuai jarak tanam, pagar tanaman sepanjang garis | [Penanaman](topic:planting) |
| **Grade** | Platform, berm, swale, area grading dengan level titik dan kontur, pemeriksaan kemiringan dan aliran | [Grading](topic:landscape-grading) |
| **Hardscape** | Perkerasan, jalur, dinding, kerb, ramp, dan anak tangga yang mengikuti tanah | [Hardscape](topic:hardscape) |
| **Areas** | Area tanam: rumput, bedengan, padang rumput, dan penutup tanah dengan susunan, dipotong di sekitar hardscape | [Area tanam](topic:planted-areas) |
| **Levels** | Pengubah tanah berurutan dengan galian dan timbunan, level titik, panah kemiringan, garis potongan | [Pengubah tanah](topic:ground-modifiers), [Potongan](topic:landscape-sections) |
| **Irrigation** | Kepala, pipa, katup, jalur tetes, sumber air, jangkauan, dan pemeriksaan hidraulik | [Irigasi](topic:irrigation) |
| **More** | Dari garis (objek yang tetap terhubung ke garis gambar), jadwal tanaman, tabel tanaman, lembar kerja, grafik tanaman, objek bebas, lembar lanskap dan set terbit, ekspor IFC, ukuran dan label tanaman | [Objek dari garis gambar](topic:objects-from-lines), [Catatan tanaman](topic:plant-records), [Lembar kerja](topic:worksheets), [Lembar lanskap](topic:landscape-sheets), [Objek bebas](topic:freeform-objects) |

Semua yang Anda tambahkan adalah satu langkah urungkan, disimpan dalam file proyek, dan digambar di denah pada layer bernama `L-PLNT-…`, `L-GRAD-…`, `L-HARD-…`, dan `L-IRRG-…`, sehingga ekspor DXF, DWG, dan PDF ikut memuatnya.

## Satu permukaan untuk semuanya

Platform, berm, swale, area grading, perkerasan, dan jalur di-grading ke dalam **permukaan rencana**, yang sama dengan yang dipakai koridor dan pad. **Tanah eksisting** tidak pernah berubah. Tanaman berada di atas tanah apa pun yang ada di bawahnya, jadi mereka ikut bergerak saat grading berubah. Pekerjaan tanah menghitung grading lanskap bersama semua yang lain.

:::tip
Baru mengenalnya? [Merancang taman dari awal sampai akhir](topic:landscape-walkthrough) membahas seluruh ruang kerja di lokasi contoh.
:::
