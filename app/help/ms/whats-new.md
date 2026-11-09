---
title: Perkara baharu dalam 0.8 dan 0.8.1
summary: CivilCraft 0.8 menambah Jadikan hujan (larian ribut ke atas penggredan anda), pengimbang kerja tanah, pencari laluan terbaik, kolam tahanan, kemajuan daripada tinjauan, pengimport alamat ke tapak yang menyimpan tapak dalam projek, dan tetingkap untuk tanah dan cerun, simpang dan penandaan, pelarasan ukur, lombong terbuka, pautan radio dan suis landasan. 0.8.1 membetulkan cara fail DWG dibaca.
keywords: perkara baharu, apa yang baharu, nota keluaran, log perubahan, perubahan, 0.8, 0.8.1, versi, ciri baharu, hujan, ribut, pengumpulan air, limpahan, kerja tanah, imbangan, potong dan tambak, angkut, laluan terbaik, kos terendah, penjajaran, kolam tahanan, alur keluar, susut turun, jagaan papan, kemajuan, ukur, dron, timbunan, alamat ke tapak, lot, tanah, banjir, kestabilan cerun, bishop, mendapan, simpang, penandaan, isyarat, jarak penglihatan, pelarasan, kuasa dua terkecil, terabas, lombong terbuka, model blok, pautan radio, fresnel, suis landasan, silang, bahasa, masalah, live, dwg
from: b0932cf0
---

Ini ialah perkara yang berubah dalam CivilCraft 0.8 (2026-11-01) dan 0.8.1 (2026-11-02), berbanding dengan 0.7. Bahagian baharu yang utama ialah alat untuk menguji penggredan dan tapak anda (hujan, kerja tanah, laluan, kolam, kemajuan) serta enam tetingkap pengiraan untuk tanah, jalan, ukur, lombong, pautan dan landasan.

## Baharu

### Uji penggredan anda

- **Jadikan hujan.** {{ui:Make it rain…}} (di bawah {{ui:Surface}}) melepaskan ribut ke atas tanah yang digred. Anda melihat air mengalir dari pad, bertakung di sudut rendah dan melimpah ke kolam yang terlalu kecil. Larian itu dianimasikan dan memberikan isipadu, aliran keluar puncak dan CSV bagi setiap kolam. Sel lalai adalah kasar supaya tinjauan pertama cepat; sel yang lebih halus lebih perlahan. Kolam yang melimpah juga muncul dalam panel Masalah.
- **Pengimbang kerja tanah.** {{ui:Earthwork balancer…}} menaikkan atau menurunkan pad sehingga potongan sama dengan tambakan, dan menunjukkan jadual angkutan di antara keduanya.
- **Laluan terbaik.** {{ui:Best route…}}: pilih titik mula dan titik akhir, dan CivilCraft mencari laluan termurah merentasi rupa bumi yang mematuhi had gred dan lengkung anda, kemudian membuat penjajaran daripadanya.
- **Kolam tahanan.** {{ui:Detention ponds…}} mengira peringkat dan storan daripada tanah anda, menerima peranti alur keluar (orifis, empangan, takuk V, limpahan), menghala ribut melalui kolam dan menyemak puncak air yang ditahan, masa susut turun dan jagaan papan.
- **Kemajuan daripada tinjauan.** {{ui:Progress from surveys…}} membandingkan permukaan dron atau imbasan dari tarikh yang berbeza dengan tanah seperti dahulu dan dengan reka bentuk: peratusan siap mengikut isipadu, kawasan yang digali berlebihan dan ditimbus berlebihan, timbunan, dan bila kerja akan siap pada kadar ini (ditanda sebagai anggaran).

### Ketahui tapak

- **Alamat ke tapak.** {{ui:Address to site…}} menyusun data lot terbuka, bangunan, zonasi, tanah, banjir dan rupa bumi pada satu tapak. Anda boleh menyimpan tapak dalam fail projek: alamat yang ditaip, setiap sumber dengan tarikh anda mendapatkannya dan lesennya, serta apa yang dikembalikan. Buka semula atau kongsi projek dan tapak masih ada, tanpa sebarang pengambilan semula. Anda juga boleh menyimpannya sebagai fail tapak atau menghantarnya ke BimCraft. Lihat [Alamat ke tapak](topic:address-to-site).

### Tanah, jalan, ukur, lombong, pautan dan landasan

