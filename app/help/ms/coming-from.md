---
title: Berpindah dari perisian kejuruteraan awam lain
summary: Cara aliran kerja reka bentuk awam yang biasa dipetakan kepada CivilCraft, dan perbezaan yang menyebabkan pengguna berpengalaman tersandung dalam jam pertama.
keywords: pertukaran, migrasi, biasa, perbezaan, aliran kerja, arahan, pemetaan, cogo, koridor, penggredan, rangkaian paip, gaya, baris arahan
from: feae37d6
---

Jika anda pernah menggunakan Civil 3D, anda sudah tahu idea dalam CivilCraft: titik dan kumpulan titik, permukaan TIN dengan garis putus dan sempadan, penjajaran mengikut PI, profil mengikut PVI, pemasangan yang disapu menjadi koridor, penggredan ke persilangan cerun, rangkaian paip graviti, LandXML. Yang berbeza ialah hampir semua perkara di sekelilingnya: tiada fail lukisan, tiada baris arahan (melainkan anda memilih gaya menu {{ui:Klasik lukisan}}), tiada gaya, tiada Prospector dan tiada kotak dialog tetapan. CivilCraft ialah alat kecil yang fokus dalam pelayar, dan dalam binaan ini ia melakukan sebahagian kecil daripada apa yang dilakukan oleh pakej awam penuh. Halaman ini memetakan apa yang anda tahu kepada apa yang ada di sini.

:::tip
Jika anda suka reben Civil 3D, pilih gaya menu {{ui:Reben civil}} dalam {{ui:Tetapan}} › {{ui:CivilCraft}} › {{ui:Menu, kekunci dan tetikus}}: tab Laman Utama, Permukaan, Ubah suai, Geolokasi, Paparan dan Output, butang tengah menggerakkan paparan, dan {{key:Shift}} dengan butang tengah mengorbitkan paparan 3D. Jika anda menaip arahan, {{ui:Klasik lukisan}} menambah baris arahan (ALIGNMENT, PAD, PROFILE, ZOOM …). Lihat [Menu, kekunci dan tetikus](topic:menus-keys-and-mouse).
:::

## Peta aliran kerja

| Apa yang anda mahu buat | Cara biasa | Dalam CivilCraft |
|---|---|---|
| Bawa masuk titik ukur | Import titik dengan format fail titik | {{ui:Buka}}, kemudian semak susunan lajur dalam **Import titik** ([Import titik ukur](topic:import-points)) |
| Isih titik | Kumpulan titik, kunci huraian | Kumpulan automatik mengikut perkataan pertama huraian; tiada kunci huraian |
| Sunting titik | Editor titik, pemegang | Klik dan taip dalam Sifat, atau seret ([Sunting titik ukur](topic:edit-points)) |
| Bina tanah sedia ada | Cipta permukaan, tambah kumpulan titik sebagai data | Automatik: permukaan dibina semula apabila inputnya berubah |
| Tambah garis putus | Tambah garis putus daripada polilines atau garis ciri | Tetapkan kumpulan titik kepada {{ui:Garis putus}}, atau klik titik dengan alat {{ui:Garis putus}} ({{key:B}}) |
| Pangkas permukaan | Sempadan luar, sempadan sembunyi, panjang segi tiga maksimum | {{ui:Sempadan}} ({{key:O}}, luar sahaja) dan **Tepi luar terpanjang** |
| Tunjuk kontur | Gaya permukaan | **Paparan** dalam panel kiri: selang, major setiap, label, jalur, anak panah cerun |
| Susun paksi tengah | Alat cipta penjajaran, tetapan lengkung dan spiral | {{ui:Penjajaran}} ({{key:A}}): klik PI, {{key:Enter}}; jejari dan panjang spiral dalam jadual PI |
| Cipta paparan profil | Wizard paparan profil, jalur | {{ui:Profil}} ({{key:R}}): satu paparan profil di bawah pelan, sentiasa dimuatkan |
| Reka bentuk kecerunan | Alat susun atur profil | {{ui:Mula dari tanah sedia ada}}, {{ui:Tambah PVI}} ({{key:I}}), seret PVI, taip **Lengkung L** |
| Bina jalan | Pemasangan, subpemasangan, koridor, sasaran, kawasan | Tandakan **Sapu pemasangan sepanjang profil reka bentuk** di bawah penjajaran; satu lorong, bahu dan cerun sisi setiap sisi, atau setiap sisi dibina daripada bahagian (lereng, kerb, kaki lima …) |
| Gred pelantar | Garis ciri, kumpulan penggredan, kriteria penggredan | {{ui:Pelantar}} ({{key:G}}): pelantar rata dengan cerun potongan dan tambakan ke persilangan cerun |
| Kira kerja tanah | Permukaan isipadu, papan pemuka isipadu | **Kerja tanah** dalam panel kanan, kaedah grid, dikemas kini serta-merta |
| Susun ribut atau kumbahan | Rangkaian paip dengan senarai bahagian, peraturan | {{ui:Paip}} ({{key:P}}): klik struktur hiliran; tiga peraturan yang anda tetapkan; invert automatik |
| Tukar dengan orang lain | Import dan eksport LandXML | {{ui:Buka}} fail LandXML; {{ui:LandXML}} untuk eksport ([Tukar LandXML](topic:landxml)) |
| Hantar garisan ke CAD | Eksport ke DWG | {{ui:DWG}} (format 2000 hingga 2018) atau {{ui:DXF}} (R12) |
| Plot | Susun atur, viewport, set helaian | {{ui:PDF}}: satu helaian landskap bagi pelan pada skala yang dipilih; helaian pelan dan profil serta helaian keratan sebagai PDF |
| Kongsi kerja antara fail | Pautan data, rujukan | Tidak tersedia: satu projek setiap fail |
| Buat asal | Buat asal | {{key:Mod+Z}} dan {{key:Mod+Y}}, 200 langkah; tetapan paparan bukan langkah buat asal |

