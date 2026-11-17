---
title: Beri gaya lapisan menurut atribut
summary: Warnai fitur lapisan GIS menurut nilai sebuah kolom (satu warna per nilai, atau menurut rentang angka), ukur titik menurut angka, beri warna pada poligon, dan tampilkan legenda di denah.
keywords: simbologi, gaya, warna, berkategori, bertingkat, nilai unik, interval sama, kuantil, natural breaks, jenks, ramp, buta warna, legenda, ukuran, titik, choropleth, kelas, gis
from: a3a69add
---

Buka menu **tiga titik** lapisan di daftar Lapisan GIS dan pilih {{ui:Gaya menurut atribut…}}.

## Tiga gaya

- **Simbol tunggal:** warna lapisan, seperti sebelumnya.
- **Berkategori:** satu warna untuk setiap nilai berbeda dari kolom mana pun. Hingga delapan nilai mendapat delapan warna Okabe-Ito (dipilih agar tetap terpisah bagi jenis buta warna yang umum); dengan lebih banyak nilai, tujuh yang paling sering mendapat warna masing-masing dan sisanya berbagi kelas abu-abu **Lainnya**. Fitur tanpa nilai berwarna abu-abu.
- **Bertingkat:** kolom angka dibagi menjadi 2 hingga 9 rentang, masing-masing dengan warna dari ramp. Nilai pada batas masuk ke rentang yang lebih rendah.

## Cara rentang dipotong

| Metode | Batas |
|---|---|
| Interval sama | Rentang dari nilai terkecil hingga terbesar dibagi menjadi lebar yang sama. Nilai 0 hingga 30 dalam tiga rentang: 0, 10, 20, 30. |
| Kuantil | Kira-kira jumlah fitur yang sama di setiap rentang. Batas dibaca dari nilai yang diurutkan dengan interpolasi garis lurus yang biasa: untuk 1 hingga 10 dalam dua rentang, batasnya 5.5. |
| Natural breaks (Jenks) | Potongan yang menyisakan sebaran paling kecil di dalam setiap rentang, sehingga kelompok nilai yang mirip tetap bersama. Pada lebih dari 1,500 nilai, metode ini bekerja pada 1,500 nilai yang berjarak merata dan menyatakannya. |

## Warna

Viridis dan Cividis berjalan dari gelap ke terang dengan perubahan kecerahan yang stabil, sehingga urutan rentang tetap dapat dibaca meskipun dalam abu-abu atau bagi buta warna. Blues berjalan dari terang ke gelap. Merah ke biru adalah ramp dua arah untuk nilai di sekitar titik tengah. **Balik warna** membalik salah satunya. Dialog mendaftar rentang dan jumlah fitur di setiap rentang sebelum Anda menerapkannya.

## Ukuran, isian, dan legenda

- **Ukuran titik menurut** kolom angka membuat persegi setiap titik makin besar seiring nilainya, di antara dua ukuran yang Anda tentukan (setengah sisinya, dalam milimeter di atas kertas).
- **Warnai bagian dalam poligon** mengisi setiap poligon dengan warna kelasnya (lubang tetap kosong). Warna ini hanya di layar; plot dan DXF/DWG menampilkan garis tepi berwarna.
- **Tampilkan legenda di denah** menggambar kelas, jumlahnya, dan rentang ukuran di kiri bawah denah. Legenda hanya di layar; tidak ada di plot.
- Untuk memberi label fitur dengan kolom, gunakan **Beri label dengan** di menu yang sama.

Gaya disimpan dalam berkas proyek. Build yang tidak mengenal gaya membuka berkas dengan warna lapisan. Plot, DXF, dan DWG membawa kelas sebagai lapisan terpisah yang dinamai menurut lapisan dan kelasnya, dalam warna CAD dasar terdekat dari sembilan warna. Lapisan dengan lebih dari 200,000 fitur digambar dalam satu warna.
