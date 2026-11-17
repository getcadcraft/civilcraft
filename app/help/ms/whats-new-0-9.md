---
title: Perkara baharu dalam 0.9
summary: Templat koridor dan terain, snap dan butang Pilih semasa melukis, analisis GIS dengan jadual atribut, kajian teduhan, hasil solar, keselesaan dan angin untuk tapak, paparan Render 3D, dan add-on Awan titik dan WaterCraft.
keywords: perkara baharu, 0.9, nota keluaran, templat koridor, templat terain, editor templat, keratan jenis, beberapa koridor, snap, snaps, pilih, alih, salin, putar, tangen, render, render 3d, analisis gis, penampan, tindihan, sambungan ruang, jadual atribut, gaya mengikut atribut, kajian teduhan, hasil solar, utci, keselesaan luar, kajian angin, openfoam, awan titik, las, laz, watercraft, aliran kebakaran, hidran, umur air, klorin, permintaan, tip alat, susun atur, log perubahan, perubahan, 0.8, 0.8.1, versi, ciri baharu, hujan, ribut, pengumpulan air, limpahan, kerja tanah, keseimbangan, potongan dan tambakan, angkutan, laluan terbaik, kos terendah, penjajaran, kolam tahanan, saluran keluar, susutan, lebihan air, kemajuan, tinjauan, dron, timbunan, alamat ke tapak, lot, tanah, banjir, kestabilan cerun, bishop, mendapan, simpang, penandaan, isyarat, jarak penglihatan, pelarasan, kuasa dua terkecil, terabas, lombong terbuka, model blok, pautan radio, fresnel, susur keluar, persilangan, bahasa, masalah, live, dwg
from: d7ac5b14
---

Ini ialah perubahan dalam CivilCraft 0.9, berbanding 0.8.1. CivilCraft 0.9 ialah sebahagian daripada CadCraft Studio 0.9 dan lapan aplikasinya. Bahagian utama ialah templat koridor dan terain, snap semasa anda melukis, analisis GIS, kajian matahari, hasil solar, keselesaan dan angin tapak, dan dua add-on: Awan titik dan WaterCraft.

## Baharu

### Templat koridor dan terain

- **Templat koridor.** Buka {{ui:Permukaan}} › {{ui:Lagi}} › {{ui:Templat koridor…}} (atau taip {{cmd:TEMPLATES}}). Templat ialah keratan rentas kecil dengan komponen, ofset, cerun, bahan dan kod titik. Simpan dalam projek, dalam {{ui:Pustaka saya}} atau sebagai fail `.cctemplates.json`. Editor templat menunjukkan lukisan skala sebenar dan menyenaraikan masalah semasa anda menaip.
- **Bina daripada templat mengikut stesen.** Pilih penjajaran dan hidupkan {{ui:Bina daripada templat mengikut stesen}} dalam Sifatnya. Setiap sisi setiap rantau mempunyai senarai turapan dan keadaan hujungnya sendiri. {{ui:Tambah koridor}} di bawah {{ui:Koridor pada penjajaran ini}} meletakkan beberapa koridor pada satu penjajaran.
- **Templat terain.** {{ui:Permukaan}} › {{ui:Lagi}} › {{ui:Templat terain…}} (atau taip {{cmd:TERRAINTEMPLATES}}) menutup bahan berlapis seperti tanah atas atau turapan dan asas pada terain, dengan luas dan isipadu bagi setiap lapisan. Lihat [Templat koridor dan templat terain](topic:corridor-templates).

### Lukisan

