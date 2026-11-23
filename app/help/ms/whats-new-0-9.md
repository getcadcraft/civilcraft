---
title: Perkara baharu dalam 0.9 (terdahulu)
summary: Templat koridor dan templat rupa bumi, snap dan butang Pilih semasa melukis, analisis GIS dengan jadual atribut, kajian teduhan, hasil solar, keselesaan dan angin untuk tapak, paparan Render 3D, serta add-on Awan titik dan WaterCraft.
keywords: perkara baharu 0.9, keluaran terdahulu, perkara baharu, 0.9, nota keluaran, templat koridor, templat rupa bumi, editor templat, keratan tipikal, beberapa koridor, snap, snaps, pilih, alih, salin, putar, tangen, render, render 3d, analisis gis, penampan, tindihan, sambung ruang, jadual atribut, gaya mengikut atribut, kajian teduhan, hasil solar, utci, keselesaan luar, kajian angin, openfoam, awan titik, las, laz, watercraft, aliran kebakaran, hidran, usia air, klorin, permintaan, tip alat, susun atur, nota keluaran, perubahan, 0.8, 0.8.1, versi, ciri baharu, hujan, ribut, pembentungan, limpahan, kerja tanah, imbangan, angkutan, laluan terbaik, kos terendah, penjajaran, kolam tahanan, saluran keluar, susut turun, ruang bebas, kemajuan, tinjauan, drone, timbunan, alamat ke tapak, lot, tanah, banjir, kestabilan cerun, bishop, mendapan, simpang, penandaan, papan tanda, jarak penglihatan, pelarasan, kuasa dua terkecil, terabas, lombong terbuka, model blok, pautan radio, fresnel, suis landasan, persilangan, bahasa, masalah, langsung, dwg
from: 4664522c
---

Inilah yang berubah dalam CivilCraft 0.9, berbanding 0.8.1. CivilCraft 0.9 ialah sebahagian daripada CadCraft Studio 0.9 dan lapan aplikasinya. Bahagian utama ialah templat koridor dan rupa bumi, snap semasa melukis, analisis GIS, kajian matahari, hasil solar, keselesaan dan angin tapak, serta dua add-on: Awan titik dan WaterCraft.

## Baharu

### Templat koridor dan rupa bumi

- **Templat koridor.** Buka {{ui:Permukaan}} › {{ui:Lagi}} › {{ui:Templat koridor…}} (atau taip {{cmd:TEMPLATES}}). Templat ialah keratan rentas kecil dengan komponen, ofset, cerun, bahan dan kod titik. Simpan dalam projek, dalam {{ui:Pustaka saya}} atau sebagai fail `.cctemplates.json`. Editor templat menunjukkan lukisan pada skala sebenar dan menyenaraikan masalah semasa anda menaip.
- **Bina daripada templat mengikut stesen.** Pilih penjajaran dan hidupkan {{ui:Bina daripada templat mengikut stesen}} dalam Sifatnya. Setiap sisi bagi setiap kawasan mempunyai senarai turapan dan keadaan hujungnya sendiri. {{ui:Tambah koridor}} di bawah {{ui:Koridor pada penjajaran ini}} meletakkan beberapa koridor pada satu penjajaran.
- **Templat rupa bumi.** {{ui:Permukaan}} › {{ui:Lagi}} › {{ui:Templat rupa bumi…}} (atau taip {{cmd:TERRAINTEMPLATES}}) meletakkan bahan berlapis seperti tanah atas atau turapan dan asas pada rupa bumi, dengan luas dan isipadu bagi setiap lapisan. Lihat [Templat koridor dan templat rupa bumi](topic:corridor-templates).

### Melukis

