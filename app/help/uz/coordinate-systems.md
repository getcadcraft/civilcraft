---
title: Loyihaning koordinatalar tizimini belgilang
summary: Geodezik suratning qaysi koordinatalar tizimida ekanini ayting, shunda CivilCraft kenglik va uzunlikni koʻrsatadi, GIS fayllarini va xarita qatlamlarini joylashtiradi hamda .prj fayllarini yozadi. Kod, nom, koordinatalarning oʻzi yoki .prj fayli boʻyicha tanlang.
keywords: koordinatalar tizimi, crs, epsg, srid, state plane, spcs, utm, nad83, wgs 84, proyeksiya, prj, wkt, datum, kenglik, uzunlik, lat long, geografik, toʻr, georeferencing, koordinatalar tizimini belgilash
from: 964250e2
---

Loyihaning koordinatalari siz ularning maʼnosini aytmaguningizcha oddiy raqamlardir. Koordinatalar tizimini belgilash **hech narsani hech qachon siljitmaydi**: u CivilCraft ga, masalan, E 6,150,000 N 2,080,000 AQSh geodezik futidagi Kaliforniya 6-zona state plane koordinatalari ekanini aytadi. Buni bilgach:

- holat satrida koʻrsatkichning kenglik va uzunligi koʻrsatiladi,
- boshqa tizimlardagi GIS fayllari (shapefile, GeoJSON, GeoPackage, balandlik toʻrlari, LiDAR) ochilganda loyihaga aylantiriladi,
- xarita qatlamlarini reja ostida chizish mumkin ([Reja ostida xarita qatlamlarini koʻrsatish](topic:map-layers)),
- GIS formatlariga eksport tizimni olib boradi (shapefile uchun `.prj`, GeoPackage va GeoTIFF uchun EPSG kodi).

## Tizimni tanlash

1. Asboblar panelidagi {{ui:GIS}} guruhida {{ui:Koordinatalar}} ni tanlang. **Koordinatalar tizimi** oynasi ochiladi. Yuqorida loyiha hozir qaysi tizimda ekani yoziladi yoki **Yoʻq — koordinatalar shunchaki raqamlar**.
2. Tizimni quyidagilardan biri bilan toping:
   - **Qidirish**: EPSG kodini (`2277`, `EPSG:2277`) yoki nomidagi soʻzlarni (`texas central`, `utm 14n`, `lambert-93`) kiriting. Kod kiritilgan qiymatdan boshlab roʻyxatlanadi; soʻzlar boʻyicha esa nomida barcha soʻzlar bor tizimlar chiqadi.
   - {{ui:Bu koordinatalarga mos tizimlar}} (loyihada nuqtalar yoki yuza boʻlganda): CivilCraft loyiha oʻlchov oilasining har bir tizimida loyihangizning oʻrtasini oʻqiydi va qoʻllanish sohasi uni oʻz ichiga olgan tizimlarni roʻyxatlaydi. State plane koordinatalari odatda bir nechta zonaga mos keladi: Texasdagi loyiha E 3,115,000 N 10,070,000 AQSh geodezik futida Texas Central ning toʻrtta variantiga (NAD83, NAD83(2011), HARN, NSRS2007) mos keladi. Har bir yozuvda loyihangizning oʻrtasi qayerda boʻlishi koʻrsatiladi.
   - **Yaqin (kenglik, uzunlik)** va {{ui:Taklif qilish}}: obyekt joylashgan joyni kiriting, masalan `30.27, -97.74` yoki `30°16′N 97°44′W`, va CivilCraft qoʻllanish sohasi uni oʻz ichiga olgan proyeksiyalangan tizimlarni roʻyxatlaydi, avval milliy va shtat toʻrlari.
   - {{ui:.prj faylini oʻqish…}}: shapefile yoki chizma bilan kelgan `.prj` ni oching. CivilCraft uni roʻyxatiga proyeksiya hisob-kitobi boʻyicha moslaydi (shuning uchun datumni boshqacha nomlagan `.prj` ham toʻgʻri tizimni topadi) va qaysi tizim ekanini aytadi; hech narsa aniq mos kelmasa, faylning oʻz tavsifi ishlatiladi. `.prj` ni oynaga ham tashlash, yoki uni alohida reja ustiga ochish yoki tashlash mumkin.
