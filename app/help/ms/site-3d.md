---
title: Lihat tapak dalam 3D
summary: Buka paparan 3D, orbit, pan dan zum, tetapkan pembesaran menegak dan pewarnaan, pilih apa yang ditunjukkan, dan klik penjajaran, pelantar, garisan ciri, garis pecah, paip, struktur serta titik untuk memilihnya.
keywords: label, label 3d, papan iklan, label menghadap kamera, label stesen, label kontur, label titik, salutan, udara, lapisan peta pada permukaan, 3d, tiga dimensi, paparan 3d, ViewCube, kompas, orbit, perspektif, selari, isometrik, iso, pembesaran menegak, rupa bumi, model, model tapak, terbang sekeliling, visualisasi, render, paip dalam 3d, struktur, lubang periksa, koridor 3d, jalan dalam 3d, permukaan jalan, lorong, kerb, kaki lima, tumbuhan dalam 3d, pokok dalam 3d, semak, pagar hidup, landskap 3d, ramp dalam 3d, tangga, dinding, turapan, hardscape 3d
from: a16bafe1
---

Paparan 3D menunjukkan tapak sebagai satu model: tanah sedia ada dan permukaan yang dikerjakan, kontur dilekatkan padanya, garis pecah dan tepi permukaan, setiap penjajaran pada profil reka bentuknya dengan tanda stesen, garisan ciri koridor dan jalan itu sendiri (lorong, bahu, parit, kerb, jalur dan kaki lima dalam warnanya sendiri), pelantar dengan garisan cahaya siangnya, rangkaian paip dengan paip dan struktur pada ketinggian sebenarnya, dan dari ruang kerja Landskap, tumbuhan, turapan, laluan, dinding, kerb, ramp dan tangga. Ia membaca projek yang sama seperti pelan, jadi setiap suntingan kelihatan dalam kedua-duanya.

## Buka paparan 3D

1. Buka titik ukur (atau fail LandXML atau projek) supaya ada permukaan. Tumbuhan, turapan atau ramp sahaja juga memadai untuk membukanya.
2. Tekan {{key:D}}, atau klik {{ui:3D}} dalam kumpulan {{ui:Pandangan}} bar alat.
   Paparan 3D dibuka di atas pelan, melihat keseluruhan tapak dari tenggara. Kali pertama, ia mengambil sedikit masa untuk dimuatkan.
3. Tekan {{key:D}} sekali lagi, atau klik {{ui:3D}} sekali lagi, untuk kembali ke pelan. Memilih alat lukisan seperti {{ui:Penjajaran}} atau {{ui:Pelantar}} juga kembali ke pelan, kerana lukisan dibuat di sana.

## Bergerak sekeliling

| Untuk | Lakukan ini |
|---|---|
| Orbit | Seret dengan butang kiri atau tengah |
| Pan | Seret dengan butang kanan, atau {{key:Shift}} dan seret |
| Zum | Pusing roda; ia menzum ke arah penunjuk |
| Orbit pada pad sentuh | Leret dengan dua jari ({{key:Shift}} dan leret untuk pan) |
| Zum pada pad sentuh | Cubit |
| Sentuh | Satu jari mengorbit; dua jari mencubit untuk zum dan bergerak untuk pan |
| Kekunci (paparan mempunyai fokus) | {{key:Left}} {{key:Right}} {{key:Up}} {{key:Down}} mengorbit, dengan {{key:Shift}} ia memanning; {{key:Plus}} dan {{key:Minus}} zum |

Bar di atas paparan mempunyai selebihnya:

- Senarai paparan: **Iso**, **Atas**, **Bawah**, **Depan** (menghadap utara), **Belakang**, **Kiri**, **Kanan**.
- {{ui:Perspektif}}: ditekan ialah paparan perspektif; klik untuk unjuran selari (tiada pemendekan).
- {{ui:Lingkungan}}: menunjukkan semuanya semula. {{key:F}} melakukan perkara yang sama semasa paparan 3D dibuka.

## ViewCube

ViewCube di sudut kanan atas berpusing bersama pandangan. Klik sisi, tepi atau bucu untuk melihat tapak dari situ (kamera berpusing dengan lancar melainkan sistem anda meminta pergerakan dikurangkan). Seret kiub untuk mengorbit. Gelang kompas di bawahnya menunjukkan utara (utara grid, +Y): seret gelang untuk memutar tapak sekitar menegak, atau klik N, E, S atau W untuk melihat dari sisi itu. {{ui:Laman utama}}, ikon rumah kecil di sudut kiri atasnya, kembali ke pandangan iso bagi keseluruhan tapak. Dengan papan kekunci: {{key:Tab}} ke kiub, anak panah memilih sisi, tepi atau bucu, dan {{key:Enter}} melihat dari situ.

