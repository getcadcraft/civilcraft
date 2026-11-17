---
title: Format file titik
summary: Urutan kolom yang dibaca CivilCraft, cara menemukan pemisah dan baris header, nama header yang dikenali, dan cara baris diperiksa.
keywords: pnezd, penzd, pnez, penz, nezd, enzd, nez, enz, csv, txt, pnt, xyz, format file titik, kolom, header, pemisah
from: 84fab42e
---

Sebuah file titik adalah teks biasa, satu titik per baris. CivilCraft membacanya di peramban; tidak ada yang diunggah.

## Urutan kolom

Huruf menamai kolom dari kiri ke kanan: **P** nomor atau nama titik, **N** northing, **E** easting, **Z** elevasi, **D** deskripsi.

| Urutan | Kolom | Contoh baris |
|---|---|---|
| PNEZD | titik, northing, easting, elevasi, deskripsi | `101,2080000.00,6150000.00,250.00,GRD` |
| PENZD | titik, easting, northing, elevasi, deskripsi | `101,6150000.00,2080000.00,250.00,GRD` |
| PNEZ | titik, northing, easting, elevasi | `101,2080000.00,6150000.00,250.00` |
| PENZ | titik, easting, northing, elevasi | `101,6150000.00,2080000.00,250.00` |
| NEZD | northing, easting, elevasi, deskripsi | `2080000.00,6150000.00,250.00,GRD` |
| ENZD | easting, northing, elevasi, deskripsi | `6150000.00,2080000.00,250.00,GRD` |
| NEZ | northing, easting, elevasi | `2080000.00 6150000.00 250.00` |
| ENZ | easting, northing, elevasi | `6150000.00 2080000.00 250.00` |

Urutan tanpa P memberi nomor titik 1, 2, 3 … menurut urutan file. X adalah easting dan Y adalah northing.

## Pemisah

CivilCraft memeriksa 20 baris pertama dan memilih yang pertama dari berikut ini yang muncul di setidaknya 60% dari baris tersebut: koma, tab, titik koma. Jika tidak ada, ia memisahkan pada rangkaian spasi.

- Dalam file dengan koma, tab, dan titik koma, field di dalam tanda kutip ganda dapat memuat pemisah (`"FL, NORTH"`), dan `""` di dalam tanda kutip adalah satu tanda kutip.
- Dalam file berpemisah spasi, deskripsi di akhir baris boleh berisi spasi: semua yang berada setelah kolom koordinat terakhir adalah deskripsi.
- Baris yang diawali `#`, `;`, atau `//`, dan baris kosong, dilewati.
- Byte-order mark di awal file diabaikan.

## Baris header

Baris pertama dianggap sebagai header jika kurang dari dua field-nya berupa angka. Jika setiap field header adalah nama yang dikenali CivilCraft, urutan kolom diambil darinya ("dari baris header"). Nama dicocokkan tanpa memperhatikan huruf besar-kecil, spasi, titik, garis bawah, tanda hubung, dan kurung siku:

| Kolom | Nama yang dikenali |
|---|---|
| P | pt, pnt, point, point no, point number, number, no, id, name, pt#, point#, # |
| N | n, north, northing, y, y coord, lat, latitude |
| E | e, east, easting, x, x coord, lon, long, longitude |
| Z | z, elev, elevation, el, height, h, z coord, rl |
| D | d, desc, description, code, raw description, full description, note, notes, feature |

Jika ada nama header yang tidak dikenali, atau nama-namanya tidak membentuk salah satu dari delapan urutan, header dilewati dan urutan ditebak dari jumlah kolom.

:::warning
Header yang menamai kolom lintang (`lat`, `latitude`) dan kolom bujur (`lon`, `long`, `longitude`) sekaligus dibaca sebagai derajat, bukan sebagai northing dan easting. Pada {{ui:Impor}} titik dikonversi melalui sistem koordinat proyek, dan proyek tanpa sistem koordinat meminta Anda memilihnya terlebih dahulu. Baris di luar lintang ±90° atau bujur ±180° ditolak. Lihat [Impor data GIS](topic:gis-import#point-files-with-latitude-and-longitude).
:::

## Menebak dari jumlah kolom

Tanpa header yang dapat digunakan dan dengan **Kolom** dibiarkan pada {{ui:Deteksi}}:

- 5 kolom atau lebih: PNEZD.
- 4 kolom: PNEZ jika kolom pertama adalah bilangan bulat di setiap baris sampel dan kolom keempat adalah angka; selain itu NEZD.
- 3 kolom: NEZ.

PNEZD dan PENZD tidak dapat dibedakan dari angkanya. Tebakan mengikuti **Baris titik** di [Pengaturan CivilCraft](topic:settings): P, N, E, Z, D di awal, atau P, E, N, Z, D (lalu empat kolom dibaca sebagai PENZ dan tiga kolom sebagai ENZ). Dialog menyatakan "ditebak dari jumlah kolom — periksa apakah northing dan easting tertukar". Pilih urutan yang benar di **Kolom** jika pratinjau tampak salah.

## Bagaimana baris diperiksa

- Sebuah baris boleh tidak menyertakan deskripsi.
- Northing dan easting harus berupa angka. Elevasi boleh kosong (titiknya tetap disimpan tetapi tidak dipakai dalam permukaan).
- Nomor titik boleh berupa teks apa pun (huruf juga, seperti `CP1`), tetapi tidak boleh kosong.
- Jika nomor titik berulang, baris pertama disimpan dan baris lainnya dicantumkan sebagai tidak terbaca.
- Deskripsi disimpan hingga 200 karakter; karakter kontrol menjadi spasi.
- Hingga 200 baris tak terbaca disimpan untuk dialog (25 ditampilkan), dan semuanya dihitung.

## Grup titik

Grup sebuah titik adalah kata pertama dari deskripsinya dalam huruf kapital. "GRD", "grd shot", dan "Grd" semuanya berada di grup GRD. Titik tanpa deskripsi berada di "(tanpa deskripsi)". Lihat [Impor titik survei](topic:import-points).

## Menulis titik

CivilCraft belum mengekspor file teks titik. Titik keluar dalam LandXML (sebagai CgPoints), dalam file proyek, dan melalui {{ui:Ekspor}} GIS sebagai shapefile, GeoPackage, atau GeoJSON dengan field P, N, E, Z, dan D ([Ekspor data as-built untuk GIS](topic:gis-export)). Lihat [Belum dibuat](topic:not-built-yet).
