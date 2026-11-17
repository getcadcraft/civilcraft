---
title: Yoʻl koridorini sudrab qurish
summary: Trassa uchun koridorni yoqing, polosa, yelka va yon nishab qiymatlarini belgilang hamda u hosil qilgan kesimlarni, daylight chiziqlarini va yer ishlarini oʻqing.
keywords: superelevatsiya, super, qiyalik, runoff, runout, tezlik jadvali, koʻndalang nishab, aylanish, koridor, yigʻma, kichik yigʻma, tipik kesim, yoʻl, polosa, yelka, koʻndalang nishab, yon nishab, daylight, kesish, toʻldirish, kesimlar, nishon, nishonlar, kenglik nishoni, balandlik nishoni, siljish nishoni, kengaytirish, qoplama chekkasi, boshqa koridorga ergashish
from: 91303189
---

Koridor bitta oddiy tipik kesimni (yigʻmani) trassa va uning loyiha profili boʻylab sudraydi, uni mavjud yerga tekislaydi va natijani loyihalangan yuzaga qoʻshadi. Trassada turli piket oraliqlarida bir nechta koridor boʻlishi mumkin, va koridorni piket boʻyicha qayta ishlatiladigan shablonlardan qurish mumkin ([Koridor shablonlari](topic:corridor-templates)). Quyidagi oddiy yigʻma ikki tomonda bir xil; har bir tomonga oʻz qismlarini berish uchun qarang: [Har bir tomonni qismlardan qurish](topic:corridor#build-each-side-from-parts).

## Yigʻma

Markaziy chiziqdan tashqariga, har bir tomonda:

1. berilgan kenglikdagi **polosa**, qirradan **polosa nishabi** bilan pastga tushadi
2. berilgan kenglikdagi **yelka**, **yelka nishabi** bilan
3. yelka chetidan yerga tegadigan joygacha **yon nishab**: yer yuqorida boʻlsa **kesish nishabi**, pastda boʻlsa **toʻldirish nishabi**

Boshlangʻich qiymatlar joy egallovchi, loyiha standarti emas:

| Qiymat | AQSh futi | Metr |
|---|---|---|
| Polosa kengligi | 12 ft | 3.6 m |
| Polosa nishabi | 2% | 2% |
| Yelka kengligi | 4 ft | 1.2 m |
| Yelka nishabi | 4% | 4% |
| Kesish nishabi | 2 : 1 | 2 : 1 |
| Toʻldirish nishabi | 3 : 1 | 3 : 1 |
| Kesim qadami | 10 ft | 5 m |

Yon nishablar nishabi gorizontal va vertikal (H:V) nisbatda: 3 : 1 — gorizontal boʻyicha 3, vertikal boʻyicha 1.

## Koridorni qurish

Xatosiz trassa va kamida ikkita PVI hamda xatosiz loyiha profili kerak.

1. Trassani tanlang.
2. Oʻng panelda **Koridor** ostida **Yigʻmani loyiha profili boʻylab sudrash** ni belgilang.
   Maydonlar paydo boʻladi va koridor darhol quriladi. Rejada polosa va yelka chetlari hamda daylight chiziqlari koʻrinadi; **Koʻrsatish** ostida {{ui:Loyihalangan (qiyalik berilgan)}} tanlanganda, gorizontallar yangi yerni koʻrsatadi.
3. Istalgan qiymatni oʻzgartiring: **Polosa kengligi**, **Polosa nishabi**, **Yelka kengligi**, **Yelka nishabi**, **Kesish nishabi**, **Toʻldirish nishabi**, **Kesim qadami**. Har biridan keyin {{key:Enter}} ni bosing. Kesish, toʻldirish va kesim qadami 0 dan katta boʻlishi kerak.
4. Maydonlar ostidagi qatorni oʻqing, masalan: "39 ta kesim 0+00.00 dan 3+86.36 gacha; kesish 240.2 cu yd, toʻldirish 556.0 cu yd."

Kesimlar har bir **Kesim qadami**da, uchlarida va har bir gorizontal va vertikal egri chiziqning boshida va oxirida kesiladi. Har bir kesim va ular orqali oʻtadigan chiziqlar (markaziy chiziq, polosa va yelka chetlari, daylight) loyihalangan yuzaning uzilish chiziqlariga aylanadi.

Koridorni oʻchirish uchun katakchani olib tashlang. Uning qiymatlari keyingi safar uchun saqlanadi.

## Qurilmasa

Maydonlar ostidagi qizil quti sababini aytadi:

| Xabar | Nima qilish kerak |
|---|---|
| "Koridorga xatosiz loyiha profili kerak." | PVI qoʻshing yoki ustma-ust tushgan vertikal egri chiziqlarni tuzating (qarang: [Vertikal profilni loyihalash](topic:profile)). |
| "Loyiha profili trassa bilan ustma-ust tushmaydi." | PVI larni trassaning piket oraligʻiga koʻchiring. |
| "Koridorga yuzada kamida ikkita kesim kerak." | Koridorning koʻp qismi mavjud yerdan tashqarida. |
| "4 ta yon nishab yerga tegmasdan yuzadan chiqib ketadi." | Yuza chetiga yaqin joyda nishab yerga yeta olmaydi. Yoʻlni chetdan uzoqroq tuting yoki oʻsha joyda toʻldirish yoki kesish balandligini pasaytiring. |
| "Koridorning daylight chiziqlari kesishadi (kesimlar ustma-ust tushadi, masalan keskin egrining ichki tomonida). Kattaroq radius yoki torroq yigʻma ishlating." | Oʻtkir egrining ichki tomonidagi kesimlar ustma-ust tushadi. Radiusni oshiring yoki yigʻmani torroq qiling. |

Muammosi bor koridor tekislanmaydi va yer ishlariga kiritilmaydi.

## Koridorlar va maydonchalar birga

Loyihalangan yuza tartib bilan quriladi: avval har bir koridor, keyin har bir maydoncha. Maydonchaning tekislanishi koridor bilan ustma-ust tushsa, maydoncha ustun keladi. Hajmlar barcha daylight chiziqlari ichida birga hisoblanadi; qarang: [Yer ishlari hajmlari](topic:volumes).

## Superelevatsiya

Egri chiziqdan oʻtganda yoʻl ichkariga egilishi mumkin, shunda transport tashqariga kamroq itariladi. Trassaning **Xususiyatlar** ichida **Superelevatsiya** ostidagi **Egri chiziqlarni superelevatsiyalash** ni belgilang:

- Har bir aylana egri chiziq jadvaldan **e** tezligini oladi: egri chiziq yetib boradigan radiusli birinchi qator (tezligi boʻsh qator normal qirrani saqlaydi). Jadval va **Maksimal nisbiy gradient** (boshlangʻich 0.5 %) joy egallovchi, standart emas: ularni oʻz loyiha mezonlaringizdan belgilang. Kerak boʻlsa qatorlar qoʻshing yoki oʻchiring.
- Polosalar markaziy chiziq atrofida aylanadi. Egridan oldin tashqi polosa **runout** (normal qirra ÷ e × runoff) boʻylab tekislanadi, soʻng **runoff** (polosa kengligi × e ÷ gradient) boʻylab tashqi polosa butun yoʻl ichkariga e bilan qiyalanmaguncha burilishda davom etadi; runoffning uch dan ikki qismi egridan oldin, uchdan bir qismi egri ustida joylashadi. Egridan keyin xuddi shu narsa teskari tartibda boʻladi.
- Past tomondagi yelka hech qachon oʻz polosasidan tekisroq boʻlmaydi; baland tomonda u oʻz nishabini saqlaydi (u ustidan ogʻadi).
- Uning ostidagi jadvalda har bir egrining radiusi, tezligi, runoff va runout hamda toʻliq superelevatsiyaning qayerda boshlanishi va tugashi koʻrsatiladi. **Superelevatsiya diagrammasi** ikkala polosaning koʻndalang nishablarini piketlar boʻylab chizadi (chap polosa uzluksiz, oʻng polosa shtrixli).
- Toʻliq superelevatsiyaga yetmaydigan juda qisqa egri yoki oʻtishlari ustma-ust tushadigan ikki egri jadval ustidagi quti bilan aytiladi.

Kesimlar, hajmlar, 3D koʻrinish va varaqlar hammasi egilgan yoʻlni koʻrsatadi. Har bir oʻzgarish bitta qadam: {{key:Mod+Z}} uni bekor qiladi.

## Nishonlar

Nishon yoʻlning bir tomonidagi bitta nuqtani chiziqqa siljitadi: **Qoplama chekkasi** yoki **Yelka chekkasi**, **Chap** yoki **Oʻng** tomonda. Har bir kesim chiziq bilan markaziy chiziqqa perpendikulyar uchrashadi va faqat shu tomonga chiqadi, shuning uchun oʻng tomondagi nishon hech qachon chap tomonni siljitmaydi.

| Oʻrnatadi | Kesim chiziq bilan uchrashgan joyda nima boʻladi |
|---|---|
| **Kenglik** | Nuqta chiziqda turadi: polosa (yoki yelka) unga qarab kengayadi yoki torayadi, koʻndalang nishabini saqlab. |
| **Balandlik** | Nuqta oʻsha yerda chiziqning balandligini oladi, oʻz siljishida: polosaning (yoki yelkaning) koʻndalang nishabi unga ergashadi. |

Chiziq xususiyat chizigʻi (uning **Qoʻllanishi** qanday boʻlishidan qat'i nazar) yoki boshqa koridor chizigʻi boʻlishi mumkin: uning markaziy chizigʻi, qoplama chekkalari, yelka chekkalari yoki daylight chiziqlari. Koridor chizigʻi oʻsha koridorga ergashadi: boshqa yoʻlni oʻzgartirsangiz, bu ham ergashadi. CivilCraft avval boshqa koridorni quradi; bir-birini halqa boʻylab nishon qiladigan ikki koridor bir tomonda rad etiladi va jadvalda qaysi biri ekani aytiladi.

1. Trassani tanlang va uning koridorini yoqing.
2. **Nishonlar** ostida {{ui:Nishon qoʻshish}} ni bosing.
3. **Tomon**, **Nuqta**, nima **Oʻrnatadi** va **Chiziqqa** ni tanlang. Har bir oʻzgarish bitta ortga qaytarish qadami.

**Natija** chiziq necha kesimga yetganini aytadi. Unga yetmaydigan kesimlar (uning uchlaridan tashqarida yoki markaziy chiziq ortida) yigʻmaning qiymatlarini saqlaydi. Oʻchirilgan chiziq koridorni nishon oldidagi holatida qoldiradi va jadval buni aytadi. Bir tomonda har bir nuqta uchun bitta kenglik va bitta balandlik nishoni boʻlishi mumkin.

## Har bir tomonni qismlardan qurish

Koridor sozlamalarida **Har bir tomonni qismlardan qurish** ni yoqing. Shundan keyin har bir tomonda oʻz roʻyxati boʻladi, markaziy chiziqdan tashqariga: polosalar, yelka, lotok, bordyur, koʻkalamzor chizigʻi, trotuar va oxirida yerga yon nishab (oʻzining kesish va toʻldirish nisbatlari bilan). {{ui:Qishloq yoʻli}} yoki {{ui:Shahar koʻchasi}} dan boshlang, qismlarni qoʻshing va oʻchiring, ularni strelkalar bilan koʻchiring va bir tomonni boshqasiga {{ui:Nusxalash}} qiling. Har bir oʻzgarish bitta ortga qaytarish qadami.

Koʻndalang nishab yoʻldan uzoqlashgan pastlik boʻlgani uchun, yoʻl tomon oqadigan trotuar manfiy boʻladi. Bordyur — siz bergan balandlikdagi yuz, bergan kenglikdagi yuqori qism va orqada ixtiyoriy pasayish. Superelevatsiya birinchi qatordagi har bir polosani buradi; lotok, bordyur, koʻkalamzor chizigʻi va trotuar qurilgan polosalar chetidan osilib turadi. Nishonlar hali ham polosalar oxirini va oxirgi qismni siljitadi. Koʻndalang kesimlarda lotok oqim chizigʻi, bordyurning yuqori va orqa qismi va boshqalar belgilanadi. Spiralli egrida runoff spiraldir: TS da tekis qirra, SC da toʻliq superelevatsiya.

## Qoplama qatlamlari

Polosa, yelka, lotok, koʻkalamzor chizigʻi yoki trotuar oʻz qatlamlarini olib yurishi mumkin: qism ostida {{ui:Qatlam qoʻshish}} nom, material, qalinlik va turi (qoplama, bogʻlovchi, asos, ostki asos, qoplash yoki boshqa) bilan qatlam qoʻshadi, yuqoridan pastga. Qatlamlar yoʻl yuzasini (uning yuqori qismi loyihalangan yuza) siljitmaydi; har biri oʻz qismi ostida joylashadi, chuqurligi toʻgʻri pastga oʻlchanadi. Koʻndalang kesimlar har bir qatlamning pastki chizigʻini shtrixli chiziq bilan chizadi va {{ui:Yoʻl qoplamasi qatlamlari: miqdorlar}} har bir qatlamning reja maydoni va hajmini sanaydi (koridor boʻylab maydon kesimlardan, hajm = maydon × qalinlik). IFC eksporti har bir qatlamni qalinligi va materiali bilan oʻz elementi sifatida yozadi (qarang: [IFC eksport va import](topic:ifc)). Kiritgan qalinligingiz sizniki: CivilCraft qoplamalarning oʻlchamini belgilamaydi.

## Hali qurilmagan

Daylight nishabi uchun nishonlar hali mavjud emas. Yoʻl boʻylab oʻzgaradigan, chap va oʻng alohida koridor uchun [Koridor shablonlari](topic:corridor-templates) dan foydalaning. Qarang: [Hali qurilmagan](topic:not-built-yet).
