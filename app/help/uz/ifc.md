---
title: IFC eksport va import
summary: Butun loyihani IFC 4.3, IFC4 yoki IFC2x3 formatida bitta IFC fayl sifatida saqlash (trassalar, yoʻllar, yer ishlari, yuzalar, devorlar, quvurlar), hamda IFC fayllarni ularning trassalari va yuzalari uchun ochish.
keywords: ifc, ifc 4.3, ifc4x3, ifc4, ifc2x3, openbim, bim, trassa, ifcalignment, yoʻl, ifcroad, yer ishlari, tin, yetkazib berish, xarid, eksport ifc, import ifc
from: 6b998bcf
---

IFC — koʻp davlat mijozlari topshiriq sifatida talab qiladigan ochiq almashinuv formati. CivilCraft butun loyihani bitta IFC faylga yozadi va IFC fayllardan trassalar hamda yuzalarni qayta oʻqiydi.

## Eksport

1. **Eksport** guruhidagi {{ui:IFC}} ni bosing (lenta uslublarida: {{ui:Chiqarish}} › {{ui:Eksport}} › {{ui:IFC}}).
2. Sxemani tanlang. **IFC 4.3 ADD2** birinchi va standart: u trassalar, yoʻllar va yer ishlarini oʻz ichiga olgan nashr. IFC4 yoki IFC2x3 ni faqat qabul qiluvchining dasturi 4.3 ni oʻqiy olmaganda tanlang.
3. Muloqot oynasi fayl nimani saqlashi va tanlangan sxema nimalarni tashlab ketishini aytadi. {{ui:IFC eksport}} ni bosing.
   Fayl "*loyiha nomi*-ifc4x3.ifc", "-ifc4.ifc" yoki "-ifc2x3.ifc" nomi bilan yuklab olinadi. CivilCraft oxirgi tanlagan sxemangizni eslab qoladi.

## Har bir sxema nimani saqlaydi

| | IFC 4.3 ADD2 | IFC4 | IFC2x3 |
|---|---|---|---|
| Trassalar | IfcAlignment gorizontal (chiziqlar, dumaloq yoylar, klotoid spirallar) va vertikal (qiyaliklar, parabolik egri chiziqlar) tuzilmalari bilan, ularning egri chiziqlari (IfcCompositeCurve, IfcGradientCurve), boshlangʻich stansiya va superelevatsiya hodisalari | Muhandislik elementidagi 3D polilinya | Proksidagi 3D polilinya |
| Yoʻlaklar | Yoʻl qismlari bilan IfcRoad; qatlamlar, yelkalar, ariqlar va trotuarlar IfcPavement sifatida, bordyurlar IfcKerb sifatida, koʻkalamzorlashtirish chiziqlari; har bir qoplama qatlami qalinligi, materiali va hajmi bilan IfcCourse sifatida; yon qiyaliklar kesish va toʻldirish hajmlari bilan IfcEarthworksCut va IfcEarthworksFill sifatida; loyihaviy tezlik va sinf | Nomi mohiyatiga koʻra berilgan muhandislik elementlari, har bir yoʻl boʻyicha guruhlangan | Proksilar, har bir yoʻl boʻyicha guruhlangan |
| Yuzalar | IfcGeographicElement TERRAIN uchburchaklangan notekis tarmoq bilan | Uchburchaklangan yuzlar toʻplamlari | Yuzaga asoslangan sirt modellari (kattaroq fayllar) |
| Maydonchalar va devorlar | Maydoncha yuqori qismi, uning qiyaliklari yer ishlari sifatida, tutib turuvchi devorlar IfcWall RETAININGWALL sifatida | Xuddi shunday, devor foydalanuvchi belgilagan devor turi sifatida | Xuddi shunday, devor turi ObjectType ichida |
| Quvur tarmoqlari | IfcDistributionSystem ichidagi IfcPipeSegment va IfcDistributionChamberElement | Xuddi shunday | IfcSystem ichidagi IfcFlowSegment va kameralar |
| Georeferensiya | IfcProjectedCRS va IfcMapConversion | Xuddi shunday | Saytdagi ePSet_ProjectedCRS va ePSet_MapConversion |

