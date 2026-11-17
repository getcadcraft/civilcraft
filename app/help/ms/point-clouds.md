---
title: Awan titik daripada dron atau pengimbas
summary: Dengan add-on Awan titik, buka fail LAS atau LAZ yang mengandungi berjuta-juta titik, lihat keseluruhannya, bersihkannya, asingkan kepada tanah, tumbuhan dan bangunan, dan bina tanah, kontur serta isipadu daripadanya.
keywords: awan titik, las, laz, dron, fotogrametri, recap, lidar, imbasan, tanah, klasifikasi, hingar, timbunan, isipadu, korek dan timbus, kontur, garis putus, eye-dome, ortomozaik, ortho, hampar, lapisan peta, eksport las, eksport laz, mampatkan
from: e4a4901f
---

Kebanyakan orang tidak memerlukan ini, jadi ia ialah add-on. Hidupkan {{ui:Awan titik}} dalam Tetapan › Add-on; tab {{ui:Awan titik}} akan muncul dalam panel kanan. Fail dibaca dalam pelayar anda dan dipecahkan kepada jubin yang disimpan dalam storan pelayar anda sendiri (atau folder yang anda pilih). **Tiada apa-apa dimuat naik.**

:::warning
Setiap nilai yang dilaporkan tab ini ialah nombor daripada data anda, bukan sijil. Ia diuji pada tapak rekaan, belum pada tinjauan dron sebenar: baca keputusan awal dengan teliti dan beritahu kami apa yang anda dapati. Profesional berdaftar menentukan nilai tanah, kontur dan isipadu.
:::

## Buka awan

Di bawah {{ui:Buka awan}} pilih fail LAS atau LAZ. Tab menyatakan berapa banyak titik yang ada, sistem koordinat dan unitnya, serta berapa banyak ruang yang diperlukan untuk binaan; tekan {{ui:Bina awan}}. Binaan boleh dihentikan dan disambung semula dengan {{ui:Sambung semula}} (pilih fail yang sama sekali lagi). Fail itu tidak sekali-kali diubah. Fail 100 juta titik dibina dalam beberapa minit pada stesen kerja dan memerlukan ruang kira-kira sama dengan saiz fail.

Di bawah {{ui:Awan pada komputer ini}} anda buka atau alih keluar awan. {{ui:Simpan awan dalam folder…}} (Chrome, Edge dan aplikasi Studio) menyimpan jubin dalam folder yang anda pilih, contohnya folder awan CadCraft dalam Dokumen, supaya awan 10 GB tidak perlu muat dalam storan pelayar; awan yang dibina lebih awal kekal di tempat ia dibina. Pelayar meminta kebenaran sekali lagi selepas dimulakan semula: tekan {{ui:Guna folder … sekali lagi}}.

## Lihat awan

{{ui:Lihat dalam 3D}} melukis awan daripada jubin kasar dan memperhalusinya apabila anda bergerak lebih dekat, tidak lebih daripada {{ui:Titik paling banyak dilukis}} sekali gus (2.5 juta; 500 ribu pada telefon). Warnakan mengikut warna asal fail, ketinggian, kelas, keamatan atau reja. {{ui:Pencahayaan eye-dome}} menaungi tepi mengikut kedalaman supaya bentuk dapat dibaca tanpa normal (dimatikan pada telefon); {{ui:Titik mengecil mengikut jarak}} menjadikan titik jauh lebih kecil dan titik dekat lebih besar; {{ui:Saiz titik}} menetapkan saiznya. Pelan menunjukkan awan sebagai raster di bawah lukisan anda dan **diperhalusi apabila anda zum masuk** ke sebahagian daripadanya.

## Bersihkan

Di bawah {{ui:Bersihkan}} lukis lasso, kotak atau poligon dalam pelan (atau dalam 3D daripada pandangan atas: dalam 3D garis luar diambil terus ke bawah, jadi ia tepat hanya dari atas). Tab menunjukkan berapa banyak titik di dalam **sebelum** anda guna: {{ui:Padam titik ini}}, {{ui:Tukar kelasnya}}, {{ui:Pulihkan titik yang dipadam}} atau {{ui:Potong ikut sempadan ini}}. {{ui:Buat asal}} dan {{ui:Buat semula}} melalui log suntingan; fail itu sendiri tidak pernah diubah. {{ui:Penapis hingar…}} menanda titik berkeliaran sebagai titik rendah (kelas 7) atau hingar tinggi (kelas 18).

## Susun

{{ui:Cari tanah}} berfungsi jubin demi jubin dan menanda tanah (kelas 2) serta titik rendah; toleransinya ialah 0.15 m, atau 0.08 m dengan suis gred tinjauan. Ia melaporkan sambungan jubin yang tidak sepadan. {{ui:Klasifikasikan tumbuhan dan bangunan}} kemudian menanda tumbuhan rendah, sederhana dan tinggi serta bangunan, berdasarkan ketinggian di atas tanah dan betapa rata persekitarannya. Tiada pembelajaran mesin, jadi sebuah reban beratap rata di bawah pokok boleh tersilap dikelaskan: periksa.

## Tanah, kontur, garis putus

