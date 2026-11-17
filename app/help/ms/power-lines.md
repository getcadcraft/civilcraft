---
title: Ruang kerja talian kuasa
summary: Talian atas dan kabel bawah tanah di tapak anda, dengan pustaka anda sendiri, lendutan dan tegangan di bawah kes beban anda, semakan ruang bebas dan kekuatan, jadual penarikan, kuantiti, helaian dan eksport GIS.
keywords: talian kuasa, talian atas, elektrik, pengagihan, tiang, penyokong, konduktor, lendutan, tegangan, penarikan, ruang bebas, kabel bawah tanah, parit, ruang kerja, utiliti
from: 638dd856
---

Ruang kerja talian kuasa meletakkan talian atas dan kabel bawah tanah di atas tapak CivilCraft yang sudah anda ada: titik tinjauan yang sama, tanah yang sama, fail projek yang sama.

:::warning
Alat bantu reka bentuk. Ruang kerja mengira lendutan, tegangan, ruang bebas dan beban daripada **kes beban dan had anda**; tiada piawaian mana-mana negara dibina di dalamnya. Seorang jurutera menyemak setiap keputusan terhadap piawaian yang terpakai sebelum apa-apa dibina.
:::

## Buka

Pilih {{ui:Permukaan}} › {{ui:Lagi}} › {{ui:Ruang kerja talian kuasa}}, atau **Talian kuasa** di bawah Ruang kerja. Bar alat kemudian memaparkan kumpulan **Talian kuasa**; kumpulan Reka bentuk dan GIS berganjak ke tepi. Pilih **Civil** di bawah Ruang kerja untuk kembali. CivilCraft mengingati ruang kerja yang anda gunakan terakhir pada komputer ini.

Panel kiri mendapat dua bahagian di bahagian atas:

- **Talian kuasa**: kes beban dan had anda, talian serta kabel dalam projek, dan **Semakan**, sentiasa dikemas kini. Klik satu semakan untuk memilih perkara yang berkaitan.
- **Pustaka**: konduktor, kabel, penyokong, peralatan dan jenis parit anda sendiri. Lihat [Pustaka talian kuasa anda](topic:power-line-library).

## Apa yang ada dalam kumpulan Talian kuasa

| Alat | Fungsinya | Topik |
|---|---|---|
| **Talian** | Talian atas: klik setiap penyokong | [Lukis talian atas](topic:overhead-line) |
| **Penyokong** | Tambah penyokong pada rentang | [Lukis talian atas](topic:overhead-line) |
| **Kabel** | Laluan kabel bawah tanah dalam parit | [Kabel bawah tanah](topic:underground-cables) |
| **Peralatan** | Kabinet, pengubah, sambungan, atau sumber yang rangkaian dibekalkan daripadanya | [Kabel bawah tanah](topic:underground-cables) |
| **Halangan** | Sesuatu yang dilintasi talian: jalan, bangunan, talian lain | [Semakan](topic:power-line-checks) |
| **Profil** | Profil talian: tanah, penyokong dan konduktor pada setiap kes beban | [Lukis talian atas](topic:overhead-line#the-line-profile) |
| **Lagi** | Kes beban dan had, jadual penarikan, kuantiti, helaian dan laporan, GIS, fail kajian | [Lendutan dan tegangan](topic:sag-and-tension), [Output](topic:power-line-outputs), [Fail kajian](topic:power-line-study-file) |

Apa sahaja yang anda tambah ialah satu langkah buat asal, disimpan dalam fail projek, dan dilukis pada pelan dalam lapisan bernama `C-POWR-…`, jadi eksport DXF, DWG dan PDF turut membawanya.