**Temir yoʻl** (Temir yoʻl yoqilgan trassa) IFC 4.3 ga IfcRailway sifatida kiradi: uning oʻtishlari oʻz turlari bilan (klotoid, kubik parabola, Bloss, Helmert, kosinus egri chizigʻi sifatida sinus yarim toʻlqini, sinus), kanti IfcAlignmentCant sifatida, yoʻli esa relslar, shpallar va balast toʻshamasi bilan, ostida qoʻshimcha balast bilan. IFC4 va IFC2x3 da xuddi shu qismlar muhandislik elementlari yoki proksilar sifatida boradi. IFC 4.3 temir yoʻlini ochganda uning oʻtishlari va kanti qayta tiklanadi.

Har bir faylda, bundan tashqari, uchastkalar (poydevor izlari), **Landshaft** ish maydonining oʻsimliklari va qattiq qoplamalari hamda bino massalari (har biri qavatlari bilan IfcBuilding) bir maydonda joylashadi. Xususiyatlar toʻplamlari loyihalashtirgan narsalaringizni saqlaydi: stansiyalar, yigʻma, kesish va toʻldirish qiyaliklari, yoʻl kengligi va qatorlar soni, ichki pastki sathlar, qopqoq sathlari, devor balandliklari; miqdorlar (uzunliklar, maydonlar, hajmlar) IfcElementQuantity toʻplamlari boʻladi.

## Birliklar va koordinatalar

Fayl loyihaning uzunlik birligida (metrlar yoki AQSH geodezik futlari); maydonlar va hajmlar kvadrat va kub metrlarda. Koordinata tizimi bilan (GIS › Koordinatalar) fayl xaritaga joylashtiriladi: uning boshlangʻich nuqtasining sharq va shimol koordinatalari hamda mahalliy (yer) tizimning burchagi va masshtabi xaritaga aylantirishda yoziladi. Usiz fayl oʻzining mahalliy boshlangʻich nuqtasini xususiyatlar toʻplamida saqlaydi va xaritaga joylashtirilmaydi.

## Import

.ifc faylni {{ui:Ochish}} bilan oching yoki rejaga tashlang. Import muloqot oynasi fayl nimani saqlashini aytadi:

- IFC 4.3 dan **trassalar** (gorizontal va vertikal tuzilmalar) hamda IFC 4x1 trassa egri chiziqlari CivilCraft trassalariga aylanadi, ularning PI, radiuslari, spiral uzunliklari va PVI lari bilan. CivilCraft ning PI modeli saqlay olmaydigan trassa (murakkab egri chiziqlar, ikki egri orasidagi spirallar, egri chiziqda boshlanadigan yoki tugaydigan trassa) import qilinmaydi, muloqot oynasi buning sababini aytadi.
- **Yuzalar**: mavjud yer boʻlishi uchun birini tanlang yoki loyihanikini saqlang.
- **Qolgan hammasi** (va boshqa yuzalar) 3D koʻrinishda havola sifatida koʻrsatilishi mumkin. Havola elementlari loyiha ochiq turganda qoladi; ular loyiha faylida saqlanmaydi.

CivilCraft tomonidan IFC4 yoki IFC2x3 formatida yozilgan fayl trassalarini xususiyatlar toʻplamlaridan aniq qayta tiklaydi.

## Hali amalga oshirilmagan

- Yoʻlning superelevatsiyasi superelevatsiya hodisalari sifatida va yoʻl yuzalarida yoziladi (kant temir yoʻllar uchun).
- Havola elementlarini loyiha faylida saqlash, shuningdek quvur tarmoqlari yoki maydonchalarni IFC dan tahrirlanadigan obyektlar sifatida import qilish.
