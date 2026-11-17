---
title: Kira jam matahari di tapak
summary: Pilih hari (atau musim) dan zon masa, dan lihat jam matahari langsung pada setiap dinding setiap jisim dan pada tanah di sekelilingnya, dengan tanah dilukis pada pelan dan nombor sebagai CSV.
keywords: matahari, jam matahari, bayang, teduhan, akses solar, jam siang, fasad, dinding, musim, solstis, ekuinoks, zon masa, penjimatan siang hari, latitud, longitud, CSV, raster
from: 4e32a314
---

**Jam matahari** mengira jam matahari langsung yang sampai ke setiap dinding setiap jisim bangunan dan tanah di sekelilingnya, pada hari yang anda pilih atau purata sepanjang musim. Jisim dan tanah itu sendiri menghasilkan bayang; tiada yang lain (tiada pokok, tiada jiran yang belum anda lukis). Cahaya langit yang bukan matahari langsung tidak dikira.

## Sebelum anda mula

Kedudukan matahari datang daripada latitud dan longitud tapak, yang datang daripada **sistem koordinat** projek. Projek tanpa sistem koordinat ditolak dengan mesej: tetapkannya dahulu (**Koordinat** dalam kumpulan GIS). Latitud dan longitud yang ditaip tangan ialah tekaan, maka tiada kotak untuknya.

## Kira

Dalam **Sifat**, di bawah **Jisim bangunan**, **Jam matahari**:

1. Pilih **Hari**. Ia bermula pada hari matahari paling rendah di tempat anda (21 Disember, atau 21 Jun di hemisfera selatan). Untuk musim, tandakan **Sepanjang musim**, pilih **Hari terakhir** dan berapa hari sela untuk pensampelan.
2. Taip **Zon masa**: nama seperti `America/Mexico_City`, atau offset daripada UTC seperti `-6`. Nama mengikut peraturan penjimatan siang hari zon itu bagi hari tersebut; offset yang anda taip digunakan tepat seperti yang ditaip, maka gunakan yang berkuat kuasa pada hari itu. Baris di bawah kotak memberitahu offset yang ditemuinya.
3. Pilih kekerapan meletakkan matahari (setiap 5, 10, 15 atau 30 minit), kemudian **Kira jam matahari**. Musim dijalankan dalam pekerja latar belakang; **Henti** membatalkannya.

## Apa yang anda perolehi

- Jadual mengikut jisim: **dinding terburuk**, **purata** dan **dinding terbaik**, dalam jam sehari, dan jadual setiap dinding dengan arah hadapannya dan jamnya tingkat demi tingkat.
- Tanah di sekeliling jisim, dilukis pada pelan dari gelap (tiada matahari) hingga kuning (paling banyak yang diterima mana-mana sel), dengan kunci. Sel di bawah jisim dibiarkan kosong. **Tunjukkan tanah pada pelan** mematikannya.
- **Dinding sebagai CSV** dan **Tanah sebagai CSV** menyimpan nombor.

Bagi musim, angka ialah purata sehari sepanjang hari yang disampel. Tiada apa yang disimpan dalam projek: hasilnya untuk dilihat, dan menjalankannya semula akan menghasilkannya semula.

## Perkara yang perlu diketahui

- Dinding hanya mengira satu saat sebagai cerah apabila ia menghadap matahari dan tiada apa yang menghalang. Dinding yang menghadap ke belakang tidak mendapat apa-apa.
- Tanah disampel pada grid yang bergantung pada saiz tapak, dan kedudukan matahari diambil pada tengah setiap langkah masa, maka jam adalah tepat kepada langkah yang anda pilih.
- Kedudukan matahari ialah formula astronomi yang diterbitkan, tepat kepada kira-kira satu minit arka.
