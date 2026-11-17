---
title: Impor titik survei
summary: Buka file titik CSV atau teks, periksa urutan kolom di dialog Impor titik, perbaiki baris yang tidak dapat dibaca, dan kelompokkan titik ke dalam grup.
keywords: impor titik, import points, csv, txt, pnezd, penzd, file titik, point file, survei, survey, titik cogo, grup titik, kolom, columns, northing easting
from: ad33d88a
---

File titik adalah file teks dengan satu titik per baris: nomor titik, northing, easting, elevasi, dan deskripsi dalam urutan apa pun, dipisahkan dengan koma, tab, titik koma, atau spasi. CivilCraft membacanya di peramban dan langsung membuat permukaan darinya.

## Sebelum memulai

- Ketahui urutan kolom file jika memungkinkan (PNEZD dan PENZD terlihat sama bagi komputer).
- Ketahui satuannya. CivilCraft tidak mengonversi: atur **Satuan** di panel kiri agar sesuai dengan file (lihat [Satuan, stasiun, dan format angka](topic:units-and-stations)).
- Koordinat boleh berukuran besar (northing dan easting bidang state plane dalam jutaan tidak masalah).

## Impor file

1. Klik {{ui:Buka}} di bilah alat, atau tekan {{key:Mod+O}}, lalu pilih file. Anda juga dapat menyeretnya ke denah.
   Dialog **Impor titik** terbuka dengan nama file, daftar **Kolom** yang diatur ke {{ui:Deteksi}}, baris ringkasan, dan enam titik pertama.
2. Baca baris ringkasan. Baris itu menyatakan berapa titik yang dibaca, dalam urutan kolom apa, bagaimana urutan itu ditemukan, dan apa yang memisahkan kolom. Tiga cara urutan ditemukan:
   - "dari baris judul": baris pertama menamai kolomnya (Point, Northing, Easting, Elevation, Description, atau X, Y, Z …). Ini yang paling aman.
   - "sesuai pilihan": Anda memilih urutan di **Kolom**.
   - "ditebak dari jumlah kolom dan pengaturan baris titik Anda (PNEZD) — periksa bahwa northing dan easting tidak tertukar": tidak ada baris judul yang dapat dipakai. Jika file Anda biasanya dimulai dengan easting, atur **Baris titik** ke P, E, N, Z, D di [Pengaturan CivilCraft](topic:settings).
3. Periksa tabel pratinjau. Kolomnya selalu **Titik**, **Northing**, **Easting**, **Elevasi**, **Deskripsi**, apa pun urutan file. Northing dan easting pada tapak nyata biasanya berukuran jelas berbeda: jika tampak tertukar, tebakannya salah.
4. Jika urutannya salah, pilih yang benar di **Kolom** (misalnya {{ui:PENZD — titik, easting, northing, elevasi, deskripsi}}). Ringkasan dan pratinjau langsung diperbarui.
5. Lihat di bawah pratinjau untuk **Baris yang tidak dibaca**. Setiap baris menyebutkan nomor baris file, alasannya, dan awal baris. Lihat [Baris yang tidak dibaca](topic:import-points#rows-that-are-not-read).
6. Klik {{ui:Impor}}.
   Titik muncul di denah, tampilan di-zoom ke titik-titik tersebut, dan permukaan dibangun. Bilah status menyatakan, misalnya, "276 titik diimpor dari site.csv; permukaan: 546 segitiga."

Jika proyek belum memiliki nama, proyek mengambil nama file.

## Periksa grup

Setiap titik termasuk dalam grup yang dinamai menurut **kata pertama deskripsinya**, dengan huruf kapital: "GRD", "FL 12", dan "fl" adalah grup GRD, FL, dan FL. Titik tanpa deskripsi masuk ke "(tanpa deskripsi)".

1. Lihat tabel di bawah **Titik** di panel kiri: grup, jumlah titik, dan pilihan **Permukaan**.
2. Setiap grup dimulai sebagai {{ui:Titik}}. Ubah garis aliran, tepi perkerasan, puncak dan kaki lereng, punggungan, serta garis berkode serupa menjadi {{ui:Breakline}}. Atur grup yang tidak seharusnya membentuk tanah (titik kontrol, puncak pohon, tiang utilitas yang diukur di puncaknya) menjadi {{ui:Dikecualikan}}.
3. Klik titik pada denah (dengan {{ui:Pilih}}) untuk melihat nomor, koordinat, elevasi, deskripsi, dan grupnya di panel kanan.

:::warning
Grup breakline menggabungkan **semua** titiknya menjadi **satu** garis, berurutan menurut nomor titik. Ini berhasil ketika setiap garis berkode diukur berurutan dengan kodenya sendiri. Dua garis aliran terpisah yang sama-sama berkode "FL" menjadi satu garis zig-zag di antaranya. Jika kode Anda dipakai bersama, gunakan alat {{ui:Breakline}} untuk mengklik titik setiap garis (lihat [Bangun dan perhalus permukaan](topic:build-surface)).
:::

## Baris yang tidak dibaca

| Alasan yang ditampilkan | Artinya | Yang harus dilakukan |
|---|---|---|
| "northing atau easting bukan angka" | Kolom koordinat berisi teks | Periksa urutan kolom, atau baris teks yang tersesat di tengah file |
| "elevasi bukan angka" | Kolom elevasi berisi teks | Urutan kolom salah, atau deskripsi di kolom elevasi |
| "tidak ada nomor titik" | Kolom titik kosong | Beri nomor titik, atau pilih urutan tanpa P (NEZD, NEZ …): titik kemudian diberi nomor 1, 2, 3 … |
| "titik 12 muncul dua kali (yang pertama dipertahankan)" | Dua baris memakai nomor yang sama | Beri nomor ulang salah satunya di file jika keduanya adalah bidikan nyata |
| "3 kolom, diharapkan 5 (PNEZD)" | Baris kurang panjang | Baris yang terputus, atau urutan kolom yang salah |

Titik dengan elevasi kosong tetap disimpan, tetapi tidak dipakai dalam permukaan. Fakta **Titik** menunjukkan berapa titik yang memiliki elevasi.

Baris yang diawali `#`, `;`, atau `//` adalah komentar dan dilewati. Baris kosong juga dilewati.

## Ganti atau tambah titik

Mengimpor lagi **mengganti** semua titik; tidak menambahkannya. Alinyemen, pad, pipa, breakline yang digambar, dan batas Anda tetap. Riwayat urungkan dihapus, jadi simpan proyek lebih dulu jika Anda mungkin ingin titik lama kembali. Untuk menggabungkan dua file, satukan keduanya di penyunting teks atau spreadsheet sebelum mengimpor (perhatikan nomor titik yang berulang).

Titik belum dapat dipindahkan, disunting, atau dihapus di dalam CivilCraft. Perbaiki di file lalu impor ulang.

## Terkait

- [Format file titik](topic:point-file-formats): setiap urutan kolom dan cara judul dikenali.
- [Bangun dan perhalus permukaan](topic:build-surface).
