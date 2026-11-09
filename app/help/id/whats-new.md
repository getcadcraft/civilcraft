---
title: Yang baru di 0.8 dan 0.8.1
summary: CivilCraft 0.8 menambahkan Buat hujan (proses badai di atas grading Anda), penyeimbang pekerjaan tanah, pencari rute terbaik, kolam detensi, progres dari survei, pengimpor alamat ke tapak yang menyimpan tapak di dalam proyek, serta jendela untuk tanah dan lereng, persimpangan dan marka, perataan survei, tambang terbuka, link radio, dan wesel rel. 0.8.1 memperbaiki cara membaca berkas DWG.
keywords: yang baru, apa yang baru, catatan rilis, changelog, perubahan, 0.8, 0.8.1, versi, fitur baru, hujan, badai, genangan, melimpas, pekerjaan tanah, keseimbangan, galian dan timbunan, angkutan, rute terbaik, biaya terendah, alinyemen, kolam detensi, outlet, penurunan muka air, tinggi jagaan, progres, survei, drone, timbunan sementara, alamat ke tapak, persil, tanah, banjir, stabilitas lereng, Bishop, penurunan, persimpangan, marka, rambu, jarak pandang, perataan, kuadrat terkecil, poligon, tambang terbuka, model blok, link radio, Fresnel, wesel, crossover, bahasa, masalah, live, DWG
from: b0932cf0
---

Ini yang berubah di CivilCraft 0.8 (2026-11-01) dan 0.8.1 (2026-11-02), dibandingkan dengan 0.7. Bagian baru yang besar adalah alat untuk menguji grading dan tapak Anda (hujan, pekerjaan tanah, rute, kolam, progres) serta enam jendela perhitungan untuk tanah, jalan, survei, tambang, link, dan rel.

## Baru

### Uji grading Anda

- **Buat hujan.** {{ui:Buat hujan…}} (di bawah {{ui:Permukaan}}) menjatuhkan badai di atas permukaan yang sudah digrading. Anda melihat air mengalir dari pad, menggenang di sudut-sudut rendah, dan melimpas dari kolam yang terlalu kecil. Prosesnya dianimasikan dan menghasilkan volume, debit puncak keluar, serta CSV untuk setiap kolam. Sel default dibuat kasar agar pemeriksaan pertama cepat; sel yang lebih halus lebih lambat. Kolam yang melimpas juga muncul di panel Masalah.
- **Penyeimbang pekerjaan tanah.** {{ui:Penyeimbang pekerjaan tanah…}} menaikkan atau menurunkan pad sampai galian sama dengan timbunan, dan menampilkan tabel angkutan di antara keduanya.
- **Rute terbaik.** {{ui:Rute terbaik…}}: pilih titik awal dan titik akhir, lalu CivilCraft mencari jalur termurah melintasi medan yang tetap berada dalam batas kelandaian dan tikungan Anda, kemudian membuat alinyemen dari jalur tersebut.
- **Kolam detensi.** {{ui:Kolam detensi…}} menghitung tinggi muka air dan tampungan dari permukaan tanah Anda, menerima perangkat outlet (orifis, ambang, takik-V, pelimpah), merutekan badai melalui kolam, dan memeriksa debit puncak yang tertahan, waktu penurunan muka air, serta tinggi jagaan.
- **Progres dari survei.** {{ui:Progres dari survei…}} membandingkan permukaan drone atau hasil pemindaian dari tanggal yang berbeda dengan tanah seperti kondisi awal dan dengan desain: persen selesai menurut volume, area yang digali berlebih dan ditimbun berlebih, timbunan sementara, serta kapan pekerjaan selesai dengan laju ini (ditandai sebagai estimasi).

### Kenali tapak

- **Alamat ke tapak.** {{ui:Alamat ke tapak…}} menyatukan data persil terbuka, bangunan, zonasi, tanah, banjir, dan medan dalam satu tapak. Anda dapat menyimpan tapak di dalam berkas proyek: alamat yang diketik, setiap sumber beserta tanggal pengambilan dan lisensinya, serta hasil yang diperoleh. Saat proyek dibuka ulang atau dibagikan, tapak tetap ada tanpa pengambilan ulang. Anda juga dapat menyimpannya sebagai berkas tapak atau mengirimnya ke BimCraft. Lihat [Alamat ke tapak](topic:address-to-site).

### Tanah, jalan, survei, tambang, link, dan rel

