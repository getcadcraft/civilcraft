---
title: Pilih, salin dan tampal titik ukur
summary: Pilih titik ukur dengan klik, Shift dan kotak, atau sekaligus; salin, potong, tampal, tampal di tempat yang sama, pendua dan padam dengan nombor titik baharu yang tidak pernah bertembung; tampal baris titik ke dan dari hamparan.
keywords: salin, tampal, potong, pendua, padam titik, pilih titik, pilih semua, pilihan kotak, tetingkap, papan keratan, hamparan, csv, nombor semula, nombor titik, tampal di tempat yang sama, klon, pancang
from: 78a6aea7
---

Titik ukur boleh disalin dan ditampal dalam projek, antara projek dalam dua tab pelayar, dan ke serta dari hamparan. Setiap perubahan ialah satu langkah buat asal, dan permukaan dibina semula daripada titik baharu serta-merta.

## Pilih titik

Dengan {{ui:Pilih}} ({{key:V}}):

- **Klik** titik untuk memilihnya (dan hanya itu). Nombornya ditunjukkan di bawah **Sifat**.
- {{key:Shift}} dan **klik** menambah titik ke pilihan, atau mengeluarkannya.
- {{key:Shift}} dan **seret** melukis kotak: titik di dalamnya ditambah ke pilihan. Seret di sekeliling titik sebaliknya dan ia menjadi lasso; lihat [Pemilihan lasso titik ukur](topic:lasso-selection). Seretan tanpa {{key:Shift}} menggerakkan pandangan, seperti biasa.
- {{key:Mod+A}} (atau {{ui:Lagi}} › {{ui:Pilih semua titik}}) memilih setiap titik.
- {{key:Esc}} (atau {{ui:Lagi}} › {{ui:Nyahpilih semua}}) mengosongkan pilihan.

Titik yang dipilih mempunyai cincin. Dengan lebih daripada satu dipilih, **Sifat** menunjukkan berapa banyak, nombornya, julat arasnya dan kumpulannya.

## Salin, potong dan padam

- {{ui:Salin}} atau {{key:Mod+C}} menyalin titik yang dipilih. CivilCraft menyimpan salinan itu, dan juga meletakkannya pada papan keratan sistem sebagai baris titik, supaya anda boleh menampalnya terus ke hamparan atau fail teks.
- {{ui:Lagi}} › {{ui:Potong}} atau {{key:Mod+X}} menyalin dan memadamkannya, dalam satu langkah.
- {{ui:Lagi}} › {{ui:Padam}} atau {{key:Delete}} memadamkannya. {{key:Mod+Z}} mengembalikannya.

Baris ialah titik, northing, easting, aras, huraian (P,N,E,Z,D), dipisahkan dengan koma, dengan tiga titik perpuluhan. Untuk mendapat easting sebelum northing, tetapkan **Baris titik** dalam [Tetapan CivilCraft](topic:settings). Huraian yang akan dianggap oleh hamparan sebagai formula (bermula dengan =, +, - atau @) mendapat tanda petik tunggal di hadapannya, supaya ia kekal sebagai teks.

## Tampal

1. Tekan {{key:Mod+V}} atau klik {{ui:Tampal}}. Titik itu mengikut penunjuk sebagai silang kecil, dengan garis putus kembali ke tempat ia datang.
2. Klik di tempat ia hendak pergi. Tengah titik yang disalin mendarat pada klik itu.
3. Atau tekan {{key:Enter}} untuk meletakkannya pada koordinat sendiri, atau {{key:Esc}} untuk membatalkan.

{{ui:Lagi}} › {{ui:Tampal di tempat yang sama}} atau {{key:Mod+Shift+V}} menampal titik pada koordinat sendiri serta-merta. Titik yang ditampal kemudian dipilih, supaya anda boleh menyalin, mengalih atau memadamnya semula.