3. Roʻyxatdagi tizimni bosing. **Tanlangan** ostida nomi, EPSG kodi, birligi, uning datumi WGS 84 ga qanchalik yaxshi bogʻlanganligi, kenglik va uzunlikdagi qoʻllanish sohasi hamda loyihangizning oʻrtasi unda qayerga tushishi koʻrsatiladi.
4. **Toʻr** tanlangan holda qoldiring (koʻpchilik loyihalar uchun; boshqalari uchun [Yer va mahalliy koordinatalar](topic:ground-and-local-coordinates) ga qarang) va {{ui:Qoʻllash}} ni tanlang.

Endi holat satrida koʻrsatkichning kenglik va uzunligi E va N yonida koʻrsatiladi. Tizimni belgilash bitta ortga qaytarish qadami: {{key:Mod+Z}} uni qaytaradi.

:::note
Birliklar mos kelishi shart: futdagi loyiha AQSh geodezik futi yoki xalqaro futdagi tizimlarni, metrdagi loyiha esa metrdagi tizimlarni qabul qiladi. CivilCraft rad etishni tushuntiradi ("Loyiha futda, lekin bu tizim metrda…"). AQSh geodezik futi tizimiga ega futdagi loyiha geodezik futdan foydalanadi: loyihadagi "ft" tizimning futi degani. Geografik tizimlar (kenglik va uzunlik, masalan WGS 84 oʻzi) loyihaning tizimi boʻla olmaydi: chizmalarga sharqiy va shimoliy koordinatalar kerak.
:::

## Tizimni oʻzgartirish yoki olib tashlash

{{ui:Koordinatalar}} ni yana oching, boshqa tizimni tanlang va {{ui:Qoʻllash}} ni tanlang. Loyihada nuqtalar yoki loyiha boʻlsa, CivilCraft soʻraydi: **Koordinatalar allaqachon … tizimidami?**

- {{ui:Ha — hech narsa koʻchmaydi}}: raqamlar oʻz holicha qoladi, faqat ularning maʼnosi oʻzgaradi. Eski tizim xato bilan tanlangan boʻlsa, shuni ishlating.
- {{ui:Yoʻq — aylantirish}}: har bir geodezik nuqta, uzilish chizigʻi, chegara, trassa PI, maydoncha burchagi va inshoot eski tizimdan yangisiga aylantiriladi, bitta ortga qaytarish qadamida. LandXML dan uchburchaklar sifatida oʻqilgan yuzani aylantirib boʻlmaydi; uni avval nuqtalardan qayta quring.

{{ui:Tizimni olib tashlash}} tizimni olib tashlaydi (hech narsa siljimaydi). Loyihada allaqachon bor GIS qatlamlari oʻz joyida qoladi.

## Holat satrida kenglik va uzunlik

Loyihada tizim boʻlganda, holat satrida koʻrsatkichning WGS 84 dagi kenglik va uzunligi koʻrsatiladi, masalan `30°18′00.00″ N  97°42′00.00″ W`. Buning oʻrniga oʻnlik gradusni {{ui:Sozlamalar}}, {{ui:CivilCraft}} ostida, **Kenglik va uzunlik** ([CivilCraft sozlamalari](topic:settings)) dan tanlang. Yer yoki mahalliy koordinatalar bilan koʻrsatkich avval shu bosqichdan oʻtadi, shuning uchun u koʻrsatkich ostidagi nuqta uchun toʻgʻri boʻladi.

## Datum siljishi qanchalik aniq

Kenglik, uzunlik, GeoJSON va xarita qatlamlari barchasi WGS 84 da. Har bir tizimning WGS 84 ga bogʻlanishi oynada koʻrsatiladi:

| Oynada yozilgani | Bu nimani anglatadi |
|---|---|
| WGS 84 oʻzi | Umuman siljish yoʻq. |
| NAD83 WGS 84 deb qabul qilinadi | Ikkalasi Shimoliy Amerikaning koʻp qismida bir-ikki metrga farq qiladi, koʻpi bilan bir necha metr. Xarita qatlamlari va obyekt kontekstiga yaxshi; geodezik nazorat uchun emas. |
| Taxminan *n* m aniqligi maʼlum (EPSG raqami) | Eʼlon qilingan siljish; xarita qatlamlari va GeoJSON shuncha chetlashishi mumkin. |
| Bu datum uchun maʼlum emas | Toʻr fayli boʻlmasa, eʼlon qilingan siljish yoʻq: xarita qatlamlari va GeoJSON yuzlab metrga chetlashishi mumkin. |
| Toʻr siljish faylidan … | Toʻr siljish fayli ishlatilmoqda (quyida): toʻr ichida NAD83 dan taxminan 10 sm ichida. |

