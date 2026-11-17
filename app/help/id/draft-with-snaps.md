---
title: Gambar dengan snap, sudut yang dipilih, dan pindahkan, salin, putar
summary: Tempatkan alinyemen, pad, persil dan garis fitur tepat pada titik dan sudut yang sudah ada, ketik atau pilih easting dan northing sebuah sudut, putar tangen ke arah dua titik, dan pindahkan, salin atau putar objek sejauh jarak atau sudut tertentu.
keywords: snap, osnap, snap ke titik, snap ke sudut, pi, vertex, sudut, pilih, crosshair, easting, northing, koordinat, koordinat yang diketik, tangen, arah, bearing, pindahkan, salin, putar, transformasi, salin dan putar, duplikat, alt, titik bebas, penggambaran
from: 49864dda
---

Baru di 0.9: saat Anda menggambar, kursor mendarat pada titik dan sudut yang sudah ada di denah, dan sudut pad, persil atau garis fitur dapat diketik atau dipilih. Topik ini memandu ketiga alat tersebut.

## Yang akan Anda lakukan

- Menggambar dengan snap, sehingga alinyemen, pad, persil atau garis baru mulai dan berakhir tepat pada sesuatu yang sudah ada.
- Mengatur easting dan northing sebuah sudut dengan mengetiknya atau memilih tempat di denah.
- Memutar tangen alinyemen ke arah dua titik yang dipilih.
- Memindahkan, menyalin atau memutar seluruh objek.

## Langkah

1. Pilih alat gambar, misalnya {{ui:Alinyemen}}, {{ui:Pad}}, {{ui:Persil}} atau {{ui:Garis fitur}}. Gerakkan penunjuk dekat titik survei, PI alinyemen, pad, persil atau sudut massa, vertex garis fitur, atau struktur storm. Sebuah penanda muncul dengan label (PI, Sudut, Vertex, Struktur atau Titik dan nomornya) serta easting dan northing tempat ia akan mendarat. Klik untuk menempatkan titik di sana.
2. Untuk menempatkan titik secara bebas, tahan {{key:Alt}} sambil mengklik. Snap dimatikan.
3. Pilih pad, persil atau garis fitur. Di Properti, blok {{ui:Sudut}} mendaftar setiap sudut dengan kotak Easting dan kotak Northing. Ketik angka baru, atau tekan tombol bidik di sebelah sudut dan klik tempat di denah. Sudut mengambil easting dan northing itu. Tekan {{key:Esc}} untuk membatalkan pemilihan. Bidik hanya bekerja di denah: tutup tampilan 3D terlebih dahulu.
4. Untuk memutar tangen, pilih alinyemen. Di Properti, di bawah {{ui:Tangen dari dua titik}}, pilih tangen, tekan {{ui:Titik pertama}} dan klik di denah, tekan {{ui:Titik kedua}} dan klik lagi, lalu tekan {{ui:Atur arah}}. Tangen berputar agar berjalan dari titik pertama menuju titik kedua dan tetap mempertahankan panjangnya.
5. Untuk memindahkan, menyalin atau memutar, pilih alinyemen, pad, persil atau garis fitur. Di Properti, di bawah {{ui:Pindahkan, salin dan putar}}, ketik {{ui:Pindah ke timur}} dan {{ui:Pindah ke utara}} (angka negatif ke barat dan selatan), lalu tekan {{ui:Pindahkan}} atau {{ui:Salin}}. Atau tekan {{ui:Jarak dari dua titik}} dan klik titik asal dan titik tujuannya.
6. Untuk memutar, ketik sudut di {{ui:Putar berlawanan arah jarum jam}} (derajat), lalu tekan {{ui:Putar}} atau {{ui:Salin dan putar}}. Objek berputar pada titik tengah sudut-sudutnya, kecuali Anda memilih titik putar dengan bidik di sebelah sudut.

## Catatan

- Salinan membiarkan aslinya di tempatnya dan dipilih setelahnya.
- Setiap pindah, salin, putar, pemilihan sudut dan pemutaran tangen adalah satu langkah urungkan.
- Snap menjangkau 10 piksel layar dari kursor. Penanda snap hanya menawarkan tempat; tidak ada yang berubah sampai Anda mengklik.
- Bidik yang sama ada pada baris PI alinyemen. Lihat [Alinyemen](topic:alignment), [Persil](topic:parcels) dan [Garis fitur](topic:feature-lines).
