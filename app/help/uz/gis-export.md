---
title: GIS uchun as-built maʼlumotlarini eksport qilish
summary: Nuqtalar, gorizontallar, trassalar, maydonchalar, quvurlar va inshootlarni shahar yoki tuman GIS boʻlimiga shapefile, GeoPackage, GeoJSON yoki KML sifatida topshiring — loyiha koordinatalar tizimining setka koordinatalarida.
keywords: gis, eksport, kml, kmz, google earth, as-built, asbuilt, shapefile, shp, zip, geopackage, gpkg, geojson, quvurlar, inshootlar, kommunal tarmoqlar, shahar, tuman, setka, yer, epsg, prj
from: bba4fea5
---

Koʻp shaharlar va tumanlar loyiha yopilganda as-built maʼlumotlarini GIS formatida soʻraydi: quvurlar va inshootlar qayerga joylashtirilgani, yakuniy qiyaliklar, yoʻl oʻq chizigʻi. **GIS › Eksport** CivilCraft saqlaydigan narsalarni har bir obyekt turi uchun bitta GIS qatlami sifatida yozadi.

## Eksport qilishdan oldin

1. Loyihaning koordinatalar tizimini {{ui:Coordinates}} da belgilang. GIS boʻlimi raqamlar qayerdaligini bilishi kerak; tizimsiz fayllarda loyihaning oʻz raqamlari boʻladi va hech qanday nom boʻlmaydi.
2. Sirt, trassalar, maydonchalar va quvur tarmogʻini topshirmoqchi boʻlgan shaklda tekshiring.
3. Boʻlimdan qaysi formatni va qaysi koordinatalar tizimini xohlashini soʻrang. Koʻpchiligi hali ham mahalliy davlat tekisligi zonasidagi shapefile ni soʻraydi; yangi tizimlar GeoPackage ni qabul qiladi.

## Eksport

1. **GIS** guruhida {{ui:Export}} tugmasini bosing.
2. **Nima** ostida yuboriladigan turlarni belgilang. Har biri nechta obyektga ega ekanini koʻrsatadi; hali hech narsasi boʻlmagan turlar xira koʻrinadi.
3. **Format** ostida formatni tanlang.
4. Koordinatalar va birliklar haqidagi izohlarni oʻqing, soʻng yuklab olish tugmasini bosing. Holat qatorida nima kiritilgani va qisqartirilgan ustun nomlari aytiladi.

Muloqot oynasida balandliklar setkasini eksport qilish ham bor ({{ui:Surface as a GeoTIFF elevation grid}}); qarang: [Balandliklar toʻrlari va LiDAR](topic:elevation-grids-and-lidar).

## Har bir tur nimani saqlaydi

| Tur | Shakl | Ustunlar |
|---|---|---|
| Geodezik nuqtalar | Balandlikli nuqtalar | `P` nuqta raqami, `N` shimoliy koordinata, `E` sharqiy koordinata, `Z` balandlik, `D` tavsif |
| Mavjud yer gorizontallari, loyihalangan sirt gorizontallari | Balandligida chiziqlar | `ELEV` |
| Chegara chiziqlari | Balandlikli chiziqlar | `NAME` |
| Sirt chegarasi | Poligon (chizilgan chegara, aks holda sirtning chekkasi) | `NAME` |
| Trassalar | Oʻq chiziqlari | `NAME`, `LENGTH`, `STA_START`, `STA_END` (piketlar oddiy raqamlar sifatida) |
| Maydonchalar | Maydoncha balandligidagi poligonlar | `NAME`, `ELEV`, `AREA` |
| Yerga chiqish chiziqlari | Balandlikli chiziqlar (maydonchalar va koridorlar) | `NAME` |
| Koridor xususiyat chiziqlari | Balandlikli chiziqlar: oʻq, qoplama chekkalari, yoʻl chekkalari | `NAME`, `CODE` (CL, EOP_L, EOP_R, SH_L, SH_R) |
| Quvurlar | Yuqori ichki tubidan quyi ichki tubigacha chiziqlar | `NAME`, `FROM`, `TO`, `DIA`, `DIA_UNIT`, `INV_UP`, `INV_DN`, `SLOPE` (foizda), `LENGTH`, `NETWORK` |
| Inshootlar | Qopqoq qirrasidagi nuqtalar | `NAME`, `RIM`, `INVERT` (u yerdagi eng past quvur ichki tubi), `SUMP`, `DIA`, `DIA_UNIT` |
| Har bir GIS qatlami | Import qilinganidek | Oʻz ustunlari |

