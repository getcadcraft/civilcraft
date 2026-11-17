---
title: Belum dibina
summary: Apa yang belum dilakukan oleh binaan CivilCraft ini, dan apa yang perlu dilakukan sebaliknya hari ini.
keywords: hilang, batasan, peta jalan, tidak tersedia, spiral, pelebaran, dwg, dxf, lubang masuk, detensi, keratan rentas, akan datang kemudian, had
from: a2d970ef
---

CivilCraft masih awal. Halaman ini menyenaraikan apa yang tidak dilakukan oleh binaan semasa, supaya anda tidak mencarinya. Tiada apa di sini dijanjikan mengikut tarikh.

## Titik

| Belum dibina | Sebaliknya, hari ini |
|---|---|
| Menambah fail titik kedua pada fail pertama | Gabungkan fail dalam penyunting teks atau hamparan dahulu |
| Mengeksport fail teks titik | Eksport LandXML (titik dikeluarkan sebagai CgPoints), guna GIS {{ui:Eksport}} (titik dengan medan P, N, E, Z dan D), atau {{ui:Salin}} titik ke dalam hamparan |
| Gaya label titik, simbol mengikut kekunci huraian, lengkung (lengkok) daripada kod garisan, fail kekunci huraian untuk dikongsi antara projek | Label menunjukkan nombor, aras dan huraian, atau kurang ([Tetapan CivilCraft](topic:settings)); kekunci disimpan dalam fail projek |
| Penukaran unit | Tukar fail sebelum mengimport; **Unit** hanya menukar label |

## Permukaan

