---
title: Merancang jalur kereta api
summary: Jadikan alinyemen sebagai jalur kereta api: transisi rel (klotoid, parabola kubik, Bloss, Helmert, setengah gelombang sinus, sinus), cant di setiap lengkung dengan cant keseimbangannya, kekurangan dan kelebihan cant, batas cant dan geometri jalur sebagai peringatan, wesel dan crossover per stasiun, amplop ruang bebas yang disapu sepanjang jalur, serta jalur dengan rel, bantalan, dan balas yang dibangun sebagai koridor, dalam denah, potongan, profil, 3D, dan kuantitas.
keywords: kereta api, rel, rel kereta, jalur, jalur kereta api, kereta, metro, trem, cant, superelevasi, kekurangan cant, kelebihan cant, cant keseimbangan, transisi, kurva transisi, klotoid, parabola kubik, bloss, helmert, setengah gelombang sinus, kosinus, lebar sepur, sepur standar, sepur lebar, sepur meter, sepur sempit, bantalan, bantalan rel, balas, sub-balas, formasi, bahu (cess), jarak sumbu jalur, 60E1, 54E1, UIC60, 115RE, 136RE, gradien cant, laju perubahan cant, wesel, lidah wesel, persilangan wesel, crossover, jantung wesel, nomor jantung, lead, kurva penutup, kecepatan belok, ruang bebas, amplop ruang bebas, gauge struktur, gauge pemuatan, amplop kinematik, peron, celah peron, jarak jalur, gradien, lengkung vertikal, radius minimum, cant LandXML
from: 99de9745
---

Alinyemen mana pun dapat menjadi jalur kereta api. Lengkungnya kemudian mendapatkan transisi rel dan cant (superelevasi rel), dan koridornya dibangun sebagai jalur: rel di atas bantalan pada lapisan balas, diberi kemiringan ke dalam tanah seperti jalan. Wesel dan crossover dipasang padanya per stasiun, dan amplop ruang bebas dapat disapu sepanjang jalur serta diperiksa terhadap apa pun yang berdiri di sisi jalur.

Setiap angka di bawah ini adalah **placeholder**, bukan standar. Perusahaan kereta api menetapkan batasnya sesuai kecepatan lintas, jenis jalur, dan negara; tetapkan dari standar kereta api Anda sendiri. CivilCraft tidak menyediakan tabel nasional.

## Jadikan alinyemen sebagai kereta api

1. Pilih alinyemen dan temukan **Railway** di Properties.
2. Centang **This alignment is a railway track**. Setiap perubahan adalah satu langkah urungkan.
3. Atur **Design speed** di bagian atas Properties alinyemen: ini adalah kecepatan lintas tempat cant diperiksa. **Slowest trains** (di blok Railway) adalah kecepatan tempat kelebihan cant diperiksa.

## Transisi

Berikan panjang spiral di kedua ujung setiap lengkung pada tabel PI (**Spiral in**, **Spiral out**), lalu pilih jenisnya pada tabel lengkung di blok Railway, atau **Transition for every curve**:

| Jenis | Kelengkungan sepanjang transisi |
|---|---|
| Clothoid | bertambah secara merata (spiral jalan) |
| Cubic parabola | y = x³ / (6·R·L), dengan L diukur sepanjang garis singgung; lengkungnya sendiri sedikit lebih panjang |
| Bloss | 3u² − 2u³ dari kelengkungan penuh (u = bagian dari panjang): mulai dan berakhir dengan lembut |
| Helmert | dua parabola, 2u² lalu 1 − 2(1 − u)² |
| Sine half-wave | (1 − cos πu) / 2 |
| Sine | u − sin(2πu) / 2π |

Semua kecuali parabola kubik berbelok sebesar L / 2R, seperti klotoid. Stasiun berjalan sepanjang panjang sebenarnya. LandXML menyimpan jenisnya (spiType clothoid, cubicParabola, bloss, biquadratic, cosine, sinusoid).

## Cant

Ketik **Cant** setiap lengkung dalam milimeter. Tabel menampilkan untuk setiap lengkung:

- Cant **keseimbangan** = G·v² / (g·R), dengan G adalah jarak antara pusat rel (**Rail centres**, lebar sepur ditambah lebar kepala rel kecuali jika Anda mengetik sendiri). Dengan G = 1500 mm, ini adalah rumus 11.8·V² / R yang sudah dikenal (V dalam km/jam, R dalam m).
- **Kekurangan** = keseimbangan pada kecepatan lintas − cant yang diterapkan.
- **Kelebihan** = cant yang diterapkan − keseimbangan pada kecepatan kereta paling lambat.
- **Ramp**: gradien cant tercuram sepanjang rampanya, dalam mm per meter.

