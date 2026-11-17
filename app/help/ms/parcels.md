---
title: Lukis lot dan tulis huraian undang-undangnya
summary: Lukis lot mengikut sudut-sudutnya atau masukkan panggilan daripada surat ikatan atau pelan, semak sejauh mana panggilan itu tertutup, label bearing dan jarak pada pelan, jadikan mana-mana kursus lengkung, dan salin draf huraian undang-undang.
keywords: lot, lot tanah, sempadan harta, sempadan, surat ikatan, pelan, metes and bounds, bearing, jarak, tutupan, ralat penutupan, kejituan, huraian undang-undang, titik permulaan, lengkung, jejari, luas, ekar
from: 6793d6ce
---

Lot berada di atas pelan dengan bearing dan jarak di sepanjang setiap kursus lurus (lengkung menunjukkan jejarinya, panjangnya dan sudut pusatnya) serta nama dan luasnya di tengah. Ia masuk ke dalam plot PDF dan eksport DWG serta DXF, pada lapisan `V-PROP` (garisan) dan `V-PROP-TEXT` (label). Semuanya ada di bawah **Lot** dalam panel kanan apabila tiada apa yang dipilih.

## Lukis lot

1. Klik **Lukis lot**.
2. Klik sudut-sudut, bermula dari titik permulaan. Klik berhampiran titik ukur mengambil kedudukan tepat titik itu.
3. Klik sudut pertama sekali lagi, atau tekan {{key:Enter}}, untuk selesai. {{key:Backspace}} membatalkan sudut terakhir; {{key:Esc}} membuang sudut setakat ini; tekan sekali lagi untuk keluar daripada alat.

## Masukkan panggilan daripada surat ikatan

1. Klik **Masukkan panggilan surat ikatan**.
2. Nyatakan di mana panggilan bermula: nombor titik ukur, atau utara dan timur.
3. Taip atau tampal panggilan, satu setiap baris:
   - garisan: bearing dan jarak, seperti `N 45°30'15" E 125.50`. `N45-30-15E`, `N 45 30 15 E`, `N 45.5 E` dan azimut (`AZ 45°30'15"`) juga berfungsi, dan "thence", koma serta "feet" diabaikan.
   - lengkung: `C R 300 L 52.36 right` (jejari dan panjang lengkok), atau `C R 300 D 10°00'00" left` (jejari dan sudut pusat). Lengkung bersambung dari kursus sebelumnya; jika tidak, tambah bearing kordnya: `C R 300 L 52.36 right CB N 50 00 00 E`.
   - `#` memulakan baris ulasan.
4. Semasa anda menaip, kotak dialog menunjukkan jumlah panjang panggilan, **ralat penutupan** (sejauh mana ia berakhir dari permulaan, dan ke arah mana), **kejituan** (panjang dibahagi dengan ralat penutupan, 1 : 10,000 dan seterusnya) dan luasnya. Baris yang tidak dapat dibaca disenaraikan dengan nombor barisnya.
5. **Tambah lot**. Apabila panggilan tidak tertutup, lot ditutup dengan kursus lurus merentasi jurang: semak panggilan dengan surat ikatan. Untuk menyebarkan ralat ukur terabas medan ke atas kursusnya, laraskan dahulu.

## Lengkung

Dalam **Sifat** lot, setiap kursus mempunyai **Jejari**. Taip satu untuk menjadikan kursus itu lengkung melalui dua sudut yang sama (jejari yang lebih kecil daripada separuh jarak antara sudut tidak dapat dicapai, jadi ia ditolak), dan pilih **Kanan** atau **Kiri** dalam **Lengkung**: lengkung ke kanan mempunyai pusatnya di sebelah kanan arah perjalanan, seperti dalam surat ikatan. Kosongkan jejari untuk menjadikannya lurus semula. Setiap perubahan ialah satu langkah: {{key:Mod+Z}} membatalkannya.

## Huraian undang-undang

Sifat lot berakhir dengan huraian undang-undangnya, ditulis daripada lukisan:

- "Bermula di" **Titik permulaan** yang anda taip (contohnya "the northeast corner of Lot 4"), jika tidak, aras utara dan timur sudut pertama, atau titik ukur tempat panggilan bermula.
- "kemudian" setiap kursus: bearing dan jarak, atau lengkung dengan jejari, panjang lengkok, sudut pusat, serta bearing dan jarak kord.
- "Mengandungi" luasnya dalam square feet dan acres (square meters dan hectares dalam projek meter).

**Salin** meletakkannya pada papan keratan; **Muat turun sebagai teks** menyimpannya sebagai fail `.txt`.

:::warning
Huraian undang-undang ialah draf daripada lukisan, bukan tinjauan. Juruukur berlesen mesti menyemaknya terhadap rekod dan menandatanganinya sebelum sesiapa bergantung kepadanya.
:::

Klik di dalam lot pada pelan untuk memilihnya; {{key:Delete}} memadamkannya. Lot disimpan dalam fail projek.
