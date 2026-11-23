---
title: Yang baru di 0.9 (sebelumnya)
summary: Templat koridor dan medan, snap dan tombol Ambil saat menggambar, analisis GIS dengan tabel atribut, studi naungan, hasil surya, kenyamanan dan angin untuk sebuah lokasi, tampilan Render 3D, serta add-on Point cloud dan WaterCraft.
keywords: yang baru 0.9, rilis sebelumnya, yang baru, 0.9, catatan rilis, templat koridor, templat medan, penyunting templat, potongan tipikal, beberapa koridor, snap, snaps, ambil, pindahkan, salin, putar, tangen, render, render 3d, analisis gis, buffer, overlay, gabung spasial, tabel atribut, gaya menurut atribut, studi naungan, hasil surya, utci, kenyamanan luar ruang, studi angin, openfoam, point cloud, las, laz, watercraft, aliran kebakaran, hidran, usia air, klorin, kebutuhan, tooltip, tata letak, catatan perubahan, perubahan, 0.8, 0.8.1, versi, fitur baru, hujan, badai, genangan, luapan, pekerjaan tanah, keseimbangan, galian dan timbunan, angkut, rute terbaik, biaya terendah, alinyemen, kolam detensi, outlet, penurunan muka air, tinggi jagaan, progres, survei, drone, timbunan material, alamat ke lokasi, persil, tanah, banjir, stabilitas lereng, bishop, penurunan, persimpangan, marka, rambu, jarak pandang, perataan, kuadrat terkecil, poligon, tambang terbuka, model blok, tautan radio, fresnel, wesel, perlintasan silang, bahasa, masalah, live, dwg
from: 4664522c
---

Ini yang berubah di CivilCraft 0.9, dibandingkan dengan 0.8.1. CivilCraft 0.9 adalah bagian dari CadCraft Studio 0.9 dan kedelapan aplikasinya. Bagian-bagian besarnya adalah templat koridor dan medan, snap saat menggambar, analisis GIS, studi matahari, hasil surya, kenyamanan dan angin pada suatu lokasi, serta dua add-on: Point cloud dan WaterCraft.

## Baru

### Templat koridor dan medan

- **Templat koridor.** Buka {{ui:Permukaan}} › {{ui:Lainnya}} › {{ui:Templat koridor…}} (atau ketik {{cmd:TEMPLATES}}). Templat adalah potongan melintang kecil dengan komponen, offset, kemiringan, material, dan kode titik. Simpan di proyek, di {{ui:Pustaka saya}}, atau sebagai file `.cctemplates.json`. Penyunting templat menampilkan gambar berskala sebenarnya dan mendaftar masalah saat Anda mengetik.
- **Bangun dari templat per stasiun.** Pilih alinyemen dan nyalakan {{ui:Bangun dari templat berdasarkan stasiun}} di Properti-nya. Tiap sisi tiap wilayah memiliki daftar perkerasannya sendiri dan kondisi ujungnya sendiri. {{ui:Tambah koridor}} di bawah {{ui:Koridor pada alinyemen ini}} menempatkan beberapa koridor pada satu alinyemen.
- **Templat medan.** {{ui:Permukaan}} › {{ui:Lainnya}} › {{ui:Templat medan…}} (atau ketik {{cmd:TERRAINTEMPLATES}}) menghamparkan material berlapis, seperti tanah atas atau perkerasan dan dasar, di atas medan, dengan luas dan volume tiap lapisan. Lihat [Templat koridor dan templat medan](topic:corridor-templates).

### Menggambar

