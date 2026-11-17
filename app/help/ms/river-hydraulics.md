---
title: Profil permukaan air sungai
summary: Model sungai daripada permukaan tanah dan kira profil permukaan air mantap dengan kaedah langkah mantap, iaitu aras air, tenaga, halaju, nombor Froude dan had banjir pada pelan. Ciri makmal; setiap keputusan memerlukan semakan jurutera.
keywords: tanggul, kawasan aliran tidak berkesan, penyunting keratan, sungai, hidraulik, profil permukaan air, air balik, langkah mantap, aliran mantap, 1d, keratan rentas, manning, kekasaran, konveyans, kedalaman genting, kedalaman normal, froude, garisan tenaga, had banjir, dataran banjir, genangan, stesen tebing, panjang reach, pengecutan, pengembangan, subkritikal, superkritikal, rejim campuran, lompatan hidraulik
from: fb8bf425
---

CivilCraft mengira profil permukaan air mantap, satu dimensi, sepanjang sungai: bagi setiap aliran yang anda beri, aras air pada setiap keratan rentas, daripada keseimbangan tenaga antara keratan bersebelahan (kaedah langkah mantap). Ciri ini berada di makmal semasa ia disemak.

**Alat bantuan reka bentuk sahaja.** Aras air memerlukan semakan jurutera bertauliah sebelum sesiapa bergantung padanya: model 1D sebaik keratannya, nilai kekasaran, panjang reach dan sempadannya, dan ia tidak mengambil kira jambatan, gorong-gorong atau aliran yang keluar dari sungai.

## Lukis sungai

1. Bina dahulu permukaan tanah sedia ada (titik, garis pecah, atau TIN yang anda buka).
2. Di bawah **Permukaan** › {{ui:Lagi}}, pilih {{ui:River}}.
3. Klik sepanjang garis tengah sungai **dari hulu ke hilir**, kemudian tekan {{key:Enter}} atau klik dua kali.

CivilCraft memotong keratan tegak lurus pada garis tengah setiap 50 m (200 kaki), 100 m (300 kaki) ke setiap sisi, dari tanah. Stesen sungai diukur dari hujung hilir, jadi ia meningkat ke arah hulu. Tebing bermula sebagai anggaran 10 m (30 kaki) di kedua-dua sisi titik terendah setiap keratan.

Untuk menambah keratan di tempat sungai menyempit atau struktur terletak, pilih sungai, klik {{ui:Tambah keratan}} dan lukis garis potong merentasinya (mana-mana arah: ia dipusingkan supaya berjalan dari kiri ke kanan menghadap hilir).

## Sediakan sungai

Pilih sungai untuk melihatnya dalam **Sifat**:

- **Rejim aliran**: subkritikal (kes biasa: dikira ke hulu dari sempadan hilir), superkritikal (dikira ke hilir dari sempadan hulu) atau campuran (kedua-duanya, kemudian yang mempunyai daya tentu lebih besar pada setiap keratan; pratonton).
- **Profil aliran**: nama dan aliran bagi setiap satu (contohnya aliran 10 tahun dan 100 tahun), dan sempadan di hujung hilir (dan hujung hulu apabila rejimnya bukan subkritikal): **Kedalaman normal** dengan cerun tenaga (cerun dasar ialah anggaran pertama), aras **Permukaan air diketahui**, atau **Kedalaman genting**.
- **Keratan dari tanah**: jarak, sejauh mana ke kiri dan kanan, anggaran tebing dan dua nilai n Manning; {{ui:Potong keratan semula}} menggantikan keratan (satu langkah buat asal).
- **Jadual keratan**: bagi setiap keratan, ofset tebing kiri dan kanan, n saluran dan n limpahan, panjang reach ke keratan seterusnya di hilir (dataran limpahan kiri, saluran, dataran limpahan kanan; diukur dari pelan untuk bermula) dan pekali pengecutan serta pengembangan (0.1 dan 0.3 untuk permulaan: peralihan beransur). {{ui:Sunting}} membuka penyunting keratan (seterusnya); titik selepasnya bermaksud keratan itu mempunyai tanggul atau kawasan tidak berkesan.

Setiap perubahan ialah satu langkah buat asal ({{key:Mod+Z}}).

## Sunting keratan: tebing, tanggul dan kawasan tidak berkesan

{{ui:Sunting}} pada keratan melukis tanahnya dan membenarkan anda menyeret apa yang dibaca oleh penyelesai: **tebing kiri dan kanan** (ia membahagikan keratan kepada dataran limpahan kiri, saluran utama dan dataran limpahan kanan), **tanggul** di mana-mana sisi dan **kawasan aliran tidak berkesan**. Setiap pemegang juga boleh dialihkan dengan kekunci anak panah, dan setiap nombor boleh ditaip di sebelah plot. {{ui:Guna}} ialah satu langkah buat asal.

