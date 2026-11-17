---
title: Lukis dengan snap, bucu yang dipilih, dan alih, salin, putar
summary: Letakkan penjajaran, pelantar, lot dan garis ciri tepat pada titik dan bucu yang sedia ada, taip atau pilih easting dan northing bucu, pusingkan tangen ke arah dua titik, dan alih, salin atau putar objek mengikut jarak atau sudut.
keywords: snap, osnap, snap ke titik, snap ke bucu, pi, verteks, bucu, pilih, tanda silang, easting, northing, koordinat, koordinat yang ditaip, tangen, arah, bearing, alih, salin, putar, ubah, salin diputar, pendua, alt, titik bebas, lukisan
from: 49864dda
---

Baharu dalam 0.9: apabila anda melukis, penunjuk mendarat pada titik dan bucu yang sudah ada dalam pelan, dan bucu pelantar, lot atau garis ciri boleh ditaip atau dipilih. Topik ini melalui tiga alat.

## Apa yang akan anda lakukan

- Lukis dengan snap, supaya penjajaran, pelantar, lot atau garisan baharu bermula dan berakhir tepat pada sesuatu yang sudah wujud.
- Tetapkan easting dan northing bucu dengan menaipnya atau memilih tempat dalam pelan.
- Pusingkan tangen penjajaran ke arah dua titik yang dipilih.
- Alih, salin atau putar keseluruhan objek.

## Langkah

1. Pilih alat lukisan, contohnya {{ui:Penjajaran}}, {{ui:Pelantar}}, {{ui:Lot}} atau {{ui:Garis ciri}}. Gerakkan penunjuk berhampiran titik ukur, PI penjajaran, bucu pelantar, lot atau jisim, bucu garis ciri atau struktur saliran ribut. Penanda muncul dengan label (PI, Bucu, Bucu garisan, Struktur atau Titik dan nombornya) dan easting serta northing ia akan mendarat. Klik untuk meletakkan titik di sana.
2. Untuk meletakkan titik secara bebas, tahan {{key:Alt}} semasa anda klik. Snap dimatikan.
3. Pilih pelantar, lot atau garis ciri. Dalam **Sifat**, blok {{ui:Bucu}} menyenaraikan setiap bucu dengan kotak Easting dan kotak Northing. Taip nombor baharu, atau tekan butang tanda silang di sebelah bucu dan klik tempat dalam pelan. Bucu mengambil easting dan northing itu. Tekan {{key:Esc}} untuk membatalkan pilihan. Tanda silang hanya berfungsi dalam pelan: tutup pandangan 3D dahulu.
4. Untuk memusingkan tangen, pilih penjajaran. Dalam **Sifat**, di bawah {{ui:Tangen daripada dua titik}}, pilih tangen, tekan {{ui:Titik pertama}} dan klik dalam pelan, tekan {{ui:Titik kedua}} dan klik semula, kemudian tekan {{ui:Tetapkan arah}}. Tangen berpusing supaya berjalan dari titik pertama ke arah titik kedua dan mengekalkan panjangnya.
5. Untuk mengalih, menyalin atau memutar, pilih penjajaran, pelantar, lot atau garis ciri. Dalam **Sifat**, di bawah {{ui:Alih, salin dan putar}}, taip {{ui:Alih ke timur}} dan {{ui:Alih ke utara}} (nombor negatif pergi ke barat dan selatan) dan tekan {{ui:Alih}} atau {{ui:Salin}}. Atau tekan {{ui:Jarak daripada dua titik}} dan klik titik untuk dialih dari dan titik untuk dialih ke.
6. Untuk memutar, taip sudut dalam {{ui:Putar mengikut arah lawan jam}} (darjah), kemudian tekan {{ui:Putar}} atau {{ui:Salin diputar}}. Ia berpusing tentang tengah bucunya melainkan anda memilih titik untuk diputar mengelilinginya dengan tanda silang di sebelah sudut.

## Nota

- Salinan meninggalkan objek asal di tempatnya dan dipilih selepas itu.
- Setiap alih, salin, putar, pemilihan bucu dan tangen yang dipusingkan ialah satu langkah buat asal.
- Snap sampai 10 piksel skrin dari kursor. Penanda snap hanya menawarkan tempat; tiada apa berubah sehingga anda klik.
- Tanda silang yang sama ada pada baris PI penjajaran. Lihat [Penjajaran](topic:alignment), [Lot](topic:parcels) dan [Garis ciri](topic:feature-lines).
