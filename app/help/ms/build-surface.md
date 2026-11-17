---
title: Bina dan halusi permukaan
summary: Cara CivilCraft menggubah tanah sedia ada menjadi segi tiga, dan cara membentuknya dengan kumpulan garis putus, garis putus yang dilukis, sempadan luar dan tepi luar terpanjang.
keywords: tin, permukaan, triangulasi, garis putus, sempadan, tanah sedia ada, eg, cipta permukaan, delaunay, segi tiga, tepi maksimum, sempadan luar
from: b9eea3f3
---

CivilCraft mempunyai satu permukaan tanah sedia ada bagi setiap projek. Ia ialah TIN (rangkaian tidak sekata segi tiga) yang dibina daripada titik anda, dan ia dibina semula secara automatik setiap kali sesuatu input berubah. Tiada arahan "bina semula" dan tiada permukaan yang ketinggalan zaman.

## Apa yang masuk ke dalam permukaan

- Setiap titik dengan ketinggian dalam kumpulan yang ditetapkan kepada {{ui:Titik}}.
- Setiap kumpulan yang ditetapkan kepada {{ui:Garis putus}}, disambungkan mengikut urutan nombor titik.
- Setiap garis putus yang anda lukis dengan alat {{ui:Garis putus}}.
- Sempadan luar, jika anda melukisnya.
- Tetapan **Tepi luar terpanjang**.

Segi tiga tidak pernah merentasi garis putus: permukaan dipaksa mengikutinya, kemudian dibuat seseimbang mungkin di sekelilingnya (Delaunay di semua tempat lain).

## Jadikan garis berkod sebagai garis putus

1. Dalam panel kiri di bawah **Titik**, cari kumpulan (contohnya FL).
2. Tetapkan pilihan **Permukaan** kepada {{ui:Garis putus}}.
   Permukaan dibina semula, garisnya dilukis dalam warna jingga (dengan {{ui:Garis putus}} dihidupkan di bawah **Paparan**), dan **Garis putus** dalam fakta permukaan bertambah satu.
3. Semak garis pada pelan. Ia mesti berjalan dari titik ke titik mengikut urutan garis itu ditinjau. Jika ia zig-zag, kumpulan itu mengandungi lebih daripada satu garis, atau titik tidak dinomborkan mengikut urutan: tetapkan kumpulan kembali kepada {{ui:Titik}} dan lukis garisnya dengan tangan (bahagian seterusnya).

## Lukis garis putus melalui titik

1. Tekan {{key:B}}, atau klik {{ui:Garis putus}} dalam kumpulan **Permukaan**.
   Petunjuk berbunyi "Garis putus: klik titik ukur mengikut urutan (ia mengambil ketinggiannya). Enter untuk selesai."
2. Gerakkan penunjuk berhampiran satu titik. Segi empat sama jingga kecil menandakan titik yang akan diambilnya.
3. Klik titik-titik garisan satu demi satu. Setiap klik menamakan titik dan ketinggiannya dalam bar status.
4. Tekan {{key:Enter}} untuk selesai.
   Bar status berbunyi "Garis putus 1 ditambah; permukaan telah dibina semula."

Klik mesti jatuh pada titik ukur yang mempunyai ketinggian; klik di tempat lain ditolak dengan "Klik titik ukur dengan ketinggian: garis putus mengambil ketinggian titik." {{key:Backspace}} menggugurkan titik terakhir; {{key:Esc}} membatalkan keseluruhan garisan.

:::warning
Selesaikan dengan {{key:Enter}}. Klik dua kali juga menyelesaikan, tetapi dalam binaan ini ia menggugurkan titik yang anda klik dua kali. Klik titik terakhir sekali, kemudian tekan {{key:Enter}}.
:::

Untuk mengalih keluar serentak semua garis putus yang dilukis, klik {{ui:Alih keluar garis putus yang dilukis}} dalam bahagian **Permukaan**. Untuk mengalih keluar hanya yang terakhir, guna {{key:Mod+Z}}. Garis putus yang dilukis belum boleh dipilih atau disunting satu demi satu.

## Lukis sempadan luar

