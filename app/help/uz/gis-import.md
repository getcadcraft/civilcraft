---
title: GIS maʼlumotlarini import qilish
summary: Shapefile, GeoJSON va GeoPackage fayllarini loyihaga GIS qatlamlari sifatida kiriting, ularni toʻgʻri koordinatalar tizimi orqali joylashtiring, atributlarini koʻring va sirt uchun ishlating.
keywords: gis, yorliqlar, obyektlarni yorliqlash, kml, kmz, google earth, shapefile, shp, dbf, prj, zip, geojson, geopackage, gpkg, import, qatlamlar, atributlar, koordinatalar tizimi, epsg, kenglik, uzunlik, gorizontallar, uchastkalar, chegara chiziqlari, chegara
from: f6b235cc
---

Shahar va tuman GIS boʻlimlari saytga oid kontekstni GIS fayllari sifatida tarqatadi: uchastkalar, servitutlar, gorizontallar, kommunal tarmoqlar, geodezik tayanch nuqtalar. CivilCraft ulardan uch turini loyiha chizmangiz ostida rejada yotadigan **GIS qatlamlari** sifatida ochadi.

| Fayl | Nimani ochish |
|---|---|
| Shapefile | `.shp` faylini `.shx`, `.dbf`, `.prj` va `.cpg` fayllari bilan birga (hammasini tanlang) yoki ular kelgan `.zip` faylni. Bir nechta shapefile saqlovchi zip bir nechta qatlam beradi. |
| GeoJSON | `.geojson` fayli (birinchi satrlarida `FeatureCollection` yoki `Feature` yozilgan `.json` fayl ham ishlaydi). |
| GeoPackage | `.gpkg` fayli. Undagi har bir obyekt jadvali roʻyxatga olinadi. |
| KML yoki KMZ | `.kml` fayli (Google Earth yoki veb xaritadan) yoki zip qilingan `.kmz`. Har bir papka qatlamga aylanadi (bir nechta tur boʻlsa nuqtalar, chiziqlar va poligonlarga boʻlinadi); belgining nomi, tavsifi va kengaytirilgan maʼlumotlari uning atributlariga aylanadi. Balandliklar metersda, kenglik va uzunlik esa GeoJSON dagidek. |

Nuqtalar, multinuqtalar, chiziqlar, teshikli poligonlar va koʻp qismli shakllar oʻqiladi, fayl balandliklarni (z) saqlasa, ular bilan birga. Oʻlchov (M) qiymatlari chiqarib tashlanadi. Balandliklar setkalari va LiDAR ham xuddi shunday ochiladi: qarang [Balandliklar toʻrlari va LiDAR](topic:elevation-grids-and-lidar).

## Fayllarni ochish

1. **GIS** guruhida {{ui:Import}} tugmasini bosing (yoki {{ui:Open}}), fayllarni tanlang yoki ularni rejaga tashlang. Fayllar shu kompyuterda oʻqiladi; hech narsa yuklanmaydi.
2. **GIS maʼlumotlarini import qilish** muloqot oynasi topilgan har bir qatlamni roʻyxatlaydi: uning turi, obyektlar soni (va geometriyasi boʻlmaganlar soni), atribut ustunlari soni va fayl nomlagan koordinatalar tizimi. Kerak boʻlmagan qatlamlar belgisini olib tashlang.
3. **Koordinatalar tizimi** qismini (quyida) va **Nima boʻladi** qatorini oʻqing, soʻng {{ui:Import}} tugmasini bosing.
4. Qatlamlar rejada va chap paneldagi **GIS qatlamlari** ostida paydo boʻladi. Import bitta qadam: {{key:Mod+Z}} uni bekor qiladi.

Katta fayl rejaning ustida jarayon qatorini {{ui:Cancel}} tugmasi bilan koʻrsatadi.

## Koordinatalar tizimi

GIS fayllari oʻzlarining joylashuvini koordinatalar tizimi orqali bildiradi (shapefile ning `.prj` fayli, GeoPackage ning fazoviy maʼlumotnoma jadvali; GeoJSON doim kenglik va uzunlikda boʻladi). CivilCraft har bir qatlamni oʻz tizimidan loyiha tizimiga aylantiradi. U hech qachon taxmin qilmaydi:

- **Loyihada koordinatalar tizimi bor** ({{ui:Coordinates}} da belgilangan): oʻz tizimi bor har bir qatlam unga aylantiriladi, yer yoki mahalliy tuzatish bilan birga. `.prj` i yoʻq fayl ikkita tanlov oladi: **Loyiha bilan bir xil** (raqamlari oʻz holicha yuklanadi) yoki **Fayl tizimini tanlash**.
- **Loyihada tizim yoʻq, fayl esa loyiha birliklaridagi proyeksiyalangan tizimda** (masalan, feet loyihasi uchun US survey feet dagi davlat tekisligi zonasi): muloqot oynasi **Shu tizimni loyiha koordinatalar tizimi sifatida ishlatish** tanlovini taklif qiladi. U import bilan bir xil bekor qilish qadamida belgilanadi. Loyihadagi hech narsa siljimaydi; tizim faqat raqamlar nimani anglatishini bildiradi. Buning oʻrniga loyiha uchun boshqa tizim tanlashingiz mumkin, qatlamlar unga aylantiriladi.
- **Loyihada tizim yoʻq va fayl kenglik va uzunlikda** (har bir GeoJSON) **yoki boshqa birliklarda**: {{ui:Import}} loyihaning koordinatalar tizimini tanlamaguningizcha xira boʻlib qoladi. Tanlagich maʼlumotlar yaqinidan boshlanadi.
- **Na loyiha, na fayllar tizim nomlamagan**: raqamlar oʻz holicha yuklanadi va muloqot oynasi buni aytadi.

Balandliklar ham aylantiriladi: GeoJSON balandliklari metersda (GeoJSON standarti shunday deydi); boshqa fayllarning balandliklari oʻz tizimi birligida olinadi.

:::warning
GeoJSON faylidagi pozitsiyalar ±180° uzunlik yoki ±90° kenglik chegarasidan tashqarida boʻlsa, ular kenglik va uzunlik emas. Bunday obyektlar chiqarib tashlanadi va muloqot oynasi ularning sonini aytadi. Bunday fayl odatda tizimi saqlanmagan proyeksiyalangan fayl boʻladi; uni qayta soʻrang yoki `.prj` li shapefile ni soʻrang.
:::

NAD83 WGS 84 bilan bir xil deb hisoblanadi (GeoJSON ishlatadigan tizim); Shimoliy Amerikada ular bir necha metrga farq qiladi, shuning uchun GeoJSON maʼlumotlari shuncha metrga siljishi mumkin. Eng yaxshi siljish NADCON kabi setka faylini talab qilganda (masalan, NAD27 uchun), CivilCraft taxminiy nashr etilgan siljishdan foydalanadi va koordinatalar tizimi muloqot oynasi qanchalik taxminiy ekanini koʻrsatadi (NAD27 uchun taxminan 20 m), siz setka faylini qoʻshmaguningizcha: qarang [Setka siljish fayllari](topic:coordinate-systems).

## GIS qatlamlari

**GIS qatlamlari** ostidagi har bir qator quyidagilarga ega:

- qatlamni koʻrsatish yoki yashirish uchun katakcha (yashirin qatlamlar tanlanmaydi ham);
- rangi, roʻyxatdan tanlanadi;
- menyu (uchta nuqta) bilan {{ui:Zoom to}}, {{ui:Use for the surface…}}, {{ui:Rename…}} va {{ui:Remove}}.

Koʻrsatish, yashirish, qayta boʻyash, nomini oʻzgartirish va olib tashlash bekor qilinadigan qadamlardir. GIS qatlamlari loyiha faylida saqlanadi va uni ochganda qaytib keladi. Ular rejaning PDF chopiga hamda DXF va DWG eksportlariga ham chiqadi, har biri `GIS-` va uning raqami nomli qatlamda.

## Atributdan obyektlarni yorliqlash

Qatlamning {{ui:More}} menyusida (**GIS qatlamlari** dagi uchta nuqta) **Quyidagi bilan yorliqlash** ostida ustun tanlang: har bir obyekt oʻz qiymatini rejada qatlam rangida koʻrsatadi. Nuqtalar nuqta yonida, chiziqlar eng uzun qismining oʻrtasida (chapdan oʻngga oʻqish uchun burilgan), poligonlar esa markazida yoziladi. Raqamlar uchtagacha oʻnli kasr bilan koʻrsatiladi. Yorliqlar qogʻozda har qanday masshtabda 1.8 mm balandlikda boʻladi va PDF chop, DXF hamda DWG ga kiradi. Ularni olib tashlash uchun **Yorliqlar yoʻq** ni tanlang; har bir oʻzgarish bitta qadam ({{key:Mod+Z}} uni bekor qiladi). Qatlam eng koʻp 5,000 ta obyektni yorliqlaydi.