- **Tanggul** mempunyai kedudukan (ofset) dan aras puncak. Tanah di luar tanggul, jauh dari sungai, dipisahkan daripada sungai selagi paras air berada di bawah puncak: kawasannya, perimeter basah dan konveyansnya ditinggalkan. Di atas puncak, seluruh keratan dikira semula. Tanggul berdiri di luar tebing yang dilindunginya; yang berada di dalam tebing ditandakan.
- **Kawasan aliran tidak berkesan** memegang air tetapi tidak membawa aliran (kolam di belakang benteng, air mati di sebelah pendekatan jambatan). Beri dua ofsetnya dan, jika mahu, paras air yang di bawahnya ia tidak berkesan ({{ui:sentiasa}} jika kosong): di atas paras itu ia mengalir seperti yang lain. Yang menutupi sebahagian saluran utama ditandakan.
- Antara dua keratan, had banjir meninggalkan kering tanah di belakang tanggul yang dimiliki kedua-dua keratan, selagi permukaan air di situ berada di bawah puncak (garisan antara dua puncak adalah lurus).

## Kira dan baca keputusan

Klik {{ui:Profil permukaan air}}. Bagi profil yang anda pilih, anda mendapat:

- **plot** sepanjang sungai (aliran dari kiri ke kanan): dasar saluran, tebing, permukaan air, garisan tenaga dan permukaan air genting; keratan yang dikekalkan pada kedalaman genting dibulatkan;
- **jadual** bagi setiap keratan: stesen sungai, aliran, dasar saluran, permukaan air, permukaan air genting, garisan tenaga, kedalaman, halaju dalam saluran dan keseluruhan, nombor Froude saluran, kawasan aliran, lebar atas, aliran di setiap dataran limpahan dan saluran, cerun tenaga, serta amaran;
- **amaran** dalam perkataan biasa, contohnya keratan yang ditetapkan pada kedalaman genting, air di atas hujung keratan, atau perubahan besar konveyans antara dua keratan (tambah keratan di antaranya).

{{ui:Jadual (CSV)}}, {{ui:Laporan}} (teks biasa dengan kaedah, sempadan dan setiap jadual) dan {{ui:Plot (SVG)}} disimpan ke muat turun anda. Setiap satu membawa baris semakan.

Tandakan {{ui:Tunjukkan had banjir}} dalam **Sifat** untuk melorekkan kawasan basah pada pelan bagi profil yang dipilih, dengan garisan air dilukis di tempat kedalamannya sifar. Antara keratan, permukaan air adalah rata merentasi sungai dan berubah secara linear mengikut stesen sungai. Tanah di belakang tanggul dibiarkan kering selagi air berada di bawah puncaknya. Tanah rendah lain dalam koridor sungai yang tidak dapat dicapai air (contohnya di belakang tambakan jalan) tetap dilorek: semak.

## Pada lukisan dan dalam Masalah

Garisan sungai pergi ke pelan, PDF dan DWG pada lapisannya sendiri: **C-WATR-CNTR** (garis tengah), **C-WATR-SCTN** (setiap garis potong, dengan stesen sungainya) dan **C-WATR-FLOD** (garisan air had banjir, apabila {{ui:Tunjukkan had banjir}} ditandakan untuk profil). Amaran sungai (keratan yang ditetapkan pada kedalaman genting, air di atas hujung keratan, perubahan konveyans yang memerlukan lebih banyak keratan, keseimbangan tenaga yang tidak tertutup, tanggul di dalam tebing) juga pergi ke panel **Masalah**, berkaitan sungai dan diletakkan pada keratan asalnya.

## Cara ia dikira

- Tenaga antara dua keratan: WS₂ + α₂V₂²/2g = WS₁ + α₁V₁²/2g + L·Sf + C·|α₂V₂²/2g − α₁V₁²/2g|.
- Konveyans mengikut subbahagian: setiap dataran limpahan dibahagi di tempat n-nya berubah, K = Σ (1/n)·A·R^(2/3) (1.486/n dalam unit AS); saluran ialah satu bahagian, dengan n komposit apabila n-nya berubah. α datang daripada cara konveyans dibahagi.
- Cerun geseran mengikut konveyans purata, Sf = ((Q₁ + Q₂)/(K₁ + K₂))², ke atas panjang reach berwajaran aliran.
- Pekali pengecutan apabila aliran dipercepatkan ke hilir, pengembangan apabila ia diperlahankan.
- Kedalaman genting = tenaga tentu terkecil. Setiap aras air diselesaikan pada kurungan, jadi ia tidak pernah melompat ke sisi genting yang salah; apabila tiada jawapan wujud, ia ditetapkan pada kedalaman genting dan ditandakan.

Program ini disemak terhadap kedalaman normal Manning, kedalaman genting dalam saluran segi empat tepat, dan contoh air balik Chow (*Open-Channel Hydraulics*, 1959, bab 10) yang diintegrasi secara bebas. Kaedah yang sama digunakan oleh program sungai 1D yang biasa, jadi pengiraan tangan atau nota pelajar boleh dipindahkan.

## Gorong-gorong dan jambatan

