---
title: Pustaka talian kuasa anda
summary: Buat konduktor, kabel bawah tanah, penyokong, peralatan dan jenis parit anda sendiri, dalam kategori yang anda namakan, dan kongsikannya sebagai fail.
keywords: pustaka, konduktor, kabel, tiang, penyokong, rasuk silang, penebat, aksesori, tegang, penegang, pengubah, kabinet, sambungan, parit, kategori, csv, import, eksport
from: 88733744
---

Bahagian **Pustaka** dalam ruang kerja Talian kuasa menyimpan setiap item yang boleh digunakan oleh talian atau kabel. Tiada apa-apa di dalamnya terikat kepada mana-mana negara atau pengeluar: anda membuat item yang anda gunakan.

## Tiga jenis item

| Jenis | Di mana ia disimpan | Bolehkah anda mengubahnya? |
|---|---|---|
| **Contoh** | Dihantar bersama CivilCraft, dengan nombor generik yang kami kira daripada sifat bahan | Tidak: {{ui:Salin ke pustaka saya}} dahulu |
| **Dalam projek** | Datang bersama fail projek yang anda buka | Tidak: {{ui:Salin ke pustaka saya}} dahulu |
| **Milik saya** | Item anda sendiri, disimpan dalam pelayar ini | Ya, dan perubahan disimpan serta-merta |

Setiap projek menyimpan salinan setiap item yang digunakannya, jadi projek dibuka pada mana-mana komputer dengan konduktor dan tiangnya sendiri.

:::warning
Item contoh ialah contoh sahaja: semak setiap nombor dengan data pembekal anda. Kabel bawah tanah sengaja tiada kadar arus, kerana ia bergantung pada cara kabel dipasang.
:::

## Buat item

1. Dalam **Pustaka**, pilih **Jenis** (konduktor talian atas, kabel bawah tanah, penyokong, peralatan atau jenis parit).
2. Klik {{ui:Item baharu}}, atau pilih contoh dan klik {{ui:Salin ke pustaka saya}} atau {{ui:Pendua}}.
3. Isikan medannya. Medan bertanda `*` ialah yang diperlukan oleh semakan; item yang tiada salah satunya ditandakan `!` dan disenaraikan di bawah **Semakan** apabila talian menggunakannya.
4. Berikan **Kategori**, dengan `/` antara peringkat: `Talian atas/LV/Berkelompok`, `Penyokong/Konkrit/12 m`. Pepohon mengikut kategori anda.

Setiap jenis memerlukan:

| Jenis | Diperlukan untuk semakan |
|---|---|
| Konduktor talian atas | keratan rentas, diameter, jisim per meter, kekuatan putus, modulus kenyal, pengembangan haba |
| Kabel bawah tanah | teras, keratan rentas, voltan, diameter, rintangan, kadar arus |
| Penyokong | panjang keseluruhan, beban nominal (diambil pada titik di bawah puncak), kedalaman dalam tanah |
| Peralatan | jenisnya; beban terkadar untuk rasuk silang, aksesori dan tegang; jarak fasa dan susut untuk rasuk silang; panjang untuk penebat; sudut untuk tegang |
| Jenis parit | kedalaman, lebar, penutup di atas kabel |

## Kongsikan

- {{ui:Simpan pustaka saya}} menyimpan setiap item anda sebagai satu fail `.cclines.json`; {{ui:Buka pustaka…}} membacanya semula (item dengan kunci yang sama digantikan).
- {{ui:Simpan sebagai CSV}} menyimpan jenis yang sedang anda lihat sebagai hamparan; {{ui:Buka pustaka…}} membaca semula CSV jenis itu. Lajur boleh datang dalam mana-mana susunan; fail berpisah koma bertitik boleh menggunakan koma perpuluhan.
