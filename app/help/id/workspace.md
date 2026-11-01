---
title: Layar, bagian demi bagian
summary: Tur setiap bilah dan panel di CivilCraft menurut namanya di layar, dari bilah alat sampai bilah status.
keywords: antarmuka, layar, bilah alat, panel, properti, bilah status, tampilan profil, tata letak, tur, ui
from: 76272010
---

CivilCraft memiliki satu layar. Tidak ada tab dan tidak ada layout. Panel samping dapat dipindahkan, diambangkan, atau dijadikan jendela tersendiri: lihat [Menata panel dan memakai monitor kedua](common:arrange-panels). Dari atas ke bawah dan kiri ke kanan:

- **bilah aplikasi** (logo CadCraft, nama aplikasi, versi, Tentang, mode layar, Bantuan, Simpan untuk offline, Kertas dan Model)
- **bilah alat** dengan tujuh grup tombol
- **panel kiri**: Tapak, Titik, Permukaan, Tampilan, dan, setelah Anda mengimpor, layer GIS
- **denah** di tengah, dengan **tampilan profil** di bawahnya bila terbuka
- **panel kanan**: Properti dari apa yang dipilih
- **bilah status** di sepanjang bagian bawah

## Bilah aplikasi

Bilah tipis di paling atas milik situs CadCraft, bukan CivilCraft sendiri.