- **Snap.** Alatan Penjajaran, Pelantar, Lot, Jisim, Garis ciri, Ukur, Sempadan dan Kawasan tadahan melekat pada titik tinjauan, PI, penjuru, bucu dan struktur, dengan label di sebelah penanda. Tahan {{key:Alt}} untuk titik bebas.
- **Butang Pilih, tangen dan alih, salin, putar.** Penjuru pelantar, lot dan garis ciri mempunyai kotak Easting dan Northing yang ditaip serta butang Pilih bersilang. Sifat juga mempunyai {{ui:Tangen daripada dua titik}} untuk penjajaran dan {{ui:Alih, salin dan putar}} untuk penjajaran, pelantar, lot dan garis ciri. Lihat [Lukis dengan snap, penjuru dipilih dan alih, salin, putar](topic:draft-with-snaps).
- **Paparan Render dalam 3D.** Butang {{ui:Render}} pada bar 3D melukis tanah dengan warna semula jadi, langit, kabus dan bayang lembut. Ia tidak mengubah model. Menu {{ui:Matahari}} kini mempunyai butang {{ui:Guna}} dan {{ui:Tutup}}. Lihat [Lihat tapak dalam 3D](topic:site-3d).
- **Panel dibuka satu bahagian pada satu masa.** Panel kiri dan panel Sifat membuka satu bahagian dan menutup yang lain, dan jubin reben Landskap yang memegang beberapa alatan ialah butang berpecah.

### Analisis GIS

- **Analisis.** {{ui:Permukaan}} › {{ui:Lagi}} › {{ui:Analisis}} menawarkan penampan, tindihan, sambung ruang, pilih mengikut atribut atau bentuk, dan ukur. Setiap alatan membuat lapisan baharu dalam satu langkah buat asal.
- **Jadual atribut.** Menu tiga titik lapisan mempunyai {{ui:Jadual atribut…}} dan {{ui:Gaya mengikut atribut…}}. Lihat [Analisis lapisan GIS](topic:gis-analysis) dan [Bekerja dengan jadual atribut lapisan](topic:gis-table).

### Tapak: matahari, solar, keselesaan dan angin

- **Bahagian persekitaran.** Pilih satu jisim: bahagian {{ui:Persekitaran}} terletak di bawah {{ui:Jam matahari}} dalam Sifatnya. Ia mempunyai kajian teduhan (peta, jadual, animasi, CSV), hasil solar daripada fail cuaca tahun tipikal (.epw) dan keselesaan luar (UTCI).
- **Angin, hanya saringan.** {{ui:Jalankan kajian angin}} mewarnakan tanah dari duduk hingga tidak selesa bagi setiap arah angin dalam fail cuaca. Ia belum disahkan dan panel menyatakannya.
- **Add-on angin pejalan kaki (OpenFOAM).** Mati sehingga anda menghidupkannya dalam {{ui:Tetapan}} › {{ui:Add-on}}. OpenFOAM ialah perisian yang anda pasang sendiri. Lihat [Teduhan, hasil solar dan keselesaan luar](topic:environment).

### Awan titik (add-on)

- Hidupkan {{ui:Awan titik}} dalam {{ui:Tetapan}} › {{ui:Add-on}}; tab Awan titik muncul dalam panel kanan. Buka fail LAS atau LAZ, bersihkannya, asingkan kepada tanah, tumbuhan dan bangunan, bina tanah, kontur dan isipadu, dan eksport LAS atau LAZ. Lihat [Awan titik daripada drone atau pengimbas](topic:point-clouds).

### WaterCraft (add-on)

- Hidupkan {{ui:WaterCraft (pengagihan air)}} dalam {{ui:Tetapan}} › {{ui:Add-on}}; tab WaterCraft muncul. Ia mempunyai permintaan daripada pelanggan, aliran kebakaran di setiap hidran, gangguan paip utama mana yang paling penting, serta usia air dan klorin, setiap satu disimpan sebagai CSV. Lihat [WaterCraft: permintaan, aliran kebakaran, gangguan dan usia air](topic:watercraft).

### Bekerja bersama

- Dalam sesi Langsung anda melihat kursor dan nama satu sama lain dalam pelan. Tumbuhan pustaka: CivilCraft Landskap bermula daripada koleksi Pustaka lalainya, {{ui:CivilCraft landskap}}.

