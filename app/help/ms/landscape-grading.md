---
title: Pembentukan untuk landskap
summary: Pelantar, benteng tanah, parit resapan dan pembentukan bebas dengan aras titik dan kontur yang anda seret, korek dan timbus secara langsung, analisis cerun, anak panah aliran dan air bertakung — semua dalam permukaan yang dicadangkan CivilCraft.
keywords: dinding penahan, sisi menegak, dinding dan bukannya cerun, cerun setiap sisi, tambakan, pembentukan, pembentukan landskap, pelantar, teres, pad, benteng tanah, busut, parit resapan, aras titik, kontur, sunting kontur, korek dan timbus, kerja tanah, analisis cerun, kebolehcapaian, cerun curam, anak panah aliran, saliran, air bertakung, lopak
from: e1559eb9
---

Semua di sini dibentuk ke dalam **permukaan yang dicadangkan** dengan pembentukan yang sama seperti pad dan koridor. **Tanah sedia ada** tidak pernah diubah, dan Kerja tanah mengira semuanya. Menu {{ui:Pembentukan}} berada dalam kumpulan Landskap.

## Pelantar

{{ui:Pembentukan}} › {{ui:Pelantar}}, kemudian klik bucu dan tekan {{key:Enter}}. Pelantar bermula pada purata aras tanah di bawahnya; taip **Aras** untuk menetapkannya, atau kosongkannya untuk mengikut tanah semula. **Kejatuhan** dalam % dan **Kejatuhan ke arah** dalam darjah (0 = timur, 90 = utara) menyengetkannya. Sisinya dibentuk keluar ke tanah pada **Cerun korek** dan **Cerun timbus** (mendatar kepada 1).

## Sisi setiap sisi dan dinding penahan

Di bawah **Sisi dan dinding penahan** dalam Sifat sebuah pad, pelantar atau benteng tanah, setiap sisi boleh dibentuk mengikut caranya sendiri. Sisi 1 berjalan dari bucu pertama yang anda klik ke yang kedua, sisi 2 dari yang kedua ke yang ketiga, dan seterusnya.

- **Semua sisi**: **Bercerun** menggunakan cerun korek dan timbus di atas pada setiap sisi; **Menegak: dinding penahan** meletakkan dinding pada setiap sisi.
- Setiap sisi: **Cerun di atas**, **Cerun sendiri** (taip cerun korek dan cerun timbus untuk sisi itu) atau **Menegak (dinding penahan)**.
- Taip cerun sebagai `3` atau `3:1` (mendatar kepada 1 menegak), `33%` atau `18.4°`; ia dipaparkan sebagai H:1. **Cerun korek** dan **Cerun timbus** pad sendiri menerima perkara yang sama.
- Sisi menegak tidak mempunyai tambakan: dinding penahan berjalan sepanjang tepi, dari pad turun ke tanah sedia ada (dalam timbus) atau dari tanah turun ke pad (dalam korek). **Ketebalan dinding** (0.3 m atau 1 ft sebagai permulaan) ialah jarak tanah melangkah dari tepi pad ke tanah sedia ada. Isipadu korek dan timbus tidak termasuk tambakan yang tidak lagi ada pada sisi itu.
- Di tempat dinding bertemu sisi bercerun, cerun membalut hujung dinding; dua dinding bertemu dalam sambungan mitre.
- Di bawah medan: panjang dinding, luas muka terdedah (tinggi × panjang), ketinggian tertinggi dan purata.

Pelan melukis muka luar setiap dinding dengan tanda pendek merentasinya dan ketinggiannya di kedua-dua hujung dan di titik tertingginya (pada lapisan dinding penahan, yang juga masuk ke DXF dan DWG). Paparan 3D menunjukkan dinding sebagai pepejal (Tunjuk › Dinding penahan), dan eksport GLB, OBJ dan USD menyertakannya. Keratan merentasi tepi menunjukkan langkahnya.

**Amaran** (dalam Sifat, dan dalam panel Masalah): dinding yang lebih tinggi daripada **Amaran di atas ketinggian dinding** (1.0 m atau 3.3 ft sebagai permulaan) "mungkin memerlukan dinding kejuruteraan atau permit; semak peraturan tempatan", dan, apabila anda menaip **Cerun paling curam yang boleh ditanggung tanah**, mana-mana sisi yang cerun korek atau timbusnya lebih curam daripada itu. Ia amaran sahaja: pembentukan tetap dibina. Setiap perubahan ialah satu langkah untuk {{key:Mod+Z}}.

## Benteng tanah

{{ui:Pembentukan}} › {{ui:Benteng tanah}}: busut yang bahagian atasnya ialah **Ketinggian** di atas purata tanah di bawahnya, dengan sisinya dibentuk keluar.

## Parit resapan

{{ui:Pembentukan}} › {{ui:Parit resapan}}, kemudian klik sepanjang parit **mengikut arah air mengalir** dan tekan {{key:Enter}}. Tetapkan **Kedalaman**, **Lebar dasar** (0 untuk V) dan **Cerun sisi**. Tanpa **Kejatuhan**, dasarnya mengikut tanah, kedalamannya di bawahnya, dan ia tidak pernah mendaki; taip kejatuhan untuk memberikannya kejatuhan tetap dari permulaannya.

## Aras titik dan kontur

1. {{ui:Pembentukan}} › {{ui:Kawasan pembentukan permukaan}}: klik garis luar kawasan yang anda mahu bentuk.
2. {{ui:Pembentukan}} › {{ui:Aras titik}}: klik di dalam kawasan. Taip arasnya dalam Sifat, atau guna butang ▲ ▼.
3. {{ui:Pembentukan}} › {{ui:Sunting kontur}}: klik kontur di dalam kawasan untuk mengambilnya sebagai garisan yang boleh dibentuk semula.

Pilih titik atau kontur dan **seret** (atau titik-titiknya) pada pelan: permukaan mengikut apabila anda lepaskan, satu langkah buat asal. Di dalam kawasan, tanah dibina semula daripada tepinya (tempat ia bertemu tanah sedia ada), aras titik dan kontur yang disunting.

## Korek dan timbus, secara langsung

Sifat setiap objek pembentukan menunjukkan **Korek** dan **Timbus**nya serta keseluruhan tapak, mengikut kaedah grid yang digunakan oleh Kerja tanah, semasa anda mengubahnya. Masalah (di luar permukaan, garis luar yang bersilang sendiri) disenaraikan di sana.

## Semakan pembentukan

Dalam bahagian **Semakan pembentukan** di sebelah kiri:

- **Analisis cerun** mewarnai permukaan mengikut kecerunan: sehingga had landai, antara, dan lebih curam daripada had curam (5 % dan 33.3 % sebagai permulaan: 1:20 yang biasa untuk laluan boleh diakses dan 1:3 untuk memotong rumput). Lejen memberitahu berapa banyak kawasan jatuh dalam setiap satu. Kawasan curam juga dicetak pada helaian.
- **Anak panah aliran dan air bertakung** melukis arah air mengalir dan membulatkan setiap tempat ia akan bertakung, dengan kedalamannya; bahagian itu memberitahu berapa banyak tempat, yang terdalam dan berapa banyak air yang dipegangnya.

Semakan membaca permukaan yang dicadangkan apabila apa-apa dibentuk, jika tidak tanah sedia ada.
