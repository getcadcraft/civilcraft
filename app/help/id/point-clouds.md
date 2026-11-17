---
title: Awan titik dari drone atau pemindai
summary: Dengan add-on Point clouds, buka file LAS atau LAZ berisi jutaan titik, lihat seluruhnya, bersihkan, kelompokkan menjadi tanah, vegetasi, dan bangunan, lalu bangun tanah, kontur, dan volume darinya.
keywords: awan titik, las, laz, drone, fotogrametri, recap, lidar, pindai, tanah, klasifikasi, noise, timbunan, volume, galian dan timbunan, kontur, breakline, eye-dome, ortomosaik, ortho, drape, layer peta, ekspor las, ekspor laz, kompres
from: e4a4901f
---

Kebanyakan orang tidak memerlukan ini, sehingga fitur ini berupa add-on. Aktifkan {{ui:Point clouds}} di Pengaturan › Add-on; tab {{ui:Point clouds}} akan muncul di panel kanan. File dibaca di peramban Anda dan dipotong menjadi ubin yang disimpan di penyimpanan peramban Anda sendiri (atau folder yang Anda pilih). **Tidak ada yang diunggah.**

:::warning
Semua yang dilaporkan tab ini adalah angka dari data Anda, bukan sertifikat. Fitur ini diuji pada lokasi rekaan, belum pada survei drone sungguhan: baca hasil awal dengan cermat dan beri tahu kami apa yang Anda temukan. Profesional terdaftar yang memutuskan nilai tanah, kontur, dan volumenya.
:::

## Buka cloud

Di bawah {{ui:Open a cloud}} pilih file LAS atau LAZ. Tab menunjukkan jumlah titik, sistem koordinat dan satuannya, serta ruang yang dibutuhkan untuk membangun; tekan {{ui:Build the cloud}}. Pembangunan dapat dihentikan dan dilanjutkan dengan {{ui:Resume}} (pilih file yang sama lagi). File tidak pernah diubah. File 100 juta titik terbangun dalam hitungan menit di workstation dan membutuhkan ruang kira-kira sebesar filenya.

Di bawah {{ui:Cloud di komputer ini}} Anda membuka atau menghapus cloud. {{ui:Simpan cloud di folder…}} (Chrome, Edge, dan aplikasi Studio) menyimpan ubin di folder yang Anda pilih, misalnya folder cloud CadCraft di Dokumen, sehingga cloud 10 GB tidak harus muat di penyimpanan peramban; cloud yang sudah dibangun sebelumnya tetap di tempatnya. Peramban meminta izin lagi setelah dimulai ulang: tekan {{ui:Gunakan folder … lagi}}.

## Lihat tampilannya

{{ui:Lihat dalam 3D}} menggambar cloud dari ubin kasar dan menyempurnakannya saat Anda mendekat, tidak pernah lebih dari {{ui:Titik terbanyak yang digambar}} sekaligus (2,5 juta; 500 ribu di ponsel). Beri warna menurut warna file, tinggi, kelas, intensitas, atau residual. {{ui:Pencahayaan eye-dome}} memberi bayangan pada tepi berdasarkan kedalaman sehingga bentuk terbaca tanpa normal (nonaktif di ponsel); {{ui:Titik mengecil sesuai jarak}} membuat titik jauh lebih kecil dan titik dekat lebih besar; {{ui:Ukuran titik}} mengatur ukurannya. Denah menampilkan cloud sebagai raster di bawah gambar Anda dan **disempurnakan saat Anda memperbesar** ke sebagian cloud.

## Bersihkan

Di bawah {{ui:Bersihkan}} gambar laso, kotak, atau poligon di denah (atau di 3D dari tampilan atas: di 3D garis batas diambil lurus ke bawah, jadi hanya tepat dari atas). Tab menampilkan berapa titik berada di dalam **sebelum** Anda menerapkan: {{ui:Hapus titik ini}}, {{ui:Ubah kelasnya}}, {{ui:Pulihkan titik yang dihapus}}, atau {{ui:Potong ke batas ini}}. {{ui:Urungkan}} dan {{ui:Ulangi}} menelusuri log edit; file itu sendiri tidak pernah diubah. {{ui:Filter noise…}} menandai titik liar sebagai titik rendah (kelas 7) atau noise tinggi (kelas 18).

## Kelompokkan

{{ui:Cari tanah}} bekerja ubin demi ubin dan menandai tanah (kelas 2) dan titik rendah; toleransinya 0,15 m, atau 0,08 m dengan sakelar kelas survei. Ia melaporkan sambungan ubin yang tidak cocok. {{ui:Klasifikasikan vegetasi dan bangunan}} kemudian menandai vegetasi rendah, sedang, dan tinggi serta bangunan dari tinggi di atas tanah dan seberapa datar sekitarnya. Tidak ada machine learning, sehingga gudang beratap datar di bawah pohon bisa keliru: periksa.

## Tanah, kontur, breakline

