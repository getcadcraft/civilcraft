---
title: Desain irigasi
summary: Alat bantu hitung, bukan desain bersertifikat: sprinkler, lateral, mainline, katup, dan jalur tetes di tapak; zona yang ditemukan dari pipa; kehilangan tekanan dengan Hazen–Williams, sprinkler terburuk, debit dan tekanan terhadap pasokan, laju presipitasi, waktu operasi, cakupan, dan daftar material.
keywords: irigasi, irrigation, sprinkler, semprotan, spray, rotor, nozel putar, rotary nozzle, bubbler, tetes, drip, dripline, emitter, katup, valve, zona, zone, stasiun, station, kontroler, controller, mainline, lateral, titik sambungan, point of connection, pasokan air, water supply, tekanan, pressure, psi, kpa, debit, flow, gpm, kehilangan gesek, friction loss, hazen williams, laju presipitasi, precipitation rate, waktu operasi, run time, cakupan, coverage, kepala ke kepala, head to head, daftar material, bill of materials
from: 7d6342c1
---

:::warning
Ini adalah alat bantu hitung, bukan desain bersertifikat: perancang irigasi memeriksa setiap hasil sebelum apa pun dibangun.
:::

## Menata sistem

1. Di bagian **Irigasi** di sebelah kiri, pilih **Sprinkler**, **Busur**-nya dan di mana busur mulai, serta ukuran pipa untuk lateral dan mainline.
2. {{ui:Irigasi}} › {{ui:Titik sambungan}}: klik tempat pasokan air tersambung. Atur **tekanan**-nya, **debit tersedia**, serta kehilangan meter dan backflow di Properti.
3. {{ui:Irigasi}} › {{ui:Katup}}: klik tempat katup setiap zona dipasang. Sebuah katup memulai satu zona.
4. {{ui:Irigasi}} › {{ui:Sprinkler}}: klik untuk menempatkan sprinkler; setiap klik menempatkan satu.
5. {{ui:Irigasi}} › {{ui:Pipa lateral}}: klik dari sebuah katup melalui sprinkler-sprinklernya dan tekan {{key:Enter}}. {{ui:Pipa induk}}: dari titik sambungan ke setiap katup.

Ujung pipa menempel ke sprinkler, katup, pasokan, dan ujung pipa lain, sehingga jaringan tersambung. Satu zona adalah semua yang dapat dijangkau dari katupnya melalui lateral; mainline mengalirkan satu zona pada satu waktu.

## Tetes

{{ui:Irigasi}} › {{ui:Jalur tetes}}: klik sepanjang garis, mulai dari tempat garis itu dialiri (ujung lateral atau katup). Atur **debit emitter** dan **jarak** di Properti; debitnya adalah jumlah emitter di sepanjangnya.

## Pemeriksaan

{{ui:Irigasi}} › {{ui:Periksa sistem…}} mencantumkan setiap zona:

| Kolom | Cara menghitungnya |
|---|---|
| Debit | Debit sprinkler (dan jalur tetes) dijumlahkan |
| Di katup | Tekanan kerja sprinkler terburuk ditambah kehilangan pipa menuju ke sana (Hazen–Williams, diameter dalam pipa, perubahan elevasi) dan kehilangan melalui katup |
| Di pasokan | Sama, ditambah kehilangan mainline yang mengalirkan zona itu, serta kehilangan meter dan backflow |
| Presipitasi | Debit sprinkler dibagi luas area yang disiraminya pada jarak kepala-ke-kepala |
| Menit per minggu | Untuk menerapkan pengaturan **Siram seminggu** |
| Masalah | Kecepatan melebihi batas, sprinkler di luar rentang tekanannya, sprinkler semprot dan rotor pada satu katup, tekanan atau debit tidak cukup di pasokan, sprinkler tanpa zona, loop |

Pilih katup untuk melihat angka zonanya dan sprinkler terburuknya yang dilingkari pada denah. Daftar material menghitung sprinkler menurut jenis dan busur, pipa menurut ukuran, katup, jalur tetes dan emitter, serta stasiun kontroler. **Simpan sebagai CSV** menyimpan keduanya.

Pengaturan di bagian Irigasi: **Hazen–Williams C** (150 untuk pipa plastik baru), **debit tercepat** dalam pipa (1.5 m/s), **kehilangan melalui katup**, dan **siram seminggu**. Ini adalah nilai default yang diberi label.

## Cakupan

{{ui:Irigasi}} › {{ui:Tampilkan cakupan}} menyatakan berapa luas area yang dibiarkan kering oleh sprinkler, berapa yang disiram oleh dua sprinkler atau lebih, dan sprinkler mana yang tidak mencapai tetangganya (jarak kepala-ke-kepala).

## Sprinkler

Jenis sprinkler yang tercantum adalah jenis **generik** yang ditulis CadCraft dari laju presipitasi rancangan (semprotan tetap, nozel putar, rotor roda gigi, bubbler, mikro-semprotan, emitter), bukan produk pabrikan mana pun. **Tambah sprinkler dari file…** membaca sprinkler Anda sendiri (daftar JSON dengan jangkauan, debit atau laju presipitasi, dan rentang tekanan setiap sprinkler); sprinkler tersebut disimpan bersama proyek. Data yang dipublikasikan pabrikan hanya dimasukkan dengan izin tercatat dari pabrikan tersebut.

Di bawah sprinkler generik, daftar memuat **sprinkler tipikal** (namanya berakhir dengan "typical values"): ukuran nozel semprotan tetap, nozel putar dan rotor roda gigi, mikro-semprotan, bubbler, dan emitter, dengan radius, debit, dan rentang tekanan. Nilainya dihitung oleh CadCraft dari rumus yang dipublikasikan (persamaan orifis untuk debit, penskalaan jangkauan jet untuk radius) dan kelas debit nominal, hanya dari sumber terbuka; tidak ada tabel pabrikan yang disalin. Pilih salah satu dan pemilih akan menampilkan dasar serta lisensinya. Proyek yang memakainya menyimpan sprinkler dan sumbernya dalam file proyek. Nilai ini untuk perencanaan: periksa data sprinkler asli dari pabrikannya sebelum membangun.
