---
title: Kabel bawah tanah
summary: Laluan kabel dalam parit antara sokongan dan peralatan, penutup dan lintasan, sambungan mengikut panjang gelendong, serta kuantiti parit dan kabel.
keywords: kabel bawah tanah, laluan kabel, parit, saluran, penutup, lintasan, lintasan paip, sambungan, gelendong, kabinet, transformer, sumber, susutan voltan
from: adfd2717
---

## Lukis laluan kabel

1. Letakkan peralatan dahulu jika kabel berakhir pada kabinet, transformer atau sambungan: {{ui:Peralatan}}, kemudian klik.
2. Klik {{ui:Kabel}} dan klik laluan itu; mula dan akhiri pada sokongan atau pada peralatan untuk menyambung kepadanya. Enter menyelesaikannya.

Dalam Sifat, pilih **Kabel**, **Jenis parit**, berapa **kabel bersebelahan**, dan **lebihan panjang** (%). Laluan itu memaparkan panjangnya, di mana ia bermula dan berakhir, dan arus yang dibawanya.

## Apa yang disemak

- **Penutup**: bahagian atas kabel berada di bawah tanah sepanjang laluan, berbanding penutup jenis parit (atau ketebalan penutup minimum set peraturan).
- **Lintasan**: di mana laluan merentasi paip CivilCraft atau kabel lain, jurang antara keduanya berbanding peraturan jarak bebas: **Jarak lintasan** laluan itu sendiri (dalam Sifatnya) apabila anda memilihnya, jika tidak peraturan **Lintasan bawah tanah** dalam set peraturan (set contoh menggunakan *Lintasan bawah tanah*, 0.3 m), jika tidak jurang jenis parit ke perkhidmatan lain. Dua kabel yang merentasi mengekalkan yang lebih besar daripada keduanya. Talian udara yang dirintangi disenaraikan untuk makluman, dan kabel ditunjukkan dalam profil talian itu.
- **Sambungan**: satu setiap panjang gelendong kabel (dengan lebihan panjang), apabila item kabel memberikan panjang gelendong.

## Peralatan

Peralatan mempunyai item pustaka, **beban** (kW) dengan **faktor kuasanya**, dan boleh menjadi **sumber**: rangkaian dibekalkan dari situ. Voltan sumber datang daripada item pustakanya, atau jika tidak daripada talian atau kabel yang dibekalkannya.

## Kuantiti

{{ui:Lagi}} › {{ui:Kuantiti…}} mengira kabel (panjang laluan × (1 + lebihan panjang) × kabel bersebelahan + kenaikan di setiap hujung), parit mengikut jenis, isipadu penggalian, bedding dan pengisian semula, saluran dan sambungan, dengan konduktor talian udara, sokongan dan peralatan.
