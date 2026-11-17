---
title: Teduhan, hasil solar dan keselesaan luar
summary: Kaji teduhan yang dicampakkan oleh jisim bangunan anda sepanjang hari atau musim, lihat animasinya, kira berapa elektrik yang akan dihasilkan oleh panel solar pada bumbung dan dinding dalam tahun tipikal, lihat keselesaan jalan di sebelah bangunan (UTCI), dan dapatkan bacaan saringan keselesaan angin pejalan kaki.
keywords: kajian teduhan, bayang, jam matahari, animasi, solar, PV, photovoltaic, panel, hasil, kWh, EPW, fail cuaca, UTCI, keselesaan terma, keselesaan luar, tekanan haba, angin
from: 96e7af4d
---

Bahagian **Persekitaran** terletak di bawah **Jam matahari** dalam **Sifat** jisim. Ia menggunakan jisim yang telah anda lukis sebagai bangunan.

## Muat masuk fail cuaca

Pilih fail cuaca tahun tipikal (**.epw**) untuk bandar anda. Fail ini percuma daripada laman cuaca EnergyPlus dan daripada climate.onebuilding.org. Fail kekal dalam pelayar anda untuk lawatan ini. Hasil solar dan kajian keselesaan memerlukannya; kajian teduhan berfungsi tanpanya apabila projek mempunyai sistem koordinat.

## Kajian teduhan

Pilih tarikh (atau tandakan **Musim** dan tarikh akhir serta langkah dalam hari) dan zon waktu, kemudian **Jalankan kajian teduhan**. Anda mendapat peta jam matahari, atau teduhan, di atas tanah sekitar jisim; jadual berapa banyak tanah yang diteduhkan sepanjang hari; dan animasi hari yang boleh anda main atau langkah demi langkah. **Simpan peta**, **Simpan bingkai animasi** (semua bingkai dalam satu gambar) dan **Simpan jam** (CSV) menyimpan hasil.

Tanah dianggap rata pada aras jisim terendah. Untuk teduhan di tanah cerun, gunakan **Jam matahari**, yang membaca rupa bumi.

## Hasil solar

Tetapkan kecekapan panel, berapa banyak setiap bumbung dan dinding dilitupi dan kehilangan sistem, kemudian **Jalankan hasil solar**. Bagi setiap bumbung dan dinding, anda mendapat elektrik yang akan dihasilkan oleh satu meter persegi panel dalam tahun tipikal, berapa banyak yang diambil oleh jisim bersebelahan, dan jumlah bagi setiap jisim. Model itu ditulis dalam kata-kata biasa di sebelah butang: ia ialah anggaran perancangan daripada tahun tipikal, bukan jaminan.

## Keselesaan luar

**Jalankan keselesaan** mengira Indeks Iklim Terma Universal (UTCI) bagi orang yang berdiri di atas tanah terbuka dan di sebelah jisim pertama (bahagian selatan, utara, timur dan barat), dengan teduhan setiap jisim. Ia memaparkan berapa banyak langit yang dilihat, purata UTCI siang hari, dan jam di atas 32 (tekanan haba) dan di bawah 0 (tekanan sejuk).

## Angin (saringan)

**Jalankan kajian angin** menyelesaikan aliran udara di sekeliling jisim anda sekali untuk setiap arah angin yang bertiup dalam fail cuaca anda (4, 8, 12 atau 16 arah), ke atas persekitaran yang anda pilih (kawasan terbuka, pinggir bandar atau pusat bandar), dan kemudian menjumlahkan angin setiap jam sepanjang tahun. Peta mewarnakan tanah mengikut kelas keselesaan, dari hijau (**duduk**) melalui **berdiri**, **berjalan santai** dan **berjalan kaki** kepada merah (**tidak selesa**): aktiviti yang had kelajuannya (4, 6, 8 dan 10 m/s) dilampaui untuk tidak lebih daripada 5 % jam. Jadual kedua memberi gred NEN 8100 (A hingga E) daripada bahagian jam apabila angin melepasi 5 m/s. Faktor hembusan mendarab min setiap jam untuk memberi hembusan berkesan.

Cara ia berfungsi, dalam kata-kata biasa: penyelesai aliran eddy besar lattice-Boltzmann (buatan kami sendiri, dalam pustaka `lib/wind`) dalam kotak di sekeliling bangunan, profil kelajuan angin yang meningkat dengan ketinggian mengikut kekasaran yang dipilih, dan kelajuan kira-kira 1.5 m di atas tanah berbanding kelajuan di hulu pada 10 m. **Saringan** cepat dan kasar; **Piawai** menggunakan lebih banyak sel dan berjalan jauh lebih lama. Jika panel menyatakan grid itu kasar (kurang 10 sel ke atas bangunan tertinggi), atau aliran masih berubah, percayai peta itu kurang.