- **Snap.** Alat Alinyemen, Pad, Persil, Massa, Garis fitur, {{ui:Ukur}}, Batas, dan Tangkapan menempel ke titik survei, PI, sudut, simpul, dan struktur, dengan label di samping penanda. Tahan {{key:Alt}} untuk titik bebas.
- **Tombol Ambil, tangen, dan pindahkan, salin, putar.** Kotak Easting dan Northing yang dapat diketik serta tombol Ambil berbentuk bidikan tersedia untuk sudut pad, persil, dan garis fitur. Properti juga memiliki {{ui:Tangen dari dua titik}} untuk alinyemen dan {{ui:Pindahkan, salin dan putar}} untuk alinyemen, pad, persil, dan garis fitur. Lihat [Menggambar dengan snap, sudut yang dipilih, serta pindahkan, salin, dan putar](topic:draft-with-snaps).
- **Tampilan Render dalam 3D.** Tombol {{ui:Render}} pada bilah 3D menggambar lahan dengan warna alami, langit, kabut, dan bayangan lembut. Ia tidak mengubah model. Menu {{ui:Matahari}} kini memiliki tombol {{ui:Terapkan}} dan {{ui:Tutup}}. Lihat [Lihat lokasi dalam 3D](topic:site-3d).
- **Panel dibuka satu bagian dalam satu waktu.** Panel kiri dan panel Properti membuka satu bagian dan menutup yang lain, dan ubin pita Lanskap yang memuat beberapa alat berupa tombol terbagi.

### Analisis GIS

- **Analisis.** {{ui:Permukaan}} › {{ui:Lainnya}} › {{ui:Analisis}} menawarkan buffer, overlay, gabung spasial, pilih menurut atribut atau bentuk, dan ukur. Tiap alat membuat layer baru dalam satu langkah urungkan.
- **Tabel atribut.** Menu tiga titik sebuah layer memiliki {{ui:Tabel atribut…}} dan {{ui:Gaya menurut atribut…}}. Lihat [Analisis layer GIS](topic:gis-analysis) dan [Bekerja dengan tabel atribut layer](topic:gis-table).

### Lokasi: matahari, surya, kenyamanan, dan angin

- **Bagian lingkungan.** Pilih massa: bagian {{ui:Lingkungan}} berada di bawah {{ui:Jam penyinaran matahari}} di Properti-nya. Bagian ini memiliki studi naungan (peta, tabel, animasi, CSV), hasil surya dari file cuaca tahun tipikal (.epw), dan kenyamanan luar ruang (UTCI).
- **Angin, hanya penyaringan.** {{ui:Jalankan studi angin}} mewarnai tanah dari duduk nyaman sampai tidak nyaman untuk tiap arah angin dalam file cuaca. Belum divalidasi, dan panel menyatakannya.
- **Add-on angin pejalan kaki (OpenFOAM).** Mati sampai Anda menyalakannya di {{ui:Pengaturan}} › {{ui:Add-on}}. OpenFOAM adalah perangkat lunak yang Anda pasang sendiri. Lihat [Naungan, hasil surya, dan kenyamanan luar ruang](topic:environment).

### Point cloud (add-on)

- Nyalakan {{ui:Point cloud}} di {{ui:Pengaturan}} › {{ui:Add-on}}; tab Point cloud muncul di panel kanan. Buka file LAS atau LAZ, bersihkan, urutkan menjadi tanah, vegetasi, dan bangunan, bangun tanah, kontur, dan volume, lalu ekspor LAS atau LAZ. Lihat [Point cloud dari drone atau pemindai](topic:point-clouds).

### WaterCraft (add-on)

- Nyalakan {{ui:WaterCraft (distribusi air)}} di {{ui:Pengaturan}} › {{ui:Add-on}}; tab WaterCraft muncul. Tab ini memiliki kebutuhan dari pelanggan, aliran kebakaran di tiap hidran, pipa utama mana yang gangguannya paling berpengaruh, serta usia air dan klorin, yang masing-masing disimpan sebagai CSV. Lihat [WaterCraft: kebutuhan, aliran kebakaran, gangguan, dan usia air](topic:watercraft).

### Bekerja bersama

- Dalam sesi Live, Anda melihat kursor dan nama satu sama lain di denah. Tanaman pustaka: CivilCraft Lanskap mulai dari koleksi Pustaka default-nya, {{ui:CivilCraft lanskap}}.

