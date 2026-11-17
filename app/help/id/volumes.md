---
title: Volume galian dan timbunan
summary: Baca volume galian, timbunan, dan netto antara tanah yang ada dan permukaan rencana, per pad dan koridor serta totalnya, dan pahami metode grid di baliknya.
keywords: volume, pekerjaan tanah, galian, timbunan, netto, galian dan timbunan, kuantitas, metode grid, perbandingan permukaan, permukaan volume, yard kubik, meter kubik
from: 299d7bc7
---

Begitu sebuah pad atau koridor digrading tanpa masalah, CivilCraft membandingkan permukaan rencana dengan tanah yang ada dan melaporkan galian dan timbunan. Angkanya diperbarui setiap ada perubahan.

## Tempat membacanya

- **Pekerjaan tanah** di panel kanan saat tidak ada yang dipilih (tampilan **Proyek**), jika ada setidaknya satu pad atau satu koridor.
- **Pekerjaan tanah** di panel kanan saat sebuah pad dipilih (total yang sama untuk seluruh proyek).
- Baris di bawah pengaturan koridor, dengan galian dan timbunan koridor itu sendiri.

Blok **Pekerjaan tanah** menampilkan:

- **Galian**, **Timbunan**, dan **Netto** (dengan "timbunan" atau "galian" setelahnya, mana yang lebih besar)
- satu baris per item jika ada lebih dari satu, misalnya "Pad 1: galian 120.4 yd³, timbunan 310.2 yd³"
- baris metode: "Metode grid: tanah yang ada dan permukaan yang digrading di-sampling setiap 0.5 ft di dalam garis daylight (92,891 sel). Tidak ada faktor pengembangan atau penyusutan yang diterapkan."

Volume dalam yard kubik di proyek kaki dan meter kubik di proyek meter.

## Kirim ke TakeoffCraft

Untuk menghitung harga pekerjaan tanah, pilih {{ui:Kirim ke TakeoffCraft}} di bagian bawah blok **Pekerjaan tanah**. CivilCraft menyimpan file kuantitas (`<site>.quantities.json`) dengan dua kuantitas: galian dan timbunan, dalam yard kubik (proyek kaki) atau meter kubik (proyek meter), angka yang sama dengan blok itu, hingga dua desimal. Buka di TakeoffCraft dengan **Buka takeoff**, atau seret ke sana: keduanya menjadi dua item yang dapat Anda beri harga ([Galian dan timbunan dari CivilCraft](app:takeoffcraft/earthwork#cut-and-fill-from-civilcraft)). Kirim ulang setelah perubahan dan buka file baru: item yang sama akan memakai angka baru.

Hanya totalnya yang dikirim, sehingga tidak ada yang terhitung dua kali; catatan file mencantumkan galian dan timbunan milik setiap pad dan koridor.

## Cara dihitung

CivilCraft memakai **metode grid**:

1. Grid sel persegi dibentangkan di atas area di dalam setiap garis daylight.
2. Di pusat setiap sel, kedua permukaan di-sampling.
3. Setiap sel dihitung sebagai prisma: selisih elevasi dikali luas sel. Jika permukaan rencana lebih rendah, itu galian; jika lebih tinggi, timbunan.
4. Sel-sel dijumlahkan.

Ukuran sel dipilih untuk Anda sehingga persegi panjang di sekitar area yang digrading memuat sekitar 250,000 sel, dibulatkan ke nilai yang rapi (1, 2, atau 5 kali pangkat sepuluh). Anda belum bisa mengaturnya sendiri. Baris metode memberi tahu ukuran dan jumlah sel. Sel yang lebih kecil lebih akurat di sepanjang tepi; pada sel-sel utuh di antara bidang datar, hasilnya tepat.

## Hal yang perlu diketahui

- Hanya area di dalam garis daylight yang dihitung. Tanah di luarnya tidak berubah.
- Pad atau koridor yang bermasalah tidak digrading dan tidak menambah apa pun. Jika blok menampilkan "Belum ada volume: pad harus digrading tanpa masalah.", cari kotak merah di atasnya.
- Jika item saling tumpang tindih, item yang lebih akhir menggantikan yang lebih awal di dalam garis daylight-nya, dan tumpang tindih itu dihitung sekali.
- Tidak ada faktor pengembangan atau penyusutan yang diterapkan. Kalikan hasilnya sendiri jika Anda membutuhkan volume bank, lepas, atau padat.
- Pengupasan lapisan atas, kedalaman perkerasan dan subgrade, serta volume prisma TIN-ke-TIN belum tersedia.

## Memeriksa hasil

- Aktifkan {{ui:Rencana (grading)}} di bawah **Tampilan** dan lihat kontur di dalam garis daylight.
- Arahkan penunjuk ke area yang digrading: bilah status menampilkan **Tanah** dan **Grading**. Selisihnya adalah kedalaman galian atau timbunan di titik itu.
- Untuk koridor, pembacaan di tampilan profil menampilkan galian atau timbunan pada garis tengah di setiap stasiun.
