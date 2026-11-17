---
title: Reka landasan kereta api
summary: Jadikan penjajaran sebagai landasan kereta api: peralihan rel (clothoid, parabola kubik, Bloss, Helmert, separuh gelombang sinus, sinus), kant pada setiap lengkung dengan kant keseimbangannya, kekurangan dan lebihan, had geometri kant dan landasan sebagai amaran, simpang suis dan persilangan mengikut stesen, sampul kelegaan yang disapu sepanjang laluan, dan landasan dengan rel, bantalan dan katil balast yang dibina sebagai koridor, dalam pelan, keratan, profil, 3D dan kuantiti.
keywords: kereta api, rel, landasan kereta api, landasan, metro, trem, kant, superelevasi, kekurangan kant, lebihan kant, kant keseimbangan, peralihan, lengkung peralihan, clothoid, parabola kubik, bloss, helmert, separuh gelombang sinus, kosinus, tolok, tolok standard, tolok lebar, tolok metrik, tolok sempit, bantalan, rasuk melintang, balast, sub-balast, formasi, cess, jarak landasan, 60E1, 54E1, UIC60, 115RE, 136RE, kecerunan kant, kadar perubahan kant, simpang suis, suis, frog, nombor frog, pendahuluan, lengkung penutup, laju pencabangan, kelegaan, sampul kelegaan, tolok struktur, tolok muatan, sampul kinematik, platform, jurang platform, kecerunan, lengkung menegak, jejari minimum, LandXML kant
from: 99de9745
---

Mana-mana penjajaran boleh menjadi landasan kereta api. Lengkungnya kemudian mendapat peralihan rel dan kant (superelevasi rel), dan koridornya dibina sebagai landasan: rel di atas bantalan pada katil balast, digred ke dalam tanah seperti jalan raya. Simpang suis dan persilangan boleh diletakkan padanya mengikut stesen, dan sampul kelegaan boleh disapu sepanjang laluan itu serta disemak terhadap apa yang berdiri di sisi landasan.

Setiap nombor di bawah ialah **nilai sementara**, bukan piawaian. Landasan kereta api menetapkan had mengikut laju talian, jenis landasan dan negara; tetapkannya mengikut piawaian landasan anda sendiri. CivilCraft tidak menyediakan jadual kebangsaan.

## Jadikan penjajaran sebagai landasan kereta api

1. Pilih penjajaran dan cari **Kereta api** dalam Sifat.
2. Tandakan **Penjajaran ini ialah landasan kereta api**. Setiap perubahan ialah satu langkah buat asal.
3. Tetapkan **Laju reka bentuk** di bahagian atas Sifat penjajaran: ia ialah laju talian yang kant disemak terhadapnya. **Kereta api paling perlahan** (dalam blok Kereta api) ialah laju yang lebihan kant disemak terhadapnya.

## Peralihan

Berikan setiap lengkung panjang spiral di kedua-dua hujung dalam jadual PI (**Spiral masuk**, **Spiral keluar**), kemudian pilih jenisnya dalam jadual lengkung blok Kereta api, atau **Peralihan untuk setiap lengkung**:

| Jenis | Kelengkungan sepanjang peralihan |
|---|---|
| Clothoid | bertambah secara sekata (spiral jalan raya) |
| Parabola kubik | y = x³ / (6·R·L), dengan L diukur sepanjang tangen; lengkung itu sendiri sedikit lebih panjang |
| Bloss | 3u² − 2u³ daripada kelengkungan penuh (u = bahagian panjang): bermula dan berakhir dengan lembut |
| Helmert | dua parabola, 2u² kemudian 1 − 2(1 − u)² |
| Separuh gelombang sinus | (1 − cos πu) / 2 |
| Sinus | u − sin(2πu) / 2π |

Semua kecuali parabola kubik berpusing sebanyak L / 2R, sama seperti clothoid. Stesen bergerak sepanjang panjang sebenar. LandXML mengekalkan jenis itu (spiType clothoid, cubicParabola, bloss, biquadratic, cosine, sinusoid).

## Kant

Taip **Kant** bagi setiap lengkung dalam milimeter. Jadual menunjukkan bagi setiap lengkung:

- **Kant keseimbangan** = G·v² / (g·R), dengan G ialah jarak antara pusat rel (**Pusat rel**, iaitu tolok ditambah lebar kepala rel melainkan anda menaipnya). Dengan G = 1500 mm, ini ialah 11.8·V² / R yang biasa (V dalam km/j, R dalam m).
- **Kekurangan** = kant keseimbangan pada laju talian − kant diterapkan.
- **Lebihan** = kant diterapkan − kant keseimbangan pada laju kereta api paling perlahan.
- **Tanjakan**: kecerunan kant paling curam sepanjang tanjakannya, dalam mm per meter.

Kant naik sepanjang setiap peralihan, berbentuk mengikut kelengkungannya: lurus bagi clothoid atau parabola kubik, berbentuk Bloss bagi Bloss, dan seterusnya. Hujung lengkung tanpa peralihan dinaikkan pada bahagian lurus sebelumnya, sepanjang yang diperlukan oleh had kecerunan kant, dan ini dinyatakan: kant kemudian berubah di tempat kelengkungan tidak berubah.

