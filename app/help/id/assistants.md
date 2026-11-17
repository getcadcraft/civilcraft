---
title: Biarkan asisten AI bekerja dengan lokasi Anda
summary: Aktifkan asisten di Pengaturan agar asisten di komputer Anda dapat membaca lokasi yang terbuka (titik, permukaan, volume, profil, persil), menambahkan titik survei, menyimpan dan mengekspor LandXML atau DWG, melalui CadCraft Studio. Nonaktif sampai Anda mengaktifkannya.
keywords: ai, asisten, mcp, skrip, otomatisasi, studio, titik, elevasi, stasiun, offset, alinyemen, volume, galian, timbunan, profil, persil, landxml, dwg, usd, folder, izin, putuskan, aktivitas
from: d0356582
---

## Yang akan Anda pelajari

Cara membiarkan asisten AI (asisten apa pun yang berbicara MCP) bekerja dengan lokasi yang sedang Anda buka, apa yang dapat dan tidak dapat dilakukannya, dan cara menghentikannya.

## Apa yang dapat dilakukan asisten di CivilCraft

| Ia meminta | Yang diterimanya | Membutuhkan |
|---|---|---|
| Lokasi | Nama, satuan, sistem koordinat, grup titik, alinyemen, permukaan, pad, persil, dan pipa | Baca |
| Titik survei | Nomor, easting, northing, elevasi, dan deskripsi, per grup, per deskripsi, atau di dalam kotak | Baca |
| Elevasi permukaan | Tanah eksisting (atau permukaan yang digrading) di titik mana pun yang disebutkannya | Baca |
| Stasiun dan offset | Stasiun dan offset titik sepanjang alinyemen, atau koordinat dan elevasi tanah dari stasiun | Baca |
| Sebuah profil | Elevasi tanah, profil rancangan, dan permukaan grading sepanjang alinyemen, setiap sekian kaki atau meter | Baca |
| Galian dan timbunan | Volume antara tanah eksisting dan permukaan grading (termasuk setiap pad dan koridor), atau antara tanah dan sebuah level | Baca |
| Persil | Sudut, luas (dalam acre atau hektare), keliling, dan deskripsi hukum | Baca |
| Sebuah pilihan | Titik yang disebutkannya dipilih di denah, seolah Anda yang memilihnya | Ubah |
| Titik survei baru | Titik ditambahkan dengan nomor yang diberikannya, atau nomor kosong berikutnya. Setiap panggilan adalah satu langkah yang dapat Anda urungkan | Ubah |
| Simpan | {{ui:Simpan}} milik CivilCraft sendiri | Simpan |
| LandXML atau DWG | File yang sama dengan tombol {{ui:LandXML}} dan {{ui:DWG}} | Ekspor |
| Lokasi dalam 3D | OpenUSD (.usdz, .usda, atau .usdc) dari tanah, permukaan grading, pad, dan pipa, seperti yang diekspor tampilan 3D | Ekspor |
| Tanaman dan jadwal tanaman | Tanaman yang ditemukan di daftar tanaman dengan nama apa pun, dan jumlah pada jadwal tanaman | Baca |
| Penanaman dan grading | Tanaman, bedengan, atau pagar tanaman ditempatkan, atau platform, tanggul, saluran, atau area grading ditambahkan; setiap langkah dapat Anda urungkan, beserta galian dan timbunannya | Ubah |
| Pemeriksaan irigasi | Debit setiap zona, tekanan yang dibutuhkan di katupnya dan di pasokan, tinggi tekan kasus terburuk, durasi penyiraman, masalah, dan daftar material, sebagai alat bantu hitung yang diperiksa perancang irigasi | Baca |

Ia bekerja dengan lokasi yang sedang terbuka. Di Studio ia juga dapat menyimpan dan mengekspor ke folder yang Anda pilih (di bawah); tanpa folder, filenya diunduh seperti yang dilakukan tombol-tombol.

## Mengaktifkannya

Asisten terhubung ke CivilCraft melalui CadCraft Studio di komputer Anda; peramban biasa tidak memiliki jalan masuk.

1. Buka {{ui:Pengaturan}} dan pilih tab **CivilCraft**.
2. Di bawah **Asisten**, centang **Biarkan asisten AI dan skrip menggunakan CivilCraft**.
3. **Baca** sudah dicentang untuk Anda. Centang **Ubah**, **Simpan**, atau **Ekspor** hanya saat asisten membutuhkannya.
4. Untuk membiarkannya menyimpan dan mengekspor ke folder, pilih {{ui:Tambahkan folder…}} di bawah **Folder yang boleh digunakan** dan pilih folder di dialog Studio. {{ui:Buang}} menariknya kembali seketika; jalur lain ditolak.
5. Hubungkan asisten di Studio (Studio menampilkan alamat dan pengaturan yang perlu ditempelkan ke dalamnya).

## Saat asisten terhubung

Catatan di bagian atas panel kanan menyatakan asisten mana yang terhubung dan apa yang dapat dilakukannya. Klik {{ui:Putuskan}} untuk mengakhiri sesinya seketika; asisten harus terhubung lagi untuk melanjutkan.

**Aktivitas**, di bawah **Asisten** pada Pengaturan, mencantumkan setiap panggilan yang dibuat asisten, yang terbaru di atas, beserta apakah berhasil.

:::tip
Tanyakan dengan kata-kata biasa, misalnya "berapa elevasi tanah setiap 50 kaki di sepanjang Main Street?", "berapa galian dan timbunan yang dibutuhkan pad?" atau "tambahkan titik kontrol di koordinat ini". Asisten membaca lokasi dan menjawab, atau membuat perubahan sebagai satu langkah yang dapat Anda urungkan.
:::

## Tanpa membuka CivilCraft

Server file CadCraft untuk asisten (`npx @getcadcraft/mcp`) dan baris perintah `cadcraft` membuka proyek CivilCraft yang tersimpan (`.civilcraft.json`) dan file titik dengan kode CivilCraft sendiri, tanpa jendela: alat baca yang sama, penambahan titik, penyimpanan proyek, LandXML, dan lokasi dalam 3D sebagai OpenUSD. `cadcraft convert site.civilcraft.json site.xml` menulis LandXML dari baris perintah. Membuka LandXML, ekspor DWG, dan alat ruang kerja Landscape tetap memerlukan jendela CivilCraft.

## Menonaktifkannya

Hapus centang **Biarkan asisten AI dan skrip menggunakan CivilCraft**. Setiap asisten langsung diputuskan, dan pengaturannya disimpan untuk lain waktu.

## Lihat juga

- [Resep untuk asisten AI](common:assistants-recipes): contoh kerja, masing-masing dengan alat yang dipanggilnya.
- [Susun alinyemen horizontal](topic:alignment)
- [Bangun dan sempurnakan permukaan](topic:build-surface)
- [Pilih, salin, dan tempel titik survei](topic:copy-paste-points)
- [Pengaturan CivilCraft](topic:settings)