Dalam **Sifat** sungai, di bawah **Gorong-gorong dan jambatan**, {{ui:Tambah gorong-gorong}} atau {{ui:Tambah jambatan}} meletakkan satu di antara dua keratan (setiap bahagian mengekalkan sekurang-kurangnya dua). Profil di bawahnya tidak berubah; permukaan air sejurus di atasnya datang daripada struktur, dan profil diteruskan ke hulu dari situ. **Keputusan** menambah jadual bagi setiap struktur: air ekor, aras air hulu, kawalan yang menguasai, aliran melalui bukaan dan aliran di atas jalan atau dek. Aliran subkritikal sahaja.

- **Gorong-gorong** (kotak atau bulat, satu atau lebih laluan sama besar). Kawalan masuk ialah aliran empangan selagi pintu masuk bebas dan aliran orifis apabila ia tenggelam, dicampur antara hulu satu dan satu setengah kali ketinggian naik. Kawalan keluar ialah keseimbangan tenaga: kehilangan masuk, geseran dan kepala halaju keluar, ke atas yang lebih tinggi antara air ekor dan titik tengah kedalaman genting serta puncak, tolak kejatuhan sepanjang laluan. Aras hulu ialah yang lebih besar antara kedua-duanya. Tandakan **Air boleh melimpah di atas jalan** dan aliran empangan jalan berkongsi aliran dengan laluan.
- **Jambatan.** Bukaan ialah keratan di bawah jambatan, dipotong pada abutmen, dengan setiap tiang sebagai kawasan yang tidak membawa aliran. Permukaan air dalam bukaan datang daripada keratan di bawah (pekali pengembangan), dan keratan di atas daripada bukaan (pekali pengecutan). Jika bukaan tidak dapat melepasi aliran pada air ekor itu, ia berjalan pada kedalaman genting dan jambatan ditandakan sebagai tersekat. Jika air mencapai tali bawah, aliran ialah aliran tekanan (jenis pintu air selagi air ekor berada di bawah tali bawah, tenggelam di atasnya), dan air di atas dek menambah aliran empangan; aras hulu ialah aras yang pada keadaan itu jumlahnya sama dengan aliran.

Pekali (nyahcas, kehilangan masuk, empangan) ialah nilai lalai nombor bulat yang ditaip. Tukarkannya untuk reka bentuk anda. Ia bukan carta lengkung yang dicetak dalam manual reka bentuk gorong-gorong, jadi layan aras hulu gorong-gorong yang hampir had sebagai anggaran. Air di atas jalan atau dek, pintu masuk yang tenggelam, bukaan yang tersekat dan aliran laju dalam laluan ditunjukkan dalam **Masalah**.

## Aliran tidak mantap

{{ui:Aliran tidak mantap…}} dalam **Sifat** sungai menghalakan hidrograf banjir sepanjang keratan. Taip masukan sebagai jam dan aliran, satu pasangan setiap baris, cerun hilir (kedalaman normal) dan berapa lama untuk dijalankan. Ia bermula dari permukaan air mantap pada aliran pertama dan menyelesaikan persamaan satu dimensi penuh (skema empat titik tersirat, dengan pemberat 0.6 dalam masa). Anda mendapat aras air dan aliran puncak pada setiap keratan dengan jam setiap satu berlaku, plot aliran di dua hujung, dan semakan isipadu (masuk, keluar dan perubahan yang disimpan). Ia disemak untuk aliran mantap kekal mantap, langkah dalam masukan berakhir pada profil mantap aliran baharu, isipadu tertutup, dan kelajuan gelombang banjir berbanding gelombang kinematik. Aliran subkritikal, satu reach, tiada masukan sisi, dan tiada gorong-gorong atau jambatan dalam larian.

## Simpang

Reach yang bergabung mengalirkan kepada satu outlet: alirannya ditambah, dan permukaan air di hulu reach hilir dibawa ke hujung reach yang menyertainya (permukaan air sama di simpang, kaedah ringkas: tiada sudut, tiada momentum, jadi sesuai untuk nombor Froude rendah). Model dan ujian sudah ada (`river-structures.js`); panel untuk menggabungkan dua sungai pada pelan belum dibina.

## Belum dibina

Empangan dan pintu sebagai struktur tersendiri, panel untuk simpang, struktur dalam larian tidak mantap, dan aliran tidak mantap superkritikal. Larian rejim campuran menandakan lompatan hidraulik antara dua keratan tetapi tidak meletakkannya.

**Di mana sungai bercantum.** Dalam Sifat sungai, "Mengalir ke" menamakan sungai yang disertainya. Sungai yang bercantum diselesaikan bersama: sungai yang mengalir kepadanya membawa jumlah alirannya, dan setiap satunya berakhir pada permukaan air keratan pertama sungai itu (kaedah permukaan air sama; ia meninggalkan sudut dan momentum aliran). Untuk menggabungkan sungai utama dan anak sungai, lukis sungai pendek di bawah simpang dan biarkan kedua-duanya mengalir ke dalamnya. Keputusan menunjukkan jadual simpang. Nilai lalai dalam keputusan ini (pengecutan 0.1, pengembangan 0.3, saluran satu bahagian dengan kekasaran komposit, rejim campuran mengikut daya tentu) kekal sehingga jurutera menyemaknya, dan Keputusan menyatakannya.