**Kant berpusing pada** menyatakan rel mana yang kekal pada profil reka bentuk: **rel rendah** (lazim), **rel dalam**, atau **pusat landasan** (setiap rel bergerak separuh kant). Profil reka bentuk ialah bahagian atas rel di situ.

**Rajah kant** melukis ketinggian setiap rel di atas profil sepanjang stesen; paparan profil dan helaian pelan dan profil mendapat perkara yang sama sebagai jalur di bawah profil.

## Had dan amaran kant

**Kant diterapkan paling banyak**, **Kekurangan kant paling banyak**, **Lebihan kant paling banyak**, **Kecerunan kant paling curam** dan **Perubahan kant paling pantas** (kecerunan pada laju talian, dalam mm/s) disemak pada setiap lengkung. Nilai yang melebihi had ialah amaran dalam blok Kereta api dan dalam panel Masalah, dengan had dan nilai yang ditemui. Tanpa laju reka bentuk, kekurangan dan kadar perubahan tidak disemak (nota akan menyatakannya).

## Landasan

Tetapkan **Tolok** (pratetap standard 1435 mm, lebar, metrik atau sempit, atau tolok anda sendiri), **Keratan rel** (60E1, 54E1, 49E1, 115RE, 136RE: dimensi yang diterbitkan sahaja), bilangan **Landasan** dan **Jarak antara landasan**, kemudian **Bantalan dan balast**: bahan bantalan, panjang, lebar, kedalaman dan jarak; kedalaman balast di bawah bantalan (pada rel rendah), bahu, cerun, sejauh mana bahagian atasnya berada di bawah bantalan; kedalaman sub-balast, cess melepasi hujung balast, dan kecondongan silang formasi.

Tekan **Bina landasan**. Ia dihidupkan pada koridor penjajaran, dibina sebagai landasan sepanjang profil reka bentuk: rel dan bantalan condong mengikut kant, formasi tidak. Cerun cahaya siang bermula dari tepi cess pada potongan dan cerun tambak koridor, dan landasan digred ke dalam permukaan cadangan seperti jalan raya.

- **Pelan**: kedua-dua rel bagi setiap landasan (lapisan C-RAIL-TRAK) dan, dengan lebih daripada satu landasan, pusat setiap landasan (C-RAIL-CNTR), pada skrin, dalam DXF, DWG, PDF dan helaian pelan dan profil.
- **Keratan**: bantalan, rel, dan bahagian bawah balast serta sub-balast dalam setiap keratan.
- **3D**: rel, setiap bantalan dan katil balast (Tunjuk › Landasan), juga dalam GLB, OBJ dan USD.
- **Kuantiti**: panjang landasan, rel (kedua-dua rel bagi setiap landasan, sepanjang garisan setiap landasan sendiri), bantalan, katil balast dan balast tolak bantalan, serta sub-balast, mengikut purata luas hujung antara keratan.

## Semakan geometri landasan

Selain kant, blok Kereta api menyemak talian itu sendiri terhadap enam had lagi (semuanya nilai sementara, semuanya milik anda untuk ditetapkan):

- **Kecerunan paling curam** bagi profil reka bentuk, dalam mm per meter.
- **Jejari lengkung menegak terkecil**, sebagai faktor k dalam R ≥ k·V² (R dalam meter, V dalam km/j). Lengkung menegak parabola dengan panjang L antara dua kecerunan mempunyai jejari L dibahagikan dengan perubahan kecerunan.
- **Lengkung menegak terpendek**.
- **Jejari lengkung terkecil** dalam pelan (0 mematikan semakan ini).
- **Lengkok atau lurus terpendek**, sebagai saat perjalanan pada laju talian: lengkok bulatan, atau lurus antara dua lengkung, yang lebih pendek daripada jarak itu akan diberi amaran. 1.8 s ialah nilai biasa "separuh laju dalam km/j, dalam meter".
- **Kadar perubahan kekurangan kant** sepanjang setiap peralihan, dalam mm/s pada laju talian.

**Geometri landasan** menyenaraikan kecerunan paling curam yang ditemui dan setiap lengkung menegak dengan jejarinya serta jejari yang diperlukan oleh laju talian. Lengkung menegak yang terletak pada peralihan atau tanjakan kant mendapat nota. Tanpa profil reka bentuk atau laju reka bentuk, semakan yang memerlukannya dilangkau dan nota akan menyatakannya.

## Simpang suis dan persilangan

Di bawah **Simpang suis dan persilangan**, tekan **Tambah simpang suis**. Ia diletakkan pada bahagian lurus terpanjang; tetapkan dalam jadual:

- **Stesen hujung suis**: tempat simpang suis bermula pada penjajaran ini.
- **Frog**: nombor frog N (1:N). Sudut frog ialah 2·atan(1 / 2N).
- **Sisi**: kiri atau kanan, dilihat ke arah peningkatan stesen.
- **Jarak persilangan** dalam meter: lebih daripada 0, simpang suis menjadi persilangan ke landasan selari pada jarak itu (dua simpang suis dan lurus di antaranya).