{{ui:Bangun tanah}} membuat tanah eksisting dari titik tanah dan menambahkannya ke proyek sama seperti impor LAS (satu langkah urungkan). Lalu ia membandingkan titik dengannya: rata-rata, RMS, persentil ke-95, bagian yang berada dalam toleransi, dan sepuluh tempat yang paling berbeda, masing-masing dengan {{ui:Pergi ke sana}}. Beri warna menurut {{ui:Residual}} untuk menunjukkan di mana tanah dan cloud tidak sesuai.

**Breakline** (tepi trotoar, parit, atau puncak tebing) dipilih pada cloud: {{ui:Pilih breakline pada cloud}} di tampilan 3D mengambil titik tergambar terdekat pada setiap klik, dan {{ui:Pilih breakline di denah}} mengambil titik cloud terdekat (tanah lebih dulu) di bawah setiap klik; klik dua kali atau Enter untuk mengakhiri garis. {{ui:Bangun tanah}} berikutnya akan menggunakannya. {{ui:Tampilkan kontur}} menggambar kontur di atas cloud dalam gambar kecil dan mengatur interval proyek.

## Volume

{{ui:Volume timbunan…}} menghitung volume permukaan di atas alas di dalam batas yang Anda gambar. Gambar batas di tanah datar mengelilingi timbunan dan pilih alasnya: titik batas terendah, bidang, alas lengkung halus, permukaan melalui batas, atau elevasi datar yang Anda ketik. Di tanah miring atau melengkung gunakan bidang atau alas lengkung; titik terendah akan terbaca terlalu tinggi. Titik batas yang lebih tinggi dari yang lain (pohon di garis batas) dikeluarkan dari alas. {{ui:Antar-penerbangan}} memberikan galian dan timbunan antara dua cloud. Keduanya dapat disimpan sebagai CSV.

## Ortomosaik

Di bawah {{ui:Ortomosaik (gambar dari atas)}} pilih ortomosaik drone beserta file world dan `.prj`-nya jika ada: GeoTIFF, atau PNG atau JPEG. Ia menjadi **layer peta** proyek, sehingga denah menampilkannya di bawah gambar Anda, dan tampilan 3D (warna {{ui:Peta}}) melukisnya di atas tanah yang sudah Anda bangun, jadi {{ui:Bangun tanah}} dulu. Tab menyatakan berapa bagian cloud yang tercakup gambar, dan memberi peringatan jika tidak mencakup apa pun: penyebab umumnya adalah sistem koordinat yang berbeda, jadi berikan file `.prj` bersamanya. Jika tidak ada `.prj`, program menanyakan di mana koordinatnya. Gambar disimpan di dalam file proyek; GeoTIFF di atas 200 MB ditolak dan mosaik yang sangat besar dikurangi menjadi 16 megapiksel, jadi untuk survei besar potong mosaik ke lokasi terlebih dahulu.

## Ekspor

{{ui:Ekspor}} menulis cloud yang sudah dibersihkan dan diklasifikasikan sebagai file baru (semua titik, kelas yang bersih, atau hanya tanah). Di bawah {{ui:Jenis file}} pilih:

- **LAS 1.4 (tidak dikompresi)**: format titik 6, atau 7 dengan warna.
- **LAZ (dikompresi)**: titik yang sama dikompresi tanpa kehilangan, sehingga setiap titik kembali persis. Ditulis sebagai format titik 0, atau 2 dengan warna, dalam file LAS 1.4. Pada lokasi rekaan 300 m, LAZ berukuran sekitar seperlima file LAS 1.4. Format LAZ 0 dan 2 hanya memuat kelas 0 sampai 31: titik dengan kelas lebih tinggi ditolak dengan pesan, jadi ekspor cloud itu sebagai LAS 1.4.

LAZ ditulis oleh kompresor milik CadCraft sendiri, dibuat dari spesifikasi LAZ yang dipublikasikan. Kami sudah memeriksa bahwa pembaca kami sendiri dan dua pembaca LAZ independen (laz-perf, yang digunakan aplikasi untuk membuka file LAZ, dan laspy dengan lazrs) membaca kembali setiap titik secara persis, dan bahwa file LAZ yang dibuat laspy menghasilkan keluaran yang identik byte demi byte saat titiknya kami tulis ulang. Program lain belum dicoba, jadi jika ada yang tidak dapat membuka file, beri tahu kami yang mana.

Jika peramban dapat menulis file secara bertahap, Anda memilih file terlebih dahulu dan cloud yang sangat besar ditulis ke file itu satu ubin per waktu, alih-alih dikumpulkan di memori; jika tidak, file dikumpulkan dan diunduh, yang masih wajar hingga beberapa ratus megabita.

## Yang tidak dilakukannya

Hanya membaca LAS dan LAZ (E57, PLY, dan PCD belum terhubung ke tab ini, dan beberapa file dari satu penerbangan tidak digabungkan), tidak memproyeksikan ulang cloud (sistem dan satuan proyek, yaitu meter, diasumsikan), tidak membaca file RCP atau RCS milik Autodesk, tidak membuat permukaan dari foto, dan tidak menemukan tiang, tepi trotoar, atau pipa dengan sendirinya.