Cant naik di atas setiap transisi, membentuk bentuk kelengkungannya: lurus untuk klotoid atau parabola kubik, berbentuk Bloss untuk Bloss, dan seterusnya. Ujung lengkung tanpa transisi naik pada bagian lurus sebelumnya, sepanjang yang dibutuhkan oleh batas gradien cant, dan hal ini diberitahukan: cant kemudian berubah di tempat kelengkungan tidak berubah.

**Cant turns about** menyatakan rel mana yang tetap berada pada profil desain: **the low rail** (yang biasa), **the inner rail**, atau **the track centre** (masing-masing rel bergerak setengah cant). Profil desain adalah bagian atas rel di sana.

**Cant diagram** menggambar tinggi setiap rel di atas profil sepanjang stasiun; tampilan profil dan lembar denah serta profil mendapatkan hal yang sama sebagai pita di bawah profil.

## Batas cant dan peringatan

**Most applied cant**, **Most cant deficiency**, **Most cant excess**, **Steepest cant gradient**, dan **Fastest change of cant** (gradien pada kecepatan lintas, mm/s) diperiksa di setiap lengkung. Nilai yang melampaui batas menjadi peringatan di blok Railway dan di panel Problems, dengan batas dan nilai yang ditemukan. Tanpa kecepatan desain, kekurangan dan laju perubahan tidak diperiksa (catatan akan menyatakannya).

## Jalurnya

Atur **Gauge** (preset standar 1435 mm, lebar, meter, atau sempit, atau ukuran Anda sendiri), **Rail section** (60E1, 54E1, 49E1, 115RE, 136RE: hanya dimensi yang dipublikasikan), jumlah **Tracks** dan **Track centres**-nya, lalu **Sleepers and ballast**: bahan bantalan, panjang, lebar, tinggi, dan jaraknya; kedalaman balas di bawah bantalan (pada rel rendah), bahu, kemiringan, dan seberapa jauh puncaknya berada di bawah bantalan; kedalaman sub-balas, cess di luar kaki balas, dan kemiringan silang formasi.

Tekan **Build the track**. Ini aktif pada koridor alinyemen, dibangun sebagai jalur sepanjang profil desain: rel dan bantalan miring mengikuti cant, formasi tidak. Lereng daylight berjalan dari tepi cess di potongan dan timbunan koridor, dan jalur diberi kemiringan ke permukaan rencana seperti jalan.

- **Plan**: kedua rel setiap jalur (layer C-RAIL-TRAK) dan, jika lebih dari satu jalur, pusat setiap jalur (C-RAIL-CNTR), di layar, dalam DXF, DWG, PDF, dan lembar denah serta profil.
- **Sections**: bantalan, rel, serta dasar balas dan sub-balas di setiap potongan.
- **3D**: rel, setiap bantalan, dan lapisan balas (Tampilkan › Jalur), juga dalam GLB, OBJ, dan USD.
- **Quantities**: panjang jalur, rel (kedua rel setiap jalur, sepanjang garis masing-masing jalur), bantalan, lapisan balas dan balas dikurangi bantalan, serta sub-balas, dengan metode rata-rata luas ujung di antara potongan.

## Pemeriksaan geometri jalur

Selain cant, blok Railway memeriksa garis itu sendiri terhadap enam batas tambahan (semuanya placeholder, semuanya dapat Anda atur):

- **Steepest gradient** pada profil desain, dalam mm per meter.
- **Least vertical curve radius**, sebagai faktor k dalam R ≥ k·V² (R dalam meter, V dalam km/jam). Lengkung vertikal parabola dengan panjang L di antara dua gradien memiliki radius L dibagi perubahan gradien.
- **Shortest vertical curve**.
- **Least curve radius** pada denah (0 mematikan pemeriksaan ini).
- **Shortest arc or straight**, sebagai detik perjalanan pada kecepatan lintas: busur melingkar, atau bagian lurus di antara dua lengkung, yang lebih pendek dari jarak itu akan diberi peringatan. 1,8 s adalah angka yang sudah dikenal "setengah kecepatan dalam km/jam, dalam meter".
- **Rate of change of cant deficiency** sepanjang setiap transisi, dalam mm/s pada kecepatan lintas.

**Track geometry** mencantumkan gradien tercuram yang ditemukan dan setiap lengkung vertikal beserta radiusnya dan radius yang dibutuhkan oleh kecepatan lintas. Lengkung vertikal yang berada pada transisi atau rampa cant akan mendapat catatan. Tanpa profil desain atau tanpa kecepatan desain, pemeriksaan yang membutuhkannya dilewati dan catatan akan menyatakannya.

## Wesel dan crossover

Di bawah **Turnouts and crossovers**, tekan **Add a turnout**. Wesel ditempatkan pada bagian lurus terpanjang; atur di tabel:

- **Switch toe station**: tempat wesel dimulai pada alinyemen ini.
- **Frog**: nomor jantung N (1:N). Sudut jantung adalah 2·atan(1 / 2N).
- **Side**: kiri atau kanan, dilihat ke arah stasiun naik.
- **Crossover spacing** dalam meter: jika di atas 0, wesel menjadi crossover ke jalur sejajar yang berjarak sejauh itu (dua wesel dan bagian lurus di antaranya).