- **Snap.** Alat Penjajaran, Pelantar, Lot, Jisim, Garisan ciri, Ukur, Sempadan dan Tangkapan snap kepada titik tinjauan, PI, sudut, bucu dan struktur, dengan label di sebelah penanda. Tahan {{key:Alt}} untuk titik bebas.
- **Butang Pilih, tangen, alih, salin, putar.** Bucu pelantar, lot dan garisan ciri mempunyai kotak Easting dan Northing yang ditaip serta butang Pilih berbentuk silang. Sifat juga mempunyai {{ui:Tangen daripada dua titik}} untuk penjajaran dan {{ui:Alih, salin dan putar}} untuk penjajaran, pelantar, lot dan garisan ciri. Lihat [Lukis dengan snap, bucu yang dipilih dan alih, salin, putar](topic:draft-with-snaps).
- **Paparan Render dalam 3D.** Butang {{ui:Render}} pada bar 3D melukis tanah dengan warna semula jadi, langit, kabus dan bayang lembut. Ia tidak mengubah model. Menu {{ui:Matahari}} kini mempunyai butang {{ui:Guna}} dan {{ui:Tutup}}. Lihat [Lihat tapak dalam 3D](topic:site-3d).
- **Panel dibuka satu bahagian pada satu masa.** Panel kiri dan panel Sifat membuka satu bahagian dan menutup yang lain, dan jubin reben Landskap yang memuatkan beberapa alat ialah butang berpecah.

### Analisis GIS

- **Analisis.** {{ui:Permukaan}} › {{ui:Lagi}} › {{ui:Analisis}} menawarkan penampan, tindihan, sambungan ruang, pilih mengikut atribut atau bentuk, dan ukur. Setiap alat membuat lapisan baharu dalam satu langkah buat asal.
- **Jadual atribut.** Menu tiga titik bagi lapisan mempunyai {{ui:Jadual atribut…}} dan {{ui:Gaya mengikut atribut…}}. Lihat [Analisis lapisan GIS](topic:gis-analysis) dan [Bekerja dengan jadual atribut lapisan](topic:gis-table).

### Tapak: matahari, solar, keselesaan dan angin

- **Bahagian persekitaran.** Pilih jisim: bahagian {{ui:Persekitaran}} terletak di bawah {{ui:Jam matahari}} dalam Sifatnya. Ia mempunyai kajian teduhan (peta, jadual, animasi, CSV), hasil solar daripada fail cuaca tahun tipikal (.epw) dan keselesaan luar (UTCI).
- **Angin, untuk tapisan sahaja.** {{ui:Jalankan kajian angin}} mewarnakan tanah daripada duduk hingga tidak selesa untuk setiap arah angin dalam fail cuaca. Ia tidak disahkan dan panel menyatakannya.
- **Add-on angin pejalan kaki (OpenFOAM).** Mati sehingga anda menghidupkannya dalam {{ui:Tetapan}} › {{ui:Add-on}}. OpenFOAM ialah perisian yang anda pasang sendiri. Lihat [Teduhan, hasil solar dan keselesaan luar](topic:environment).

### Awan titik (add-on)

- Hidupkan {{ui:Awan titik}} dalam {{ui:Tetapan}} › {{ui:Add-on}}; tab Awan titik muncul dalam panel sebelah kanan. Buka fail LAS atau LAZ, bersihkannya, asingkan kepada tanah, tumbuhan dan bangunan, bina tanah, kontur dan isipadu, dan eksport LAS atau LAZ. Lihat [Awan titik daripada dron atau pengimbas](topic:point-clouds).

### WaterCraft (add-on)

- Hidupkan {{ui:WaterCraft (pengagihan air)}} dalam {{ui:Tetapan}} › {{ui:Add-on}}; tab WaterCraft muncul. Ia mempunyai permintaan daripada pelanggan, aliran kebakaran di setiap hidran, paip utama mana yang gangguannya paling penting, dan umur air serta klorin, setiap satu disimpan sebagai CSV. Lihat [WaterCraft: permintaan, aliran kebakaran, gangguan dan umur air](topic:watercraft).

### Bekerja bersama

- Dalam sesi Live anda melihat kursor dan nama satu sama lain dalam pelan. Tumbuhan pustaka: CivilCraft Landskap bermula daripada koleksi Pustaka lalainya, {{ui:Landskap CivilCraft}}.

