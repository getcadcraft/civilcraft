---
title: Unit semasa import: fail menyatakan unitnya, atau anda ditanya dahulu
summary: Apabila lukisan atau jejaring yang anda bawa ke dalam projek menyatakan unitnya, CivilCraft menukarnya dan memaklumkannya. Apabila tidak, CivilCraft bertanya sebelum membacanya dan mengingati jawapan anda untuk fail itu.
keywords: unit, import, DWG, DXF, STL, OBJ, tinjauan, kaki, US survey feet, meter, milimeter, skala, saiz salah, terlalu besar, terlalu kecil, tanya, diingati, INSUNITS, unit lukisan
from: 60921963
---

## Apa yang akan anda lakukan

Bawa fail ke dalam projek dan pastikan ia masuk pada saiz yang betul.

## Langkah

1. Buka fail seperti biasa: {{ui:Buka}}, lepaskannya ke atas pelan, atau arahan lukisan CAD.
2. Jika fail menyatakan unitnya, tiada soalan ditanya: kotak dialog import memaparkannya sebagai **Seperti yang dinyatakan lukisan**.
3. Jika tidak, kotak dialog bertanya **Unit bagi** fail sebelum kotak dialog import dibuka. Pilih apa satu unit dalam fail itu dan klik {{ui:Guna unit ini}}.
4. {{ui:Batal}} (atau {{key:Esc}}) melangkau fail itu. Tiada apa-apa daripadanya dibaca ke dalam projek.

## Fail yang menyatakan unitnya

- **DWG dan DXF**: unit sisipan lukisan (`$INSUNITS`). Fail tanpanya akan ditanya. Senarai **Unit lukisan** dalam kotak dialog import bermula dengan jawapan anda dan masih boleh diubah.
- **STL dan OBJ** (bentuk landskap bebas): tidak pernah menyatakan unit. Anda akan ditanya.
- **Senarai titik** (CSV, TXT) dan senarai tinjauan kemajuan: senarai yang menyatakan unitnya dalam beberapa baris pertama ditukar, dan baris status memaklumkannya. Senarai yang tidak menyatakan apa-apa akan ditanya apabila anda menekan {{ui:Import}}, sebelum titik dimasukkan. Lajur latitud dan longitud melalui sistem koordinat.
- **Add-on Point clouds**: bertanya apabila anda membina awan yang failnya tidak menyatakan unit, dan melabel nombor awan dalam unit yang dibawanya.
- **IFC dan LandXML**: menyatakan unitnya; ia ditukar kepada unit projek.
- **LAS, LAZ dan raster ketinggian**: diletakkan mengikut sistem koordinatnya; kotak dialog rupa bumi bertanya unit ketinggian apabila fail tidak menyatakannya.

## Perkara yang perlu diketahui

- Jawapan diingati untuk fail itu pada komputer ini, dalam setiap aplikasi CadCraft. Kali seterusnya fail itu masuk, anda tidak akan ditanya.
- Untuk ditanya semula: palet arahan ({{key:Mod+K}}) › **Tanya semula unit bagi fail yang diimport**.
- Unit yang dinyatakan oleh senarai dibaca daripada lapan baris pertamanya: baris seperti `units: ft`, atau pengepala lajur yang semuanya membawa unit yang sama dalam kurungan, seperti `Elevation (m)`.
