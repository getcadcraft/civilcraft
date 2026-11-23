---
title: Belum dibuat
summary: Hal yang belum dilakukan build CivilCraft ini, dan apa yang bisa dilakukan saat ini sebagai gantinya.
keywords: hilang, batasan, peta jalan, tidak tersedia, spiral, pelebaran, dwg, dxf, inlet, detensi, penampang melintang, akan datang, batas
from: b91588d4
---

CivilCraft masih awal. Halaman ini mencantumkan hal yang tidak dilakukan build saat ini, agar Anda tidak mencarinya. Tidak ada yang dijanjikan di sini untuk tanggal tertentu.

## Titik

| Belum dibuat | Sebagai gantinya, saat ini |
|---|---|
| Menambahkan file titik kedua ke file pertama | Gabungkan file dalam editor teks atau spreadsheet lebih dulu |
| Mengekspor file teks titik | Ekspor LandXML (titik keluar sebagai CgPoints), gunakan GIS {{ui:Ekspor}} (titik dengan field P, N, E, Z, dan D), atau {{ui:Salin}} titik ke spreadsheet |
| Gaya label titik, simbol per kunci deskripsi, kurva (busur) dari kode garis, file kunci deskripsi untuk dibagikan antarproyek | Label menampilkan nomor, elevasi, dan deskripsi, atau lebih sedikit ([Pengaturan CivilCraft](topic:settings)); kunci disimpan dalam file proyek |
| Konversi satuan | Konversi file sebelum mengimpor; **Satuan** hanya mengganti label |

## Permukaan

