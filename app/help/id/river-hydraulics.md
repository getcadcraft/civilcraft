---
title: Profil muka air sungai
summary: Modelkan sungai dari permukaan tanah dan hitung profil muka air tunak dengan metode langkah standar: tinggi muka air, energi, kecepatan, bilangan Froude, dan sebaran banjir pada denah. Fitur laboratorium; setiap hasil memerlukan tinjauan insinyur.
keywords: tanggul, area aliran tidak efektif, editor penampang, sungai, hidraulika, profil muka air, genangan balik, metode langkah, aliran tunak, 1d, penampang melintang, manning, kekasaran, konveyansi, kedalaman kritis, kedalaman normal, froude, garis gradien energi, sebaran banjir, dataran banjir, genangan, tepi sungai, panjang ruas, kontraksi, ekspansi, subkritis, superkritis, rezim campuran, loncatan hidraulik
from: fb8bf425
---

CivilCraft menghitung profil muka air satu dimensi yang tunak sepanjang sungai: untuk setiap debit yang Anda berikan, tinggi muka air di setiap penampang melintang, dari keseimbangan energi antarpenampang yang bertetangga (metode langkah standar). Fitur ini ada di laboratorium selama masih diperiksa.

**Hanya alat bantu desain.** Tinggi muka air memerlukan tinjauan insinyur yang berkualifikasi sebelum siapa pun mengandalkannya: model 1D hanya sebaik penampangnya, nilai kekasarannya, panjang ruasnya, dan batasnya, serta model ini tidak mengetahui jembatan, gorong-gorong, atau aliran yang keluar dari sungai.

## Gambar sungai

1. Bangun dulu permukaan tanah yang ada (titik, breakline, atau TIN yang Anda buka).
2. Di bawah **Permukaan** › {{ui:Lainnya}}, pilih {{ui:Sungai}}.
3. Klik sepanjang sumbu sungai **dari hulu ke hilir**, lalu tekan {{key:Enter}} atau klik dua kali.

CivilCraft memotong penampang tegak lurus sumbu setiap 50 m (200 ft), dengan 100 m (300 ft) ke tiap sisi, dari tanah. Stasiun sungai diukur dari ujung hilir, sehingga bertambah ke arah hulu. Tepi sungai mulai sebagai tebakan 10 m (30 ft) di kedua sisi dari titik terendah setiap penampang.

Untuk menambah penampang di tempat sungai menyempit atau ada bangunan, pilih sungai, klik {{ui:Tambah penampang}}, dan gambar garis potong melintang sungai (arah mana pun: garis itu diputar agar berjalan dari kiri ke kanan menghadap hilir).

## Atur sungai

Pilih sungai untuk melihatnya di **Properti**:

- **Rezim aliran**: subkritis (yang biasa: dihitung ke hulu dari batas hilir), superkritis (dihitung ke hilir dari batas hulu), atau campuran (keduanya, lalu yang memiliki gaya spesifik lebih besar di tiap penampang; berupa pratinjau).
- **Profil debit**: nama dan debit untuk masing-masing (misalnya debit 10 tahunan dan 100 tahunan), serta batas di ujung hilir (dan di ujung hulu bila rezimnya bukan subkritis): **Kedalaman normal** dengan kemiringan energi (kemiringan dasar adalah tebakan awal), elevasi **Muka air diketahui**, atau **Kedalaman kritis**.
- **Penampang dari tanah**: jaraknya, berapa jauh ke kiri dan kanan, tebakan tepi sungai, dan dua nilai n Manning; {{ui:Potong penampang lagi}} mengganti penampang (satu langkah urungkan).
- **Tabel penampang**: untuk tiap penampang, offset tepi kiri dan kanan, n saluran dan n bantaran, panjang ruas ke penampang berikutnya di hilir (bantaran kiri, saluran, bantaran kanan; diukur dari denah untuk memulai), serta koefisien kontraksi dan ekspansi (0.1 dan 0.3 untuk memulai: transisi yang landai). {{ui:Edit}} membuka editor penampang (berikutnya); titik di sampingnya berarti penampang memiliki tanggul atau area tidak efektif.

Setiap perubahan adalah satu langkah urungkan ({{key:Mod+Z}}).

## Edit penampang: tepi, tanggul, dan area tidak efektif

{{ui:Edit}} pada penampang menggambar tanahnya dan memungkinkan Anda menyeret apa yang dibaca oleh pemecah: **tepi sungai kiri dan kanan** (keduanya membagi penampang menjadi bantaran kiri, alur utama, dan bantaran kanan), **tanggul** di salah satu sisi, dan **area aliran tidak efektif**. Setiap pegangan juga dapat digeser dengan tombol panah, dan setiap angka dapat diketik di samping plot. {{ui:Terapkan}} adalah satu langkah urungkan.

