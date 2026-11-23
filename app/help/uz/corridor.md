---
title: Yoʻl koridorini trassa boʻylab yaratish
summary: Trassa uchun koridorni yoqing, yoʻl qatori, chekka va yon qiyalik qiymatlarini belgilang hamda hosil boʻlgan kesimlar, yer bilan tutashuv chiziqlari va yer ishlarini oʻqing.
keywords: tutashuv, kesishma, yoʻl yoʻlga tutashadi, yon yoʻl, T tutashuv, kesishish, maydoncha sathi, ulash, bogʻlash, superelevatsiya, super, ogʻdirish, oʻtish, chiqish, stavkalar jadvali, koʻndalang qiyalik, aylanish, koridor, yigʻma, tipik kesim, yoʻl, yoʻl qatori, chekka, koʻndalang qiyalik, yon qiyalik, yer bilan tutashuv, kesish, toʻldirish, kesimlar, nishon, nishonlar, kenglik nishoni, balandlik nishoni, siljish nishoni, kengaytirish, qoplama chekkasi, boshqa koridorni kuzatish
from: 6dcb92b3
---

Koridor bitta oddiy tipik kesimni (yigʻmani) trassa va uning loyiha profili boʻylab suradi, uni mavjud yer bilan tekislaydi va natijani loyihalangan yuzaga qoʻshadi. Bitta trassada turli piket oraliqlarida bir nechta koridor boʻlishi mumkin, koridorni esa qayta ishlatiladigan shablonlar asosida piket boʻyicha qurish mumkin ([Koridor shablonlari](topic:corridor-templates)). Quyidagi oddiy yigʻma ikki tomonda bir xil; har bir tomonga alohida qismlar berish uchun [Har bir tomonni qismlardan qurish](topic:corridor#build-each-side-from-parts) boʻlimiga qarang.

## Yigʻma

Markaziy chiziqdan tashqariga, har ikki tomonda:

1. berilgan kenglikdagi **yoʻl qatori**, u yoʻl oʻqidan **yoʻl qatori qiyaligi** bilan pastga tushadi
2. berilgan kenglikdagi **chekka**, **chekka qiyaligi** bilan
3. chekka chegarasidan yer bilan tutashguncha boʻlgan **yon qiyalik**: yer yuqorida boʻlsa **kesish qiyaligi**, pastda boʻlsa **toʻldirish qiyaligi**

Boshlangʻich qiymatlar vaqtinchalik boʻlib, loyiha standarti emas:

| Qiymat | AQSh futi | Metr |
|---|---|---|
| Yoʻl qatori kengligi | 12 ft | 3.6 m |
| Yoʻl qatori qiyaligi | 2% | 2% |
| Chekka kengligi | 4 ft | 1.2 m |
| Chekka qiyaligi | 4% | 4% |
| Kesish qiyaligi | 2 : 1 | 2 : 1 |
| Toʻldirish qiyaligi | 3 : 1 | 3 : 1 |
| Kesim qadami | 10 ft | 5 m |

Yon qiyaliklar nisbati gorizontal-vertikal (H:V) koʻrinishida beriladi: 3 : 1 degani 1 birlik pastga, 3 birlik gorizontal masofa.

## Koridorni qurish

Xatosiz trassa va kamida ikkita PVI boʻlgan, xatosiz loyiha profili kerak.

1. Trassani tanlang.
2. Oʻng panelda **Koridor** boʻlimida **Yigʻmani loyiha profili boʻylab suring** katagini belgilang.
   Maydonlar paydo boʻladi va koridor darhol quriladi. Reja yoʻl qatori va chekka chetlarini hamda yer bilan tutashuv chiziqlarini koʻrsatadi; **Koʻrsatish** boʻlimida {{ui:Loyihalangan (qiyalik berilgan)}} tanlanganda konturlar yangi yerni koʻrsatadi.
3. Istalgan qiymatni oʻzgartiring: **Yoʻl qatori kengligi**, **Yoʻl qatori qiyaligi**, **Chekka kengligi**, **Chekka qiyaligi**, **Kesish qiyaligi**, **Toʻldirish qiyaligi**, **Kesim qadami**. Har biridan keyin {{key:Enter}} ni bosing. Kesish, toʻldirish va kesim qadami 0 dan katta boʻlishi kerak.
4. Maydonlar ostidagi qatorni oʻqing, masalan: "39 ta kesim 0+00.00 dan 3+86.36 gacha; kesish 240.2 cu yd, toʻldirish 556.0 cu yd."

Kesimlar har bir **Kesim qadami** oraligʻida, uchlarida hamda har bir gorizontal va vertikal egri chiziqning boshida va oxirida kesiladi. Har bir kesim va ular orqali oʻtuvchi chiziqlar (markaziy chiziq, yoʻl qatori va chekka chetlari, yer bilan tutashuv) loyihalangan yuzaning uzilish chiziqlariga aylanadi.

Koridorni oʻchirish uchun katakchani belgisini olib tashlang. Uning qiymatlari keyingi safar uchun saqlanadi.

## Qurilmasa

Maydonlar ostidagi qizil quti sababini koʻrsatadi:

| Xabar | Nima qilish kerak |
|---|---|
| "Koridorga xatosiz loyiha profili kerak." | PVI qoʻshing yoki bir-biriga kirishib ketgan vertikal egri chiziqlarni tuzating (qarang: [Vertikal profilni loyihalash](topic:profile)). |
| "Loyiha profili trassa bilan ustma-ust tushmaydi." | PVI larni trassaning piket oraligʻiga surib qoʻying. |
| "Koridorga yuzada kamida ikkita kesim kerak." | Koridorning katta qismi mavjud yer yuzasidan tashqarida. |
| "4 ta yon qiyalik yer bilan tutashmasdan oldin yuzadan chiqib ketadi." | Yuza chetiga yaqin joyda qiyalik yerga yetib bora olmaydi. Yoʻlni chetdan uzoqroqda joylashtiring yoki oʻsha yerda toʻldirish yoki kesish balandligini pasaytiring. |
| "Koridorning yer bilan tutashuv chiziqlari kesishadi (kesimlar ustma-ust tushadi, masalan tor egrilikning ichki tomonida). Kattaroq radius yoki torroq yigʻmadan foydalaning." | Oʻtkir egrilikning ichki tomonidagi kesimlar ustma-ust tushadi. Radiusni oshiring yoki yigʻmani torroq qiling. |

Muammoli koridor yerga tekislanmaydi va yer ishlari hisobiga kirmaydi.

## Koridorlar va maydonchalar birga

Loyihalangan yuza tartib bilan quriladi: avval barcha koridorlar, keyin barcha maydonchalar. Maydonchaning tekislanishi koridor bilan ustma-ust tushgan joyda maydoncha ustunlik qiladi. Keyingi element yoʻl bilan ustma-ust tushganda, almashtiriladigan qism faqat keyingi elementning yer bilan tutashuv chizigʻi ichidagi yoʻl qismi boʻladi; yoʻlning qolgan qismi va yoʻl kesib oʻtgan yer uzilish chizigʻi oʻz shaklini saqlaydi. Hajmlar barcha yer bilan tutashuv chiziqlari ichida birgalikda hisoblanadi; qarang: [Yer ishlari hajmlari](topic:volumes).

## Superelevatsiya

Egri chiziq orqali yoʻl ichki tomonga egilishi mumkin, shunda transport vositalari tashqi tomonga kamroq siqiladi. Trassaning **Xususiyatlari** oynasida **Superelevatsiya** boʻlimi ostidagi **Egri chiziqlarni superelevatsiyalash** katakchasini belgilang:

- Har bir aylana egri chiziq stavkalar jadvalidan **e** stavkasini oladi: egri chiziq radiusi yetib boradigan birinchi qator (boʻsh stavkali qator odatdagi gumbazni saqlaydi). Jadval va **Nisbiy qiyalikning eng katta chegarasi** (boshlangʻichda 0.5 %) vaqtinchalik qiymatlar, standart emas: ularni oʻz loyiha mezonlaringizdan kelib chiqib belgilang. Kerak boʻlsa qatorlar qoʻshing yoki oʻchiring.
- Yoʻl qatorlari markaziy chiziq atrofida aylanadi. Egri chiziqdan oldin tashqi yoʻl qatori **chiqish masofasi** (odatdagi gumbaz ÷ e × oʻtish uzunligi) davomida tekislanadi, soʻng **oʻtish uzunligi** (yoʻl qatori kengligi × e ÷ qiyalik) davomida tashqi yoʻl qatori butun yoʻl ichki tomonga e qiyalik bilan ogʻguncha aylanishda davom etadi; oʻtishning uchdan ikki qismi egri chiziqdan oldin, uchdan bir qismi esa egri chiziqda joylashadi. Egri chiziqdan keyin xuddi shunday, teskari tartibda boʻladi.
- Past tomondagi chekka hech qachon oʻz yoʻl qatoridan tekisroq boʻlmaydi; yuqori tomonda u oʻz qiyaligini saqlaydi (u agʻdariladi).
- Uning ostidagi jadvalda har bir egri chiziqning radiusi, stavkasi, oʻtish va chiqish uzunliklari hamda toʻliq superelevatsiyaning boshlanish va tugash joyi koʻrsatiladi. **Superelevatsiya diagrammasi** piketlar boʻylab ikkala yoʻl qatorining koʻndalang qiyaliklarini chizadi (chap yoʻl qatori yaxlit, oʻng yoʻl qatori shtrixli).
- Toʻliq superelevatsiyaga yetmaydigan darajada qisqa egri chiziq yoki oʻtishlari ustma-ust tushadigan ikki egri chiziq haqida jadval ustidagi quti xabar beradi.

Kesimlar, hajmlar, 3D koʻrinish va varaqlarning barchasi egilgan yoʻlni koʻrsatadi. Har bir oʻzgarish bitta qadam: {{key:Mod+Z}} uni bekor qiladi.

## Nishonlar

Nishon yoʻlning bir tomonidagi bitta nuqtani chiziqqa siljitadi: **Qoplama chekkasi** yoki **Chekka chegarasi**, **Chap** yoki **Oʻng** tomonda. Har bir kesim chiziqqa markaziy chiziqqa nisbatan toʻgʻri burchak ostida tutashadi va faqat oʻsha tomonga chiqadi, shuning uchun oʻng tomondagi nishon hech qachon chap tomonni siljitmaydi.

| Belgilaydi | Kesim chiziq bilan tutashgan joyda nima boʻladi |
|---|---|
| **Kenglik** | Nuqta chiziqda turadi: yoʻl qatori (yoki chekka) chiziqqa qarab kengayadi yoki torayadi va koʻndalang qiyaligini saqlaydi. |
| **Balandlik** | Nuqta oʻz masofasida chiziq balandligini oladi: yoʻl qatorining (yoki chekkaning) koʻndalang qiyaligi unga ergashadi. |

Chiziq xususiyat chizigʻi (uning **Foydalanilishi** qanday boʻlishidan qatʼi nazar) yoki boshqa koridor chizigʻi boʻlishi mumkin: uning markaziy chizigʻi, qoplama chekkalari, chekka chegaralari yoki yer bilan tutashuv chiziqlari. Koridor chizigʻi oʻsha koridorga ergashadi: boshqa yoʻlni oʻzgartirsangiz, bu yoʻl ham ergashadi. CivilCraft avval boshqa koridorni quradi; bir-birini halqa boʻylab nishon qiladigan ikki koridordan biri rad etiladi va jadvalda qaysi biri ekani koʻrsatiladi.

1. Trassani tanlang va uning koridorini yoqing.
2. **Nishonlar** boʻlimida {{ui:Nishon qoʻshish}} ni bosing.
3. **Tomon**, **Nuqta**, nimani **Belgilashini** va **Chiziqqacha** ni tanlang. Har bir oʻzgarish bitta bekor qilish qadami.

**Natija** chiziq necha kesimga yetganini koʻrsatadi. Unga yetmagan kesimlar (uning uchlaridan tashqarida yoki markaziy chiziqdan orqada) yigʻmaning qiymatlarini saqlaydi. Oʻchirilgan chiziq koridorni nishon qoʻyilishidan oldingi holatda qoldiradi va jadvalda shu aytiladi. Bir tomonda har bir nuqta uchun bitta kenglik va bitta balandlik nishoni boʻlishi mumkin.

## Har bir tomonni qismlardan qurish

Koridor sozlamalari ostida **Har bir tomonni qismlardan qurish** ni yoqing. Shunda har bir tomonning markaziy chiziqdan tashqariga qarab oʻz roʻyxati boʻladi: yoʻl qatorlari, chekka, suv oqizgich ariq, bordyur, ekish yoʻlagi, piyodalar yoʻlagi va oxirida yerga qadar yon qiyalik (oʻzining kesish va toʻldirish nisbatlari bilan). {{ui:Qishloq yoʻli}} yoki {{ui:Shahar koʻchasi}} dan boshlang, qismlarni qoʻshing yoki olib tashlang, ularni tugmalar bilan siljiting va bir tomonni {{ui:Nusxalash}} orqali ikkinchi tomonga nusxalang. Har bir oʻzgarish bitta bekor qilish qadami.

Koʻndalang qiyalik yoʻldan uzoqlashgan tomonga pastga tushishi, shuning uchun yoʻl tomon oqadigan piyodalar yoʻlagi manfiy boʻladi. Bordyur — siz bergan balandlikdagi yuz, berilgan kenglikdagi tepa va ixtiyoriy orqa pastlik. Superelevatsiya birinchi qatordagi barcha yoʻl qatorlarini aylantiradi; suv oqizgich ariq, bordyur, ekish yoʻlagi va piyodalar yoʻlagi qurilgan yoʻl qatorlari chetidan osilib turadi. Nishonlar hamon yoʻl qatorlarining uchini va oxirgi qismni siljitadi. Koʻndalang kesimlar suv oqizgich oqim chizigʻini, bordyur tepasi va orqa tomonini hamda qolganlarini belgilaydi. Spiralli egri chiziqda oʻtish spiral boʻladi: TS nuqtada tekis gumbaz, SC nuqtada toʻliq superelevatsiya.

## Qoplama qatlamlari

Yoʻl qatori, chekka, suv oqizgich ariq, ekish yoʻlagi yoki piyodalar yoʻlagi oʻz qatlamlar tuzilmasiga ega boʻlishi mumkin: qism ostida {{ui:Qatlam qoʻshish}} tugmasi yuqoridan pastga qarab nomi, materiali, qalinligi va turi (yuza, bogʻlovchi, asos, tagasos, qoplama yoki boshqa) bilan qatlam qoʻshadi. Qatlamlar yoʻl yuzasini (uning tepasi loyiha yuzasi) siljitmaydi; har biri oʻz qismi ostida joylashadi, chuqurligi toʻgʻri pastga oʻlchanadi. Koʻndalang kesimlar har bir qatlamning pastki chetini shtrixli chiziq bilan chizadi, {{ui:Yoʻl qoplamasi qatlamlari: miqdorlar}} esa har bir qatlamning reja maydonini va hajmini sanab chiqadi (kesimlardan koridor boʻylab maydon, hajm = maydon × qalinlik). IFC eksporti har bir qatlamni qalinligi va materiali bilan alohida element sifatida yozadi (qarang: [IFC eksporti va importi](topic:ifc)). Siz kiritgan qalinlik sizniki: CivilCraft qoplamalar oʻlchamini belgilamaydi.

## Yoʻllar boshqa yoʻllar, maydonchalar va yoʻlkalar bilan tutashganda

{{ui:Uchrashgan yoʻllar va maydonchalarni ulash}} yoqilgan boʻlsa (har bir koridor uchun yoqilgan), CivilCraft koridorni rejada uchrashgan narsalar bilan ulaydi:

- **Boshqa yoʻlda tugaydigan yoʻl** (uning trassasi oxiri boshqa yoʻlda yotadi yoki shu yoʻl chetidan oʻz qoplama kengligining taxminan yarmi ichida) tutashuvning yon yoʻli hisoblanadi. Unga tutashgan yoʻl yon yoʻl qoplamasi uchun oʻz chetini ochadi: ogʻzi boʻylab chekka, bordyur, ekish yoʻlagi va yoʻlka yoʻl qatorining koʻndalang qiyaligida yotqiziladi va qoplama sifatida chiziladi. Yon yoʻl ikki yoʻl ustma-ust tushgan joyda asosiy yoʻl yuzasiga yotqiziladi va yaqinlashish boʻylab unga koʻtariladi yoki pasayadi.
- **Bir-birini kesib oʻtuvchi ikki yoʻl** ikki tomonda ham shu tarzda ulanadi. **Trassalar** ostida birinchi koʻrsatilgan yoʻl oʻtuvchi yoʻl hisoblanadi; ikkinchisi uning yuzasiga kesib oʻtib ergashadi.
- **Maydonchada tugaydigan yoʻl** (uning ichida yoki chetidan qoplama kengligining taxminan yarmi ichida) maydoncha sathiga keladi va yaqinlashish boʻylab unga tekislanadi.
- **Yoʻlka** (Landshaft › Qattiq qoplamalar) yoʻl ustiga yotmasdan, yoʻlning tashqi chetida, oʻsha yerdagi piyodalar yoʻlagi yoki chekka sathida toʻxtaydi. Yoʻl kesib oʻtgan yoʻlka ikki boʻlakka boʻlinadi. Yoʻldan biroz qisqa chizilgan uchi (yoʻlka kengligining ikki barobari ichida) uning chetigacha davom ettiriladi.

**Xususiyatlar** har bir koridor nimani ulaganini, u yerda qancha koʻtarilgan yoki pasaytirilganini va qanday uzunlikda ekanini koʻrsatadi. Bu uzunlik 10 m (30 ft) va oʻzgarishning yigirma baravari orasidagi kattasi boʻlib, koridorning 45 foizidan oshmaydi. **Loyiha profili oʻzgarmaydi**: profil koʻrinishi hali ham siz chizgan qiyalik chizigʻini koʻrsatadi, kesimlar, loyihalangan yuza, hajmlar va 3D koʻrinish esa ulangan yoʻlni koʻrsatadi. Ulanishni loyihada aniq qilish uchun oxirgi PVI ni **Xususiyatlar** koʻrsatgan sathga siljiting.

Koridorda kalitni oʻchirsangiz, u oʻz profili va yigʻmasi aytganidek qoladi; keyin u yon yoʻl yoki oʻtuvchi yoʻl sifatida hech qanday tutashuvda qatnashmaydi. Deyarli bir chiziqda uchrashadigan yoʻllar (taxminan 20° dan kam) oʻzgartirilmaydi, izli yoʻllar ham shunday.

Tutashuv hali nimalarni bajarmaydi: bordyur burilishlari yoʻq (burchaklar toʻgʻri), burilish yoʻllari va orollar yoʻq, yon yoʻlning uchi oʻz trassasiga nisbatan toʻgʻri kesiladi, shablonlardan qurilgan koridor esa oʻz chetini xuddi shunday oddiy usulda ochadi (uchidagi ariq yoki devor ogʻiz boʻylab tekislanadi, quvur-oʻtkazgichsiz). Rejadagi bordyur burilishlari, koʻrish uchburchaklari va chiziqlash uchun qarang: [Tuproqlar, yoʻllar, geodeziya, konlar va bogʻlanishlar](topic:soils-roads-survey-mines-links).

## Hali qurilmagan

Yer bilan tutashuv qiyaligi uchun nishonlar hali mavjud emas. Yoʻl boʻylab oʻzgaradigan, chap va oʻng tomoni alohida boʻlgan koridor uchun [Koridor shablonlari](topic:corridor-templates) dan foydalaning. Qarang: [Hali qurilmagan](topic:not-built-yet).
