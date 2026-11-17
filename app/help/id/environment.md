---
title: Naungan, hasil surya, dan kenyamanan luar ruang
summary: Pelajari naungan yang dijatuhkan massa bangunan Anda sepanjang hari atau musim, lihat animasinya, hitung berapa listrik yang dihasilkan panel surya di atap dan dinding dalam tahun tipikal, lihat seberapa nyaman jalan di samping bangunan (UTCI), dan dapatkan pembacaan saring kenyamanan angin pejalan kaki.
keywords: studi naungan, bayangan, jam matahari, animasi, surya, PV, fotovoltaik, panel, hasil, kWh, EPW, file cuaca, UTCI, kenyamanan termal, kenyamanan luar ruang, stres panas, angin
from: 96e7af4d
---

Bagian **Lingkungan** berada di bawah **Jam matahari** di **Properti** sebuah massa. Bagian ini memakai massa yang Anda gambar sebagai bangunan.

## Muat file cuaca

Pilih file cuaca tahun tipikal (**.epw**) untuk kota Anda. File ini gratis dari situs cuaca EnergyPlus dan dari climate.onebuilding.org. File tetap berada di browser Anda untuk kunjungan ini. Hasil surya dan studi kenyamanan memerlukannya; studi naungan berjalan tanpa itu jika proyek memiliki sistem koordinat.

## Studi naungan

Pilih tanggal (atau centang **Musim** dan tanggal akhir serta langkah dalam hari) dan zona waktu, lalu **Jalankan studi naungan**. Anda mendapat peta jam sinar matahari, atau naungan, di tanah sekitar massa; tabel berapa bagian tanah yang ternaungi sepanjang hari; dan animasi hari itu yang dapat Anda putar atau langkahi. **Simpan peta**, **Simpan bingkai animasi** (semua bingkai dalam satu gambar), dan **Simpan jam** (CSV) menyimpan hasilnya.

Tanah dianggap datar pada level massa terendah. Untuk naungan di tanah miring, gunakan **Jam matahari**, yang membaca medan.

## Hasil surya

Atur efisiensi panel, seberapa besar setiap atap dan dinding tertutup, dan kerugian sistem, lalu **Jalankan hasil surya**. Untuk setiap atap dan dinding Anda mendapat listrik yang dihasilkan satu meter persegi panel dalam tahun tipikal, berapa banyak yang diambil massa tetangga darinya, dan total untuk setiap massa. Model dijelaskan dengan kata-kata biasa di samping tombol: ini adalah perkiraan perencanaan dari tahun tipikal, bukan jaminan.

## Kenyamanan luar ruang

**Jalankan kenyamanan** menghitung Universal Thermal Climate Index (UTCI) untuk orang yang berdiri di tanah terbuka dan di samping massa pertama (sisi selatan, utara, timur, dan barat), dengan naungan setiap massa. Hasilnya menunjukkan berapa banyak langit yang terlihat, rata-rata UTCI siang hari, dan jam di atas 32 (stres panas) serta di bawah 0 (stres dingin).

## Angin (saring)

**Jalankan studi angin** menyelesaikan aliran udara di sekitar massa Anda sekali untuk setiap arah angin yang bertiup dalam file cuaca Anda (4, 8, 12, atau 16 arah), di atas lingkungan yang Anda pilih (daerah terbuka, pinggiran kota, atau pusat kota), lalu menjumlahkan angin per jam sepanjang tahun. Peta mewarnai tanah menurut kelas kenyamanan, dari hijau (**duduk**) melalui **berdiri**, **berjalan santai**, dan **berjalan** hingga merah (**tidak nyaman**): aktivitas yang batas kecepatannya (4, 6, 8, dan 10 m/s) terlampaui tidak lebih dari 5 % jam. Tabel kedua memberi tingkat NEN 8100 (A sampai E) dari persentase jam ketika angin melewati 5 m/s. Faktor hembusan mengalikan rata-rata per jam untuk memberi hembusan efektif.

Cara kerjanya, dengan kata-kata biasa: solver aliran large-eddy Lattice-Boltzmann (buatan kami sendiri, di pustaka `lib/wind`) dalam kotak di sekitar bangunan, profil kecepatan angin yang naik seiring ketinggian pada kekasaran yang dipilih, dan kecepatan sekitar 1.5 m di atas tanah dibandingkan dengan kecepatan hulu pada 10 m. **Saring** cepat dan kasar; **Standar** memakai lebih banyak sel dan berjalan jauh lebih lama. Jika panel menyatakan grid kasar (di bawah 10 sel di atas bangunan tertinggi), atau aliran masih berubah, percayai peta lebih sedikit.