- **Tanggul** memiliki posisi (offset) dan elevasi mahkota. Tanah di luar tanggul, menjauh dari sungai, terpisah dari sungai selama muka air berada di bawah mahkota: luas, keliling basah, dan konveyansinya tidak dihitung. Di atas mahkota, seluruh penampang dihitung kembali. Tanggul berdiri di luar tepi sungai yang dilindunginya; yang berada di dalam tepi ditandai.
- **Area aliran tidak efektif** menampung air tetapi tidak mengalirkan aliran (kantong di belakang timbunan, air mati di samping pendekatan jembatan). Beri dua offsetnya dan, jika mau, tinggi air yang di bawahnya area itu tidak efektif ({{ui:selalu}} bila kosong): di atas tinggi itu, area mengalir seperti yang lain. Area yang menutupi sebagian alur utama ditandai.
- Di antara dua penampang, sebaran banjir membiarkan kering tanah di belakang tanggul yang dimiliki kedua penampang, selama muka air di situ berada di bawah mahkota (garis di antara kedua mahkota lurus).

## Hitung dan baca hasil

Klik {{ui:Profil muka air}}. Untuk profil yang Anda pilih, Anda mendapatkan:

- **plot** sepanjang sungai (aliran dari kiri ke kanan): dasar saluran, tepi, muka air, garis gradien energi, dan muka air kritis; penampang yang ditahan pada kedalaman kritis diberi lingkaran;
- **tabel** per penampang: stasiun sungai, debit, dasar saluran, muka air, muka air kritis, garis gradien energi, kedalaman, kecepatan di saluran dan secara keseluruhan, bilangan Froude saluran, luas aliran, lebar puncak, debit di tiap bantaran dan di saluran, kemiringan energi, dan peringatan;
- **peringatan** dalam kata-kata biasa, misalnya penampang yang diatur pada kedalaman kritis, air di atas ujung penampang, atau perubahan konveyansi yang besar antara dua penampang (tambahkan penampang di antaranya).

{{ui:Tabel (CSV)}}, {{ui:Laporan}} (teks biasa dengan metode, batas, dan setiap tabel), dan {{ui:Plot (SVG)}} disimpan ke unduhan Anda. Masing-masing memuat baris tinjauan.

Centang {{ui:Tampilkan sebaran banjir}} di **Properti** untuk memberi warna area basah pada denah untuk profil yang dipilih, dengan garis muka air digambar di tempat kedalamannya nol. Di antara penampang, muka air datar melintang sungai dan berubah secara linear terhadap stasiun sungai. Tanah di belakang tanggul dibiarkan kering selama air berada di bawah mahkotanya. Tanah rendah lain di dalam koridor sungai yang tidak dapat dijangkau air (misalnya di belakang timbunan jalan) tetap diberi warna: periksa itu.

## Di gambar dan di Masalah

Garis sungai masuk ke denah, PDF, dan DWG pada layer tersendiri: **C-WATR-CNTR** (sumbu), **C-WATR-SCTN** (setiap garis potong, dengan stasiun sungainya), dan **C-WATR-FLOD** (garis muka air sebaran banjir, bila {{ui:Tampilkan sebaran banjir}} dicentang untuk suatu profil). Peringatan sungai (penampang yang diatur pada kedalaman kritis, air di atas ujung penampang, perubahan konveyansi yang memerlukan lebih banyak penampang, keseimbangan energi yang tidak tertutup, tanggul di dalam tepi) juga masuk ke panel **Masalah**, tentang sungai dan ditempatkan di penampang asalnya.

## Cara dihitung

- Energi antara dua penampang: WS₂ + α₂V₂²/2g = WS₁ + α₁V₁²/2g + L·Sf + C·|α₂V₂²/2g − α₁V₁²/2g|.
- Konveyansi dengan pembagian: setiap bantaran dibagi di tempat n-nya berubah, K = Σ (1/n)·A·R^(2/3) (1.486/n dalam satuan AS); saluran adalah satu bagian, dengan n komposit bila n-nya berubah. α berasal dari cara konveyansi dibagi.
- Kemiringan gesek dengan konveyansi rata-rata, Sf = ((Q₁ + Q₂)/(K₁ + K₂))², di atas panjang ruas tertimbang aliran.
- Koefisien kontraksi bila aliran mempercepat ke hilir, ekspansi bila melambat.
- Kedalaman kritis = energi spesifik terkecil. Setiap tinggi muka air dihitung pada interval yang mengurung jawabannya, sehingga tidak pernah melompat ke sisi kritis yang salah; bila tidak ada jawaban, diatur pada kedalaman kritis dan ditandai.

Program ini diperiksa terhadap kedalaman normal Manning, kedalaman kritis pada saluran persegi panjang, dan contoh backwater Chow (*Open-Channel Hydraulics*, 1959, bab 10) yang diintegrasikan secara mandiri. Metode yang sama dipakai oleh program sungai 1D yang umum, sehingga hitungan manual atau catatan mahasiswa dapat dibawa ke sini.

## Gorong-gorong dan jembatan

