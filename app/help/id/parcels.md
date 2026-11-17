---
title: Menggambar persil dan menulis deskripsi hukumnya
summary: Gambar persil dengan sudut-sudutnya atau masukkan ukuran dari akta atau peta bidang, periksa seberapa baik ukurannya menutup, beri label bearing dan jarak di denah, jadikan ruas apa pun sebagai lengkung, dan salin draf deskripsi hukum.
keywords: persil, kavling, batas properti, batas, akta, plat, ukur batas, bearing, jarak, penutupan, salah penutup, presisi, deskripsi hukum, titik awal, lengkung, radius, luas, akre
from: 6793d6ce
---

Persil ada di denah dengan bearing dan jarak di sepanjang setiap ruas lurus (lengkung menampilkan radiusnya, panjang busurnya, dan sudut pusatnya) serta nama dan luasnya di tengah. Persil ikut ke plot PDF dan ekspor DWG serta DXF, pada layer `V-PROP` (garis) dan `V-PROP-TEXT` (label). Semuanya ada di bawah **Persil** di panel kanan saat tidak ada yang dipilih.

## Menggambar persil

1. Klik **Gambar persil**.
2. Klik sudut-sudutnya, mulai dari titik awal. Klik di dekat titik survei akan mengambil posisi tepat titik tersebut.
3. Klik sudut pertama lagi, atau tekan {{key:Enter}}, untuk selesai. {{key:Backspace}} membatalkan sudut terakhir; {{key:Esc}} membuang sudut-sudut yang sudah dibuat; tekan lagi untuk keluar dari alat.

## Memasukkan ukuran dari akta

1. Klik **Masukkan ukuran akta**.
2. Tentukan di mana ukuran dimulai: nomor titik survei, atau northing dan easting.
3. Ketik atau tempel ukurannya, satu per baris:
   - garis: bearing dan jarak, misalnya `N 45°30'15" E 125.50`. `N45-30-15E`, `N 45 30 15 E`, `N 45.5 E` dan azimut (`AZ 45°30'15"`) juga berfungsi, dan "thence", koma, serta "feet" diabaikan.
   - lengkung: `C R 300 L 52.36 right` (radius dan panjang busur), atau `C R 300 D 10°00'00" left` (radius dan sudut pusat). Lengkung melanjutkan ruas sebelumnya; jika tidak, tambahkan bearing tali busurnya: `C R 300 L 52.36 right CB N 50 00 00 E`.
   - `#` memulai baris komentar.
4. Saat Anda mengetik, dialog menampilkan panjang ukuran, **salah penutup** (seberapa jauh dari titik awal ukuran berakhir, dan ke arah mana), **presisi** (panjang dibagi salah penutup, 1 : 10,000 dan seterusnya), dan luasnya. Baris yang tidak dapat dibaca didaftar beserta nomor barisnya.
5. **Tambahkan persil**. Jika ukuran tidak menutup, persil ditutup dengan ruas lurus melintasi celah: periksa ukuran terhadap akta. Untuk menyebarkan galat poligon lapangan ke ruas-ruasnya, sesuaikan terlebih dahulu.

## Lengkung

Di **Properti** persil, setiap ruas memiliki **Radius**. Ketik radius untuk membuat ruas itu menjadi lengkung melalui dua sudut yang sama (radius yang lebih kecil dari setengah jarak antar-sudut tidak dapat dicapai, sehingga ditolak), lalu pilih **Kanan** atau **Kiri** di **Lengkung**: lengkung ke kanan memiliki pusatnya di sebelah kanan arah perjalanan, seperti dalam akta. Hapus radius untuk membuatnya lurus kembali. Setiap perubahan adalah satu langkah: {{key:Mod+Z}} mengurungkannya.

## Deskripsi hukum

Bagian akhir **Properti** persil berisi deskripsi hukumnya, ditulis dari gambar:

- "Dimulai di" **titik awal** yang Anda ketik (misalnya "sudut timur laut Kavling 4"), jika tidak, northing dan easting sudut pertama, atau titik survei tempat ukuran dimulai.
- "thence" setiap ruas: bearing dan jarak, atau lengkung dengan radius, panjang busur, sudut pusat, serta bearing dan jarak tali busur.
- "Berisi" luasnya dalam kaki persegi dan akre (meter persegi dan hektare pada proyek meter).

**Salin** menaruh deskripsi di papan klip; **Unduh sebagai teks** menyimpannya sebagai file `.txt`.

:::warning
Deskripsi hukum adalah draf dari gambar, bukan hasil survei. Surveyor berlisensi harus memeriksanya terhadap catatan dan menandatanganinya sebelum ada pihak yang mengandalkannya.
:::

Klik di dalam persil pada denah untuk memilihnya; {{key:Delete}} menghapusnya. Persil disimpan dalam file proyek.
