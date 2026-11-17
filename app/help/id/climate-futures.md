---
title: "Proyeksi iklim: banjir, panas, dan kebakaran hutan 2050 dan 2080"
summary: Di Alamat ke lokasi, naikkan level banjir lokasi untuk iklim masa depan, periksa paparan kebakaran hutan dan ubah file cuaca, sajikan berdampingan dengan kondisi masa depan, dari paket data iklim (SSP2-4.5 dan SSP5-8.5, 2050 dan 2080).
keywords: iklim, perubahan iklim, masa depan, 2050, 2080, ssp, cmip6, skenario, kenaikan muka laut, banjir, elevasi banjir dasar, bfe, fema, panas, file cuaca, epw, morph, kebakaran hutan, kebakaran semak
from: b0d2ee38
---

Angka iklim berasal dari **paket data**, bukan dari aplikasinya sendiri. Aktifkan add-on {{ui:Proyeksi iklim}} di Pengaturan › Add-on, atau muat file paket milik Anda sendiri di blok {{ui:Iklim masa depan}}.

:::warning
Paket yang disertakan bersama add-on adalah **sampel**: tiga tempat (Denver, Miami, Johannesburg), satu model iklim, dan lima tahun di setiap periode 20 tahun. Paket itu ada untuk mencoba alatnya, **bukan untuk rancangan**. Paket lengkap dibangun dengan `tools/climate/build-pack.mjs` dari data NEX-GDDP-CMIP6 milik NASA.
:::

## Di mana letaknya

Permukaan › Lainnya › Alamat ke lokasi. Atur titik, tambahkan layer (layer banjir FEMA memberikan elevasi banjir dasar), lalu tekan tombol yang membaca lokasi. Di bawah baris lokasi ada blok {{ui:Iklim masa depan}}: pilih **Skenario** (SSP2-4.5 atau SSP5-8.5) dan **Tahun** (2050 = 2041-2060, 2080 = 2071-2090, keduanya terhadap 1995-2014). Tempat paket yang paling dekat dengan titik yang digunakan, atau yang Anda pilih; jika jauh dari setiap tempat, perubahan rata-rata global yang digunakan dan panel menyatakannya.

## Level banjir rancangan

Level saat ini adalah elevasi banjir dasar FEMA jika layer banjir memilikinya (kaki, NAVD 88); jika tidak, ketik sendiri. Pilih jenis banjir (pesisir, sungai, atau hujan lebat, atau keduanya), kedalaman banjir di lokasi untuk bagian curah hujan, dan freeboard jika Anda menginginkannya. {{ui:Naikkan level banjir}} menampilkan level saat ini dan masa depan berdampingan, bagian kenaikan muka laut dan curah hujan, serta asumsinya: seluruh kenaikan muka laut ditambahkan ke level pesisir; aliran sungai naik satu banding satu dengan curah hujan hari paling basah, dan kedalaman mengikuti aliran pangkat 0.6 (Manning, saluran lebar); bagian-bagiannya dijumlahkan.

:::warning
Ini penyaringan perubahan, bukan studi banjir. Level banjir rancangan adalah wewenang otoritas atau insinyur Anda.
:::

## Paparan kebakaran hutan (hanya penyaringan)

Vegetasi terdekat, lereng naik dari situ, dan jarak memberi pita dari sangat rendah hingga ekstrem, saat ini dan masa depan (masa depan dikalikan dengan perubahan indeks cuaca kebakaran dari paket). **Hanya penyaringan:** skala relatif kami sendiri untuk mengetahui apakah lokasi memerlukan penilaian kebakaran hutan yang tepat; bukan peringkat kode.

## Panas: file cuaca masa depan

Pilih file `.epw` masa kini, lalu {{ui:Buat file cuaca masa depan}}: file itu di-morph dengan metode pergeseran dan peregangan yang telah dipublikasikan (Belcher, Hacker dan Powell 2005), dan panasnya dibandingkan (suhu rata-rata dan tertinggi, suhu rancangan, jam di atas 30 °C dan 35 °C, derajat-hari). {{ui:Simpan file cuaca masa depan}} menyimpannya untuk panel Lingkungan, pemeriksaan energi BimCraft, atau alat Anda sendiri.

## Dari mana angkanya berasal

NASA NEX-GDDP-CMIP6 (keluaran model CMIP6 yang diperkecil skalanya, CC BY 4.0 per model) untuk suhu, kelembapan, sinar matahari, hujan, dan cuaca kebakaran; rata-rata global IPCC AR6 untuk kenaikan muka laut kecuali paket memuat angka lokal. Panel menampilkan sumber, lisensi, dan tanggal paket.
