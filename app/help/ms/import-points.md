---
title: Import titik tinjauan
summary: Buka fail titik CSV atau teks, semak susunan lajur dalam kotak dialog Import titik, betulkan baris yang tidak dapat dibaca, dan asingkan titik ke dalam kumpulan.
keywords: import titik, csv, txt, pnezd, penzd, fail titik, tinjauan, titik cogo, kumpulan titik, lajur, northing easting
from: ad33d88a
---

Fail titik ialah fail teks dengan satu titik setiap baris: nombor titik, northing, easting, aras dan huraian dalam mana-mana susunan, dipisahkan dengan koma, tab, titik koma atau ruang. CivilCraft membacanya dalam pelayar dan terus membina permukaan daripadanya.

## Sebelum anda mula

- Ketahui susunan lajur fail jika boleh (PNEZD dan PENZD kelihatan sama kepada komputer).
- Ketahui unitnya. CivilCraft tidak menukarnya: tetapkan **Unit** dalam panel kiri supaya sepadan dengan fail (lihat [Unit, stesen dan format nombor](topic:units-and-stations)).
- Koordinat boleh besar (northing dan easting satah negeri dalam jutaan adalah baik).

## Import fail

1. Klik {{ui:Open}} dalam bar alat, atau tekan {{key:Mod+O}}, dan pilih fail. Anda juga boleh menyeretnya ke pelan.
   Kotak dialog **Import titik** dibuka dengan nama fail, senarai **Lajur** yang ditetapkan kepada {{ui:Detect}}, baris ringkasan dan enam titik pertama.
2. Baca baris ringkasan. Ia memberitahu berapa titik dibaca, dalam susunan lajur yang mana, bagaimana susunan itu ditemui, dan apa yang memisahkan lajur. Tiga cara susunan ditemui:
   - "daripada baris pengepala": baris pertama menamakan lajurnya (Point, Northing, Easting, Elevation, Description, atau X, Y, Z …). Ini paling selamat.
   - "seperti dipilih": anda memilih susunan dalam **Lajur**.
   - "diteka daripada bilangan lajur dan tetapan baris titik anda (PNEZD) — semak sama ada northing dan easting tidak bertukar tempat": tiada pengepala yang boleh digunakan. Jika fail anda biasanya easting dahulu, tetapkan **Baris titik** kepada P, E, N, Z, D dalam [tetapan CivilCraft](topic:settings).
3. Semak jadual pratonton. Lajurnya sentiasa **Titik**, **Northing**, **Easting**, **Aras** dan **Huraian**, tanpa mengira susunan fail. Northing dan easting bagi tapak sebenar biasanya jelas berbeza saiznya: jika kelihatan tertukar, tekaan itu salah.
4. Jika susunan salah, pilih yang betul dalam **Lajur** (contohnya {{ui:PENZD — titik, timur, utara, aras, huraian}}). Ringkasan dan pratonton dikemas kini serta-merta.
5. Lihat di bawah pratonton untuk **Baris tidak dibaca**. Setiap baris menamakan nombor baris fail, sebabnya dan permulaan baris itu. Lihat [Baris yang tidak dibaca](topic:import-points#rows-that-are-not-read).
6. Klik {{ui:Import}}.
   Titik muncul pada pelan, paparan zum kepada mereka dan permukaan dibina. Bar status memberitahu, contohnya, "276 titik diimport daripada site.csv; permukaan: 546 segi tiga."

Jika projek belum ada nama, ia mengambil nama fail.

## Semak kumpulan

Setiap titik tergolong dalam kumpulan yang dinamakan mengikut **perkataan pertama huraiannya**, dalam huruf besar: "GRD", "FL 12" dan "fl" ialah kumpulan GRD, FL dan FL. Titik tanpa huraian masuk ke "(tiada huraian)".

1. Lihat jadual di bawah **Titik** dalam panel kiri: kumpulan, bilangan titik dan pilihan **Permukaan**.
2. Setiap kumpulan bermula sebagai {{ui:Points}}. Tukar garis aliran, tepi turapan, bahagian atas dan kaki cerun, rabung serta garisan berkod yang serupa kepada {{ui:Breakline}}. Tetapkan kumpulan yang tidak sepatutnya membentuk tanah (titik kawalan, puncak pokok, tiang utiliti yang diukur di bahagian atas) kepada {{ui:Left out}}.
3. Klik titik pada pelan (dengan {{ui:Select}}) untuk melihat nombor, koordinat, aras, huraian dan kumpulannya dalam panel kanan.

:::warning
Kumpulan garis putus menyambungkan **semua** titiknya menjadi **satu** garisan, mengikut susunan nombor titik. Ini berfungsi apabila setiap garisan berkod diukur mengikut susunan dengan kodnya sendiri. Dua garis aliran berasingan yang kedua-duanya berkod "FL" menjadi satu garisan yang berliku-liku antara keduanya. Jika kod anda dikongsi, guna alat {{ui:Breakline}} untuk klik titik setiap garisan sebaliknya (lihat [Bina dan perhalusi permukaan](topic:build-surface)).
:::

## Baris yang tidak dibaca

| Sebab dipaparkan | Maksudnya | Apa yang perlu dibuat |
|---|---|---|
| "northing atau easting bukan nombor" | Lajur koordinat mengandungi teks | Semak susunan lajur, atau baris teks terpencil di tengah fail |
| "aras bukan nombor" | Lajur aras mengandungi teks | Susunan lajur salah, atau huraian dalam lajur aras |
| "tiada nombor titik" | Lajur titik kosong | Nomborkan titik, atau pilih susunan tanpa P (NEZD, NEZ …): titik kemudian dinomborkan 1, 2, 3 … |
| "titik 12 muncul dua kali (yang pertama dikekalkan)" | Dua baris berkongsi nombor | Nomborkan semula salah satunya dalam fail jika kedua-duanya ialah ukuran sebenar |
| "3 lajur, dijangka 5 (PNEZD)" | Baris itu pendek | Baris putus, atau susunan lajur salah |

Titik dengan aras kosong dikekalkan, tetapi tidak digunakan dalam permukaan. Fakta **Titik** menunjukkan berapa banyak titik mempunyai aras.

Baris yang bermula dengan `#`, `;` atau `//` ialah ulasan dan dilangkau. Baris kosong juga dilangkau.

## Gantikan atau tambah titik

Mengimport semula **menggantikan** semua titik; ia tidak menambah kepadanya. Penjajaran, pad, paip, garis putus yang dilukis dan sempadan anda kekal. Sejarah buat asal dikosongkan, jadi simpan projek dahulu jika anda mungkin mahu titik lama kembali. Untuk menggabungkan dua fail, cantumkannya dalam penyunting teks atau hamparan sebelum mengimport (awas nombor titik yang berulang).

Titik belum boleh dialih, disunting atau dipadam dalam CivilCraft lagi. Betulkannya dalam fail dan import semula.

## Berkaitan

- [Format fail titik](topic:point-file-formats): setiap susunan lajur dan cara pengepala dikenali.
- [Bina dan perhalusi permukaan](topic:build-surface).