Di **Properti** sungai, di bawah **Gorong-gorong dan jembatan**, {{ui:Tambah gorong-gorong}} atau {{ui:Tambah jembatan}} menempatkan satu di antara dua penampang (setiap bentang tetap memiliki paling sedikit dua penampang). Profil di bawahnya tidak berubah; muka air tepat di atasnya berasal dari bangunan, dan profil berlanjut ke hulu dari situ. **Hasil** menambahkan tabel untuk setiap bangunan: air hilir, tinggi air hulu, kontrol mana yang menentukan, debit melalui bukaan, dan debit di atas jalan atau dek. Hanya untuk aliran subkritis.

- **Gorong-gorong** (kotak atau bulat, satu atau lebih lubang yang sama). Kontrol masukan berupa aliran ambang selama masukan bebas dan aliran orifis setelah tenggelam, dicampur antara tinggi air hulu sebesar satu dan satu setengah kali tinggi. Kontrol keluaran adalah keseimbangan energi: kehilangan masukan, gesekan, dan tinggi kecepatan keluar, di atas yang lebih tinggi antara air hilir dan titik tengah kedalaman kritis serta mahkota, dikurangi penurunan sepanjang lubang. Tinggi air hulu adalah yang lebih besar dari keduanya. Centang **Air dapat melimpas di jalan**, maka aliran ambang jalan membagi debit dengan lubang.
- **Jembatan.** Bukaannya adalah penampang di bawah jembatan, dipotong pada abutmen, dengan setiap pilar sebagai area yang tidak mengalirkan aliran. Muka air di bukaan berasal dari penampang di bawahnya (koefisien ekspansi), dan penampang di atasnya dari bukaan (koefisien kontraksi). Bila bukaan tidak dapat melewatkan debit pada air hilir itu, aliran berjalan pada kedalaman kritis dan jembatan ditandai sebagai tersumbat. Bila air mencapai balok bawah, alirannya adalah aliran tekan (tipe pintu sorong selama air hilir berada di bawah balok bawah, tenggelam di atasnya), dan air di atas dek menambah aliran ambang; tinggi hulu adalah tinggi saat semuanya berjumlah sama dengan debit.

Koefisien (debit, kehilangan masukan, ambang) adalah nilai awal bulat yang diketik. Ubahlah untuk desain Anda. Itu bukan grafik terpasang seperti yang dicetak buku panduan desain gorong-gorong, jadi perlakukan tinggi air hulu gorong-gorong yang mendekati batasnya sebagai perkiraan. Air di atas jalan atau dek, masukan yang tenggelam, bukaan yang tersumbat, dan aliran cepat di dalam lubang ditampilkan di **Masalah**.

## Aliran tak permanen

{{ui:Aliran tak permanen…}} di **Properti** sungai mengalirkan hidrograf banjir melalui penampang. Ketik masukan sebagai jam dan debit, satu pasang per baris, kemiringan hilir (kedalaman normal), dan berapa lama dijalankan. Perhitungan dimulai dari muka air tunak pada debit pertama dan menyelesaikan persamaan satu dimensi penuh (skema empat titik implisit, berbobot 0.6 dalam waktu). Anda mendapatkan tinggi dan debit puncak di setiap penampang beserta jam terjadinya, plot debit di kedua ujung, dan pemeriksaan volume (masuk, keluar, dan perubahan yang tersimpan). Hasilnya diperiksa dengan aliran tunak yang tetap tunak, langkah pada masukan yang berakhir di profil tunak debit baru, volume yang tertutup, dan kecepatan gelombang banjir terhadap gelombang kinematik. Hanya aliran subkritis, satu ruas, tanpa masukan samping, dan tanpa gorong-gorong atau jembatan di dalam perhitungan.

## Pertemuan

Ruas yang menggabungkan aliran ke satu keluaran: debitnya dijumlahkan, dan muka air di hulu ruas hilir dibawa naik ke ujung ruas-ruas yang bergabung dengannya (muka air yang sama di pertemuan, metode sederhana: tanpa sudut, tanpa momentum, sehingga cocok untuk bilangan Froude rendah). Model dan pengujiannya sudah ada (`river-structures.js`); panel untuk menggabungkan dua sungai pada denah belum dibuat.

## Belum dibuat

Ambang dan pintu sebagai bangunan tersendiri, panel untuk pertemuan, bangunan di dalam perhitungan tak permanen, dan aliran tak permanen superkritis. Perhitungan rezim campuran menandai loncatan hidraulik di antara dua penampang tetapi tidak menempatkannya.

**Tempat sungai bertemu.** Di Properti sungai, "Mengalir ke" menyebutkan sungai yang dialirinya. Sungai-sungai yang bergabung dihitung bersamaan: sungai tujuan membawa jumlah debit mereka, dan masing-masing berakhir pada muka air di penampang pertama sungai tujuan (metode muka air sama; tidak memperhitungkan sudut dan momentum aliran). Untuk menggabungkan sungai utama dan anak sungai, gambar sungai pendek di bawah pertemuan dan biarkan keduanya mengalir ke sana. Hasil menampilkan tabel pertemuan. Nilai awal dalam hasil ini (kontraksi 0.1, ekspansi 0.3, saluran satu bagian dengan kekasaran komposit, rezim campuran menurut gaya spesifik) tetap berlaku sampai insinyur meninjaunya, dan Hasil menyatakannya.
