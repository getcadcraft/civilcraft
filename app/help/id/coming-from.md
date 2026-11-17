---
title: Datang dari perangkat lunak sipil lain
summary: Cara alur kerja desain sipil yang sudah dikenal dipetakan ke CivilCraft, dan perbedaan yang sering membingungkan pengguna berpengalaman pada jam pertama.
keywords: peralihan, migrasi, sudah dikenal, perbedaan, alur kerja, perintah, pemetaan, cogo, koridor, grading, jaringan pipa, gaya, baris perintah
from: feae37d6
---

Jika Anda pernah menggunakan Civil 3D, Anda sudah mengenal gagasan di CivilCraft: titik dan grup titik, permukaan TIN dengan breakline dan batas, alinyemen menurut PI, profil menurut PVI, assembly yang disapu menjadi koridor, grading ke daylight, jaringan pipa gravitasi, dan LandXML. Yang berbeda adalah hampir semua hal di sekitarnya: tidak ada file gambar, tidak ada baris perintah (kecuali Anda memilih gaya menu {{ui:Drafting klasik}}), tidak ada gaya, tidak ada Prospector, dan tidak ada dialog pengaturan. CivilCraft adalah alat kecil yang fokus di dalam peramban, dan di build ini ia melakukan sebagian kecil dari apa yang dilakukan paket sipil lengkap. Halaman ini memetakan apa yang Anda ketahui ke apa yang tersedia di sini.

:::tip
Jika Anda menyukai ribbon Civil 3D, pilih gaya menu {{ui:Ribbon sipil}} di {{ui:Pengaturan}} › {{ui:CivilCraft}} › {{ui:Menu, tombol, dan mouse}}: tab Home, Permukaan, Ubah, Geolokasi, Tampilan, dan Output; tombol tengah menggeser, dan {{key:Shift}} dengan tombol tengah memutar tampilan 3D. Jika Anda mengetik perintah, {{ui:Drafting klasik}} menambahkan baris perintah (ALIGNMENT, PAD, PROFILE, ZOOM …). Lihat [Menu, tombol, dan mouse](topic:menus-keys-and-mouse).
:::

## Peta alur kerja

| Yang ingin Anda lakukan | Cara yang sudah dikenal | Di CivilCraft |
|---|---|---|
| Membawa titik survei | Impor titik dengan format file titik | {{ui:Buka}}, lalu periksa urutan kolom di **Impor titik** ([Impor titik survei](topic:import-points)) |
| Mengurutkan titik | Grup titik, kunci deskripsi | Grup otomatis menurut kata pertama deskripsi; tidak ada kunci deskripsi |
| Mengedit titik | Editor titik, gagang | Klik dan ketik di Properti, atau seret ([Edit titik survei](topic:edit-points)) |
| Membangun tanah eksisting | Buat permukaan, tambahkan grup titik sebagai data | Otomatis: permukaan dibangun ulang setiap kali inputnya berubah |
| Menambah breakline | Tambahkan breakline dari polyline atau garis fitur | Atur grup titik ke {{ui:Breakline}}, atau klik titik dengan alat {{ui:Breakline}} ({{key:B}}) |
| Memangkas permukaan | Batas luar, batas sembunyi, panjang segitiga maksimum | {{ui:Batas}} ({{key:O}}, hanya luar) dan **Sisi luar terpanjang** |
| Menampilkan kontur | Gaya permukaan | **Tampilan** di panel kiri: interval, mayor setiap, label, pita, panah kemiringan |
| Menyusun sumbu | Alat pembuatan alinyemen, pengaturan tikungan dan spiral | {{ui:Alinyemen}} ({{key:A}}): klik PI, {{key:Enter}}; jari-jari dan panjang spiral di tabel PI |
| Membuat tampilan profil | Wizard tampilan profil, pita | {{ui:Profil}} ({{key:R}}): satu tampilan profil di bawah denah, selalu pas |
| Merancang kelandaian | Alat tata letak profil | {{ui:Mulai dari tanah}}, {{ui:Tambah PVI}} ({{key:I}}), seret PVI, ketik **Kurva L** |
| Membangun jalan | Assembly, subassembly, koridor, target, region | Centang **Sapu assembly sepanjang profil rancangan** di bawah alinyemen; satu lajur, bahu, dan lereng sisi di setiap sisi, atau setiap sisi dibangun dari bagian (talang, kerb, trotoar …) |
| Menggrading pad | Feature line, grup grading, kriteria grading | {{ui:Pad}} ({{key:G}}): pad datar dengan lereng galian dan timbunan ke daylight |
| Menghitung pekerjaan tanah | Surface volume, dashboard volume | **Pekerjaan tanah** di panel kanan, metode grid, diperbarui langsung |
| Menyusun drainase hujan atau air limbah | Jaringan pipa dengan daftar bagian dan aturan | {{ui:Pipa}} ({{key:P}}): klik struktur hilir; tiga aturan yang Anda atur; invert otomatis |
| Bertukar dengan pihak lain | Impor dan ekspor LandXML | {{ui:Buka}} file LandXML; {{ui:LandXML}} untuk ekspor ([Ekspor LandXML](topic:landxml)) |
| Mengirim garis ke CAD | Ekspor ke DWG | {{ui:DWG}} (format 2000 hingga 2018) atau {{ui:DXF}} (R12) |
| Mencetak | Layout, viewport, set lembar | {{ui:PDF}}: satu lembar lansekap denah pada skala yang dipilih; lembar denah dan profil serta lembar penampang sebagai PDF |
| Berbagi pekerjaan antar file | Shortcut data, referensi | Tidak tersedia: satu proyek per file |
| Urungkan | Urungkan | {{key:Mod+Z}} dan {{key:Mod+Y}}, 200 langkah; pengaturan tampilan bukan langkah urungkan |

