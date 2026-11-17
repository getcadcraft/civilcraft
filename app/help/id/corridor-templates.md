---
title: Templat koridor dan templat terrain
summary: Buat templat kecil yang dapat dipakai ulang (kerb dan talang, trotoar, dinding, parit), bangun koridor dari templat itu menurut stasiun dengan sisi kiri dan kanan dipisahkan, bagi alinyemen menjadi beberapa koridor, dan letakkan lapisan material di atas terrain.
keywords: templat, daftar templat, pustaka templat, pembuatan templat, potongan tipikal, rakitan, subrakitan, komponen, kode titik, kondisi akhir, daylight, parit, dinding penahan, kerb, talang, trotoar, wilayah, rentang stasiun, beberapa koridor, kiri dan kanan, templat terrain, tanah atas, perkerasan, dasar, drape, material, kuantitas
from: ce70e58b
---

Sebuah **templat** adalah penampang melintang kecil yang Anda gambar sekali dan pakai ulang: titik dengan offset, kemiringan dan kode titik, serta komponen dengan material. Koridor dapat dibangun dari templat menurut stasiun, dengan setiap sisi memiliki templat perkerasan dan kondisi akhirnya sendiri, dan templat yang sama dapat diletakkan di atas terrain.

:::warning
Templat contoh adalah placeholder sebagai titik awal. Angkanya tidak diambil dari standar atau instansi mana pun. Seorang insinyur harus memeriksa setiap templat, dan setiap nilai yang Anda berikan, sebelum digunakan untuk desain.
:::

## Buka templat

Buka {{ui:Permukaan}} › {{ui:Lainnya}} › {{ui:Templat koridor…}} (atau ketik {{cmd:TEMPLATES}}). Jendela ini memiliki tiga daftar:

- **Dalam proyek ini**: templat yang dipakai koridor dan templat terrain proyek ini. Disimpan dalam file proyek.
- **Pustaka saya**: templat yang disimpan di peramban ini dan ditawarkan di setiap proyek. Gunakan {{ui:Simpan ke Pustaka saya}} pada templat proyek untuk menyimpannya.
- **Contoh**: dua lajur dengan lapis, kerb dan talang, trotoar, daylight, parit, dinding penahan, tanah atas di bawah terrain, dan perkerasan di atas terrain. Setiap contoh ditandai "Untuk diperiksa oleh insinyur".

{{ui:Gunakan di proyek ini}} menyalin templat pustaka atau contoh ke dalam proyek. {{ui:Ekspor templat proyek ini}} menyimpannya sebagai file `.cctemplates.json`, dan {{ui:Impor file}} membacanya ke dalam proyek dan Pustaka saya. Gunakan file ini untuk membagikan templat atau memindahkannya ke komputer lain.

## Buat templat

{{ui:Templat baru}} (atau {{ui:Edit}} pada templat proyek) membuka editor templat. Gambar sisi kanan, keluar dari titik 0,0 templat; sisi kiri memakai templat yang sama keluar ke kiri.

1. Beri nama dan jenis: **Perkerasan** (templat berikutnya menempel di ujungnya), **Kondisi akhir** (ia bertemu tanah) atau **Templat terrain**.
2. Tambahkan **nilai**: angka bernama seperti lebar `w` atau kemiringan `s`. Kotak angka di mana pun dalam templat menerima angka atau nama nilai; `-t` adalah nilai `t` yang dibuat negatif. Koridor dapat memberi setiap penggunaan templat nilainya sendiri, sehingga satu templat kerb melayani setiap tinggi kerb.
3. Tambahkan **titik** secara berurutan. Setiap titik ditempatkan dari titik sebelumnya (atau titik 0,0) menurut batasannya:

   | Batasan | Menempatkan titik |
   |---|---|
   | Offset pada kemiringan | Offset ke luar dan kemiringan (naik per jarak; −0.02 turun 2%) |
   | Offset dan naik | Offset dan kenaikan |
   | Lurus ke atas atau bawah | Kenaikan saja |
   | Lereng samping ke tanah | Dari titiknya ke luar sampai tanah, pada rasio galian di tempat tanah lebih tinggi dan rasio timbunan di tempat tanah lebih rendah |
   | Ke tanah | Offset, lalu lurus ke atas atau bawah ke tanah |
   | Dinding penahan | Dinding dengan ketebalan yang Anda berikan: dalam galian puncaknya bertemu tanah di muka jalan, dalam timbunan jalan melintasinya dan muka luarnya turun ke tanah |

   Centang **Atas** untuk titik-titik yang dilalui permukaan jadi. Titik atas terakhir adalah tempat templat berikutnya di sisi itu dimulai. **Target** memungkinkan koridor memindahkan titik: offset atau elevasinya berasal dari sebuah garis.

4. Tambahkan **komponen**: bentuk tertutup melalui kode titik (`0` adalah titik 0,0), masing-masing dengan nama, material dan jenis. Luasnya memberi volume.

