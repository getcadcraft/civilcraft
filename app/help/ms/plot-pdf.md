---
title: Plot pelan ke PDF
summary: Plot semua atau paparan semasa ke PDF vektor pada helaian standard, pada skala kejuruteraan atau metrik, dalam warna lapisan atau hitam.
keywords: plot, cetak, pdf, helaian, skala, saiz kertas, helaian pelan, terbit, blok tajuk, anak panah utara, bar skala
from: 9af396ca
---

{{ui:PDF}} memplot pelan ke PDF vektor pada satu helaian, dengan jalur tajuk, anak panah utara dan bar skala. PDF itu dihasilkan dalam pelayar dan dimuat turun; ia tidak melalui kotak dialog cetak pelayar.

## Plot

1. Sediakan pelan di bawah **Paparan**: permukaan yang ditunjukkan, sela kontur dan perkara yang dihidupkan. Plot mengikut tetapan ini.
2. Jika anda mahukan sebahagian sahaja daripada tapak, zum dan pan pelan ke bahagian itu.
3. Klik {{ui:PDF}} dalam kumpulan **Eksport**, atau tekan {{key:Mod+P}}.
   Kotak dialog **Plot pelan ke PDF** dibuka.
4. Pilih **Kawasan**: {{ui:Everything}} atau {{ui:What is on screen}}.
5. Pilih **Kertas**: Letter, Tabloid, ANSI D, ARCH D, ISO A4, A3 atau A1. Projek kaki bermula pada Tabloid, projek meter pada A3. Helaian sentiasa landskap.
6. Pilih **Skala**. Senarai menandakan skala terbesar yang muat dengan "(muat)" dan memilihnya.
   - Kaki: 1" = 5', 10', 20', 30', 40', 50', 60', 100', 200', 300', 400', 500', 1000'.
   - Meter: 1:50, 1:100, 1:200, 1:250, 1:500, 1:1000, 1:2000, 1:2500, 1:5000, 1:10000.
7. Pilih **Dakwat**: {{ui:Layer colors}} atau {{ui:Black}}.
8. Baca baris di bawah pilihan. Ia memberikan saiz kawasan pada kertas dan saiz helaian, contohnya "Kawasan ialah 297 × 222 mm pada 1" = 40' pada helaian 432 × 279 mm (landskap)."
9. Klik {{ui:Download PDF}}.
   Pelayar memuat turun `<name>.pdf`. Bar status berbunyi "<name>.pdf diplot pada 1" = 40'."

Jika kawasan lebih besar daripada helaian pada skala yang anda pilih, plot dipusatkan dan tepinya dipotong. Pilih skala yang ditandakan "(muat)" atau helaian yang lebih besar.

## Apa yang ada pada helaian

- Pelan, dipusatkan di kawasan lukisan, sebagai vektor sebenar: kontur, label, penjajaran dengan penomboran stesen, koridor, pelantar dan garis persilangan, paip, titik.
- Ketebalan garisan mengikut lapisan: penjajaran, pelantar dan paip lebih tebal; segi tiga dan kontur kecil lebih nipis.
- Jalur tajuk di sepanjang bahagian bawah dengan **Nama** projek, skala, nota sela kontur dan permukaan mana yang ditunjukkan (sedia ada atau digred), dan tarikh serta binaan di sebelah kanan.
- Anak panah utara di sudut kanan atas (utara pelan berada di atas) dan bar skala di dalam jalur tajuk.
- Lapisan peta yang ditunjukkan di bawah pelan (gambar, jubin peta atau perkhidmatan peta), apabila **Lapisan peta di bawah pelan** ditanda: ia dilukis sebagai satu gambar bagi keseluruhan kawasan lukisan pada 150 titik per inci, di bawah garisan, dan atribusi peta dimasukkan dalam jalur tajuk. CivilCraft menunggu sehingga 8 saat untuk gambar peta yang masih tiba; jika ada yang masih hilang, bar status menyatakannya.

Teks menggunakan Helvetica terbina dalam PDF. Aksara di luar set Eropah Barat (Windows-1252) dicetak sebagai "?", dan mesej status mengira bilangannya.

## Apa yang tidak diplot

- Jalur aras.
- Paparan profil. Pemplotan profil belum tersedia.
- Lebih daripada satu helaian (bagi penjajaran, gunakan [helaian pelan dan profil](topic:plan-profile-sheets)), viewport, blok tajuk tersuai atau helaian potret.

:::note
Kotak dialog menyatakan anak panah cerun hanya untuk skrin. Dalam binaan ini, anak panah cerun yang dihidupkan di bawah **Paparan** akan diplot (dan dieksport ke DXF). Matikannya sebelum memplot jika anda tidak mahukannya.
:::

## Mencetak pada kertas

Buka PDF yang dimuat turun dalam mana-mana pemapar PDF dan cetak pada 100% (saiz sebenar) supaya skala kekal tepat. "Muat ke halaman" menukar skala.
