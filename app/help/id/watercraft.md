---
title: WaterCraft: kebutuhan, aliran kebakaran, gangguan dan umur air
summary: Dengan add-on WaterCraft, ubah pelanggan menjadi kebutuhan pada pipa induk air Anda, periksa aliran yang tersedia di setiap hidran, lihat gangguan pipa induk mana yang paling merugikan, dan pantau umur air serta klorin sepanjang satu hari.
keywords: watercraft, distribusi air, kebutuhan, pelanggan, faktor puncak, pola kebutuhan, aliran kebakaran, hidran, tekanan sisa, kekritisan, gangguan, bagian berkatup, umur air, klorin, sisa, pelacakan sumber, ujung buntu, csv, add-on
from: 76809f01
---

WaterCraft adalah add-on yang bekerja pada jaringan air yang sudah Anda gambar dengan alat pipa induk air. Add-on ini menambahkan tab ke panel kanan dengan empat bagian.

:::warning
Hanya alat bantu hitung. Alat ini diperiksa terhadap hasil hitung manual pada jaringan rekaan, bukan pada model jaringan air yang nyata. Seorang ahli air harus memeriksa setiap hasil. Belum ada stasiun penguat, peluruhan orde kedua, maupun skenario.
:::

## Yang akan Anda lakukan

- Tempatkan pelanggan pada jaringan sebagai kebutuhan.
- Temukan hidran yang tidak memenuhi aliran yang Anda butuhkan.
- Temukan pipa induk yang gangguannya paling berpengaruh.
- Temukan air yang sudah lama dan klorin yang rendah.

## Langkah

1. Buka {{ui:Pengaturan}} › {{ui:Add-on}} lalu aktifkan {{ui:WaterCraft (distribusi air)}}. Tab {{ui:WaterCraft}} muncul di panel kanan.
2. Gambar waduk, simpul dan pipa dengan alat pipa induk air terlebih dahulu (lihat [Pipa induk air](topic:water-mains)). Tanpa jaringan, tab akan memberi tahu Anda untuk melakukannya.
3. Di bawah {{ui:Kebutuhan}}, tempel satu pelanggan per baris: id, x, y, jenis, jumlah. Pilih {{ui:Faktor puncak}} dan {{ui:Pola per jam}} (pola siang permukiman, siang komersial, datar, atau biarkan pola apa adanya). Tekan {{ui:Periksa}} untuk melihat di mana setiap pelanggan berada (simpul terdekat), lalu {{ui:Masukkan ke jaringan}}. Urungkan mengembalikan kebutuhan tersebut.
4. Di bawah {{ui:Aliran kebakaran}}, atur aliran yang dibutuhkan dan tekanan sisa, pilih apakah tekanan sisa dijaga {{ui:Hanya di hidran}} atau {{ui:Di seluruh sistem (lebih ketat)}}, lalu tekan {{ui:Panjang datar}}. Setiap hidran dicantumkan dengan yang terburuk di awal, sebagai memenuhi atau kurang.
5. Di bawah {{ui:Pipa induk mana yang paling penting}}, pilih {{ui:satu pipa per waktu}} atau {{ui:satu bagian berkatup per waktu}}, lalu tekan {{ui:Panjang datar}}. Setiap gangguan menampilkan kebutuhan yang terputus, simpul yang terputus, simpul yang baru berada di bawah tekanan minimum, dan tekanan terendah yang tersisa.
6. Di bawah {{ui:Umur air dan klorin}}, pilih apa yang akan dipantau (umur air, klorin, atau pelacakan sumber), atur jam yang akan dijalankan dan batas yang Anda inginkan, lalu tekan {{ui:Panjang datar}}. Simpul di luar batas Anda dicantumkan.
7. Tekan {{ui:Simpan sebagai CSV}} di bawah tabel mana pun untuk menyimpannya.

## Catatan

- Aliran kebakaran yang dibutuhkan serta pemakaian per rumah atau per acre adalah nilai awal, bukan standar. Gunakan angka milik perusahaan air Anda sendiri.
- Pipa yang sebagian terpotong oleh katup ditutup seluruhnya, sehingga gangguan yang ditampilkan sedikit lebih buruk dibanding kondisi nyata.
- Jalankan bagian kualitas air cukup lama agar pola harian berulang sebelum Anda membaca hari terakhir.
- {{ui:Berhenti}} mengakhiri proses panjang lebih awal; daftar kemudian hanya menampilkan yang sudah dikerjakan.
- Jaringan Anda tetap berada di proyek ini dan di komputer ini. Tidak ada yang dikirim ke mana pun.
