---
title: Pemeriksaan saluran listrik
summary: Apa yang diperiksa CivilCraft pada setiap saluran dan kabel, selalu mutakhir: jarak bebas, jarak, ayunan, uplift, beban tiang dan penentuan ukuran, perlengkapan, kabel penahan, pondasi, data yang hilang, sambungan, kelebihan beban, dan jatuh tegangan.
keywords: pemeriksaan, jarak bebas, jarak bebas tanah, penghalang, persilangan, jarak fasa, ayunan isolator, uplift, beban tiang, beban nominal, penentuan ukuran, pondasi, kabel penahan, stay, guy, perlengkapan, travers, jatuh tegangan, kelebihan beban, data hilang, tidak tersambung
from: e6a0da47
---

**Pemeriksaan** di bagian Saluran listrik mencantumkan setiap masalah, merah untuk yang gagal dan kuning untuk peringatan. Klik satu untuk memilih saluran, tiang, kabel, atau peralatan yang dimaksud; tiang dan bentang yang gagal diberi lingkaran merah di denah selama ruang kerja terbuka.

:::warning
Alat bantu desain: ini adalah pemeriksaan desain Anda terhadap aturan Anda sendiri, bukan sertifikasi.
:::

## Jarak bebas

Fase terendah konduktor diikuti di sepanjang setiap bentang pada setiap kasus beban. Jarak bebas terendahnya di atas tanah harus mencapai **Aturan jarak bebas** saluran. Jika bentang melintasi **penghalang** (digambar dengan {{ui:Penghalang}}: sebuah titik atau garis, dengan tinggi di atas tanah dan aturan jarak bebasnya sendiri), jarak bebas di atas puncak penghalang diperiksa dengan cara yang sama.

**Apa yang diletakkan ruang kerja Landscape di atas tanah juga dihitung.** Tanaman tunggal (tajuknya pada lebar dan tinggi dewasa), pagar dan bedengan tanaman (spesies tertinggi di dalamnya), dan dinding (bagian atasnya) menjadi penghalang di bawah saluran, tanpa perlu digambar ulang. Mereka mengikuti aturan yang ditetapkan di {{ui:Kasus beban dan batas…}}: **Tanaman Landscape di bawah saluran** (set contoh menggunakan *Pohon dan tanaman*, 3 m) dan **Dinding Landscape di bawah saluran** (*Bangunan*); pilih **Tidak diperiksa** untuk mengabaikannya. Jarak bebas diukur lurus ke atas dari puncak tanaman atau dinding ke konduktor di tempat bentang melintasinya; jarak ke samping ke tajuk di sebelah saluran tidak diperiksa. Memindahkan pohon atau menaikkan dinding langsung mengubah pemeriksaan.

Aturan jarak bebas Anda adalah aturan Anda sendiri: buka dengan **Aturan…** di samping **Aturan jarak bebas** mana pun (atau {{ui:Kasus beban dan batas…}}) untuk menambah, mengganti nama, mengubah, atau menghapusnya.

## Jarak dan ayunan

- **Jarak fasa** yang dibutuhkan: k·√(andongan + panjang isolator) + U/150, dengan andongan kasus panas dan tegangan U dalam kV (bentuk yang umum; k berasal dari set aturan Anda). Dibandingkan dengan jarak fasa travers.
- **Ayunan isolator** pada tiang suspensi, di bawah kasus angin: atan(beban transversal ÷ beban vertikal), dibandingkan dengan ayunan terbesar dalam set aturan.
- **Uplift**: tiang suspensi yang lebih rendah dari tetangganya dapat tertarik ke atas saat dingin; ini diberi tanda.

## Beban tiang dan penentuan ukuran

Untuk setiap tiang dan setiap kasus beban, dengan setiap konduktor pada saluran:

- **Transversal**: angin per meter × bentang angin (setengah dari dua bentang), ditambah 2·H·sin(belokan ÷ 2) pada belokan.
- **Sepanjang saluran**: selisih tegangan kedua sisi pada ujung mati atau sudut; pada tiang suspensi hanya di bawah es di satu sisi (setiap bentang dihitung sendiri, yang berada di sisi aman).
- **Vertikal**: beban vertikal per meter × bentang berat (di antara titik terendah di kedua sisi) ditambah peralatan.

Beban horizontal dibawa ke titik nominal tiang (beban ekuivalen = beban × tinggi pemasangan ÷ tinggi titik nominal) dan dibandingkan dengan **beban nominal** × faktor set aturan. Jika terlalu lemah, disarankan tiang terkecil dari bahan yang sama di pustaka Anda yang mampu memikulnya. Tiang dengan **kabel penahan** meneruskan beban horizontal ke kabel penahan, yang memikul beban ÷ sin(sudut kabel penahan) dan diperiksa terhadap peringkatnya sendiri.

Perlengkapan (klem, isolator, travers) diperiksa terhadap beban peringkatnya: perlengkapan penjangkaran memikul tegangan konduktor, perlengkapan suspensi memikul bagiannya dari beban vertikal dan transversal. **Pondasi** yang ditampilkan adalah kedalaman tiang di dalam tanah dan lubang yang sedikit lebih lebar dari kakinya.

## Data, sambungan, dan arus

- Sebuah item dengan kolom yang dibutuhkan kosong, atau kunci yang tidak ada di pustaka.
- Ujung rute kabel, atau peralatan, tidak tersambung ke apa pun.
- **Jatuh tegangan** dan **arus** dari setiap sumber (peralatan yang ditandai sebagai sumber) ke beban (kW dan faktor daya pada peralatan), di sepanjang bentang udara dan kabel: √3·I·L·(R cos φ + X sin φ), dengan R pada 20 °C. Arus yang melebihi kapasitas arus kabel, atau jatuh yang lebih besar dari yang diizinkan set aturan, ditandai.
