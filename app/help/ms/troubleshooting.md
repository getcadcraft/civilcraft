---
title: Penyelesaian masalah
summary: Gejala, punca dan penyelesaian bagi masalah yang dihadapi dalam CivilCraft, dengan mesej tepat yang dipaparkan oleh aplikasi.
keywords: masalah, ralat, tidak berfungsi, betulkan, bantuan, mesej, selesaikan masalah, ditolak, hilang, salah, tertukar, kontur hilang
from: a9f7dedc
---

Mesej dipaparkan dalam bar status di kanan bawah, dalam kotak di panel kiri dan kanan, serta dalam kotak dialog. Ia dipetik di sini sebagaimana aplikasi memaparkannya.

## Membuka fail

**"Fail itu melebihi 200 MB; CivilCraft belum membuka fail sebesar itu."**
Bahagikan fail titik, atau kurangkan data sebelum membukanya.

**"Tidak dapat membuka site.json: Ini bukan fail projek CivilCraft."**
Fail itu berakhir dengan `.json` atau bermula dengan `{` tetapi bukan projek CivilCraft. Fail titik tidak boleh bermula dengan `{`.

**"Tidak dapat membuka … Fail projek ini daripada CivilCraft yang lebih baharu (versi 2)."**
Projek itu disimpan oleh binaan yang lebih baharu. Buka di sana, atau eksport LandXML daripadanya.

**"Tidak dapat membuka … Ini XML tetapi bukan LandXML (elemen akarnya ialah <…>)."**
Fail itu ialah jenis XML yang lain. Eksport LandXML daripada program lain.

**"… tidak mempunyai titik, permukaan TIN atau penjajaran yang boleh dibaca oleh CivilCraft."**
Semua kandungan fail itu ialah sesuatu yang CivilCraft langkau (contohnya hanya permukaan grid, atau hanya penjajaran spiral). Bahagian lain mesej itu menyatakan apa yang ada. Lihat [LandXML: apa yang dibaca dan ditulis](topic:landxml-reference).

**"Sampel tidak dapat dimuatkan: …"**
{{ui:Buka tapak sampel}} membaca fail daripada laman CadCraft. Tanpa sambungan ia hanya berfungsi jika CivilCraft disimpan untuk kegunaan luar talian (butang bar aplikasi memaparkan {{ui:Sedia untuk luar talian}}). Pergi ke dalam talian, klik {{ui:Simpan untuk luar talian}}, dan selepas itu ia berfungsi di luar talian. Lihat [Luar talian](common:offline).

**{{ui:Simpan untuk luar talian}} memaparkan {{ui:Tidak dapat menyimpan}}.**
Ada fail yang tidak dimuat turun. Semak sambungan dan klik butang itu sekali lagi.

**{{ui:Simpan untuk luar talian}} memaparkan {{ui:Luar talian tidak tersedia}}.**
Tetingkap pelayar ini tidak dapat menyimpan salinan luar talian, biasanya kerana ia tetingkap persendirian atau komputer diurus. Buka CivilCraft dalam tetingkap biasa.

**Di luar talian, aplikasi tidak dibuka langsung.**
Ia tidak disimpan untuk kegunaan luar talian dalam pelayar ini, atau pelayar telah memadam data laman itu (Safari berbuat demikian untuk laman yang tidak dilawati beberapa minggu). Pergi ke dalam talian, buka CivilCraft dan klik {{ui:Simpan untuk luar talian}}.

**Salinan luar talian ialah binaan yang lebih lama.**
Klik {{ui:Sedia untuk luar talian}}, kemudian {{ui:Simpan semula (dapatkan versi terkini)}} semasa dalam talian.

**Fail berwarna kelabu dalam kotak buka.**
Kotak itu hanya menyenaraikan fail titik, LandXML dan fail projek mengikut sambungannya. Seret fail itu ke atas pelan, atau namakan semula kepada `.txt`.

## Mengimport titik

**"Tiada titik boleh dibaca daripada fail ini."**
Pilih susunan lajur dalam **Lajur** secara manual. Jika tiada yang berfungsi, buka fail dalam editor teks dan semak sama ada ia ialah satu titik setiap baris dengan nombor di dalamnya.

**Tapak kelihatan dicerminkan, diputar atau direntang menjadi satu garis.**
Utara dan timur tertukar. Ringkasan menyatakan "dianggarkan daripada bilangan lajur". Pilih PENZD dan bukannya PNEZD (atau sebaliknya) dalam **Lajur**, atau import semula.

**Titik jauh daripada yang lain, dan pelan dizum keluar kepada satu titik.**
Ada salah taip dalam koordinat satu baris, atau fail mencampur sistem koordinat. Cari titik itu (klik untuk melihat nombornya) dan betulkan fail.

