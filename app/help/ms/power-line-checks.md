---
title: Semakan talian kuasa
summary: Apa yang CivilCraft semak pada setiap talian dan kabel, sentiasa dikemas kini: ruang bebas, jarak, ayunan, angkatan, beban penyokong dan penentuan saiz, aksesori, tegang, asas, data yang hilang, sambungan, beban lampau dan susut voltan.
keywords: semakan, ruang bebas, halangan, persilangan, jarak fasa, ayunan penebat, angkatan, beban penyokong, beban nominal, penentuan saiz, asas, tegang, penegang, aksesori, rasuk silang, susut voltan, beban lampau, data hilang, tidak bersambung
from: e6a0da47
---

**Semakan** dalam bahagian Talian kuasa menyenaraikan setiap masalah, merah untuk yang gagal dan kuning untuk amaran. Klik satu untuk memilih talian, penyokong, kabel atau peralatan yang berkaitan; penyokong dan rentang yang gagal dibulatkan merah pada pelan semasa ruang kerja dibuka.

:::warning
Alat bantu reka bentuk: ini ialah semakan reka bentuk anda terhadap peraturan anda sendiri, bukan pensijilan.
:::

## Ruang bebas

Fasa paling rendah konduktor diikuti sepanjang setiap rentang pada setiap kes beban. Ruang bebas terendahnya di atas tanah mesti mencapai **Peraturan ruang bebas** talian itu. Di tempat rentang melintasi **halangan** (dilukis dengan {{ui:Halangan}}: titik atau garisan, dengan ketinggiannya di atas tanah dan peraturan ruang bebasnya sendiri), ruang bebas di atas puncak halangan disemak dengan cara yang sama.

**Apa yang diletakkan ruang kerja Landskap di atas tanah turut dikira.** Tumbuhan tunggal (kanopinya pada sebaran dan ketinggian matang), pagar dan kawasan tanaman (spesies tertinggi di dalamnya) serta dinding (puncaknya) ialah halangan di bawah talian, tanpa perlu melukisnya semula. Ia mengekalkan peraturan yang ditetapkan dalam {{ui:Kes beban dan had…}}: **Tumbuhan landskap di bawah talian** (set contoh menggunakan *Pokok dan tumbuhan*, 3 m) dan **Dinding landskap di bawah talian** (*Bangunan*); pilih **Tidak disemak** untuk mengecualikannya. Ruang bebas diukur terus ke atas dari puncak tumbuhan atau dinding ke konduktor di tempat rentang melintasinya; jarak mendatar ke kanopi di sebelah talian tidak disemak. Mengalih pokok atau menaikkan dinding serta-merta mengubah semakan.

Peraturan ruang bebas anda ialah milik anda sendiri: buka dengan **Peraturan…** di sebelah mana-mana **Peraturan ruang bebas** (atau {{ui:Kes beban dan had…}}) untuk menambah, menamakan semula, menukar atau mengalih keluarnya.

## Jarak dan ayunan

- **Jarak fasa** diperlukan: k·√(lendutan + panjang penebat) + U/150, dengan lendutan kes panas dan voltan U dalam kV (bentuk lazim; k ialah milik set peraturan anda). Dibandingkan dengan jarak fasa rasuk silang.
- **Ayunan penebat** pada penyokong gantung, di bawah kes angin: atan(beban melintang ÷ beban menegak), berbanding ayunan terbesar set peraturan.
- **Angkatan**: penyokong gantung yang lebih rendah daripada jirannya boleh ditarik ke atas pada musim sejuk; ia ditandakan.

## Beban penyokong dan penentuan saiz

Bagi setiap penyokong dan setiap kes beban, dengan setiap konduktor talian:

- **Melintang**: angin per meter × rentang angin (separuh daripada dua rentang), tambah 2·H·sin(pusingan ÷ 2) pada pusingan.
- **Sepanjang talian**: beza tegangan kedua-dua belah pada hujung mati atau sudut; pada penyokong gantung hanya di bawah ais di satu belah (setiap rentang dikira sendiri, yang tersalah ke arah selamat).
- **Menegak**: beban menegak per meter × rentang berat (antara titik terendah di kedua-dua belah) tambah peralatan.

Beban mendatar dibawa ke titik nominal penyokong (beban setara = beban × ketinggian lampiran ÷ ketinggian titik nominal) dan dibandingkan dengan **beban nominal** penyokong × faktor set peraturan. Apabila terlalu lemah, penyokong terkecil daripada bahan yang sama dalam pustaka anda yang boleh memikulnya dicadangkan. Penyokong dengan **tegang** memindahkan beban mendatar kepada tegang, yang memikul beban ÷ sin(sudut tegang) dan disemak terhadap pengukurannya sendiri.

Aksesori (klem, penebat, rasuk silang) disemak terhadap beban terkadarnya: aksesori penambat memikul tegangan konduktor, aksesori gantung memikul bahagiannya daripada beban menegak dan melintang. **Asas** yang ditunjukkan ialah kedalaman penyokong dalam tanah dan lubang yang sedikit lebih lebar daripada tapaknya.

## Data, sambungan dan arus

- Item yang medan diperlukannya kosong, atau kunci yang tiada dalam pustaka.
- Hujung laluan kabel, atau peralatan, tidak bersambung dengan apa-apa.
- **Susut voltan** dan **arus** dari setiap sumber (peralatan yang ditandakan sebagai sumber) ke beban (kW dan faktor kuasa pada peralatan), sepanjang rentang atas kepala dan kabel: √3·I·L·(R cos φ + X sin φ), dengan R pada 20 °C. Lebih daripada kadar arus kabel, atau lebih banyak susut daripada yang dibenarkan set peraturan, ditandakan.
