---
title: Masshtab boʻyicha oʻsimlik grafikasi, oʻz belgilaringiz va 3D oʻsimliklar
summary: Oʻsimliklar rejada har bir chizma masshtabi va tafsilot darajasida qanday chizilishi hamda oʻsimlikka oʻz belgingiz (SVG yoki DXF/DWG bloki) va oʻz 3D modelingiz (OBJ, STL yoki GLB) qanday biriktirilishi.
keywords: oʻsimlik grafikasi, oʻsimlik belgisi, masshtab boʻyicha belgi, tafsilot darajasi, oddiy doira, kontur, batafsil belgi, oʻz belgisi, blok, svg, dxf, dwg, 3D oʻsimlik, oʻz 3D modeli, obj, stl, glb, gltf, daraxt modeli, 3D da oʻsimliklar
from: 875837d9
---

## Masshtab boʻyicha reja belgilari

Landshaft › Yana › {{ui:Oʻsimlik grafikasi}} oʻsimliklar rejada qanday chizilishini belgilaydi. **Masshtab boʻyicha avtomatik** chizma masshtabidan uchta darajadan birini tanlaydi:

- **Oddiy doira** (1:500 dan kam batafsil masshtablarda): oʻsimlikning yoyilishi boʻyicha doira.
- **Markazi bilan kontur** (1:500 dan 1:200 gacha): doira va kichik markaziy xoch.
- **Batafsil belgi** (1:200 dan batafsil masshtablarda): yozuvda oʻz belgisi boʻlsa oʻsha, boʻlmasa oʻrnatilgan belgi.

Ikki masshtabni **1:dan boshlab oddiy** va **1:dan boshlab kontur** bilan oʻzgartiring yoki hamma masshtablar uchun bitta darajani tanlang. Varaqlar oynasidagi har bir varaqlar toʻplamida oʻz **Rejada oʻsimlik tafsiloti** bor, shuning uchun 1:500 saytning rejasi va 1:100 ekish rejasi farq qilishi mumkin. Sozlamalar loyiha bilan birga saqlanadi.

## Oʻz belgingiz

**Oʻsimliklar** boʻlimida oʻsimlikni tanlab {{ui:Oʻz belgisi…}} tugmasini bosing. U SVG yoki DXF/DWG chizmasining blokini oʻqiydi (chizmada bir nechta blok boʻlsa, birini tanlaysiz). Belgi oʻsimlikning yoyilishiga moslanadi va batafsil darajada chiziladi. U loyiha ichida saqlanadi, shuning uchun fayl u bilan birga koʻchadi.

- SVG dan chiziqlar, polichiziqlar, koʻpburchaklar, toʻgʻri toʻrtburchaklar, doiralar, ellipslar va yoʻllar oʻqiladi. Skriptlar, uslublar, havolalar va rasmlar hech qachon koʻrib chiqilmaydi. Transformatsiyalar qoʻllanmaydi: fayl ularni oʻz ichiga olsa, sizga xabar beriladi, shuning uchun avval ularni chizma dasturingizda tekislang.
- Chegaralar: 512 KB SVG va 2000 ta shakl. Katta fayl sababi bilan rad etiladi.

## Oʻz 3D oʻsimligingiz

Shu yozuvdagi {{ui:Oʻz 3D modeli…}} **OBJ**, **STL** yoki **GLB** faylni oʻqiydi. Keyin Oʻsimlik grafikasi da **3D dagi oʻsimliklar** ni **Har bir yozuvning oʻz modeli** ga oʻrnating: shu yozuvning har bir oʻsimligi sizning modelingizni balandligi va yoyilishiga moslab koʻrsatadi. Oʻz modeli boʻlmagan yozuvlar oʻrnatilgan shakllarni saqlaydi. Katta maydonlarni tez koʻrish uchun **Oddiy massalar** ni tanlang.

GLB faqat shakli uchun oʻqiladi:

- Modelga kerak boʻlgan hamma narsa .glb faylining ichida boʻlishi kerak. Boshqa fayllarga murojaat qiladigan model (alohida .bin yoki manzil boʻyicha rasmlar) rad etiladi: hech narsa yuklab olinmaydi.
- Siqilgan yoki qadoqlangan geometriya (Draco, meshopt, kvantlangan pozitsiyalar) oʻqilmaydi. Siqishsiz eksport qiling.
- Fayldagi teksturalar va ranglar ishlatilmaydi: model oʻsimlikning oʻz rangida chiziladi. Teksturalar baribir tekshiriladi, tomoni 4096 pikseldan katta tekstura rad etiladi.
- Chegaralar: 32 MB fayl, 50 000 uchburchak (bir necha marta joylashtirilgan qismning har bir nusxasi hisobga olinadi), 64 ta rasm va 16 MB rasm.

Har bir chegara faylni sababi bilan rad etadi; yarim oʻqilgan hech narsa saqlanmaydi. Bitta bekor qilish amali yozuvga belgi yoki model beradi, {{ui:Oʻz belgisini olib tashlash}} yoki {{ui:Oʻz 3D modelini olib tashlash}} esa uni yana olib tashlaydi.

Yozuv haqida qarang: [Oʻsimlik yozuvlari](topic:plant-records), va [Saytni 3D da koʻrish](topic:site-3d).
