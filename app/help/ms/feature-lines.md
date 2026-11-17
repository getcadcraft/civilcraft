---
title: Garis ciri
summary: Lukis garisan 3D yang anda tentukan cerunnya bucu demi bucu, buat ofset berlangkah daripadanya, dan gunakannya sebagai garis putus tanah atau sebagai pad cerun dalam reka bentuk.
keywords: lengkok, lengkung, jejari, lengkok 3D, heliks, kerb melengkung, tindihan cerun, tindihan aras, anak panah cerun, garis ciri, cerun, kecerunan, aras, ofset berlangkah, ofset, garis putus, kerb, parit, berm, pad cerun, persilangan cerun, pembentukan permukaan, polygaris 3D
from: d55b25fb
---

Garis ciri ialah garisan dengan aras pada setiap bucu: kerb, garis aliran parit, bahagian atas berm, tepi pad cerun. Anda menetapkan arasnya mengikut nombor atau mengikut kecerunan, menyalinnya ke sisi dengan langkah naik atau turun, dan memilih apa yang dilakukan permukaan terhadapnya.

## Lukis satu

1. Pilih **Permukaan** › {{ui:Lagi}} › {{ui:Garis ciri}}, atau tekan {{key:L}}.
2. Klik bucunya pada pelan. Klik pada titik ukur mengambil tempat dan aras titik itu; di tempat lain bucu itu mengambil aras tanah sedia ada di situ.
3. Tekan {{key:Enter}} untuk menamatkan garisan terbuka, atau klik bucu pertama sekali lagi untuk menutupnya.

Garisan baharu dipilih dan bermula sebagai garis putus tanah sedia ada, terletak di atas tanah.

## Lengkok

Satu segmen boleh menjadi lengkok dalam pelan yang hujung-hujungnya berada pada aras berbeza: pusingan kerb, parit melengkung, laluan landai yang berpusing. Kecerunannya berjalan sekata sepanjang lengkok, dan panjangnya diukur sepanjang lengkung.

- **Semasa melukis:** tekan {{key:C}} (pada skrin sentuh, {{ui:Lengkok}} pada bar di atas pelan) untuk menghidupkan lengkok. Selepas satu bucu, klik satu titik pada lengkung, kemudian klik tempat lengkok berakhir. Tekan {{key:C}} sekali lagi untuk segmen lurus. {{key:Backspace}} membuang titik pada lengkung dahulu.
- **Kemudian:** dalam **Sifat**, taip jejari dan arah pusingannya dalam kotak **Lengkok** bucu, contohnya `50 L` atau `50 R` (kiri atau kanan semasa anda berjalan sepanjang garisan), dan tekan {{key:Enter}}. Kosongkan kotak untuk menjadikan segmen lurus semula. Jejari yang lebih kecil daripada separuh segmen ditolak.

Garisan yang dipilih memaparkan jejari setiap lengkok di sebelah kecerunannya. **Panjang** ialah sepanjang lengkok dalam pelan; **Panjang 3D** turut mengira kenaikan dan penurunan. Ofset berlangkah mengekalkan lengkok: lengkok di luar selekoh membesar, yang di dalam mengecil, dan ofset yang melepasi pusat lengkok ditolak.

Permukaan, paparan 3D, DXF dan DWG mengambil setiap lengkok sebagai keping lurus pendek yang kekal dalam 0.01 daripada lengkung. LandXML mengekalkannya sebagai lengkok (lihat **Lengkok dalam fail lain** di bawah).

## Tetapkan aras dan kecerunan

**Sifat** menyenaraikan bucu dengan jaraknya sepanjang garisan, **Aras** dan **Kecerunan ke seterusnya** (dalam peratus). Taip salah satu dan tekan {{key:Enter}}:

- Aras hanya mengalihkan bucu itu.
- Kecerunan menetapkan aras di hujung jauh segmennya; bucu selepasnya kekal di tempatnya, jadi kecerunan segmen seterusnya berubah.

Juga dalam **Sifat**:

| Tindakan | Fungsinya |
|---|---|
| **Naikkan atau turunkan semua sebanyak** | Menambah ketinggian yang anda taip kepada setiap bucu. |
| {{ui:Aras daripada tanah}} | Meletakkan setiap bucu semula pada tanah sedia ada (bucu di luar permukaan kekal dengan arasnya, dan disenaraikan). |
| {{ui:Satu kecerunan, dari pertama ke terakhir}} | Mengekalkan aras pertama dan terakhir dan meletakkan bucu di antaranya pada satu kecerunan sekata. |