## Di setiap aplikasi

- Petunjuk tampil sebagai tooltip Bootstrap, dan tip awal dapat ditutup.
- Deretan tab panel yang tidak muat digulir alih-alih terpotong.
- Judul tab peramban berbunyi `<document> - CivilCraft | CadCraft`.
- {{ui:Pengaturan}} memiliki bagian Tata letak, tempat tata letak berupa daftar tarik-turun dengan pilihan dua baris.
- Satuan berat dan suhu ada di {{ui:Pengaturan}} › {{ui:Global}} › {{ui:Satuan}}.
- Daftar bahasa menampilkan bahasa yang memiliki file dalam build. Bahasa selain Inggris adalah draf mesin.

## Diperbaiki

- Add-on pencarian alamat dan pemeriksaan EnergyPlus tidak bisa dinyalakan; sekarang bisa.
- Bantuan kini menyatakan bahwa add-on Point cloud menulis awan yang sudah dibersihkan sebagai LAS 1.4 atau LAZ.
- Mengklik grip milik objek yang dipilih tidak lagi memulai seretan grip yang menghentikan Ambil yang sedang menunggu.

## Batas yang jujur

- Templat koridor contoh adalah pengisi sementara yang tidak berasal dari standar apa pun; insinyur harus memeriksanya. Templat medan tidak menambah permukaan dan tidak digambar di 3D atau di tampilan penampang. Koridor kedua pada alinyemen tidak ada dalam ekspor IFC. Tidak ada tirus antara dua templat per stasiun.
- Point cloud diuji pada file rekaan, bukan survei drone sungguhan. Hanya LAS dan LAZ yang dibaca.
- Analisis GIS diuji pada layer rekaan.
- Naungan, surya, dan kenyamanan adalah perkiraan perencanaan; angin adalah penyaringan yang belum divalidasi. Tidak satu pun darinya merupakan nilai desain.
- WaterCraft adalah alat bantu hitung yang diperiksa pada jaringan rekaan. Insinyur air yang memutuskan nilai angkanya berarti apa.
- Bahasa selain Inggris adalah draf mesin.
- Instalasi Windows tidak ditandatangani kode, dan citra disk macOS tidak dinotarisasi.

## Sebelumnya: 0.8 dan 0.8.1

Ini yang berubah di CivilCraft 0.8 (2026-11-01) dan 0.8.1 (2026-11-02), dibandingkan dengan 0.7. Bagian baru yang besar adalah alat untuk menguji grading dan lokasi Anda (hujan, pekerjaan tanah, rute, kolam, progres), serta enam jendela perhitungan untuk tanah, jalan, survei, tambang, tautan, dan rel.

### Baru

**Uji grading Anda**

- **Buat hujan.** {{ui:Buat hujan…}} (di bawah {{ui:Permukaan}}) menjatuhkan badai pada tanah yang sudah di-grading. Anda melihat air mengalir dari pad, tergenang di sudut-sudut rendah, dan meluap dari kolam yang terlalu kecil. Proses dianimasikan dan menghasilkan volume, aliran keluar puncak, dan CSV tiap kolam. Sel default dibuat kasar agar pandangan pertama cepat; sel yang lebih halus lebih lambat. Kolam yang meluap juga muncul di panel Masalah.
- **Penyeimbang pekerjaan tanah.** {{ui:Penyeimbang pekerjaan tanah…}} menaikkan atau menurunkan pad sampai galian sama dengan timbunan, dan menampilkan tabel angkut di antara keduanya.
- **Rute terbaik.** {{ui:Rute terbaik…}}: pilih titik awal dan akhir, dan CivilCraft menemukan jalur termurah melintasi medan yang tetap mengikuti batas kemiringan dan lengkung Anda, lalu membuat alinyemen darinya.
- **Kolam detensi.** {{ui:Kolam detensi…}} menghitung tahap dan penyimpanan dari tanah Anda, menerima perangkat outlet (orifis, bendung, V-notch, spillway), merutekan badai melalui kolam dan memeriksa puncak yang tertahan, waktu penurunan muka air, dan tinggi jagaan.
- **Progres dari survei.** {{ui:Progres dari survei…}} membandingkan permukaan drone atau pemindaian dari tanggal berbeda dengan tanah seperti sebelumnya dan dengan rancangan: persen selesai menurut volume, area yang digali berlebih dan ditimbun berlebih, timbunan material, dan kapan pekerjaan selesai pada laju ini (ditandai sebagai perkiraan).

