---
title: Buka DWG atau DXF sebagai garisan
summary: Buka garisan lukisan pada pelan, lapisan demi lapisan, gunakan kontur, polygaris 3D dan garis besar tertutup untuk permukaan, dan tukar blok titiknya kepada titik ukur.
keywords: semakan ukur, aras teks, dwg, dxf, cad, lukisan, garisan, kontur, garis putus, sempadan, polygaris, polygaris 3D, lapisan, peta asas, topo, lukisan ukur, blok, rujukan blok, titik ukur daripada blok, atribut, blok titik, titik selitan
from: da0f4c58
---

Kerja ukur topografi selalunya datang sebagai lukisan: kontur sebagai polygaris pada arasnya, garis putus sebagai polygaris 3D, garis besar tapak sebagai polygaris tertutup. CivilCraft membuka **ruang model** lukisan sebagai lapisan pada pelan, dan boleh menukar garisan itu terus kepada permukaan.

## Buka lukisan

1. Klik {{ui:Garisan}} dalam kumpulan **Permukaan** (atau {{ui:Buka}}, atau lepaskan fail pada pelan) dan pilih fail `.dwg` atau `.dxf`. Lukisan dibaca pada komputer ini; tiada apa dimuat naik. DWG dari 2000 hingga 2018 dan DXF ASCII dibaca.
2. Kotak dialog **Garisan** menyenaraikan lapisan lukisan yang mengandungi garisan, bentuk tertutup atau titik, dan sama ada ia mempunyai **aras**. Lapisan yang dimatikan dalam lukisan bermula tanpa tanda semak. Teks, hatch (lorekan), dimensi dan objek lain yang bukan garisan dikira dan ditinggalkan (kotak dialog menyatakan yang mana).
3. Semak **Unit lukisan**. Apabila lukisan menyatakan unitnya, CivilCraft menukarkannya kepada unit projek (milimeter kepada meter, meter kepada kaki, inci kepada kaki). Lukisan dalam kaki dibaca sebagai kaki ukur AS tanpa skala: kedua-duanya berbeza 2 bahagian per sejuta, dan menskala koordinat satah negeri dengan itu akan mengalihkannya sebanyak beberapa kaki. Apabila lukisan tidak menyatakan unitnya, nombornya dibaca dalam unit projek; pilih unit yang betul dalam senarai jika tidak betul.
4. Dalam **Guna untuk permukaan**, pilih apa yang diberikan setiap lapisan kepada permukaan (atau biarkan **Tunjukkan sahaja**). Lapisan yang dinamakan seperti kontur (TOPO, CONT, CNTR) yang mempunyai aras bermula sebagai garis putus.
5. Klik {{ui:Tambah}}. Lapisan muncul di bawah **Lapisan GIS** dalam panel kiri; setiap penggunaan dimasukkan ke dalam permukaan. Setiap bahagian ialah satu langkah tersendiri: {{key:Mod+Z}} membatalkannya satu demi satu.

## Apa yang boleh diberikan oleh setiap jenis lapisan

| Lapisan mengandungi | Guna untuk permukaan |
|---|---|
| Kontur (polygaris pada aras) | Garis putus pada aras garisan itu sendiri, atau pada medan ELEV |
| Polygaris 3D | Garis putus pada aras mereka sendiri |
| Garis besar tertutup | Sempadan permukaan (bentuk tertutup terbesar, atau yang anda pilih) |
| Titik beraras | Titik ukur, diterangkan dengan nama lapisan |
| Garisan pada aras 0 (garisan pelan) | Tiada apa: ia kekal pada pelan sebagai lukisan asas |

Lukisan yang ditulis oleh CivilCraft mengandungi garis ciri sebagai polygaris 3D yang mengingati lengkoknya. Kotak dialog kemudian memaparkan **Garis ciri**: biarkan bertanda untuk membawanya semula sebagai garis ciri dengan lengkok dan penggunaannya (satu langkah buat asal), atau nyahtanda untuk membacanya sebagai garisan seperti lapisan lain.

Kemudian, guna {{ui:Guna untuk permukaan}} dalam menu lapisan di bawah **Lapisan GIS** untuk melakukan perkara yang sama bagi lapisan yang anda hanya tunjukkan.

## Titik ukur daripada blok

Lukisan ukur selalunya membawa titiknya sebagai blok: simbol kecil pada setiap bidikan, dengan atribut bagi nombor titik, huraian dan aras. Apabila lukisan mempunyai rujukan blok, kotak dialog mempunyai bahagian **Titik ukur daripada blok**:

1. Tanda blok yang hendak diambil (jadual menyatakan berapa rujukan setiap satu ada, pada lapisan mana, dan atribut yang mana), atau tanda lapisan untuk mengambil setiap rujukan blok padanya.
2. Pilih dari mana **nombor**, **huraian** dan **aras** setiap titik datang: atribut, nama blok atau lapisan, nombor kosong seterusnya, atau Z titik selitan. CivilCraft bermula pada atribut yang berkemungkinan (PT, DESC, ELEV dan seumpamanya), dan mengambil aras daripada atribut hanya apabila blok berada pada sifar.
3. Nyahtanda lapisan garisan jika anda hanya mahu titik, kemudian klik {{ui:Tambah}}.

Setiap rujukan menjadi satu titik ukur pada titik selitannya. Hanya rujukan yang diletakkan dalam ruang model dikira; blok yang bersarang dalam blok lain tidak. Nombor yang sudah ada dalam projek, atau yang digunakan dua kali dalam lukisan, mendapat nombor baharu selepas yang tertinggi, dan atribut aras yang bukan nombor menjadikan titik itu tanpa aras; bar status mengira kedua-duanya. Lukisan tidak pernah diubah, dan setiap titik mengingati bloknya: Sifatnya memaparkan **Daripada blok** dengan blok, lapisan dan pengendali (handle). Menambah titik ialah satu langkah, jadi {{key:Mod+Z}} membuangnya semua.

## Aras yang ditulis sebagai teks, dan semakan

Aras titik yang ditulis sebagai teks (atau dalam atribut blok yang bukan blok titik ukur) bukan garisan. Bahagian **Aras ukur dan semakan** boleh mengambilnya sebagai titik ukur, dan menyenaraikan apa yang kelihatan salah dengan lukisan: unit, sistem koordinat, jarak dari sifar, kontur rata, aras ganjil, titik berganda. Lihat [Semak lukisan ukur semasa import](topic:survey-check).

## Cara lukisan dibaca

- Lengkok, bulatan, elips, segmen polygaris kembung dan splin menjadi keping lurus pendek (setiap 5° paling banyak).
- Rujukan blok dilukis di tempat ia diletakkan, blok bersarang juga; apa yang dipegang blok pada lapisan 0 mengambil lapisan rujukan itu.
- Objek yang dilukis pada satah lain (arah penyemperitan berbeza) diletakkan dalam koordinat dunia.
- Setiap objek mendapat tiga medan: LAYER, TYPE (jenis objek) dan ELEV (arasnya apabila semua titiknya berkongsi satu aras).
- Koordinat diambil seperti sedia ada: lukisan mesti menggunakan koordinat yang sama dengan projek (contohnya zon satah negeri yang sama). Lukisan terpaut (rujukan luaran (Xref)) tidak dibuka: buka secara berasingan.

:::tip
Lukisan kontur memberikan permukaan terbaik dengan beberapa aras titik di puncak bukit dan di lekuk, di mana kontur sahaja meninggalkan segi tiga rata. Tambahkannya sebagai titik ukur, atau daripada lapisan titik dalam lukisan.
:::
