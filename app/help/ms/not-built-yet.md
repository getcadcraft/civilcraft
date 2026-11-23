---
title: Belum dibina
summary: Perkara yang belum dilakukan oleh binaan CivilCraft ini, dan apa yang perlu dilakukan sebaliknya hari ini.
keywords: hilang, had, peta jalan, tidak tersedia, spiral, pelebaran, dwg, dxf, lubang masuk, tahanan, keratan rentas, akan datang, had
from: b91588d4
---

CivilCraft masih awal. Halaman ini menyenaraikan perkara yang tidak dilakukan oleh binaan semasa, supaya anda tidak mencarinya. Tiada apa di sini dijanjikan mengikut tarikh.

## Titik

| Belum dibina | Sebaliknya, hari ini |
|---|---|
| Menambah fail titik kedua kepada yang pertama | Gabungkan fail dalam penyunting teks atau hamparan dahulu |
| Mengeksport fail teks titik | Eksport LandXML (titik keluar sebagai CgPoints), gunakan GIS {{ui:Eksport}} (titik dengan medan P, N, E, Z dan D), atau {{ui:Salin}} titik ke dalam hamparan |
| Gaya label titik, simbol mengikut kekunci huraian, lengkung (lengkok) daripada kod garisan, fail kekunci huraian untuk dikongsi antara projek | Label menunjukkan nombor, aras dan huraian, atau kurang ([Tetapan CivilCraft](topic:settings)); kekunci disimpan dalam fail projek |
| Penukaran unit | Tukar fail sebelum mengimport; **Unit** hanya melabel semula |

## Permukaan