**Kenali lokasi**

- **Alamat ke lokasi.** {{ui:Alamat ke tapak…}} menyejajarkan data persil, bangunan, zonasi, tanah, banjir, dan medan yang terbuka pada satu lokasi. Anda dapat menyimpan lokasi dalam file proyek: alamat yang diketik, tiap sumber dengan tanggal pengambilannya dan lisensinya, serta apa yang kembali. Buka ulang atau bagikan proyek dan lokasinya tetap ada, tanpa mengambil ulang apa pun. Anda juga dapat menyimpannya sebagai file lokasi atau mengirimnya ke BimCraft. Lihat [Alamat ke lokasi](topic:address-to-site).

**Tanah, jalan, survei, tambang, tautan, dan rel**

- **Tanah dan lereng.** {{ui:Tanah dan lereng…}} menggambar profil tanah di antara boring yang Anda ketik. Metode Bishop kemudian mencari lingkaran kritis pada tanah Anda, dengan muka air tanah, beban tambahan, dan koefisien gempa; penurunan pondasi memperoleh konsolidasi, penurunan seketika, dan waktu.
- **Persimpangan dan marka.** {{ui:Persimpangan dan marka…}} menggabungkan kaki persimpangan dengan pembulatan kereb (satu radius per kaki, atau pembulatan tiga pusat), jarak pandang untuk kecepatan desain, pemeriksaan segitiga pandang, penyeberangan, garis henti, marka, dan rambu dengan jadwal rambu. Semuanya digambar di denah dan disimpan sebagai .dxf dengan layer yang dinamai.
- **Perataan survei.** {{ui:Perataan survei…}} menjalankan perataan kuadrat terkecil pada poligon atau jaringan: koordinat hasil perataan, elips kesalahan, uji chi-squared, dan bendera pada pengukuran yang tidak sesuai. Jaringan bebas, penutupan poligon dengan aturan kompas dan RW5, file lapangan GSI, JobXML, atau CSV disertakan, dan titik yang sudah diratakan disimpan sebagai CSV.
- **Tambang terbuka.** {{ui:Tambang terbuka…}} mengubah sampel bor menjadi model blok dan pit akhir dalam sudut lereng Anda, dengan rasio pengupasan, tabel per jenjang, serta kurva kadar dan tonase. Pit bersarang menurut faktor pendapatan dan jadwal produksi dengan arus kas terdiskon juga tersedia.
- **Tautan radio.** {{ui:Link radio…}} memeriksa garis pandang di atas tanah Anda dengan kelengkungan bumi, zona Fresnel pertama, anggaran tautan, margin pudar, dan outage multipath, lalu memberi tinggi tiang yang akan membebaskan jalur. Ia juga melakukan anggaran rugi serat, kuantitas rute, dan angin pada menara.
- **Wesel rel.** {{ui:Wesel rel…}} membuat wesel dari nomor frog-nya, perlintasan silang antara jalur sejajar, dan gauge struktur yang dimiringkan oleh cant dan dilebarkan pada lengkung. Wesel dapat berada di sebuah stasiun alinyemen.

Lihat [Tanah, persimpangan, perataan survei, tambang, tautan radio, dan wesel](topic:soils-roads-survey-mines-links).

### Di setiap aplikasi

