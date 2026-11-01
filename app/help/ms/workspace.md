---
title: Skrin, bahagian demi bahagian
summary: Lawatan setiap bar dan panel dalam CivilCraft mengikut nama pada skrin, dari bar alat hingga bar status.
keywords: antara muka, skrin, bar alat, panel, sifat, bar status, paparan profil, reka letak, lawatan, ui
from: 76272010
---

CivilCraft mempunyai satu skrin. Tiada tab dan tiada reka letak. Panel sisi boleh dialihkan, dilekapkan atau dipindahkan ke tetingkap sendiri: lihat [Susun panel dan guna monitor kedua](common:arrange-panels). Dari atas ke bawah dan kiri ke kanan:

- **bar aplikasi** (tanda CadCraft, nama aplikasi, versi, Perihal, mod skrin, Bantuan, Simpan untuk luar talian, Kertas dan Model)
- **bar alat** dengan tujuh kumpulan butang
- **panel kiri**: Tapak, Titik, Permukaan, Paparan dan, apabila anda mengimport beberapa, lapisan GIS
- **pelan** di tengah, dengan **paparan profil** di bawahnya apabila ia dibuka
- **panel kanan**: Sifat bagi apa yang dipilih
- **bar status** di sepanjang bahagian bawah

## Bar aplikasi

Bar nipis di bahagian paling atas tergolong kepada tapak CadCraft, bukan kepada CivilCraft itu sendiri.

