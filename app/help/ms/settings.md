---
title: Tetapan CivilCraft
summary: Pilih susunan lajur bagi baris titik yang disalin dan ditampal serta untuk meneka lajur fail, cara titik yang ditampal dinomborkan, apa yang ditunjukkan label titik, penunjuk sudut, pembesaran menegak 3D, cara latitud dan longitud ditunjukkan, dan sama ada lapisan peta datang dari internet.
keywords: tetapan, keutamaan, susunan lajur, baris titik, nombor semula, nombor titik, nombor mula, label titik, label, huraian, ketinggian, ViewCube, ikon paksi, penunjuk sudut, kompas, pembesaran menegak, 3d, latitud, longitud, dms, darjah perpuluhan, lapisan peta, internet, privasi
from: 64b9cb92
---

Buka {{ui:Tetapan}} dengan ikon gear dalam bar aplikasi atau {{key:Mod+,}}. Tab pertama, {{ui:CivilCraft}}, memegang tetapan yang tergolong kepada aplikasi ini; {{ui:Umum}} memegang yang dikongsi oleh setiap aplikasi CadCraft (tema, bar alat, panel). Tetapan CivilCraft hanya wujud dalam aplikasi: anda menukarnya di sini, dan pelayar ini mengingatinya. {{ui:Tetapkan semula tetapan CivilCraft}} meletakkan setiap tetapan kembali kepada permulaannya.

## Baris titik

**P, N, E, Z, D** (permulaan) atau **P, E, N, Z, D**: titik, utara, timur, ketinggian, huraian, atau timur sebelum utara. Ia digunakan di tiga tempat:

- **Salin**: baris yang CivilCraft letakkan pada papan keratan sistem untuk hamparan.
- **Tampal**: baris yang ditampal dari hamparan atau fail teks yang tiada baris pengepala.
- **Import**: tekaan dalam kotak dialog **Import titik** apabila fail tiada baris pengepala (fail dengan empat lajur dibaca sebagai PENZ, tiga lajur sebagai ENZ). Lihat [Format fail titik](topic:point-file-formats).

Baris pengepala yang menamakan lajurnya sentiasa menang, dan begitu juga pilihan dalam senarai **Lajur** kotak dialog import.

## Nombor untuk titik yang ditampal

- **Simpan nombor bebas** (permulaan): titik yang ditampal mengekalkan nombornya apabila tiada titik memilikinya; hanya titik yang bertembung mendapat nombor baharu.
- **Sentiasa nombor baharu**: setiap titik yang ditampal mendapat nombor baharu, walaupun nombornya sendiri bebas.

**Nombor baharu bermula pada**: biarkan kosong untuk mengira dari satu lebih daripada nombor tertinggi yang digunakan. Taip nombor, contohnya 5000, untuk memberi titik baharu nombor dari 5000 ke atas; nombor yang sudah digunakan dilangkau. Dua titik tidak pernah berkongsi nombor dalam kedua-dua cara. Lihat [Pilih, salin dan tampal titik ukur](topic:copy-paste-points#point-numbers-never-clash).

## Label titik

Apa yang ditunjukkan label titik apabila {{ui:Label titik}} dihidupkan di bawah **Paparan**: **Nombor**, **Nombor dan ketinggian**, atau **Nombor, ketinggian dan huraian** (permulaan). Eksport DXF, DWG dan PDF menunjukkan label yang sama seperti skrin.

## Penunjuk sudut

Apa yang berada di sudut pelan dan paparan 3D: **ViewCube** (permulaan), **Ikon paksi** atau **Tiada**.

- **ViewCube** (kanan atas). Pada pelan ia menunjukkan bahagian atas, dengan gelang kompas: N ialah utara grid (ke atas pelan). Klik mana-mana sisi, tepi atau bucu lain pada kiub, atau seretnya, dan [paparan 3D](topic:site-3d) dibuka menghadap dari situ. {{ui:Laman utama}} pada kiub pelan memuatkan keseluruhan pelan.
- Dalam paparan 3D kiub berpusing bersama pandangan: klik sisi, tepi atau bucu untuk melihat dari situ, seret kiub untuk mengorbit, seret gelang kompas untuk memutar tapak sekitar menegak, klik huruf untuk melihat dari sisi itu, dan gunakan {{ui:Laman utama}} untuk pandangan iso bagi keseluruhan tapak. Apabila melihat terus ke sisi, anak panah kecil melangkah ke sisi seterusnya dan anak panah melengkung memutar pandangan seperempat pusingan.
- **Ikon paksi** (kiri bawah): penanda X (timur) dan Y (utara) yang kecil pada pelan, X, Y dan Z (atas) dalam 3D.

## Pembesaran menegak 3D

Berapa banyak paparan 3D meregangkan ketinggian: **1×**, **2×** (permulaan), **3×**, **5×** atau **10×**. Senarai pada bar paparan 3D ialah tetapan yang sama, jadi menukar salah satu menukar kedua-duanya. Isipadu, profil dan eksport 3D kekal pada skala sebenar.

## Latitud dan longitud

Cara bar status menunjukkan latitud dan longitud penunjuk apabila projek mempunyai sistem koordinat: **darjah, minit dan saat** (permulaan, contohnya `30°18′00.00″ N`) atau **darjah perpuluhan** (`30.300000° N`). Lihat [Tetapkan sistem koordinat projek](topic:coordinate-systems#latitude-and-longitude-in-the-status-bar).

## Lapisan peta dari internet

**Mati** (permulaan) atau **Hidup**. Apabila hidup, CivilCraft meminta pelayan peta yang anda tambah untuk gambar kawasan pada skrin. Lukisan anda kekal di komputer ini; pelayan melihat kawasan dan alamat internet anda. Apabila ia mati, tiada pelayan peta diminta untuk apa-apa, walaupun projek yang anda buka menamakan satu; gambar bergeorujukan daripada fail berfungsi dalam kedua-dua keadaan. Lihat [Tunjukkan lapisan peta di bawah pelan](topic:map-layers).

## Pembantu

**Benarkan pembantu AI dan skrip menggunakan CivilCraft** (mati pada permulaan) membenarkan pembantu di komputer anda mencapai tapak yang terbuka melalui CadCraft Studio: **Baca** menerangkan tapak dan memberi titik, ketinggian permukaan, stesen, profil, isipadu dan petak tanah; **Sunting** membenarkannya memilih dan menambah titik ukur; **Simpan** dan **Eksport** membenarkannya menyimpan projek dan menulis LandXML atau DWG. **Folder yang boleh digunakannya** (dalam Studio) ialah tempat ia boleh menyimpan dan mengeksport. **Aktiviti** menyenaraikan panggilannya. Lihat [Benarkan pembantu AI bekerja dengan tapak anda](topic:assistants).