- **Tanah dan lereng.** {{ui:Tanah dan lereng…}} menggambar profil tanah di antara bor yang Anda ketik. Metode Bishop kemudian mencari bidang longsor kritis pada permukaan tanah Anda, dengan muka air tanah, beban timbunan (surcharge), dan koefisien gempa; penurunan pondasi mencakup konsolidasi, penurunan segera, dan waktunya.
- **Persimpangan dan marka.** {{ui:Persimpangan dan marka…}} menyusun cabang-cabang dengan belokan kerb (satu radius per cabang, atau belokan tiga pusat), jarak pandang untuk kecepatan rencana, pemeriksaan segitiga pandang, zebra cross, garis henti, marka, dan rambu dengan jadwal rambu. Semuanya digambar pada denah dan disimpan sebagai .dxf dengan layer bernama.
- **Perataan survei.** {{ui:Perataan survei…}} menjalankan perataan kuadrat terkecil pada poligon atau jaring: koordinat hasil perataan, elips kesalahan, uji chi-kuadrat, dan penanda pada pengukuran yang tidak sesuai. Jaring bebas, penutupan poligon dengan aturan kompas, serta berkas lapangan RW5, GSI, JobXML, atau CSV sudah termasuk, dan titik hasil perataan disimpan sebagai CSV.
- **Tambang terbuka.** {{ui:Tambang terbuka…}} mengubah sampel bor menjadi model blok dan tambang akhir dalam sudut lereng Anda, dengan rasio pengupasan, tabel per jenjang, serta kurva kadar dan tonase. Tambang bersarang menurut faktor pendapatan dan jadwal produksi dengan arus kas terdiskonto juga tersedia.
- **Link radio.** {{ui:Link radio…}} memeriksa garis pandang di atas medan Anda dengan kelengkungan bumi, zona Fresnel pertama, anggaran link, margin pudar, dan gangguan multipath, serta memberikan tinggi tiang yang akan membebaskan jalur. Tersedia juga anggaran rugi serat, kuantitas rute, dan beban angin pada menara.
- **Wesel rel.** {{ui:Wesel rel…}} membuat wesel dari nomor frog-nya, crossover di antara jalur paralel, dan profil bebas yang dimiringkan oleh superelevasi rel serta dilebarkan di tikungan. Wesel dapat berada di sebuah stasiun pada alinyemen.

Lihat [Tanah, persimpangan, perataan survei, tambang, link radio, dan wesel](topic:soils-roads-survey-mines-links).

## Di setiap aplikasi

- **Bahasa.** 54 bahasa, sepuluh di antaranya baru. Bahasa selain bahasa Inggris masih berupa draf mesin sampai penutur asli membacanya. Topik bantuan sebagian besar masih dalam bahasa Inggris.
- **Baris bilah alat.** {{ui:Pengaturan}} › {{ui:Umum}} › {{ui:Baris bilah alat}}: Bungkus (seperti sebelumnya), 2 baris, atau 1 baris. Ribbon CivilCraft menampilkan alat yang paling sering dipakai dalam ukuran besar, alat berikutnya dalam ukuran kecil, dan sisanya di balik panah pada nama grup.
- **Perangkat input.** Trackpad, pena, mouse 3D, pengontrol, dan MIDI dapat mengendalikan aplikasi.
- **Masalah.** Panel Masalah yang memberi peringatan di setiap aplikasi, dengan pemeriksaan yang membaca paket regulasi.
- **Live.** Tampilan siapa berada di mana dalam sesi Live.
- **Add-on.** Daftar add-on, termasuk add-on pencahayaan.
- **Hubungkan AI Anda.** Asisten apa pun yang Anda hubungkan dapat mengendalikan alat CivilCraft. Versi ini disertai catatan bahwa menghubungkan dengan satu klik di dalam CadCraft Studio dan konektor yang dihosting belum siap. Lihat [Biarkan asisten AI bekerja dengan tapak Anda](topic:assistants).

## Diperbaiki di 0.8.1

- **Bagian kelas DWG.** Bagian ini dibaca sebagai tipe yang salah (GitHub cadcraft#5). Diperbaiki di CivilCraft bersama CadCraft, BimCraft, ModelCraft, dan TakeoffCraft.
- **Mengganti bahasa saat berjalan.** CadCraft Studio dan edisi paket dapat mengganti bahasa saat aplikasi berjalan. Sebelumnya hanya tersedia dalam bahasa Inggris. Belum diuji di setiap platform: beri tahu kami jika bahasa tidak berubah.

## Belum ada di versi ini

- **Ini adalah alat bantu hitung.** Setiap hasil di jendela baru perlu diperiksa oleh insinyur. Kekuatan tanah dimulai dari nilai tipikal untuk kelompok tanah, dan jendela menyatakannya.
- **Buat hujan.** Satu proses pada situs contoh bisa memakan waktu lebih dari dua menit di peramban dengan sel halus. Hasilnya telah diperiksa terhadap kasus hitung manual dan daerah tangkapan berbentuk V, belum pada tapak nyata yang sudah digrading.
- **Alamat ke tapak.** Alat ini membaca berkas data terbuka yang Anda bawa, dan hanya diuji dengan berkas kami sendiri. Pepohonan bukan sumber. Pengambilan sumber untuk Anda menunggu kata-kata kebijakan privasi.
- **Progres dari survei.** Hanya diuji dengan survei rekaan. Progres pada lembar dan markup (MarkupCraft) serta pemindaian terhadap model (BimCraft) belum dibuat.
- **Tanah dan lereng.** Hanya permukaan melingkar: tidak ada pencarian baji atau blok, dan tanpa retakan tarik.
- **Persimpangan.** Satu radius per cabang, tanpa jejak sapuan truk, dan belum masuk ke koridor.
- **Berkas lapangan.** Pembaca ditulis berdasarkan deskripsi format publik dan dicoba pada berkas buatan kami. Berkas instrumen asli masih dibutuhkan.
- **Link dan rel.** Link radio: hanya rugi ruang bebas dan multipath (tanpa pudar hujan atau pola antena), dan belum ada standar perkeretaapian: setiap batas rel adalah placeholder, dengan angka draf yang belum diperiksa insinyur perkeretaapian.
- **Windows dan macOS.** 0.8 belum ditandatangani kode. Windows mungkin memberi peringatan, dan macOS meminta klik kanan lalu Buka.

Semua yang lain ada di [Belum dibuat](topic:not-built-yet). Untuk rilis sebelumnya, lihat [Yang baru di 0.7](topic:whats-new-0-7).
