---
title: Sweep koridor jalan
summary: Hidupkan koridor untuk penjajaran, tetapkan nilai lorong, bahu dan cerun sisi, dan baca keratan, garis persilangan cerun serta kerja tanah yang dihasilkannya.
keywords: simpang, persilangan, jalan bertemu jalan, jalan sisi, simpang T, lintasan, aras pelantar, sambung, sambungan, superelevasi, super, kecondongan, lencongan, lencongan keluar, jadual kadar, cerun silang, putaran, koridor, himpunan, subhimpunan, keratan tipikal, jalan, lorong, bahu, cerun silang, cerun sisi, daylight, potongan, tambakan, keratan, sasaran, sasaran lebar, sasaran aras, sasaran ofset, pelebaran, tepi turapan, ikut koridor lain
from: 6dcb92b3
---

Koridor menyapu satu keratan tipikal yang ringkas (himpunan) sepanjang penjajaran dan profil reka bentuknya, menggredkannya ke dalam tanah sedia ada dan menambah hasilnya pada permukaan dicadangkan. Satu penjajaran boleh membawa beberapa koridor pada julat stesen yang berbeza, dan koridor boleh dibina daripada templat boleh guna semula mengikut stesen ([Templat koridor](topic:corridor-templates)). Himpunan ringkas di bawah adalah sama pada kedua-dua sisi; untuk memberi setiap sisi bahagiannya sendiri, lihat [Bina setiap sisi daripada bahagian](topic:corridor#build-each-side-from-parts).

## Himpunan

Dari garis tengah ke luar, pada setiap sisi:

1. **lorong** dengan lebar tertentu, menurun dari puncak jalan pada **cerun lorong**
2. **bahu** dengan lebar tertentu pada **cerun bahu**
3. **cerun sisi** dari tepi bahu sehingga bertemu tanah: **cerun potongan** apabila tanah berada di atas, **cerun tambakan** apabila tanah berada di bawah

Nilai permulaan ialah nilai ganti, bukan piawaian reka bentuk:

| Nilai | Kaki AS | Meter |
|---|---|---|
| Lebar lorong | 12 ft | 3.6 m |
| Cerun lorong | 2% | 2% |
| Lebar bahu | 4 ft | 1.2 m |
| Cerun bahu | 4% | 4% |
| Cerun potongan | 2 : 1 | 2 : 1 |
| Cerun tambakan | 3 : 1 | 3 : 1 |
| Keratan setiap | 10 ft | 5 m |

Cerun sisi dinyatakan sebagai mengufuk kepada menegak (H:V): 3 : 1 bermaksud 3 melintang untuk 1 menegak.

## Bina koridor

Anda memerlukan penjajaran tanpa ralat dan profil reka bentuk dengan sekurang-kurangnya dua PVI dan tanpa ralat.

1. Pilih penjajaran.
2. Dalam panel kanan, di bawah **Koridor**, tandakan **Sweep himpunan sepanjang profil reka bentuk**.
   Medan muncul dan koridor dibina serta-merta. Pelan menunjukkan tepi lorong dan bahu serta garis persilangan cerun; dengan {{ui:Dicadangkan (diratakan)}} dipilih di bawah **Paparan**, kontur menunjukkan tanah baharu.
3. Tukar mana-mana nilai: **Lebar lorong**, **Cerun lorong**, **Lebar bahu**, **Cerun bahu**, **Cerun potongan**, **Cerun tambakan**, **Keratan setiap**. Tekan {{key:Enter}} selepas setiap satu. Cerun potongan, cerun tambakan dan jarak keratan mesti lebih daripada 0.
4. Baca baris di bawah medan, contohnya "39 keratan dari 0+00.00 hingga 3+86.36; potongan 240.2 cu yd, tambakan 556.0 cu yd."

Keratan dipotong pada setiap langkah **Keratan setiap**, di hujung, dan pada permulaan dan penamat setiap lengkung mengufuk dan menegak. Setiap keratan dan garis yang melaluinya (garis tengah, tepi lorong dan bahu, persilangan cerun) menjadi garis putus bagi permukaan dicadangkan.

Untuk mematikan koridor, nyahtandakan kotak. Nilainya dikekalkan untuk kali seterusnya.

## Apabila ia tidak dapat dibina

Kotak merah di bawah medan menerangkan sebabnya:

| Mesej | Apa yang perlu dilakukan |
|---|---|
| "Koridor memerlukan profil reka bentuk tanpa ralat." | Tambah PVI, atau betulkan lengkung menegak yang bertindih (lihat [Reka bentuk profil menegak](topic:profile)). |
| "Profil reka bentuk tidak bertindih dengan penjajaran." | Alihkan PVI ke julat stesen penjajaran. |
| "Koridor memerlukan sekurang-kurangnya dua keratan pada permukaan." | Kebanyakan koridor berada di luar tanah sedia ada. |
| "4 cerun sisi keluar dari permukaan sebelum bertemu tanah." | Berhampiran tepi permukaan, cerun tidak dapat mencapai tanah. Jauhkan jalan dari tepi, atau rendahkan ketinggian tambakan atau potongan di situ. |
| "Garis persilangan cerun koridor bersilang (keratan bertindih, contohnya di bahagian dalam lengkung yang ketat). Gunakan jejari yang lebih besar atau himpunan yang lebih sempit." | Keratan di bahagian dalam lengkung tajam bertindih. Tingkatkan jejari atau sempitkan himpunan. |

Koridor yang bermasalah tidak digredkan masuk dan tidak dikira dalam kerja tanah.

## Koridor dan pelantar bersama

Permukaan dicadangkan dibina mengikut susunan: setiap koridor dahulu, kemudian setiap pelantar. Apabila penggredan pelantar bertindih dengan koridor, pelantar didahulukan. Apabila item kemudian bertindih dengan jalan, hanya bahagian jalan dalam garis persilangan cerun item kemudian itu yang digantikan; bahagian jalan selebihnya, dan mana-mana garis putus tanah yang dilintasi jalan, kekal bentuknya. Isipadu dikira dalam semua garis persilangan cerun secara serentak; lihat [Isipadu kerja tanah](topic:volumes).

## Superelevasi

Melalui lengkung, jalan boleh condong ke arah dalam, supaya lalu lintas ditolak kurang ke arah luar. Tandakan **Superelevasikan lengkung** di bawah **Superelevasi** dalam **Sifat** penjajaran:

- Setiap lengkung bulat mengambil kadar **e** daripada jadual kadar: baris pertama yang jejarinya dicapai lengkung (baris dengan kadar kosong mengekalkan puncak normal). Jadual dan **Kecerunan relatif maksimum** (0.5 % untuk permulaan) ialah nilai ganti, bukan piawaian: tetapkannya daripada kriteria reka bentuk anda sendiri. Tambah atau alih keluar baris mengikut keperluan.
- Lorong berputar mengelilingi garis tengah. Sebelum lengkung, lorong luar mendatar sepanjang **lencongan keluar** (puncak normal ÷ e × lencongan), kemudian sepanjang **lencongan** (lebar lorong × e ÷ kecerunan) lorong luar terus berputar sehingga keseluruhan jalan menurun pada e ke arah dalam; dua pertiga lencongan terletak sebelum lengkung dan satu pertiga di atasnya. Selepas lengkung, perkara yang sama berlaku secara terbalik.
- Bahu di sisi rendah tidak pernah lebih mendatar daripada lorongnya; di sisi tinggi ia mengekalkan cerunnya sendiri (ia bergolek).
- Jadual di bawahnya menyenaraikan jejari, kadar, lencongan dan lencongan keluar setiap lengkung serta tempat superelevasi penuh bermula dan berakhir. **Rajah superelevasi** melukis cerun silang kedua-dua lorong sepanjang stesen (lorong kiri pepejal, lorong kanan putus-putus).
- Lengkung yang terlalu pendek untuk mencapai superelevasi penuh, atau dua lengkung yang peralihannya bertindih, dinyatakan dalam kotak di atas jadual.

Keratan, isipadu, paparan 3D dan helaian semuanya menunjukkan jalan condong. Setiap perubahan ialah satu langkah: {{key:Mod+Z}} membuat asal perubahan itu.

## Sasaran

Sasaran mengalihkan satu titik pada satu sisi jalan ke garis: **Tepi turapan** atau **Tepi bahu**, pada **Kiri** atau **Kanan**. Setiap keratan bertemu garis tegak lurus dengan garis tengah, merentang ke sisi itu sahaja, jadi sasaran di kanan tidak sekali-kali mengalihkan sisi kiri.

| Tetapkan | Apa yang berlaku di tempat keratan bertemu garis |
|---|---|
| **Lebar** | Titik terletak pada garis: lorong (atau bahu) melebar atau menyempit kepadanya, dengan mengekalkan cerun silangnya. |
| **Aras** | Titik mengambil aras garis di situ, pada ofsetnya sendiri: cerun silang lorong (atau bahu) mengikutinya. |

Garis itu boleh menjadi garis ciri (apa jua **Penggunaannya**) atau garis koridor lain: garis tengahnya, tepi turapan, tepi bahu atau garis persilangan cerun. Garis koridor mengikut koridor itu: tukar jalan lain dan jalan ini mengikutinya. CivilCraft membina koridor lain dahulu; dua koridor yang akan menyasarkan satu sama lain dalam gelung ditolak di satu pihak, dan jadual menyatakan yang mana.

1. Pilih penjajaran dan hidupkan koridornya.
2. Di bawah **Sasaran**, klik {{ui:Tambah sasaran}}.
3. Pilih **Sisi**, **Titik**, apa yang **Ditetapkan** dan **Ke garis**. Setiap perubahan ialah satu langkah buat asal.

**Hasil** menyatakan di berapa banyak keratan garis itu dicapai. Keratan yang tidak mencapainya (melepasi hujungnya, atau di belakang garis tengah) mengekalkan nilai himpunan. Garis yang dipadam membiarkan koridor seperti sebelum sasaran, dan jadual menyatakannya. Satu sisi boleh mempunyai satu sasaran lebar dan satu sasaran aras bagi setiap titik.

## Bina setiap sisi daripada bahagian

Hidupkan **Bina setiap sisi daripada bahagian** di bawah tetapan koridor. Setiap sisi kemudian mempunyai senarainya sendiri, dari garis tengah ke luar: lorong, bahu, longkang tepi, kerb, jalur tanaman, kaki lima dan, akhir sekali, cerun sisi ke tanah (dengan nisbah potongan dan tambakannya sendiri). Mulakan dari {{ui:Jalan luar bandar}} atau {{ui:Jalan bandar}}, tambah dan alih keluar bahagian, alihkannya dengan anak panah, dan {{ui:Salin}} satu sisi ke sisi lain. Setiap perubahan ialah satu langkah buat asal.

Cerun silang ialah penurunan menjauhi jalan, jadi kaki lima yang mengalir ke arah jalan adalah negatif. Kerb ialah muka dengan ketinggian yang anda beri, bahagian atas dengan lebar yang anda beri dan titisan pilihan di belakang. Superelevasi memusingkan setiap lorong dalam baris pertama; longkang tepi, kerb, jalur dan kaki lima tergantung dari tepi lorong seperti yang dibina. Sasaran masih mengalihkan hujung lorong dan bahagian terakhir. Keratan rentas menanda garis aliran longkang tepi, bahagian atas dan belakang kerb, dan selebihnya. Pada lengkung dengan spiral, lencongan ialah spiral: puncak rata pada TS, superelevasi penuh pada SC.

## Lapisan turapan

Lorong, bahu, longkang tepi, jalur tanaman atau kaki lima boleh membawa binaannya: di bawah bahagian, {{ui:Tambah lapisan}} menambah lapisan dengan nama, bahan, ketebalan dan jenisnya (permukaan, pengikat, asas, sub-asas, penutup atau lain-lain), dari atas ke bawah. Lapisan tidak menggerakkan permukaan jalan (bahagian atasnya ialah permukaan reka bentuk); setiap lapisan terletak di bawah bahagiannya, kedalamannya diukur tegak ke bawah. Keratan rentas melukis dasar setiap lapisan sebagai garis putus-putus, dan {{ui:Lapisan turapan: kuantiti}} menyenaraikan luas pelan dan isipadu setiap lapisan (luas sepanjang koridor daripada keratannya, isipadu = luas × ketebalan). Eksport IFC menulis setiap lapisan sebagai elemennya sendiri dengan ketebalan dan bahannya (lihat [Eksport dan import IFC](topic:ifc)). Ketebalan yang anda taip adalah milik anda: CivilCraft tidak menentukan saiz turapan.

## Di tempat jalan bertemu jalan, pelantar dan laluan

Dengan {{ui:Sambung jalan dan pelantar yang ditemuinya}} dihidupkan (ia dihidupkan bagi setiap koridor), CivilCraft menyambungkan koridor kepada apa yang ditemuinya dalam pelan:

- **Jalan yang berakhir pada jalan lain** (hujung penjajarannya terletak pada jalan lain, atau dalam lebih kurang separuh lebar turapannya sendiri dari tepi jalan itu) ialah jalan sisi bagi sebuah simpang. Jalan yang ditemuinya membuka tepinya untuk turapan jalan sisi: merentasi mulut, bahu, kerb, jalur dan kaki lima dibentangkan pada cerun silang lorong dan dilukis sebagai turapan. Jalan sisi dibentangkan pada permukaan jalan utama di tempat kedua-duanya bertindih, dan dilandaikan naik atau turun kepadanya sepanjang pendekatan.
- **Dua jalan yang bersilang** disambung dengan cara yang sama di kedua-dua sisi. Jalan yang disenaraikan dahulu di bawah Penjajaran ialah jalan lalu; satu lagi mengikut permukaannya merentasi.
- **Jalan yang berakhir di pelantar** (di dalamnya, atau dalam lebih kurang separuh lebar turapannya dari tepinya) tiba pada aras pelantar dan dilandaikan kepadanya sepanjang pendekatan.
- **Laluan** (Landskap › Landskap keras) berhenti di tepi luar jalan, pada aras kaki lima atau bahu di situ, bukannya terbentang di atas jalan. Laluan yang merentasi jalan menjadi dua bahagian. Hujung yang dilukis sedikit pendek dari jalan (dalam dua kali lebar laluan) dibawa terus ke tepinya.

**Sifat** menyatakan apa yang disambungkan oleh setiap koridor, sebanyak mana ia dinaikkan atau diturunkan di situ dan sepanjang apa. Panjang itu ialah yang lebih besar antara 10 m (30 ft) dan dua puluh kali perubahan, dan tidak sekali-kali lebih daripada 45% koridor. **Profil reka bentuk tidak diubah**: paparan profil masih menunjukkan garis kecerunan yang anda lukis, dan keratan, permukaan dicadangkan, isipadu dan paparan 3D menunjukkan jalan seperti yang disambungkan. Untuk menjadikan sambungan tepat mengikut reka bentuk, alihkan PVI terakhir ke aras yang dilaporkan oleh Sifat.

Matikan suis pada koridor untuk membiarkannya tepat seperti yang dinyatakan profil dan himpunannya; ia kemudian tidak mengambil bahagian dalam mana-mana simpang, sama ada sebagai jalan sisi atau jalan lalu. Jalan yang bertemu hampir sebaris (di bawah lebih kurang 20°) dibiarkan, begitu juga trek.

Apa yang belum dilakukan oleh simpang: tiada pemulangan kerb (sudut ialah bucu tegak), tiada lorong pusingan atau pulau, hujung jalan sisi dipotong tegak kepada penjajarannya sendiri, dan koridor yang dibina daripada templat membuka tepinya dengan cara biasa yang sama (parit atau dinding dalam keadaan hujungnya diratakan merentasi mulut, tanpa kalvert). Untuk pemulangan kerb pelan, segi tiga penglihatan dan penandaan, lihat [Tanah, jalan, tinjauan, lombong dan pautan](topic:soils-roads-survey-mines-links).

## Apa yang belum dibina

Sasaran untuk cerun persilangan belum tersedia. Bagi koridor yang berubah sepanjang jalan, dengan kiri dan kanan diasingkan, gunakan [Templat koridor](topic:corridor-templates). Lihat [Belum dibina](topic:not-built-yet).
