---
title: Yang baru di 0.9
summary: Templat koridor dan templat medan, snap dan tombol Pilih saat menggambar, analisis GIS dengan tabel atribut, studi bayangan, hasil surya, kenyamanan dan angin untuk sebuah tapak, tampilan Render 3D, serta add-on Point clouds dan WaterCraft.
keywords: yang baru, 0.9, catatan rilis, templat koridor, templat medan, editor templat, potongan tipikal, beberapa koridor, snap, snaps, pilih, pindahkan, salin, putar, tangen, render, render 3d, analisis gis, buffer, overlay, spatial join, tabel atribut, gaya menurut atribut, studi bayangan, hasil surya, utci, kenyamanan luar ruang, studi angin, openfoam, point clouds, las, laz, watercraft, aliran kebakaran, hidran, umur air, klorin, kebutuhan, tooltip, tata letak, yang baru, changelog, perubahan, 0.8, 0.8.1, versi, fitur baru, hujan, drainase, genangan, limpasan, galian dan timbunan, angkutan, rute terbaik, biaya terendah, alinyemen, kolam detensi, outlet, penurunan muka air, jagaan, progres, survei, drone, timbunan material, alamat ke tapak, persil, tanah, banjir, stabilitas lereng, bishop, penurunan, junction, marka, rambu, jarak pandang, perataan, kuadrat terkecil, poligon, tambang terbuka, model blok, tautan radio, fresnel, wesel, crossover, bahasa, masalah, live, dwg
from: d7ac5b14
---

Ini yang berubah di CivilCraft 0.9, dibandingkan dengan 0.8.1. CivilCraft 0.9 adalah bagian dari CadCraft Studio 0.9 dan delapan aplikasinya. Bagian utamanya adalah templat koridor dan medan, snap saat menggambar, analisis GIS, studi bayangan, hasil surya, kenyamanan dan angin pada tapak, serta dua add-on: Point clouds dan WaterCraft.

## Baru

### Templat koridor dan medan

- **Templat koridor.** Buka {{ui:Permukaan}} › {{ui:Lainnya}} › {{ui:Templat koridor…}} (atau ketik {{cmd:TEMPLATES}}). Templat adalah potongan melintang kecil dengan komponen, offset, kemiringan, material, dan kode titik. Simpan di proyek, di {{ui:Pustaka saya}}, atau sebagai berkas `.cctemplates.json`. Editor templat menampilkan gambar dengan skala sebenarnya dan mendaftar masalah saat Anda mengetik.
- **Bangun dari templat berdasarkan stasiun.** Pilih alinyemen dan aktifkan {{ui:Bangun dari templat berdasarkan stasiun}} di Propertinya. Setiap sisi dari setiap wilayah memiliki daftar perkerasannya sendiri dan kondisi ujungnya sendiri. {{ui:Tambah koridor}} di bawah {{ui:Koridor pada alinyemen ini}} menempatkan beberapa koridor pada satu alinyemen.
- **Templat medan.** {{ui:Permukaan}} › {{ui:Lainnya}} › {{ui:Templat medan…}} (atau ketik {{cmd:TERRAINTEMPLATES}}) menutupi medan dengan material berlapis seperti tanah pucuk atau perkerasan dan dasar, dengan luas dan volume per lapisan. Lihat [Templat koridor dan templat medan](topic:corridor-templates).

### Drafting

