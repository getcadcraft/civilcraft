---
title: Lembar plan dan profil
summary: Plot alinyemen sebagai sekumpulan lembar plan dan profil dalam satu PDF, dengan garis penyambung di antaranya.
keywords: plan dan profil, lembar, plot, pdf, garis penyambung, produksi plan, plan jalan, plot profil, pembesaran vertikal, set lembar
from: 34b4ec78
---

Lembar plan dan profil adalah cara gambar plan jalan biasanya dibuat: setiap lembar menampilkan satu bagian jalan dua kali, plan di atas dan profil di bawah, pada skala horizontal yang sama, sehingga stasiun berada di posisi yang sama di keduanya.

## Membuat lembar

1. Pilih alinyemen. Di **Properti**, klik {{ui:Lembar plan dan profil}}.
2. Pilih **Kertas**, **Skala plan**, dan **Pembesaran profil** (berapa kali profil digambar lebih tinggi daripada panjangnya; mulai dari 10×). Dialog menyebutkan berapa banyak lembar yang dihasilkan dan berapa bagian alinyemen yang ditampilkan masing-masing.
3. Untuk memplot sebagian alinyemen, ubah **Dari stasiun** dan **Sampai stasiun**.
4. Klik {{ui:Unduh PDF}}. PDF memiliki satu halaman per lembar.

## Isi lembar

| Bagian | Yang ditampilkan |
|---|---|
| Plan | Semua yang ada di denah (kontur, titik survei, alinyemen dan stasiunnya, koridor, pad, garis fitur, pipa, garis sampel) diputar agar bagian jalan ini melintang di lembar, dengan panah utara ikut diputar |
| Garis penyambung | Garis titik-strip tegak lurus alinyemen di setiap ujung yang berlanjut di lembar lain, diberi label "Garis penyambung sta 5+50.00, lihat lembar 2" |
| Profil | Tanah asli (putus-putus), profil desain (merah), kelandaian setiap tangen dan PVI, elevasi, L, dan K setiap lengkung vertikal; stasiun di sepanjang bagian bawah, elevasi di kedua sisi |
| Strip judul | Nama proyek, alinyemen dan rentang stasiunnya, "Lembar 1 dari 3", skala horizontal dan vertikal, serta pembesarannya |

Panjang bagian per lembar sepanjang yang diizinkan jendela plan pada skala tersebut, dibulatkan ke bawah menjadi kelipatan utuh 50 ft (20 m) untuk bagian panjang atau 10 ft (5 m) untuk bagian pendek.

:::note
Ketika elevasi profil tidak muat pada pembesaran yang Anda pilih, CivilCraft menggambar setiap lembar pada pembesaran terbesar dari 10×, 5×, 4×, 2×, dan 1× yang muat, dan bilah status menyatakannya. Alinyemen melengkung diputar menurut arah dari awal hingga akhir setiap bagian, sehingga jalan mungkin naik atau turun sedikit pada lembar.
:::