**Baris disenaraikan di bawah "Baris tidak dibaca".**
Lihat jadual dalam [Import titik ukur](topic:import-points#rows-that-are-not-read).

**Titik lama saya hilang.**
Mengimport fail titik menggantikan semua titik dan mengosongkan buat asal. Buka projek yang disimpan untuk mendapatkannya semula.

## Permukaan

**"Permukaan: Tidak dibina" dengan kotak merah.**
Kotak itu menyatakan sebabnya: "Permukaan memerlukan sekurang-kurangnya tiga titik dengan ketinggian.", "Semua titik berada pada satu garis: tiada segi tiga.", "Tiada titik dengan ketinggian.", "Sempadan tidak bertindih dengan titik." atau "Tiada segi tiga yang tinggal di dalam sempadan." Semak susunan lajur, kumpulan titik (adakah ia {{ui:Ditinggalkan}}?), dan sempadan.

**Kontur memotong terus merentasi parit atau rabung.**
Garis itu bukan garis putus. Tetapkan kumpulannya kepada {{ui:Garis putus}}, atau lukiskannya dengan alat {{ui:Garis putus}}. Lihat [Bina dan perhalusi permukaan](topic:build-surface).

**Kumpulan garis putus melukis zig-zag.**
Kumpulan itu mengandungi lebih daripada satu garis, atau titiknya tidak dinomborkan sepanjang garis. Tetapkan semula kumpulan kepada {{ui:Titik}} dan lukis setiap garis dengan alat {{ui:Garis putus}}.

**Segi tiga panjang dan nipis di sepanjang luar.**
Lukis sempadan ({{key:O}}) atau tetapkan **Tepi luar terpanjang**.

**Tiada kontur langsung, walaupun permukaan telah dibina.**
Sama ada {{ui:Kontur}} dimatikan di bawah **Paparan**, atau sela terlalu kecil sehingga akan ada lebih daripada 2,000 aras kontur. Pilih sela yang lebih besar.

**Garis putus atau sempadan tidak mengubah apa-apa.**
Permukaan itu datang daripada LandXML ("Permukaan (daripada LandXML)"). Ia digunakan sebagaimana adanya. Klik {{ui:Bina semula permukaan daripada titik}} untuk membina daripada titik.

**"Belum ada permukaan: buka titik ukur dahulu."**
Garis putus, sempadan dan pelantar memerlukan permukaan tanah sedia ada. Import titik dahulu.

**"Klik titik ukur dengan ketinggian: garis putus mengambil ketinggian titik."**
Alat {{ui:Garis putus}} hanya memilih titik ukur. Zum masuk dan klik pada satu titik (kotak oren menunjukkan titik yang akan diambil).

## Melukis

**Titik terakhir saya hilang apabila saya klik dua kali untuk selesai.**
Dalam binaan ini, klik dua kali menyelesaikan penjajaran, pelantar, garis putus atau sempadan tetapi membuang titik yang anda klik dua kali. Klik titik terakhir sekali dan tekan {{key:Enter}}. Guna {{key:Mod+Z}} jika ia sudah berlaku, kemudian lukis semula.

**Saya tidak boleh menyelesaikan lukisan pada tablet.**
Penyelesaian memerlukan {{key:Enter}}; belum ada butang pada skrin. Sambungkan papan kekunci. Lihat [Tetikus, pad sentuh dan sentuh](topic:keyboard#mouse-trackpad-and-touch).

**Menyeret untuk meletakkan titik sebaliknya menggerakkan pandangan.**
Seretan lebih daripada beberapa piksel menggerakkan pelan dalam setiap alat. Klik tanpa bergerak.

**"Penjajaran memerlukan sekurang-kurangnya dua titik." / "Pelantar memerlukan sekurang-kurangnya tiga bucu." / "Satu larian paip memerlukan sekurang-kurangnya dua struktur."**
Anda menekan {{key:Enter}} terlalu awal. Lukisan itu dibuang; mulakan semula.

**Kekunci seperti A atau G tidak melakukan apa-apa.**
Kotak teks atau senarai dalam panel masih mempunyai fokus, jadi huruf itu pergi ke situ. Klik pelan sekali, kemudian tekan kekunci itu. Pada Mac, kekunci padam ialah Backspace kepada pelayar: guna Fn dan Delete untuk memadam pilihan.

## Penjajaran dan profil

**"Lengkung di PI 2 dan PI 3 bertindih: … Guna jejari yang lebih kecil."**
Dua lengkung memerlukan lebih tangen daripada yang ada antara PI mereka. Kurangkan satu atau kedua-dua jejari dalam jadual PI, atau alihkan PI supaya berjauhan.

**"PI 3 berpatah balik serta-merta; ia tidak boleh menerima lengkung."**
Penjajaran itu berpatah balik pada PI tersebut. Alihkan atau buang PI itu.

**"Penjajaran ini tidak mempunyai tanah di bawahnya untuk bermula."**
Penjajaran berada di luar permukaan. Alihkannya ke atas permukaan, atau tambah PVI dengan mengklik apabila {{ui:Tambah PVI}} dihidupkan.

**"Lengkung menegak di PVI 3 (L = …) bermula sebelum lengkung atau PVI sebelumnya berakhir." / "… melepasi PVI seterusnya."**
Pendekkan panjang lengkung atau alihkan PVI supaya berjauhan.

**"Sudah ada PVI di …"**
PVI wujud di stesen itu. Klik di tempat lain, atau seret PVI yang sedia ada.

**Pandangan profil kosong: "Lukis penjajaran untuk melihat profilnya."**
Tiada penjajaran, atau penjajaran yang dipilih mempunyai ralat.

## Koridor dan pelantar

**"Koridor memerlukan profil reka bentuk tanpa ralat."**
Mulakan profil reka bentuk ({{ui:Mula dari tanah sedia ada}}) dan betulkan sebarang pertindihan lengkung.

**"… cerun sisi terkeluar daripada permukaan sebelum bertemu tanah." / "… garis cerun terkeluar daripada permukaan sebelum bertemu dengannya …"**
Perataan mencapai tepi permukaan sebelum bertemu tanah. Alihkan reka bentuk ke dalam dari tepi, atau dekatkannya ke tanah. Pelantar baharu yang dilukis sebahagiannya di luar permukaan mungkin bermula pada aras 0: taip ketinggian sebenar.

**"Garisan persilangan cerun koridor bersilang …" / "Garisan persilangan cerun bersilang dengan dirinya sendiri …"**
Cerun dari sisi yang berbeza bertembung: lengkung ketat, pelantar sempit, potongan dalam atau tambakan tinggi. Guna jejari yang lebih besar, susunan yang lebih sempit, pelantar yang lebih lebar atau cerun yang lebih curam.

**"Belum ada isipadu: pelantar perlu diratakan tanpa masalah."**
Betulkan masalah yang disenaraikan dalam kotak merah di atasnya.

**{{ui:Diratakan (dicadangkan)}} berwarna kelabu.**
Belum ada pelantar atau koridor yang diratakan.

## Paip

**"P2 belum mempunyai invert."**
Klik {{ui:Tetapkan inverts daripada peraturan}} atau taip inverts.

**"P1: tiada tanah di S1 untuk bermula."**
Struktur hulu berada di luar permukaan dan tidak mempunyai bibir. Taip bibir untuknya.

**Setiap paip ditandai selepas saya mengalihkan struktur.**
Mengalihkan struktur tidak mengubah inverts. Klik {{ui:Tetapkan setiap invert daripada peraturan}}.

Semua mesej rangkaian diterangkan dalam [Susun atur rangkaian paip graviti](topic:pipe-network#read-and-fix-problems).

## Menyimpan dan mengeksport

**"Tiada apa-apa untuk dieksport lagi." / "Tiada apa-apa untuk diplot lagi."**
Projek kosong. Import titik dahulu.

**Saya tidak dapat mencari fail yang disimpan.**
Ia berada dalam muat turun pelayar (biasanya folder Muat Turun). Lihat [Fail yang boleh dibuka, disimpan dan dieksport](topic:files#where-the-files-go).

**Skala PDF salah apabila dicetak.**
Cetak pada 100% atau saiz sebenar, bukan "muat ke halaman".

**Tanda tanya dalam teks PDF.**
Nama atau huraian menggunakan aksara di luar set Eropah Barat. Mesej status mengira aksara tersebut. Namakan semula dengan aksara biasa.

**Pelan terpotong di tepi.**
Skala terlalu besar untuk helaian. Pilih skala yang ditanda "(muat)", helaian yang lebih besar, atau {{ui:Apa yang ada pada skrin}}.

**{{key:Mod+P}} membuka dialog cetak pelayar.**
Halaman tidak mempunyai fokus. Tutup dialog, klik pelan, dan tekan {{key:Mod+P}} sekali lagi, atau klik {{ui:PDF}}.

## Aplikasi itu sendiri

**Skrin kosong atau bar alat tidak berfungsi.**
Guna versi terkini Chrome, Edge, Firefox atau Safari, dan muat semula. Lihat [Pelayar](common:browsers).

**Aplikasi perlahan dengan fail titik yang besar.**
Matikan {{ui:Segi tiga}}, {{ui:Label titik}} dan {{ui:Jalur aras}}, dan guna sela kontur yang lebih besar. Permukaan yang sangat besar mengambil masa untuk dibina semula selepas setiap perubahan.

**Pelayar bertanya "Tinggalkan laman?"**
Projek mempunyai perubahan yang belum disimpan. Kekal, simpan dengan {{key:Mod+S}}, kemudian tinggalkan.
