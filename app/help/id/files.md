---
title: File yang dapat dibuka, disimpan, dan diekspor
summary: File titik, LandXML, dan proyek CivilCraft yang dibuka; proyek, LandXML, DXF, dan PDF yang diekspor; apa yang disimpan masing-masing, ke mana file pergi, dan apa yang berubah saat offline.
keywords: buka, simpan, ekspor, impor, format file, csv, txt, landxml, xml, dxf, pdf, json, unduh, file proyek
from: a7debb61
---

CivilCraft membuka file dari komputer Anda dan menyimpan dengan mengunduh file kembali ke komputer. Tidak ada yang diunggah dan tidak ada yang disimpan di server. Lihat juga [Berkas Anda](common:your-files).

## Yang dibuka

Klik {{ui:Buka}} (atau tekan {{key:Mod+O}}) lalu pilih file, atau seret file dari {{pick:mac=Finder|windows=File Explorer|linux=pengelola file Anda}} ke denah. Satu file dalam satu waktu; file di atas 200 MB ditolak.

| Jenis | Nama file | Yang terjadi |
|---|---|---|
| File titik | `.csv`, `.txt`, `.pnt`, `.xyz` (file teks apa pun) | Dialog **Impor titik** terbuka. Titik menggantikan titik proyek; alinyemen, pad, dan pipa tetap ada. |
| LandXML | `.xml`, `.landxml` | **Proyek baru** dibuat dari file (Anda akan ditanya lebih dulu jika proyek saat ini memiliki perubahan yang belum disimpan). |
| Proyek CivilCraft | `.civilcraft.json` (`.json` apa pun) | Proyek terbuka seperti saat disimpan (Anda akan ditanya lebih dulu jika proyek saat ini memiliki perubahan yang belum disimpan). |

CivilCraft memutuskan berdasarkan akhiran file, lalu berdasarkan karakter pertamanya: teks yang diawali `{` dibaca sebagai proyek, yang diawali `<` sebagai LandXML, dan selain itu sebagai file titik. File yang tampak redup di kotak buka tetap dapat dijatuhkan ke denah.

:::note
Mengimpor file titik ke proyek yang sudah memiliki titik akan menggantinya tanpa bertanya, dan riwayat urungkan dihapus (membuka file apa pun adalah awal baru untuk urungkan). Jika permukaan berasal dari LandXML, mengimpor titik akan mengubah permukaan kembali menjadi permukaan yang dibangun dari titik. Simpan dulu jika Anda mungkin ingin titik lama kembali.
:::

Rincian: [Format file titik](topic:point-file-formats), [LandXML: apa yang dibaca dan ditulis](topic:landxml-reference).

## Yang disimpan

{{ui:Simpan}} ({{key:Mod+S}}) menulis dua file berdampingan, dinamai sesuai **Nama** di panel kiri: `<name>.civilcraft.json`, proyek yang terus Anda sunting, dan `<name>.ifc`, desain yang sama dalam IFC 4.3 untuk pihak lain (lihat [Ekspor dan impor IFC](topic:ifc)). Masing-masing file mencatat yang lain, dan IFC juga membawa salinan proyek yang terkompresi, sehingga IFC yang dikirim sendiri tetap dapat dibuka kembali sepenuhnya dan dapat disunting.

- **Di Studio** kedua file ditulis berdampingan, langsung di tempatnya.
- **Di Chrome dan Edge** Simpan pertama meminta folder dan menulis keduanya ke dalamnya; penyimpanan berikutnya masuk ke folder yang sama. Batalkan pertanyaan folder untuk mengunduh keduanya.
- **Di peramban lain** kedua file diunduh, file proyek lebih dulu.