## Dalam setiap aplikasi

- Petunjuk dipaparkan sebagai tooltip Bootstrap, dan tip mula boleh ditutup.
- Jalur tab panel yang tidak muat akan skrol dan bukannya terpotong.
- Tajuk tab pelayar dibaca `<document> - CivilCraft | CadCraft`.
- {{ui:Tetapan}} mempunyai bahagian Susun atur, di mana susun atur ialah senarai juntai bawah dengan pilihan dua baris.
- Unit berat dan suhu terdapat dalam {{ui:Tetapan}} › {{ui:Global}} › {{ui:Unit}}.
- Senarai bahasa menunjukkan bahasa yang binaan itu mempunyai fail untuknya. Bahasa selain Inggeris ialah draf mesin.

## Diperbetulkan

- Add-on carian alamat dan semakan EnergyPlus tidak dapat dihidupkan; kini boleh.
- Bantuan kini menyatakan bahawa add-on Awan titik menulis awan yang dibersihkan sebagai LAS 1.4 atau LAZ.
- Mengklik pemegang objek yang dipilih tidak lagi memulakan seretan pemegang yang menghentikan Pilih yang sedang menunggu.

## Had sebenar

- Templat koridor contoh ialah pemegang tempat tanpa piawaian; jurutera mesti menyemaknya. Templat terain tidak menambah permukaan dan tidak dilukis dalam 3D atau paparan keratan. Koridor kedua pada penjajaran tiada dalam eksport IFC. Tiada tirus antara dua templat mengikut stesen.
- Awan titik diuji pada fail rekaan, bukan tinjauan dron sebenar. Hanya LAS dan LAZ dibaca.
- Analisis GIS diuji pada lapisan rekaan.
- Teduhan, solar dan keselesaan ialah anggaran perancangan; angin ialah tapisan yang belum disahkan. Tiada satu pun daripadanya ialah nilai reka bentuk.
- WaterCraft ialah alat bantu pengiraan yang disemak pada rangkaian rekaan. Jurutera air memutuskan nilai nombor itu.
- Bahasa selain Inggeris ialah draf mesin.
- Pemasang Windows tidak ditandatangani kod, dan imej cakera macOS tidak dinotarikan.

## Terdahulu: 0.8 dan 0.8.1

Ini ialah perubahan dalam CivilCraft 0.8 (2026-11-01) dan 0.8.1 (2026-11-02), berbanding 0.7. Bahagian baharu yang utama ialah alat yang menguji pembentukan dan tapak anda (hujan, kerja tanah, laluan, kolam, kemajuan) dan enam tetingkap pengiraan untuk tanah, jalan, tinjauan, lombong, pautan dan landasan.

### Baharu

**Uji pembentukan anda**

- **Buat hujan.** {{ui:Buat hujan…}} (di bawah {{ui:Permukaan}}) menurunkan ribut ke atas tanah yang dibentuk. Anda melihat air mengalir dari pelantar, bertakung di sudut rendah dan melimpah ke kolam yang terlalu kecil. Larian dianimasikan dan memberikan isipadu, aliran puncak keluar dan CSV bagi setiap kolam. Sel lalai adalah kasar supaya tinjauan pertama cepat; sel yang lebih halus lebih perlahan. Kolam yang melimpah juga muncul dalam panel Masalah.
- **Pengimbang kerja tanah.** {{ui:Pengimbang kerja tanah…}} menaikkan atau menurunkan pelantar sehingga potongan sama dengan tambakan, dan menunjukkan jadual angkutan antara keduanya.
- **Laluan terbaik.** {{ui:Laluan terbaik…}}: pilih titik mula dan tamat, dan CivilCraft mencari laluan termurah merentasi terain yang kekal dalam had pembentukan dan lengkung anda, kemudian membuat penjajaran daripadanya.
- **Kolam tahanan.** {{ui:Kolam tahanan…}} mengira peringkat dan storan daripada tanah anda, menerima peranti saluran keluar (orifis, empangan, takuk-V, lata), menghala ribut melalui kolam dan menyemak puncak yang ditahan, masa susut dan lebihan air.
- **Kemajuan daripada tinjauan.** {{ui:Kemajuan daripada tinjauan…}} membandingkan permukaan dron atau imbasan dari tarikh berbeza dengan tanah seperti dahulu dan dengan reka bentuk: peratus siap mengikut isipadu, kawasan yang digali berlebihan dan ditambak berlebihan, timbunan, dan bila kerja siap pada kadar ini (ditandakan sebagai anggaran).

