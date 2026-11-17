---
title: Birliklar, piketlar va raqam formatlari
summary: Fut va metrli loyihalar, piketlar, nishablar, yon qiyaliklar, rumblar, maydonlar, hajmlar va quvur oʻlchamlari qanday yozilishi va kiritilishi hamda birliklarni oʻzgartirish nimani anglatishi.
keywords: uzunlikni kiritish, arifmetika, kalkulyator, yigʻindi, kasr, fut va dyuym, 4+7/16, birliklar, fut, AQSH geodezik futi, metr, metrik, imperial, piket formati, piketlash, nishab, foiz, yon qiyalik, h:v, rumb, kub yard, diametr
from: 0b9b5b6b
---

## Loyiha birliklari

Loyiha **AQSH futlarida** yoki **metrlarda** (chap paneldagi **Birliklar**). Loyihadagi har bir koordinata, balandlik, uzunlik va piket oʻsha birlikda boʻladi.

:::warning
**Birliklar**ni oʻzgartirish yorliqlar, piket formatini, standart qiymatlarni va fayllar qanday yozilishini oʻzgartiradi. U raqamlarni **konvertatsiya qilmaydi**. Futda oʻlchangan va metrga oʻtkazilgan obyekt bir xil raqamlarni saqlaydi, endi ular metr deb oʻqiladi. Holat satrida "Birliklar endi metrda. Koordinatalar konvertatsiya qilinmadi." deyiladi. Loyihalashdan oldin birliklarni maʼlumotlaringizga moslang.
:::

Birliklarga bogʻliq narsalar:

| | AQSH futlari | Metrlar |
|---|---|---|
| Piket formati | `12+34.56` (100 futlik piketlar) | `1+234.567` (1000 metrlik piketlar) |
| Taklif qilinadigan gorizontal intervallar | 0.25 dan 20 ft gacha | 0.1 dan 10 m gacha |
| Maydon | sq ft | sq m |
| Hajm | cu yd | cu m |
| Quvur va inshoot diametri | dyuym | millimetr |
| Standart egri chiziq radiusi | 100 ft | 30 m |
| Rejadagi piketlash belgilari | har 50 ft, yorliqlar har 100 ft | har 20 m, yorliqlar har 100 m |
| Chop etish masshtablari | 1" = 5' dan 1" = 1000' gacha | 1:50 dan 1:10000 gacha |
| LandXML chiziqli birligi | USSurveyFoot | meter |

Yangi loyiha futda boshlanadi yoki, agar {{ui:Sozlamalar}} › {{ui:Umumiy}} › {{ui:Birliklar}} da belgilangan uzunlik birligi metrik boʻlsa, metrda. **Birliklar** roʻyxatida shu yerda yoqilgan birliklar koʻrsatiladi va doim loyihaning oʻz birligi. Agar u yerda maydon yoki hajm birligi (akr, gektar, akr-fut ...) belgilangan boʻlsa, maydonlar va hajmlar yuqoridagi ustun oʻrniga shu birlikda hisobot qilinadi. Qarang: [Birliklar, kiritilgan qiymatlar va birliklar roʻyxati](common:unit-lists).

Loyihani LandXML fayldan ochganda, loyiha faylning birliklarini oladi. Xalqaro futdagi fayl fut loyihasi sifatida ochiladi; raqamlar oʻzgarmaydi.

## Uzunliklar va yigʻindilarni kiritish

Uzunlik yoki balandlik kiritiladigan har qanday maydon oddiy sondan koʻproq narsani oʻqiydi: {{key:Enter}} ni bosing va maydon natijani loyiha birliklarida koʻrsatadi.

| Siz kiritasiz | Fut loyihasida | Metr loyihasida |
|---|---|---|
| `12.5` | 12.5 ft | 12.5 m |
| `12'6"`, `12' 6 1/2"`, `6"`, `3 ft 6 in` | 12.5 ft, 12.54 ft, 0.5 ft, 3.5 ft | xuddi shu uzunliklar metrda |
| `4 7/16`, `4-7/16` | 4.4375 ft | 4.4375 m |
| `450 mm`, `1.2 m`, `90 cm` | futda | 0.45 m, 1.2 m, 0.9 m |
| `10 US ft`, `3 ch`, `2 rd`, `0.5 mi`, `1 km` | 10 ft, qolganlari AQSH geodezik futida | xuddi shu uzunliklar metrda |
| `4+7/16`, `12'6" + 3/4"`, `(24'-0")/3`, `2*450mm` | yigʻindi, futda | yigʻindi, metrda |

