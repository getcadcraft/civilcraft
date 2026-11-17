---
title: Reka bentuk pengairan
summary: Alat pengiraan, bukan reka bentuk bercop: kepala pancutan, paip sisi, saluran utama, injap dan talian titisan di tapak; zon yang ditemui daripada paip; kehilangan tekanan mengikut Hazen–Williams, kepala kes terburuk, aliran dan tekanan berbanding bekalan, kadar hujan, masa operasi, liputan dan senarai bahan.
keywords: pengairan, pemercik, semburan, rotor, muncung berputar, pembuih, titisan, talian titisan, pemancar, injap, zon, stesen, pengawal, saluran utama, paip sisi, titik sambungan, bekalan air, tekanan, psi, kpa, aliran, gpm, kehilangan geseran, hazen williams, kadar hujan, masa operasi, liputan, hujung ke hujung, senarai bahan
from: 7d6342c1
---

:::warning
Ini alat pengiraan, bukan reka bentuk bercop: pereka pengairan menyemak setiap keputusan sebelum apa-apa dibina.
:::

## Susun atur sistem

1. Dalam bahagian **Pengairan** di sebelah kiri, pilih **Kepala pancutan**, **Lengkok** dan tempat lengkok bermula, serta saiz paip untuk paip sisi dan saluran utama.
2. {{ui:Pengairan}} › {{ui:Titik sambungan}}: klik tempat bekalan air menyambung. Tetapkan **tekanannya**, **aliran tersedia** dan kehilangan meter serta pencegah aliran balik dalam Sifat.
3. {{ui:Pengairan}} › {{ui:Injap}}: klik tempat injap setiap zon pergi. Injap memulakan zon.
4. {{ui:Pengairan}} › {{ui:Kepala pancutan}}: klik untuk meletakkan kepala; setiap klik meletakkan satu.
5. {{ui:Pengairan}} › {{ui:Paip sisi}}: klik dari injap melalui kepala pancutannya dan tekan {{key:Enter}}. {{ui:Saluran utama}}: dari titik sambungan ke setiap injap.

Hujung paip melekat (snap) pada kepala pancutan, injap, bekalan dan hujung paip lain, jadi rangkaian bersambung. Zon ialah semua yang dicapai dari injapnya melalui paip sisi; saluran utama membawa satu zon pada satu masa.

## Titisan

{{ui:Pengairan}} › {{ui:Talian titisan}}: klik sepanjang talian, bermula di tempat ia disalurkan (hujung paip sisi atau injap). Tetapkan **aliran pemancar** dan **jarak** dalam Sifat; alirannya ialah jumlah pemancar di sepanjangnya.

## Semakan

{{ui:Pengairan}} › {{ui:Semak sistem…}} menyenaraikan setiap zon:

| Lajur | Cara ia dikira |
|---|---|
| Aliran | Jumlah aliran kepala pancutan (dan talian titisan) |
| Di injap | Tekanan kerja kepala kes terburuk ditambah kehilangan paip ke sana (Hazen–Williams, diameter dalam paip, perubahan aras) dan kehilangan melalui injap |
| Di bekalan | Sama, ditambah kehilangan saluran utama yang membawa zon itu, dan kehilangan meter serta pencegah aliran balik |
| Hujan | Aliran kepala pancutan dibahagi dengan kawasan yang disiramnya pada jarak hujung ke hujung |
| Minit seminggu | Untuk menggunakan tetapan **Air seminggu** |
| Masalah | Halaju melebihi had, kepala di luar julat tekanannya, semburan dan rotor pada satu injap, tekanan atau aliran tidak mencukupi di bekalan, kepala tanpa zon, gelung |

Pilih injap untuk melihat angka zonnya dan kepala kes terburuknya dikelilingi pada pelan. Senarai bahan mengira kepala mengikut jenis dan lengkok, paip mengikut saiz, injap, talian titisan dan pemancar, serta stesen pengawal. {{ui:Simpan sebagai CSV}} menyimpan kedua-duanya.

Tetapan dalam bahagian Pengairan: **Hazen–Williams C** (150 untuk paip plastik baharu), **halaju maksimum** dalam paip (1.5 m/s), **kehilangan melalui injap**, dan **air seminggu**. Ia ialah nilai lalai berlabel.

## Liputan

{{ui:Pengairan}} › {{ui:Tunjuk liputan}} memberitahu berapa banyak kawasan yang dibiarkan kering oleh kepala pancutan, berapa banyak yang dibasahi oleh dua atau lebih kepala, dan kepala mana yang tidak mencapai jiran (jarak hujung ke hujung).

## Kepala pancutan

Kepala yang disenaraikan ialah jenis **generik** yang ditulis oleh CadCraft daripada kadar hujan reka bentuk (pemercik tetap, muncung berputar, rotor gear, pembuih, mikro-semburan, pemancar), bukan produk mana-mana pengilang. **Tambah kepala daripada fail…** membaca kepala anda sendiri (senarai JSON dengan lontaran, aliran atau kadar hujan setiap kepala, dan julat tekanan); ia disimpan bersama projek. Data terbitan pengilang hanya dimasukkan dengan kebenaran yang direkodkan daripada pengilang itu.

Di bawah kepala generik, senarai mempunyai **kepala tipikal** (nama mereka berakhir dengan "nilai tipikal"): saiz muncung pemercik tetap, muncung berputar dan rotor gear, mikro-semburan, pembuih dan pemancar, dengan radius, aliran dan julat tekanan. Ia dikira oleh CadCraft daripada matematik yang diterbitkan (persamaan orifis untuk aliran, penskalaan lontaran jet untuk radius) dan kelas aliran nominal, daripada sumber terbuka sahaja; tiada jadual pengilang disalin. Pilih satu dan pemilih menunjukkan asas dan lesennya. Projek yang menggunakannya menyimpan kepala dan sumbernya dalam fail projek. Ia untuk perancangan: semak data kepala sebenar sebelum membina.