:::note
Mengklik {{ui:Tampal}} pada bar alat membaca papan keratan sistem. Kali pertama, pelayar mungkin bertanya sama ada CivilCraft dibenarkan melihat papan keratan. Jika anda menolak, butang bar alat hanya menampal salinan CivilCraft sendiri; {{key:Mod+V}} masih menampal baris daripada hamparan tanpa bertanya.
:::

## Nombor titik tidak pernah bertembung

Dua titik tidak pernah berkongsi nombor. Apabila anda menampal:

- Titik yang ditampal mengekalkan nombornya apabila tiada titik dalam projek memilikinya. Jadi selepas **Potong**, titik ditampal semula dengan nombor mereka sendiri, dan titik yang disalin dari projek lain mengekalkan nombor mereka di tempat yang kosong.
- Titik yang ditampal yang nombornya telah diambil mendapat nombor bulat baharu: satu lebih daripada nombor tertinggi yang digunakan, dikira menaik.
- Bar status menyatakan apa yang berlaku, contohnya "1 mengekalkan nombornya; 9 mendapat nombor baharu: 10–18 menjadi 277–285".

Dalam [Tetapan CivilCraft](topic:settings) anda boleh memilih **Sentiasa nombor baharu**, dan nombor untuk nombor baharu bermula, contohnya 5000 untuk titik reka bentuk.

:::warning
Kumpulan titik yang membina permukaan sebagai **garis putus** menyambungkan titik mereka mengikut tertib nombor. Salinan titik garis putus yang ditampal (contohnya titik FL) mendapat nombor baharu yang lebih tinggi dan menyambung ke hujung garis putus itu, mungkin dengan lompatan panjang. Semak pelan selepas menampal titik sebegini, atau tetapkan kumpulan mereka kepada {{ui:Titik}}.
:::

## Pendua

{{ui:Lagi}} › {{ui:Pendua}} atau {{key:Mod+D}} membuat salinan titik yang dipilih yang mengikut penunjuk: klik di tempat ia hendak pergi. Salinan sentiasa mendapat nombor baharu, dan papan keratan CivilCraft dibiarkan seperti sedia ada.

## Daripada hamparan atau fail teks

Pilih baris titik dalam hamparan (titik, northing, easting, aras, huraian) dan salinnya. Dalam CivilCraft tekan {{key:Mod+V}} dan klik di tempat ia hendak pergi, atau tekan {{key:Mod+Shift+V}} untuk meletakkannya pada koordinat sendiri, yang biasanya anda mahukan untuk data ukur sebenar.

Baris dibaca tepat seperti [fail titik](topic:point-file-formats): koma, tab atau ruang, baris pengepala jika ada. Tanpa pengepala, tertib lajur datang daripada **Baris titik** dalam [Tetapan CivilCraft](topic:settings).

Apabila kedua-duanya ada, CivilCraft memutuskan mengikut yang lebih baharu: baris pada papan keratan sistem yang berbeza daripada salinan terakhir CivilCraft disalin kemudian, jadi ia ditampal. Teks yang tidak mengandungi titik diabaikan, dan salinan CivilCraft sendiri ditampal sebaliknya.

## Antara projek dan tab

Salinan disimpan dalam pelayar ini, jadi tab kedua CivilCraft boleh menampalnya, walaupun selepas tab pertama ditutup. Titik yang disalin dalam projek meter dan ditampal ke dalam projek kaki mengekalkan nombornya seperti sedia ada: tiada apa ditukar, dan bar status menyatakannya.

## Apa yang tidak disalin

Hanya titik ukur disalin buat masa ini. Penjajaran, pelantar, rangkaian paip, garis putus dan sempadan tidak boleh disalin atau ditampal lagi. Menampal tidak boleh mengalihkan titik sedia ada: gunakan {{ui:Potong}} dan tampal, atau alih satu titik pada satu masa ([Sunting titik ukur](topic:edit-points)).
