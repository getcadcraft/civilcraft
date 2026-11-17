---
title: Kekunci huraian dan kod garisan
summary: Tukar kod medan kepada kumpulan titik dengan huraian, dan sambungkan titik berkod menjadi garisan (mula, tamat, tutup) yang menjadi garis putus.
keywords: kekunci huraian, kod medan, kod garisan, rajah, garisan, mula, tamat, tutup, kumpulan titik, kod, kod tinjauan, pengumpul data, garis putus, kerb, tepi turapan
from: b3d1af8d
---

Krew ukur mengekod setiap bacaan di lapangan: `EP` untuk tepi turapan, `TC` untuk bahagian atas kerb, `BLDG` untuk sudut bangunan. Kod ialah perkataan pertama huraian titik itu. CivilCraft mengumpulkan titik mengikutnya, dan menukar kod garisan selepasnya menjadi garisan.

## Kod garisan

Kod garisan ialah perkataan selepas kod medan:

| Huraian | Maksud |
|---|---|
| `EP B` | Mulakan garisan tepi turapan baharu pada titik ini |
| `EP` | Teruskan garisan EP semasa |
| `EP E` | Tamatkan garisan EP semasa pada titik ini |
| `BLDG C` | Tutup bangunan: sambungkan titik ini kembali ke titik pertama garisan |

Titik dengan kod yang sama disambungkan mengikut tertib nombor titik. Kod yang berbeza ialah garisan yang berbeza walaupun mereka berkongsi kumpulan, jadi `EP1` dan `EP2` memberi dua tepi serentak. Kod yang tidak pernah menggunakan kod garisan disambungkan melalui semua titiknya, seperti dalam versi terdahulu.

Garisan dalam kumpulan yang digunakan sebagai **Garis putus** menjadi garis putus, satu bagi setiap garisan, supaya kerb yang mempunyai jurang tidak diregangkan merentasi jurang itu. Garisan dalam kumpulan lain dilukis pada pelan (lapisan V-NODE-LINE) dan keluar dalam DXF, DWG dan PDF.

Perkataan untuk mula, tamat dan tutup ialah `B`, `BEG`, `START`; `E`, `END`; dan `C`, `CLO`, `CLOSE`. Tukarkannya, atau matikan kod garisan, dalam dialog di bawah.

## Kekunci huraian

Kekunci huraian menukar kod kepada kumpulan titik, kegunaan dan huraian panjang.

1. Di bawah **Titik**, klik {{ui:Kekunci huraian dan kod garisan}}.
2. Klik {{ui:Tambah kekunci}} dan isi baris itu:
   - **Kod**: kod medan untuk dipadankan. `*` mewakili mana-mana aksara dan `?` untuk satu, jadi `EP*` menangkap EP, EP1 dan EP12.
   - **Kumpulan**: kumpulan titik yang disertai titik ini (kosong = kod itu sendiri). `EP*` dengan kumpulan `EP` meletakkan EP1 dan EP2 dalam satu kumpulan walaupun mereka kekal sebagai garisan berasingan.
   - **Guna**: Titik, Garis putus atau Dikecualikan, apabila kumpulan itu mula-mula muncul (atau biarkan kepada jadual **Titik**).
   - **Huraian**: nama panjang, ditunjukkan dalam **Sifat** titik.
3. Lajur **Titik** mengira titik yang setiap kekunci tangkap semasa anda menaip. Kekunci pertama yang sepadan dengan kod menang.
4. Klik {{ui:Guna}}. Kumpulan, permukaan dan pelan mengikut dalam satu langkah: {{key:Mod+Z}} membatalkannya.

Kumpulan mengekalkan kegunaan yang anda beri dalam jadual **Titik**; kegunaan kekunci hanya menetapkannya untuk kumpulan yang baharu. Kekunci dan kod garisan disimpan dalam fail projek.
