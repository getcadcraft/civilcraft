---
title: WaterCraft: kebutuhan, aliran kebakaran, gangguan, dan usia air
summary: Dengan add-on WaterCraft, ubah pelanggan menjadi kebutuhan pada pipa air utama Anda, periksa aliran yang tersedia di tiap hidran, lihat gangguan pipa utama mana yang paling berdampak, dan pantau usia air serta klorin sepanjang sehari.
keywords: watercraft, distribusi air, kebutuhan, pelanggan, faktor puncak, pola kebutuhan, aliran kebakaran, hidran, tekanan sisa, kekritisan, gangguan, bagian berkatup, usia air, klorin, sisa, pelacakan sumber, ujung buntu, csv, add-on
from: 066fb17a
---

WaterCraft adalah add-on yang bekerja pada jaringan air yang sudah Anda gambar dengan alat [Pipa air utama](topic:water-mains). Ia menambahkan tab ke panel kanan dengan empat bagian.

:::warning
Hanya alat bantu perhitungan. Telah diperiksa terhadap jawaban hitungan manual pada jaringan rekaan, bukan pada model utilitas nyata. Seorang insinyur air harus memeriksa setiap hasil. Skenario, aturan kontrol, katup, dan pembacaan lapangan memiliki topiknya sendiri, "Skenario" dan "Studi", dalam bantuan add-on WaterCraft.
:::

## Yang akan Anda lakukan

- Menempatkan pelanggan pada jaringan sebagai kebutuhan.
- Menemukan hidran yang alirannya kurang dari yang Anda butuhkan.
- Menemukan pipa utama yang gangguannya paling berpengaruh.
- Menemukan air yang sudah tua dan klorin yang rendah.

## Langkah

1. Buka {{ui:Pengaturan}} › {{ui:Add-on}} dan nyalakan {{ui:WaterCraft (distribusi air)}}. Tab {{ui:WaterCraft}} muncul di panel kanan.
2. Gambar reservoir, junction, dan pipa dengan alat Pipa air utama lebih dulu (lihat [Pipa air utama](topic:water-mains)). Tanpa jaringan, tab akan memberi tahu Anda untuk melakukannya.
3. Di bawah {{ui:Kebutuhan}}, tempel satu pelanggan per baris: id, x, y, jenis, jumlah. Pilih {{ui:Faktor puncak}} dan {{ui:Pola per jam}} (pola harian residensial, pola harian komersial, datar, atau pertahankan pola apa adanya). Tekan {{ui:Periksa}} untuk melihat di mana tiap pelanggan jatuh (junction terdekat), lalu {{ui:Masukkan ke jaringan}}. Urungkan akan mengembalikan kebutuhan.
4. Di bawah {{ui:Aliran kebakaran}}, atur aliran yang dibutuhkan dan tekanan sisa, pilih apakah tekanan sisa dipertahankan {{ui:Hanya di hidran}} atau {{ui:Di seluruh sistem (lebih ketat)}}, lalu tekan {{ui:Panjang datar}}. Tiap hidran didaftar dari yang terburuk, ditandai sebagai memenuhi atau kurang.
5. Di bawah {{ui:Pipa utama mana yang paling berpengaruh}}, pilih {{ui:satu pipa sekaligus}} atau {{ui:satu bagian berkatup sekaligus}} dan tekan {{ui:Panjang datar}}. Tiap gangguan menampilkan kebutuhan yang terputus, junction yang terputus, junction yang baru berada di bawah tekanan minimum, dan tekanan terendah yang tersisa.
6. Di bawah {{ui:Usia air dan klorin}}, pilih apa yang akan dipantau (usia air, klorin, atau pelacakan sumber), atur jam yang akan dijalankan dan batas yang Anda inginkan, lalu tekan {{ui:Panjang datar}}. Junction di luar batas Anda didaftar.
7. Tekan {{ui:Simpan sebagai CSV}} di bawah tabel mana pun untuk menyimpannya.

## Catatan

- Kebutuhan aliran kebakaran dan pemakaian per rumah atau per acre adalah nilai awal, bukan standar. Gunakan angka utilitas Anda sendiri.
- Pipa yang sebagian dipotong katup ditutup seluruhnya, sehingga gangguan yang ditampilkan sedikit lebih buruk daripada yang sebenarnya.
- Jalankan bagian kualitas air cukup lama agar pola harian berulang sebelum Anda membaca hari terakhir.
- {{ui:Berhenti}} mengakhiri proses panjang lebih awal; daftar kemudian hanya menampilkan apa yang sudah dikerjakan.
- Jaringan Anda tetap di proyek ini dan di komputer ini. Tidak ada yang dikirim ke mana pun.