**Apa yang ini bukan.** Penyelesai telah diperiksa pada aliran buku teks (saluran, rongga yang dipacu penutup) dan dijalankan pada kiub untuk melihat bahawa jejak dan peningkatan kelajuan di bucu kelihatan betul. Ia **belum** disahkan dengan ukuran terowong angin bagi bangunan, jadi setiap hasil dilabelkan sebagai tidak disahkan. Jangan gunakannya untuk nilai reka bentuk, beban angin atau sijil perancangan: seorang jurutera angin mesti menjalankan dan mengesahkan kajian yang betul. Tanah rata, dinding bangunan yang licin, jalan pintas kekasaran stesen cuaca dan jadual ambang ialah penyederhanaan; ambang boleh berbeza dengan kriteria yang digunakan oleh pihak berkuasa anda.

## Angin dengan OpenFOAM (add-on)

Enjin angin terbina dalam di atas adalah eksperimen. Untuk penyelesai aliran yang betul, hidupkan add-on **Angin pejalan kaki (OpenFOAM)** dalam **Tetapan > Add-on** (ia mati sehingga anda berbuat demikian). Ia ialah perisian berlesen GPL yang tersendiri, dipisahkan daripada CadCraft yang lain, dan ia tidak menyertakan OpenFOAM: anda memasangnya sendiri. Kemudian **Enjin** dalam blok angin menyenaraikan OpenFOAM.

Apa yang anda sediakan, sekali sahaja:
1. **Pasang OpenFOAM** (siri-v ESI daripada openfoam.com; add-on diuji dengan v2512). Pada Ubuntu atau Debian (juga dalam WSL pada Windows): `curl https://dl.openfoam.com/add-debian-repo.sh | sudo bash`, kemudian `sudo apt install openfoam2512-default`. Ia dipasang di bawah `/usr/lib/openfoam/openfoam2512`. CadCraft memerlukan `blockMesh`, `snappyHexMesh` dan `simpleFoam` untuk berjalan. (Pakej `openfoam` 1912 yang lebih lama dalam arkib Ubuntu sendiri juga berfungsi, tetapi objek fungsinya ranap; add-on kemudian membaca fail hasil sendiri.)
2. **Mulakan penolong** dari folder `runner` add-on dengan Node.js: `node cc-openfoam-runner.mjs serve`. Jika OpenFOAM tidak berada pada laluan carian, berikan `runner.json` kecil dengan laluan ke `etc/bashrc` OpenFOAM (`{ "bashrc": "/usr/lib/openfoam/openfoam2512/etc/bashrc" }`) dan mulakannya dengan `--config runner.json`. Penolong mendengar pada komputer ini sahaja dan mencetak token.
3. **Tampal token** ke dalam medan add-on dalam blok angin (alamat kekal `http://127.0.0.1:8765`) dan tekan **Semak penolong**.

Kemudian **Jalankan kajian angin** berfungsi satu kes untuk setiap arah angin dalam fail cuaca: jisim anda menjadi permukaan (STL) dalam kotak yang bersaiz mengikut garis panduan biasa (5 ketinggian bangunan ke sekeliling dan ke atas, 10 di belakang), dijadikan jejaring dengan blockMesh dan snappyHexMesh, dijalankan sebagai RANS k-epsilon mantap dengan input lapisan sempadan atmosfera ke atas kekasaran yang anda pilih, dan kelajuan pada 1.5 m dibaca semula dan ditukar kepada kelas Lawson dan NEN 8100 yang sama. Tiada apa yang meninggalkan komputer anda.

**Apa yang telah diperiksa.** Teks di atas hasil menyatakannya dengan jelas dan menjadi sebahagian daripada setiap CSV yang disimpan. Penulisan kes add-on, pembacaan hasil dan keseluruhan aliran kerja diuji tanpa OpenFOAM, dan satu kiub tunggal telah dijalankan melalui OpenFOAM sebenar pada tiga saiz jejaring (angkanya ada dalam nota projek). Ia **belum** disahkan dengan ukuran terowong angin bagi bangunan. Ia ialah bacaan saringan, bukan nilai reka bentuk dan bukan sijil. k-epsilon piawai terlebih ramal pergolakan di hadapan bangunan, tanah rata, dinding licin dan tiada rupa bumi atau tumbuhan.