- **Snap.** Alat Alinyemen, Pad, Persil, Massa, Garis fitur, Ukur, Batas, dan Tangkapan menempel pada titik survei, PI, sudut, verteks, dan struktur, dengan label di samping penanda. Tahan {{key:Alt}} untuk titik bebas.
- **Tombol Pilih, tangen, dan pindahkan, salin, putar.** Sudut pad, persil, dan garis fitur memiliki kotak Easting dan Northing yang diketik serta tombol Pilih dengan bidik silang. Properti juga memiliki {{ui:Tangen dari dua titik}} untuk alinyemen dan {{ui:Pindahkan, salin dan putar}} untuk alinyemen, pad, persil, dan garis fitur. Lihat [Menggambar dengan snap, sudut yang dipilih, dan pindahkan, salin, putar](topic:draft-with-snaps).
- **Tampilan render di 3D.** Tombol {{ui:Render}} pada bilah 3D menggambar lahan dengan warna alami, langit, kabut, dan bayangan lembut. Ini tidak mengubah model. Menu {{ui:Matahari}} kini memiliki tombol {{ui:Terapkan}} dan {{ui:Tutup}}. Lihat [Lihat tapak dalam 3D](topic:site-3d).
- **Panel membuka satu bagian per waktu.** Panel kiri dan panel Properti membuka satu bagian dan menutup yang lain, dan ubin pita Lanskap yang memuat beberapa alat berupa tombol terbagi.

### Analisis GIS

- **Analisis.** {{ui:Permukaan}} › {{ui:Lainnya}} › {{ui:Analisis}} menawarkan buffer, overlay, spatial join, pilih menurut atribut atau bentuk, dan ukur. Setiap alat membuat lapisan baru dalam satu langkah urungkan.
- **Tabel atribut.** Menu tiga titik pada lapisan memiliki {{ui:Tabel atribut…}} dan {{ui:Gaya menurut atribut…}}. Lihat [Analisis lapisan GIS](topic:gis-analysis) dan [Bekerja dengan tabel atribut lapisan](topic:gis-table).

### Tapak: matahari, hasil surya, kenyamanan, dan angin

- **Bagian lingkungan.** Pilih massa: bagian {{ui:Lingkungan}} berada di bawah {{ui:Jam penyinaran matahari}} di Propertinya. Bagian ini memiliki studi bayangan (peta, tabel, animasi, CSV), hasil surya dari berkas cuaca tahun tipikal (.epw), dan kenyamanan luar ruang (UTCI).
- **Angin, hanya untuk penyaringan.** {{ui:Jalankan studi angin}} mewarnai tanah dari duduk nyaman sampai tidak nyaman untuk setiap arah angin dalam berkas cuaca. Hasilnya belum divalidasi dan panel menyatakannya.
- **Add-on angin pejalan kaki (OpenFOAM).** Nonaktif sampai Anda mengaktifkannya di {{ui:Pengaturan}} › {{ui:Add-on}}. OpenFOAM adalah perangkat lunak yang Anda pasang sendiri. Lihat [Bayangan, hasil surya, dan kenyamanan luar ruang](topic:environment).

### Point clouds (add-on)

- Aktifkan {{ui:Point clouds}} di {{ui:Pengaturan}} › {{ui:Add-on}}; tab Point clouds muncul di panel kanan. Buka berkas LAS atau LAZ, bersihkan, pisahkan menjadi tanah, vegetasi, dan bangunan, lalu bangun tanah, kontur, dan volume, serta ekspor LAS atau LAZ. Lihat [Point clouds dari drone atau pemindai](topic:point-clouds).

### WaterCraft (add-on)

- Aktifkan {{ui:WaterCraft (distribusi air)}} di {{ui:Pengaturan}} › {{ui:Add-on}}; tab WaterCraft muncul. Tab ini memiliki kebutuhan dari pelanggan, aliran kebakaran di setiap hidran, gangguan pipa induk mana yang paling berpengaruh, serta umur air dan klorin, yang masing-masing disimpan sebagai CSV. Lihat [WaterCraft: kebutuhan, aliran kebakaran, gangguan dan umur air](topic:watercraft).

### Bekerja bersama

- Dalam sesi Live Anda melihat kursor dan nama satu sama lain di denah. Pustaka tanaman: CivilCraft Lanskap dimulai dari koleksi Pustaka bawaannya, {{ui:CivilCraft landscape}}.

## Di setiap aplikasi