- **Bahasa.** 54 bahasa, sepuluh di antaranya baru. Bahasa selain Inggris adalah draf mesin sampai penutur asli membacanya. Topik bantuan sebagian besar masih berbahasa Inggris.
- **Baris bilah alat.** {{ui:Pengaturan}} › {{ui:Umum}} › {{ui:Baris bilah alat}}: Wrap (seperti sebelumnya), 2 baris, atau 1 baris. Ribbon CivilCraft menampilkan alat yang paling sering dipakai dengan besar, yang berikutnya kecil, dan sisanya di balik panah nama grup.
- **Perangkat input.** Trackpad, pena, mouse 3D, controller, dan MIDI dapat menjalankan aplikasi.
- **Masalah.** Panel Masalah yang memperingatkan di setiap aplikasi, dengan pemeriksaan yang membaca paket regulasi.
- **Live.** Tampilan siapa berada di mana dalam sesi Live.
- **Add-on.** Daftar add-on, dengan add-on pencahayaan.
- **Hubungkan AI Anda.** Asisten apa pun yang Anda hubungkan dapat menjalankan alat CivilCraft. Ia disertai catatan bahwa penghubung sekali klik di dalam CadCraft Studio dan penghubung yang dihosting belum siap. Lihat [Biarkan asisten AI bekerja dengan lokasi Anda](topic:assistants).

### Diperbaiki di 0.8.1

- **Bagian kelas DWG.** Ia dibaca sebagai tipe yang salah (GitHub cadcraft#5). Diperbaiki di CivilCraft bersama CadCraft, BimCraft, ModelCraft, dan TakeoffCraft.
- **Mengganti bahasa saat berjalan.** CadCraft Studio dan edisi kemasan dapat mengganti bahasa saat berjalan. Sebelumnya hanya bahasa Inggris. Belum diuji di setiap platform: beri tahu kami jika bahasanya tidak berubah.

### Belum ada di versi ini

- **Ini alat bantu hitung.** Setiap hasil di jendela baru memerlukan pemeriksaan insinyur. Kekuatan tanah dimulai dari nilai khas untuk kelompok tanah, dan jendela menyatakannya.
- **Buat hujan.** Sebuah proses pada lokasi contoh dapat memakan waktu lebih dari dua menit di peramban pada sel halus. Ia diperiksa terhadap kasus hitungan manual dan tangkapan berbentuk V, belum pada lokasi ter-grading sungguhan.
- **Alamat ke lokasi.** Ia membaca file data terbuka yang Anda bawa, dan hanya diuji pada file kami sendiri. Pohon bukan sumber. Pengambilan sumber untuk Anda menunggu kata-kata privasi.
- **Progres dari survei.** Diuji hanya pada survei rekaan. Progres pada lembar dan markup (MarkupCraft) serta pemindaian terhadap model (BimCraft) belum dibuat.
- **Tanah dan lereng.** Hanya permukaan melingkar: tidak ada pencarian baji atau blok, dan tanpa retakan tarik.
- **Persimpangan.** Satu radius per kaki, tanpa jejak sapuan truk, dan belum masuk ke koridor.
- **File lapangan.** Pembaca ditulis dari deskripsi format publik dan diuji pada file yang kami buat. File instrumen sungguhan masih dibutuhkan.
- **Tautan dan rel.** Tautan radio: hanya rugi ruang bebas dan multipath (tanpa pudar hujan atau pola antena), dan tidak ada standar kereta api: setiap batas rel adalah pengisi sementara, dengan angka draf yang belum diperiksa insinyur kereta api mana pun.
- **Windows dan macOS.** 0.8 tidak ditandatangani kode. Windows mungkin memperingatkan, dan macOS meminta klik kanan lalu Buka.

Semua yang lain ada di [Belum dibuat](topic:not-built-yet). Untuk rilis sebelumnya, lihat [Yang baru di 0.7](topic:whats-new-0-7).
