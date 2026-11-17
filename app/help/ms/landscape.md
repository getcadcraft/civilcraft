---
title: Ruang kerja Landskap
summary: Pelan penanaman, penggredan, turapan, dinding, anak tangga, pengairan dan helaian landskap pada tapak yang sama, permukaan yang sama dan fail yang sama dengan kerja awam.
keywords: landskap, seni bina landskap, taman, penanaman, tumbuhan, pokok, penggredan, landskap keras, turapan, pengairan, pemercik, ruang kerja, reka bentuk tapak, pelan landskap
from: eea929d1
---

Ruang kerja Landskap meletakkan alat reka bentuk landskap pada tapak CivilCraft yang sudah anda ada: titik tinjauan yang sama, tanah sedia ada yang sama, permukaan cadangan yang sama dan fail projek yang sama.

## Buka ruang kerja

Pilih {{ui:Permukaan}} › {{ui:Lagi}} › {{ui:Ruang kerja landskap}}. Bar alat kemudian memaparkan pilihan **Ruang kerja** dan kumpulan **Landskap**, dan kumpulan Permukaan, Reka bentuk dan GIS diketepikan untuk memberi ruang. Pilih **Awam** di bawah Ruang kerja untuk kembali. CivilCraft mengingati ruang kerja yang terakhir anda gunakan pada komputer ini.

Panel kiri mendapat tiga bahagian di bahagian atas:

- **Tumbuhan**: senarai tumbuhan, untuk mencari dan memilih apa yang anda letakkan. Lihat [Senarai tumbuhan](topic:plant-list).
- **Semakan penggredan**: analisis cerun, anak panah aliran dan pengumpulan air. Lihat [Penggredan](topic:landscape-grading).
- **Pengairan**: kepala dan paip yang anda letakkan seterusnya, tetapan bekalan air. Lihat [Pengairan](topic:irrigation).

## Apa yang ada dalam kumpulan Landskap

| Alat | Apa fungsinya | Topik |
|---|---|---|
| **Tumbuhan**, **Katil**, **Pagar hidup** | Tumbuhan tunggal, katil penanaman yang diisi pada jarak tumbuhan, pagar hidup di sepanjang garisan | [Penanaman](topic:planting) |
| **Gred** | Pelantar, benteng tanah, parit resapan, kawasan penggredan dengan aras titik dan kontur, semakan cerun dan aliran | [Penggredan](topic:landscape-grading) |
| **Landskap keras** | Turapan, laluan, dinding, kerb, ramp dan anak tangga yang mengikut tanah | [Landskap keras](topic:hardscape) |
| **Kawasan** | Kawasan tanaman: laman, katil, padang rumput dan penutup tanah dengan binaan, dipotong di sekeliling landskap keras | [Kawasan tanaman](topic:planted-areas) |
| **Aras** | Pengubah tanah mengikut susunan dengan potongan dan tambakan, aras titik, anak panah kecerunan, garisan keratan | [Pengubah tanah](topic:ground-modifiers), [Keratan](topic:landscape-sections) |
| **Pengairan** | Kepala, paip, injap, paip titisan, bekalan, liputan dan semakan hidraulik | [Pengairan](topic:irrigation) |
| **Lagi** | Daripada garisan (objek kekal berpaut kepada garisan), jadual tumbuhan, rekod jadual tumbuhan, lembaran kerja, grafik tumbuhan, objek bentuk bebas, helaian landskap dan set penerbitan, eksport IFC, saiz dan label tumbuhan | [Objek daripada garisan](topic:objects-from-lines), [Rekod tumbuhan](topic:plant-records), [Lembaran kerja](topic:worksheets), [Helaian landskap](topic:landscape-sheets), [Objek bentuk bebas](topic:freeform-objects) |

Setiap yang anda tambah ialah satu langkah buat asal, disimpan dalam fail projek, dan dilukis pada pelan pada lapisan bernama `L-PLNT-…`, `L-GRAD-…`, `L-HARD-…` dan `L-IRRG-…`, jadi eksport DXF, DWG dan PDF turut membawanya.

## Satu permukaan untuk semua

Pelantar, benteng tanah, parit resapan, kawasan penggredan, turapan dan laluan digred ke dalam **permukaan cadangan**, iaitu permukaan yang sama digunakan oleh koridor dan pad. **Tanah sedia ada** tidak pernah berubah. Tumbuhan duduk di atas mana-mana tanah yang berada di bawahnya, jadi ia bergerak apabila penggredan berubah. Kerja tanah mengira penggredan landskap bersama semua yang lain.

:::tip
Baharu dengan ini? [Reka bentuk taman, dari awal hingga akhir](topic:landscape-walkthrough) melalui keseluruhan ruang kerja pada tapak sampel.
:::