{{ui:Bina tanah}} membentuk tanah sedia ada daripada titik tanah dan menambahkannya ke projek dengan cara yang sama seperti import LAS (satu langkah buat asal). Ia kemudian membandingkan titik dengannya: min, RMS, persentil ke-95, bahagian dalam toleransi, dan sepuluh tempat yang paling berbeza, setiap satu dengan {{ui:Pergi ke situ}}. Warnakan mengikut {{ui:Reja}} untuk menunjukkan tempat tanah dan awan tidak bersetuju.

**Garis putus** (kerb, parit atau puncak tebing) dipilih pada awan: {{ui:Pilih garis putus pada awan}} dalam pandangan 3D mengambil titik lukis terdekat pada setiap klik, dan {{ui:Pilih garis putus dalam pelan}} mengambil titik awan terdekat (tanah dahulu) di bawah setiap klik; klik dua kali atau Enter menamatkan garisan. {{ui:Bina tanah}} seterusnya menggunakannya. {{ui:Tunjuk kontur}} melukis kontur di atas awan dalam gambar kecil dan menetapkan selang projek.

## Isipadu

{{ui:Isipadu timbunan…}} mengira isipadu permukaan di atas tapak dalam sempadan yang anda lukis. Lukis sempadan di atas tanah rata sekeliling longgokan dan pilih tapak: titik sempadan terendah, satah, tapak lengkung licin, permukaan melalui sempadan, atau aras yang anda taip. Pada tanah condong atau melengkung gunakan satah atau tapak lengkung; titik terendah akan dibaca terlalu tinggi. Titik sempadan yang menjulang di atas yang lain (pokok di garisan) dikecualikan daripada tapak. {{ui:Penerbangan ke penerbangan}} memberi korek dan timbus antara dua awan. Kedua-duanya boleh disimpan sebagai CSV.

## Ortomozaik

Di bawah {{ui:Ortomozaik (gambar dari atas)}} pilih ortomozaik dron bersama fail dunia dan `.prj`-nya jika ada: GeoTIFF, atau PNG atau JPEG. Ia menjadi **lapisan peta** projek, jadi pelan menunjukkannya di bawah lukisan anda, dan pandangan 3D (warna {{ui:Peta}}) menampalkannya pada tanah yang anda bina, jadi {{ui:Bina tanah}} dahulu. Tab menyatakan berapa banyak awan yang dilitupi gambar, dan memberi amaran apabila ia tidak melitupi apa-apa: punca biasa ialah sistem koordinat yang berbeza, jadi berikan fail `.prj` bersamanya. Apabila tiada `.prj`, program bertanya di mana koordinat berada. Gambar disimpan dalam fail projek; GeoTIFF melebihi 200 MB ditolak dan ortomozaik yang sangat besar dikurangkan kepada 16 megapiksel, jadi untuk tinjauan besar potong ortomozaik mengikut tapak dahulu.

## Eksport

{{ui:Eksport}} menulis awan yang telah dibersihkan dan dikelaskan sebagai fail baharu (semua titik, kelas yang dibersihkan, atau tanah sahaja). Di bawah {{ui:Jenis fail}} pilih:

- **LAS 1.4 (tidak dimampatkan)**: format titik 6, atau 7 dengan warna.
- **LAZ (dimampatkan)**: titik yang sama dimampatkan tanpa kehilangan, jadi setiap titik kembali tepat. Ia ditulis sebagai format titik 0, atau 2 dengan warna, dalam fail LAS 1.4. Pada tapak rekaan 300 m, LAZ kira-kira satu perlima saiz fail LAS 1.4. Format LAZ 0 dan 2 hanya memuat kelas 0 hingga 31: titik dengan kelas lebih tinggi ditolak dengan mesej, jadi eksport awan itu sebagai LAS 1.4.

LAZ ditulis oleh pemampat CadCraft sendiri, dibina daripada spesifikasi LAZ yang diterbitkan. Kami telah menyemak bahawa pembaca kami sendiri dan dua pembaca LAZ bebas (laz-perf, yang digunakan aplikasi untuk membuka fail LAZ, dan laspy dengan lazrs) membaca setiap titik semula dengan tepat, dan bahawa fail LAZ yang dibuat oleh laspy menjadi sama bait demi bait apabila kami menulis semula titiknya. Program lain belum dicuba, jadi jika satu program tidak dapat membuka fail, beritahu kami yang mana.

Apabila pelayar boleh menulis fail semasa ia berjalan, anda pilih fail dahulu dan awan yang sangat besar ditulis kepadanya satu jubin pada satu masa dan tidak dikumpulkan dalam memori; jika tidak, fail dikumpulkan dan dimuat turun, yang sesuai sehingga beberapa ratus megabait.

## Apa yang tidak dilakukannya

Ia hanya membaca LAS dan LAZ (E57, PLY dan PCD belum disambungkan ke tab ini, dan beberapa fail daripada satu penerbangan tidak digabungkan), tidak memproyeksikan semula awan (sistem projek dan meter dianggap), tidak membaca fail RCP atau RCS Autodesk, tidak membina permukaan daripada gambar, dan tidak mencari tiang, kerb atau paip dengan sendirinya.