- **Tanah dan cerun.** {{ui:Soils and slopes…}} melukis profil tanah di antara lubang gerudi yang anda taipkan. Kaedah Bishop kemudian mencari bulatan kritikal pada tanah anda, dengan aras air tanah, beban tambahan dan pekali gempa bumi; mendapan asas mengambil kira pemadatan, mendapan segera dan masa.
- **Simpang dan penandaan.** {{ui:Junctions and striping…}} menyambungkan kaki-kaki dengan pusingan kerb (satu jejari bagi setiap kaki, atau pusingan tiga pusat), jarak penglihatan bagi kelajuan reka bentuk, semakan segi tiga penglihatan, lintasan pejalan kaki, garisan henti, penandaan dan tanda dengan jadual tanda. Ia dilukis pada pelan dan disimpan sebagai .dxf dengan lapisan yang dinamakan.
- **Pelarasan ukur.** {{ui:Survey adjustment…}} menjalankan pelarasan kuasa dua terkecil bagi terabas atau rangkaian: koordinat terlaras, elips ralat, ujian chi-kuasa dua dan bendera pada ukuran yang tidak sepadan. Rangkaian bebas dan penutupan terabas mengikut peraturan kompas serta fail lapangan RW5, GSI, JobXML atau CSV disertakan, dan titik terlaras disimpan sebagai CSV.
- **Lombong terbuka.** {{ui:Open pits…}} menukar sampel gerudi kepada model blok dan lombong muktamad dalam sudut cerun anda, dengan nisbah kupasan, jadual mengikut bangku dan lengkung gred dan tan. Lombong bersarang mengikut faktor hasil dan jadual pengeluaran dengan aliran tunai terdiskaun juga disediakan.
- **Pautan radio.** {{ui:Radio links…}} menyemak garis pandang ke atas tanah anda dengan lengkungan bumi, zon Fresnel pertama, belanjawan pautan, margin pudar dan gangguan berbilang laluan, serta memberikan ketinggian tiang yang akan membersihkan laluan. Ia juga menyediakan belanjawan kehilangan gentian, kuantiti laluan dan tiupan angin pada menara.
- **Suis landasan.** {{ui:Rail turnouts…}} membuat suis daripada nombor frog, persilangan landasan antara trek selari, dan tolok struktur yang condong mengikut superelevasi serta dilebarkan pada lengkung. Suis boleh terletak pada stesen penjajaran.

Lihat [Tanah, simpang, pelarasan ukur, lombong, pautan radio dan suis](topic:soils-roads-survey-mines-links).

## Dalam setiap aplikasi

- **Bahasa.** 54 bahasa, sepuluh daripadanya baharu. Bahasa selain bahasa Inggeris ialah draf mesin sehingga penutur asli membacanya. Topik bantuan kebanyakannya masih dalam bahasa Inggeris.
- **Baris bar alat.** {{ui:Settings}} › {{ui:General}} › {{ui:Toolbar rows}}: Balut (seperti sebelum ini), 2 baris atau 1 baris. Reben CivilCraft memaparkan alat yang paling kerap digunakan dalam saiz besar, yang seterusnya dalam saiz kecil, dan selebihnya di sebalik anak panah nama kumpulan.
- **Peranti input.** Pad jejak, pen, tetikus 3D, pengawal dan MIDI boleh mengendalikan aplikasi.
- **Masalah.** Panel Masalah yang memberi amaran dalam setiap aplikasi, dengan semakan yang membaca pek peraturan.
- **Live.** Paparan siapa berada di mana dalam sesi Live.
- **Add-on.** Senarai add-on, termasuk add-on pencahayaan.
- **Sambungkan AI anda.** Mana-mana pembantu yang anda sambungkan boleh mengendalikan alat CivilCraft. Ia disertakan dengan nota bahawa sambungan satu klik dalam CadCraft Studio dan penyambung yang dihoskan belum sedia lagi. Lihat [Benarkan pembantu AI bekerja dengan tapak anda](topic:assistants).

## Diperbetulkan dalam 0.8.1

- **Bahagian kelas DWG.** Ia dibaca sebagai jenis yang salah (GitHub cadcraft#5). Diperbetulkan dalam CivilCraft bersama CadCraft, BimCraft, ModelCraft dan TakeoffCraft.
- **Menukar bahasa semasa berjalan.** CadCraft Studio dan edisi pakej boleh menukar bahasa semasa larian. Sebelum ini hanya bahasa Inggeris. Belum diuji pada setiap platform: beritahu kami jika bahasa tidak bertukar.

## Belum dibina dalam versi ini

- **Ini ialah alat bantu pengiraan.** Setiap keputusan dalam tetingkap baharu memerlukan semakan jurutera. Kekuatan tanah bermula daripada nilai tipikal bagi kumpulan tanah, dan tetingkap menyatakannya.
- **Jadikan hujan.** Larian pada tapak contoh boleh mengambil masa lebih dua minit dalam pelayar pada sel yang halus. Ia telah disemak dengan kes manual dan tangkapan berbentuk V, belum lagi pada tapak tergred sebenar.
- **Alamat ke tapak.** Ia membaca fail data terbuka yang anda bawa, dan hanya diuji pada fail kami sendiri. Pokok bukan sumber. Pengambilan sumber untuk anda menunggu wording privasi.
- **Kemajuan daripada tinjauan.** Diuji pada tinjauan rekaan sahaja. Kemajuan pada helaian dan markup (MarkupCraft) serta imbasan berbanding model (BimCraft) belum dibina.
- **Tanah dan cerun.** Permukaan bulat sahaja: tiada carian baji atau blok dan tiada retakan tegangan.
- **Simpang.** Satu jejari bagi setiap kaki, tiada laluan sapuan trak, dan ia belum masuk ke dalam koridor.
- **Fail lapangan.** Pembaca ditulis daripada huraian format awam dan diuji pada fail yang kami buat. Fail instrumen sebenar diperlukan.
- **Pautan dan landasan.** Pautan radio: kehilangan ruang bebas dan berbilang laluan sahaja (tiada pudar hujan atau corak antena), dan tiada piawaian keretapi: setiap had landasan ialah tempat letak sementara, dengan nombor draf yang belum disemak oleh jurutera keretapi.
- **Windows dan macOS.** 0.8 tidak ditandatangani kod. Windows mungkin memberi amaran, dan macOS meminta klik kanan kemudian Buka.

Selebihnya terdapat dalam [Belum dibina](topic:not-built-yet). Untuk keluaran terdahulu, lihat [Perkara baharu dalam 0.7](topic:whats-new-0-7).