Pada pelan, kiub yang sama menunjukkan bahagian atas. Klik mana-mana sisi, tepi atau bucu lain (atau seretnya) untuk membuka paparan 3D yang menghadap dari situ: ini cara paling pantas masuk ke 3D dari arah tertentu. Untuk menggantikan kiub dengan ikon paksi kecil, atau menyembunyikannya, lihat **Penunjuk sudut** dalam [Tetapan CivilCraft](topic:settings).

## Besarkan ketinggian

Tapak biasanya jauh lebih lebar daripada tingginya, jadi ketinggian diregangkan sebanyak **2×** pada permulaan. Pilih **1×**, **2×**, **3×**, **5×** atau **10×** dalam senarai pada bar, atau di bawah **Pembesaran menegak 3D** dalam [Tetapan CivilCraft](topic:settings) (kedua-duanya ialah satu tetapan). Hanya paparan berubah: isipadu, profil dan eksport kekal pada skala sebenar.

## Warnakan permukaan

- **Jalur ketinggian**: jalur dan warna yang sama seperti jalur ketinggian pelan (bilangan jalur ditetapkan di bawah **Paparan** dalam panel kiri). Setiap tepi jalur dipotong tepat pada ketinggiannya.
- **Satu warna**: tanah sedia ada dan permukaan yang dikerjakan masing-masing dalam warna biasa.
- **Lapisan peta**: lapisan peta yang ditunjukkan di bawah pelan (gambar bergeorujukan, jubin peta atau perkhidmatan peta; lihat [Lapisan peta](topic:map-layers)) dilapiskan ke atas permukaan seperti helaian, supaya foto udara kelihatan di atas bukit. Gambar yang masih dimuatkan diisi apabila tiba. Tanpa lapisan peta ditunjukkan, permukaan kekal dengan jalur ketinggiannya dan paparan menyatakannya. Gambar itu untuk skrin: eksport GLB dan OBJ tidak membawanya.

Apabila kedua-dua permukaan ditunjukkan, tanah sedia ada lutsinar di atas permukaan yang dikerjakan, supaya anda dapat melihat potongan (tanah di atas reka bentuk) dan tambakan.

## Pilih apa yang ditunjukkan

Klik {{ui:Tunjuk}} pada bar dan tanda atau nyahtanda:

| Item | Maksudnya |
|---|---|
| Tanah sedia ada | Permukaan yang dibina daripada titik ukur (atau dibaca dari LandXML) |
| Permukaan yang dikerjakan | Tanah sedia ada dengan koridor dan pelantar dikerjakan (hanya apabila ada) |
| Tepi segi tiga | Setiap tepi TIN, sebagai garisan |
| Kontur | Kontur kecil dan utama bagi setiap permukaan yang ditunjukkan, pada selang pelan |
| Tepi permukaan | Tepi luar setiap permukaan yang ditunjukkan, pada ketinggiannya |
| Garis pecah | Setiap garis pecah, pada ketinggiannya |
| Penjajaran dan stesen | Setiap penjajaran pada profil reka bentuknya (di atas tanah jika tiada profil), dengan tanda setiap 50 kaki atau 20 m |
| Garisan ciri koridor | Tepi turapan, bahu dan cahaya siang di kedua-dua sisi |
| Permukaan jalan | Jalan yang dibina oleh setiap koridor, daripada himpunannya: lorong, bahu, parit, kerb, jalur dan kaki lima, setiap satu dalam warnanya sendiri, pada permukaan yang dikerjakan |
| Tumbuhan | Setiap tumbuhan, dan tumbuhan dalam bed serta pagar hidup, sebagai bentuk ringkas yang disaiz daripada senarai tumbuhan: pokok ialah batang dan mahkota bulat (kon untuk konifer, rumpun di atas batang tinggi untuk palma), semak, tumbuhan pagar, tumbuhan saka dan penutup tanah ialah kubah, rumput ialah rumpun, pokok memanjat ialah tiang nipis. Ia berdiri di atas permukaan yang dikerjakan (atau tanah sedia ada) pada saiz yang ditunjukkan pelan: matang, atau semasa penanaman |
| Hardscape | Turapan dan laluan dengan kejatuhannya, dinding, kerb, tangga, dan ramp yang naik dalam larian dengan pelantar rata di antaranya |
| Pelantar dan cahaya siang | Setiap garis luar pelantar pada ketinggiannya dan garisan cahaya siangnya |
| Paip dan struktur | Paip sebagai paip bulat antara invert mereka, struktur dari rim ke sump |
| Titik ukur | Titik di setiap titik dengan ketinggian (mati pada mulanya) |
| Lapisan GIS | Lapisan GIS yang ditunjukkan pada pelan, dalam warnanya: garisan dan garis luar dengan ketinggian mereka sendiri pada ketinggian tersebut, yang lain diletakkan di atas tanah sedia ada (mengikutinya tepat); titik sebagai silang kecil. Bentuk tanpa ketinggian di luar permukaan ditinggalkan, dan paparan menyatakan berapa banyak |
| Label | Nama dan nilai yang sentiasa menghadap anda: nama setiap penjajaran pada permulaannya dan stesennya setiap 100 kaki (atau 100 m), ketinggian setiap kontur utama, pelantar, garisan ciri dan struktur mengikut nama, dan dengan **Titik ukur** ditandakan setiap nombor dan ketinggian titik |

