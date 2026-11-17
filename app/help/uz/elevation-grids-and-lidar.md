---
title: Balandlik toʻrlari va LiDAR
summary: DEM (GeoTIFF yoki ASCII toʻr) yoki LiDAR nuqtalaridan (LAS, LAZ) mavjud yer sathini qurish: maydonni tanlang, maʼlumotni siyraklashtiring, sinflarni tanlang va balandlik birliklarini tekshiring. Sirtni GeoTIFF balandlik toʻri sifatida qaytaring.
keywords: dem, dtm, balandlik toʻri, geotiff, tif, ascii grid, asc, lidar, las, laz, nuqta buluti, sinflar, yer, siyraklashtirish, nodata, raster, geotiff eksport, gis
from: c8b2d18a
---

Ommaviy balandlik maʼlumotlari ikki yoʻl bilan keladi: **balandlik toʻrlari** (DEM: har bir kvadrat katakka bitta balandlik, odatda GeoTIFF `.tif` yoki ASCII toʻr `.asc`) va **LiDAR nuqtalari** (`.las` faylidagi million lazer qaytishlari, siqilgan boʻlsa `.laz`). CivilCraft ikkalasini ham brauzer ichida geodezik nuqtalarga yoki sirtga aylantiradi: hech narsa serverga yuborilmaydi.

## Faylni ochish

1. {{ui:Open}} tugmasini bosing (yoki GIS guruhidagi {{ui:Import}} ni) va faylni tanlang yoki uni rejaga torting. ASCII toʻr uchun uning `.prj` faylini ham tanlang, shunda CivilCraft koordinatalar tizimini biladi.
2. Import oynasi fayl oʻzi haqida nima deyishini koʻrsatadi: hajmi, katakchalari yoki nuqtalari, koordinatalar tizimi, kenglik va uzunlik boʻyicha joylashuvi hamda balandlik diapazoni. LiDAR uchun u avval **sinflarni** sanash uchun har bir nuqtani bir marta oʻqiydi (progress paneli qancha qolganini koʻrsatadi; {{ui:Cancel}} uni toʻxtatadi).

GeoTIFF uch yoki toʻrt kanalli (qizil, yashil, koʻk) boʻlsa, u rasm, balandlik emas: u oʻrniga xarita qatlamlariga boradi.

## Nimani olib kirishni tanlash