## Dalam setiap aplikasi

- Petunjuk ditunjukkan sebagai tip alat Bootstrap, dan tip permulaan boleh ditutup.
- Jalur tab panel yang tidak muat boleh digulung dan tidak dipotong.
- Tajuk tab pelayar berbunyi `<document> - CivilCraft | CadCraft`.
- {{ui:Tetapan}} mempunyai bahagian Susun atur, dengan susun atur ialah senarai juntai pilihan dua baris.
- Unit berat dan suhu terdapat dalam {{ui:Tetapan}} › {{ui:Global}} › {{ui:Unit}}.
- Senarai bahasa menunjukkan bahasa yang mempunyai fail dalam binaan. Bahasa selain Inggeris ialah draf mesin.

## Diperbetulkan

- Add-on carian alamat dan semakan EnergyPlus tidak dapat dihidupkan; kini boleh.
- Bantuan kini menyatakan bahawa add-on Awan titik menulis awan yang dibersihkan sebagai LAS 1.4 atau LAZ.
- Klik pada grip objek yang dipilih tidak lagi memulakan seretan grip yang menghentikan Pilih yang sedang menunggu.

## Had yang jujur

- Templat koridor contoh ialah nilai ganti tanpa piawaian; seorang jurutera mesti menyemaknya. Templat rupa bumi tidak menambah permukaan dan tidak dilukis dalam 3D atau dalam paparan keratan. Koridor kedua pada penjajaran tiada dalam eksport IFC. Tiada tirus antara dua templat mengikut stesen.
- Awan titik diuji pada fail rekaan, bukan tinjauan drone sebenar. Hanya LAS dan LAZ dibaca.
- Analisis GIS diuji pada lapisan rekaan.
- Teduhan, solar dan keselesaan ialah anggaran perancangan; angin ialah saringan yang belum disahkan. Tiada satu pun daripadanya ialah nilai reka bentuk.
- WaterCraft ialah alat pengiraan yang disemak pada rangkaian rekaan. Seorang jurutera air memutuskan nilai nombor-nombor itu.
- Bahasa selain Inggeris ialah draf mesin.
- Pemasang Windows tidak ditandatangani kod, dan imej cakera macOS tidak dinotarikan.

## Terdahulu: 0.8 dan 0.8.1

Inilah yang berubah dalam CivilCraft 0.8 (2026-11-01) dan 0.8.1 (2026-11-02), berbanding 0.7. Bahagian baharu yang besar ialah alatan yang menguji penggredan dan tapak anda (hujan, kerja tanah, laluan, kolam, kemajuan) serta enam tetingkap pengiraan untuk tanah, jalan, tinjauan, lombong, pautan dan landasan.

### Baharu

**Uji penggredan anda**

- **Jadikan hujan.** {{ui:Jadikan hujan…}} (di bawah {{ui:Permukaan}}) menjatuhkan ribut ke atas tanah yang digredkan. Anda melihat air mengalir dari pelantar, bertakung di penjuru rendah dan kolam yang terlalu kecil melimpah. Larian dianimasikan dan memberi isipadu, aliran keluar puncak dan CSV bagi setiap kolam. Sel lalai adalah kasar supaya pandangan pertama cepat; sel yang lebih halus lebih perlahan. Kolam yang melimpah juga muncul dalam panel Masalah.
- **Pengimbang kerja tanah.** {{ui:Pengimbang kerja tanah…}} menaikkan atau menurunkan pelantar sehingga potongan sama dengan tambakan, dan menunjukkan jadual angkutan antara keduanya.
- **Laluan terbaik.** {{ui:Laluan terbaik…}}: pilih permulaan dan penamat, dan CivilCraft mencari laluan termurah merentasi rupa bumi yang mematuhi had kecerunan dan lengkung anda, kemudian membuat penjajaran daripadanya.
- **Kolam tahanan.** {{ui:Kolam tahanan…}} mengira peringkat dan storan daripada tanah anda, menerima peranti saluran keluar (orifis, empangan, takuk-V, limpahan), menghalakan ribut melalui kolam dan menyemak puncak yang ditahan, masa susut turun dan ruang bebas.
- **Kemajuan daripada tinjauan.** {{ui:Kemajuan daripada tinjauan…}} membandingkan permukaan drone atau imbasan dari tarikh berbeza dengan tanah seperti dahulu dan dengan reka bentuk: peratus siap mengikut isipadu, kawasan terlebih gali dan terlebih tambak, timbunan, dan bila kerja siap pada kadar ini (ditandakan sebagai anggaran).

