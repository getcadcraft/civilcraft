---
title: Koordinat tanah dan lokal
summary: Bekerja dalam koordinat tanah (permukaan) yang diskalakan dari grid dengan faktor skala gabungan yang Anda ketik atau hitung di suatu titik, atau dalam grid situs yang diasumsikan dan dikaitkan dengan sistem melalui dua titik kontrol.
keywords: koordinat tanah, koordinat permukaan, grid ke tanah, faktor skala gabungan, csf, faktor gabungan, faktor grid, faktor elevasi, faktor permukaan laut, konvergensi, sudut pemetaan, faktor skala, koordinat asumsi, koordinat lokal, grid situs, 5000 5000, titik kontrol, lokalisasi, kalibrasi, dua titik, salah penutup
from: 3d7453de
---

Koordinat state plane dan UTM adalah koordinat **grid**: proyeksi peta sedikit meregangkan atau memendekkan jarak (puluhan bagian per sejuta), dan semakin tinggi lokasinya, semakin besar perbedaan antara jarak yang diukur di tanah dan jarak grid. Karena itu banyak survei menyerahkan koordinat **tanah**, diskalakan agar jarak pada denah sama dengan jarak yang diukur di tanah, atau grid situs **yang diasumsikan** (5000, 5000 pada titik kontrol). CivilCraft menyimpan angka Anda apa adanya dan mencatat bagaimana hubungannya dengan grid, sehingga lintang dan bujur, berkas GIS, serta lapisan peta tetap mendarat di tempat yang benar.

Buka {{ui:Koordinat}} di grup {{ui:GIS}}, pilih (atau pertahankan) sistemnya, lalu pilih di bawah **Koordinat grid, tanah, atau lokal**:

| Pilihan | Koordinat Anda berupa | Hubungannya dengan grid |
|---|---|---|
| {{ui:Grid}} | Milik sistem (titik awal) | Angka yang sama |
| {{ui:Tanah}} | Diskalakan ke jarak tanah | grid = basis + faktor gabungan × (tanah − basis) |
| {{ui:Lokal}} | Grid situs yang diasumsikan | Dipindahkan, diputar, dan diskalakan ke grid oleh dua titik kontrol |

Pilihan Anda disimpan bersama proyek dan merupakan satu langkah urungkan; tidak ada yang bergerak.

## Koordinat tanah

1. Pilih {{ui:Tanah}}.
2. Ketik **Faktor skala gabungan** dari survei (misalnya `0.99987`), atau hitung:
   1. Di bawah **Hitung faktor di suatu titik**, titik mulai di tengah proyek. Pilih {{ui:Pilih titik di denah}} dan klik lokasinya (klik di dekat titik survei akan mengambil titik itu), atau ketik E dan N.
   2. Elevasinya diambil dari permukaan di sana; ketik yang lain jika Anda memerlukannya.
   3. Pilih {{ui:Hitung}}. CivilCraft menampilkan:
      - **Faktor skala grid k**: seberapa besar proyeksi peta meregangkan jarak di sana.
      - **Faktor elevasi**: seberapa pendek jarak di elipsoid dibandingkan pada ketinggian itu.
      - **Faktor gabungan** = k × faktor elevasi: jarak grid = jarak tanah × ini.
      - **Konvergensi**: sudut dari utara grid ke utara sejati di sana (azimut geodetik = azimut grid + konvergensi).
   4. Pilih tombol {{ui:Penggunaan}} di bawah angka untuk memasukkan faktor gabungan ke dalam kotak.
3. Atur **Titik basis**, tempat koordinat tanah dan grid sama. Mulanya 0, 0: kebanyakan yurisdiksi yang menerbitkan koordinat tanah menskalakan terhadap titik asal, sehingga koordinat tanah tetap mendekati koordinat grid. Beberapa survei menskalakan terhadap titik kontrol proyek: gunakan sesuai yang dinyatakan survei.
4. Pilih {{ui:Terapkan}}.

:::warning
Elevasi diambil sebagai tinggi di atas elipsoid. CivilCraft tidak memiliki model geoid, sehingga di tempat geoid berada 30 m (100 ft) di bawah atau di atas elipsoid, faktor elevasi meleset sekitar 5 ppm. Jika survei menyatakan faktor gabungannya, ketik faktor itu.
:::

## Koordinat lokal (diasumsikan)

1. Pilih {{ui:Lokal}}.
2. Untuk **Titik kontrol 1**, ketik nomor titik survei (atau pilih {{ui:Pilih}} dan klik di denah). Koordinat lokalnya ditampilkan di sebelahnya.
3. Ketik E dan N **grid**-nya, atau lintang dan bujurnya di kotak ketiga (misalnya `30.2672, -97.7431`).
4. Lakukan hal yang sama untuk **Titik kontrol 2**, sejauh mungkin dari yang pertama.
5. CivilCraft menampilkan **Skala** dan **Rotasi** yang ditemukan, dan mengingatkan: **Dua titik selalu cocok dengan tepat — periksa titik ketiga.**
6. Berikan **Titik periksa** dengan cara yang sama. CivilCraft menampilkan seberapa jauh kecocokan itu menempatkannya dari koordinat grid yang Anda ketik (salah penutupnya, dalam satuan proyek dan bagian per sejuta). Salah penutup yang besar berarti titik yang salah, kesalahan pengetikan, atau koordinat dalam satuan lain.
7. Pilih {{ui:Terapkan}}.

Skala yang jauh dari 1 (di luar 0.5 hingga 2) ditolak: periksa titik-titik dan satuannya.

## Yang sudah diperiksa

- Faktor skala dan konvergensi cocok dengan PROJ (pyproj 3.7.1 dengan PROJ 9.5.1), pustaka koordinat yang dipakai kebanyakan program GIS, hingga 1 bagian dalam semiliar pada lebih dari 300 sistem dengan proyeksi konformal (state plane, UTM, transverse Mercator, Lambert conformal conic), dan di peramban pada titik yang dipilih di denah.
- Langkah tanah dan lokal dikonversi bolak-balik hingga 1 bagian dalam semiliar; dua titik kontrol mengembalikan skala dan rotasi yang digunakan untuk membuatnya; titik periksa yang meleset 0.05 ft menunjukkan salah penutup 0.05 ft.