Sempadan memangkas permukaan kepada kawasan yang anda percayai, contohnya had tinjauan, supaya segi tiga panjang yang merentasi sudut tidak ditinjau hilang.

1. Tekan {{key:O}}, atau klik {{ui:Sempadan}}.
2. Klik sudut mengikut urutan di sekeliling kawasan. Garis putus-putus menunjukkan bentuknya.
3. Tekan {{key:Enter}}.
   Bar status berbunyi "Sempadan ditetapkan; segi tiga di luarnya telah hilang." **Sempadan** dalam fakta permukaan berbunyi "Ya" dan bilangan sudut.

Perkara yang perlu diketahui:

- Hanya ada satu sempadan. Melukis yang lain menggantikannya. {{ui:Alih keluar sempadan}} membuangnya.
- Ia hanya boleh membuang: sempadan yang melepasi titik dipotong kembali kepada garis luar titik-titik itu, dengan nota "The boundary reaches past the points; it was cut back to their outline." — iaitu "Sempadan melepasi titik; ia telah dipotong kembali kepada garis luarnya."
- Sudutnya mengambil ketinggian daripada permukaan, jadi tepinya mengikut tanah dengan tepat.
- Sempadan dalam (sembunyi) belum tersedia.

## Potong segi tiga luar yang panjang

Tanpa sempadan, permukaan mengisi keseluruhan garis luar titik, termasuk segi tiga nipis yang panjang merentasi tepi cekung.

1. Dalam **Permukaan**, taip panjang dalam **Tepi luar terpanjang** dan tekan {{key:Enter}}. Mulakan dengan kira-kira dua atau tiga kali jarak tinjauan biasa anda.
2. Segi tiga luar yang tepi luarnya lebih panjang daripada itu dibuang, berkerja ke dalam sehingga setiap tepi luar cukup pendek. Tepi yang merupakan garis putus tidak pernah dikupas.
3. Taip 0 untuk menyimpan semula setiap segi tiga.

## Baca laporan permukaan

Di bawah fakta permukaan, sebuah kotak menyenaraikan apa yang dilakukan oleh pembina. Dengan bar oker di sebelah kirinya ia ialah maklumat; dengan bar merah ia mengandungi ralat dan tiada permukaan.

| Mesej | Maksud |
|---|---|
| "3 titik berada di tempat yang sama dengan titik lain dan menyambungnya." | Titik yang lebih dekat daripada 0.0001 dalam pelan menjadi satu bucu (yang pertama dikekalkan). |
| "2 tempat mempunyai dua ketinggian yang berbeza …" | Titik yang bertindih, atau garis putus yang bersilang, tidak sepakat dari segi ketinggian. Ketinggian garis putus menang, kemudian yang pertama. |
| "1 kepingan garis putus tidak dapat dipaksa masuk ke dalam permukaan." | Kepingan garis putus yang sangat pendek atau hampir bertindih tidak muat; semak tempat itu. |
| "Permukaan memerlukan sekurang-kurangnya tiga titik dengan ketinggian." | Terlalu sedikit titik: semak susunan lajur dan kumpulan. |
| "Titik semuanya berada pada satu garis: tiada segi tiga." | Titik tiada lebar, contohnya satu garis terabas tunggal. |
| "Sempadan tidak bertindih dengan titik." | Sempadan berada di tempat lain, selalunya kekeliruan unit atau koordinat. |
| "Tiada segi tiga yang tinggal di dalam sempadan." | Sempadan terlalu kecil atau tersalah letak. |

## Permukaan dibaca daripada LandXML

Apabila anda membuka LandXML, permukaan TIN pertamanya digunakan seperti sedia ada: tajuk **Permukaan** berbunyi "Permukaan (daripada LandXML)" dan **Tepi luar terpanjang** dimalapkan. Semasa permukaan itu digunakan, kumpulan garis putus, garis putus yang dilukis dan sempadan baharu tidak mengubahnya. Untuk membina permukaan daripada titik fail itu, klik {{ui:Bina semula permukaan daripada titik}}. {{key:Mod+Z}} mengembalikan permukaan LandXML.

## Berkaitan

- [Baca kontur, ketinggian dan cerun](topic:contours).
- [Import titik ukur](topic:import-points).