Label kekal pada saiz yang sama dan tegak walau bagaimana pun anda memusing atau zum, dan bukit di hadapan label menyembunyikannya. Apabila ia akan sesak, yang paling penting ditunjukkan dan selebihnya menunggu sehingga anda zum masuk: penjajaran dahulu, kemudian struktur, pelantar, garisan ciri, stesen, kontur dan titik, yang lebih dekat dahulu. Ia hanya pada skrin; eksport dan plot meninggalkannya.

Pilihan anda, pembesaran menegak dan pewarnaan diingati dalam pelayar ini.

Jalan dibina di atas tanah sedia ada. Dengan penjajaran dan koridor tetapi tiada titik ukur atau permukaan lagi, jalan dilukis di atas tanah pengganti yang rata buat masa ini: pada ketinggian purata profil reka bentuknya, atau rata pada ketinggian 0 apabila tiada profil juga. Amaran di bahagian bawah paparan 3D dan dalam sifat koridor menyatakannya. Ia hanya gambar: tiada isipadu atau keratan datang daripadanya. Buka titik ukur atau permukaan dan jalan itu berpindah ke tanah sebenar dengan sendirinya.

Pembesaran menegak meregangkan tanah, bukan tumbuhan: mereka berdiri di atas tanah yang diperbesarkan pada ketinggian dan penyebaran sebenar mereka, jadi pokok kelihatan seperti pokok pada mana-mana tetapan. Tumbuhan ialah bentuk ringkas, bukan model terperinci: beribu-ribu daripadanya kekal pantas untuk dipusing dan dizum.

## Pilih dari paparan 3D

Klik penjajaran (atau jalannya), pelantar, garisan ciri, paip, struktur, titik ukur, tumbuhan, ramp atau hardscape lain. Ia dipilih sama seperti jika anda klik pada pelan: sifatnya dibuka dalam panel kanan, tempat anda boleh menyuntingnya, dan ia dilukis dalam warna pilihan di atas segala-galanya dalam 3D. Apa sahaja yang anda pilih pada pelan juga diserlahkan dalam 3D. Tip di sebelah penunjuk menamakan apa yang anda klik dengan timur, utara dan ketinggiannya. Paip dan struktur boleh diklik walaupun berada di bawah tanah; garisan yang tersembunyi di belakang bukit tidak boleh diklik menembusinya.

Klik garis pecah untuk melihat yang mana satu ia: ia diserlahkan, dan bar status menamakannya (garis pecah tiada sifat tersendiri).

Klik tanah untuk membaca timur, utara dan ketinggian di situ dalam tip.

## Pandu sepanjang penjajaran

Klik **Pandu** pada bar 3D dan pilih penjajaran. Pandangan bergerak ke tempat duduk pemandu: 3.5 kaki (1.07 m) di atas jalan, pada profil reka bentuknya (di atas tanah sedia ada sepanjang garis tengah apabila ia belum ada), melihat ke hadapan sepanjangnya.

- **Main** atau {{key:Space}} memandu pada kelajuan yang anda pilih (10 hingga 65 mph, atau 15 hingga 100 km/h); {{key:Space}} sekali lagi menjeda. Ia berhenti di hujung; **Main** kemudian bermula semula dari awal.
- Gelangsar melompat ke mana-mana stesen; {{key:Left}} dan {{key:Right}} melangkah 10 kaki (5 m) ke belakang dan ke hadapan.
- Menyeret dalam paparan menjeda dan membenarkan anda melihat sekeliling.
- **Henti** atau {{key:Esc}} meletakkan pandangan kembali ke tempat asalnya.

Pembesaran menegak juga terpakai semasa memandu: tetapkan kepada 1× untuk melihat jalan seperti yang akan dibina.

## Cahaya dari matahari

Buka **Matahari** pada bar 3D dan tanda **Cahaya dari matahari**. Beri tarikh, masa jam dan zon waktunya (offset dari UTC: pada musim panas, zon jimat siang), serta latitud dan longitud tapak. Apabila projek mempunyai sistem koordinat, ia diisi daripadanya.

Tapak kemudian diterangi dari tempat matahari berada, dengan **Bayang** merentasi tanah, koridor dan pelantar; menu menyatakan azimut matahari dan betapa tingginya, atau bahawa ia di bawah ufuk. Kedudukan datang daripada persamaan solar NOAA. Bayang jatuh dengan betul pada mana-mana pembesaran, tetapi ia berhenti di tepi tapak: bukit dan bangunan di luarnya tidak membuang bayang.

## Eksport paparan 3D

Klik {{ui:GLB}} atau {{ui:OBJ}} pada bar. Apa yang ditunjukkan pandangan disimpan, pada skala sebenar (tiada pembesaran), dalam meter, dengan Y ke atas. Butiran: [Eksport tapak dalam 3D](topic:export-3d).
