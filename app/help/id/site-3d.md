---
title: Lihat lokasi dalam 3D
summary: Buka tampilan 3D, orbit, geser, dan zoom, atur pembesaran vertikal dan pewarnaan, pilih apa yang ditampilkan, dan klik alinyemen, pad, garis fitur, breakline, pipa, bangunan, dan titik untuk memilihnya.
keywords: label, label 3d, papan reklame, label menghadap kamera, label stasiun, label kontur, label titik, drape, udara, layer peta pada permukaan, 3d, tiga dimensi, tampilan 3d, kubus tampilan, kompas, orbit, perspektif, paralel, isometrik, iso, pembesaran vertikal, medan, model, model lokasi, terbang mengelilingi, visualisasi, render, pipa dalam 3d, bangunan, manhole, koridor 3d, jalan dalam 3d, permukaan jalan, lajur, kerb, trotoar, tanaman dalam 3d, pohon dalam 3d, semak, pagar tanaman, lanskap 3d, rampa dalam 3d, tangga, dinding, perkerasan, hardscape 3d
from: a16bafe1
---

Tampilan 3D menampilkan lokasi sebagai satu model: tanah yang ada dan permukaan yang diratakan, kontur yang didrape di atasnya, breakline dan tepi permukaan, setiap alinyemen pada profil desainnya dengan tanda stasiun, garis fitur koridor, dan jalan itu sendiri (lajur, bahu, selokan, kerb, jalur, dan trotoar dalam warnanya sendiri), pad dengan garis daylight-nya, jaringan pipa dengan pipa dan bangunan pada elevasi sebenarnya, serta dari ruang kerja Lanskap berupa tanaman, perkerasan, jalur, dinding, kerb, rampa, dan tangga. Tampilan ini membaca proyek yang sama dengan denah, jadi setiap suntingan muncul di keduanya.

## Buka tampilan 3D

1. Buka titik survei (atau berkas LandXML atau proyek) agar ada permukaan. Tanaman, perkerasan, atau rampa saja sudah cukup untuk membukanya juga.
2. Tekan {{key:D}}, atau klik {{ui:3D}} di grup {{ui:Tampilan}} pada bilah alat.
   Tampilan 3D terbuka di atas denah, menghadap seluruh lokasi dari tenggara. Pertama kali, perlu waktu sebentar untuk memuat.
3. Tekan {{key:D}} lagi, atau klik {{ui:3D}} lagi, untuk kembali ke denah. Memilih alat gambar seperti {{ui:Alinyemen}} atau {{ui:Pad}} juga kembali ke denah, karena menggambar dilakukan di sana.

## Bergerak

| Untuk | Lakukan ini |
|---|---|
| Orbit | Seret dengan tombol kiri atau tengah |
| Geser | Seret dengan tombol kanan, atau tahan {{key:Shift}} dan seret |
| Zoom | Putar roda; zoom menuju penunjuk |
| Orbit pada trackpad | Usap dengan dua jari ({{key:Shift}} dan usap untuk menggeser) |
| Zoom pada trackpad | Cubit |
| Sentuh | Satu jari mengorbit; dua jari mencubit untuk zoom dan menggeser untuk memindahkan |
| Tombol (tampilan sedang terfokus) | {{key:Left}} {{key:Right}} {{key:Up}} {{key:Down}} untuk orbit, dengan {{key:Shift}} untuk menggeser; {{key:Plus}} dan {{key:Minus}} untuk zoom |

Bilah di atas tampilan memuat sisanya:

- Daftar tampilan: **Iso**, **Atas**, **Bawah**, **Depan** (menghadap utara), **Belakang**, **Kiri**, dan **Kanan**.
- {{ui:Perspektif}}: saat ditekan adalah tampilan perspektif; klik untuk proyeksi paralel (tanpa pemendekan perspektif).
- {{ui:Batas}}: menampilkan semuanya lagi. {{key:F}} melakukan hal yang sama selama tampilan 3D terbuka.

## Kubus tampilan

Kubus tampilan di pojok kanan atas berputar bersama tampilan. Klik sisi, tepi, atau sudut untuk melihat lokasi dari sana (kamera berputar dengan halus kecuali sistem Anda meminta gerakan dikurangi). Seret kubus untuk mengorbit. Cincin kompas di bawahnya menunjukkan utara (utara grid, +Y): seret cincin untuk memutar lokasi terhadap vertikal, atau klik N, E, S, atau W untuk melihat dari sisi itu. {{ui:Beranda}}, ikon rumah kecil di kiri atasnya, kembali ke tampilan iso seluruh lokasi. Dengan keyboard: {{key:Tab}} ke kubus, tombol panah memilih sisi, tepi, atau sudut, dan {{key:Enter}} melihat dari sana.

Di denah, kubus yang sama menampilkan bagian atas. Klik sisi, tepi, atau sudut lain (atau seret) untuk membuka tampilan 3D yang menghadap dari sana: ini cara tercepat masuk ke 3D dari arah tertentu. Untuk mengganti kubus dengan ikon sumbu kecil, atau menyembunyikannya, lihat **Indikator sudut** di [Pengaturan CivilCraft](topic:settings).