Tabel menampilkan **Lead** (ujung lidah wesel ke jantung), **Radius** dari kurva penutup, dan **Diverging speed** yang diizinkan radius itu dengan batas kekurangan cant Anda dan tanpa cant. **Make its track** mengubah rute belok menjadi alinyemen tersendiri (lidah wesel, kurva penutup, lalu lurus pada sudut jantung) dengan pengaturan kereta api yang sama, siap untuk diperpanjang.

Denah menggambar dua rel belok setiap wesel, garis pusatnya, tanda kecil di ujung lidah wesel dan di jantung, serta "1:N" (layer C-RAIL-TURN), di layar dan dalam DXF, DWG, PDF, dan lembar. Tampilan 3D menggambar rel belok pada level jalur utama.

Bentuknya adalah **placeholder**: wesel lurus dan satu kurva penutup dari nomor jantung. Wesel yang dibangun mengikuti standar perusahaan kereta api dan gambar pabrikan. Peringatan: wesel yang keluar dari alinyemen, berada pada lengkung, transisi, cant, atau lengkung vertikal, atau tumpang tindih dengan wesel lain; dan catatan jika kecepatan lintas di atas kecepatan belok wesel.

## Amplop ruang bebas

Centang **Sweep a clearance envelope along this track**. Pilih **Outline** (dua bentuk placeholder, atau **Your own outline** yang diketik sebagai satu titik per baris: offset dari pusat jalur, lalu tinggi di atas puncak rel, dalam meter), **Vehicle length** dan **Bogie centres**, dan, jika ada, **Platform edge** (sisi, jarak dari pusat jalur, tinggi di atas rel).

Di setiap stasiun, kerangka dimiringkan mengikuti cant terhadap rel rendah dan diperlebar oleh lengkung: bagian tengah kendaraan bergeser ke dalam sebesar b² / 8R, ujung-ujungnya ke luar sebesar (L² − b²) / 8R (b adalah bogie centres, L adalah panjang kendaraan, R adalah radius di sana, mengikuti transisi). Blok ini menggambar potongan pada bagian lurus dan di tempat terlebar, serta mencantumkan:

- **widest envelope** dan lokasinya,
- **track centres** yang diatur terhadap jarak yang dibutuhkan dua amplop tetangga,
- ruang yang tersisa di **platform edge**, atau seberapa jauh masuk ke dalamnya,
- setiap garis fitur, struktur pipa, dan alinyemen kereta api lain yang ditemukan **di dalam amplop**.

Garis fitur dengan elevasi dinilai terhadap kerangka pada tinggi di atas rel; tanpa profil desain, atau untuk titik tanpa elevasi, penilaian hanya dilakukan di denah dan daftar akan menyatakannya. Denah menampilkan dua tepi amplop (layer C-RAIL-CLRN) dengan tanda silang di setiap benda di dalamnya.

Kerangka yang ditawarkan adalah **placeholder, bukan gauge kereta api mana pun**. Ketik gauge struktur kereta api Anda sebelum mengandalkan hasilnya.

## Di program lain

- **LandXML**: alinyemen kereta api ditulis beserta transisinya (spiType) dan blok `Cant`: gauge, titik rotasi, kecepatan lintas, dan stasiun tempat setiap rampa cant dimulai dan berakhir dengan cant yang diterapkan, cant keseimbangan, dan kekurangan. Membuka file LandXML dengan blok `Cant` menjadikan alinyemen itu kereta api dengan cant tersebut.
- **IFC**: alinyemen beserta segmen cant-nya, rel, bantalan, balas, dan sub-balas.

## Belum dibuat

Wesel dalam ekspor IFC, keluarga wesel selain satu kurva penutup (wesel melengkung, jantung ayun, slip, diamond), aturan gauge kinematik (amplop adalah bentuk tetap dengan lemparan lengkung), jaringan listrik atas kepala, dan persinyalan.

**Standar yang dikutip.** Di blok Railway, "Standard to cite" memilih None atau European (UIC dan EN). Memilih European menyebutkan dokumen yang dikutip proyek Eropa (EN 13803 untuk parameter alinyemen, EN 13232 untuk wesel dan persilangan, EN 15273 untuk gauge, EN 13848 untuk kualitas geometri jalur) dan memberi setiap batas sebuah kotak untuk klausul asalnya. Tidak ada angka dari standar apa pun yang sudah tertanam: batas cant, kekurangan, kelebihan, gradien, dan laju perubahan, geometri wesel, serta gauge struktur, semuanya masih placeholder, dan jendela itu menyatakannya. Insinyur kereta api memeriksa setiap nilai terhadap teks standar itu sendiri, dan mengetik klausul di sebelahnya, sebelum apa pun dibangun. Afrika Selatan dan tabel AREMA belum ada dalam rilis ini.
