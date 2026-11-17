---
title: Koordinat tanah dan tempatan
summary: Bekerja dalam koordinat tanah (permukaan) yang diskalakan daripada grid dengan faktor skala gabungan yang anda taip atau kira pada satu titik, atau dalam grid tapak anggapan yang diikat kepada sistem melalui dua titik kawalan.
keywords: koordinat tanah, koordinat permukaan, grid ke tanah, faktor skala gabungan, csf, faktor gabungan, faktor grid, faktor ketinggian, faktor aras laut, konvergensi, sudut pemetaan, faktor skala, koordinat anggapan, koordinat tempatan, grid tapak, 5000 5000, titik kawalan, penentukuran, dua titik, ralat penutupan
from: 3d7453de
---

Koordinat satah negeri dan UTM ialah koordinat **grid**: unjuran peta meregang atau mengecutkan jarak sedikit (puluhan bahagian per sejuta), dan semakin tinggi tapak, semakin berbeza jarak tanah yang diukur daripada jarak grid. Banyak tinjauan oleh itu menyerahkan koordinat **tanah**, yang diskalakan supaya jarak pada pelan sama dengan jarak yang diukur di tanah, atau grid tapak **anggapan** (5000, 5000 pada titik kawalan). CivilCraft menyimpan nombor anda seperti sedia ada dan merekodkan hubungannya dengan grid, supaya latitud dan longitud, fail GIS dan lapisan peta masih mendarat di tempat yang betul.

Buka {{ui:Koordinat}} dalam kumpulan {{ui:GIS}}, pilih (atau kekalkan) sistem, kemudian pilih di bawah **Koordinat grid, tanah atau tempatan**:

| Pilihan | Koordinat anda ialah | Hubungannya dengan grid |
|---|---|---|
| {{ui:Grid}} | Milik sistem (permulaan) | Nombor yang sama |
| {{ui:Tanah}} | Diskalakan kepada jarak tanah | grid = asas + faktor gabungan × (tanah − asas) |
| {{ui:Tempatan}} | Grid tapak anggapan | Dialihkan, diputar dan diskalakan ke grid oleh dua titik kawalan |

Apa sahaja yang anda pilih disimpan dengan projek dan ialah satu langkah buat asal; tiada apa yang bergerak.

## Koordinat tanah

1. Pilih {{ui:Tanah}}.
2. Taip **Faktor skala gabungan** daripada tinjauan (contohnya `0.99987`), atau kirakannya:
   1. Di bawah **Kira faktor pada satu titik**, titik bermula di tengah projek. Pilih {{ui:Pilih titik pada pelan}} dan klik tempatnya (klik berhampiran titik ukur mengambil titik itu), atau taip E dan N.
   2. Ketinggian diambil daripada permukaan di situ; taip yang lain jika perlu.
   3. Pilih {{ui:Kira}}. CivilCraft menunjukkan:
      - **Faktor skala grid k**: berapa banyak unjuran peta meregangkan jarak di situ.
      - **Faktor ketinggian**: berapa banyak lebih pendek jarak pada elipsoid berbanding pada ketinggian itu.
      - **Faktor gabungan** = k × faktor ketinggian: jarak grid = jarak tanah × ini.
      - **Konvergensi**: sudut dari utara grid ke utara sebenar di situ (azimut geodetik = azimut grid + konvergensi).
   4. Pilih butang {{ui:Kegunaan}} di bawah nombor untuk meletakkan faktor gabungan dalam kotak.
3. Tetapkan **Titik asas**, tempat koordinat tanah dan grid adalah sama. Ia bermula pada 0, 0: kebanyakan bidang kuasa yang menerbitkan koordinat tanah menskala di sekitar asalan, supaya koordinat tanah kekal hampir dengan yang grid. Sesetengah tinjauan menskala di sekitar titik kawalan projek sebaliknya: gunakan apa yang tinjauan nyatakan.
4. Pilih {{ui:Guna}}.

:::warning
Ketinggian diambil sebagai ketinggian di atas elipsoid. CivilCraft tidak mempunyai model geoid, jadi di tempat geoid berada 30 m (100 ft) di bawah atau di atas elipsoid, faktor ketinggian tersasar lebih kurang 5 ppm. Apabila tinjauan menyatakan faktor gabungannya, taip yang itu.
:::

## Koordinat tempatan (anggapan)

1. Pilih {{ui:Tempatan}}.
2. Bagi **Titik kawalan 1**, taip nombor titik ukur (atau pilih {{ui:Pilih}} dan klik padanya pada pelan). Koordinat tempatannya ditunjukkan di sebelahnya.
3. Taip **grid** E dan N, atau latitud dan longitudnya dalam kotak ketiga (contohnya `30.2672, -97.7431`).
4. Lakukan perkara yang sama untuk **Titik kawalan 2**, sejauh mungkin dari yang pertama.
5. CivilCraft menunjukkan **Skala** dan **Putaran** yang dijumpai, dan mengingatkan anda: **Dua titik sentiasa sepadan tepat — semak titik ketiga.**
6. Berikan **Titik semakan** dengan cara yang sama. CivilCraft menunjukkan sejauh mana padanan meletakkannya dari koordinat grid yang anda taip (ralat penutupannya, dalam unit projek dan bahagian per sejuta). Ralat penutupan yang besar bermaksud titik yang salah, kesilapan menaip, atau koordinat dalam unit lain.
7. Pilih {{ui:Guna}}.

Skala jauh daripada 1 (melebihi 0.5 hingga 2) ditolak: semak titik dan unitnya.

## Apa yang telah diperiksa

- Faktor skala dan konvergensi sepadan dengan PROJ (pyproj 3.7.1 dengan PROJ 9.5.1), perpustakaan koordinat yang kebanyakan program GIS gunakan, sehingga 1 bahagian dalam satu bilion pada lebih 300 sistem dengan unjuran konformal (satah negeri, UTM, Mercator melintang, kon konformal Lambert), dan dalam pelayar pada titik yang dipilih pada pelan.
- Langkah tanah dan tempatan menukar bolak-balik sehingga 1 bahagian dalam satu bilion; dua titik kawalan memulangkan skala dan putaran yang digunakan untuk membuatnya; titik semakan yang tersasar 0.05 ft menunjukkan ralat penutupan 0.05 ft.