## Perbedaan yang membuat orang tersandung

**Tidak ada baris perintah** kecuali Anda memilih gaya menu {{ui:Drafting klasik}}. Alat adalah tombol bilah alat dan huruf tunggal: {{key:A}} alinyemen, {{key:G}} pad, {{key:P}} pipa, {{key:B}} breakline, {{key:O}} batas, {{key:R}} profil, {{key:I}} tambah PVI, {{key:V}} pilih, {{key:F}} paskan. Di gaya menu lain, mengetik nama perintah tidak melakukan apa-apa. Lihat [Tombol dan mouse](topic:keyboard).

**Enter menyelesaikan; klik ganda berisiko.** Klik titik terakhir sekali, lalu tekan {{key:Enter}}. Di build ini klik ganda juga menyelesaikan, tetapi menjatuhkan titik yang Anda klik ganda. Klik kanan tidak menyelesaikan atau mengulang; ia hanya menggeser saat Anda menyeret dengannya.

**Semuanya dinamis, sepanjang waktu.** Ubah grup titik, jari-jari, PVI, atau kemiringan pad, dan permukaan, kontur, koridor, garis daylight, serta volume langsung diperbarui. Tidak ada yang perlu dibangun ulang dan tidak ada yang kedaluwarsa.

**Tidak ada yang berupa objek gambar.** Denah adalah tampilan rancangan, bukan gambar yang dapat Anda edit dengan perintah CAD. Anda tidak dapat menambahkan garis atau teks sendiri, mengubah warna layer, atau meledakkan apa pun. Ekspor ke DXF dan selesaikan gambarnya di program CAD.

**Tidak ada gaya.** Warna, tebal garis, ukuran label, dan nama layer tetap (lihat [Layer denah](topic:plan-layers)). Kertas dan Model di bilah aplikasi mengganti antara layar terang dan gelap.

**Masing-masing satu.** Satu permukaan tanah eksisting, satu hasil grading, dan satu jaringan pipa per proyek. Banyak alinyemen dan pad tidak masalah.

**Satuan hanya label.** Memilih {{ui:Kaki AS}} atau {{ui:Meter}} tidak mengonversi apa pun. Tidak ada skala gambar. Sistem koordinat bersifat opsional: atur di bawah {{ui:Koordinat}} dan tidak ada yang bergerak; ia hanya menyatakan arti angkanya (lihat [Atur sistem koordinat proyek](topic:coordinate-systems)). Kaki diperlakukan sebagai kaki survei AS saat ditulis ke LandXML.

**Grup breakline menggabung menurut nomor titik.** Grup yang diatur ke {{ui:Breakline}} menjadi satu garis melalui semua titiknya, menurut urutan nomor. Kode yang sama (dua garis aliran keduanya berkode "FL") membuat satu garis zig-zag; gambarlah garis-garis itu dengan tangan.

**Stasiun tampak sama, meter berbeda.** Kaki menggunakan stasiun 100 ft (12+34.56); meter menggunakan stasiun 1000 m (1+234.567).

**Hapus di Mac.** Tombol berlabel delete di Mac adalah Backspace bagi peramban. Gunakan Fn dan delete, atau tombol {{ui:Hapus}}, untuk menghapus pilihan.

**File adalah unduhan.** {{ui:Simpan}} mengunduh file `.civilcraft.json` setiap kali; tidak ada "simpan ke file yang terbuka". Salinan pemulihan pekerjaan yang belum disimpan disimpan di peramban ini ([Pulihkan pekerjaan yang belum disimpan](common:recover)). Membuka file titik menggantikan titik tanpa bertanya. Lihat [File yang dapat Anda buka, simpan, dan ekspor](topic:files).

**Aturan ditentukan Anda.** Aturan jaringan pipa dan assembly koridor dimulai dengan nilai placeholder yang bukan standar. Atur aturan Anda sendiri sebelum mempercayai pemeriksaan apa pun.

**Volume berbasis grid.** Galian dan timbunan berasal dari grid halus di antara dua permukaan, di dalam garis daylight, tanpa swell atau shrink. Angkanya mendekati, tetapi tidak sama dengan, volume TIN-ke-TIN.

## Yang belum tersedia

Spiral selain klotoid, assembly yang berubah sepanjang jalan, pad miring, kapasitas inlet dan detensi, katalog bagian, pipa dalam profil, tata letak persil dan penentuan ukuran kavling, penyesuaian kuadrat terkecil dan basis data survei, membuka DWG, dan lain-lain. Daftar lengkap, dengan apa yang harus dilakukan sebagai gantinya saat ini, ada di [Belum dibuat](topic:not-built-yet).
