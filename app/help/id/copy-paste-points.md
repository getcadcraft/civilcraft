---
title: Pilih, salin dan tempel titik survei
summary: Pilih titik survei dengan klik, Shift dan kotak, atau semuanya sekaligus; salin, potong, tempel, tempel di tempat yang sama, duplikat dan hapus dengan nomor titik baru yang tidak pernah bertabrakan; tempel baris titik ke dan dari spreadsheet.
keywords: salin, tempel, potong, duplikat, hapus titik, pilih titik, pilih semua, pilih kotak, jendela, papan klip, spreadsheet, csv, nomori ulang, nomor titik, tempel di tempat yang sama, klon, pematokan
from: 78a6aea7
---

Titik survei dapat disalin dan ditempel di dalam proyek, di antara proyek di dua tab peramban, serta ke dan dari spreadsheet. Setiap perubahan adalah satu langkah urungkan, dan permukaan langsung dibangun ulang dari titik-titik baru.

## Pilih titik

Dengan {{ui:Pilih}} ({{key:V}}):

- **Klik** titik untuk memilihnya (dan hanya itu). Nomor-nomornya muncul di bawah **Properti**.
- {{key:Shift}} dan **klik** menambahkan titik ke pilihan, atau mengeluarkannya.
- {{key:Shift}} dan **seret** menggambar kotak: titik di dalamnya ditambahkan ke pilihan. Seret mengelilingi titik sebagai gantinya dan itu menjadi laso; lihat [Pemilihan laso titik survei](topic:lasso-selection). Seret tanpa {{key:Shift}} menggeser tampilan, seperti biasa.
- {{key:Mod+A}} (atau {{ui:Lainnya}} › {{ui:Pilih semua titik}}) memilih setiap titik.
- {{key:Esc}} (atau {{ui:Lainnya}} › {{ui:Batalkan pilihan}}) menghapus pilihan.

Titik yang dipilih memiliki cincin. Jika lebih dari satu yang dipilih, **Properti** menampilkan jumlahnya, nomornya, rentang elevasinya dan grupnya.

## Salin, potong dan hapus

- {{ui:Salin}} atau {{key:Mod+C}} menyalin titik yang dipilih. CivilCraft menyimpan salinan itu, dan juga menaruhnya di papan klip sistem sebagai baris titik, sehingga Anda dapat menempelkannya langsung ke spreadsheet atau file teks.
- {{ui:Lainnya}} › {{ui:Potong}} atau {{key:Mod+X}} menyalin lalu menghapusnya, dalam satu langkah.
- {{ui:Lainnya}} › {{ui:Hapus}} atau {{key:Delete}} menghapusnya. {{key:Mod+Z}} mengembalikannya.

Baris berisi titik, northing, easting, elevasi, deskripsi (P,N,E,Z,D), dipisahkan koma, dengan tiga desimal. Untuk mendapatkan easting sebelum northing, atur **Baris titik** di [Pengaturan CivilCraft](topic:settings). Deskripsi yang akan diperlakukan spreadsheet sebagai rumus (diawali =, +, - atau @) diberi tanda kutip satu di depannya, sehingga tetap berupa teks.

## Tempel

1. Tekan {{key:Mod+V}} atau klik {{ui:Tempel}}. Titik-titik mengikuti penunjuk sebagai tanda silang kecil, dengan garis putus-putus kembali ke tempat asalnya.
2. Klik di tempat titik-titik itu akan ditaruh. Bagian tengah titik yang disalin jatuh di titik klik.
3. Atau tekan {{key:Enter}} untuk menaruhnya pada koordinat asalnya, atau {{key:Esc}} untuk membatalkan.

{{ui:Lainnya}} › {{ui:Tempel di tempat yang sama}} atau {{key:Mod+Shift+V}} menempelkan pada koordinat asal titik seketika. Titik yang ditempel kemudian dipilih, sehingga Anda dapat menyalin, memindahkan atau menghapusnya lagi.