- Petunjuk tampil sebagai tooltip Bootstrap, dan tip awal dapat ditutup.
- Deretan tab panel yang tidak muat akan digulir alih-alih terpotong.
- Judul tab peramban berbunyi `<document> - CivilCraft | CadCraft`.
- {{ui:Pengaturan}} memiliki bagian Tata letak, di mana tata letak berupa daftar tarik-turun dengan pilihan dua baris.
- Satuan berat dan suhu berada di {{ui:Pengaturan}} › {{ui:Global}} › {{ui:Satuan}}.
- Daftar bahasa menampilkan bahasa yang memiliki berkas dalam build. Bahasa selain Inggris adalah draf mesin.

## Diperbaiki

- Add-on pencarian alamat dan pemeriksaan EnergyPlus tidak dapat diaktifkan; kini bisa.
- Bantuan kini menyatakan bahwa add-on Point clouds menulis awan yang sudah dibersihkan sebagai LAS 1.4 atau LAZ.
- Mengklik grip milik objek yang dipilih tidak lagi memulai seret grip yang menghentikan Pilih yang sedang menunggu.

## Batasan yang jujur

- Contoh templat koridor adalah placeholder yang tidak berasal dari standar apa pun; seorang insinyur harus memeriksanya. Templat medan tidak menambah permukaan dan tidak digambar dalam 3D atau tampilan potongan. Koridor kedua pada alinyemen tidak ada dalam ekspor IFC. Tidak ada transisi antara dua templat menurut stasiun.
- Point clouds diuji dengan berkas rekaan, bukan survei drone nyata. Hanya LAS dan LAZ yang dibaca.
- Analisis GIS diuji dengan lapisan rekaan.
- Bayangan, surya, dan kenyamanan adalah estimasi perencanaan; angin adalah penyaringan yang belum divalidasi. Tidak ada yang merupakan nilai desain.
- WaterCraft adalah alat bantu hitung yang diperiksa pada jaringan rekaan. Seorang ahli air menentukan nilai angka-angka tersebut.
- Bahasa selain Inggris adalah draf mesin sampai penutur asli membacanya.
- Pemasang Windows belum ditandatangani kodenya, dan image disk macOS belum dinotarisasi.

## Sebelumnya: 0.8 dan 0.8.1

Ini yang berubah di CivilCraft 0.8 (2026-11-01) dan 0.8.1 (2026-11-02), dibandingkan dengan 0.7. Bagian baru utamanya adalah alat untuk menguji grading dan tapak (hujan, galian dan timbunan, rute, kolam, progres), serta enam jendela perhitungan untuk tanah, jalan, survei, tambang, tautan, dan rel.

### Baru

**Uji grading Anda**

- **Buat hujan.** {{ui:Buat hujan…}} (di bawah {{ui:Permukaan}}) menurunkan badai pada tanah yang sudah di-grading. Anda melihat air mengalir dari pad, tergenang di sudut-sudut rendah, dan meluap dari kolam yang terlalu kecil. Prosesnya dianimasikan dan menghasilkan volume, debit puncak, serta CSV dari setiap kolam. Sel bawaannya kasar agar pemeriksaan pertama cepat; sel yang lebih halus lebih lambat. Kolam yang meluap juga muncul di panel Masalah.
- **Penyeimbang pekerjaan tanah.** {{ui:Penyeimbang pekerjaan tanah…}} menaikkan atau menurunkan pad sampai galian sama dengan timbunan, dan menampilkan tabel angkutan di antaranya.
- **Rute terbaik.** {{ui:Rute terbaik…}}: pilih titik awal dan akhir, dan CivilCraft mencari jalur termurah melintasi medan yang tetap berada dalam batas kemiringan dan lengkung Anda, lalu membuat alinyemen darinya.
- **Kolam detensi.** {{ui:Kolam detensi…}} menghitung tahap dan tampungan dari tanah Anda, menerima perangkat outlet (orifis, weir, V-notch, spillway), menelusuri badai melalui kolam dan memeriksa debit puncak yang tertahan, waktu penurunan muka air, dan jagaan.
- **Progres dari survei.** {{ui:Progres dari survei…}} membandingkan permukaan drone atau pindai dari tanggal berbeda dengan tanah seperti sebelumnya dan dengan desain: persen selesai menurut volume, area yang digali berlebih dan ditimbun berlebih, timbunan material, serta kapan pekerjaan selesai pada laju ini (ditandai sebagai estimasi).