- Menu versi menunjukkan build mana yang Anda jalankan.
- {{ui:Tentang CivilCraft}} membuka halaman aplikasi di situs.
- {{ui:Layar penuh}} berganti antarmode layar: layar penuh, lalu layar penuh dengan bilah tersembunyi, lalu kembali normal. {{key:Ctrl+Shift+F}} melakukan hal yang sama di semua platform, termasuk Mac (di sana tombolnya Control, bukan Command). Dengan bilah tersembunyi, gerakkan penunjuk ke tepi atas untuk memunculkannya kembali.
- {{ui:Bantuan}} (atau {{key:F1}}) membuka bantuan ini di panel samping; {{key:F1}} atau {{key:Esc}} menutupnya.
- {{ui:Simpan untuk offline}} menyimpan CivilCraft di peramban ini sehingga terbuka tanpa koneksi; tombol lalu menampilkan {{ui:Siap offline}}. Lihat [File yang dapat Anda buka, simpan, dan ekspor](topic:files#online-and-offline).
- {{ui:Kertas}} dan {{ui:Model}} berpindah antara tema terang dan gelap. Denah dan profil mengikuti tema; PDF selalu tercetak di atas warna putih.

## Bilah alat

Setiap grup memiliki label kecil di atas tombolnya. Arahkan penunjuk ke tombol untuk melihat tooltip dan tombol pintasnya.

| Grup | Tombol | Fungsinya |
|---|---|---|
| File | {{ui:Baru}}, {{ui:Buka}}, {{ui:Simpan}} | Memulai dari awal, membuka file titik, LandXML, atau proyek, menyimpan proyek sebagai unduhan |
| Ekspor | {{ui:LandXML}}, {{ui:DXF}}, {{ui:DWG}}, {{ui:PDF}} | Menulis LandXML 1.2, DXF R12 atau DWG denah, atau mem-plot denah ke PDF |
| Permukaan | {{ui:Breakline}}, {{ui:Batas}} | Menggambar breakline melalui titik survei; menggambar batas luar |
| Rencana | {{ui:Alinyemen}}, {{ui:Pad}}, {{ui:Pipa}}, {{ui:Profil}} | Menggambar alinyemen, pad, lintasan pipa; menampilkan atau menyembunyikan tampilan profil |
| Edit | {{ui:Urungkan}}, {{ui:Ulangi}}, {{ui:Salin}}, {{ui:Tempel}}, {{ui:Lainnya}} | Mengurungkan, mengulangi, menyalin, dan menempel titik survei; {{ui:Lainnya}} memuat Potong, Tempel di tempat yang sama, Duplikat, Hapus, Pilih semua titik, dan Batalkan pilihan |
| GIS | {{ui:Koordinat}}, {{ui:Impor}}, {{ui:Ekspor}}, {{ui:Peta}} | Mengatur sistem koordinat, mengimpor dan mengekspor file GIS, menampilkan layer peta di bawah denah |
| Tampilan | {{ui:Pilih}}, {{ui:Paskan}}, {{ui:3D}} | Memilih dan memindahkan; zoom untuk menampilkan semuanya; menampilkan tapak dalam 3D ([Melihat tapak dalam 3D](topic:site-3d)) |

Alat gambar tetap tertekan selama aktif. Mengkliknya lagi, menekan {{key:Esc}}, atau menekan {{key:V}} kembali ke {{ui:Pilih}}. {{ui:Urungkan}}, {{ui:Ulangi}}, {{ui:Salin}}, dan item di {{ui:Lainnya}} berwarna abu-abu bila tidak dapat bekerja; tooltip menyebutkan alasannya (misalnya "Pilih titik survei dahulu"). Setiap tombol tercantum di [Referensi bilah alat](topic:toolbar).

Pada jendela yang sempit, bilah alat bergulir ke samping.

## Panel kiri

### Tapak

- **Nama**: nama proyek. Nama ini dipakai untuk setiap file yang Anda simpan atau ekspor dan dicetak pada strip judul PDF.
- **Satuan**: {{ui:Kaki AS}} atau {{ui:Meter}}. Ini menyatakan arti angka-angka. Mengubahnya **tidak** mengonversi koordinat; lihat [Satuan, stasiun, dan format angka](topic:units-and-stations).

### Titik

Bila kosong, panel memberi tahu cara membuka file titik. Bila ada titik, panel menampilkan nama file, jumlah titik dan berapa yang memiliki elevasi, lalu tabel **grup titik**: satu baris per kata pertama deskripsi (GRD, FL, TBS …), dengan jumlah dan pilihan **Permukaan**:

- {{ui:Titik}}: titik masuk ke permukaan (bawaan untuk setiap grup).
- {{ui:Breakline}}: titik grup digabungkan, menurut urutan nomor titik, menjadi satu breakline.
- {{ui:Dikecualikan}}: grup tidak menyentuh permukaan.

### Permukaan

Fakta tentang tanah asli: titik, segitiga, elevasi terendah dan tertinggi, elevasi rata-rata, luas 2D dan 3D, breakline, dan apakah ada batas. Di bawah fakta, kotak mencantumkan apa pun yang harus diperbaiki atau tidak dapat dilakukan pembangun permukaan. Lalu:

- **Tepi luar terpanjang**: 0 mempertahankan setiap segitiga luar; angka tertentu memangkas segitiga panjang yang tipis dari luar.
- Tautan yang muncul bila berlaku: {{ui:Buang batas}}, {{ui:Buang breakline gambar}} dan, untuk permukaan yang dibaca dari LandXML, {{ui:Bangun ulang permukaan dari titik}}.

### Tampilan

- **Permukaan**: {{ui:Tanah asli}} atau {{ui:Rencana (grading)}}. Yang kedua tersedia setelah pad atau koridor di-grading tanpa masalah.
- **Kontur setiap**, **Mayor setiap**, dan **Pita** (jumlah pita warna).
- Kotak centang: {{ui:Kontur}}, {{ui:Label kontur}}, {{ui:Segitiga}}, {{ui:Pita elevasi}}, {{ui:Panah kemiringan}}, {{ui:Titik}}, {{ui:Label titik}}, {{ui:Breakline}}, {{ui:Tepi permukaan}}, {{ui:Pipa}}.
- Legenda elevasi pita muncul ketika pita menyala.

Pengaturan tampilan disimpan bersama proyek tetapi bukan langkah urungkan: {{key:Mod+Z}} tidak pernah mengembalikan kotak centang.

## Denah

Denah menampilkan titik, permukaan, dan semua yang Anda rancang, dalam tampak atas dengan utara di atas. Roda mouse untuk zoom pada penunjuk, seret ruang kosong untuk menggeser. Daftar lengkap ada di [Tombol dan mouse](topic:keyboard).

- Pada proyek kosong, kotak berjudul **Mulai dengan titik survei** mencantumkan langkah pertama dan menawarkan {{ui:Buka tapak contoh}}.
- Selama alat gambar aktif, petunjuk di bagian atas denah menyatakan apa yang harus diklik dan cara menyelesaikan.
- Menyeret file di atas denah menampilkan "Letakkan file titik, LandXML, atau proyek".
- Hal yang dipilih disorot. Alinyemen atau pad yang dipilih menampilkan grip persegi pada PI atau sudutnya; bangunan yang dipilih menampilkan satu grip. Seret grip untuk memindahkannya.
- Titik survei yang dipilih memiliki cincin. {{key:Shift}} dan klik menambah atau menghapus satu titik; {{key:Shift}} dan seret menggambar kotak (atau, bila diseret mengelilinginya, laso) yang menambahkan titik di dalamnya. Lihat [Memilih, menyalin, dan menempel titik survei](topic:copy-paste-points).

## Tampilan profil

Tekan {{key:R}} atau klik {{ui:Profil}} untuk membukanya di bawah denah. Bilahnya memiliki:

- daftar alinyemen (aktif bila ada dua alinyemen atau lebih)
- {{ui:Tambah PVI}}: selama tertekan, klik di profil menambahkan PVI ({{key:I}} menyalakan dan mematikannya)
- pembacaan stasiun, tanah, elevasi rencana, kelandaian, dan galian atau timbunan di bawah penunjuk
- tombol tutup

Profil menampilkan tanah asli, profil rencana, kelandaian pada setiap tangen, stasiun dan elevasi setiap PVI, L dan K setiap lengkung vertikal beserta BVC dan EVC-nya, titik tertinggi dan terendah, dan eksagerasi vertikal. Profil selalu memaskan seluruh alinyemen: tidak dapat di-zoom atau digeser. Menggerakkan penunjuk di sepanjangnya menaruh titik pada alinyemen di denah.

## Panel kanan: Properti

Judulnya menyatakan apa yang ditampilkan.

- **Proyek** (tidak ada yang dipilih): alinyemen dan pad sebagai tautan, blok **Pekerjaan tanah**, dan blok **Jaringan pipa** dengan aturan dan masalahnya.
- **Alinyemen**: nama, stasiun awal, panjang, tabel PI, lengkung, tabel PVI dan fakta profil rencana, serta pengaturan **Koridor**.
- **Pad**: nama, elevasi, lereng galian dan timbunan, luas, fakta daylight, dan pekerjaan tanah.
- **Bangunan** atau **Pipa**: ukuran, rim, invert, kemiringan, selimut, dan masalah apa pun.
- **Titik** dan nomornya: koordinat, elevasi, deskripsi, dan grup titik (hanya-baca).

Kolom isian berlaku ketika Anda menekan {{key:Enter}} atau meninggalkan kolom. Nilai yang tidak diterima ditandai tidak valid dan tidak ada yang berubah.

## Bilah status

- **E** dan **N**: easting dan northing di bawah penunjuk.
- Elevasi **Tanah** di sana (dan **Grading** di tempat pad atau koridor mengubahnya), atau "Di luar permukaan".
- Alinyemen terdekat (atau yang dipilih) dengan **Sta** dan offset (**L** atau **R**) di bawah penunjuk.
- Di kanan, pesan: apa yang baru terjadi, atau mengapa sesuatu ditolak. Pesan hilang sendiri setelah beberapa detik.

## Dialog

- **Impor titik**: terbuka dengan setiap file titik. Lihat [Mengimpor titik survei](topic:import-points).
- **Plot denah ke PDF**: lihat [Plot denah ke PDF](topic:plot-pdf).
- **Perubahan yang belum disimpan**: bertanya sebelum {{ui:Baru}} atau membuka proyek atau file LandXML membuang pekerjaan yang belum disimpan. {{ui:Simpan salinan}} mengunduh proyek lebih dulu.

## Layar kecil

Hingga lebar 760 piksel, seperti pada ponsel, denah menguasai layar: bilah alat menjadi satu baris yang bergulir ke samping, dan panel terbuka sebagai lembar dari bilah di bagian bawah. {{ui:Alat}} menyembunyikan bilah alat dan {{ui:Pindah}} menaruhnya di bawah.