**Ketahui tapak**

- **Alamat ke tapak.** {{ui:Alamat ke tapak…}} menyelaraskan data lot, bangunan, zonasi, tanah, banjir dan terain terbuka pada satu tapak. Anda boleh menyimpan tapak dalam fail projek: alamat yang ditaip, setiap sumber dengan hari anda mengambilnya dan lesennya, dan apa yang dikembalikan. Buka semula atau kongsi projek dan tapak masih ada, tanpa mengambil apa-apa semula. Anda juga boleh menyimpannya sebagai fail tapak atau menghantarnya ke BimCraft. Lihat [Alamat ke tapak](topic:address-to-site).

**Tanah, jalan, tinjauan, lombong, pautan dan landasan**

- **Tanah dan cerun.** {{ui:Tanah dan cerun…}} melukis profil tanah antara lubang gerudi yang anda taip. Kaedah Bishop kemudian mencari bulatan kritikal pada tanah anda, dengan paras air, beban tambahan dan pekali gempa bumi; mendapan asas mendapat pengukuhan, mendapan serta-merta dan masa.
- **Simpang dan penandaan.** {{ui:Simpang dan penandaan…}} menyatukan kaki dengan pulangan kerb (satu jejari bagi setiap kaki, atau pulangan tiga pusat), jarak penglihatan untuk kelajuan reka bentuk, semakan segi tiga penglihatan, lintasan pejalan kaki, bar henti, penandaan dan isyarat dengan jadual isyarat. Ia dilukis pada pelan dan disimpan sebagai .dxf dengan lapisan bernama.
- **Pelarasan tinjauan.** {{ui:Pelarasan tinjauan…}} menjalankan pelarasan kuasa dua terkecil bagi terabas atau rangkaian: koordinat terlaras, elips ralat, ujian chi-kuasa-dua dan bendera pada ukuran yang tidak sesuai. Rangkaian bebas, penutupan terabas dengan peraturan kompas dan RW5, fail lapangan GSI, JobXML atau CSV disertakan, dan titik terlaras disimpan sebagai CSV.
- **Lombong terbuka.** {{ui:Lombong terbuka…}} menukar sampel gerudi kepada model blok dan lubang muktamad dalam sudut cerun anda, dengan nisbah lapisan, jadual mengikut bangku, dan lengkung gred serta tonase. Lubang bersarang mengikut faktor hasil dan jadual pengeluaran dengan aliran tunai terdiskaun juga ada.
- **Pautan radio.** {{ui:Pautan radio…}} menyemak garis pandangan atas tanah anda dengan lengkung bumi, zon Fresnel pertama, bajet pautan, margin pudar dan gangguan multilaluan, dan memberikan ketinggian tiang yang akan membersihkan laluan. Ia juga membuat bajet kehilangan gentian, kuantiti laluan dan angin pada menara.
- **Suis landasan.** {{ui:Suis landasan…}} membuat suis daripada nombor frog, persilangan antara landasan selari dan tolok struktur yang dicondongkan oleh kant dan diluaskan pada lengkung. Suis boleh berada pada stesen penjajaran.

Lihat [Tanah, simpang, pelarasan tinjauan, lombong, pautan radio dan suis](topic:soils-roads-survey-mines-links).

### Dalam setiap aplikasi