| Belum dibina | Sebaliknya, hari ini |
|---|---|
| Lebih daripada satu permukaan dibina daripada titik | Satu projek bagi setiap permukaan |
| Menyembunyikan sempadan (dalam) | Gunakan **Tepi luar terpanjang** atau sempadan luar |
| Memilih atau menyunting satu garis putus yang dilukis | {{key:Mod+Z}}, atau {{ui:Alih keluar garis putus yang dilukis}} dan lukis semula |
| Menyunting permukaan yang dibaca daripada LandXML (garis putus, sempadan) | {{ui:Bina semula permukaan daripada titik}} |
| Menyunting permukaan yang dibuat daripada grid aras | Import semula grid dengan pilihan lain |
| Menukar permukaan yang dibaca daripada LandXML apabila sistem koordinat berubah | {{ui:Bina semula permukaan daripada titik}} dahulu |
| Aras titik dan nilai cerun berlabel | Baca dalam bar status, atau warnakan permukaan mengikut cerun dengan **Analisis cerun** dalam ruang kerja Landskap ([Penggredan untuk landskap](topic:landscape-grading#grading-checks)) |

## Penjajaran dan profil

| Belum dibina | Sebaliknya, hari ini |
|---|---|
| Spiral selain clothoid; spiral antara dua lengkung (peralihan majmuk) | Spiral clothoid di hujung lengkung tersedia; yang lain dinamakan dan dilangkau semasa import LandXML |
| Menyisipkan PI antara dua yang lain | Lukis semula penjajaran, atau taip semula koordinat PI |
| Penjajaran daripada objek, ofset, pelebaran | Lukis dengan PI |
| Menaip K bagi lengkung menegak | Taip L (K ditunjukkan) |
| Lengkung menegak bulat dan tidak simetri | Lengkung parabola simetri sahaja |
| Lebih daripada satu profil reka bentuk bagi setiap penjajaran | Satu penjajaran bagi setiap varian |
| Zum paparan profil, jalur profil di bawah profil | Paparan profil memuatkan seluruh penjajaran; plotkannya pada [helaian pelan dan profil](topic:plan-profile-sheets) |
| Keratan dalam DWG atau LandXML | Helaian keratan sebagai PDF; {{ui:CSV}} bagi luas dan isipadu |
| Garis sampel pada sudut, atau lebar berbeza di sepanjang jalan | Satu lebar bagi setiap sisi untuk keseluruhan penjajaran |

## Koridor

| Belum dibina | Sebaliknya, hari ini |
|---|---|
| Median, penghadang dan superelevasi yang memutarkan templat | Lukiskannya sebagai templat ([Templat koridor](topic:corridor-templates)); templat mengikut stesen belum mengambil superelevasi |
| Perubahan beransur antara templat dua kawasan (peralihan, tirus) | Tukar templat pada stesen, atau beri titik sasaran lebar kepada garis yang dilukis sebagai tirus |
| Putaran mengelilingi tepi, superelevasi dalam LandXML | Superelevasi berputar mengelilingi garis tengah pada lengkung bulat; lebarkan lorong dengan sasaran lebar ke garis ciri |
| Sasaran untuk cerun sisi (persilangan cerun ke garis atau permukaan), permukaan koridor sendiri | Sasaran mengalihkan tepi turapan dan bahu ([Koridor](topic:corridor)); koridor digredkan ke dalam permukaan dicadangkan |
| Pemulangan kerb, lorong pusingan dan pulau yang digredkan ke dalam simpang; hujung jalan sisi dipotong ke tepi jalan utama pada serong; laluan disambung kepada jalan dalam pelan, dalam panjang dan luasnya | Jalan yang bertemu disambung tegak, dengan tepi jalan utama dibuka dan jalan sisi dilandaikan kepadanya ([Di tempat jalan bertemu](topic:corridor#where-roads-meet-roads-pads-and-paths)); laluan berhenti di tepi jalan dalam permukaan dicadangkan dan dalam 3D |
| Koridor dieksport sebagai jalan LandXML; koridor kedua pada penjajaran dalam eksport IFC | Permukaan dicadangkan dieksport |
| Templat rupa bumi yang mengubah permukaan dicadangkan, dalam 3D atau dalam keratan | Ia memberi luas dan isipadu bagi setiap lapisan ([Templat rupa bumi](topic:corridor-templates#terrain-templates)) |
| Laluan sapuan dengan laju, gelinciran tayar, masa stereng, treler stereng atau kelegaan badan; pustaka kenderaan reka bentuk piawai; laluan sapuan dilukis dengan menyeret kenderaan | Laluan sapuan laju rendah sepanjang garis ciri atau penjajaran, dengan saiz kenderaan anda sendiri ([Laluan sapuan kenderaan](topic:swept-paths)) |

## Penggredan dan isipadu

| Belum dibina | Sebaliknya, hari ini |
|---|---|
| Bangku, garis ciri terbuka yang digredkan ke dalam reka bentuk, penggredan ke garis ciri dari tempat lain | Tutup garis ciri ([Garis ciri](topic:feature-lines)), atau gunakannya sebagai garis putus tanah sedia ada |
| Menyisipkan atau mengalih keluar bucu garis ciri | Lukis semula garis, atau buat ofset bertangga daripadanya |
| Lengkok dalam garis putus yang dilukis (melalui titik tinjauan), spiral dalam garis ciri | Lukis garis ciri dengan lengkok dan gunakannya sebagai garis putus tanah sedia ada |
| Penggredan ke jarak, aras atau permukaan lain | Persilangan cerun ke tanah sedia ada sahaja |
| Menambah atau mengalih keluar bucu pelantar | Padam pelantar dan lukis semula |
| Isipadu TIN-ke-TIN (prisma), memilih saiz sel grid | Kaedah grid, saiz sel dipilih untuk anda |
| Pengembangan dan pengecutan, tanah atas, kedalaman turapan | Gunakan faktor pada nombor yang dilaporkan sendiri |
| Kos angkutan percuma dan lebihan, angkutan merentasi penjajaran berbeza, lombong pinjaman dan tapak buangan diletakkan pada pelan | Gambar rajah angkutan jisim dengan titik imbangan, isipadu yang dipindahkan dan jarak angkutan purata |

## Rangkaian paip

| Belum dibina | Sebaliknya, hari ini |
|---|---|
| Lebih daripada satu rangkaian bagi setiap projek | Projek berasingan untuk storm dan kumbahan |
| Paip utama air: kualiti dan usia air, kawalan berasaskan peraturan, jenis injap lain (kawalan aliran, pencekik, penyokong), pam yang diberi kuasa, permintaan yang bergantung pada tekanan, pilihan Darcy–Weisbach, katalog paip dengan ketebalan dinding dan kelas tekanan. Selebihnya rangkaian tekanan ada dalam makmal: [Paip utama air](topic:water-mains) | Semak perkara itu dalam perisian pengagihan air; aliran reka bentuk kumbahan ada dalam [Aliran reka bentuk kumbahan](topic:sanitary-design) |
| Aliran kumbahan dari masa ke masa (hidrograf, laluan dinamik, storan, pam, limpahan) | [Aliran reka bentuk kumbahan](topic:sanitary-design) memberi aliran puncak mantap yang digunakan oleh helaian reka bentuk |
| Kapasiti lubang masuk, sebaran longkang, laluan tahanan, hidrograf, kehilangan tenaga selain satu pekali simpang | Semak dalam perisian lain; aliran, saiz dan garis kecerunan ada dalam [Saliran ribut](topic:storm-drainage) |
| Kawasan tadahan dalam plot PDF, DWG, DXF atau LandXML; kawasan tadahan daripada permukaan (sempadan lembangan) | Lukis kawasan tadahan dengan tangan; ia disimpan dalam fail projek |
| Katalog paip, paip bukan bulat, struktur yang bukan kotak atau silinder tegak (kon, tangga, bangku), kategori saliran dalam pustaka | Jenis struktur daripada parameter ([Rangkaian paip](topic:pipe-network)); paip dengan diameter |
| Paip dalam paparan profil, paip melengkung | Baca invert dan penutup dalam panel kanan |

## Lot

| Belum dibina | Sebaliknya, hari ini |
|---|---|
| Menyusun lot mengikut luas atau hadapan, lot daripada garisan di sekelilingnya, hak laluan | Lukis setiap lot mengikut bucunya, atau masukkan panggilannya |
| Jadual lengkung dan jadual garisan pada pelan; label dialihkan dengan tangan | Setiap kursus dilabelkan sepanjangnya |
| Lot dalam LandXML | Lot disimpan dalam fail projek dan dihantar ke PDF, DWG dan DXF |

## Terabas

| Belum dibina | Sebaliknya, hari ini |
|---|---|
| Pelarasan kuasa dua terkecil, peraturan transit, pemberat sudut berbanding jarak | Peraturan kompas |
| Sudut pesongan, sudut zenit dan jarak cerun, aras melalui pengaraan trigonometri | Kurangkan kepada jarak dan sudut mengufuk dengan betul, atau bearing |
| Tembakan sisi, fail data mentah daripada pengumpul data | Import titik sebagai fail titik |

## Penandaan tapak

| Belum dibina | Sebaliknya, hari ini |
|---|---|
| Kayu ofset (titik rujukan yang diundurkan dari kayu penanda), kayu cerun di titik tangkapan | Tandakan tapak pada ofset yang anda perlukan, termasuk melepasi bahu |
| Menghantar kayu penanda terus ke format sendiri pengumpul data | CSV dibuka dalam perisian pejabat kebanyakan pengumpul data |
| Menanda tapak paip, pelantar dan lot | Gunakan titik tinjauan berhampiran penjajaran, atau kursus lot |

## Fail dan output

| Belum dibina | Sebaliknya, hari ini |
|---|---|
| Teks, hatch dan dimensi daripada DWG atau DXF; ruang kertas; lukisan rujukan luaran (xref); DXF binari | Garisan daripada ruang model dibuka ([Buka DWG atau DXF sebagai garisan](topic:open-dwg-dxf)); buka lukisan rujukan luaran secara berasingan |
| Mengalihkan beberapa titik serentak dengan menyeret | Potong dan tampal, atau sunting satu demi satu |
| Helaian potret, blok tajuk anda sendiri, viewport yang anda susun, helaian pelan dan profil dalam DWG | Satu helaian pelan landskap bagi setiap PDF, atau helaian pelan dan profil sepanjang penjajaran (PDF) |
| Mencetak jalur aras dan profil | Jalur hanya pada skrin; ambil tangkapan skrin jika perlu |
| Menukar nama lapisan, warna atau gaya label | Tukar dalam program CAD selepas eksport DXF |
| Simpan awan dan sejarah versi | Simpan fail `.civilcraft.json` dan sandarkannya; untuk bekerja pada satu projek bersama, gunakan sesi langsung dalam CadCraft Studio ([Reka bentuk satu tapak bersama, secara langsung](topic:work-live)) |
| CadCraft Studio untuk iPad dan iPhone, dan dari Google Play | Gunakan CivilCraft dalam pelayar pada peranti; pada Android, CadCraft Studio dipasang daripada APK-nya di getcadcraft.com/download |
| Membuka beberapa fail titik atau projek serentak | Satu fail bagi setiap bukaan (fail GIS yang berkaitan, seperti bahagian shapefile, dibuka bersama) |

## Landskap

| Belum dibina | Sebaliknya, hari ini |
|---|---|
| Kepala dan muncung pengilang | Kepala generik, atau tambah kepala anda sendiri daripada fail; data pembuat masuk apabila mereka memberi kebenaran |
| Panjang sisi maksimum bagi talian titisan, aliran dari masa ke masa, pam, rangkaian paip bergelung | Kekalkan larian titisan pada panjang yang diterbitkan pengilang; semakan memerlukan rangkaian bercabang |
| Garis luar tepat bagi objek bentuk bebas cekung; isipadu bawah tanahnya diukur dengan tepat | Cangkang cembung digredkan dan isipadu bawah tanah ialah anggaran (dinyatakan dalam Sifat) |
| Tumbuhan dalam Letak daripada pustaka milik BimCraft dan ModelCraft | Eksport IFC landskap dan buka dalam BimCraft di sebelah bangunan |
| Model tumbuhan terperinci (daun, dahan, musim) dalam paparan 3D; objek bentuk bebas dan pengairan dalam paparan 3D | Tumbuhan ditunjukkan dalam 3D sebagai bentuk ringkas yang saiznya daripada senarai tumbuhan ([Lihat tapak dalam 3D](topic:site-3d)); taburan ModelCraft menghasilkan gambar penanaman |
| Dinding landskap keras yang menahan aras digredkan di belakangnya pada permukaan | Beri platform atau pelantar sisi tegak: ia ialah dinding penahan pada permukaan ([Penggredan](topic:grading)) |
| Transformasi SVG dalam simbol anda sendiri; tekstur dan warna model tumbuhan GLB anda sendiri; geometri GLB dimampatkan | Ratakan transformasi dalam program lukisan anda dahulu; model dilukis dengan warna tumbuhan; eksport GLB tanpa mampatan ([Grafik tumbuhan](topic:plant-graphics)) |
| Senarai tumbuhan anda sendiri disimpan dalam akaun Pustaka anda (disunting dalam aplikasi) | Sunting senarai projek dalam jadual Tumbuhan dan simpan sebagai fail tumbuhan |
| Alatan landskap untuk pembantu tanpa tetingkap (pelayan fail dan baris arahan) | Ia berfungsi dengan tetingkap CivilCraft dibuka ([Biarkan pembantu AI bekerja dengan tapak anda](topic:assistants)) |

## Talian kuasa

| Belum dibina | Sebaliknya, hari ini |
|---|---|
| Piawaian sesebuah negara dibina di dalam (kes beban, kelegaan, faktor) | Tetapkan nilai piawai anda dalam {{ui:Kes beban dan had…}} dan simpan, bersama pustaka anda, sebagai pek untuk digunakan semula dan dikongsi ([Pek](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| Jarak sisi dari konduktor ke puncak pokok atau dinding di sebelah talian | Kelegaan tegak ke atas tumbuhan dan dinding yang dilintasi talian ([Semakan talian kuasa](topic:power-line-checks#clearances)) |
| Rayapan konduktor dan regangan konduktor baharu | Ambil kira melalui suhu dalam jadual tegangan |
| Penarafan terma kabel terkubur (penarafan arus daripada cara ia dipasang) | Masukkan penarafan arus pembekal anda pada item kabel |
| Kajian litar pintas, perlindungan dan pembumian | Gunakan program elektrik khusus; CivilCraft memberi panjang rangkaian dan kabel |
| Menara kekisi direka ahli demi ahli, dan sauh tegang dalam tanah | Penyokong disemak mengikut beban nominalnya; tegang mengikut beban berkadarnya |
| Fail kajian `.DON` disemak dalam program yang membacanya | Semak fail di sana; hantar sampel kepada kami supaya kami dapat menguji dengan yang sebenar |
| Talian kuasa dalam paparan 3D dan dalam IFC | Pelan, profil talian, helaian dan lapisan GIS |
| Alatan talian kuasa untuk pembantu tanpa tetingkap | Ia berfungsi dengan tetingkap CivilCraft dibuka ([Biarkan pembantu AI bekerja dengan tapak anda](topic:assistants)) |

## Jisim bangunan

| Belum dibina | Sebaliknya, hari ini |
|---|---|
| Pustaka kod zon atau peraturan mana-mana bandar | Taip had daripada perintah anda sendiri ([Had zon](topic:zoning-limits)) |
| Cahaya langit pada dinding (cahaya siang fasad), angin | [Jam matahari](topic:sun-hours) hanya mengira matahari langsung |
| Teduhan daripada pokok, tumbuhan atau apa-apa yang tidak dilukis sebagai jisim | Lukis bangunan jiran sebagai jisim |
| Bentuk bumbung pada jisim | Jisim berbumbung rata |
| Bukaan, bumbung dan jenis dinding apabila jisim dibangunkan dalam BimCraft | BimCraft membina dinding luar ringkas di setiap tingkat dan lantai; tambah yang selebihnya di sana |

## GIS dan sistem koordinat

| Belum dibina | Sebaliknya, hari ini |
|---|---|
| Geodatabase Fail; gaya KML, ikon, overlay tanah dan pautan rangkaian | Tukar kepada GeoPackage, shapefile atau GeoJSON dahulu; penanda KML dibaca tanpa gayanya |
| Menyunting ciri GIS atau atributnya | Sunting dalam program GIS dan import semula. Panel Analisis membuat lapisan baharu (penampan, tindihan, sambung, pilihan) dan menambah medan luas dan panjang, tetapi ia tidak menyunting ciri di tempat |
| Analisis rangkaian dan raster, penampan dengan hujung rata atau segi empat dan penampan sebelah, menambah atau memadam baris dan menukar jenis medan dalam jadual atribut, warna kelas manual, petunjuk gaya dalam plot | Gunakan {{ui:Pilih}} untuk memilih ciri dan buat lapisan daripadanya; hujung rata tidak ditawarkan. Pewarnaan mengikut atribut dan jadual atribut sudah dibina: lihat [Gayakan lapisan mengikut atribut](topic:gis-symbology) dan [Bekerja dengan jadual atribut lapisan](topic:gis-table) |
| Gaya label (saiz, kedudukan) dan label yang mengelak antara satu sama lain | Label bersaiz satu dan mungkin bertindih di tempat ciri padat |
| Datum menegak dan model geoid | Aras digunakan seperti yang diberikan fail; semak datum menegak sendiri |
| Anjakan grid selain ke NAD83 daripada NAD27 yang dicadangkan mengikut kawasan (OSTN15, NTv2 untuk datum lain berfungsi apabila anda menambah fail), beberapa grid serentak, grid menegak | Tambah fail grid untuk datum anda sendiri; satu grid bagi setiap projek |
| Lapisan peta dalam DXF atau eksport 3D | Lapisan peta masuk ke plot PDF, dan di sebelah DWG sebagai gambar |
| Pelayan peta yang memerlukan log masuk, kunci atau token | Gunakan perkhidmatan awam, atau fail imej yang digeorujukkan |
| Menulis fail LAS atau LAZ daripada permukaan, model tanah atau alatan grid aras dan LiDAR | Eksport permukaan sebagai grid aras GeoTIFF. Add-on [Awan titik](topic:point-clouds) menulis awan yang dibersihkan sebagai LAS 1.4 atau LAZ |
| Keamatan, warna dan pulangan LiDAR; grid aras dengan beberapa jalur; fail grid atau LiDAR melebihi 200 MB | LiDAR ditapis mengikut kelas sahaja, grid menggunakan jalur pertamanya; potong fail besar kepada jubin dahulu |

## Input

| Belum dibina | Sebaliknya, hari ini |
|---|---|
| Pemilihan kotak dengan sentuhan (ia memerlukan {{key:Shift}}) | Tekan lama setiap titik tinjauan untuk menambahnya |
| Koordinat atau jarak yang ditaip semasa melukis | Lukis kasar, kemudian taip koordinat PI tepat dalam jadual PI penjajaran |
| Menaip koordinat untuk bucu pelantar dan struktur | Seret gripnya; zum masuk untuk ketepatan dan pantau E dan N dalam bar status |
| Snap kepada objek (selain titik tinjauan untuk garis putus) | Zum masuk dan pantau bar status |

## Paparan 3D

| Belum dibina | Sebaliknya, hari ini |
|---|---|
| Melukis atau menyunting dalam paparan 3D | Lukis dan sunting dalam pelan; paparan 3D mengikut setiap suntingan |
| Memilih garis ciri koridor atau ciri GIS dengan klik dalam 3D | Klik pada pelan |
| Eksport paparan yang dibesarkan atau dalam kaki | Eksport ialah skala sebenar dalam meter; lihat [Eksport tapak dalam 3D](topic:export-3d) |
| Label dalam eksport GLB atau OBJ, saiz dan gaya label dalam 3D | Label hanya ditunjukkan dalam paparan 3D, satu saiz; lihat [Lihat tapak dalam 3D](topic:site-3d) |
| Tekstur daripada foto, merakam pemanduan sebagai video, bayang dari luar tapak, jam matahari ditunjukkan dalam paparan 3D | Lapisan peta diletakkan pada permukaan; pemanduan dan kedudukan matahari pada satu masa; [jam matahari](topic:sun-hours) bagi satu hari atau satu musim pada pelan |