Garisan yang dipilih memaparkan arasnya pada bucu dan kecerunannya di sepanjang segmen pada pelan. Seret bucu dengan {{ui:Pilih}} untuk mengalihkannya; arasnya kekal.

## Ofset berlangkah

Di bawah **Ofset berlangkah**, taip **Jarak** (positif ke kanan arah garisan, negatif ke kiri), kemudian ketinggian (naik atau turun sebanyak) atau kecerunan dalam peratus, dan klik {{ui:Buat garis ofset}}. Salinan itu ialah garis ciri baharu: contohnya belakang kerb 0.5 ft ke sisi dan 0.5 ft lebih tinggi, atau tepi parit 6 ft ke luar pada 2 %. Jarak yang akan melipat salinan ke atas dirinya sendiri pada selekoh ketat ditolak.

## Kecerunan dan aras pada skrin

Tekan {{key:E}}, atau tandakan **Kecerunan dan aras pada garis ciri** di bawah Paparan, untuk melihat kecerunan setiap garis ciri di sepanjang setiap segmen (dengan anak panah kecil yang menunjuk ke bawah bukit) dan arasnya pada bucu. Ia dipaparkan pada skrin sahaja: tiada apa yang ditambah kepada lukisan, dan PDF, DXF serta DWG kekal seperti asal. Segmen pendek dan bucu yang padat tidak dilabelkan sehingga anda zum masuk. Garisan yang dipilih sentiasa memaparkan kecerunan dan arasnya sendiri.

## Dalam pandangan profil

Garis ciri yang merentasi penjajaran dipaparkan dalam pandangan profil penjajaran itu, dengan namanya dan arasnya pada persilangan; garisan yang berjalan di sebelahnya juga boleh dipaparkan. Lihat [Reka bentuk profil menegak](topic:profile).

## Apa yang dilakukan permukaan terhadapnya

Pilih **Guna**:

| Guna | Apa yang berlaku |
|---|---|
| Garis putus tanah sedia ada | Tanah sedia ada melalui garisan pada arasnya, seperti garis putus yang dilukis. |
| Dibentuk ke dalam reka bentuk | Garisan **tertutup** menjadi pad cerun: permukaan cadangan di dalamnya dibentuk ke tepinya. Hidupkan **Persilangan cerun ke tanah** untuk menjalankan cerun potongan dan tambakan (mengufuk kepada 1 menegak) dari tepinya ke tanah, seperti yang dilakukan pad; setiap cerun bermula pada aras tepi itu sendiri di situ. |
| Hanya dilukis | Ia kekal pada pelan dan dieksport dalam DXF, DWG dan PDF (lapisan C-GRAD-FEAT, polygaris 3D), tetapi permukaan mengabaikannya. |

Isi padu, keratan dan paparan 3D termasuk garis ciri yang dibentuk ke dalam reka bentuk, seperti pad. Setiap perubahan ialah satu langkah: {{key:Mod+Z}} membuat asalnya.

## Berkongsi garisan dengan pasukan anda

Dalam lukisan yang dibuka daripada fail awan anda dalam CadCraft Studio, pada pelan pasukan, **Sifat** projek (tiada apa dipilih) mempunyai bahagian **Pasukan** dengan {{ui:Garisan pasukan…}}: garisan yang dikongsi pasukan anda, setiap satu dengan semakannya, tanpa perlu memilih garis ciri dahulu. Pilih garisan untuk berkongsinya, hantar semakan baharu, tarik semakan pasukan, atau hentikan perkongsian. Di luar tetapan itu, bahagian menyatakan apa yang diperlukannya.

## Lengkok dalam fail lain

| Fail | Apa yang berlaku kepada garis ciri dengan lengkok |
|---|---|
| Projek CivilCraft | Dikekalkan sepenuhnya. |
| LandXML | Ditulis sebagai ciri pelan bagi garisan dan lengkok dengan arasnya, dan dibaca semula dengan lengkoknya. Garis ciri daripada program lain masuk sebagai **Hanya dilukis**: pilih **Guna** untuk meletakkannya dalam permukaan. |
| DWG dan DXF | Polygaris 3D tidak boleh memuatkan lengkok, jadi garisan itu ditulis sebagai keping pendek dalam 0.01 daripada setiap lengkok. CivilCraft turut mencatat dalam lukisan keping mana yang merupakan lengkok: apabila anda membuka lukisan sebagai garisan, {{ui:Garis ciri}} membawa garisan kembali sebagai garis ciri dengan lengkoknya. Program lain melihat polygaris 3D biasa. |