- **Maydon**: {{ui:The project’s extents and a margin}} (zaxirani kiriting), {{ui:What the plan shows now}} yoki {{ui:The whole file}}. Faylning faqat shu qismi oʻqiladi.
- **Siyraklashtirish**: loyiha birliklarida olingan nuqtalar orasidagi masofa. Sozlamalar ostidagi chiziq yozayotganingizda shuncha nuqta chiqishini koʻrsatadi. Toʻr uchun CivilCraft har ikkinchi, uchinchi ... katakchani saqlaydi, shuning uchun balandliklar fayldagidek qoladi; u katakchalarni hech qachon oʻrtachalamaydi. LiDAR uchun maydon shu oʻlchamdagi kvadratlarga boʻlinadi va har bir kvadratda bitta nuqta qoldiriladi: {{ui:The point nearest each cell’s center}} (standart), {{ui:The lowest point in each cell}} (fayl yer sinfiga ega boʻlmaganda yaxshi: yer daraxtlar ostida) yoki {{ui:The average of each cell’s points}}.
- **Sinflar** (LiDAR): yer (2-sinf) fayl unga ega boʻlsa belgilanadi; binolar, daraxtlar va shovqin chiqarib tashlanadi. Yer sinfi boʻlmasa, hamma sinflar belgilanadi va oyna buni aytadi.
- **Yer** (LiDAR, 0.8): dron buluti yer sinfiga ega emas. Fayl unga ega boʻlmasa, oyna {{ui:Find the ground myself (drone clouds, no ground class)}} dan boshlanadi: shovqindan tashqari hamma sinflar oʻqiladi, har bir katakdagi eng past nuqta saqlanadi, soʻng CivilCraft binolar, daraxtlar va tasodifiy past nuqtalarni progressiv morfologik filtr (Zhang va boshqalar, 2003) bilan chiqarib tashlaydi. Filtrni siz boshqarasiz: **Chiqarib tashlanadigan eng katta obyekt** (eng katta binoning kengligi; derazalar uni qoplaguncha oshadi; 0 degani 20 katak) va **Eng tik yer qiyaligi**. Ish eng past nuqtalar toʻrida bajariladi, shuning uchun oʻn million nuqtali bulut katakchalar sonidan koʻp xarajat qilmaydi (siyraklashtirish bitta oqim oʻtishi). Oraliq katak oʻlchamidir: kattaroq katak tezroq va kichik obyektlarni kutganingizdan kamroq oʻtkazib yuboradi, kichikroq katak yer tafsilotlarini koʻproq saqlaydi. Hisobotda necha nuqta yer sifatida saqlangani, necha katak obyekt sifatida chiqarib tashlangani va necha tasodifiy past nuqta tashlab yuborilgani aytiladi. 300 m dron soʻrovida beshta bino, 70 daraxt va 200 ta past chetga chiqqan nuqta bilan oʻtkazilgan sinovda saqlangan nuqtalar haqiqiy relyefdan 3 cm ichida chiqdi va hech bir tom yoki shox saqlanmadi.
- **Fayldagi balandliklar**: metr, fut yoki US survey feet. Fayl buni aytsa, birlik allaqachon tanlangan boʻladi. Aytmasa, tanlashingiz kerak: oyna balandlik diapazonini ikki yoʻlda koʻrsatadi, shunda saytga qaysi biri mos kelishini ajrata olasiz.
- **Import as** (faqat toʻrlar uchun): {{ui:Survey points (description DEM)}} yoki {{ui:The surface itself (a grid of triangles)}}.

Bitta importda eng koʻpi 500,000 nuqta boʻlishi mumkin. Tanlov bundan koʻpini bersa, oyna qancha ortiqcha ekanini va qaysi oraliq mos kelishini aytadi, {{ui:Import}} esa oʻchiq qoladi.

{{ui:Import}} tugmasini bosing. Progress paneli oʻqishni koʻrsatadi; {{ui:Cancel}} uni toʻxtatadi va hech narsa oʻzgarmaydi.

:::warning
Vertikal birliklar keng tarqalgan tuzoq. Koʻp davlat tekisligi DEM larida easting va northing futda, lekin balandliklar metrda boʻladi. Oyna koʻrsatgan diapazonni sayt haqidagi bilimingiz bilan solishtiring.
:::

## Nima olasiz

- **Geodezik nuqtalar**: eng yuqori nuqta raqamingizdan keyin raqamlanadi, tavsifi `DEM` (toʻrlar) yoki `LIDAR`. Shuning uchun ular **Nuqtalar** ostida bitta nuqtalar guruhini tashkil qiladi va boshqa nuqtalar kabi sirtni quradi. Ularni import qilish bitta qadam: {{key:Mod+Z}} ularni yana olib tashlaydi.
- **Sirtning oʻzi**: toʻr TIN, har bir katakka ikkita uchburchak, janubi-gʻarbdan shimoli-sharqqa diagonal boʻylab boʻlingan. Maʼlumoti yoʻq burchakli uchburchak chiqarib tashlanadi, shuning uchun maʼlumotlardagi boʻshliqlar boʻshliq boʻlib qoladi. Sirt har bir toʻr nuqtasida toʻrga teng, ular orasidagi har bir uchburchak ichida esa tekis tekislik. U loyihaning sirtini almashtiradi (oyna avval soʻraydi); {{key:Mod+Z}} oldingi sirtni qaytaradi. Chap panel sarlavhasi **Sirt (balandlik toʻridan)** deb yoziladi.

