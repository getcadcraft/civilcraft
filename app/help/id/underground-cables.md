---
title: Kabel bawah tanah
summary: Rute kabel di parit di antara penyangga dan peralatan, kedalaman tutupan dan persilangan, sambungan menurut panjang gulungan, serta kuantitas parit dan kabel.
keywords: kabel bawah tanah, rute kabel, parit, duct, tutupan, persilangan, persilangan pipa, sambungan, gulungan, kabinet, transformator, sumber, penurunan tegangan
from: adfd2717
---

## Menggambar rute kabel

1. Tempatkan peralatan terlebih dahulu jika kabel berakhir di kabinet, transformator, atau sambungan: {{ui:Peralatan}}, lalu klik.
2. Klik {{ui:Kabel}} lalu klik rutenya; mulai dan akhiri pada penyangga atau peralatan untuk menyambung ke sana. Enter untuk selesai.

Di Properties, pilih **Kabel**, **Jenis parit**, berapa banyak **kabel berdampingan**, dan **kelonggaran** (%). Rute menampilkan panjangnya, tempat mulai dan berakhirnya, serta arus yang dibawanya.

## Yang diperiksa

- **Tutupan**: bagian atas kabel harus berada di bawah tanah sepanjang rute, dibandingkan dengan tutupan jenis parit (atau tutupan minimum dari set aturan).
- **Persilangan**: tempat rute memotong pipa CivilCraft atau kabel lain, celah di antara keduanya dibandingkan dengan aturan jarak bebas: **Jarak bebas persilangan** milik rute (di Properties-nya) jika Anda memilihnya, jika tidak aturan **Persilangan bawah tanah** dari set aturan (set contoh menggunakan *Persilangan bawah tanah*, 0.3 m), jika tidak celah jenis parit ke layanan lain. Dua kabel yang bersilangan memakai yang lebih besar dari keduanya. Saluran udara yang disilang dicantumkan untuk informasi, dan kabel tampak pada profil saluran itu.
- **Sambungan**: satu setiap panjang gulungan kabel (dengan kelonggaran), jika item kabel memberikan panjang gulungan.

## Peralatan

Peralatan memiliki item pustaka, **beban** (kW) dengan **faktor daya**-nya, dan dapat berupa **sumber**: jaringan dialiri dari sana. Tegangan sumber berasal dari item pustakanya, atau dari saluran atau kabel yang dialirinya.

## Kuantitas

{{ui:Lainnya}} › {{ui:Kuantitas…}} menghitung kabel (panjang rute × (1 + kelonggaran) × kabel berdampingan + kenaikan di setiap ujung), parit menurut jenisnya, volume galian, alas, dan urugan, duct dan sambungan, serta konduktor saluran udara, penyangga, dan peralatannya.
