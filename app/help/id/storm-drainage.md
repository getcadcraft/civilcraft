---
title: Hitung aliran hujan badai, ukuran pipa, dan garis gradien hidraulik
summary: Gambar daerah tangkapan yang mengalir ke setiap bangunan, jumlahkan aliran di sepanjang jaringan dengan metode rasional, tentukan ukuran pipa dengan persamaan Manning, dan lihat di mana garis gradien hidraulik penuh atau mencapai permukaan.
keywords: drainase badai, daerah tangkapan, area drainase, metode rasional, koefisien limpasan, waktu konsentrasi, intensitas curah hujan, idf, manning, ukuran pipa, garis gradien hidraulik, hgl, garis gradien energi, egl, surcharge, banjir, air hilir
from: e44872ec
---

Drainase badai bekerja pada [jaringan pipa](topic:pipe-network): gambar jaringan terlebih dahulu, lalu area yang mengalir ke dalamnya. Semuanya muncul di bawah **Drainase badai** di panel kanan saat tidak ada yang dipilih.

## Gambar daerah tangkapan

1. Klik **Gambar daerah tangkapan** di bawah **Drainase badai**.
2. Klik sudut-sudut area yang mengalir ke satu bangunan. {{key:Enter}} atau klik ganda untuk selesai; {{key:Backspace}} membatalkan sudut terakhir, {{key:Esc}} menghentikan.
3. Daerah tangkapan mengalir ke bangunan yang berada di dalamnya, jika tidak ada, ke yang terdekat. **Properti**-nya terbuka: atur namanya, **Koefisien limpasan C** (bagian hujan yang mengalir, 0 sampai 1), **Waktu konsentrasi** dalam menit, dan bangunan mana yang menjadi tujuan **Mengalir ke**.

**Gambar daerah tangkapan lain** di Properti-nya memulai yang berikutnya. Klik di dalam daerah tangkapan pada denah untuk memilihnya; {{key:Delete}} menghapusnya. Setiap perubahan adalah satu langkah: {{key:Mod+Z}} mengurungkannya.

## Atur hujan rancangan

Intensitas curah hujan adalah i = a ÷ (tc + b) pangkat c, dalam inci per jam untuk proyek berbasis kaki dan milimeter per jam untuk proyek meter. Sesuaikan **Intensitas a**, **b** dan **c** dengan kurva intensitas-durasi-frekuensi Anda sendiri untuk periode ulang yang Anda rancang.

:::warning
Kurva intensitas awal, Manning n (0.013) dan kehilangan sambungan (0.5) adalah nilai sementara, bukan standar. Atur dari data curah hujan dan kriteria desain Anda sendiri.
:::

- **Waktu konsentrasi terpendek**: tidak ada pipa yang dihitung pada waktu yang lebih pendek (awalnya 10 menit).
- **Manning n**: kekasaran pipa.
- **Kehilangan sambungan**: tinggi energi yang hilang di setiap bangunan, sebagai bagian dari tinggi kecepatan V²/2g pipa yang meninggalkannya.
- **Elevasi air di outlet**: air hilir (tailwater), tempat pipa terakhir mengosongkan. Biarkan kosong jika outlet mengalir bebas.

## Cara aliran dijumlahkan

Setiap pipa membawa setiap daerah tangkapan di hulunya. Q = C × i × A, dengan C × A dijumlahkan sepanjang jaringan dan i adalah intensitas pada waktu konsentrasi terpanjang dari air yang masuk: waktu daerah tangkapan itu sendiri, atau waktu dari daerah tangkapan hulu ditambah waktu tempuh melalui pipa (panjang ÷ kecepatan saat penuh). Q dalam kaki kubik per detik (A dalam acre) atau meter kubik per detik (A dalam hektare).

## Tentukan ukuran pipa

Tabel di bawah **Aliran dan garis gradien** menampilkan, untuk setiap pipa, alirannya, kapasitas saat penuh pada kemiringannya, kecepatannya, gradien hidraulik di puncak dan kaki pipa, serta kedalaman alirannya.