Jadual menunjukkan **Pendahuluan** (hujung suis ke frog), **Jejari** lengkung penutup, dan **Laju pencabangan** yang dibenarkan oleh jejari itu dengan had kekurangan kant anda dan tanpa kant. **Buat landasannya** menukar laluan bercabang kepada penjajaran tersendiri (suis, lengkung penutup, kemudian lurus pada sudut frog) dengan tetapan kereta api yang sama, sedia untuk dipanjangkan.

Pelan melukis dua rel bercabang bagi setiap simpang suis, garis tengahnya, tanda di hujung suis dan di frog, serta "1:N" (lapisan C-RAIL-TURN), pada skrin dan dalam DXF, DWG, PDF dan helaian. Paparan 3D melukis rel bercabang pada aras landasan utama.

Bentuknya ialah **nilai sementara**: suis lurus dan satu lengkung penutup daripada nombor frog. Simpang suis yang dibina mengikut piawaian landasan dan lukisan pengilang. Amaran: simpang suis yang melencong keluar daripada penjajaran, terletak pada lengkung, peralihan, kant atau lengkung menegak, atau bertindih dengan yang lain; dan nota apabila laju talian melebihi laju pencabangannya.

## Sampul kelegaan

Tandakan **Sapu sampul kelegaan sepanjang landasan ini**. Pilih **Garis luar** (dua bentuk sementara, atau **Garis luar anda sendiri** yang ditaip sebagai satu titik satu baris: ofset dari pusat landasan, kemudian ketinggian di atas bahagian atas rel, dalam meter), **Panjang kenderaan** dan **Pusat bogi**, dan, jika ada, **Tepi platform** (sisi, jarak dari pusat landasan, ketinggian di atas rel).

Di setiap stesen garis luar dicondongkan mengikut kant pada rel rendah dan dilebarkan oleh lengkung: bahagian tengah kenderaan bergerak masuk sebanyak b² / 8R, hujungnya keluar sebanyak (L² − b²) / 8R (b ialah pusat bogi, L panjang kenderaan, R jejari di situ, mengikut peralihan). Blok melukis keratan pada bahagian lurus dan di tempat ia paling lebar, dan menyenaraikan:

- **sampul paling lebar** dan di mana,
- **jarak landasan** yang ditetapkan berbanding jarak yang diperlukan oleh dua sampul jiran,
- ruang yang tinggal di **tepi platform**, atau sejauh mana ia berada di dalam,
- setiap garisan ciri, struktur paip dan penjajaran kereta api lain yang ditemui **di dalam sampul**.

Garisan ciri dengan ketinggian dinilai terhadap garis luar pada ketinggiannya di atas rel; tanpa profil reka bentuk, atau bagi titik tanpa ketinggian, ia dinilai dalam pelan sahaja dan senarai akan menyatakannya. Pelan menunjukkan dua tepi sampul (lapisan C-RAIL-CLRN) dengan silang pada setiap benda di dalamnya.

Garis luar yang ditawarkan ialah **nilai sementara, bukan tolok mana-mana landasan kereta api**. Taip tolok struktur landasan anda sebelum bergantung pada sebarang hasil.

## Dalam program lain

- **LandXML**: penjajaran kereta api ditulis dengan peralihannya (spiType) dan blok `Cant`: tolok, titik putaran, laju talian, dan stesen tempat setiap tanjakan kant bermula dan berakhir dengan kant diterapkan, kant keseimbangan dan kekurangan. Membuka fail LandXML dengan blok `Cant` menjadikan penjajaran itu landasan kereta api dengan kant tersebut.
- **IFC**: penjajaran dengan segmen kantnya, rel, bantalan, balast dan sub-balast.

## Belum dibina

Simpang suis dalam eksport IFC, keluarga simpang suis selain lengkung penutup tunggal (suis melengkung, frog hidung ayun, slip, berlian), peraturan tolok kinematik (sampul ialah garis luar tetap dengan lenturan lengkung), talian atas dan isyarat.

**Piawaian yang dirujuk.** Dalam blok Kereta api, "Piawaian untuk dirujuk" memilih Tiada atau Eropah (UIC dan EN). Memilih Eropah menamakan dokumen yang dirujuk oleh projek Eropah (EN 13803 untuk parameter penjajaran, EN 13232 untuk suis dan persilangan, EN 15273 untuk tolok, EN 13848 untuk kualiti geometri landasan) dan memberi setiap had sebuah kotak untuk klausa yang menjadi sumbernya. Tiada nombor daripada mana-mana piawaian dibina di dalamnya: had kant, kekurangan, lebihan, kecerunan dan kadar, geometri simpang suis dan tolok struktur masih nilai sementara, dan tetingkap itu menyatakannya. Seorang jurutera landasan menyemak setiap nilai terhadap teks piawaian itu sendiri, dan menaip klausa di sebelahnya, sebelum apa-apa dibina. Afrika Selatan dan jadual AREMA tidak termasuk dalam keluaran ini.