**Kenali tapak**

- **Alamat ke tapak.** {{ui:Alamat ke tapak…}} menyelaraskan data terbuka lot, bangunan, zon, tanah, banjir dan rupa bumi pada satu tapak. Anda boleh menyimpan tapak dalam fail projek: alamat yang ditaip, setiap sumber dengan hari anda memperolehnya dan lesennya, dan apa yang dikembalikan. Buka semula atau kongsi projek dan tapak masih ada, tanpa perlu diambil semula. Anda juga boleh menyimpannya sebagai fail tapak atau menghantarnya ke BimCraft. Lihat [Alamat ke tapak](topic:address-to-site).

**Tanah, jalan, tinjauan, lombong, pautan dan landasan**

- **Tanah dan cerun.** {{ui:Tanah dan cerun…}} melukis profil tanah antara lubang gerudi yang anda taip. Kaedah Bishop kemudian mencari bulatan kritikal pada tanah anda, dengan paras air bawah tanah, beban tambahan dan pekali gempa bumi; mendapan asas mendapat pemadatan, mendapan serta-merta dan masa.
- **Simpang dan penandaan.** {{ui:Simpang dan penandaan…}} menyusun kaki simpang bersama pemulangan kerb (satu jejari bagi setiap kaki, atau pemulangan tiga pusat), jarak penglihatan bagi laju reka bentuk, semakan segi tiga penglihatan, lintasan pejalan kaki, garisan henti, penanda dan papan tanda dengan jadual papan tanda. Ia dilukis pada pelan dan disimpan sebagai .dxf dengan lapisan bernama.
- **Pelarasan tinjauan.** {{ui:Pelarasan ukur…}} menjalankan pelarasan kuasa dua terkecil bagi terabas atau rangkaian: koordinat terlaras, elips ralat, ujian chi-kuasa dua dan bendera pada ukuran yang tidak sepadan. Rangkaian bebas, penutupan terabas dengan peraturan kompas dan fail lapangan RW5, GSI, JobXML atau CSV disertakan, dan titik terlaras disimpan sebagai CSV.
- **Lombong terbuka.** {{ui:Lombong terbuka…}} menukar sampel gerudi kepada model blok dan lubang muktamad dalam sudut cerun anda, dengan nisbah lapisan, jadual mengikut bangku dan lengkung gred dan tan. Lubang bersarang mengikut faktor hasil dan jadual pengeluaran dengan aliran tunai diskaun juga ada.
- **Pautan radio.** {{ui:Pautan radio…}} menyemak garis penglihatan merentasi tanah anda dengan lengkungan bumi, zon Fresnel pertama, bajet pautan, margin pudar dan gangguan multilaluan, dan memberi ketinggian tiang yang akan membersihkan laluan. Ia juga membuat bajet kehilangan gentian, kuantiti laluan dan angin pada menara.
- **Suis landasan.** {{ui:Suis landasan…}} membuat suis daripada nombor frognya, persilangan antara trek selari dan tolok struktur yang dicondongkan oleh kecondongan dan diluaskan pada lengkung. Suis boleh terletak di stesen penjajaran.

Lihat [Tanah, simpang, pelarasan tinjauan, lombong, pautan radio dan suis](topic:soils-roads-survey-mines-links).

### Dalam setiap aplikasi