Gambar mengikuti setiap perubahan dalam skala sebenarnya, dan daftar di bawahnya menyatakan apa yang salah (titik yang menyentuh tanah sebelum kondisi akhir, nilai yang tidak dimiliki templat, komponen tanpa luas). {{ui:Tambahkan ke proyek ini}} atau {{ui:Simpan}} menyimpannya, sebagai satu langkah urungkan.

## Bangun koridor dari templat

Pilih alinyemen dengan koridor dan, di Properti-nya, nyalakan {{ui:Bangun dari templat berdasarkan stasiun}}. Koridor dimulai dengan contoh dua lajur dan daylight di kedua sisi.

- **Wilayah.** Setiap wilayah dimulai di sebuah stasiun dan berjalan sampai wilayah berikutnya. {{ui:Tambah wilayah}} menambahkan satu; ubah stasiun awalnya di kotaknya.
- **Kiri dan kanan terpisah.** Setiap sisi dari setiap wilayah memiliki daftar **Perkerasan** sendiri, dari as jalan ke luar, dan **Kondisi akhir** sendiri: daylight, parit, dinding, atau templat apa pun yang menyentuh tanah. Tanpa kondisi akhir, sisi itu daylight pada lereng galian dan timbunan koridor. {{ui:Salin dari kiri ke kanan}} menyalin satu sisi.
- **Nilai dan target.** Di bawah setiap templat pada sebuah sisi, ada satu kotak per nilai (kosong = nilai templat itu sendiri) dan, untuk titik yang menerima target, garis fitur atau garis koridor lain yang memindahkannya.
- **Dari** dan **Ke** membatasi koridor ke sebagian alinyemen.

Penampang, garis denah untuk setiap kode titik, permukaan rencana, pematokan dan pekerjaan tanah semuanya mengikuti. Properti mendaftar volume setiap komponen per sisi dan wilayah (rata-rata luas ujung di sepanjang as jalan). Superelevasi dan target tepi koridor tidak dipakai selama koridor dibangun dari templat.

## Beberapa koridor pada satu alinyemen

Di bawah **Koridor pada alinyemen ini**, {{ui:Tambah koridor}} menambahkan koridor pada sisa alinyemen: koridor pertama diberi stasiun akhir di tengah (atau mempertahankan stasiun akhirnya sendiri), dan koridor baru dimulai di sana dengan wilayah terakhir templat koridor pertama. Setiap koridor memiliki nama, rentang stasiun, templat dan pekerjaan tanahnya sendiri. Matikan satu dengan kotak {{ui:Nyala}}-nya. Jika dua rentang tumpang tindih, koridor yang kemudian dibuat di-grading di atas koridor sebelumnya.

## Templat terrain

Templat terrain meletakkan lapisan sebuah templat pada terrain dari titik 0,0-nya: lapisan di bawah titik 0,0 masuk ke dalam tanah (tanah atas yang akan dikupas), lapisan di atasnya berada di atas tanah (dasar dan perkerasan pada area parkir). Lebar dan kemiringan tidak penting, hanya kedalaman setiap komponen di atas atau di bawah titik 0,0.

Buka {{ui:Permukaan}} › {{ui:Lainnya}} › {{ui:Templat terrain…}} (atau ketik {{cmd:TERRAINTEMPLATES}}); blok ini juga ada di Properti proyek. {{ui:Tambah templat terrain}} menambahkan satu dengan contoh tanah atas. Untuk masing-masing, pilih:

- **templat** (nilainya dapat diubah untuk yang ini),
- **terrain**: tanah asli atau permukaan rencana,
- **bentuk** yang memotongnya: seluruh terrain, persil, pad, atau garis fitur tertutup. Beberapa templat terrain dapat memakai bentuk berbeda pada terrain yang sama.

Setiap lapisan mendaftar ketebalannya, luas denah dan volumenya. Volume adalah luas denah dikali ketebalan, dengan ketebalan diukur lurus ke bawah; luas diukur pada grid, dan luas yang diletakkan (miring) juga diberikan. Bentuk-bentuk digambar pada denah di layer C-TOPO-TMPL. Templat terrain tidak mengubah permukaan rencana.

## Material dan kuantitas

Blok Pekerjaan tanah proyek mendaftar **Material dari templat**: setiap komponen koridor dan lapisan templat terrain dengan volumenya. {{ui:Kirim ke TakeoffCraft}} menuliskannya ke file kuantitas setelah galian dan timbunan, satu item masing-masing, dalam yard kubik (proyek feet) atau meter kubik.

## File

Templat, wilayah, koridor tambahan dan templat terrain disimpan dalam file proyek. Proyek yang tidak memakai satu pun darinya disimpan persis seperti sebelumnya, dan versi CivilCraft yang lebih lama dapat membuka proyek yang memakainya (versi itu mengabaikan templat dan membangun rakitan milik koridor sendiri).