## Obyektga qarash

{{ui:Select}} yoqilgan boʻlsa, obyektni bosing. **Xususiyatlari** uning qatlamini, qaysi obyekt ekanini, shaklini (qismlari, teshiklari, nuqtalari), balandliklarini, u kelgan faylni va shu faylning koordinatalar tizimini, soʻng barcha atributlarni jadvalda koʻrsatadi. Atributlar faqat oʻqish uchun: CivilCraft GIS maʼlumotlarini kelganidek koʻrsatadi, ularni tahrirlamaydi.

Ikkalasi kursor ostida boʻlsa, nuqtalar chiziqlardan ustun turadi; poligon ichida eng kichik poligon tanlanadi.

## Sirt uchun ishlatish

Qatlam menyusini oching va {{ui:Use for the surface…}} ni tanlang (yoki **Xususiyatlari** dagi tugma). Taklif qilinadigani qatlamga bogʻliq:

| Qatlam | Aylanishi mumkin |
|---|---|
| Balandlikli chiziqlar (3D chiziqlar) | Chegara chiziqlari oʻz balandliklarida |
| Balandliksiz, lekin raqamli ustuni boʻlgan chiziqlar (gorizontallar) | Tanlagan ustundagi balandlikdagi chegara chiziqlari |
| Poligonlar | Sirt chegarasi (tanlangan poligon, aks holda eng katta) yoki ularning chekkalari boʻylab chegara chiziqlari |
| Balandlikli nuqtalar yoki balandlik ustuni bilan | Geodezik nuqtalar, qatlam nomi bilan tavsiflangan, shunda ular nuqtalar guruhini hosil qiladi |

Har bir foydalanish geometriyani loyihaga nusxalaydigan bitta bekor qilish qadami; qatlamning oʻzi oʻzgarishsiz qoladi. Balandliklar loyiha birliklarida olinadi.

## Kenglik va uzunlikli nuqta fayllari

Sarlavhasida **latitude** va **longitude** ustunlari (`lat`, `latitude`, `lon`, `long`, `longitude`) nomlangan nuqta fayli shimoliy va sharqiy koordinatalar emas, balki degrees sifatida oʻqiladi. Import muloqot oynasi buni aytadi. {{ui:Import}} da nuqtalar loyiha koordinatalar tizimiga aylantiriladi; loyihada tizim boʻlmasa, avval uni tanlashni soʻraydi. Degrees hech qachon feet sifatida yuklanmaydi. ±90° kenglik yoki ±180° uzunlik chegarasidan tashqaridagi qatorlar sababi bilan rad etiladi. Balandlik ustuni oʻz holicha, loyiha birliklarida olinadi.

## Koordinatalar tizimini nomlovchi LandXML fayllari

Ochgan LandXML faylida `CoordinateSystem` elementi (EPSG kodi, WKT tavsifi yoki tizim nomi) boʻlsa, CivilCraft uni loyiha koordinatalar tizimi sifatida taklif qiladi. Qabul qilsangiz hech narsa siljimaydi; tizim faqat raqamlar nimani anglatishini bildiradi.

## Tekshirilgan narsalar

- Har bir oʻqish moslamasi GDAL bilan solishtirildi — koʻpchilik GIS dasturlari shu fayllarni oʻqish uchun ishlatadigan kutubxona — GDAL yozgan fayllarda: har turdagi shapefile, balandlik bilan va balandliksiz, koʻp qismli chiziqlar, teshikli poligonlar, boʻsh geometriyalar, matn, raqam, sana va true/false atributlari, UTF-8 va Windows-1252 matnlari `.cpg` bilan va unda, bir nechta shapefile zip, har xil geometriya turidagi GeoJSON va toʻrtta jadvalli GeoPackage. Har bir geometriya, balandlik va atribut mos keldi.
- Kenglik va uzunlikdan hamda UTM dan aylantirilgan pozitsiyalar PROJ (GDAL ortidagi proyeksiya kutubxonasi) bilan 3 mm gacha mos keldi.
- Shikastlangan fayllar (qisqa kesilgan, oʻlchamlari yolgʻon, buzilgan zip, buzilgan GeoPackage) bitta oddiy xabar beradi; hech narsa osilib qolmaydi.
- Bu yerdagilar hali boshqa GIS dasturlarida ochilmagan; file geodatabase hali oʻqilmaydi, KML va KMZ esa oʻqilmaydi (qarang: [Hali qurilmagan](topic:not-built-yet)).