Uzunliklar, piketlar va balandliklar loyiha birliklarida (US survey feet yoki metres). Quvur va inshoot diametrlari feet loyihalarida inches, metr loyihalarida millimetres da; `DIA_UNIT` qaysi biri ekanini koʻrsatadi.

## Formatlar

- **Shapefile**: bitta `.zip` faylda har bir tur uchun shapefile (`.shp`, `.shx`, `.dbf`), matn UTF-8 ekanini bildiruvchi `.cpg` va koordinatalar tizimini nomlovchi `.prj`. Balandlikli shakllar shapefile ning Z turlari sifatida yoziladi. Ustun nomlari 10 belgidan uzun boʻlsa, format talab qilganidek qisqartiriladi, holat qatori esa ularni sanab beradi.
- **GeoPackage**: har bir tur uchun jadvali boʻlgan bitta `.gpkg` fayl, koordinatalar tizimi EPSG kodi bilan saqlangan. Koʻp fayl oʻrniga bitta fayl, uzun ustun nomlari saqlanadi.
- **KML** yoki **KMZ** (zip qilingan KML): Google Earth va veb xaritalar uchun kenglik va uzunlikdagi bitta fayl, har bir tur uchun papka, har bir obyekt NAME ustunidan nomlangan belgi, har bir ustun kengaytirilgan maʼlumot sifatida; balandliklar metersda (balandlik rejimi: absolute). GeoJSON kabi loyihaning koordinatalar tizimi kerak.
- **GeoJSON**: kenglik va uzunlikdagi bitta fayl (GeoJSON standarti boshqasiga ruxsat bermaydi), har bir obyektda `kind` xususiyati (`pipes`, `structures`, …) boʻlib, qabul qiluvchi ularni ajrata oladi. Balandliklar standart talab qilganidek metrga aylantiriladi; ular loyihangizning vertikal datumida qoladi (CivilCraft geoid modeliga ega emas). Koordinatalar tizimi boʻlmagan loyiha GeoJSON ni eksport qila olmaydi va muloqot oynasi sababini aytadi.

## Setka, yer emas

GIS boʻlimlari maʼlumotlarini koordinatalar tizimining **setka** koordinatalarida saqlaydi. Agar loyihangiz yer yoki mahalliy koordinatalardan foydalansa ({{ui:Coordinates}} da belgilangan), har bir koordinata chiqishda setkaga qaytariladi: fayllardagi raqamlar reja raqamlaridan masshtab koeffitsientingiz (va mahalliy tizim uchun burilish) bilan farq qiladi. `N` va `E` nuqta ustunlari ham setka qiymatlarini saqlaydi. Muloqot oynasi buni eslatadi.

:::tip
Fayllar bilan qisqa izoh yuboring: koordinatalar tizimi va uning EPSG kodi, balandliklaringizning vertikal datumi, birliklar hamda har bir fayl nimani aks ettirishi.
:::

## Tekshirilgan narsalar

- Yozilgan har bir fayl GDAL orqali qayta oʻqildi — koʻpchilik GIS dasturlari shu fayllarni oʻqish uchun ishlatadigan kutubxona: har bir shakl, balandlik va atribut, obyektlar soni va koordinatalar tizimi EPSG kodi sifatida (`.prj` va GeoPackage). Bizning oʻquvchilarimiz ham ularni xuddi shunday oʻqidi.
- GeoJSON fayllari RFC 7946 ga amal qiladi: avval uzunlik, keyin kenglik, `crs` elementi yoʻq, tashqi halqalar soat strelkasiga qarshi, teshiklar soat strelkasi boʻyicha; pozitsiyalar PROJ bilan 2 mm gacha mos keldi.
- Yer koordinatali loyiha eksport qilindi va har bir nuqta setka koordinatalari bilan tekshirildi.
- Bu yerdagilar hali boshqa GIS dasturlarida ochilmagan. Birinchi yetkazib berishni boʻlim bilan tekshirib, soʻngra ishoning.