- **Bahasa.** 54 bahasa, sepuluh daripadanya baharu. Bahasa selain Inggeris ialah draf mesin sehingga penutur asli membacanya. Topik bantuan kebanyakannya masih dalam bahasa Inggeris.
- **Baris bar alat.** {{ui:Tetapan}} › {{ui:Umum}} › {{ui:Baris bar alat}}: Balut (seperti dahulu), 2 baris atau 1 baris. Reben CivilCraft menunjukkan alat paling kerap digunakan dengan besar, yang seterusnya kecil, dan selebihnya di belakang anak panah nama kumpulan.
- **Peranti input.** Pad sentuh, pen, tetikus 3D, pengawal dan MIDI boleh mengawal aplikasi.
- **Masalah.** Panel Masalah yang memberi amaran dalam setiap aplikasi, dengan semakan yang membaca pek peraturan.
- **Live.** Paparan siapa berada di mana dalam sesi Live.
- **Add-on.** Senarai add-on, dengan add-on pencahayaan.
- **Sambungkan AI anda.** Mana-mana pembantu yang anda sambungkan boleh memacu alat CivilCraft. Ia dihantar dengan nota bahawa sambungan satu klik dalam CadCraft Studio dan penyambung hos belum sedia. Lihat [Biarkan pembantu AI bekerja dengan tapak anda](topic:assistants).

### Diperbetulkan dalam 0.8.1

- **Bahagian kelas DWG.** Ia dibaca sebagai jenis yang salah (GitHub cadcraft#5). Diperbetulkan dalam CivilCraft bersama CadCraft, BimCraft, ModelCraft dan TakeoffCraft.
- **Menukar bahasa semasa berjalan.** CadCraft Studio dan edisi terbungkus boleh menukar bahasa semasa berjalan. Sebelum ini hanya bahasa Inggeris. Belum diuji pada setiap platform: beritahu kami jika bahasa tidak berubah.

### Belum ada dalam versi ini

- **Ini ialah alat bantu pengiraan.** Setiap keputusan dalam tetingkap baharu memerlukan semakan jurutera. Kekuatan tanah bermula daripada nilai tipikal bagi kumpulan tanah, dan tetingkap menyatakannya.
- **Buat hujan.** Larian pada tapak sampel boleh mengambil masa lebih dua minit dalam pelayar pada sel halus. Ia disemak dengan kes manual dan tadahan berbentuk V, belum lagi pada tapak yang dibentuk sebenar.
- **Alamat ke tapak.** Ia membaca fail data terbuka yang anda bawa, dan diuji hanya pada fail kami sendiri. Pokok bukan sumber. Mengambil sumber untuk anda menunggu teks privasi.
- **Kemajuan daripada tinjauan.** Diuji pada tinjauan rekaan sahaja. Kemajuan pada helaian dan markup (MarkupCraft) serta imbas berbanding model (BimCraft) belum dibina.
- **Tanah dan cerun.** Permukaan bulat sahaja: tiada carian baji atau blok dan tiada retak tegangan.
- **Simpang.** Satu jejari bagi setiap kaki, tiada laluan sapuan trak, dan ia belum masuk ke dalam koridor.
- **Fail lapangan.** Pembaca ditulis daripada perihalan format awam dan diuji pada fail yang kami buat. Fail instrumen sebenar diperlukan.
- **Pautan dan landasan.** Pautan radio: kehilangan ruang bebas dan berbilang laluan sahaja (tiada pudaran hujan atau corak antena), dan tiada piawaian landasan: setiap had landasan ialah pemegang tempat, dengan nombor draf yang tiada jurutera landasan telah semak.
- **Windows dan macOS.** 0.8 tidak ditandatangani kod. Windows mungkin memberi amaran, dan macOS meminta klik kanan kemudian Buka.

Selebihnya ada dalam [Belum dibina](topic:not-built-yet). Untuk keluaran terdahulu, lihat [Perkara baharu dalam 0.7](topic:whats-new-0-7).