- Menu versi menunjukkan binaan yang anda jalankan.
- {{ui:Perihal CivilCraft}} membuka halaman aplikasi di tapak.
- {{ui:Skrin penuh}} bergilir antara mod skrin: skrin penuh, kemudian skrin penuh dengan bar disembunyikan, kemudian kembali kepada normal. {{key:Ctrl+Shift+F}} melakukan perkara yang sama pada setiap platform, termasuk Mac (ia kekunci Control di sana, bukan Command). Dengan bar disembunyikan, gerakkan penunjuk ke tepi atas untuk membawanya kembali.
- {{ui:Bantuan}} (atau {{key:F1}}) membuka bantuan ini dalam panel sisi; {{key:F1}} atau {{key:Esc}} menutupnya.
- {{ui:Simpan untuk luar talian}} menyimpan CivilCraft dalam pelayar ini supaya ia dibuka tanpa sambungan; ia kemudian menunjukkan {{ui:Sedia untuk luar talian}}. Lihat [Fail yang anda boleh buka, simpan dan eksport](topic:files#dalam-talian-dan-luar-talian).
- {{ui:Kertas}} dan {{ui:Model}} bertukar antara tema cerah dan gelap. Pelan dan profil mengikut tema; PDF sentiasa dicetak pada latar putih.

## Bar alat

Setiap kumpulan mempunyai label kecil di atas butangnya. Letakkan penunjuk di atas butang untuk melihat tip alatnya dan kekunci.

| Kumpulan | Butang | Apa yang dilakukannya |
|---|---|---|
| Fail | {{ui:Baharu}}, {{ui:Buka}}, {{ui:Simpan}} | Mula semula, buka fail titik, LandXML atau projek, simpan projek sebagai muat turun |
| Eksport | {{ui:LandXML}}, {{ui:DXF}}, {{ui:DWG}}, {{ui:PDF}} | Tulis LandXML 1.2, DXF R12 atau DWG bagi pelan, atau plot pelan ke PDF |
| Permukaan | {{ui:Garis putus}}, {{ui:Sempadan}} | Lukis garis putus melalui titik tinjauan; lukis sempadan luar |
| Reka bentuk | {{ui:Penjajaran}}, {{ui:Pelantar}}, {{ui:Paip}}, {{ui:Profil}} | Lukis penjajaran, pelantar, larian paip; tunjuk atau sembunyikan paparan profil |
| Sunting | {{ui:Buat asal}}, {{ui:Buat semula}}, {{ui:Salin}}, {{ui:Tampal}}, {{ui:Lagi}} | Buat asal, buat semula, salin dan tampal titik tinjauan; {{ui:Lagi}} memegang Potong, Tampal di tempat yang sama, Pendua, Padam, Pilih semua titik dan Nyahpilih semua |
| GIS | {{ui:Koordinat}}, {{ui:Import}}, {{ui:Eksport}}, {{ui:Peta}} | Tetapkan sistem koordinat, import dan eksport fail GIS, tunjuk lapisan peta di bawah pelan |
| Paparan | {{ui:Pilih}}, {{ui:Muat}}, {{ui:3D}} | Pilih dan alihkan objek; zum untuk menunjukkan semuanya; tunjuk tapak dalam 3D ([Lihat tapak dalam 3D](topic:site-3d)) |

Alat lukisan kekal ditekan semasa ia aktif. Mengkliknya semula, menekan {{key:Esc}} atau menekan {{key:V}} kembali kepada {{ui:Pilih}}. {{ui:Buat asal}}, {{ui:Buat semula}}, {{ui:Salin}} dan item dalam {{ui:Lagi}} dimalapkan apabila ia tidak boleh bertindak; tip alat menerangkan sebabnya (contohnya "Pilih titik tinjauan dahulu"). Setiap butang disenaraikan dalam [Rujukan bar alat](topic:toolbar).

Pada tetingkap yang sempit, bar alat bergerak ke sisi.

## Panel kiri

### Tapak

- **Nama**: nama projek. Ia menamakan setiap fail yang anda simpan atau eksport dan dicetak dalam jalur tajuk PDF.
- **Unit**: {{ui:Kaki AS}} atau {{ui:Meter}}. Ini menyatakan maksud nombor. Menukarnya **tidak** menukar koordinat; lihat [Unit, stesen dan format nombor](topic:units-and-stations).

### Titik

Kosong, ia memberitahu anda cara membuka fail titik. Dengan titik, ia menunjukkan nama fail, bilangan titik dan berapa banyak yang mempunyai aras, kemudian jadual **kumpulan titik**: satu baris bagi setiap perkataan pertama huraian (GRD, FL, TBS ...), dengan kiraan dan pilihan **Permukaan**:

- {{ui:Titik}}: titik masuk ke dalam permukaan (lalai bagi setiap kumpulan).
- {{ui:Garis putus}}: titik kumpulan itu disambungkan, mengikut nombor titik, menjadi satu garis putus.
- {{ui:Ditinggalkan}}: kumpulan itu tidak menyentuh permukaan.

### Permukaan

Fakta tentang tanah sedia ada: titik, segi tiga, aras terendah dan tertinggi, aras min, luas 2D dan 3D, garis putus, dan sama ada terdapat sempadan. Di bawah fakta, kotak menyenaraikan apa-apa yang pembina permukaan terpaksa betulkan atau tidak dapat lakukan. Kemudian:

- **Tepi luar terpanjang**: 0 mengekalkan setiap segi tiga luar; nombor memotong segi tiga luar yang panjang dan nipis.
- Pautan yang muncul apabila berkenaan: {{ui:Alih keluar sempadan}}, {{ui:Alih keluar garis putus yang dilukis}} dan, untuk permukaan yang dibaca daripada LandXML, {{ui:Bina semula permukaan daripada titik}}.

### Paparan

- **Permukaan**: {{ui:Tanah sedia ada}} atau {{ui:Dicadangkan (diratakan)}}. Yang kedua tersedia apabila pelantar atau koridor meratakan tanpa masalah.
- **Kontur setiap**, **Utama setiap** dan **Jalur** (bilangan jalur warna).
- Kotak semak: {{ui:Kontur}}, {{ui:Label kontur}}, {{ui:Segi tiga}}, {{ui:Jalur aras}}, {{ui:Anak panah cerun}}, {{ui:Titik}}, {{ui:Label titik}}, {{ui:Garis putus}}, {{ui:Tepi permukaan}}, {{ui:Paip}}.
- Legenda aras jalur muncul apabila jalur dihidupkan.

Tetapan paparan disimpan bersama projek tetapi bukan langkah buat asal: {{key:Mod+Z}} tidak pernah mengembalikan kotak semak.

## Pelan

Pelan menunjukkan titik, permukaan dan semua yang anda reka, dalam paparan pelan dengan utara di atas. Roda tetikus untuk zum pada penunjuk, seret ruang kosong untuk pan. Senarai lengkap dalam [Kekunci dan tetikus](topic:keyboard).

- Pada projek kosong, kotak bertajuk **Mula dengan titik tinjauan** menyenaraikan langkah pertama dan menawarkan {{ui:Buka tapak contoh}}.
- Semasa alat lukisan aktif, petunjuk di bahagian atas pelan memberitahu apa yang perlu diklik dan cara menyelesaikannya.
- Menyeret fail ke atas pelan menunjukkan "Lepaskan fail titik, LandXML atau projek".
- Perkara yang dipilih diserlahkan. Penjajaran atau pelantar yang dipilih menunjukkan pemegang segi empat sama pada PI atau sudutnya; struktur yang dipilih menunjukkan satu pemegang. Seret pemegang untuk mengalihkannya.
- Titik tinjauan yang dipilih mempunyai cincin. {{key:Shift}} dan klik menambah atau mengalih keluar titik; {{key:Shift}} dan seret melukis kotak (atau, diseret mengelilingi mereka, lasso) yang menambah titik di dalamnya. Lihat [Pilih, salin dan tampal titik tinjauan](topic:copy-paste-points).

## Paparan profil

Tekan {{key:R}} atau klik {{ui:Profil}} untuk membukanya di bawah pelan. Barnya mempunyai:

- senarai penjajaran (aktif apabila terdapat dua atau lebih penjajaran)
- {{ui:Tambah PVI}}: semasa ia ditekan, klik dalam profil menambah PVI ({{key:I}} menghidup-matikannya)
- bacaan stesen, tanah, aras reka bentuk, kecerunan, dan potongan atau tambakan di bawah penunjuk
- butang tutup

Profil menunjukkan tanah sedia ada, profil reka bentuk, kecerunan pada setiap tangen, stesen dan aras setiap PVI, L dan K setiap lengkung menegak dengan BVC dan EVC-nya, titik tinggi dan rendah, dan pembesaran menegak. Ia sentiasa memuatkan keseluruhan penjajaran: ia tidak zum atau pan. Menggerakkan penunjuk di sepanjangnya meletakkan titik pada penjajaran dalam pelan.

## Panel kanan: Sifat

Tajuknya menyatakan apa yang ditunjukkannya.

- **Projek** (tiada yang dipilih): penjajaran dan pelantar sebagai pautan, blok **Kerja tanah**, dan blok **Rangkaian paip** dengan peraturan dan masalahnya.
- **Penjajaran**: nama, stesen permulaan, panjang, jadual PI, lengkung, jadual PVI dan fakta profil reka bentuk, dan tetapan **Koridor**.
- **Pelantar**: nama, aras, cerun potongan dan tambakan, luas, fakta persilangan cerun dan kerja tanah.
- **Struktur** atau **Paip**: saiz, tepi, invert, kecerunan, penutup dan sebarang masalah.
- **Titik** dan nombornya: koordinat titik, aras, huraian dan kumpulan (baca sahaja).

Medan berkesan apabila anda menekan {{key:Enter}} atau meninggalkan medan. Nilai yang tidak diterima ditanda sebagai tidak sah dan tiada yang berubah.

## Bar status

- **E** dan **N**: timur dan utara di bawah penunjuk.
- **Tanah**: aras di situ (dan **Diratakan** di mana pelantar atau koridor mengubahnya), atau "Di luar permukaan".
- Penjajaran terdekat (atau yang dipilih) dengan **Sta** dan ofset (**L** atau **R**) di bawah penunjuk.
- Di sebelah kanan, mesej: apa yang baru berlaku, atau sebab sesuatu ditolak. Mesej hilang sendiri selepas beberapa saat.

## Dialog

- **Import titik**: dibuka dengan setiap fail titik. Lihat [Import titik tinjauan](topic:import-points).
- **Plot pelan ke PDF**: lihat [Plot pelan ke PDF](topic:plot-pdf).
- **Perubahan yang belum disimpan**: bertanya sebelum {{ui:Baharu}} atau membuka projek atau fail LandXML membuang kerja yang belum disimpan. {{ui:Simpan salinan}} memuat turun projek dahulu.

## Skrin kecil

Sehingga 760 piksel lebar, seperti pada telefon, pelan memenuhi skrin: bar alat ialah satu baris yang bergerak ke sisi, dan panel dibuka sebagai helaian dari bar di bahagian bawah. {{ui:Alat}} menyembunyikan bar alat dan {{ui:Alih}} meletakkannya di bahagian bawah.
