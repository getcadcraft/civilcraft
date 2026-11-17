---
title: Pemecahan masalah
summary: Gejala, penyebab, dan perbaikan untuk masalah yang sering ditemui di CivilCraft, beserta pesan persis yang ditampilkan aplikasi.
keywords: masalah, kesalahan, tidak berfungsi, perbaiki, bantuan, pesan, pemecahan masalah, ditolak, hilang, salah, tertukar, kontur hilang
from: a9f7dedc
---

Pesan muncul di bilah status di kanan bawah, di kotak di panel kiri dan kanan, serta di dialog. Pesan dikutip di sini seperti yang ditampilkan aplikasi.

## Membuka file

**"File itu lebih dari 200 MB; CivilCraft belum membuka file sebesar itu."**
Pisahkan file titik, atau kurangi data sebelum membukanya.

**"Tidak dapat membuka site.json: Ini bukan file proyek CivilCraft."**
File berakhiran `.json` atau diawali `{`, tetapi bukan proyek CivilCraft. File titik tidak boleh diawali `{`.

**"Tidak dapat membuka … File proyek ini berasal dari CivilCraft yang lebih baru (versi 2)."**
Proyek disimpan oleh build yang lebih baru. Buka di sana, atau ekspor LandXML dari situ.

**"Tidak dapat membuka … Ini XML tetapi bukan LandXML (elemen akarnya adalah <…>)."**
File ini adalah jenis XML lain. Ekspor LandXML dari program lainnya.

**"… tidak memiliki titik, permukaan TIN, atau alinyemen yang dapat dibaca CivilCraft."**
Semua isi file dilewati CivilCraft (misalnya hanya permukaan grid, atau hanya alinyemen spiral). Sisa pesan menjelaskan apa yang ada. Lihat [LandXML: apa yang dibaca dan ditulis](topic:landxml-reference).

**"Contoh tidak dapat dimuat: …"**
{{ui:Buka situs contoh}} membaca file dari situs CadCraft. Tanpa koneksi, ini hanya berfungsi jika CivilCraft disimpan untuk offline (tombol di bilah aplikasi menampilkan {{ui:Siap offline}}). Masuk online, klik {{ui:Simpan untuk offline}}, dan setelah itu berfungsi offline. Lihat [Offline](common:offline).

**{{ui:Simpan untuk offline}} menampilkan {{ui:Tidak dapat menyimpan}}.**
Beberapa file tidak terunduh. Periksa koneksi dan klik tombol itu lagi.

**{{ui:Simpan untuk offline}} menampilkan {{ui:Offline tidak tersedia}}.**
Jendela peramban ini tidak dapat menyimpan salinan offline, biasanya karena ini jendela privat atau komputernya dikelola. Buka CivilCraft di jendela biasa.

**Offline, aplikasi sama sekali tidak terbuka.**
Aplikasi belum disimpan untuk offline di peramban ini, atau peramban menghapus data situsnya (Safari melakukan ini untuk situs yang tidak dikunjungi beberapa minggu). Masuk online, buka CivilCraft, dan klik {{ui:Simpan untuk offline}}.

**Salinan offline adalah build yang lebih lama.**
Klik {{ui:Siap offline}}, lalu {{ui:Simpan lagi (ambil versi terbaru)}} saat online.

**File tampak abu-abu di kotak buka.**
Kotak hanya mendaftar file titik, LandXML, dan file proyek berdasarkan akhirannya. Seret file ke denah sebagai gantinya, atau ganti namanya menjadi `.txt`.

## Mengimpor titik

**"Tidak ada titik yang dapat dibaca dari file ini."**
Pilih urutan kolom di **Kolom** secara manual. Jika tidak berhasil, buka file di editor teks dan periksa bahwa satu titik ada per baris dan berisi angka.

**Situs tampak terbalik, berputar, atau memanjang menjadi satu garis.**
Northing dan easting tertukar. Ringkasan menyebut "ditebak dari jumlah kolom". Pilih PENZD alih-alih PNEZD (atau sebaliknya) di **Kolom**, atau impor ulang.

**Titik jauh dari yang lain, dan denah diperkecil hingga menjadi satu titik.**
Ada salah ketik pada koordinat di satu baris, atau file mencampur sistem koordinat. Temukan titiknya (klik untuk melihat nomornya) dan perbaiki file.

