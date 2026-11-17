---
title: LandXML: oʻqiladigan va yoziladigan narsalar
summary: CivilCraft oʻqiydigan va yozadigan LandXML 1.2 elementlari va atributlari, element boʻyicha, hamda u oʻtkazib yuboradigan hamma narsa.
keywords: landxml, xml, cgpoints, sirt, tin, chiziqlar, chegara, trassa, coordgeom, profil, profalign, pvi, paracurve, pipenetworks, struct, quvur, planfeatures, planfeature, xarakterli chiziq, sxema
from: ca3cf359
---

CivilCraft LandXML 1.2 ni rasmiy nom fazosi va sxema joylashuvi bilan yozadi. U ildiz elementi `LandXML` boʻlgan har qanday faylni oʻqiydi va quyidagi elementlarni nomi boʻyicha oladi (nom fazosi prefikslari eʼtiborga olinmaydi; versiya tekshirilmaydi). Uning XML oʻqigichi faqat beshta standart yozuvni va raqamli belgilar havolalarini qabul qiladi; u hech qachon DTD yoki tashqi faylni yuklamaydi. Qadamlar uchun qarang: [LandXML almashinuvi](topic:landxml).

LandXML koordinatalarni avval shimoliy oʻqi boʻyicha yozadi: nuqta "N E" yoki "N E Z" koʻrinishida boʻladi.

## Yoziladi

| Element | CivilCraft nimani yozadi |
|---|---|
| `Units` | `Imperial` (linearUnit USSurveyFoot, maydonlar kvadrat futda, hajmlar kub yardda, diametrlar dyuymda) yoki `Metric` (meter, kvadrat metr, kub metr, millimetr) |
| `Project` | `name` = loyiha nomi |
| `Application` | nomi CivilCraft, ishlab chiqaruvchi CadCraft |
| `CgPoints` / `CgPoint` | `name` = nuqta raqami, `desc` = tavsif, `code` = guruh; matn "N E Z" (yoki balandliksiz "N E") |
| `Alignments` / `Alignment` | `name`, `length`, `staStart` |
| `CoordGeom` / `Line` | `staStart`, `length`, `Start`, `End` |
| `CoordGeom` / `Curve` | `crvType` arc, `rot` cw yoki ccw, `radius`, `length`, `staStart`, `chord`, `delta` (gradus), `tangent`, `external`, `midOrd`; `Start`, `Center`, `End`, `PI` |
| `Profile` / `ProfSurf` | mavjud yer boʻylab trassa boʻyicha, stansiya va balandlik juftliklari sifatida (`PntList2D`), sirtdan chiqqan joyda boʻlinadi |
| `Profile` / `ProfAlign` | loyihalangan profil (`<trassa> design` nomi bilan): uchlari va burchak nuqtalari uchun `PVI`, vertikal egrilar uchun `length` bilan `ParaCurve` |
| `Surfaces` / `Surface` | `name` va `desc`; avval mavjud yer, soʻng pad yoki koridorlar yerni tekislaganda "Proposed" |
| `SourceData` / `Breaklines` / `Breakline` | `brkType` standard, `name`, `PntList3D` (faqat mavjud yer) |
| `SourceData` / `Boundaries` / `Boundary` | `bndType` outer, `edgeTrim` true, `PntList2D` (faqat mavjud yer, boʻlsa) |
| `Definition` | `surfType` TIN, `area2DSurf`, `area3DSurf`, `elevMax`, `elevMin`; `id` bilan `Pnts` / `P`; `Faces` / `F` |
| `PipeNetworks` / `PipeNetwork` | `name`, `pipeNetType` storm yoki sanitary |
| `Struct` | `name`, `elevRim` (ishlatilgan qirra: qoʻyilgan yoki sirtdan olingan), `elevSump`; `Center`; `diameter` bilan `CircStruct`; `elev`, `flowDir` in yoki out, `refPipe` bilan `Invert` |
| `Pipe` | `name`, `refStart`, `refEnd`, `length`, `slope`; `diameter` bilan `CircPipe` |
| `PlanFeatures` / `PlanFeature` | har bir xarakterli chiziq uchun bittadan: `name`; `Line` (`length`, `Start`, `End`) va `Curve` (`rot`, `crvType` arc, `radius`, `length`, `chord`, `delta`) bilan `CoordGeom`, `Start` va `End` "N E Z", `Center` "N E" sifatida; `Feature` `code="CivilCraft"` bilan, `Property` ishlatilishi va closed bilan |

Yozilmaydi: obyekt sifatidagi pad va koridorlar (ularning natijasi "Proposed" sirtida), xatosi bor trassalar, ikkala tubi boʻlmagan quvurlar, tarmoq qoidalari.

## Oʻqiladi

