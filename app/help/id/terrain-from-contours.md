---
title: Medan dari garis kontur
summary: Buat permukaan tanah dari peta kontur: pilih layer garis, tentukan dari mana elevasi setiap garis berasal, periksa persilangan dan duplikat, lalu bangun. Garis kontur menjadi breakline, dengan segitiga datar di punggungan dan lembah diperbaiki. Peta yang ditelusuri dari gambar atau PDF dapat diskalakan dan diletakkan dengan dua titik yang diketahui.
keywords: kontur, garis kontur, medan dari kontur, permukaan dari kontur, peta topografi, peta survei, tanpa koordinat, breakline, segitiga datar, punggungan, lembah, puncak bukit, kontur berpotongan, kontur duplikat, interval kontur, skala peta, dua titik, letakkan peta, DXF, DWG, shapefile
from: e6161653
---

Surveyor kadang mengirim peta kontur: garis dengan elevasi, tetapi tanpa titik. CivilCraft membangun tanah yang ada dari garis-garis itu.

## Bawa kontur masuk

Buka peta sebagai garis: gambar DXF atau DWG, shapefile atau GeoJSON (**GIS** › {{ui:Impor}}, atau letakkan file di denah). Garis masuk sebagai **layer peta**. Di bawah **Permukaan** › {{ui:Lainnya}}, pilih {{ui:Medan dari kontur}}.

## Tentukan dari mana setiap elevasi berasal

Centang layer yang berisi kontur, lalu pilih **Elevasi dari**:

- {{ui:Elevasi garis itu sendiri}}: garis yang semua titik sudutnya memiliki elevasi sama (polyline 3D, atau polyline dengan elevasi). Garis di 0 adalah garis denah dan tidak memiliki ketinggian.
- **Kolom angka** dari layer (misalnya ELEV), jika peta datang dengannya.
- {{ui:Awal dan interval, sesuai urutan garis terdaftar}}: untuk garis tanpa elevasi sama sekali. Garis pertama yang terdaftar mendapat **Elevasi garis pertama**, garis berikutnya elevasi itu ditambah **Interval kontur**, dan seterusnya. Daftarkan garis dari yang terendah ke atas (atau urutkan ulang di layer).

## Periksa, lalu bangun

{{ui:Periksa}} mencantumkan apa yang salah, dalam kata-kata, sebelum ada yang berubah:

- garis **tanpa elevasi** atau dengan kurang dari dua titik;
- garis **duplikat** (bentuk yang sama dua kali, bahkan jika digambar dengan arah terbalik);
- dua garis yang **berpotongan**, pada elevasi berbeda atau sama (garis yang memotong dirinya sendiri juga), beserta tempatnya;
- elevasi yang **tidak sesuai interval** (salah ketik seperti 105.5 pada peta 1 m).

Centang {{ui:Sisihkan garis yang berpotongan dengan garis lain}} untuk membuang garis yang memotong paling banyak garis lain (lalu berikutnya, sampai tidak ada yang berpotongan): garis liar yang memotong setiap kontur itulah yang dibuang, bukan konturnya. **Sederhanakan garis dalam** menghilangkan titik sudut yang lebih dekat ke lurus daripada jarak itu.

{{ui:Bangun tanah}} menambahkan garis ke tanah yang ada sebagai breakline (satu langkah urungkan), sehingga permukaan melewati setiap kontur dengan tepat. Dengan {{ui:Perbaiki segitiga datar di punggungan, lembah, dan puncak bukit}} dicentang dan interval diberikan, CivilCraft juga menambahkan titik di dalam setiap segitiga datar (segitiga yang semua sudutnya berada pada satu kontur) pada ketinggian yang dilanjutkan oleh lereng di sebelahnya, dan tidak pernah lebih dari setengah interval dari kontur. Tanpa itu, puncak punggungan, dasar lembah, dan puncak bukit menjadi pelat datar. Pada bukit uji, kesalahan terhadap permukaan sebenarnya turun sebesar seperempat; pada punggungan sebesar 40%.

## Peta tanpa koordinat

Untuk peta kontur yang ditelusuri dari gambar atau PDF, buka **Skalakan dan letakkan layer dengan dua titik yang diketahui**. Berikan dua titik di peta dan lokasi sebenarnya; layer yang dicentang diskalakan, diputar, dan dipindahkan agar pas (satu langkah urungkan; ketinggian tidak diubah). Kedua titik yang sama memberikan skala (ditampilkan dalam pesan) dan rotasi.

Permukaan sebaik petanya: di antara dua kontur ia berupa bidang, sehingga tanah sebenarnya di antara keduanya tidak diketahui. Periksa hasilnya terhadap elevasi titik sebelum mengandalkannya.
