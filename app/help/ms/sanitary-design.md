---
title: Kira aliran reka bentuk kumbahan dan semak pembetung
summary: Masukkan orang dan kawasan yang masuk di setiap lubang periksa rangkaian kumbahan; CivilCraft menjumlahkannya ke bawah rangkaian, mengira aliran puncak dengan faktor puncak dan penyusupan, serta menyemak kapasiti dan halaju setiap paip.
keywords: kumbahan, pembetung, pembetung kumbahan, air sisa, aliran reka bentuk, aliran puncak, faktor puncak, harmon, babbitt, penyusupan, populasi, setiap kapita, peratus penuh, pembersihan sendiri, halaju, saiz paip, helaian reka bentuk
from: 73ba197a
---

Aliran reka bentuk kumbahan berfungsi pada [rangkaian paip](topic:pipe-network) apabila {{ui:Jenis}} ialah {{ui:Kumbahan}}. Tanpa apa-apa dipilih, panel kanan kemudian menunjukkan **Aliran reka bentuk kumbahan** di tempat rangkaian saliran ribut menunjukkan saliran ribut.

## Masukkan apa yang masuk

1. Pilih lubang periksa. Di bawah **Aliran reka bentuk kumbahan**, taip {{ui:Orang yang masuk di sini}} dan {{ui:Kawasan yang masuk di sini}} (hektar dalam projek meter, ekar dalam projek kaki).
2. Bagi kedai, pejabat atau industri, taip orang setara: kawasan didarab dengan orang setiap hektar (atau ekar) yang digunakan agensi anda. Kawasan dikira untuk penyusupan dalam kedua-dua cara.
3. Ulang untuk setiap lubang periksa tempat jalan atau lot bersambung. Lubang periksa yang tiada apa-apa bersambung kekal pada 0 bagi kedua-duanya.

Setiap paip membawa semua yang masuk di lubang periksa atasnya dan di atasnya. Pilih lubang periksa untuk melihat apa yang melaluinya.

## Tetapan

| Tetapan | Maksudnya |
|---|---|
| {{ui:Aliran setiap orang}} | aliran purata seorang sehari: liter (projek meter) atau gelen AS (projek kaki) |
| {{ui:Penyusupan}} | air bawah tanah yang bocor masuk: liter sesaat setiap hektar, atau gelen sehari setiap ekar |
| {{ui:Faktor puncak}} | Harmon, 1 + 14 / (4 + √P), atau Babbitt, 5 / P^0.2, dengan P ialah populasi dalam ribu |
| {{ui:Faktor puncak sekurang-kurangnya}} / {{ui:Faktor puncak paling banyak}} | faktor dikekalkan antara kedua-dua ini |
| {{ui:Manning n}} | untuk kapasiti dan halaju |
| {{ui:Halaju terkecil}} / {{ui:Halaju terbesar}} | pada kedalaman aliran puncak itu sendiri dalam paip |
| {{ui:Paling banyak kapasiti penuh}} | sejauh mana penuh paip boleh beroperasi pada puncak, sebagai peratus daripada apa yang dibawanya apabila mengalir penuh |

Nilai permulaan ialah nilai sementara, bukan piawaian. Gunakan nilai yang diterbitkan agensi anda.

## Apa yang dikira

Bagi setiap paip, mengikut urutan aliran:

- aliran puncak = orang × aliran setiap orang × faktor puncak + kawasan × penyusupan
- kapasiti mengalir penuh (persamaan Manning pada cerun paip), dan sejauh mana penuh puncak itu menjadikannya
- kedalaman normal aliran puncak dan halaju di situ

Jadual **Keputusan kumbahan** menyenaraikan orang bagi setiap paip, faktor puncak, aliran puncak (L/s, atau gpm dan kaki padu sesaat), peratus penuh dan halaju. Masalah disenaraikan di bawahnya: paip yang lebih penuh daripada had, lebih perlahan daripada halaju terkecil (ia mungkin tidak membersihkan dirinya), lebih laju daripada yang terbesar, atau tanpa kejatuhan. {{ui:Saiz paip untuk aliran ini}} memilih bagi setiap paip saiz piawai terkecil (200 mm atau 8 inci ke atas) yang membawa puncaknya dalam had; satu {{key:Mod+Z}} membatalkannya.

:::note
Ini ialah aliran puncak mantap yang dikira oleh helaian reka bentuk, disemak terhadap helaian reka bentuk yang diterbitkan hingga pembundaran yang dicetak. Ia bukan model pembetung sepanjang masa: tiada hidrograf, storan, pam atau limpahan. Lihat [Belum dibina](topic:not-built-yet).
:::

Halaju menggunakan persamaan Manning dengan n yang sama pada setiap kedalaman. Sesetengah carta separa penuh agensi membenarkan n berubah mengikut kedalaman, yang memberikan halaju sedikit lebih rendah dalam paip yang mengalir 60 hingga 70 peratus penuh (kira-kira 3 peratus kurang).