| Element | CivilCraft nimani oladi |
|---|---|
| `Units` | `Imperial` yoki `Metric` va uning `linearUnit` futmi yoki metrmi ekanini hal qiladi. Nomaʼlum birlik qayd etiladi. |
| `Project` | `name` loyiha nomiga aylanadi. |
| `CgPoints` / `CgPoint` (ichma-ich ham) | nomi (yoki `oID`), "N E" yoki "N E Z", tavsif sifatida `desc` (yoki `code`) |
| `Surface`, `Definition surfType="TIN"` bilan | `Pnts` va `Faces` mavjud yer sifatida (faqat birinchi sirt); koʻrinmas yoqlar (`i="1"`) chiqarib tashlanadi |
| `SourceData` / `Breaklines` | 3D xarakterli chiziqlar, sirt bilan saqlanadi |
| `SourceData` / `Boundaries` | tashqi chegara |
| `Alignment` / `CoordGeom` | `Line` va `Curve` elementlari; PI lar har bir egrining `PI` dan yoki uning `Center` va tangenslaridan qayta tiklanadi; `staStart` |
| `Profile` / `ProfAlign` | `PVI` va `ParaCurve` (`length` bilan); kamida ikkita PVI boʻlgan birinchi loyihalangan profil |
| `PlanFeatures` / `PlanFeature` | har biri xarakterli chiziq sifatida: `Line`, `Curve` (uning `Start`, `Center`, `End` va `rot`) va `IrregularLine` (`PntList3D` yoki `PntList2D`) uchma-uch ulangan (boʻshliq toʻgʻri kesma bilan ulanadi va qayd etiladi); boshlangan joyiga qaytsa yopiq; foydalanish va yopiqlik CivilCraft ning oʻz `Feature` idan olinadi, aks holda **Faqat chizilgan** |
| `Spiral` | `Curve` yonidagi klotoid spirallar (kirish va chiqish; PI sifatida radius va spiral uzunliklari bilan oʻqiladi, `theta`, `totalX`, `totalY`, `tanLong`, `tanShort`, `constant` bilan qaytariladi) |
| `PipeNetwork` | quvurlari boʻlgan birinchi tarmoq: `Struct` (`Center`, `elevRim`, `elevSump`, `CircStruct` diametri, har bir quvur uchun `Invert`) va `Pipe` (`refStart`, `refEnd`, `CircPipe` diametri) |

Balandligi boʻlmagan nuqtalar 0 oladi (qayd etiladi).

## Oʻtkazib yuboriladi va izohlarda nomlanadi

- Birinchisidan keyingi sirtlar, panjara sirtlar va TIN boʻlmagan boshqa sirtlar
- `IrregularLine` yoki `Chain` elementlari boʻlgan trassalar, klotoiddan boshqa spirallar, ikki egri orasidagi spiral yoki geometriyasi yoʻq trassalar
- Birinchisidan keyingi loyihalangan profillar; `CircCurve` va `UnsymParaCurve` vertikal egrilar (ularning PVI lari egrisiz saqlanadi)
- Faqat boshqa nuqtalarga ishora qiluvchi nuqtalar (`pntRef`) va oʻqilishi mumkin boʻlgan koordinatasiz nuqtalar
- Takrorlangan nuqta nomlari (birinchisi saqlanadi)
- Yashirish, koʻrsatish va maʼlumotni kesish chegaralari; 3D nuqtalarsiz xarakterli chiziqlar
- Birinchisidan keyingi quvur tarmoqlari; storm va sanitary dan boshqa tarmoq turlari (storm sifatida oʻqiladi)
- Toʻgʻri burchakli, kirish va chiqish tuzilmalari (dumaloq sifatida oʻqiladi); tuxum, ellips va quti shaklidagi quvurlar va kanallar (oʻlchamsiz dumaloq quvurlar sifatida oʻqiladi)
- Xarakterli chiziqlardagi `Spiral` elementlari
- `Parcels`, `Roadways`, `GradeModel` va `Survey`

Fayldagi yer profillari (`ProfSurf`) ishlatilmaydi: CivilCraft yerni sirtning oʻzidan oladi.

## Fayl ochilmasa xabarlar

| Xabar | Maʼnosi |
|---|---|
| "Bu XML, lekin LandXML emas (ildiz elementi <…>)." | Fayl boshqa turdagi XML. |
| "… CivilCraft oʻqiy oladigan nuqtalar, TIN sirtlar yoki trassalarga ega emas." | Fayldagi hamma narsa oʻtkazib yuborilganlar roʻyxatida. Undan keyingi izohlar nima boʻlganini aytadi. |
| "Mos kelmagan yakuniy teg …", "Yopilmagan teg …", "Fayl … ichida tugaydi" | Fayl buzilgan yoki qisqartirilgan. |
