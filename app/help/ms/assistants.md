---
title: Benarkan pembantu AI bekerja dengan tapak anda
summary: Hidupkan pembantu dalam Tetapan supaya pembantu pada komputer anda boleh membaca tapak yang terbuka (titik, permukaan, isipadu, profil, lot), menambah titik ukur, menyimpan dan mengeksport LandXML atau DWG, melalui CadCraft Studio. Dimatikan sehingga anda menghidupkannya.
keywords: ai, pembantu, mcp, skrip, automasi, studio, titik, ketinggian, stesen, ofset, penjajaran, isipadu, potongan, tambakan, profil, lot, landxml, dwg, usd, folder, kebenaran, putuskan sambungan, aktiviti
from: d0356582
---

## Apa yang akan anda pelajari

Cara membenarkan pembantu AI (mana-mana pembantu yang bercakap MCP) bekerja dengan tapak yang anda buka, apa yang boleh dan tidak boleh dilakukannya, dan cara menghentikannya.

## Apa yang boleh dilakukan pembantu dalam CivilCraft

| Ia meminta | Apa yang diperolehnya | Perlu |
|---|---|---|
| Tapak | Nama, unit, sistem koordinat, kumpulan titik, penjajaran, permukaan, pelantar, lot dan paip | Baca |
| Titik ukur | Nombor, easting, northing, ketinggian dan huraian, mengikut kumpulan, mengikut huraian atau di dalam kotak | Baca |
| Ketinggian permukaan | Tanah sedia ada (atau permukaan yang digred) pada mana-mana titik yang dinyatakannya | Baca |
| Stesen dan ofset | Stesen dan ofset titik sepanjang penjajaran, atau koordinat dan ketinggian tanah bagi stesen | Baca |
| Profil | Ketinggian tanah, profil reka bentuk dan permukaan digred sepanjang penjajaran, setiap sekian kaki atau meter | Baca |
| Potongan dan tambakan | Isipadu antara tanah sedia ada dan permukaan digred (setiap pelantar dan koridor juga), atau antara tanah dan satu aras | Baca |
| Lot | Penjuru, luas (dengan ekar atau hektar), perimeter dan huraian sah | Baca |
| Pilihan | Titik yang dinamakannya dipilih pada pelan, seolah-olah anda telah memilihnya | Sunting |
| Titik ukur baharu | Titik ditambah dengan nombor yang diberinya, atau nombor kosong yang seterusnya. Setiap panggilan ialah satu langkah yang boleh anda buat asal | Sunting |
| Simpan | {{ui:Simpan}} milik CivilCraft sendiri | Simpan |
| LandXML atau DWG | Fail yang sama seperti butang {{ui:LandXML}} dan {{ui:DWG}} | Eksport |
| Tapak dalam 3D | OpenUSD (.usdz, .usda atau .usdc) bagi tanah, permukaan digred, pelantar dan paip, seperti yang dieksport oleh paparan 3D | Eksport |
| Tumbuhan dan jadual tumbuhan | Tumbuhan yang dijumpai dalam senarai tumbuhan dengan mana-mana nama, dan kiraan jadual tumbuhan | Baca |
| Penanaman dan penggredan | Tumbuhan, katil atau pagar hidup diletakkan, atau platform, benteng tanah, parit dan kawasan penggredan ditambah, setiap satu ialah satu langkah yang boleh dibuat asal, dengan potongan dan tambakannya | Sunting |
| Semakan pengairan | Aliran setiap zon, tekanan yang diperlukan di injapnya dan di bekalan, kepala kes terburuk, masa larian, masalah dan senarai bahan, sebagai alat bantu pengiraan yang disemak oleh pereka pengairan | Baca |

Ia berfungsi dengan tapak yang sedang terbuka. Dalam Studio ia juga boleh menyimpan dan mengeksport ke dalam folder yang anda pilih (di bawah); tanpa folder, fail-failnya dimuat turun seperti yang dilakukan oleh butang.

## Hidupkannya

Pembantu mencapai CivilCraft melalui CadCraft Studio pada komputer anda; pelayar biasa tiada laluan masuk.

1. Buka {{ui:Tetapan}} dan pilih tab **CivilCraft**.
2. Di bawah **Pembantu**, tandakan **Benarkan pembantu AI dan skrip guna CivilCraft**.
3. **Baca** sudah ditandakan untuk anda. Tandakan **Sunting**, **Simpan** atau **Eksport** hanya apabila pembantu memerlukannya.
4. Untuk membenarkannya menyimpan dan mengeksport ke dalam folder, pilih {{ui:Tambah folder…}} di bawah **Folder yang boleh digunakannya** dan pilih folder dalam kotak dialog Studio. {{ui:Alih keluar}} mengambilnya semula serta-merta; mana-mana laluan lain ditolak.
5. Sambungkan pembantu dalam Studio (Studio menunjukkan alamat dan tetapan untuk ditampal ke dalamnya).

## Semasa pembantu bersambung

Nota di bahagian atas panel kanan menyatakan pembantu mana yang bersambung dan apa yang boleh dilakukannya. Klik {{ui:Putuskan sambungan}} untuk menamatkan sesinya serta-merta; ia perlu bersambung semula untuk meneruskan.

**Aktiviti**, di bawah **Pembantu** dalam Tetapan, menyenaraikan setiap panggilan yang dibuat oleh pembantu, yang terbaharu dahulu, dengan sama ada ia berjaya.

:::tip
Tanya dalam perkataan biasa, contohnya "apakah ketinggian tanah setiap 50 kaki sepanjang Main Street?", "berapa banyak potongan dan tambakan yang diperlukan oleh pelantar?" atau "tambah titik kawalan pada koordinat ini". Pembantu membaca tapak dan menjawab, atau membuat perubahan sebagai satu langkah yang boleh anda buat asal.
:::

## Tanpa membuka CivilCraft

Pelayan fail CadCraft untuk pembantu (`npx @getcadcraft/mcp`) dan baris arahan `cadcraft` membuka projek CivilCraft yang disimpan (`.civilcraft.json`) dan fail titik dengan kod CivilCraft sendiri, tanpa tetingkap: alat bacaan yang sama, menambah titik, menyimpan projek, LandXML dan tapak dalam 3D sebagai OpenUSD. `cadcraft convert site.civilcraft.json site.xml` menulis LandXML daripada baris arahan. Membuka LandXML, eksport DWG dan alatan ruang kerja Landscape masih memerlukan tetingkap CivilCraft.

## Matikannya

Nyahtandai **Benarkan pembantu AI dan skrip guna CivilCraft**. Setiap pembantu diputuskan sambungannya serta-merta, dan tetapan disimpan untuk kali seterusnya.

## Lihat juga

- [Resipi untuk pembantu AI](common:assistants-recipes): contoh kerja, setiap satu dengan alat yang dipanggilnya.
- [Reka penjajaran mengufuk](topic:alignment)
- [Bina dan halusi permukaan](topic:build-surface)
- [Pilih, salin dan tampal titik ukur](topic:copy-paste-points)
- [Tetapan CivilCraft](topic:settings)