## Perbezaan yang menyebabkan orang tersandung

**Tiada baris arahan** melainkan anda memilih gaya menu {{ui:Klasik lukisan}}. Alat ialah butang bar alat dan huruf tunggal: {{key:A}} penjajaran, {{key:G}} pelantar, {{key:P}} paip, {{key:B}} garis putus, {{key:O}} sempadan, {{key:R}} profil, {{key:I}} tambah PVI, {{key:V}} pilih, {{key:F}} muat. Dalam gaya menu lain, menaip nama arahan tidak melakukan apa-apa. Lihat [Kekunci dan tetikus](topic:keyboard).

**Enter menyelesaikan; klik dua kali berisiko.** Klik titik terakhir sekali, kemudian tekan {{key:Enter}}. Dalam binaan ini klik dua kali juga menyelesaikan, tetapi menggugurkan titik yang anda klik dua kali. Klik kanan tidak menyelesaikan atau mengulang; ia hanya menggerakkan paparan apabila anda menyeret dengannya.

**Semuanya dinamik, sepanjang masa.** Tukar kumpulan titik, jejari, PVI atau cerun pelantar, dan permukaan, kontur, koridor, garisan persilangan dan isipadu dikemas kini serta-merta. Tiada apa untuk dibina semula dan tiada apa yang ketinggalan zaman.

**Tiada apa yang merupakan objek lukisan.** Pelan ialah paparan reka bentuk, bukan lukisan yang boleh anda sunting dengan arahan CAD. Anda tidak boleh menambah garisan atau teks anda sendiri, menukar warna lapisan, atau memecahkan apa-apa. Eksport ke DXF dan siapkan lukisan dalam program CAD.

**Tiada gaya.** Warna, ketebalan garisan, saiz label dan nama lapisan ditetapkan (lihat [Lapisan pelan](topic:plan-layers)). Kertas dan Model pada bar aplikasi menukar antara skrin cerah dan gelap.

**Satu daripada setiap satu.** Satu permukaan tanah sedia ada, satu hasil digred, satu rangkaian paip bagi setiap projek. Banyak penjajaran dan pelantar tidak mengapa.

**Unit ialah label.** Memilih {{ui:Kaki tinjauan AS}} atau {{ui:Meter}} tidak menukar apa-apa. Tiada skala lukisan. Sistem koordinat adalah pilihan: tetapkannya di bawah {{ui:Koordinat}} dan tiada apa yang bergerak, ia hanya menyatakan maksud nombor (lihat [Tetapkan sistem koordinat projek](topic:coordinate-systems)). Kaki ditafsirkan sebagai kaki tinjauan AS apabila ditulis ke LandXML.

**Kumpulan garis putus bergabung mengikut nombor titik.** Kumpulan yang ditetapkan kepada {{ui:Garis putus}} menjadi satu garis melalui semua titiknya, mengikut urutan nombor. Kod yang dikongsi (dua garis aliran dikodkan "FL") menjadi satu garis zig-zag; lukis yang itu dengan tangan.

**Stesen kelihatan sama, meter berbeza.** Kaki menggunakan stesen 100 ft (12+34.56); meter menggunakan stesen 1000 m (1+234.567).

**Padam pada Mac.** Kekunci Mac yang berlabel delete ialah Backspace kepada pelayar. Gunakan Fn dan delete, atau butang {{ui:Padam}}, untuk memadam pilihan.

**Fail ialah muat turun.** {{ui:Simpan}} memuat turun fail `.civilcraft.json` setiap kali; tiada "simpan ke atas fail yang dibuka". Salinan pemulihan kerja yang belum disimpan disimpan dalam pelayar ini ([Pulihkan kerja yang belum disimpan](common:recover)). Membuka fail titik menggantikan titik tanpa bertanya. Lihat [Fail yang boleh anda buka, simpan dan eksport](topic:files).

**Peraturan ialah milik anda.** Peraturan rangkaian paip dan pemasangan koridor bermula dengan nilai tempat letak yang bukan piawaian. Tetapkan peraturan anda sendiri sebelum mempercayai sebarang semakan.

**Isipadu berasaskan grid.** Potongan dan tambakan datang daripada grid halus antara dua permukaan, di dalam garisan persilangan cerun, tanpa pengembangan atau pengecutan. Ia hampir dengan, tetapi tidak sama dengan, isipadu TIN-ke-TIN.

## Apa yang tiada

Spiral selain klotoid, pemasangan yang berubah sepanjang jalan, pelantar bercerun, kapasiti inlet dan tahanan, katalog bahagian, paip dalam profil, susun atur lot dan saiz lot, pelarasan kuasa dua terkecil dan pangkalan data tinjauan, membuka DWG, dan banyak lagi. Senarai penuh, dengan apa yang perlu dilakukan hari ini, ada dalam [Belum dibina](topic:not-built-yet).