Umumiy birliklar jadvalidagi har qanday uzunlik belgisi aniq oʻlchami bilan ishlaydi: loyiha futlari AQSH geodezik futlari hisoblanadi, shuning uchun `10 US ft` 10 ga teng, `3 ch` (xalqaro fut zanjiri) esa 197.9996. `+ - * /` va qavslardan, shuningdek `abs`, `round`, `ceil` va `floor` dan foydalaning. Uzunlikning ichiga yozilgan chiziqcha uning bir qismi (`24'-6"`, `6-1/2`); boʻshliq bilan ajratilsa, u ayiradi (`24' - 6"` = 23.5 ft). Oddiy son uzunlikni koʻpaytiradi yoki boʻladi, uzunlikka qoʻshilganda esa loyiha birligidagi uzunlik boʻladi. Agar CivilCraft yozganingizni oʻqiy olmasa, maydon belgilanadi va holat satri qayerdaligini koʻrsatadi.

Piketlar yigʻindi emas: piket maydoniga `10+00` yozsangiz, u 10+00 piket boʻladi. Foizdagi nishablar, nuqta raqamlari va tavsiflar aynan oʻqiladi.

## Piketlar

Piket — trassa boʻylab masofa, plyus belgisi bilan yoziladi:

- Futlar: plyusdan oldingi qism yuzlab futlar. `12+34.56` — 1,234.56 ft.
- Metrlar: plyusdan oldingi qism minglab metrlar. `1+234.567` — 1,234.567 m.
- Manfiy piketlar belgini oldida saqlaydi: `-0+50.00`.

Piket kiritadigan har qanday joyda (**Boshlanish piketi**, PVI ning **Piket** maydoni) uni plyus bilan (`12+34.56`) yoki oddiy son sifatida (`1234.56`) yozishingiz mumkin. Boʻshliqlar eʼtiborga olinmaydi.

## Nishablar va qiyaliklar

- **Nishablar** (profillar, quvurlar, polosa va yelka nishablari) foizda: `+1.25%` piket oʻsishi boʻylab koʻtariladi, `-0.50%` tushadi.
- **Yon qiyaliklar** (platforma kesma va toʻldirmasi, koridor kesma va toʻldirmasi) gorizontal boʻyicha vertikalga nisbatda: `3` degani 3 : 1, ya’ni bir birlik yuqoriga yoki pastga uchta birlik gorizontal.
- Vertikal egri chiziq uchun **K** — uning uzunligini foizdagi nishab oʻzgarishiga boʻlgani.

## Rumblar va burchaklar

Rumblar gradus, daqiqa va soniyadagi kvadrant rumblari: `N 63°12'05" E`. Egri chiziq burilishlari (Δ) xuddi shu gradus, daqiqa va soniyada, "chapga" yoki "oʻngga" bilan.

## Ofsetlar

Trassadan ofsetlar — unga perpendikulyar masofalar, piket oʻsishiga qarab **L** (chap) yoki **R** (oʻng) bilan belgilanadi.

## Raqamlarni koʻrsatish

- Koordinatalar va balandliklar panellarda va holat satrida 2 oʻnlik xonada koʻrsatiladi (tanlangan geodezik nuqta uchun 3 ta).
- Maydonlar va hajmlar minglik boʻlinmalar bilan guruhlanadi: `128,250 sq ft`, `454.9 cu yd`.
- Koordinatalar hech qachon guruhlanmaydi, shuning uchun ularni xuddi shunday holda nusxalash mumkin.

## Koordinatalar

CivilCraft tekis tekislikda ishlaydi: sharqiy — oʻngga, shimoliy — yuqoriga. Loyihalash doim proyeksiyalangan koordinatalarda bajariladi (davlat tekisligi, UTM yoki mahalliy grid). Siz CivilCraft ga ularning koordinatalar tizimini aytishingiz mumkin, shuningdek ular grid, yer yoki mahalliy koordinatalar ekanligini; shunda u kenglik va uzunlikni koʻrsatadi hamda GIS fayllari va xarita qatlamlarini joylashtiradi, lekin birliklarni hech qachon oʻzgartirmaydi va koordinatalaringizni oʻzi siljitmaydi. Qarang: [Loyiha koordinatalar tizimini belgilash](topic:coordinate-systems) va [Yer va mahalliy koordinatalar](topic:ground-and-local-coordinates). Katta davlat tekisligi qiymatlari (millionlab futlar) yaxshi; CivilCraft aniqlikni saqlash uchun ichki hisoblarni obyektga nisbatan bajaradi.