**Kenali tapak**

- **Alamat ke tapak.** {{ui:Alamat ke tapak…}} menyelaraskan data persil, bangunan, zonasi, tanah, banjir, dan medan yang terbuka pada satu tapak. Anda dapat menyimpan tapak dalam berkas proyek: alamat yang diketik, setiap sumber beserta hari pengambilannya dan lisensinya, serta apa yang kembali. Buka ulang atau bagikan proyek dan tapaknya tetap ada, tanpa mengambil ulang apa pun. Anda juga dapat menyimpannya sebagai berkas tapak atau mengirimnya ke BimCraft. Lihat [Alamat ke tapak](topic:address-to-site).

**Tanah, jalan, survei, tambang, tautan, dan rel**

- **Tanah dan lereng.** {{ui:Tanah dan lereng…}} menggambar profil tanah di antara bor yang Anda ketik. Metode Bishop kemudian mencari lingkaran kritis pada tanah Anda, dengan muka air tanah, beban tambahan, dan koefisien gempa; penurunan pondasi memperoleh konsolidasi, penurunan segera, dan waktu.
- **Persimpangan dan marka.** {{ui:Persimpangan dan marka…}} menyatukan kaki-kaki dengan lengkung kanstin (satu radius per kaki, atau lengkung tiga pusat), jarak pandang untuk kecepatan desain, pemeriksaan segitiga pandang, penyeberangan, garis henti, marka dan rambu dengan jadwal rambu. Semuanya digambar di denah dan disimpan sebagai .dxf dengan layer yang dinamai.
- **Perataan survei.** {{ui:Perataan survei…}} menjalankan perataan kuadrat terkecil pada poligon atau jaringan: koordinat terkoreksi, elips kesalahan, uji chi-kuadrat, dan tanda pada pengukuran yang tidak sesuai. Jaringan bebas, penutupan poligon dengan aturan kompas dan RW5, berkas lapangan GSI, JobXML, atau CSV disertakan, dan titik yang sudah diratakan disimpan sebagai CSV.
- **Tambang terbuka.** {{ui:Tambang terbuka…}} mengubah sampel bor menjadi model blok dan pit akhir dalam sudut lereng Anda, dengan rasio kupas, tabel per jenjang, serta kurva kadar dan tonase. Pit bersarang menurut faktor pendapatan dan jadwal produksi dengan arus kas terdiskonto juga tersedia.
- **Tautan radio.** {{ui:Tautan radio…}} memeriksa garis pandang di atas tanah Anda dengan lengkung bumi, zona Fresnel pertama, anggaran tautan, margin pudar, dan gangguan multipath, serta memberikan tinggi tiang yang akan membebaskan jalur. Juga tersedia anggaran rugi serat, kuantitas rute, dan angin pada menara.
- **Wesel rel.** {{ui:Wesel rel…}} membuat wesel dari nomor frog-nya, crossover di antara jalur paralel, dan gabarit struktur yang dimiringkan oleh kemiringan melintang dan dilebarkan pada lengkung. Wesel dapat berada pada stasiun alinyemen.

Lihat [Tanah, persimpangan, perataan survei, tambang, tautan radio, dan wesel](topic:soils-roads-survey-mines-links).

### Di setiap aplikasi

