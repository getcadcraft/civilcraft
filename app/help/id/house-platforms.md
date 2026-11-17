---
title: Platform rumah di lahan berlereng
summary: Grading pad di lereng bukit: dinding penahan sebagai tepi pad, peta galian dan timbunan yang diberi warna menurut kedalaman dengan level titik (denah dan 3D), potongan yang dapat digambar di mana saja melalui tanah dan rancangan, serta ramp atau pad miring untuk jalan masuk.
keywords: platform, pad, pad rumah, lahan berlereng, sloped site, bukit, hillside, dinding penahan, retaining wall, galian dan timbunan, cut and fill, peta galian dan timbunan, cut fill map, level titik, spot levels, potongan bebas, free section, garis potongan, section line, gambar pemerintah daerah, council drawings, jalan masuk, driveway, ramp, pad miring, sloped pad, grade, faktor pengembangan, swell factor, pekerjaan tanah, earthwork
from: daa08a3f
---

Platform rumah adalah **pad** (**Desain** › {{ui:Pad}}): poligon datar pada satu level, di-grading ke dalam tanah. Empat hal membantu pada lereng.

## Dinding penahan sebagai tepi pad

Pilih pad dan atur satu sisi ke {{ui:Vertikal (dinding penahan)}} alih-alih lereng (**Properti** › {{ui:Sisi dan dinding penahan tanah}}, atau {{ui:Vertikal: dinding penahan}} untuk semua sisi sekaligus). Tinggi dinding dibaca dari tanah di sepanjangnya: puncak di tanah, dasar di pad, ditampilkan di kedua ujung dan di titik tertingginya pada denah, dengan peringatan jika lebih tinggi dari batas yang Anda atur. Dinding dan lereng dapat dicampur berdampingan.

## Peta galian dan timbunan

Centang {{ui:Peta galian dan timbunan}} di bawah **Tampilkan**. Denah diberi warna menurut kedalaman galian atau timbunan, dalam langkah yang sama (galian hangat, timbunan biru, hampir rata pucat) dengan keterangan, dan **level titik** dicetak pada pad: perubahan level pada titik-titik grid, serta galian terdalam dan timbunan tertinggi ditandai ▲. Selnya sama dengan yang dipakai volume pekerjaan tanah, sehingga peta dan angkanya selalu cocok.

Di tampilan 3D, pilih **Galian dan timbunan** dari daftar warna untuk melapisi tanah dan rancangan dengan warna yang sama.

Faktor pengembangan atau penyusutan ada di alat {{ui:Angkutan massa}} (**Desain** › {{ui:Angkutan massa}}); faktor ini tidak diterapkan pada volume pad.

## Potongan bebas

Di bawah **Permukaan** › {{ui:Lainnya}}, pilih {{ui:Potongan bebas}}, klik titik-titik garis potongan di mana saja (boleh berbelok) dan tekan {{key:Enter}}. Sebuah dialog menggambar potongan: tanah yang ada, rancangan yang sudah digrading (putus-putus), dan galian serta timbunan di antaranya, diberi warna, dengan luasnya (rancangan hanya dihitung di dalam pad dan jalan). {{ui:Eksagerasi vertikal}} secara default menyesuaikan gambar; {{ui:Simpan sebagai SVG}} dan {{ui:Simpan sebagai CSV}} memberi Anda gambar untuk pemerintah daerah dan angkanya.

## Ramp dan pad miring

Di bawah **Permukaan** › {{ui:Lainnya}}, pilih {{ui:Ramp atau pad miring}}, klik ujung rendah lalu ujung tinggi, tekan {{key:Enter}}, dan masukkan lebar, level di ujung rendah, serta kemiringan. Pad berupa jalur yang sudutnya membawa level-level tersebut (tepi di antara dua sudut berjalan dengan kemiringan tetap), dan pad itu di-grading ke dalam tanah seperti pad lainnya. Sudut pad mana pun juga dapat membawa level sendiri, sehingga jalan masuk, ramp, atau teras miring adalah pad dengan level di setiap sudutnya.