Loyihangizning oʻz koordinatalari hech qachon datum siljishidan oʻtmaydi: faqat kenglik va uzunlikka yoki ulardan aylantirilgan narsa oʻtadi. Vertikal datumlar va geoid modellari qayta ishlanmaydi (balandliklar hech qachon aylantirilmaydi). Eng yaxshi siljish toʻr faylini talab qilgan joyda roʻyxat oʻrtacha eʼlon qilingan siljishni beradi va oynada uning aniqligi koʻrsatiladi (masalan, NAD27 tizimlari uchun taxminan 20 m), toʻrni qoʻshguningizcha.

## Toʻr siljish fayllari

NAD27 tizimi uchun koordinatalar tizimi oynasidagi **Toʻr siljish fayli** kenglik va uzunlikni, GIS fayllarini va xarita qatlamlarini taxminan 20 m oʻrniga NAD83 dan taxminan 10 sm ichiga joylashtiradi:

- Tizim hududi uchun taklif qilingan toʻrni **Yuklab olish** (qoʻshni AQSh uchun NADCON5, Alyaska uchun NADCON, Kanada uchun NTv2) cdn.proj.org dan, PROJ ning ochiq toʻr serveridan. Faqat toʻr faylining nomi yuboriladi.
- Yoki sizda mavjud boʻlgan **Toʻr faylini qoʻshish…**: NTv2 (`.gsb`) yoki PROJ GeoTIFF toʻri (`.tif`), 20 MB gacha.

Toʻr loyiha faylida saqlanadi, shuning uchun u loyiha bilan birga oʻtadi. Boʻlim loyihaning oʻrtasi toʻr ichida ekanini koʻrsatadi: tashqarisida umuman siljish qoʻllanilmaydi, shuning uchun obyektni qamraydigan toʻrdan foydalaning. **Toʻrdan foydalanishni toʻxtatish** oddiy taxminiy siljishga qaytaradi. Har bir oʻzgarish bitta qadam: {{key:Mod+Z}} uni bekor qiladi.

Toʻr oʻzgarganda loyihada allaqachon bor GIS qatlamlari oʻz joyida qoladi; ularni toʻr orqali joylashtirish uchun qayta import qiling. Loyihaning oʻz koordinatalari hech qachon siljimaydi.

## Nima tekshirildi

- Har bir aylantirish 330 dan ortiq tizimda PROJ bilan (pyproj 3.7.1 va PROJ 9.5.1), eng koʻp GIS dasturlari ishlatadigan koordinatalar kutubxonasi bilan solishtirildi: AQSh geodezik futidagi va futdagi state plane, UTM shimoliy va janubiy, Lambert-93, British National Grid, GDA2020 MGA, Yangi Zelandiya Transverse Mercator va web Mercator va boshqalar. Sharqiy va shimoliy koordinatalar bir xil datum siljishida 1 sm gacha mos keladi (koʻpchilik holda 1 mm dan ham kam), proyeksiya hisob-kitoblari esa PROJ ning oʻz taʼriflari bilan 1 sm gacha mos keladi.
- PROJ yozgan ikki keng tarqalgan shakldagi (ESRI va OGC) `.prj` fayllari 105 ta tizim uchun qayta oʻqildi: 210 tadan 208 tasi aniq EPSG kodiga, qolgan ikkitasi bir xil ellipsoidda bir xil hisob-kitobga ega tizimga mos keldi. CivilCraft yozgan `.prj` fayllarini PROJ bir xil tizim sifatida oʻqiydi. Qutb stereografik tizimlari (UPS, Alyaska qutbi) uchun ESRI `.prj` fayllarini oʻqib boʻlmaydi; bu tizimlarni kod boʻyicha tanlang.
- Holat satridagi kenglik va uzunlik brauzerda PROJ bilan 0.01″ gacha mos keldi.