## Besarkan elevasi

Lokasi biasanya jauh lebih lebar daripada tingginya, jadi elevasi diregangkan sebesar **2×** untuk memulai. Pilih **1×**, **2×**, **3×**, **5×**, atau **10×** pada daftar di bilah, atau di bawah **Pembesaran vertikal 3D** di [Pengaturan CivilCraft](topic:settings) (keduanya adalah satu pengaturan). Hanya tampilannya yang berubah: volume, profil, dan ekspor tetap pada skala sebenarnya.

## Beri warna pada permukaan

- **Pita elevasi**: pita dan warna yang sama dengan pita elevasi di denah (jumlah pita diatur di bawah **Tampilan** di panel kiri). Setiap tepi pita dipotong tepat pada elevasinya.
- **Satu warna**: tanah yang ada dan permukaan yang diratakan, masing-masing dalam satu warna polos.
- **Layer peta**: layer peta yang ditampilkan di bawah denah (gambar berkoordinat, ubin peta, atau layanan peta; lihat [Layer peta](topic:map-layers)) dibentangkan di atas permukaan seperti lembaran, sehingga foto udara tampil di atas bukit. Gambar yang masih datang akan terisi seiring datangnya. Jika tidak ada layer peta yang tampil, permukaan tetap memakai pita elevasinya dan tampilan menyatakannya. Gambar hanya untuk layar: ekspor GLB dan OBJ tidak membawanya.

Saat kedua permukaan ditampilkan, tanah yang ada tembus pandang di atas permukaan yang diratakan, sehingga Anda dapat melihat galian (tanah di atas desain) dan timbunan.

## Pilih apa yang tampil

Klik {{ui:Tampilkan}} di bilah lalu centang atau hapus centang:

| Item | Isinya |
|---|---|
| Tanah yang ada | Permukaan yang dibangun dari titik survei (atau dibaca dari LandXML) |
| Permukaan diratakan | Tanah yang ada dengan koridor dan pad yang sudah diratakan (hanya bila ada) |
| Tepi segitiga | Setiap tepi TIN, sebagai garis |
| Kontur | Kontur minor dan mayor setiap permukaan yang ditampilkan, pada interval denah |
| Tepi permukaan | Tepi luar setiap permukaan yang ditampilkan, pada elevasinya |
| Breakline | Setiap breakline, pada elevasinya |
| Alinyemen dan stasiun | Setiap alinyemen pada profil desainnya (di atas tanah bila tidak ada profil), dengan tanda setiap 50 ft atau 20 m |
| Garis fitur koridor | Tepi perkerasan, bahu, dan daylight di kedua sisi |
| Permukaan jalan | Jalan yang dibangun setiap koridor dari assembly-nya: lajur, bahu, selokan, kerb, jalur, dan trotoar, masing-masing dalam warnanya sendiri, di atas permukaan yang diratakan |
| Tanaman | Setiap tanaman, dan tanaman dalam bedeng dan pagar, sebagai bentuk sederhana yang ukurannya diambil dari daftar tanaman: pohon berupa batang dan mahkota bulat (kerucut untuk konifer, rumpun di batang tinggi untuk palem), semak, tanaman pagar, tanaman perdu, dan penutup tanah berupa kubah, rumput berupa rumpun, dan tanaman merambat berupa kolom tipis. Mereka berdiri di permukaan yang diratakan (atau tanah yang ada) pada ukuran yang ditampilkan denah: dewasa, atau saat ditanam |
| Perkerasan | Perkerasan dan jalur dengan kemiringannya, dinding, kerb, tangga, dan rampa yang naik dalam deret dengan bordes datar di antaranya |
| Pad dan daylight | Garis tepi setiap pad pada elevasinya dan garis daylight-nya |
| Pipa dan bangunan | Pipa sebagai pipa bulat di antara invert-nya, bangunan dari rim hingga sump |
| Titik survei | Sebuah titik di setiap titik dengan elevasi (mati pada awalnya) |
| Layer GIS | Layer GIS yang ditampilkan di denah, dengan warnanya: garis dan garis tepi pada elevasinya sendiri, yang lain diletakkan di atas tanah yang ada (mengikutinya persis); titik sebagai tanda silang kecil. Bentuk tanpa elevasi di luar permukaan dibiarkan keluar, dan tampilan menyebutkan jumlahnya |
| Label | Nama dan nilai yang selalu menghadap Anda: nama setiap alinyemen di awalnya dan stasiunnya setiap 100 ft (atau 100 m), elevasi setiap kontur mayor, pad, garis fitur, dan bangunan menurut nama, serta dengan **Titik survei** dicentang, nomor dan elevasi setiap titik |

Label tetap sama ukurannya dan tegak lurus, bagaimanapun Anda memutar atau memperbesar tampilan, dan bukit di depan label menyembunyikannya. Bila label akan berdesakan, yang paling penting tampil dan sisanya menunggu sampai Anda memperbesar: alinyemen lebih dulu, lalu bangunan, pad, garis fitur, stasiun, kontur, dan titik, yang lebih dekat didahulukan. Label hanya ada di layar; ekspor dan plot tidak menyertakannya.

