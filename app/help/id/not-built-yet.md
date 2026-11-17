---
title: Belum dibuat
summary: Apa yang belum dilakukan build CivilCraft ini, dan apa yang bisa dilakukan hari ini sebagai gantinya.
keywords: hilang, batasan, peta jalan, tidak tersedia, spiral, pelebaran, dwg, dxf, inlet, detensi, potongan melintang, akan datang, batas
from: a2d970ef
---

CivilCraft masih dini. Halaman ini mencantumkan apa yang tidak dilakukan build saat ini, agar Anda tidak mencarinya. Tidak ada yang di sini dijanjikan untuk tanggal tertentu.

## Titik

| Belum dibuat | Gantinya, saat ini |
|---|---|
| Menambahkan file titik kedua ke yang pertama | Gabungkan file dulu di editor teks atau spreadsheet |
| Mengekspor file teks titik | Ekspor LandXML (titik keluar sebagai CgPoints), gunakan {{ui:Ekspor}} GIS (titik dengan field P, N, E, Z dan D), atau {{ui:Salin}} titik ke spreadsheet |
| Gaya label titik, simbol per kunci deskripsi, lengkung (busur) dari kode garis, file kunci deskripsi untuk dibagikan antarproyek | Label menampilkan nomor, elevasi dan deskripsi, atau lebih sedikit ([Pengaturan CivilCraft](topic:settings)); kunci disimpan dalam file proyek |
| Konversi satuan | Konversi file sebelum mengimpor; **Satuan** hanya mengganti label |

## Permukaan

