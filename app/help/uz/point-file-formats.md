---
title: Nuqta fayl formatlari
summary: CivilCraft oʻqiydigan ustun tartiblari, ajratgich va sarlavha qatorini qanday topishi, tanilgan sarlavha nomlari hamda qatorlar qanday tekshirilishi.
keywords: pnezd, penzd, pnez, penz, nezd, enzd, nez, enz, csv, txt, pnt, xyz, nuqta fayl formati, ustunlar, sarlavha, ajratgich
from: 84fab42e
---

Nuqta fayli oddiy matn boʻlib, har bir qatorda bitta nuqta boʻladi. CivilCraft uni brauzerda oʻqiydi; hech narsa yuklanmaydi.

## Ustun tartiblari

Harflar ustunlarni chapdan oʻngga qarab nomlaydi: **P** nuqta raqami yoki nomi, **N** shimoliy koordinata (northing), **E** sharqiy koordinata (easting), **Z** balandlik, **D** tavsif.

| Tartib | Ustunlar | Namunaviy qator |
|---|---|---|
| PNEZD | nuqta, shimoliy, sharqiy, balandlik, tavsif | `101,2080000.00,6150000.00,250.00,GRD` |
| PENZD | nuqta, sharqiy, shimoliy, balandlik, tavsif | `101,6150000.00,2080000.00,250.00,GRD` |
| PNEZ | nuqta, shimoliy, sharqiy, balandlik | `101,2080000.00,6150000.00,250.00` |
| PENZ | nuqta, sharqiy, shimoliy, balandlik | `101,6150000.00,2080000.00,250.00` |
| NEZD | shimoliy, sharqiy, balandlik, tavsif | `2080000.00,6150000.00,250.00,GRD` |
| ENZD | sharqiy, shimoliy, balandlik, tavsif | `6150000.00,2080000.00,250.00,GRD` |
| NEZ | shimoliy, sharqiy, balandlik | `2080000.00 6150000.00 250.00` |
| ENZ | sharqiy, shimoliy, balandlik | `6150000.00 2080000.00 250.00` |

P harfisiz tartiblarda nuqtalar fayldagi tartibda 1, 2, 3 … deb raqamlanadi. X sharqiy koordinata, Y shimoliy koordinata.

## Ajratgichlar

CivilCraft birinchi 20 qatorga qaraydi va ulardan kamida 60% da uchraydigan birinchi belgini tanlaydi: vergul, tabulyatsiya, nuqtali vergul. Aks holda boʻshliqlar ketma-ketligi boʻyicha ajratadi.

- Vergul, tabulyatsiya va nuqtali vergulli fayllarda qoʻshtirnoq ichidagi maydon ajratgich belgisini oʻz ichiga olishi mumkin (`"FL, NORTH"`), va qoʻshtirnoq ichidagi `""` bitta qoʻshtirnoq belgisi hisoblanadi.
- Boʻshliqli fayllarda qator oxiridagi tavsif boʻshliqlarni saqlashi mumkin: oxirgi koordinata ustunidan keyingi hamma narsa tavsif hisoblanadi.
- `#`, `;` yoki `//` bilan boshlangan qatorlar va boʻsh qatorlar oʻtkazib yuboriladi.
- Fayl boshidagi bayt tartibi belgisi (BOM) eʼtiborga olinmaydi.

## Sarlavha qatori

Birinchi qator sarlavha deb hisoblanadi, agar uning maydonlarining ikkitadan kamrogʻi son boʻlsa. Agar sarlavhaning har bir maydoni CivilCraft tanigan nom boʻlsa, ustun tartibi undan olinadi ("sarlavha qatoridan"). Nomlar katta-kichik harf, boʻshliq, nuqta, pastki chiziq, defis va qavslarga eʼtibor berilmay solishtiriladi:

| Ustun | Tanilgan nomlar |
|---|---|
| P | pt, pnt, point, point no, point number, number, no, id, name, pt#, point#, # |
| N | n, north, northing, y, y coord, lat, latitude |
| E | e, east, easting, x, x coord, lon, long, longitude |
| Z | z, elev, elevation, el, height, h, z coord, rl |
| D | d, desc, description, code, raw description, full description, note, notes, feature |