- **Bahasa.** 54 bahasa, sepuluh daripadanya baharu. Bahasa selain Inggeris ialah draf mesin sehingga penutur asli membacanya. Topik bantuan masih kebanyakannya dalam bahasa Inggeris.
- **Baris bar alat.** {{ui:Tetapan}} › {{ui:Umum}} › {{ui:Baris bar alat}}: Balut (seperti sebelum ini), 2 baris atau 1 baris. Reben CivilCraft menunjukkan alatan yang paling kerap digunakan dengan besar, yang berikutnya kecil, dan selebihnya di sebalik anak panah nama kumpulan.
- **Peranti input.** Pad sentuh, pen, tetikus 3D, pengawal dan MIDI boleh mengawal aplikasi.
- **Masalah.** Panel Masalah yang memberi amaran dalam setiap aplikasi, dengan semakan yang membaca pek peraturan.
- **Langsung.** Paparan siapa berada di mana dalam sesi Langsung.
- **Add-on.** Senarai add-on, dengan add-on pencahayaan.
- **Sambungkan AI anda.** Mana-mana pembantu yang anda sambungkan boleh mengawal alatan CivilCraft. Ia disertakan dengan nota bahawa sambungan satu klik dalam CadCraft Studio dan penyambung yang dihoskan belum sedia. Lihat [Biarkan pembantu AI bekerja dengan tapak anda](topic:assistants).

### Diperbetulkan dalam 0.8.1

- **Bahagian kelas DWG.** Ia dibaca sebagai jenis yang salah (GitHub cadcraft#5). Diperbetulkan dalam CivilCraft bersama CadCraft, BimCraft, ModelCraft dan TakeoffCraft.
- **Menukar bahasa semasa berjalan.** CadCraft Studio dan edisi pek boleh menukar bahasa semasa dijalankan. Sebelum ini ia hanya dalam Inggeris. Belum diuji pada setiap platform: beritahu kami jika bahasa tidak berubah.

### Belum ada dalam versi ini

- **Ini ialah alat pengiraan.** Setiap keputusan dalam tetingkap baharu memerlukan semakan jurutera. Kekuatan tanah bermula daripada nilai tipikal bagi kumpulan tanah, dan tetingkap itu menyatakannya.
- **Buat hujan.** Larian pada tapak sampel boleh mengambil masa lebih dua minit dalam pelayar pada sel halus. Ia disemak dengan kes tangan dan kawasan tadahan berbentuk V, belum lagi pada tapak yang digredkan sebenar.
- **Alamat ke tapak.** Ia membaca fail data terbuka yang anda bawa, dan hanya diuji pada fail kami sendiri. Pokok bukan sumber. Pengambilan sumber untuk anda menunggu perkataan privasi.
- **Kemajuan daripada tinjauan.** Diuji pada tinjauan rekaan sahaja. Kemajuan pada helaian dan markup (MarkupCraft) serta imbasan berbanding model (BimCraft) belum dibina.
- **Tanah dan cerun.** Permukaan bulat sahaja: tiada carian baji atau blok dan tiada retak tegangan.
- **Simpang.** Satu jejari bagi setiap kaki, tiada laluan sapuan trak, dan ia belum masuk ke dalam koridor.
- **Fail lapangan.** Pembaca ditulis daripada perihalan format awam dan dicuba pada fail yang kami buat. Fail instrumen sebenar diperlukan.
- **Pautan dan landasan.** Pautan radio: kehilangan ruang bebas dan multilaluan sahaja (tiada pudar hujan atau corak antena), dan tiada piawaian landasan: setiap had landasan ialah nilai ganti, dengan nombor draf yang belum disemak oleh mana-mana jurutera landasan.
- **Windows dan macOS.** 0.8 tidak ditandatangani kod. Windows mungkin memberi amaran, dan macOS meminta klik kanan kemudian Buka.

Selebihnya ada dalam [Belum dibina](topic:not-built-yet). Untuk keluaran terdahulu, lihat [Perkara baharu dalam 0.7](topic:whats-new-0-7).