| Belum dibuat | Gantinya, saat ini |
|---|---|
| Lebih dari satu permukaan yang dibangun dari titik | Satu proyek per permukaan |
| Menyembunyikan batas (dalam) | Gunakan **Tepi luar terpanjang** atau batas luar |
| Memilih atau mengedit satu breakline gambar | {{key:Mod+Z}}, atau {{ui:Buang breakline gambar}} lalu gambar ulang |
| Mengedit permukaan yang dibaca dari LandXML (breakline, batas) | {{ui:Bangun ulang permukaan dari titik}} |
| Mengedit permukaan yang dibuat dari grid elevasi | Impor ulang grid dengan pilihan lain |
| Mengonversi permukaan yang dibaca dari LandXML saat sistem koordinat berubah | {{ui:Bangun ulang permukaan dari titik}} dulu |
| Label elevasi titik dan nilai kemiringan | Baca di bilah status, atau warnai permukaan berdasarkan kemiringan dengan **Analisis kemiringan** di ruang kerja Lanskap ([Grading untuk lanskap](topic:landscape-grading#grading-checks)) |

## Alinyemen dan profil

| Belum dibuat | Gantinya, saat ini |
|---|---|
| Spiral selain clothoid; spiral di antara dua lengkung (transisi majemuk) | Spiral clothoid di ujung lengkung tersedia; yang lain disebutkan namanya dan dilewati saat impor LandXML |
| Menyisipkan PI di antara dua PI lain | Gambar ulang alinyemen, atau ketik ulang koordinat PI |
| Alinyemen dari objek, offset, pelebaran | Gambar dengan PI |
| Mengetik K untuk lengkung vertikal | Ketik L (K ditampilkan) |
| Lengkung vertikal melingkar dan tidak simetris | Hanya lengkung parabola simetris |
| Lebih dari satu profil desain per alinyemen | Satu alinyemen per varian |
| Memperbesar tampilan profil, pita profil di bawah profil | Tampilan profil memuat seluruh alinyemen; cetak di [lembar denah dan profil](topic:plan-profile-sheets) |
| Potongan dalam DWG atau LandXML | Lembar potongan sebagai PDF; {{ui:CSV}} dari luas dan volume |
| Garis sampel miring, atau dengan lebar berbeda sepanjang jalan | Satu lebar di tiap sisi untuk seluruh alinyemen |

## Koridor

| Belum dibuat | Gantinya, saat ini |
|---|---|
| Median, pembatas, dan superelevasi yang memutar templat | Gambar sebagai templat ([Templat koridor](topic:corridor-templates)); templat per stasiun belum mengambil superelevasi |
| Perubahan bertahap antara templat dua wilayah (transisi, taper) | Ganti templat di sebuah stasiun, atau beri titik target lebar ke garis yang digambar sebagai taper |
| Rotasi terhadap tepi, superelevasi di LandXML | Superelevasi berputar terhadap as jalan pada lengkung melingkar; lebarkan lajur dengan target lebar ke garis fitur |
| Target untuk kemiringan samping (daylight ke garis atau permukaan), permukaan koridor sendiri | Target menggerakkan tepi perkerasan dan bahu ([Koridor](topic:corridor)); koridor dibentuk ke dalam permukaan usulan |
| Koridor diekspor sebagai roadway LandXML; koridor kedua pada alinyemen dalam ekspor IFC | Permukaan usulan yang diekspor |
| Templat medan yang mengubah permukaan usulan, dalam 3D atau di potongan | Templat tersebut memberi luas dan volume tiap lapisan ([Templat medan](topic:corridor-templates#terrain-templates)) |
| Jejak putar dengan kecepatan, slip ban, waktu kemudi, trailer kemudi, atau ruang bebas bodi; pustaka kendaraan desain standar; jejak putar yang digambar dengan menyeret kendaraan | Jejak putar kecepatan rendah sepanjang garis fitur atau alinyemen, dengan ukuran kendaraan Anda sendiri ([Jejak putar kendaraan](topic:swept-paths)) |

## Pembentukan dan volume

| Belum dibuat | Gantinya, saat ini |
|---|---|
| Bench, garis fitur terbuka yang dibentuk ke dalam desain, pembentukan ke garis fitur dari tempat lain | Tutup garis fitur ([Garis fitur](topic:feature-lines)), atau gunakan sebagai breakline tanah asli |
| Menyisipkan atau menghapus simpul garis fitur | Gambar ulang garisnya, atau buat offset bertingkat darinya |
| Busur pada breakline gambar (melalui titik survei), spiral pada garis fitur | Gambar garis fitur dengan busur dan gunakan sebagai breakline tanah asli |
| Pembentukan ke jarak, elevasi, atau permukaan lain | Daylight ke tanah asli saja |
| Menambah atau menghapus sudut pad | Hapus pad dan gambar ulang |
| Volume TIN-ke-TIN (prisma), memilih ukuran sel grid | Metode grid, ukuran sel dipilihkan untuk Anda |
| Swell dan shrink, lapisan tanah atas, tebal perkerasan | Terapkan faktor ke angka yang dilaporkan sendiri |
| Biaya angkut bebas dan lebih angkut, angkutan antar-alinyemen yang berbeda, lubang material pinjam dan lokasi material buangan yang ditempatkan di denah | Diagram angkutan massa dengan titik seimbang, volume yang dipindahkan, dan jarak angkut rata-rata |

## Jaringan pipa

| Belum dibuat | Gantinya, saat ini |
|---|---|
| Lebih dari satu jaringan per proyek | Proyek terpisah untuk drainase dan air limbah |
| Pipa distribusi air: kualitas dan umur air, kontrol berbasis aturan, jenis katup lain (kontrol aliran, throttle, sustaining), pompa yang diberikan dengan daya, permintaan yang bergantung pada tekanan, opsi Darcy–Weisbach, katalog pipa dengan tebal dinding dan kelas tekanan. Sisa jaringan bertekanan ada di lab: [Pipa distribusi air](topic:water-mains) | Periksa di perangkat lunak distribusi air; aliran desain air limbah ada di [Aliran desain air limbah](topic:sanitary-design) |
| Aliran air limbah sepanjang waktu (hidrograf, perutean dinamis, penyimpanan, pompa, luapan) | [Aliran desain air limbah](topic:sanitary-design) memberi aliran puncak tetap yang dipakai lembar desain |
| Kapasitas inlet, sebaran talang, perutean detensi, hidrograf, kehilangan energi selain satu koefisien sambungan | Periksa di perangkat lunak lain; aliran, ukuran, dan garis gradien ada di [Drainase](topic:storm-drainage) |
| Daerah tangkapan di plot PDF, DWG, DXF, atau LandXML; daerah tangkapan dari permukaan (DAS) | Gambar daerah tangkapan dengan tangan; disimpan dalam file proyek |
| Katalog pipa, pipa tidak bulat, struktur yang bukan kotak atau silinder tegak (kerucut, anak tangga, benching), kategori drainase di pustaka | Tipe struktur dari parameter ([Jaringan pipa](topic:pipe-network)); pipa dengan diameter |
| Pipa di tampilan profil, pipa melengkung | Baca invert dan penutup di panel kanan |

## Persil

| Belum dibuat | Gantinya, saat ini |
|---|---|
| Membagi kavling berdasarkan luas atau muka jalan, persil dari garis di sekelilingnya, hak jalan | Gambar tiap persil dengan sudut-sudutnya, atau masukkan panggilannya |
| Tabel lengkung dan tabel garis di denah; label yang dipindahkan dengan tangan | Setiap segmen diberi label di sepanjangnya |
| Persil di LandXML | Persil disimpan dalam file proyek dan ikut ke PDF, DWG, dan DXF |

## Poligon

| Belum dibuat | Gantinya, saat ini |
|---|---|
| Penyesuaian kuadrat terkecil, aturan transit, pembobotan sudut terhadap jarak | Aturan kompas |
| Sudut defleksi, sudut zenit dan jarak miring, elevasi dengan levelling trigonometri | Reduksi ke jarak dan sudut horizontal dengan benar, atau bearing |
| Bidikan samping, file data mentah dari perekam data | Impor titik sebagai file titik |

## Pematokan

| Belum dibuat | Gantinya, saat ini |
|---|---|
| Patok offset (titik acuan yang diset mundur dari patok), patok lereng di titik tangkap | Pasang patok pada offset yang Anda perlukan, termasuk di luar bahu |
| Mengirim patok langsung ke format perekam data | CSV dibuka di perangkat lunak kantor sebagian besar perekam data |
| Memasang patok pada pipa, pad, dan persil | Gunakan titik survei dekat alinyemen, atau sisi-sisi persil |

## File dan keluaran

| Belum dibuat | Gantinya, saat ini |
|---|---|
| Teks, hatch, dan dimensi dari DWG atau DXF; ruang Kertas; gambar tertaut (xref); DXF biner | Garis dari ruang Model dapat dibuka ([Buka DWG atau DXF sebagai garis](topic:open-dwg-dxf)); buka gambar tertaut secara terpisah |
| Memindahkan beberapa titik sekaligus dengan menyeret | Potong dan tempel, atau sunting satu per satu |
| Lembar potret, kepala gambar milik Anda sendiri, viewport yang Anda atur, lembar denah dan profil di DWG | Satu lembar denah lanskap per PDF, atau lembar denah dan profil sepanjang alinyemen (PDF) |
| Mencetak pita elevasi dan profil | Pita hanya di layar; ambil tangkapan layar jika Anda membutuhkannya |
| Mengubah nama layer, warna, atau gaya label | Ubah di program CAD setelah ekspor DXF |
| Penyimpanan cloud dan riwayat versi | Simpan file `.civilcraft.json` dan cadangkan; untuk mengerjakan satu proyek bersama, gunakan sesi live di CadCraft Studio ([Rancang satu lokasi bersama, secara live](topic:work-live)) |
| CadCraft Studio untuk iPad dan iPhone, dan dari Google Play | Gunakan CivilCraft di peramban pada perangkat itu; di Android, CadCraft Studio dipasang dari APK di getcadcraft.com/download |
| Membuka beberapa file titik atau file proyek sekaligus | Satu file per pembukaan (file GIS yang saling terkait, seperti bagian-bagian shapefile, dibuka bersama) |

## Lanskap

| Belum dibuat | Gantinya, saat ini |
|---|---|
| Kepala dan nozel dari pabrikan | Kepala generik, atau tambahkan kepala Anda sendiri dari file; data pembuat masuk saat mereka memberi izin |
| Panjang lateral maksimum untuk garis tetes, aliran sepanjang waktu, pompa, jaringan pipa berloop | Jaga panjang garis tetes sesuai panjang yang diterbitkan pembuat; pemeriksaan membutuhkan jaringan bercabang |
| Garis tepi tepat dari objek bentuk bebas cekung; volume di bawah tanah yang diukur secara tepat | Cembung luar yang dibentuk, dan volume di bawah tanah adalah perkiraan (disebutkan di Properti) |
| Tanaman di Tempatkan dari pustaka milik BimCraft dan ModelCraft | Ekspor IFC lanskap dan buka di BimCraft di samping bangunan |
| Model tanaman terperinci (daun, cabang, musim) di tampilan 3D; objek bentuk bebas dan irigasi di tampilan 3D | Tanaman tampil di 3D sebagai bentuk sederhana berukuran dari daftar tanaman ([Lihat lokasi dalam 3D](topic:site-3d)); scatter ModelCraft membuat gambar penanaman |
| Dinding perkerasan yang menahan tingkat yang dibentuk di belakangnya pada permukaan | Beri platform atau pad sisi vertikal: itu menjadi dinding penahan di permukaan ([Grading](topic:grading)) |
| Transformasi SVG di simbol Anda sendiri; tekstur dan warna model tanaman GLB milik Anda; geometri GLB terkompresi | Ratakan transformasi di program gambar dulu; model digambar dengan warna tanaman; ekspor GLB tanpa kompresi ([Grafik tanaman](topic:plant-graphics)) |
| Daftar tanaman milik Anda yang disimpan di akun Pustaka Anda (disunting di aplikasi) | Sunting daftar milik proyek di tabel Tanaman dan simpan sebagai file tanaman |
| Perkakas lanskap untuk asisten tanpa jendela (server file dan baris perintah) | Keduanya bekerja saat jendela CivilCraft terbuka ([Biarkan asisten AI bekerja dengan lokasi Anda](topic:assistants)) |

## Saluran listrik

| Belum dibuat | Gantinya, saat ini |
|---|---|
| Standar sebuah negara yang sudah tertanam (kasus beban, jarak bebas, faktor) | Atur nilai standar Anda di {{ui:Kasus beban dan batas…}} dan simpan, bersama pustaka Anda, sebagai paket untuk dipakai ulang dan dibagikan ([Paket](topic:sag-and-tension#packs-rules-and-a-library-for-a-country)) |
| Jarak ke samping dari konduktor ke tajuk pohon atau dinding di sisi saluran | Jarak bebas lurus ke atas di atas tanaman dan dinding yang dilintasi saluran ([Pemeriksaan saluran listrik](topic:power-line-checks#clearances)) |
| Rambatan konduktor (creep) dan pemanjangan konduktor baru | Perhitungkan lewat suhu di tabel pemasangan |
| Rating termal kabel terkubur (rating arus dari cara pemasangannya) | Masukkan rating arus dari pemasok Anda pada item kabel |
| Studi hubung singkat, proteksi, dan pentanahan | Gunakan program listrik khusus; CivilCraft memberi panjang dan kabel jaringan |
| Menara kisi yang dirancang batang demi batang, dan angkur stay di tanah | Penyangga diperiksa dengan beban nominalnya; stay dengan beban rating-nya |
| File studi `.DON` yang diperiksa di program yang membacanya | Periksa file di sana; kirimkan contoh kepada kami agar bisa kami uji dengan file nyata |
| Saluran listrik di tampilan 3D dan di IFC | Denah, profil saluran, lembar, dan lapisan GIS |
| Perkakas saluran listrik untuk asisten tanpa jendela | Keduanya bekerja saat jendela CivilCraft terbuka ([Biarkan asisten AI bekerja dengan lokasi Anda](topic:assistants)) |

## Massa bangunan

| Belum dibuat | Gantinya, saat ini |
|---|---|
| Pustaka kode zonasi atau aturan kota mana pun | Ketik batas dari peraturan daerah Anda sendiri ([Batas zonasi](topic:zoning-limits)) |
| Cahaya langit pada dinding (cahaya siang fasad), angin | [Jam matahari](topic:sun-hours) hanya menghitung sinar matahari langsung |
| Bayangan dari pohon, tanaman, atau apa pun yang tidak digambar sebagai massa | Gambar bangunan tetangga sebagai massa |
| Bentuk atap pada massa | Massa beratap datar |
| Bukaan, atap, dan jenis dinding saat massa dikembangkan di BimCraft | BimCraft membuat dinding luar polos di setiap lantai dan satu lantai; tambahkan sisanya di sana |

## GIS dan sistem koordinat

| Belum dibuat | Gantinya, saat ini |
|---|---|
| File Geodatabase; gaya, ikon, overlay tanah, dan tautan jaringan KML | Konversi ke GeoPackage, shapefile, atau GeoJSON dulu; placemark KML dibaca tanpa gayanya |
| Mengedit fitur GIS atau atributnya | Edit di program GIS dan impor ulang. Panel Analisis membuat lapisan baru (buffer, overlay, join, seleksi) dan menambahkan field luas dan panjang, tetapi tidak mengedit fitur di tempat |
| Analisis jaringan dan raster, buffer dengan ujung datar atau persegi dan buffer satu sisi, menambah atau menghapus baris dan mengubah tipe field di tabel atribut, warna kelas manual, legenda gaya dalam plot | Gunakan Pilih untuk memilih fitur dan membuat lapisan darinya; ujung datar tidak ditawarkan. Pewarnaan berdasarkan atribut dan tabel atribut sudah ada: lihat [Gaya lapisan menurut atribut](topic:gis-symbology) dan [Bekerja dengan tabel atribut lapisan](topic:gis-table) |
| Gaya label (ukuran, penempatan) dan label yang menghindari satu sama lain | Label berukuran satu dan dapat saling tumpang tindih di tempat fitur padat |
| Datum vertikal dan model geoid | Elevasi dipakai sebagaimana diberikan file; periksa datum vertikal sendiri |
| Pergeseran grid selain ke NAD83 dari NAD27 yang disarankan menurut area (OSTN15; NTv2 untuk datum lain bekerja saat Anda menambahkan file), beberapa grid sekaligus, grid vertikal | Tambahkan file grid untuk datum Anda sendiri; satu grid per proyek |
| Lapisan peta di ekspor DXF atau 3D | Lapisan peta masuk ke plot PDF, dan di samping DWG sebagai gambar |
| Server peta yang membutuhkan masuk, kunci, atau token | Gunakan layanan publik, atau file gambar yang sudah di-georeferensi |
| Menulis file LAS atau LAZ dari permukaan, model tanah, atau perkakas grid elevasi dan LiDAR | Ekspor permukaan sebagai grid elevasi GeoTIFF. Add-on [Awan titik](topic:point-clouds) menulis awan yang sudah dibersihkan sebagai LAS 1.4 atau LAZ |
| Intensitas, warna, dan return LiDAR; grid elevasi dengan beberapa pita; file grid atau LiDAR di atas 200 MB | LiDAR difilter hanya menurut kelas, grid memakai pita pertamanya; potong file besar menjadi ubin dulu |

## Input

| Belum dibuat | Gantinya, saat ini |
|---|---|
| Pemilihan kotak dengan sentuh (membutuhkan {{key:Shift}}) | Tekan lama setiap titik survei untuk menambahkannya |
| Koordinat atau jarak yang diketik saat menggambar | Gambar kasar, lalu ketik koordinat PI yang tepat di tabel PI alinyemen |
| Mengetik koordinat untuk sudut pad dan struktur | Seret grip-nya; perbesar untuk ketelitian dan perhatikan E dan N di bilah status |
| Snap ke objek (selain titik survei untuk breakline) | Perbesar dan perhatikan bilah status |

## Tampilan 3D

| Belum dibuat | Gantinya, saat ini |
|---|---|
| Menggambar atau menyunting di tampilan 3D | Gambar dan sunting di denah; tampilan 3D mengikuti setiap suntingan |
| Memilih garis fitur koridor atau fitur GIS dengan klik di 3D | Klik di denah |
| Mengekspor tampilan yang dilebih-lebihkan skalanya atau dalam kaki | Ekspor berskala sebenarnya dalam meter; lihat [Ekspor lokasi dalam 3D](topic:export-3d) |
| Label di ekspor GLB atau OBJ, ukuran dan gaya label di 3D | Label tampil di tampilan 3D saja, satu ukuran; lihat [Lihat lokasi dalam 3D](topic:site-3d) |
| Tekstur dari foto, merekam penelusuran sebagai video, bayangan dari luar lokasi, jam matahari yang ditampilkan di tampilan 3D | Lapisan peta yang dibentangkan di permukaan; telusuri dan posisi matahari pada satu waktu; [jam matahari](topic:sun-hours) untuk satu hari atau satu musim di denah |