Agar sarlavha nomlaridan biri tanilmasa yoki nomlar sakkizta tartibdan birini hosil qilmasa, sarlavha oʻtkazib yuboriladi va tartib ustunlar soniga qarab taxmin qilinadi.

:::warning
Agar sarlavhada ham kenglik ustuni (`lat`, `latitude`), ham uzunlik ustuni (`lon`, `long`, `longitude`) koʻrsatilgan boʻlsa, ular gradusda oʻqiladi, shimoliy va sharqiy koordinata sifatida emas. {{ui:Import}} da nuqtalar loyihaning koordinata tizimi orqali aylantiriladi, unga ega boʻlmagan loyiha avval uni tanlashingizni soʻraydi. ±90° kenglikdan yoki ±180° uzunlikdan tashqaridagi qatorlar rad etiladi. Qarang: [GIS maʼlumotlarini import qilish](topic:gis-import#point-files-with-latitude-and-longitude).
:::

## Ustunlar soni boʻyicha taxmin

Foydali sarlavha boʻlmasa va **Ustunlar** {{ui:Detect}} da qolsa:

- 5 yoki undan koʻp ustun: PNEZD.
- 4 ustun: birinchi ustun tekshirilgan har bir qatorda butun son boʻlsa va toʻrtinchisi son boʻlsa PNEZ; aks holda NEZD.
- 3 ustun: NEZ.

PNEZD va PENZD raqamlardan ajratilmaydi. Taxmin [CivilCraft sozlamalari](topic:settings) dagi **Nuqta qatorlari** boʻyicha amalga oshiriladi: boshida P, N, E, Z, D yoki P, E, N, Z, D (keyin toʻrt ustun PENZ, uch ustun ENZ deb oʻqiladi). Dialog shunday deydi: "ustunlar soniga qarab taxmin qilindi, shimoliy va sharqiy koordinatalar almashtirilmaganini tekshiring". Agar koʻrinish notoʻgʻri boʻlsa, **Ustunlar** da toʻgʻri tartibni tanlang.

## Qatorlar qanday tekshiriladi

- Qator tavsifni tashlab ketishi mumkin.
- Shimoliy va sharqiy koordinatalar son boʻlishi shart. Balandlik boʻsh boʻlishi mumkin (nuqta saqlanadi, lekin sirtda ishlatilmaydi).
- Nuqta raqami istalgan matn boʻlishi mumkin (harflar ham, masalan `CP1`), lekin boʻsh boʻlmasligi kerak.
- Agar nuqta raqami takrorlansa, birinchi qator saqlanadi, qolganlari oʻqilmagan deb roʻyxatga olinadi.
- Tavsiflar 200 belgigacha saqlanadi; boshqaruv belgilari boʻshliqqa aylanadi.
- Dialog uchun 200 tagacha oʻqilmagan qator saqlanadi (25 tasi koʻrsatiladi), ularning hammasi sanaladi.

## Nuqtalar guruhlari

Nuqtaning guruhi uning tavsifidagi birinchi soʻz, bosh harflarda. "GRD", "grd shot" va "Grd" barchasi GRD guruhiga kiradi. Tavsifi boʻlmagan nuqta "(tavsif yoʻq)" guruhida boʻladi. Qarang: [Geodezik nuqtalarni import qilish](topic:import-points).

## Nuqtalarni yozish

CivilCraft hali nuqtalarning matn faylini eksport qilmaydi. Nuqtalar LandXML da (CgPoints sifatida), loyiha faylida va GIS {{ui:Eksport}} orqali shapefile, GeoPackage yoki GeoJSON koʻrinishida P, N, E, Z va D maydonlari bilan chiqadi ([GIS uchun as-built maʼlumotlarini eksport qilish](topic:gis-export)). Qarang: [Hali qurilmagan](topic:not-built-yet).
