---
title: Pasang susunan panel surya di tanah
summary: Tempatkan meja panel surya yang dipasang di tanah di dalam persil atau pad, dengan baris berjarak sesuai tanah tempat setiap meja benar-benar berdiri, tanah curam dibiarkan kosong, energi tahunan dihitung, dan meja ditampilkan di denah dan 3D.
keywords: panel surya, pv, fotovoltaik, susunan, pemasangan di tanah, meja, baris, jarak baris, naungan, medan, kemiringan, tiang pancang, hasil, kWp, energi, horizon
from: 95593fd6
---

## Yang akan Anda pelajari

Cara memasang deretan meja panel surya di lokasi yang tidak datar, dan arti angka-angkanya. Buka dari Permukaan › {{ui:Lainnya}} › Susunan panel surya.

## Atur meja

1. Pilih **Lokasi**: persil atau pad dari proyek, atau ketik sudut-sudut area. Centang pad atau persil apa pun yang harus tetap **kosong** (bangunan, kolam).
2. Ketik **garis lintang dan garis bujur** lokasi. Matahari bergantung padanya; tidak ada yang ditebak. Jika proyek memiliki sistem koordinat, **Tempatkan dari sistem koordinat** akan mengisinya.
3. Atur sudut kemiringan, arah hadap (kosong berarti menghadap ke khatulistiwa), jumlah modul per meja, serta daya dan ukuran modul. Angka modul awalnya berupa nilai generik dan diberi label demikian; ketik nilai Anda sendiri.
4. Tekan **Susun meja**. Jendela menampilkan jumlah meja dan modul, ukuran dalam kWp, dan jarak baris-ke-baris.

Setiap meja ditempatkan sebagai kolom di dalam area, dimulai dari bagian depan lalu bergerak mundur. Meja hanya ditempatkan di tempat tanah di bawahnya berada dalam batas kemiringan, berada di dalam area dan garis sempadan, serta tiang pancang yang dibutuhkannya tidak lebih tinggi dari batas yang Anda atur. Tempat yang gagal dibiarkan kosong, dan jendela menyebutkan berapa banyak dan alasannya.

## Baris diatur sesuai tanah

Di tanah datar, baris berdiri berjauhan menurut aturan tanpa-naungan yang biasa: bayangan sebuah baris pada tengah hari saat solstis musim dingin tidak boleh mencapai tepi bawah baris di belakangnya. Pada lereng, CivilCraft menerapkan aturan yang sama pada tanah tempat baris berikutnya benar-benar berdiri. Di tempat tanah naik di belakang meja, baris dapat berdiri lebih rapat; di tempat tanah turun, baris berdiri lebih berjauhan. Jendela menampilkan jarak terdekat, terjauh, dan rata-rata di samping jarak tanah datar, sehingga Anda dapat melihat pengaruh medan.

Bidang meja dinaikkan di atas tiang pancang sampai setiap sampel di bawahnya berada di atas tanah sejauh jarak bebas yang Anda atur. Tiang pancang tertinggi ditampilkan di hasil.

## Energi tahunan

**Energi tahunan** menghitung cahaya pada bidang miring untuk hari representatif setiap bulan, suhu sel, kehilangan yang Anda ketik, meja yang saling menaungi, dan bukit di horizon yang menyerap matahari yang mereka halangi. Langit yang dipakai adalah langit cerah, sehingga hasilnya merupakan batas atas; cuaca nyata memberi hasil lebih sedikit. Ini adalah estimasi desain awal, bukan laporan hasil.

## Simpan

**Simpan ke proyek** menyimpan masukan dan angka dalam file proyek; meja dihitung ulang dari tanah saat file dibuka, sehingga permukaan yang berubah akan memindahkannya. Meja ditampilkan di denah dan 3D (Tampilkan › Susunan panel surya). Daftar meja diunduh sebagai CSV. Satu langkah {{ui:Urungkan}} menghapus atau memulihkan susunan.

## Belum dibuat

Data cuaca sebagai pengganti langit cerah, meja yang mengikuti tanah ke arah timur–barat, pelacak, dan desain kelistrikan (string, kabel, inverter) di CivilCraft. Panel Solar PV BimCraft memiliki string dan diagram satu garis untuk atap.
