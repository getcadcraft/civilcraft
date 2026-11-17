---
title: "Iklim masa depan: banjir, haba dan kebakaran hutan 2050 dan 2080"
summary: Dalam Alamat ke tapak, naikkan aras banjir tapak untuk iklim masa depan, saring pendedahan kebakaran hutan dan ubah bentuk fail cuaca, hadir bersama masa depan, daripada pek data iklim (SSP2-4.5 dan SSP5-8.5, 2050 dan 2080).
keywords: iklim, perubahan iklim, masa depan, 2050, 2080, ssp, cmip6, senario, aras laut, banjir, aras banjir asas, bfe, fema, haba, fail cuaca, epw, morfing, kebakaran hutan, kebakaran semak
from: b0d2ee38
---

Angka iklim datang daripada **pek data**, bukan daripada aplikasi. Hidupkan add-on {{ui:Iklim masa depan}} dalam Tetapan › Add-on, atau muatkan fail pek anda sendiri dalam blok {{ui:Iklim masa depan}}.

:::warning
Pek yang disertakan dengan add-on ialah **sampel**: tiga tempat (Denver, Miami, Johannesburg), satu model iklim, lima tahun dalam setiap tempoh 20 tahun. Ia ada untuk mencuba alatan, **bukan untuk reka bentuk**. Pek penuh dibina dengan `tools/climate/build-pack.mjs` daripada data NEX-GDDP-CMIP6 NASA.
:::

## Di mana ia

Permukaan › Lagi › Alamat ke tapak. Tetapkan titik, tambah lapisan (lapisan banjir FEMA memberi aras banjir asas) dan tekan butang yang membaca tapak. Di bawah baris tapak ialah blok {{ui:Iklim masa depan}}: pilih **Senario** (SSP2-4.5 atau SSP5-8.5) dan **Tahun** (2050 = 2041-2060, 2080 = 2071-2090, kedua-duanya berbanding 1995-2014). Tempat pek yang paling dekat dengan titik digunakan, atau yang anda pilih; jauh dari mana-mana tempat, perubahan purata global digunakan dan panel menyatakannya.

## Aras banjir reka bentuk

Aras semasa ialah aras banjir asas FEMA apabila lapisan banjir mempunyainya (kaki, NAVD 88), jika tidak taip sendiri. Pilih jenis banjir (pantai, sungai atau hujan lebat, atau kedua-duanya), kedalaman banjir di tapak untuk bahagian hujan, dan lebihan jagaan (freeboard) jika anda mahu. {{ui:Naikkan aras banjir}} menunjukkan aras semasa dan aras masa depan bersebelahan, bahagian aras laut dan hujan, serta andaiannya: keseluruhan kenaikan aras laut ditambah pada aras pantai; aliran sungai naik satu-kepada-satu dengan hujan pada hari paling basah dan kedalaman mengikut aliran dipangkatkan 0.6 (Manning, saluran lebar); bahagian-bahagian itu ditambah.

:::warning
Tapisan perubahan, bukan kajian banjir. Aras banjir reka bentuk ialah milik pihak berkuasa atau jurutera anda.
:::

## Pendedahan kebakaran hutan (tapisan sahaja)

Tumbuhan terdekat, cerun naik dari situ dan jarak memberi satu jalur daripada sangat rendah hingga ekstrem, semasa dan masa depan (masa depan didarab dengan perubahan indeks cuaca kebakaran dalam pek). **Tapisan sahaja:** skala relatif kami sendiri untuk memberitahu sama ada tapak memerlukan penilaian kebakaran hutan yang betul; bukan penarafan kod.

## Haba: fail cuaca masa depan

Pilih fail `.epw` masa kini dan {{ui:Buat fail cuaca masa depan}}: ia diubah bentuk dengan kaedah anjakan dan regangan yang diterbitkan (Belcher, Hacker dan Powell 2005) dan haba dibandingkan (suhu purata dan terpanas, suhu reka bentuk, jam melebihi 30 °C dan 35 °C, hari-darjah). {{ui:Simpan fail cuaca masa depan}} menyimpannya untuk panel Persekitaran, pemeriksaan tenaga BimCraft atau alatan anda sendiri.

## Dari mana angka datang

NASA NEX-GDDP-CMIP6 (output model CMIP6 yang diturunskala, CC BY 4.0 setiap model) untuk suhu, kelembapan, cahaya matahari, hujan dan cuaca kebakaran; purata global IPCC AR6 bagi kenaikan aras laut melainkan pek membawa angka tempatan. Panel menunjukkan sumber, lesen dan tarikh pek.