| Belum dibuat | Sebagai gantinya, saat ini |
|---|---|
| Lebih dari satu permukaan dibangun dari titik | Satu proyek per permukaan |
| Menyembunyikan batas (dalam) | Gunakan **Tepi luar terpanjang** atau batas luar |
| Memilih atau menyunting satu breakline yang digambar | {{key:Mod+Z}}, atau {{ui:Buang breakline gambar}} dan gambar ulang |
| Menyunting permukaan yang dibaca dari LandXML (breakline, batas) | {{ui:Bangun ulang permukaan dari titik}} |
| Menyunting permukaan yang dibuat dari grid elevasi | Impor ulang grid dengan pilihan lain |
| Mengonversi permukaan yang dibaca dari LandXML ketika sistem koordinat berubah | {{ui:Bangun ulang permukaan dari titik}} lebih dulu |
| Elevasi titik dan nilai kemiringan yang diberi label | Baca di bilah status, atau warnai permukaan menurut kemiringan dengan **Analisis kemiringan** di ruang kerja Lanskap ([Grading untuk lanskap](topic:landscape-grading#grading-checks)) |

## Alinyemen dan profil

| Belum dibuat | Sebagai gantinya, saat ini |
|---|---|
| Spiral selain clothoid; spiral di antara dua lengkung (transisi majemuk) | Spiral clothoid di ujung lengkung tersedia; yang lain diberi nama dan dilewati saat impor LandXML |
| Menyisipkan PI di antara dua PI lain | Gambar ulang alinyemen, atau ketik ulang koordinat PI |
| Alinyemen dari objek, offset, pelebaran | Gambar dengan PI |
| Mengetik K untuk lengkung vertikal | Ketik L (K ditampilkan) |
| Lengkung vertikal melingkar dan tidak simetris | Hanya lengkung parabola simetris |
| Lebih dari satu profil desain per alinyemen | Satu alinyemen per varian |
| Memperbesar tampilan profil, pita profil di bawah profil | Tampilan profil memuat seluruh alinyemen; cetak di [lembar denah dan profil](topic:plan-profile-sheets) |
| Penampang dalam DWG atau LandXML | Lembar penampang sebagai PDF; {{ui:CSV}} dari luas dan volume |
| Garis sampel dengan sudut, atau dengan lebar berbeda sepanjang jalan | Satu lebar tiap sisi untuk seluruh alinyemen |

## Koridor

| Belum dibuat | Sebagai gantinya, saat ini |
|---|---|
| Median, penghalang, dan superelevasi yang memutar templat | Gambar sebagai templat ([Templat koridor](topic:corridor-templates)); templat per stasiun belum menerima superelevasi |
| Perubahan bertahap antara templat dua wilayah (transisi, tirus) | Ubah templat di sebuah stasiun, atau beri titik target lebar ke garis yang digambar sebagai tirus |
| Rotasi terhadap tepi, superelevasi di LandXML | Superelevasi memutar terhadap as jalan pada lengkung lingkaran; lebarkan lajur dengan target lebar ke garis fitur |
| Target untuk kemiringan samping (daylight ke garis atau permukaan), permukaan koridor tersendiri | Target menggeser tepi perkerasan dan bahu ([Koridor](topic:corridor)); koridor di-grading ke permukaan rencana |
| Pembulatan kereb, lajur belok, dan pulau yang digrading ke persimpangan; ujung jalan samping dipotong ke tepi jalan utama pada sudut miring; jalur yang digabung ke jalan di denah, dalam panjang dan luasnya | Jalan yang bertemu digabung siku, dengan tepi jalan utama dibuka dan jalan samping diratakan ke sana ([Tempat jalan bertemu](topic:corridor#where-roads-meet-roads-pads-and-paths)); jalur berhenti di tepi jalan pada permukaan rencana dan 3D |
| Koridor diekspor sebagai jalan LandXML; koridor kedua pada alinyemen dalam ekspor IFC | Permukaan rencana yang diekspor |
| Templat medan yang mengubah permukaan rencana, di 3D atau di penampang | Templat medan memberi luas dan volume tiap lapisan ([Templat medan](topic:corridor-templates#terrain-templates)) |
| Jejak sapuan dengan kecepatan, slip ban, waktu kemudi, trailer kemudi, atau ruang bebas bodi; pustaka kendaraan desain standar; jejak sapuan yang digambar dengan menyeret kendaraan | Jejak sapuan kecepatan rendah sepanjang garis fitur atau alinyemen, dengan ukuran kendaraan Anda sendiri ([Jejak sapuan kendaraan](topic:swept-paths)) |

## Grading dan volume

| Belum dibuat | Sebagai gantinya, saat ini |
|---|---|
| Bangku, garis fitur terbuka yang digrading ke desain, grading ke garis fitur dari tempat lain | Tutup garis fitur ([Garis fitur](topic:feature-lines)), atau gunakan sebagai breakline tanah asli |
| Menyisipkan atau menghapus simpul garis fitur | Gambar ulang garis, atau buat offset bertangga darinya |
| Busur dalam breakline yang digambar (melalui titik survei), spiral dalam garis fitur | Gambar garis fitur dengan busur dan gunakan sebagai breakline tanah asli |
| Grading ke jarak, elevasi, atau permukaan lain | Daylight ke tanah asli saja |
| Menambah atau menghapus sudut pad | Hapus pad dan gambar ulang |
| Volume TIN-ke-TIN (prisma), memilih ukuran sel grid | Metode grid, ukuran sel dipilihkan untuk Anda |
| Swell dan shrink, lapisan tanah atas, kedalaman perkerasan | Terapkan faktor ke angka yang dilaporkan sendiri |
| Biaya angkut bebas dan biaya kelebihan jarak, angkut antaralinyemen berbeda, lubang pinjam dan lokasi buangan yang ditempatkan di denah | Diagram angkutan massa dengan titik seimbang, volume yang dipindahkan, dan jarak angkut rata-rata |

## Jaringan pipa

| Belum dibuat | Sebagai gantinya, saat ini |
|---|---|
| Lebih dari satu jaringan per proyek | Proyek terpisah untuk drainase hujan dan sanitasi |
| Pipa air utama: kualitas dan usia air, kontrol berbasis aturan, jenis katup lain (kontrol aliran, pencekik, penopang), pompa menurut daya, kebutuhan yang bergantung pada tekanan, opsi Darcy–Weisbach, katalog pipa dengan ketebalan dinding dan kelas tekanan. Sisanya dari jaringan bertekanan ada di lab: [Pipa air utama](topic:water-mains) | Periksa itu di perangkat lunak distribusi air; aliran desain sanitasi ada di [Aliran desain sanitasi](topic:sanitary-design) |
| Aliran selokan dari waktu ke waktu (hidrograf, routing dinamis, penyimpanan, pompa, luapan) | [Aliran desain sanitasi](topic:sanitary-design) memberi aliran puncak tetap yang dipakai lembar desain |
| Kapasitas inlet, sebaran gutter, routing detensi, hidrograf, kehilangan energi selain satu koefisien persimpangan | Periksa di perangkat lunak lain; aliran, ukuran, dan garis gradien ada di [Drainase hujan](topic:storm-drainage) |
| Tangkapan dalam plot PDF, DWG, DXF, atau LandXML; tangkapan dari permukaan (daerah aliran) | Gambar tangkapan dengan tangan; disimpan dalam file proyek |
| Katalog pipa, pipa non-bulat, struktur yang bukan kotak atau silinder tegak (kerucut, anak tangga, benching), kategori drainase di pustaka | Tipe struktur dari parameter ([Jaringan pipa](topic:pipe-network)); pipa dengan diameter |
| Pipa di tampilan profil, pipa melengkung | Baca invert dan penutup di panel kanan |

## Persil

| Belum dibuat | Sebagai gantinya, saat ini |
|---|---|
| Menata lot menurut luas atau muka jalan, persil dari garis di sekitarnya, hak jalan | Gambar tiap persil dengan sudutnya, atau masukkan panggilannya |
| Tabel lengkung dan tabel garis di denah; label yang digeser secara manual | Setiap segmen diberi label sepanjang dirinya |
| Persil di LandXML | Persil disimpan dalam file proyek dan ikut ke PDF, DWG, dan DXF |

## Poligon

| Belum dibuat | Sebagai gantinya, saat ini |
|---|---|
| Perataan kuadrat terkecil, aturan transit, pembobotan sudut terhadap jarak | Aturan kompas |
| Sudut defleksi, sudut zenith dan jarak lereng, elevasi dengan levelling trigonometri | Reduksi ke jarak dan sudut horizontal dengan benar, atau azimut |
| Bidikan samping, file data mentah dari pengumpul data | Impor titik sebagai file titik |

## Pematokan

| Belum dibuat | Sebagai gantinya, saat ini |
|---|---|
| Patok offset (titik referensi yang digeser ke belakang dari patok), patok lereng di titik tangkap | Pasang patok pada offset yang Anda perlukan, termasuk melewati bahu |
| Mengirim patok langsung ke format sendiri milik pengumpul data | CSV dapat dibuka di perangkat lunak kantor sebagian besar pengumpul data |
| Memasang patok untuk pipa, pad, dan persil | Gunakan titik survei dekat alinyemen, atau segmen persil |

## File dan keluaran

| Belum dibuat | Sebagai gantinya, saat ini |
|---|---|
| Teks, hatch, dan dimensi dari DWG atau DXF; paper space; gambar tertaut (xref); DXF biner | Linework dari model space dapat dibuka ([Buka DWG atau DXF sebagai linework](topic:open-dwg-dxf)); buka gambar tertaut secara terpisah |
| Memindahkan beberapa titik sekaligus dengan menyeret | Potong dan tempel, atau sunting satu per satu |
| Lembar potret, kop gambar buatan sendiri, viewport yang Anda atur, lembar denah dan profil dalam DWG | Satu lembar denah lanskap per PDF, atau lembar denah dan profil sepanjang alinyemen (PDF) |
| Mencetak pita elevasi dan profil | Pita hanya di layar; ambil tangkapan layar jika Anda membutuhkannya |
| Mengubah nama layer, warna, atau gaya label | Ubah di program CAD setelah ekspor DXF |
| Penyimpanan cloud dan riwayat versi | Simpan file `.civilcraft.json` dan cadangkan; untuk mengerjakan satu proyek bersama, gunakan sesi live di CadCraft Studio ([Rancang satu lokasi bersama, secara live](topic:work-live)) |
| CadCraft Studio untuk iPad dan iPhone, dan dari Google Play | Gunakan CivilCraft di peramban pada perangkat; di Android, CadCraft Studio dipasang dari APK di getcadcraft.com/download |
| Membuka beberapa file titik atau proyek sekaligus | Satu file per kali buka (file GIS yang saling terkait, seperti bagian-bagian shapefile, dibuka bersamaan) |

## Lanskap

| Belum dibuat | Sebagai gantinya, saat ini |
|---|---|
| Kepala dan nozzle dari pabrikan | Kepala generik, atau tambahkan kepala sendiri dari file; data pabrikan masuk saat mereka memberi izin |
| Panjang lateral maksimum untuk jalur tetes, aliran terhadap waktu, pompa, jaringan pipa berlooping | Jaga jalur tetes sesuai panjang yang dipublikasikan pabrikan; pemeriksaan memerlukan jaringan bercabang |
| Garis luar pasti dari objek bentuk bebas cekung; volume di bawah tanah yang diukur secara pasti | Konveks hull yang digrading, dan volume di bawah tanah adalah perkiraan (dinyatakan di Properti) |
| Tanaman di Place from library milik BimCraft dan ModelCraft | Ekspor IFC lanskap dan buka di BimCraft di samping bangunan |
| Model tanaman terperinci (daun, cabang, musim) di tampilan 3D; objek bentuk bebas dan irigasi di tampilan 3D | Tanaman tampil di 3D sebagai bentuk sederhana berukuran dari daftar tanaman ([Lihat lokasi dalam 3D](topic:site-3d)); scatter ModelCraft membuat gambar penanaman |
| Dinding hardscape yang menahan tanah yang sudah digrading di belakangnya pada permukaan | Beri platform atau pad sisi vertikal: itu dinding penahan di permukaan ([Grading](topic:grading)) |
| Transformasi SVG pada simbol sendiri; tekstur dan warna model tanaman GLB sendiri; geometri GLB terkompresi | Ratakan transformasi di program gambar Anda lebih dulu; model digambar dengan warna tanaman; ekspor GLB tanpa kompresi ([Grafik tanaman](topic:plant-graphics)) |
| Daftar tanaman Anda sendiri yang disimpan di akun Pustaka Anda (disunting di aplikasi) | Sunting daftar proyek di tabel Tanaman dan simpan sebagai file tanaman |
| Alat lanskap untuk asisten tanpa jendela (server file dan baris perintah) | Alat itu bekerja saat jendela CivilCraft terbuka ([Biarkan asisten AI bekerja dengan lokasi Anda](topic:assistants)) |

## Jalur listrik

| Belum dibuat | Sebagai gantinya, saat ini |
|---|---|
| Standar sebuah negara yang dibangun (kasus beban, jarak bebas, faktor) | Atur nilai standar Anda di {{ui:Kasus beban dan batas…}} dan simpan, bersama pustaka Anda, sebagai paket untuk dipakai ulang dan dibagikan ([Paket](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| Jarak horizontal dari konduktor ke tajuk pohon atau dinding di samping jalur | Jarak bebas lurus ke atas di atas tanaman dan dinding yang dilintasi jalur ([Pemeriksaan jalur listrik](topic:power-line-checks#clearances)) |
| Creep konduktor dan regangan konduktor baru | Perhitungkan melalui suhu di tabel pemasangan |
| Rating termal kabel terpendam (rating arus dari cara pemasangannya) | Masukkan rating arus pemasok Anda pada item kabel |
| Studi hubung singkat, proteksi, dan pentanahan | Gunakan program kelistrikan khusus; CivilCraft memberi panjang dan kabel jaringan |
| Menara kisi yang dirancang batang demi batang, dan jangkar penahan di tanah | Penyangga diperiksa dengan beban nominalnya; penahan dengan beban terkadar |
| File studi `.DON` diperiksa di program yang membacanya | Periksa file di sana; kirim contoh agar kami dapat menguji dengan file asli |
| Jalur listrik di tampilan 3D dan IFC | Denah, profil jalur, lembar, dan layer GIS |
| Alat jalur listrik untuk asisten tanpa jendela | Alat itu bekerja saat jendela CivilCraft terbuka ([Biarkan asisten AI bekerja dengan lokasi Anda](topic:assistants)) |

## Massa bangunan

| Belum dibuat | Sebagai gantinya, saat ini |
|---|---|
| Pustaka kode zonasi atau aturan kota mana pun | Ketik batas dari peraturan daerah Anda sendiri ([Batas zonasi](topic:zoning-limits)) |
| Cahaya langit pada dinding (cahaya fasad), angin | [Jam penyinaran matahari](topic:sun-hours) hanya menghitung sinar matahari langsung |
| Bayangan dari pohon, tanaman, atau apa pun yang tidak digambar sebagai massa | Gambar bangunan tetangga sebagai massa |
| Bentuk atap pada massa | Massa beratap datar |
| Bukaan, atap, dan jenis dinding saat massa dikembangkan di BimCraft | BimCraft membangun dinding luar polos di setiap lantai dan lantai; tambahkan sisanya di sana |

## GIS dan sistem koordinat

| Belum dibuat | Sebagai gantinya, saat ini |
|---|---|
| File Geodatabase; gaya, ikon, overlay tanah, dan tautan jaringan KML | Konversi ke GeoPackage, shapefile, atau GeoJSON lebih dulu; placemark KML dibaca tanpa gayanya |
| Menyunting fitur GIS atau atributnya | Sunting di program GIS lalu impor ulang. Panel Analisis membuat layer baru (buffer, overlay, join, seleksi) dan menambahkan field luas dan panjang, tetapi tidak menyunting fitur di tempat |
| Analisis jaringan dan raster, buffer dengan ujung rata atau persegi dan buffer satu sisi, menambah atau menghapus baris dan mengubah tipe field di tabel atribut, warna kelas manual, legenda gaya dalam plot | Gunakan {{ui:Pilih}} untuk memilih fitur dan membuat layer darinya; ujung rata tidak tersedia. Pewarnaan menurut atribut dan tabel atribut sudah dibuat: lihat [Gaya layer menurut atribut](topic:gis-symbology) dan [Bekerja dengan tabel atribut layer](topic:gis-table) |
| Gaya label (ukuran, penempatan) dan label yang saling menghindar | Label berukuran satu dan dapat tumpang tindih di tempat fitur padat |
| Datum vertikal dan model geoid | Elevasi dipakai sebagaimana diberikan file; periksa datum vertikal sendiri |
| Pergeseran grid selain ke NAD83 dari NAD27 yang disarankan per area (OSTN15, NTv2 untuk datum lain bekerja saat Anda menambahkan file), beberapa grid sekaligus, grid vertikal | Tambahkan file grid untuk datum Anda sendiri; satu grid per proyek |
| Layer peta dalam ekspor DXF atau 3D | Layer peta masuk ke plot PDF, dan di samping DWG sebagai gambar |
| Server peta yang memerlukan masuk, kunci, atau token | Gunakan layanan publik, atau file gambar yang sudah di-georeferensi |
| Menulis file LAS atau LAZ dari permukaan, model tanah, atau alat grid elevasi dan LiDAR | Ekspor permukaan sebagai grid elevasi GeoTIFF. Add-on [Point cloud](topic:point-clouds) menulis awan yang sudah dibersihkan sebagai LAS 1.4 atau LAZ |
| Intensitas, warna, dan return LiDAR; grid elevasi dengan beberapa band; file grid atau LiDAR di atas 200 MB | LiDAR difilter hanya menurut kelas, grid memakai band pertama; potong file besar menjadi ubin lebih dulu |

## Input

| Belum dibuat | Sebagai gantinya, saat ini |
|---|---|
| Pemilihan kotak dengan sentuhan (memerlukan {{key:Shift}}) | Tekan lama tiap titik survei untuk menambahkannya |
| Koordinat atau jarak yang diketik saat menggambar | Gambar kasar, lalu ketik koordinat PI yang tepat di tabel PI alinyemen |
| Mengetik koordinat untuk sudut pad dan struktur | Seret grip-nya; perbesar untuk ketepatan dan perhatikan E dan N di bilah status |
| Snap ke objek (selain titik survei untuk breakline) | Perbesar dan perhatikan bilah status |

## Tampilan 3D

| Belum dibuat | Sebagai gantinya, saat ini |
|---|---|
| Menggambar atau menyunting di tampilan 3D | Gambar dan sunting di denah; tampilan 3D mengikuti setiap suntingan |
| Memilih garis fitur koridor atau fitur GIS dengan klik di 3D | Klik di denah |
| Mengekspor tampilan yang dilebih-lebihkan atau dalam feet | Ekspor berskala sebenarnya dalam meter; lihat [Ekspor lokasi dalam 3D](topic:export-3d) |
| Label dalam ekspor GLB atau OBJ, ukuran dan gaya label di 3D | Label tampil di tampilan 3D saja, satu ukuran; lihat [Lihat lokasi dalam 3D](topic:site-3d) |
| Tekstur dari foto, merekam perjalanan sebagai video, bayangan dari luar lokasi, jam penyinaran matahari di tampilan 3D | Layer peta di-drape pada permukaan; mode jalan dan posisi matahari pada satu waktu; [jam penyinaran matahari](topic:sun-hours) untuk sehari atau semusim di denah |