Membuka salah satu file akan mencari yang lain. Buka keduanya bersamaan (atau jatuhkan keduanya), atau buka salah satu: di Studio, file lainnya ditemukan di folder yang sama; di peramban, CivilCraft meminta Anda menambahkannya, atau melanjutkan dengan file yang Anda miliki. Jika IFC diubah oleh program lain setelah CivilCraft menyimpannya, atau salah satu file lebih lama dari yang lain, proyek dibuka dari desain yang lebih baru dan panel Masalah menjelaskan apa yang terjadi, dengan **Simpan sekarang** (menulis ulang kedua file) dan **Tampilkan geometri IFC sebagai referensi**. IFC saja yang diubah program lain dibuka dari salinan proyeknya dengan bagian yang masih cocok: alinyemen yang diubahnya mengambil geometrinya, objek yang dihapusnya tidak disertakan, dan sisa perubahannya didaftar, tidak diterapkan. File proyek dari sebelum 0.7.1 dibuka seperti biasa.

File proyek menyimpan:

- setiap titik (nomor, koordinat, elevasi, deskripsi) dan nama file titik asalnya
- pengaturan permukaan: pilihan grup, breakline yang digambar, batas, tepi luar terpanjang, dan TIN yang dibaca dari LandXML
- pengaturan tampilan
- alinyemen dengan PI, radius, dan stasiun awal, profil desainnya (PVI dan panjang lengkung), serta pengaturan koridor
- pad dan jaringan pipa beserta aturannya

Riwayat urungkan tidak disimpan. Permukaan, kontur, garis daylight, dan volume tidak disimpan; semuanya dibangun ulang dari masukan yang tersimpan saat proyek dibuka. File proyek dari CivilCraft yang lebih baru ditolak dengan pesan yang menyebut versinya.

## Yang diekspor

| Tombol | File | Isi |
|---|---|---|
| {{ui:LandXML}} | `<name>.xml` | LandXML 1.2: titik, tanah asli (dan permukaan rancangan jika ada) sebagai permukaan TIN, alinyemen, profil tanah dan profil desain, jaringan pipa |
| {{ui:DXF}} | `<name>.dxf` | DXF R12 dari garis denah sebagaimana ditampilkan, pada layer bernama |
| {{ui:DWG}} | `<name>.dwg` | Garis yang sama sebagai gambar DWG, dalam format yang Anda pilih (2000 sampai 2018) |
| {{ui:PDF}} | `<name>.pdf` | Plot vektor denah pada lembar, pada skala yang Anda pilih |
| {{ui:GLB}} atau {{ui:OBJ}} (di bilah tampilan 3D) | `<name>-3d.glb`, `<name>-3d.obj` | Yang ditampilkan tampilan 3D sebagai model 3D: meter, Y ke atas, skala sebenarnya, di sekitar origin lokal yang tercatat |

Yang tidak disertakan masing-masing: [Pertukaran LandXML](topic:landxml), [Ekspor denah ke DXF](topic:dxf-export) (DWG juga), [Plot denah ke PDF](topic:plot-pdf), [Ekspor tapak dalam 3D](topic:export-3d).

## Ke mana file pergi

File yang disimpan dan diekspor masuk ke tempat peramban Anda menaruh unduhan, biasanya folder Unduhan. Untuk memilih folder setiap kali:

:::chromium
Buka **Pengaturan** peramban, lalu **Unduhan**, dan aktifkan **Tanyakan lokasi penyimpanan setiap file sebelum diunduh**.
:::

:::firefox
Buka **Pengaturan**, lalu **Umum**, dan di bawah **Berkas dan Aplikasi** pilih **Selalu tanyakan lokasi penyimpanan file**.
:::

:::safari
Buka **Safari > Pengaturan > Umum** dan atur **Lokasi unduhan file** ke **Tanyakan untuk setiap unduhan**.
:::

Jika Anda menyimpan dua kali dengan nama yang sama, peramban mungkin menambahkan angka pada file kedua, misalnya `Site (1).civilcraft.json`. Buka yang terbaru lain kali.

## Online dan offline

CivilCraft hanya bekerja di komputer Anda dalam kedua kondisi: membuka membaca file di peramban, menyimpan mengunduhnya. Untuk membuka CivilCraft tanpa koneksi sama sekali, simpan untuk penggunaan offline terlebih dahulu:

1. Saat online, klik {{ui:Simpan untuk offline}} di bilah aplikasi di bagian atas.
2. Tombol menghitung ("Menyimpan 12 dari 30") lalu menampilkan {{ui:Siap offline}}. CivilCraft berukuran kecil (sekitar 0.6 MB), jadi ini memerlukan sedikit waktu. Salinan yang disimpan mencakup bantuan ini dan tapak contoh.
3. Tanpa koneksi, buka alamat yang sama (atau penanda ke sana). Semuanya berfungsi, termasuk {{ui:Buka tapak contoh}}.

Status tombol lainnya:

- {{ui:Tidak dapat menyimpan}}: beberapa file tidak terunduh. Periksa koneksi, lalu klik tombol untuk mencoba lagi.
- {{ui:Offline tidak tersedia}}: jendela peramban ini tidak dapat menyimpan salinan offline (jendela privat dan beberapa komputer terkelola memblokirnya). Gunakan jendela biasa.

Klik {{ui:Siap offline}} untuk melihat kapan salinan disimpan, dengan dua pilihan: {{ui:Simpan lagi (ambil versi terbaru)}} dan {{ui:Hapus salinan offline}}. Simpan lagi sebelum kunjungan lapangan agar salinan sesuai dengan build terbaru. Selengkapnya di [Offline](common:offline).

:::offline
Anda sedang offline. Jika CivilCraft disimpan untuk penggunaan offline, semuanya berfungsi, termasuk tapak contoh. Jika tidak, tetap bekerja di tab ini, tetapi jangan muat ulang sampai Anda kembali online; tanpa salinan tersimpan, {{ui:Buka tapak contoh}} gagal dengan pesan "Contoh tidak dapat dimuat".
:::

:::tip
Untuk penggunaan di lapangan, simpan CivilCraft untuk penggunaan offline dan bawa file titik Anda langsung di laptop. Proyek dan ekspor disimpan sebagai unduhan tanpa koneksi, sehingga Anda dapat mengimpor hasil pengukuran satu hari, memeriksa permukaan, dan menyimpan proyek di lokasi.
:::

Penyimpanan cloud belum tersedia, dan build desktop belum dirilis. Saat ini, file yang Anda simpan adalah satu-satunya salinan: simpan di tempat yang dicadangkan.

## Add-on yang dipakai file

Saat Anda menyimpan proyek yang memuat data dari add-on (centang **Peraturan bangunan**, atau sumber **Alamat ke tapak**), file mencatat add-on mana dan versi mana. Jika dibuka di komputer yang tidak memilikinya, bilah di atas denah memberitahukan hal itu dan menawarkan untuk menambahkannya dari daftar akun Anda. Catatan itu hanya catatan; file tetap terbuka dalam kedua kondisi.

## Urungkan dari Studio

Di dalam CadCraft Studio, setiap langkah yang Anda selesaikan di CivilCraft diberitahukan ke Studio, sehingga urungkan tingkat proyek di Studio dapat membatalkan langkah terakhir lintas aplikasi. Studio hanya membatalkan langkah ketika tumpukan urungkan CivilCraft sendiri persis seperti yang ditinggalkan langkah itu; setelah Anda membuka file lain, Studio melewati jendela ini.

## Menutup dengan perubahan yang belum disimpan

Saat proyek memiliki perubahan yang belum disimpan dan Anda menutup tab, memuat ulang, atau meninggalkan halaman, peramban menanyakan apakah Anda ingin pergi. Tampilan dan tulisannya milik peramban dan tidak dapat diubah oleh CivilCraft. {{ui:Baru}}, serta membuka proyek atau file LandXML, justru menanyakan di kotak **Perubahan yang belum disimpan** milik CivilCraft, dengan {{ui:Batal}}, {{ui:Jangan simpan}}, dan {{ui:Simpan salinan}}.