**Apa yang bukan ini.** Solver telah diperiksa pada aliran buku teks (saluran, rongga yang digerakkan tutup) dan dijalankan pada kubus untuk melihat bahwa jejak dan percepatan di sudut tampak benar. Ia **belum** divalidasi terhadap pengukuran terowongan angin pada bangunan, sehingga setiap hasil diberi label belum divalidasi. Jangan gunakan untuk nilai desain, beban angin, atau sertifikat perencanaan: seorang ahli angin harus menjalankan dan memastikan studi yang layak. Tanah datar, dinding bangunan yang halus, jalan pintas kekasaran stasiun cuaca, dan tabel ambang adalah penyederhanaan; ambang dapat berbeda dari kriteria yang digunakan otoritas Anda.

## Angin dengan OpenFOAM (add-on)

Mesin angin bawaan di atas bersifat eksperimental. Untuk solver aliran yang layak, aktifkan add-on **Angin pejalan kaki (OpenFOAM)** di **Pengaturan > Add-on** (ia mati sampai Anda mengaktifkannya). Ini adalah perangkat lunak GPL tersendiri, dipisahkan dari bagian CadCraft lainnya, dan tidak menyertakan OpenFOAM: Anda memasangnya sendiri. Kemudian **Mesin** di blok angin akan mencantumkan OpenFOAM.

Yang Anda siapkan, sekali saja:
1. **Pasang OpenFOAM** (ESI v-series dari openfoam.com; add-on diuji dengan v2512). Pada Ubuntu atau Debian (juga di dalam WSL pada Windows): `curl https://dl.openfoam.com/add-debian-repo.sh | sudo bash`, lalu `sudo apt install openfoam2512-default`. Ia terpasang di `/usr/lib/openfoam/openfoam2512`. CadCraft memerlukan `blockMesh`, `snappyHexMesh`, dan `simpleFoam` untuk berjalan. (Paket `openfoam` 1912 yang lebih lama di arsip Ubuntu sendiri juga berfungsi, tetapi function object-nya crash; add-on kemudian membaca file hasil sendiri.)
2. **Jalankan pembantu** dari folder `runner` add-on dengan Node.js: `node cc-openfoam-runner.mjs serve`. Jika OpenFOAM tidak ada di jalur pencarian, beri `runner.json` kecil dengan path ke `etc/bashrc` OpenFOAM (`{ "bashrc": "/usr/lib/openfoam/openfoam2512/etc/bashrc" }`) dan jalankan dengan `--config runner.json`. Pembantu hanya mendengarkan di komputer ini dan mencetak token.
3. **Tempel token** ke kolom add-on di blok angin (alamatnya tetap `http://127.0.0.1:8765`) dan tekan **Periksa pembantu**.

Lalu **Jalankan studi angin** bekerja satu kasus per arah angin dalam file cuaca: massa Anda menjadi permukaan (STL) dalam kotak yang berukuran menurut panduan biasa (5 tinggi bangunan ke samping dan ke atas, 10 di belakang), dimeshing dengan blockMesh dan snappyHexMesh, dijalankan sebagai RANS k-epsilon tunak dengan inlet lapisan batas atmosfer pada kekasaran yang Anda pilih, dan kecepatan pada 1.5 m dibaca kembali lalu diubah menjadi kelas Lawson dan NEN 8100 yang sama. Tidak ada yang keluar dari komputer Anda.

**Apa yang sudah diperiksa.** Teks di atas hasil mengatakannya dengan jelas dan menjadi bagian dari setiap CSV yang disimpan. Penulisan kasus add-on, pembacaan hasil, dan seluruh pipeline diuji tanpa OpenFOAM, dan satu kubus telah dijalankan melalui OpenFOAM sungguhan pada tiga ukuran mesh (angkanya ada di catatan proyek). Ia **belum** divalidasi terhadap pengukuran terowongan angin pada bangunan. Ini adalah pembacaan saring, bukan nilai desain dan bukan sertifikat. k-epsilon standar melebih-lebihkan turbulensi di depan bangunan, tanahnya datar, dindingnya halus, dan tidak ada medan atau vegetasi.
