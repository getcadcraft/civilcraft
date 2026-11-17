---
title: Gambar massa bangunan di lokasi
summary: Gambar massa bangunan di atas persil, beri lantai dan tinggi lantai, lihat luas lantai brutonya, pilih cara ia berada di tanah miring, dorong dan tarik tingginya dalam 3D, dan kirim ke BimCraft atau simpan sebagai file IFC.
keywords: massa, massing, massa bangunan, volume, footprint, lantai, tinggi lantai, luas lantai bruto, GFA, kemiringan, podium, galian dan timbunan, dorong tarik, 3D, studi lokasi, desain awal, IFC, kembangkan, BimCraft, A-MASS
from: e5a67c16
---

Massa bangunan adalah footprint, jumlah lantai, dan tinggi lantai: pertanyaan awal "berapa banyak bangunan yang muat di sini, dan apa pengaruhnya terhadap tanah". Massa berada di denah dengan nama, jumlah lantai, dan luas lantai bruto; ia masuk ke plot PDF serta ekspor DWG dan DXF pada layer `A-MASS` dan `A-MASS-TEXT`, dan disimpan dalam file proyek.

## Gambar massa

1. Di **Properti**, di bawah **Massa bangunan**, klik **Gambar massa**. (Perintah ini juga ada di menu **Lainnya** pada bilah alat, di sebelah **Permukaan**.)
2. Klik sudut-sudut footprint. Klik di dekat sudut persil atau titik survei mengambil posisi tepat titik itu.
3. Klik sudut pertama lagi, atau tekan {{key:Enter}}, untuk menyelesaikan. {{key:Backspace}} membatalkan sudut terakhir; {{key:Esc}} berhenti.

Massa baru memiliki tiga lantai dan tinggi lantai 12 ft (3.6 m), dan termasuk persil tempat titik tengahnya berada.

## Lantai, tinggi, dan luas

Klik massa untuk mengubah **Nama**, **Fungsi**, **Lantai**, **Tinggi lantai**, dan **Persil**. **Tinggi** adalah jumlah lantai dikali tinggi lantai: ketik tinggi dan jumlah lantai menjadi bilangan bulat terdekat (tidak pernah kurang dari satu). **Footprint** dan **Luas lantai bruto** (footprint dikali jumlah lantai) dihitung untuk Anda.

## Di tanah miring

Tanah di bawah massa dibaca dari permukaan: tanah eksisting, atau tanah yang digrading jika Anda memilih **Tanah rencana (digrading)**. **Di tanah miring** menyatakan di mana lantai dasar berada:

- **Bertingkat**: pada rata-rata tanah di bawah footprint. Sisi rendah diisi sampai ke sana dan sisi tinggi digali, dan keduanya hampir seimbang.
- **Podium**: pada tanah tertinggi. Alas padat mengisi sisi rendah.
- **Galian**: pada tanah terendah. Sisi tinggi digali ke dalam bukit.

Properti menampilkan rentang tanah di bawah massa, **Elevasi lantai dasar**, dan volume timbunan serta galian antara tanah dan level itu. Titik footprint yang berada di luar permukaan dibiarkan keluar, dan Properti menyatakan berapa banyak.

## Di tampilan 3D

Massa digambar di tampilan lokasi 3D, dengan garis mengelilingi setiap lantai dan namanya di atas atap. **Tampilkan** memiliki kotak centang untuk **Massa bangunan**. Klik satu untuk memilihnya. Dengan massa terpilih:

- seret atapnya ke atas atau ke bawah untuk mendorong atau menarik satu lantai sekaligus, atau tekan {{key:PageUp}} dan {{key:PageDown}};
- seluruh pemindahan adalah satu langkah urungkan.

Tampilan jalan **Berkendara** juga melihat massa, dan **Matahari** memproyeksikan bayangannya ke tanah.

## Kirim lebih lanjut

- **Massa sebagai IFC** menyimpan setiap massa sebagai file IFC4: sebuah lokasi, sebuah bangunan dengan lantainya, dan massa sebagai elemen bangunan dengan angkanya dalam set properti `CadCraft_SiteMass`. Dengan sistem koordinat yang diatur pada proyek, file ditempatkan di peta dan memuat lintang serta bujur lokasi; tanpa itu, file tidak menyatakan apa pun tentang di mana letaknya.
- **Kembangkan di BimCraft** membuka BimCraft di tab baru dengan massanya. Di sana, memilih massa menampilkan angkanya dan **Kembangkan massa ini**, yang membangun dinding di setiap level dan lantai di bawah bangunan dari footprint, dalam satu langkah urungkan. Tidak ada yang diunggah: file berpindah antara kedua tab peramban ini.

Lihat juga **Batas zonasi** dan **Jam matahari**.