Pilihan Anda, pembesaran, dan pewarnaan diingat di peramban ini.

Jalan dibangun di atas tanah yang ada. Dengan alinyemen dan koridor tetapi belum ada titik survei atau permukaan, jalan digambar di atas tanah pengganti yang datar untuk sekarang: pada elevasi rata-rata profil desainnya, atau rata pada elevasi 0 bila tidak ada profil sama sekali. Peringatan di bagian bawah tampilan 3D dan di properti koridor menyatakannya. Ini hanya gambaran: tidak ada volume atau penampang yang dihasilkan darinya. Buka titik survei atau permukaan, dan jalan akan pindah ke tanah sebenarnya dengan sendirinya.

Pembesaran vertikal meregangkan tanah, bukan tanaman: mereka berdiri di atas tanah yang dibesarkan pada tinggi dan sebaran sebenarnya, sehingga pohon tampak seperti pohon pada pengaturan apa pun. Tanaman adalah bentuk sederhana, bukan model rinci: ribuan tanaman tetap cepat diputar dan di-zoom.

## Pipa dan bangunan

- Pipa digambar dengan bagian dalam bawahnya pada invert yang Anda atur dan bagian dalam atasnya (mahkota) satu diameter dalam lebih tinggi. Diameter dalam inci pada proyek kaki dan milimeter pada proyek meter, seperti di panel kanan.
- Bangunan membentang dari rim-nya (diketik, atau dari permukaan) turun ke sump-nya (invert terendah dikurangi kedalaman sump). Tanpa invert apa pun, ia digambar sedalam 5 ft (1.5 m).
- Pipa dan bangunan yang bermasalah (lihat pemeriksaan jaringan di panel kanan) digambar dengan warna merah.
- Pipa tanpa invert tidak digambar; catatan di bagian bawah tampilan menyebutkan jumlahnya.

## Pilih dari tampilan 3D

Klik alinyemen (atau jalannya), pad, garis fitur, pipa, bangunan, titik survei, tanaman, rampa, atau perkerasan lain. Item itu dipilih persis seperti bila Anda mengkliknya di denah: propertinya terbuka di panel kanan, tempat Anda dapat mengeditnya, dan ia digambar dengan warna pilihan di atas segalanya dalam 3D. Apa pun yang Anda pilih di denah juga disorot di 3D. Tip di dekat penunjuk menyebutkan apa yang Anda klik beserta timur, utara, dan elevasinya. Pipa dan bangunan dapat diklik meskipun berada di bawah tanah; garis yang tersembunyi di balik bukit tidak dapat diklik tembus.

Klik breakline untuk melihat yang mana: ia disorot, dan bilah status menamainya (breakline tidak memiliki propertinya sendiri).

Klik tanah untuk membaca timur, utara, dan elevasi di situ pada tip.

## Berkendara di sepanjang alinyemen

Klik **Kendarai** di bilah 3D dan pilih sebuah alinyemen. Tampilan berpindah ke kursi pengemudi: 3.5 ft (1.07 m) di atas jalan, pada profil desainnya (di atas tanah yang ada sepanjang sumbu bila belum ada profil), menghadap ke depan sepanjang jalan.

- **Putar** atau {{key:Space}} berkendara dengan kecepatan yang Anda pilih (10 sampai 65 mph, atau 15 sampai 100 km/jam); {{key:Space}} lagi menjeda. Berhenti di akhir; **Putar** kemudian mulai lagi dari awal.
- Penggeser melompat ke stasiun mana pun; {{key:Left}} dan {{key:Right}} melangkah mundur dan maju 10 ft (5 m).
- Menyeret di dalam tampilan menjeda dan memungkinkan Anda melihat sekeliling.
- **Berhenti** atau {{key:Esc}} mengembalikan tampilan ke tempat semula.

Pembesaran vertikal juga berlaku saat berkendara: atur ke 1× untuk melihat jalan seperti akan jadinya.

## Cahaya dari matahari

Buka **Matahari** di bilah 3D dan centang **Cahaya dari matahari**. Isi tanggal, jam, dan zona waktunya (selisih dari UTC: pada musim panas, yang berlaku waktu musim panas), serta lintang dan bujur lokasi. Bila proyek memiliki sistem koordinat, keduanya diisi darinya.

Lokasi kemudian diterangi dari arah matahari, dengan **Bayangan** di seluruh tanah, koridor, dan pad; menu menyebutkan azimut matahari dan ketinggiannya, atau bahwa matahari berada di bawah cakrawala. Posisinya berasal dari persamaan surya NOAA. Bayangan jatuh ke arah yang benar pada pembesaran apa pun, tetapi berhenti di tepi lokasi: bukit dan bangunan di luarnya tidak menghasilkan bayangan.

## Ekspor tampilan 3D

Klik {{ui:GLB}} atau {{ui:OBJ}} di bilah. Yang ditampilkan tampilan disimpan dalam skala sebenarnya (tanpa pembesaran), dalam meter, dengan Y ke atas. Rincian: [Ekspor lokasi dalam 3D](topic:export-3d).