- **Bahasa.** 54 bahasa, sepuluh di antaranya baru. Bahasa selain Inggris adalah draf mesin sampai penutur asli membacanya. Topik bantuan sebagian besar masih berbahasa Inggris.
- **Baris bilah alat.** {{ui:Pengaturan}} › {{ui:Umum}} › {{ui:Baris bilah alat}}: Bungkus (seperti sebelumnya), 2 baris, atau 1 baris. Pita CivilCraft menampilkan alat yang paling sering dipakai dalam ukuran besar, yang berikutnya dalam ukuran kecil, dan sisanya di balik panah pada nama grup.
- **Perangkat input.** Trackpad, pena, mouse 3D, pengontrol, dan MIDI dapat menggerakkan aplikasi.
- **Masalah.** Panel Masalah yang memberi peringatan di setiap aplikasi, dengan pemeriksaan yang membaca paket peraturan.
- **Live.** Tampilan siapa berada di mana dalam sesi Live.
- **Add-on.** Daftar add-on, dengan add-on pencahayaan.
- **Hubungkan AI Anda.** Asisten apa pun yang Anda hubungkan dapat menjalankan alat CivilCraft. Disertakan catatan bahwa penghubungan satu klik di dalam CadCraft Studio dan konektor yang di-hosting belum siap. Lihat [Biarkan asisten AI bekerja dengan tapak Anda](topic:assistants).

### Diperbaiki di 0.8.1

- **Bagian kelas DWG.** Bagian ini dibaca sebagai tipe yang salah (GitHub cadcraft#5). Diperbaiki di CivilCraft bersama CadCraft, BimCraft, ModelCraft, dan TakeoffCraft.
- **Mengganti bahasa saat berjalan.** CadCraft Studio dan edisi kemasan dapat mengganti bahasa saat berjalan. Sebelumnya hanya bahasa Inggris. Belum diuji di setiap platform: beri tahu kami jika bahasa tidak berubah.

### Belum ada di versi ini

- **Ini adalah alat bantu hitung.** Setiap hasil di jendela baru memerlukan pemeriksaan insinyur. Kekuatan tanah dimulai dari nilai tipikal untuk kelompok tanah, dan jendela menyatakannya.
- **Buat hujan.** Satu kali jalan pada tapak contoh dapat memakan waktu lebih dari dua menit di peramban pada sel halus. Hasilnya diperiksa terhadap kasus hitung manual dan tangkapan berbentuk V, belum pada tapak yang di-grading sungguhan.
- **Alamat ke tapak.** Alat ini membaca berkas data terbuka yang Anda bawa, dan hanya diuji pada berkas kami sendiri. Pohon bukan sumber. Pengambilan sumber untuk Anda menunggu rumusan privasi.
- **Progres dari survei.** Hanya diuji pada survei rekaan. Progres pada lembar dan markup (MarkupCraft) serta pemindaian terhadap model (BimCraft) belum dibuat.
- **Tanah dan lereng.** Hanya permukaan melingkar: tidak ada pencarian baji atau blok dan tidak ada retakan tarik.
- **Persimpangan.** Satu radius per kaki, tanpa jejak sapuan truk, dan belum masuk ke koridor.
- **Berkas lapangan.** Pembacanya ditulis dari deskripsi format publik dan dicoba pada berkas yang kami buat. Berkas instrumen sungguhan masih dibutuhkan.
- **Tautan dan rel.** Tautan radio: hanya rugi ruang bebas dan multipath (tanpa pudar hujan atau pola antena), dan tidak ada standar rel: setiap batas rel adalah placeholder, dengan angka draf yang belum diperiksa insinyur rel mana pun.
- **Windows dan macOS.** 0.8 belum ditandatangani kodenya. Windows mungkin memberi peringatan, dan macOS meminta klik kanan lalu Buka.

Semua yang lain ada di [Belum dibuat](topic:not-built-yet). Untuk rilis sebelumnya, lihat [Yang baru di 0.7](topic:whats-new-0-7).