**Baris yang tercantum di bawah "Baris tidak dibaca".**
Lihat tabel di [Impor titik survei](topic:import-points#rows-that-are-not-read).

**Titik lama saya hilang.**
Mengimpor file titik menggantikan semua titik dan menghapus riwayat urungkan. Buka proyek yang sudah disimpan untuk mengembalikannya.

## Permukaan

**"Permukaan: belum dibuat" dengan kotak merah.**
Kotak menjelaskan alasannya: "Permukaan membutuhkan minimal tiga titik dengan elevasi.", "Titik-titik semuanya berada pada satu garis: tidak ada segitiga.", "Tidak ada titik dengan elevasi.", "Batas tidak tumpang tindih dengan titik." atau "Tidak ada segitiga yang tersisa di dalam batas." Periksa urutan kolom, grup titik (apakah ada yang {{ui:Dikecualikan}}?), dan batasnya.

**Kontur memotong lurus melintasi parit atau punggungan.**
Garis itu bukan breakline. Atur grupnya ke {{ui:Breakline}}, atau gambar dengan alat {{ui:Breakline}}. Lihat [Bangun dan perhalus permukaan](topic:build-surface).

**Grup breakline menggambar zig-zag.**
Grup berisi lebih dari satu garis, atau titiknya tidak bernomor sepanjang garis. Atur grup kembali ke {{ui:Titik}} dan gambar setiap garis dengan alat {{ui:Breakline}}.

**Segitiga panjang dan tipis di sepanjang bagian luar.**
Gambar batas ({{key:O}}) atau atur **Tepi luar terpanjang**.

**Tidak ada kontur sama sekali, meskipun permukaan sudah dibangun.**
Entah {{ui:Kontur}} dimatikan di bawah **Tampilan**, atau interval begitu kecil sehingga akan ada lebih dari 2.000 level kontur. Pilih interval yang lebih besar.

**Breakline atau batas tidak mengubah apa pun.**
Permukaan berasal dari LandXML ("Permukaan (dari LandXML)"). Permukaan itu digunakan apa adanya. Klik {{ui:Bangun ulang permukaan dari titik}} untuk membangunnya dari titik sebagai gantinya.

**"Belum ada permukaan: buka titik survei terlebih dahulu."**
Breakline, batas, dan pad memerlukan permukaan tanah yang sudah ada. Impor titik terlebih dahulu.

**"Klik titik survei dengan elevasi: breakline mengambil elevasi titik-titik."**
Alat {{ui:Breakline}} hanya memilih titik survei. Perbesar tampilan dan klik titik (kotak oranye menunjukkan titik yang akan diambil).

## Menggambar

**Titik terakhir saya hilang saat saya klik dua kali untuk menyelesaikan.**
Pada build ini, klik dua kali menyelesaikan alinyemen, pad, breakline, atau batas, tetapi membuang titik tempat Anda mengklik dua kali. Klik titik terakhir sekali, lalu tekan {{key:Enter}}. Gunakan {{key:Mod+Z}} jika sudah terjadi, lalu gambar ulang.

**Saya tidak dapat menyelesaikan gambar di tablet.**
Menyelesaikan memerlukan {{key:Enter}}; belum ada tombol di layar. Pasang keyboard. Lihat [Mouse, trackpad, dan sentuh](topic:keyboard#mouse-trackpad-and-touch).

**Menyeret untuk menempatkan titik justru menggeser tampilan.**
Seretan lebih dari beberapa piksel menggeser denah di semua alat. Klik tanpa menggerakkan.

**"Alinyemen memerlukan minimal dua titik." / "Pad memerlukan minimal tiga sudut." / "Jalur pipa memerlukan minimal dua bangunan."**
Anda menekan {{key:Enter}} terlalu cepat. Gambar dibuang; mulai lagi.

**Tombol seperti A atau G tidak berfungsi.**
Kotak teks atau daftar di panel masih memegang fokus, sehingga huruf masuk ke sana. Klik denah sekali, lalu tekan tombolnya. Di Mac, tombol hapus adalah Backspace bagi peramban: gunakan Fn dan delete untuk menghapus pilihan.

## Alinyemen dan profil

**"Lengkung di PI 2 dan PI 3 tumpang tindih: … Gunakan radius yang lebih kecil."**
Dua lengkung memerlukan tangen lebih banyak daripada jarak di antara PI-nya. Kurangi salah satu atau kedua radius di tabel PI, atau geser PI menjauh.

**"PI 3 berbalik lurus ke belakang; tidak dapat menerima lengkung."**
Alinyemen kembali ke dirinya sendiri di PI itu. Pindahkan atau hapus PI.

**"Alinyemen ini tidak memiliki tanah di bawahnya untuk dimulai."**
Alinyemen berada di luar permukaan. Pindahkan ke permukaan, atau tambahkan PVI dengan mengklik saat {{ui:Tambah PVI}} aktif.

**"Lengkung vertikal di PVI 3 (L = …) dimulai sebelum lengkung atau PVI sebelumnya berakhir." / "… melewati PVI berikutnya."**
Perpendek panjang lengkung atau geser PVI menjauh.

**"Sudah ada PVI di …"**
Sudah ada PVI di stasiun itu. Klik di tempat lain, atau seret PVI yang ada.

**Tampilan profil kosong: "Gambar alinyemen untuk melihat profilnya."**
Tidak ada alinyemen, atau alinyemen yang dipilih memiliki kesalahan.

## Koridor dan pad

**"Koridor memerlukan profil desain tanpa kesalahan."**
Mulai profil desain ({{ui:Mulai dari tanah}}) dan perbaiki tumpang tindih lengkung apa pun.

**"… lereng sisi keluar dari permukaan sebelum bertemu tanah." / "… garis lereng keluar dari permukaan sebelum bertemu dengannya …"**
Penggradingan mencapai tepi permukaan sebelum bertemu tanah. Geser desain masuk dari tepi, atau dekatkan ke tanah. Pad baru yang digambar sebagian di luar permukaan mungkin mulai pada elevasi 0: ketik elevasi yang sebenarnya.

**"Garis daylight koridor berpotongan …" / "Garis daylight berpotongan dengan dirinya sendiri …"**
Lereng dari sisi yang berbeda saling bertemu: lengkung yang ketat, pad yang sempit, galian dalam, atau timbunan tinggi. Gunakan radius yang lebih besar, rakitan yang lebih sempit, pad yang lebih lebar, atau lereng yang lebih curam.

**"Belum ada volume: pad harus digrading tanpa masalah."**
Perbaiki masalah yang tercantum di kotak merah di atasnya.

**{{ui:Rencana (grading)}} tampak abu-abu.**
Belum ada pad atau koridor yang digrading.

## Pipa

**"P2 belum memiliki invert."**
Klik {{ui:Atur invert-nya dari aturan}} atau ketik invert-nya.

**"P1: tidak ada tanah di S1 untuk dimulai."**
Bangunan hulu berada di luar permukaan dan tidak memiliki rim. Ketik rim untuknya.

**Setiap pipa ditandai setelah saya memindahkan bangunan.**
Memindahkan bangunan tidak mengubah invert. Klik {{ui:Atur setiap invert dari aturan}}.

Semua pesan jaringan dijelaskan di [Susun jaringan pipa gravitasi](topic:pipe-network#read-and-fix-problems).

## Menyimpan dan mengekspor

**"Belum ada yang diekspor." / "Belum ada yang diplot."**
Proyek masih kosong. Impor titik terlebih dahulu.

**Saya tidak dapat menemukan file yang disimpan.**
File ada di unduhan peramban (biasanya folder Downloads). Lihat [File yang dapat dibuka, disimpan, dan diekspor](topic:files#where-the-files-go).

**Skala PDF salah di atas kertas.**
Cetak pada 100% atau ukuran sebenarnya, bukan "sesuaikan dengan halaman".

**Tanda tanya di teks PDF.**
Nama atau deskripsi memakai karakter di luar set Eropa Barat. Pesan status menghitungnya. Ganti nama dengan karakter biasa.

**Plot terpotong di tepinya.**
Skalanya terlalu besar untuk lembar. Pilih skala yang bertanda "(fits)", lembar yang lebih besar, atau {{ui:Yang ada di layar}}.

**{{key:Mod+P}} membuka dialog cetak peramban.**
Halaman tidak memegang fokus. Tutup dialog, klik denah, lalu tekan {{key:Mod+P}} lagi, atau klik {{ui:PDF}}.

## Aplikasi itu sendiri

**Layar kosong atau bilah alat tidak melakukan apa-apa.**
Gunakan versi terbaru Chrome, Edge, Firefox, atau Safari, lalu muat ulang. Lihat [Peramban](common:browsers).

**Aplikasi lambat dengan file titik yang besar.**
Matikan {{ui:Segitiga}}, {{ui:Label titik}}, dan {{ui:Pita elevasi}}, dan gunakan interval kontur yang lebih besar. Permukaan yang sangat besar membutuhkan waktu untuk dibangun ulang setelah setiap perubahan.

**Peramban bertanya "Tinggalkan situs?"**
Proyek memiliki perubahan yang belum disimpan. Tetap di sini, simpan dengan {{key:Mod+S}}, lalu tinggalkan.