## Koordinatalar tizimlari

- Loyihada koordinatalar tizimi bor va fayl boshqasini nomlasa, har bir nuqta loyiha tizimiga aylantiriladi (va bor boʻlsa, yer yoki mahalliy koordinatalarga ham).
- Loyihada tizim yoʻq va faylning tizimi loyiha birliklarida (fut yoki metr) boʻlsa, oyna uni loyihaning koordinatalar tizimi qilishni taklif qiladi, nuqtalar bilan bir xil bekor qilish qadamida.
- Fayl kenglik va uzunlikda yoki futli loyihada metrda boʻlsa, oyna avval loyihaning koordinatalar tizimini tanlashingizni soʻraydi.
- Fayl aytmasa, uning raqamlari loyiha koordinatalari deb olinadi. Faylning tizimini tanlashingiz mumkin.

## Balandlik toʻrini GeoTIFF sifatida eksport qilish

1. GIS guruhida {{ui:Export}} ni bosing.
2. GeoTIFF qismida sirtni (mavjud yer yoki tekislangan sirt) va katak oʻlchamini tanlang. Standart qiymat sirtning oʻrtacha uchburchak qirrasidan olinadi. Oyna yoziladigan toʻr oʻlchamini koʻrsatadi.
3. {{ui:Download GeoTIFF}} ni bosing.

Fayl loyiha birliklaridagi 32-bitli suzuvchi nuqtali balandliklarning bitta kanali, sirt hajmida. Sirtdan tashqaridagi katakchalar "maʼlumot yoʻq" (−3.4028235e38). Har bir katak qiymati katak markazidagi sirt balandligi. Koordinatalar **toʻr** koordinatalari: yer yoki mahalliy koordinatalardagi loyiha toʻrga qaytariladi. Fayl loyiha koordinatalar tizimini EPSG kodi bilan nomlaydi; EPSG kodi boʻlmagan tizim yozilmaydi va oyna GIS boʻlimiga qaysi tizim ekanini aytishni ogohlantiradi.

## Tekshirilgan

- GeoTIFF va ASCII toʻr oʻqigichlari GDAL (rasterio orqali) bilan tekshirildi: 32-bitli suzuvchi nuqtali va 16-bitli butun toʻrlar, plitkali va chiziqli, DEFLATE va LZW, nodata, masshtab va siljish, pixel-is-point, UTM toʻri, AQSh geodezik futidagi davlat tekisligi toʻri va kenglik/uzunlik toʻri. Har bir qiymat teng chiqdi.
- LAS va LAZ oʻqigichlari laspy bilan tekshirildi: LAS 1.2 va 1.4, nuqta formatlari 0, 1, 3, 6, 7 va 8, koordinatalar tizimi bilan va unisiz, LASzip mos orqa tizim bilan yozilgan LAZ. Har bir nuqta teng chiqdi.
- Aylantirilgan koordinatalar PROJ bilan 1 mm gacha tekshirildi.
- Eksport qilingan GeoTIFF lar GDAL bilan qayta oʻqildi: koordinatalar tizimi, katak joylashuvi, nodata, birliklar va qiymatlar sirt bilan 0.0001 gacha teng.
- Bularning hech biri boshqa GIS yoki CAD dasturlarida ochilmagan.

## Hali qurilmagan

- Vertikal datum oʻzgarishlari (geoid modellari): balandliklar fayldagidek ishlatiladi.
- Toʻlqin shakli maʼlumotlari, sinf boʻyicha boʻlmagan LiDAR qaytishlari, ranglar va intensivliklar.
- Bir nechta kanal, overview lar yoki 200 MB dan katta fayllar.
- Sirtdan yoki bu vositadan LAS yoki LAZ yozish ([Nuqta buluti](topic:point-clouds) qoʻshimchasi tozalangan bulutni LAS 1.4 yoki LAZ sifatida yozadi).
