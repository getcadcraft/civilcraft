---
title: Objek dari garis, tetap tertaut
summary: Buat perkerasan, area tanaman, bedengan, pagar hidup, jalur, dinding, kerb, tangga, rampa, platform, parit, atau garis fitur dari sebuah garis; objek ikut bergerak saat garis berpindah, sampai Anda memutus tautannya.
keywords: dari garis, garis, DWG, DXF, tautan, tertaut, ikuti, regenerasi, putuskan tautan, garis fitur, garis fitur dari garis, lapisan impor, garis besar, supercad studio, garis gambar
from: eb67a0c6
---

{{ui:Dari garis}} (Lanskap › {{ui:Lainnya}}): klik garis fitur, atau garis atau garis besar dari lapisan DWG/DXF yang diimpor. Garis tertutup dapat membuat perkerasan, rumput, bedengan tanaman, padang rumput, penutup tanah, bedengan, atau platform; garis terbuka membuat jalur, dinding, kerb, tangga (titik pertama dan terakhirnya), rampa, pagar hidup, atau parit. Keduanya dapat membuat **garis fitur**, kecuali garis fitur itu sendiri.

## Garis fitur dari sebuah garis

Garis fitur yang dibuat dari garis mengambil titik-titiknya, tertutup jika garisnya tertutup. Elevasinya diletakkan di atas tanah asli (0 bila belum ada), dan penggunaannya **Mati**: ia tidak membentuk tanah apa pun sampai Anda memilih penggunaan dan mengatur elevasinya di Properti. Saat garis berpindah, garis fitur dengan jumlah titik yang sama mempertahankan setiap elevasi yang Anda atur; saat garis bertambah atau kehilangan titik, elevasinya diletakkan lagi di atas tanah. Lihat [Garis fitur](topic:feature-lines).

Objek baru menyimpan **tautan** ke garisnya. Saat garis berpindah (Anda menyeret titiknya, atau gambar dipindahkan atau dibaca ulang), objek mengambil bentuk baru dalam langkah urungkan yang sama, dan melalui pengubah tanah, tanah usulan ikut berubah. Properti menyebutkan apa yang ditautkan; {{ui:Putuskan tautan}} membuatnya bebas.

Garis diperiksa lebih dulu: garis membutuhkan minimal 2 titik (3 untuk garis besar), paling banyak 5000, berupa angka riil; garis besar harus tertutup dan tidak boleh berpotongan dengan dirinya sendiri. Garis yang gagal tidak dipakai: objek tetap seperti semula dan panel Masalah menyebutkan alasannya. Jika garis dihapus, objek tetap ada dan panel Masalah mencatatnya.

## Di SuperCad Studio

Buka lokasi dan gambar 2D dalam proyek yang sama. Pilih satu garis atau polyline di gambar 2D, tekan Ctrl+K dan jalankan {{ui:Objek lanskap dari garis gambar yang dipilih}}: CivilCraft menanyakan apa yang akan dibuat, seperti di atas, dan objek tetap tertaut ke garis gambar itu. Setelah Anda mengubah garis di gambar, Ctrl+K {{ui:Perbarui lanskap dari gambar}} membuat objek mengikuti, dengan satu langkah urungkan untuk tiap garis. File tautan proyek mencatat objek mana mengikuti garis mana. Bantuan SuperCad Studio sendiri memiliki topik Lanskap.
