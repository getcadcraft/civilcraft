---
title: Lukis jisim bangunan di tapak
summary: Lukis jisim bangunan pada lot, beri tingkat dan ketinggian tingkat, lihat luas lantai kasar, pilih cara ia duduk di atas tanah bercerun, tolak dan tarik ketinggiannya dalam 3D, dan hantarnya kepada BimCraft atau simpan sebagai fail IFC.
keywords: jisim, pemodelan jisim, jisim bangunan, isipadu, jejak, tingkat, ketinggian tingkat, luas lantai kasar, GFA, cerun, podium, potongan dan tambakan, tolak tarik, 3D, kajian tapak, reka bentuk awal, IFC, kembangkan, BimCraft, A-MASS
from: e5a67c16
---

Jisim bangunan ialah jejak, bilangan tingkat dan ketinggian tingkat: soalan awal "berapa banyak bangunan yang muat di sini, dan apa kesannya kepada tanah". Jisim berada pada pelan dengan nama, bilangan tingkat dan luas lantai kasarnya, dimasukkan ke dalam plot PDF dan eksport DWG dan DXF pada lapisan `A-MASS` dan `A-MASS-TEXT`, dan disimpan dalam fail projek.

## Lukis jisim

1. Dalam **Sifat**, di bawah **Jisim bangunan**, klik **Lukis jisim**. (Ia juga terdapat dalam menu **Lagi** bar alat di sebelah **Permukaan**.)
2. Klik sudut jejak. Klik berhampiran sudut lot atau titik ukur mengambil kedudukan tepat titik itu.
3. Klik sudut pertama sekali lagi, atau tekan {{key:Enter}}, untuk selesai. {{key:Backspace}} mengambil balik sudut terakhir; {{key:Esc}} berhenti.

Jisim baharu mempunyai tiga tingkat dan ketinggian tingkat 12 ft (3.6 m), dan ia tergolong kepada lot tempat titik tengahnya jatuh.

## Tingkat, ketinggian dan luas

Klik jisim untuk menukar **Nama**, **Kegunaan**, **Tingkat**, **Ketinggian tingkat** dan **Lot**. **Ketinggian** ialah tingkat didarab ketinggian tingkat: taip ketinggian dan bilangan tingkat menjadi nombor bulat terdekat (tidak kurang daripada satu). **Jejak** dan **Luas lantai kasar** (jejak didarab tingkat) dikira untuk anda.

## Atas tanah bercerun

Tanah di bawah jisim dibaca daripada permukaan: tanah sedia ada, atau tanah yang digred di mana anda memilih **Tanah cadangan (digred)**. **Atas tanah bercerun** menyatakan di mana lantai bawah diletakkan:

- **Berperingkat**: pada purata tanah di bawah jejak. Bahagian rendah diisi sehingga ke situ dan bahagian tinggi dipotong, dan kedua-duanya hampir seimbang.
- **Podium**: pada tanah yang tertinggi. Tapak pepejal mengisi bahagian rendah.
- **Potong**: pada tanah yang terendah. Bahagian tinggi dipotong ke dalam bukit.

Sifat menunjukkan julat tanah di bawah jisim, **Aras lantai bawah**, dan isipadu tambakan dan potongan antara tanah dan aras itu. Titik jejak yang berada di luar permukaan ditinggalkan, dan Sifat menyatakan berapa banyak.

## Dalam paparan 3D

Jisim dilukis dalam paparan tapak 3D, dengan garisan di sekeliling setiap tingkat dan nama mereka di atas bumbung. **Tunjuk** mempunyai kotak semak untuk **Jisim bangunan**. Klik satu untuk memilihnya. Dengan jisim dipilih:

- seret bumbungnya ke atas atau ke bawah untuk menolak atau menarik sekali satu tingkat, atau tekan {{key:PageUp}} dan {{key:PageDown}};
- keseluruhan pergerakan ialah satu langkah buat asal.

Paparan jalan bagi **Pandu** juga melihat jisim, dan **Matahari** melemparkan bayangannya ke atas tanah.

## Hantarnya

- **Jisim sebagai IFC** menyimpan setiap jisim sebagai fail IFC4: satu tapak, sebuah bangunan dengan tingkatnya, dan jisim sebagai elemen bangunan dengan nombornya dalam set sifat `CadCraft_SiteMass`. Dengan sistem koordinat ditetapkan pada projek, fail diletakkan pada peta dan membawa latitud dan longitud tapak; tanpa itu ia tidak menyatakan di mana ia berada.
- **Kembangkan dalam BimCraft** membuka BimCraft dalam tab baharu dengan jisim-jisim itu. Di sana, memilih jisim menunjukkan nombornya dan **Kembangkan jisim ini**, yang membina dinding di setiap aras dan lantai di bawah bangunan daripada jejak, dalam satu langkah buat asal. Tiada apa dimuat naik: fail berpindah antara dua tab pelayar ini.

Lihat juga **Had zonasi** dan **Jam matahari**.
