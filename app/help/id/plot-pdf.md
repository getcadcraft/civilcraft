---
title: Plot denah ke PDF
summary: Plot semuanya atau tampilan saat ini ke PDF vektor pada lembar standar dengan skala teknik atau metrik, dalam warna layer atau hitam.
keywords: plot, cetak, pdf, lembar, skala, ukuran kertas, lembar denah, publikasi, kepala gambar, panah utara, bilah skala
from: 9af396ca
---

{{ui:PDF}} mem-plot denah ke PDF vektor pada satu lembar, dengan strip judul, panah utara, dan bilah skala. PDF dibuat di peramban dan diunduh; PDF tidak melalui dialog cetak peramban.

## Plot

1. Atur denah di bagian **Tampilan**: permukaan yang ditampilkan, interval kontur, dan hal-hal apa saja yang aktif. Plot mengikuti pengaturan ini.
2. Jika Anda hanya menginginkan sebagian tapak, lakukan zoom dan geser denah ke bagian tersebut.
3. Klik {{ui:PDF}} di grup **Ekspor**, atau tekan {{key:Mod+P}}.
   Dialog **Plot denah ke PDF** terbuka.
4. Pilih **Area**: {{ui:Semuanya}} atau {{ui:Yang ada di layar}}.
5. Pilih **Kertas**: Letter, Tabloid, ANSI D, ARCH D, ISO A4, A3, atau A1. Proyek berunit kaki dimulai dari Tabloid, proyek berunit meter dari A3. Lembar selalu lanskap.
6. Pilih **Skala**. Daftar menandai skala terbesar yang pas dengan "(pas)" dan memilihnya.
   - Kaki: 1" = 5', 10', 20', 30', 40', 50', 60', 100', 200', 300', 400', 500', 1000'.
   - Meter: 1:50, 1:100, 1:200, 1:250, 1:500, 1:1000, 1:2000, 1:2500, 1:5000, 1:10000.
7. Pilih **Tinta**: {{ui:Warna layer}} atau {{ui:Hitam}}.
8. Baca baris di bawah pilihan. Baris itu memberi ukuran area di kertas dan ukuran lembar, misalnya "Area berukuran 297 × 222 mm pada 1" = 40' di lembar 432 × 279 mm (lanskap)."
9. Klik {{ui:Unduh PDF}}.
   Peramban mengunduh `<name>.pdf`. Bilah status menyatakan "Diplot <name>.pdf pada 1" = 40'."

Jika area lebih besar dari lembar pada skala yang Anda pilih, plot dipusatkan dan tepinya terpotong. Pilih skala bertanda "(pas)" atau lembar yang lebih besar.

## Isi lembar

- Denah, dipusatkan di area gambar, sebagai vektor sejati: kontur, label, alinyemen dengan stasiunnya, koridor, pad dan garis daylight, pipa, titik.
- Ketebalan garis menurut layer: alinyemen, pad, dan pipa lebih tebal; segitiga dan kontur minor lebih halus.
- Strip judul di sepanjang bagian bawah dengan **Nama** proyek, skala, catatan interval kontur dan permukaan mana (eksisting atau tergrading), serta tanggal dan build di kanan.
- Panah utara di pojok kanan atas (utara denah menghadap ke atas) dan bilah skala di strip judul.
- Layer peta yang ditampilkan di bawah denah (gambar, ubin peta, atau layanan peta), saat **Layer peta di bawah denah** dicentang: digambar sebagai satu gambar dari seluruh area gambar pada 150 titik per inci, di bawah garis, dan atribusi peta masuk ke strip judul. CivilCraft menunggu hingga 8 detik untuk gambar peta yang masih datang; jika masih ada yang belum muncul, bilah status akan menyatakannya.

Teks memakai Helvetica bawaan PDF. Karakter di luar set Eropa Barat (Windows-1252) dicetak sebagai "?", dan pesan status menghitungnya.

## Yang tidak diplot

- Pita elevasi.
- Tampilan profil. Plot profil belum tersedia.
- Lebih dari satu lembar (untuk alinyemen, gunakan [lembar plan dan profil](topic:plan-profile-sheets)), viewport, kepala gambar kustom, atau lembar potret.

:::note
Dialog menyatakan panah kemiringan hanya untuk layar. Pada build ini, panah kemiringan yang dinyalakan di **Tampilan** tetap diplot (dan diekspor ke DXF). Matikan sebelum mencetak jika Anda tidak menginginkannya.
:::

## Mencetak di kertas

Buka PDF yang diunduh di penampil PDF apa pun dan cetak pada 100% (ukuran sebenarnya) agar skalanya tetap benar. "Sesuaikan dengan halaman" mengubah skala.
