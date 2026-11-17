---
title: Senarai tumbuhan
summary: Kira-kira 420 tumbuhan sederhana dan Mediterranean yang biasa dengan saiz, ketahanan, cahaya dan airnya, boleh dicari dalam mana-mana bahasa, serta senarai anda sendiri yang disimpan bersama projek.
keywords: senarai tumbuhan, pangkalan data tumbuhan, spesies, nama botani, nama biasa, palet tumbuhan, senarai pembibitan, zon ketahanan, csv, import tumbuhan, eksport tumbuhan, tumbuhan saya, senarai pokok, senarai pokok renek, plantas, pustaka tumbuhan
from: 7ed09e7e
---

Bahagian **Tumbuhan** dalam panel kiri menyenaraikan setiap tumbuhan yang boleh anda letakkan. Klik satu untuk melihat saiznya dan menjadikannya tumbuhan yang digunakan oleh **Tumbuhan**, **Katil** dan **Pagar hidup**.

## Carian dan penapis

Taip dalam **Carian**: mana-mana perkataan nama tumbuhan dalam mana-mana bahasa (Inggeris, Sepanyol, Portugis), nama botaninya, jenisnya atau satu perkataan dalam notanya. Setiap perkataan yang anda taip mesti sepadan, jadi `quercus evergreen` mencari pokok oak malar hijau. Tanda aksen tidak penting.

Persempit senarai dengan **Jenis**, **Cahaya**, **Air** dan **Zon ketahanan** (zon USDA tempat tapak anda berada: tumbuhan disenaraikan apabila zon itu berada dalam julatnya).

## Apa yang dibawa oleh tumbuhan

| Medan | Maksud |
|---|---|
| Jenis | Pokok, pokok renek, pagar hidup, rumput (termasuk rumput halaman), saka, penutup tanah atau pendaki |
| Pada matang | Ketinggian dan lebar tumbuhan yang ditanam di taman atau jalan, dalam meter |
| Pada penanaman | Saiz ketika ia ditanam, dan bekasnya |
| Jarak | Pusat ke pusat dalam katil atau sepanjang pagar hidup |
| Zon ketahanan | Zon USDA tempat ia biasanya tahan |
| Cahaya, air, tanah | Apa yang diperlukannya |
| Nota | Kegunaan dan amaran, seperti bahagian beracun atau tumbuhan yang merebak |

:::note
Senarai terbina dalam ditulis untuk CadCraft daripada pengetahuan hortikultur am: saiz tipikal, dibundarkan. Ia bukan katalog mana-mana pembibitan. Semak saiz dan ketahanan dengan pembibitan tempatan. Tumbuhan invasif yang paling terkenal di Semenanjung Iberia dan sebahagian besar dunia beriklim sederhana sengaja ditinggalkan, dan beberapa yang invasif di tempat lain membawa nota.
:::

## Senarai tumbuhan anda sendiri

- **Tambah ke senarai projek ini** menyalin tumbuhan ke dalam senarai projek itu sendiri, yang disimpan bersama projek. Tumbuhan dalam senarai anda menggantikan tumbuhan terbina dalam dengan kunci yang sama, jadi anda boleh menukar saiznya untuk rantau anda.
- **Import senarai tumbuhan…** membaca CSV (atau fail tumbuhan). CSV memerlukan lajur dengan nama botani dan, sebaik-baiknya, jenis, ketinggian dan lebar; nama lajur dalam perkataan anda sendiri diterima (Latin, Nama biasa, Ketinggian, Lebar, Zon). Koma, koma bertitik atau tab, dan koma perpuluhan, dibaca. Saiz penanaman, jarak dan bekas yang kosong mengambil nilai lalai yang munasabah bagi jenis itu.
- **Eksport sebagai CSV** menyimpan senarai anda (atau, jika tiada, tumbuhan yang dipaparkan oleh carian) untuk dibuka dalam hamparan.

Senarai tumbuhan dibaca seperti mana-mana fail dari luar: apa-apa yang tidak boleh digunakan ditinggalkan dan dikira.

## Tumbuhan dalam aplikasi lain

Senarai tumbuhan ialah satu pustaka untuk setiap aplikasi CadCraft: BimCraft dan ModelCraft membawa senarai yang sama, tetapi Letak dari pustaka mereka belum menawarkan tumbuhan. Setakat ini tumbuhan sampai ke model BIM melalui IFC landskap CivilCraft (setiap tumbuhan ialah `IfcGeographicElement`). Lihat [Penanaman](topic:planting#ifc).
