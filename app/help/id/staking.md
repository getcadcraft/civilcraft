---
title: Buat laporan pematokan
summary: Daftar patok di sepanjang alinyemen pada stasiun dan offset, atau titik survei di dekatnya, dengan stasiun, offset, northing, easting, elevasi desain dan elevasi tanah, serta galian atau timbunan, dan simpan laporan sebagai CSV atau PDF.
keywords: pematokan, stakeout, laporan patok, lembar galian, lembar grading, stasiun, offset, galian, timbunan, tata letak, pematokan konstruksi, as-built
from: d8a4e9f1
---

Pilih alinyemen lalu klik **Laporan pematokan** di **Properti**-nya.

## Patok pada stasiun dan offset

1. **Dari** dan **sampai**: stasiun yang akan dipatok (1+50 atau 150).
2. **setiap**: intervalnya. Patok ditempatkan di setiap kelipatannya, di kedua ujung, dan (jika kotak dicentang) di tempat lengkung alinyemen dimulai dan berakhir.
3. **Offset**: kiri dan kanan alinyemen, dengan memandang ke arah stasiun yang naik: `12 L, 0, 12 R`, `L12 CL R12` atau `-12, 0, 12` (kiri bernilai minus). Alinyemen dengan koridor dimulai dengan tepi perkerasan dan bahunya.
4. **Beri nomor dari** dan **dengan awalan** memberi nama pada patok: 1, 2, 3, atau S101, S102.

## Titik survei di dekat alinyemen

Pilih **titik survei di dekat alinyemen** dan seberapa dekat. Setiap titik dalam jarak itu mendapat stasiun dan offset-nya, desain di sana, dan elevasinya sendiri sebagai tanah: pemeriksaan titik yang dipatok atau diukur sebagai as-built.

## Isi laporan

| Kolom | Isinya |
|---|---|
| Titik | Nama patok, atau nomor titik survei |
| Stasiun, Offset | Lokasinya di sepanjang alinyemen: L kiri, R kanan |
| Northing, Easting | Koordinatnya |
| Elev. desain | Permukaan koridor yang sudah digrading di sana (dari garis daylight ke garis daylight), jika tidak ada maka profil desain pada as jalan |
| Elev. tanah | Permukaan yang ada di sana, atau elevasi titik survei itu sendiri |
| Galian/timbunan | C jika tanah di atas desain (dipotong), F jika di bawah (ditimbun), sampai seperseratus |

Patok tanpa elevasi desain (di luar koridor, atau pada alinyemen tanpa desain yang jauh dari as jalan) tidak memiliki galian atau timbunan; dialog menyebutkan jumlahnya.

## Simpan

- **CSV**: satu baris judul, lalu kolom di atas, ditambah galian atau timbunan sebagai angka bertanda (tanah dikurangi desain) untuk spreadsheet dan alat pengumpul data.
- **PDF**: halaman tabel pada kertas yang Anda pilih, satu patok per baris, galian berwarna oranye dan timbunan berwarna hijau, dengan strip judul seperti lembar lainnya.

:::note
Patok dihitung dari desain dalam proyek. Periksa terhadap gambar yang sudah disetujui sebelum ada yang dibangun.
:::