:::note
Mengklik {{ui:Tempel}} di bilah alat membaca papan klip sistem. Untuk pertama kali, peramban mungkin bertanya apakah CivilCraft boleh melihat papan klip. Jika Anda menolak, tombol bilah alat hanya menempelkan salinan milik CivilCraft; {{key:Mod+V}} tetap menempelkan baris dari spreadsheet tanpa bertanya.
:::

## Nomor titik tidak pernah bertabrakan

Dua titik tidak pernah berbagi nomor. Saat Anda menempel:

- Titik yang ditempel mempertahankan nomornya jika tidak ada titik dalam proyek yang memilikinya. Jadi setelah **Potong**, titik-titik kembali ke nomornya sendiri, dan titik yang disalin dari proyek lain tetap mempertahankan nomornya jika nomor itu kosong.
- Titik yang ditempel dengan nomor yang sudah dipakai mendapat nomor bulat baru: satu lebih dari nomor tertinggi yang dipakai, menghitung naik.
- Bilah status menyatakan apa yang terjadi, misalnya "1 mempertahankan nomornya; 9 mendapat nomor baru: 10–18 menjadi 277–285".

Di [Pengaturan CivilCraft](topic:settings) Anda dapat memilih **Selalu nomor baru**, dan angka tempat nomor baru dimulai, misalnya 5000 untuk titik desain.

:::warning
Grup titik yang membangun permukaan sebagai **breakline** menggabungkan titik-titiknya menurut urutan nomor. Salinan titik breakline yang ditempel (misalnya tembakan FL) mendapat nomor baru yang lebih tinggi dan bergabung di ujung breakline itu, mungkin dengan lompatan panjang. Periksa denah setelah menempel titik seperti itu, atau atur grupnya ke {{ui:Titik}}.
:::

## Duplikat

{{ui:Lainnya}} › {{ui:Duplikat}} atau {{key:Mod+D}} membuat salinan titik yang dipilih yang mengikuti penunjuk: klik di tempat salinan itu akan ditaruh. Salinan selalu mendapat nomor baru, dan papan klip CivilCraft dibiarkan seperti semula.

## Dari spreadsheet atau file teks

Pilih baris titik di spreadsheet (titik, northing, easting, elevasi, deskripsi) dan salin. Di CivilCraft tekan {{key:Mod+V}} lalu klik di tempat baris itu akan ditaruh, atau tekan {{key:Mod+Shift+V}} untuk menaruhnya pada koordinat asalnya, yang biasanya diinginkan untuk data survei sungguhan.

Baris dibaca persis seperti [file titik](topic:point-file-formats): koma, tab atau spasi, dengan baris header jika ada. Tanpa header, urutan kolom berasal dari **Baris titik** di [Pengaturan CivilCraft](topic:settings).

Ketika keduanya ada, CivilCraft memutuskan berdasarkan mana yang lebih baru: baris pada papan klip sistem yang berbeda dari salinan terakhir CivilCraft dianggap disalin lebih belakangan, sehingga itu yang ditempel. Teks yang tidak berisi titik diabaikan, dan salinan milik CivilCraft yang ditempel sebagai gantinya.

## Di antara proyek dan tab

Salinan disimpan di peramban ini, sehingga tab CivilCraft kedua dapat menempelkannya, bahkan setelah tab pertama ditutup. Titik yang disalin dalam proyek meter dan ditempel ke proyek feet mempertahankan nomornya: tidak ada yang dikonversi, dan bilah status menyatakan demikian.

## Yang tidak disalin

Saat ini hanya titik survei yang disalin. Alinyemen, pad, jaringan pipa, breakline dan batas belum dapat disalin atau ditempel. Menempel tidak dapat memindahkan titik yang sudah ada: gunakan {{ui:Potong}} dan tempel, atau pindahkan satu titik pada satu waktu ([Edit titik survei](topic:edit-points)).
