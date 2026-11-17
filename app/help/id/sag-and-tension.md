---
title: Lendutan dan tegangan
summary: Kasus beban Anda (suhu, angin, es) dan batas tegangan, cara CivilCraft menghitung tegangan tiap penampang, serta tabel penarikan.
keywords: lendutan, tegangan, kasus beban, suhu, angin, es, es asimetris, bentang penentu, bentang ekuivalen, perubahan keadaan, katenari, tabel penarikan, kekuatan putus, tegangan sehari-hari
from: f8876c35
---

## Kasus beban dan batas

{{ui:Lainnya}} › {{ui:Kasus beban dan batas…}} mengedit aturan yang diikuti setiap saluran dalam proyek.

- **Kasus beban**: suhu, tekanan angin pada konduktor (Pa), dan es radial (mm, dengan kerapatannya). Kasus pertama adalah acuan.
- **Batas tegangan**: sebagian dari kekuatan putus konduktor, pada tegangan horizontal atau pada tegangan terbesar di tumpuan, dalam satu kasus beban. Atau masukkan sendiri tegangan horizontalnya.
- **Jarak bebas**: jarak yang dijaga konduktor di atas tanah, jalan, bangunan, dan sebagainya. Tambah, ganti nama, dan hapus sesuka Anda. Di bawahnya, pilih aturan untuk **Tanaman lanskap di bawah saluran**, **Dinding lanskap di bawah saluran**, dan **Persilangan bawah tanah**.
- **Kasus yang dipakai pemeriksaan**: kasus yang menghasilkan lendutan terbesar (panas), ayunan isolator (angin), es, dan es di satu sisi tumpuan.
- **Faktor**: faktor jarak fase k, ayunan isolator terbesar, faktor pada beban tumpuan dan sambungan, sudut belokan yang membuat tiang sudut dan tiang ujung, tutupan minimum kabel terkubur, dan penurunan tegangan terbesar.

## Paket: aturan dan pustaka untuk satu negara

Tidak ada aturan negara mana pun yang dibangun ke dalam CivilCraft. **Paket** menyimpan satu set aturan dan satu pustaka bersama dalam satu berkas (`.cclinepack.json`), untuk sebuah negara, operator jaringan, atau perusahaan:

- **Simpan sebagai paket…** di {{ui:Kasus beban dan batas…}} menulis set aturan yang ditampilkan dan pustaka Anda (atau, bila pustaka Anda masih kosong, item yang dipakai proyek ini). Ketik **Negara atau wilayah** terlebih dahulu.
- **Buka set aturan atau paket…** membaca paket, berkas aturan, atau berkas pustaka. Aturan paket ditampilkan di dialog (klik **Terapkan** untuk memakainya), dan itemnya masuk ke pustaka Anda.
- Paket yang dibagikan orang lain tercantum di halaman add-on di bawah **Paket jaringan listrik**. Dua paket contoh menunjukkan formatnya; keduanya bukan aturan negara mana pun.

Setiap paket diperiksa saat dibuka, seperti berkas lainnya. Periksa setiap nilai terhadap standar yang berlaku sebelum apa pun dibangun.

Dua set aturan contoh tersedia sebagai titik awal: **Contoh: iklim dingin** dan **Contoh: iklim sedang**. Angkanya tidak berasal dari standar apa pun: isi dengan nilai yang diberikan standar Anda. {{ui:Simpan aturan}} dan {{ui:Buka aturan…}} membagikan satu set aturan sebagai berkas.

## Cara tegangan dihitung

Untuk setiap penampang di antara tiang ujung:

1. **Bentang penentu** adalah √(ΣL³ ÷ ΣL) dari bentang-bentangnya.
2. Setiap batas diubah menjadi tegangan horizontal pada kasus acuan melalui **persamaan perubahan keadaan** pada bentang penentu: H₂²·(H₂ − H₁ + EA·w₁²L²/(24H₁²) + EA·α·(t₂ − t₁)) = EA·w₂²L²/24. Yang paling membatasi menentukan tegangannya.
3. Tegangan setiap kasus beban mengikuti dari satu itu, dan bentuk setiap bentang adalah **katenari** tepat yang melalui kedua titik pemasangannya (termasuk bentang di lereng): lendutan dari tali busur, panjang, dan tegangan di setiap ujung.

Beban per meter dalam suatu kasus: berat ditambah es (luas es × kerapatan × g) secara vertikal; tekanan angin × diameter yang berselimut es secara horizontal.

## Tabel penarikan

{{ui:Lainnya}} › {{ui:Tabel penarikan…}} mencantumkan, untuk setiap penampang, tegangan horizontal dan lendutan setiap bentang pada setiap suhu dalam set aturan (−5 °C sampai 40 °C dengan langkah 5 °C untuk memulai), dalam udara tenang. Simpan keduanya, serta tabel tiang, sebagai CSV.

Tidak dihitung: rambatan konduktor selama bertahun-tahun, dan peregangan konduktor baru. Tambahkan keduanya melalui suhu tempat Anda menarik kabel.