**Tentukan ukuran pipa untuk aliran ini** memberi setiap pipa ukuran standar terkecil yang dapat membawa alirannya pada kemiringannya sendiri (12 sampai 72 in, atau 300 sampai 1800 mm). Ini hanya satu langkah. Invert tetap di tempatnya: jika ukuran berubah, gunakan **Atur setiap invert dari aturan** untuk menjaga tutupan, lalu periksa tabel lagi.

## Baca garis gradien

Garis gradien hidraulik (HGL) dihitung dari outlet ke arah hulu:

- Pipa yang mengalir sebagian penuh memiliki HGL pada permukaan air: invert ditambah kedalaman normal.
- Ketika air di bawahnya lebih tinggi dari mahkotanya, atau pipa membawa lebih dari yang dapat dialirkannya saat penuh, pipa mengalir penuh (surcharge) dan HGL-nya naik sebesar kemiringan gesekan sepanjang pipa.
- Di setiap bangunan, HGL adalah HGL puncak pipa yang meninggalkannya ditambah kehilangan sambungan.
- Garis gradien energi (EGL) adalah HGL ditambah tinggi kecepatan.

Pipa yang mengalir penuh didaftarkan, begitu juga bangunan mana pun yang HGL-nya berada di atas bibir: air mencapai permukaan di sana, dan bangunan itu diberi lingkaran merah di denah. Pilih pipa atau bangunan untuk melihat alirannya, kedalamannya, kecepatannya, dan kedua garis gradien di Properti-nya.

## Rutekan hujan badai

Metode rasional memberi satu puncak untuk setiap pipa. {{ui:Rutekan hujan badai}} (di bawah hasil, di Properti jaringan) menghitung seluruh badai sebagai gantinya: limpasan setiap daerah tangkapan sepanjang waktu, dialirkan ke bawah melalui pipa dengan waktu tempuh dan tampungannya, lalu dijumlahkan di tempat pertemuannya.

1. Biarkan {{ui:Hujan berlangsung}} dan {{ui:Intensitas hujan}} kosong untuk memakai waktu konsentrasi terpanjang dan kurva curah hujan di atas, atau ketik nilai Anda sendiri.
2. Tekan {{ui:Rutekan hujan badai}}. Tabel mencantumkan, untuk setiap pipa, aliran masuk dan keluar tertinggi, seberapa jauh puncak keluaran berkurang, berapa bagian dari kapasitas penuh pipa yang dipakai, dan menit saat puncaknya terjadi.
3. Setiap outlet mendapat bagan kecil aliran terhadap waktu dan {{ui:Unduh hidrograf (CSV)}}.

Setiap daerah tangkapan mengirim curah hujan yang dirata-ratakan selama waktu konsentrasinya, sehingga badai yang lebih pendek dari itu memuncak lebih rendah daripada C × i × A. Setiap pipa dirutekan dengan metode Muskingum–Cunge, menggunakan kedalaman aliran yang sudah ditemukan oleh metode rasional. Dua cabang dengan waktu konsentrasi berbeda tidak memuncak bersamaan, sehingga jumlahnya lebih rendah daripada jumlah puncaknya.

Ini tidak memodelkan surcharge, backwater, tampungan di bangunan, atau banjir. Pipa yang puncak rutenya di atas kapasitas penuhnya didaftarkan, dan airnya diteruskan seolah-olah muat. Gunakan untuk melihat waktu dan peredaman, bukan untuk menentukan ukuran pipa. Ini adalah alat bantu hitung: seorang insinyur harus memeriksanya.

## Disimpan bersama proyek

Daerah tangkapan dan pengaturan badai disimpan dalam file proyek. Keduanya belum ada di plot PDF, DWG atau DXF, maupun LandXML: lihat [Belum dibuat](topic:not-built-yet).