| Belum dibina | Sebaliknya, hari ini |
|---|---|
| Lebih daripada satu permukaan dibina daripada titik | Satu projek bagi setiap permukaan |
| Menyembunyikan sempadan (dalam) | Guna **Tepi luar terpanjang** atau sempadan luar |
| Memilih atau menyunting satu garis putus yang dilukis | {{key:Mod+Z}}, atau {{ui:Alih keluar garis putus yang dilukis}} dan lukis semula |
| Menyunting permukaan yang dibaca daripada LandXML (garis putus, sempadan) | {{ui:Bina semula permukaan daripada titik}} |
| Menyunting permukaan yang dibuat daripada grid aras | Import semula grid dengan pilihan lain |
| Menukar permukaan yang dibaca daripada LandXML apabila sistem koordinat berubah | {{ui:Bina semula permukaan daripada titik}} dahulu |
| Aras titik berlabel dan nilai cerun | Baca dalam bar status, atau warnakan permukaan mengikut cerun dengan **Analisis cerun** dalam ruang kerja Landskap ([Pembentukan permukaan untuk landskap](topic:landscape-grading#grading-checks)) |

## Penjajaran dan profil

| Belum dibina | Sebaliknya, hari ini |
|---|---|
| Lengkung peralihan selain klotoid; lengkung peralihan antara dua lengkung (peralihan majmuk) | Lengkung peralihan klotoid di hujung lengkung tersedia; yang lain dinamakan dan dilangkau semasa import LandXML |
| Menyelitkan PI antara dua yang lain | Lukis semula penjajaran, atau taip semula koordinat PI |
| Penjajaran daripada objek, ofset, pelebaran | Lukis mengikut PI |
| Menaip K untuk lengkung menegak | Taip L (K dipaparkan) |
| Lengkung menegak bulat dan tidak simetri | Lengkung parabola simetri sahaja |
| Lebih daripada satu profil reka bentuk bagi setiap penjajaran | Satu penjajaran bagi setiap varian |
| Zum paparan profil, jalur profil di bawah profil | Paparan profil memuatkan seluruh penjajaran; plotkannya pada [helaian pelan dan profil](topic:plan-profile-sheets) |
| Keratan dalam DWG atau LandXML | Helaian keratan sebagai PDF; {{ui:CSV}} bagi luas dan isipadu |
| Garis sampel pada sudut, atau dengan lebar berbeza sepanjang jalan | Satu lebar setiap sisi bagi keseluruhan penjajaran |

## Koridor

| Belum dibina | Sebaliknya, hari ini |
|---|---|
| Median, penghadang dan superelevasi yang memutar templat | Lukis sebagai templat ([Templat koridor](topic:corridor-templates)); templat mengikut stesen belum mengambil superelevasi |
| Perubahan beransur antara templat dua kawasan (peralihan, tirus) | Tukar templat pada stesen, atau beri titik sasaran lebar kepada garisan yang dilukis sebagai tirus |
| Putaran pada tepi, superelevasi dalam LandXML | Superelevasi berputar tentang garis tengah pada lengkung bulat; lebarkan lorong dengan sasaran lebar kepada garis ciri |
| Sasaran bagi cerun sisi (persilangan cerun ke garisan atau permukaan), permukaan koridor tersendiri | Sasaran menggerakkan tepi turapan dan bahu ([Koridor](topic:corridor)); koridor digredkan ke dalam permukaan cadangan |
| Koridor dieksport sebagai jalan LandXML; koridor kedua pada penjajaran dalam eksport IFC | Permukaan cadangan dieksport |
| Templat rupa bumi yang menukar permukaan cadangan, dalam 3D atau dalam keratan | Ia memberi luas dan isipadu bagi setiap lapisan ([Templat rupa bumi](topic:corridor-templates#terrain-templates)) |
| Laluan sapuan dengan kelajuan, gelinciran tayar, masa stereng, treler stereng atau kelegaan badan; pustaka kenderaan reka bentuk piawai; laluan sapuan dilukis dengan menyeret kenderaan | Laluan sapuan kelajuan rendah sepanjang garis ciri atau penjajaran, dengan saiz kenderaan anda sendiri ([Laluan sapuan kenderaan](topic:swept-paths)) |

## Pembentukan permukaan dan isipadu

| Belum dibina | Sebaliknya, hari ini |
|---|---|
| Bangku, garis ciri terbuka yang digred ke dalam reka bentuk, pembentukan permukaan ke garis ciri dari tempat lain | Tutup garis ciri ([Garis ciri](topic:feature-lines)), atau gunakannya sebagai garis putus bagi tanah sedia ada |
| Menyelit atau mengalih keluar bucu garis ciri | Lukis semula garisan, atau buat ofset bertangga daripadanya |
| Lengkok dalam garis putus yang dilukis (melalui titik ukur), lengkung peralihan dalam garis ciri | Lukis garis ciri dengan lengkok dan gunakannya sebagai garis putus bagi tanah sedia ada |
| Pembentukan permukaan ke jarak, aras atau permukaan lain | Persilangan cerun ke tanah sedia ada sahaja |
| Menambah atau mengalih keluar sudut pelantar | Padam pelantar dan lukis semula |
| Isipadu TIN-ke-TIN (prisma), memilih saiz sel grid | Kaedah grid, saiz sel dipilih untuk anda |
| Kembang dan susut, tanah atas, kedalaman turapan | Guna faktor pada nombor yang dilaporkan sendiri |
| Kos angkutan percuma dan pengangkutan semula, angkutan merentas penjajaran berbeza, lubang pinjaman dan tapak buangan diletakkan pada pelan | Gambar rajah jisim dengan titik imbangan, isipadu dialih dan jarak angkutan purata |

## Rangkaian paip

| Belum dibina | Sebaliknya, hari ini |
|---|---|
| Lebih daripada satu rangkaian bagi setiap projek | Projek berasingan bagi saliran ribut dan kumbahan |
| Saluran air utama: kualiti dan umur air, kawalan berasaskan peraturan, jenis injap lain (kawalan aliran, pencekik, penahan), pam yang diberi kuasa, permintaan yang bergantung pada tekanan, pilihan Darcy–Weisbach, katalog paip dengan ketebalan dinding dan kelas tekanan. Selebihnya rangkaian tekanan ada dalam makmal: [Saluran air utama](topic:water-mains) | Semak itu dalam perisian agihan air; aliran reka bentuk kumbahan ada dalam [Aliran reka bentuk kumbahan](topic:sanitary-design) |
| Aliran pembetung mengikut masa (hidrograf, penghalaan dinamik, storan, pam, limpahan) | [Aliran reka bentuk kumbahan](topic:sanitary-design) memberi aliran puncak mantap yang digunakan oleh helaian reka bentuk |
| Kapasiti lubang masuk, sebaran longkang, penghalaan detensi, hidrograf, kehilangan tenaga selain satu pekali simpang | Semak dalam perisian lain; aliran, saiz dan garis kecerunan ada dalam [Saliran ribut](topic:storm-drainage) |
| Kawasan tadahan dalam plot PDF, DWG, DXF atau LandXML; kawasan tadahan daripada permukaan (pemisah air) | Lukis kawasan tadahan dengan tangan; ia disimpan dalam fail projek |
| Katalog paip, paip bukan bulat, struktur yang bukan kotak atau silinder tegak (kon, anak tangga, benching), kategori saliran dalam pustaka | Jenis struktur daripada parameter ([Rangkaian paip](topic:pipe-network)); paip dengan diameter |
| Paip dalam paparan profil, paip melengkung | Baca invert dan penutup dalam panel kanan |

## Lot

| Belum dibina | Sebaliknya, hari ini |
|---|---|
| Menyusun lot mengikut luas atau muka hadapan, lot daripada garisan sekelilingnya, hak laluan | Lukis setiap lot mengikut bucunya, atau masukkan butirannya |
| Jadual lengkung dan jadual garisan pada pelan; label dialih dengan tangan | Setiap segmen sempadan dilabel sepanjang dirinya |
| Lot dalam LandXML | Lot disimpan dalam fail projek dan dibawa ke PDF, DWG dan DXF |

## Terabas

| Belum dibina | Sebaliknya, hari ini |
|---|---|
| Pelarasan kuasa dua terkecil, peraturan transit, pemberatan sudut berbanding jarak | Peraturan kompas |
| Sudut pesongan, sudut zenit dan jarak cerun, aras melalui pengarasan trigonometri | Kurangkan kepada jarak mengufuk dan sudut dengan betul, atau bearing |
| Bidikan sisi, fail data mentah daripada pengumpul data | Import titik sebagai fail titik |

## Penandaan tapak

| Belum dibina | Sebaliknya, hari ini |
|---|---|
| Pancang ofset (titik rujukan diletakkan ke belakang dari pancang), pancang cerun di titik tangkapan | Tanda pada ofset yang anda perlukan, termasuk melepasi bahu |
| Menghantar pancang terus ke format sendiri pengumpul data | CSV dibuka dalam perisian pejabat bagi kebanyakan pengumpul data |
| Menanda paip, pelantar dan lot | Gunakan titik ukur berhampiran penjajaran, atau segmen lot |

## Fail dan output

| Belum dibina | Sebaliknya, hari ini |
|---|---|
| Teks, hatch (lorekan) dan dimensi daripada DWG atau DXF; ruang kertas; lukisan terpaut (rujukan luaran (Xref)); DXF binari | Garisan daripada ruang model dibuka ([Buka DWG atau DXF sebagai garisan](topic:open-dwg-dxf)); buka rujukan luaran secara berasingan |
| Mengalih beberapa titik sekali gus dengan menyeret | Potong dan tampal, atau sunting satu demi satu |
| Helaian potret, blok tajuk sendiri, viewport yang anda susun, helaian pelan dan profil dalam DWG | Satu helaian pelan landskap bagi setiap PDF, atau helaian pelan dan profil sepanjang penjajaran (PDF) |
| Memplot jalur aras dan profil | Jalur hanya pada skrin; ambil tangkapan skrin jika anda perlukannya |
| Menukar nama lapisan, warna atau gaya label | Tukar dalam program CAD selepas eksport DXF |
| Simpan awan dan sejarah versi | Simpan fail `.civilcraft.json` dan simpan sandaran; untuk bekerja pada satu projek bersama, gunakan sesi langsung dalam CadCraft Studio ([Reka bentuk satu tapak bersama, secara langsung](topic:work-live)) |
| CadCraft Studio untuk iPad dan iPhone, dan dari Google Play | Gunakan CivilCraft dalam pelayar pada peranti itu; pada Android, CadCraft Studio dipasang daripada APK-nya di getcadcraft.com/download |
| Membuka beberapa fail titik atau projek serentak | Satu fail bagi setiap buka (fail GIS yang berkaitan, seperti bahagian shapefile, dibuka bersama) |

## Landskap

| Belum dibina | Sebaliknya, hari ini |
|---|---|
| Kepala dan muncung pengilang | Kepala generik, atau tambah kepala anda sendiri daripada fail; data pengeluar dimasukkan apabila mereka memberi kebenaran |
| Panjang sisi maksimum bagi talian titisan, aliran mengikut masa, pam, rangkaian paip bergelung | Kekalkan larian titisan pada panjang yang diterbitkan pengeluar; semakan memerlukan rangkaian bercabang |
| Garis luar tepat bagi objek bentuk bebas cekung; isipadu bawah tanahnya diukur dengan tepat | Cangkerang cembung digredkan dan isipadu bawah tanah adalah anggaran (dinyatakan dalam Sifat) |
| Tumbuhan dalam Letak daripada pustaka milik BimCraft dan ModelCraft | Eksport IFC landskap dan buka dalam BimCraft di sebelah bangunan |
| Model tumbuhan terperinci (daun, dahan, musim) dalam paparan 3D; objek bentuk bebas dan pengairan dalam paparan 3D | Tumbuhan dipaparkan dalam 3D sebagai bentuk ringkas yang bersaiz mengikut senarai tumbuhan ([Lihat tapak dalam 3D](topic:site-3d)); taburan ModelCraft menghasilkan gambar penanaman |
| Dinding hardscape yang menahan aras digred di belakangnya pada permukaan | Beri platform atau pelantar sisi tegak: ia menjadi dinding penahan pada permukaan ([Pembentukan permukaan](topic:grading)) |
| Transformasi SVG dalam simbol anda sendiri; tekstur dan warna model tumbuhan GLB anda sendiri; geometri GLB terkompres | Ratakan transformasi dalam program lukisan anda dahulu; model dilukis dalam warna tumbuhan; eksport GLB tanpa pemampatan ([Grafik tumbuhan](topic:plant-graphics)) |
| Senarai tumbuhan anda sendiri disimpan dalam akaun pustaka anda (disunting dalam aplikasi) | Sunting senarai projek dalam jadual Tumbuhan dan simpan sebagai fail tumbuhan |
| Alat landskap untuk pembantu tanpa tetingkap (pelayan fail dan baris arahan) | Ia berfungsi dengan tetingkap CivilCraft dibuka ([Biarkan pembantu AI bekerja dengan tapak anda](topic:assistants)) |

## Talian kuasa

| Belum dibina | Sebaliknya, hari ini |
|---|---|
| Piawaian sesebuah negara dibina dalam (kes beban, kelegaan, faktor) | Tetapkan nilai piawai anda dalam {{ui:Kes beban dan had…}} dan simpan, bersama pustaka anda, sebagai pek untuk digunakan semula dan dikongsi ([Pek](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| Jarak sisi dari konduktor ke mahkota pokok atau dinding di sebelah talian | Kelegaan menegak terus ke atas tumbuhan dan dinding yang dilintasi talian ([Semakan talian kuasa](topic:power-line-checks#clearances)) |
| Rayapan konduktor dan regangan konduktor baharu | Ambil kira melalui suhu dalam jadual pemasangan |
| Penarafan haba kabel terkubur (penarafan arus daripada cara ia dipasang) | Masukkan penarafan arus pembekal anda pada item kabel |
| Kajian litar pintas, perlindungan dan pembumian | Gunakan program elektrik khusus; CivilCraft memberi panjang dan kabel rangkaian |
| Menara kekisi direka anggota demi anggota, dan sauh tali sokong dalam tanah | Tiang disemak mengikut beban nominal; tali sokong mengikut beban yang ditarafkan |
| Fail kajian `.DON` disemak dalam program yang membacanya | Semak fail di sana; hantar kami satu sampel supaya kami boleh menguji dengan yang sebenar |
| Talian kuasa dalam paparan 3D dan dalam IFC | Pelan, profil talian, helaian dan lapisan GIS |
| Alat talian kuasa untuk pembantu tanpa tetingkap | Ia berfungsi dengan tetingkap CivilCraft dibuka ([Biarkan pembantu AI bekerja dengan tapak anda](topic:assistants)) |

## Jisim bangunan

| Belum dibina | Sebaliknya, hari ini |
|---|---|
| Pustaka kod zon atau peraturan mana-mana bandar | Taip had daripada ordinan anda sendiri ([Had zon](topic:zoning-limits)) |
| Cahaya langit pada dinding (cahaya siang fasad), angin | [Jam matahari](topic:sun-hours) hanya mengira cahaya matahari terus |
| Teduhan daripada pokok, tumbuhan atau apa-apa yang tidak dilukis sebagai jisim | Lukis bangunan jiran sebagai jisim |
| Bentuk bumbung pada jisim | Jisim berbumbung rata |
| Bukaan, bumbung dan jenis dinding apabila jisim dibangunkan dalam BimCraft | BimCraft membina dinding luar biasa pada setiap aras dan satu lantai; tambah yang lain di sana |

## GIS dan sistem koordinat

| Belum dibina | Sebaliknya, hari ini |
|---|---|
| File Geodatabase; gaya KML, ikon, tindihan tanah dan pautan rangkaian | Tukar kepada GeoPackage, shapefile atau GeoJSON dahulu; penanda KML dibaca tanpa gaya |
| Menyunting ciri GIS atau atributnya | Sunting dalam program GIS dan import semula. Panel Analisis membuat lapisan baharu (penimbal, tindihan, cantum, pilihan) dan menambah medan luas dan panjang, tetapi ia tidak menyunting ciri di tempatnya |
| Analisis rangkaian dan raster, penimbal dengan hujung rata atau segi empat dan penimbal sebelah, menambah atau memadam baris dan menukar jenis medan dalam jadual atribut, warna kelas manual, petunjuk gaya dalam plot | Guna Pilih untuk memilih ciri dan buat lapisan daripadanya; hujung rata tidak ditawarkan. Pewarnaan mengikut atribut dan jadual atribut sudah dibina: lihat [Gaya lapisan mengikut atribut](topic:gis-symbology) dan [Kerja dengan jadual atribut lapisan](topic:gis-table) |
| Gaya label (saiz, penempatan) dan label yang mengelak antara satu sama lain | Label bersaiz sama dan mungkin bertindih apabila ciri padat |
| Datum menegak dan model geoid | Aras digunakan seperti yang diberi fail; semak datum menegak sendiri |
| Anjakan grid selain kepada NAD83 daripada NAD27 yang dicadangkan mengikut kawasan (OSTN15, NTv2 untuk datum lain berfungsi apabila anda menambah fail), beberapa grid sekaligus, grid menegak | Tambah fail grid untuk datum anda sendiri; satu grid bagi setiap projek |
| Lapisan peta dalam eksport DXF atau 3D | Lapisan peta masuk ke dalam plot PDF, dan di sebelah DWG sebagai gambar |
| Pelayan peta yang memerlukan log masuk, kunci atau token | Gunakan perkhidmatan awam, atau fail imej yang digeorujuk |
| Menulis fail LAS atau LAZ daripada permukaan, model tanah atau alat grid aras dan LiDAR | Eksport permukaan sebagai grid aras GeoTIFF. Add-on [Awan titik](topic:point-clouds) menulis awan yang telah dibersihkan sebagai LAS 1.4 atau LAZ |
| Keamatan, warna dan pulangan LiDAR; grid aras dengan beberapa jalur; fail grid atau LiDAR melebihi 200 MB | LiDAR ditapis mengikut kelas sahaja, grid menggunakan jalur pertama; potong fail besar kepada kepingan dahulu |

## Input

| Belum dibina | Sebaliknya, hari ini |
|---|---|
| Pemilihan kotak dengan sentuhan (ia memerlukan {{key:Shift}}) | Tekan lama setiap titik ukur untuk menambahnya |
| Koordinat atau jarak yang ditaip semasa melukis | Lukis secara kasar, kemudian taip koordinat PI tepat dalam jadual PI penjajaran |
| Menaip koordinat bagi sudut pelantar dan struktur | Seret gripnya; zum masuk untuk ketepatan dan perhatikan E dan N dalam bar status |
| Snap ke objek (selain titik ukur untuk garis putus) | Zum masuk dan perhatikan bar status |

## Paparan 3D

| Belum dibina | Sebaliknya, hari ini |
|---|---|
| Melukis atau menyunting dalam paparan 3D | Lukis dan sunting dalam pelan; paparan 3D mengikut setiap suntingan |
| Memilih garis ciri koridor atau ciri GIS dengan klik dalam 3D | Klik pada pelan |
| Mengeksport paparan berlebihan atau dalam kaki | Eksport adalah pada skala sebenar dalam meter; lihat [Eksport tapak dalam 3D](topic:export-3d) |
| Label dalam eksport GLB atau OBJ, saiz dan gaya label dalam 3D | Label dipaparkan dalam paparan 3D sahaja, satu saiz; lihat [Lihat tapak dalam 3D](topic:site-3d) |
| Tekstur daripada foto, merakam pemanduan sebagai video, bayang dari luar tapak, jam matahari dipaparkan dalam paparan 3D | Lapisan peta dihamparkan pada permukaan; pemanduan dan kedudukan matahari pada satu masa; [jam matahari](topic:sun-hours) untuk satu hari atau satu musim pada pelan |
