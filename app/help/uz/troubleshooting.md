---
title: Muammolarni bartaraf etish
summary: CivilCraft ilovasidagi muammolar uchun belgilar, sabablar va yechimlar, ilova koʻrsatadigan aniq xabarlar bilan.
keywords: muammolar, xatolar, ishlamayapti, tuzatish, yordam, xabarlar, bartaraf etish, rad etilgan, yoʻq, notoʻgʻri, almashtirilgan, gorizontallar yoʻq
from: a9f7dedc
---

Xabarlar holat satrida (pastki oʻng burchakda), chap va oʻng paneldagi oynalarda hamda dialoglarda chiqadi. Bu yerda ular ilova koʻrsatganidek keltirilgan.

## Fayllarni ochish

**"Bu fayl 200 MB dan katta; CivilCraft bunday katta fayllarni hali ochmaydi."**
Nuqtalar faylini boʻlib tashlang yoki ochishdan oldin maʼlumotlarni kamaytiring.

**"site.json ochib boʻlmadi: Bu CivilCraft loyiha fayli emas."**
Fayl `.json` bilan tugaydi yoki `{` bilan boshlanadi, lekin CivilCraft loyihasi emas. Nuqta fayllari `{` bilan boshlanmasligi kerak.

**"Ochib boʻlmadi … Bu loyiha fayli yangiroq CivilCraft (2-versiya) bilan saqlangan."**
Loyiha yangiroq versiya bilan saqlangan. Uni oʻsha versiyada oching yoki undan LandXML eksport qiling.

**"Ochib boʻlmadi … Bu XML, lekin LandXML emas (asosiy elementi <…>)."**
Fayl boshqa turdagi XML. Boshqa dasturdan LandXML eksport qiling.

**"… faylida CivilCraft oʻqiy oladigan nuqtalar, TIN sirtlar yoki trassalar yoʻq."**
Fayldagi hamma narsa CivilCraft oʻtkazib yuboradigan turdagi (masalan, faqat grid sirtlar yoki faqat spiral trassalar). Xabarning qolgan qismi nima borligini aytadi. Qarang: [LandXML: oʻqiladigan va yoziladigan maʼlumotlar](topic:landxml-reference).

**"Namuna yuklab boʻlmadi: …"**
{{ui:Namunaviy obyektni ochish}} CadCraft saytidan fayl oʻqiydi. Aloqa boʻlmasa, u faqat CivilCraft oflayn foydalanish uchun saqlangan boʻlsa ishlaydi (ilova paneli tugmasida {{ui:Oflayn tayyor}} koʻrsatiladi). Onlaynga oʻting, {{ui:Oflayn uchun saqlash}} tugmasini bosing, shundan keyin u oflaynda ham ishlaydi. Qarang: [Oflayn](common:offline).

**{{ui:Oflayn uchun saqlash}} {{ui:Saqlab boʻlmadi}} xabarini koʻrsatadi.**
Ayrim fayllar yuklanmadi. Ulanishni tekshiring va tugmani qayta bosing.

**{{ui:Oflayn uchun saqlash}} {{ui:Oflayn rejim mavjud emas}} xabarini koʻrsatadi.**
Bu brauzer oynasi oflayn nusxani saqlay olmaydi, odatda u maxfiy oyna yoki kompyuter boshqaruvda boʻlgani uchun. CivilCraft ilovasini oddiy oynada oching.

**Oflaynda ilova umuman ochilmaydi.**
U bu brauzerda oflayn uchun saqlanmagan, yoki brauzer sayt maʼlumotlarini tozalagan (Safari bir necha hafta tashrif buyurilmagan saytlar uchun shunday qiladi). Onlaynga oʻting, CivilCraft ilovasini oching va {{ui:Oflayn uchun saqlash}} tugmasini bosing.

**Oflayn nusxa eskiroq versiya.**
{{ui:Oflayn tayyor}} tugmasini bosing, soʻng onlaynda turib {{ui:Qayta saqlash (eng yangi versiyani olish)}} tugmasini bosing.

**Ochish oynasida fayl xira koʻrinadi.**
Oyna faqat nuqta fayllari, LandXML va loyiha fayllarini ularning kengaytmasi boʻyicha koʻrsatadi. Buning oʻrniga faylni rejaga torting yoki uning nomini `.txt` ga oʻzgartiring.

## Nuqtalarni import qilish

**"Bu fayldan hech qanday nuqta oʻqib boʻlmadi."**
**Ustunlar** boʻlimida ustunlar tartibini qoʻlda tanlang. Hech narsa ishlamasa, faylni matn muharririda oching va har bir qatorda bitta nuqta boʻlishini, unda raqamlar borligini tekshiring.

**Obyekt aks etgan, aylangan yoki bir chiziqqa choʻzilgan koʻrinadi.**
Shimoliy va sharqiy koordinatalar almashtirilgan. Xulosada "ustunlar soni boʻyicha taxmin qilingan" deyilgan. **Ustunlar** boʻlimida PNEZD oʻrniga PENZD tanlang (yoki teskarisini), yoki qayta import qiling.

**Nuqtalar boshqalardan juda uzoqda, reja esa bir nuqtagacha kichrayib ketgan.**
Qatorda koordinatada xato yozilgan yoki faylda turli koordinata tizimlari aralashgan. Nuqtani toping (uning raqamini koʻrish uchun uni bosing) va faylni tuzating.

**"Oʻqilmagan qatorlar" ostida koʻrsatilgan qatorlar.**
Qarang: [Geodezik nuqtalarni import qilish](topic:import-points#rows-that-are-not-read).

**Eski nuqtalarim yoʻqolib qolgan.**
Nuqta faylini import qilish barcha nuqtalarni almashtiradi va bekor qilish tarixini tozalaydi. Ularni qaytarish uchun saqlangan loyihangizni oching.

## Sirt

**Qizil quti bilan "Sirt: Qurilmagan".**
Quti sababini aytadi: "Sirt uchun balandlikka ega kamida uchta nuqta kerak.", "Nuqtalarning hammasi bir chiziqda: uchburchaklar yoʻq.", "Balandlikka ega nuqtalar yoʻq.", "Chegara nuqtalar bilan ustma-ust tushmaydi." yoki "Chegara ichida uchburchaklar qolmadi." Ustunlar tartibini, nuqta guruhlarini (ular {{ui:Chiqarib tashlangan}} holatdami?) va chegarani tekshiring.

**Gorizontallar ariq yoki qirrani toʻgʻridan-toʻgʻri kesib oʻtadi.**
Bu chiziq sinuvchi chiziq emas. Uning guruhini {{ui:Sinuvchi chiziq}} ga oʻrnating yoki uni {{ui:Sinuvchi chiziq}} asbobi bilan chizing. Qarang: [Sirtni qurish va aniqlashtirish](topic:build-surface).

**Sinuvchi chiziq guruhi zigzag chizadi.**
Guruhda bir nechta chiziq bor yoki uning nuqtalari chiziq boʻylab raqamlanmagan. Guruhni {{ui:Nuqtalar}} ga qaytaring va har bir chiziqni {{ui:Sinuvchi chiziq}} asbobi bilan alohida chizing.

**Tashqi tomon boʻylab uzun ingichka uchburchaklar.**
Chegara chizing ({{key:O}}) yoki **Eng uzun tashqi qirra** ni belgilang.

**Sirt qurilgan boʻlsa-da, umuman gorizontal yoʻq.**
Yoki **Koʻrsatish** boʻlimida {{ui:Gorizontallar}} oʻchirilgan, yoki interval juda kichik, shuning uchun 2,000 dan ortiq gorizontal sath chiqadi. Kattaroq interval tanlang.

**Sinuvchi chiziqlar yoki chegara hech narsani oʻzgartirmaydi.**
Sirt LandXML fayldan olingan ("Sirt (LandXML fayldan)"). U shundayligicha ishlatiladi. Nuqtalardan qurish uchun {{ui:Sirtni nuqtalardan qayta qurish}} tugmasini bosing.

**"Hali sirt yoʻq: avval geodezik nuqtalarni oching."**
Sinuvchi chiziq, chegara va platforma mavjud yer sirtini talab qiladi. Avval nuqtalarni import qiling.

**"Balandlikka ega geodezik nuqtani bosing: sinuvchi chiziq nuqtalarning balandliklarini oladi."**
{{ui:Sinuvchi chiziq}} asbobi faqat geodezik nuqtalarni tanlaydi. Kattalashtiring va nuqtani bosing (toʻq sariq kvadrat qaysi nuqta olinishini koʻrsatadi).

## Chizish

**Tugatish uchun ikki marta bosganimda oxirgi nuqta yoʻqolib qoldi.**
Bu versiyada ikki marta bosish trassa, platforma, sinuvchi chiziq yoki chegarani tugatadi, lekin ikki marta bosilgan nuqtani tashlab yuboradi. Oxirgi nuqtani bir marta bosing va {{key:Enter}} tugmasini bosing. Agar bu allaqachon sodir boʻlgan boʻlsa, {{key:Mod+Z}} bilan ortga qaytaring, soʻng qayta chizing.

**Planshetda chizmani tugatolmayman.**
Tugatish uchun {{key:Enter}} kerak; ekrandagi tugma hali yoʻq. Klaviaturani ulang. Qarang: [Sichqoncha, sensorli panel va teginish](topic:keyboard#mouse-trackpad-and-touch).

**Nuqtani joylash uchun sudrash oʻrniga reja suriladi.**
Bir necha pikseldan ortiq sudrash har qanday asbobda rejani suradi. Qimirlatmasdan bosing.

**"Trassa uchun kamida ikkita nuqta kerak." / "Platforma uchun kamida uchta burchak kerak." / "Quvur yoʻnalishi uchun kamida ikkita inshoot kerak."**
{{key:Enter}} ni juda erta bosdingiz. Chizma bekor qilinadi; qaytadan boshlang.

**A yoki G kabi tugmalar hech narsa qilmaydi.**
Matn maydoni yoki paneldagi roʻyxat hali fokusda, shuning uchun harflar unga yoziladi. Rejani bir marta bosing, soʻng tugmani bosing. Mac kompyuterda brauzer uchun oʻchirish tugmasi Backspace hisoblanadi: tanlovni oʻchirish uchun Fn va delete tugmalaridan foydalaning.

## Trassalar va profillar

**"PI 2 va PI 3 dagi egri chiziqlar ustma-ust tushadi: … Kichikroq radiuslardan foydalaning."**
Ikki egri chiziqqa ularning PI lari orasida bor tangensdan koʻproq kerak. PI jadvalida bir yoki ikkala radiusni kamaytiring yoki PI larni bir-biridan uzoqlashtiring.

**"PI 3 toʻgʻri orqaga buriladi; unga egri chiziq qoʻyib boʻlmaydi."**
Trassa oʻsha PI da oʻzini oʻzi orqaga qaytaradi. PI ni koʻchiring yoki oʻchiring.

**"Bu trassa ostida boshlanish uchun yer yoʻq."**
Trassa sirtdan tashqarida. Uni sirt ustiga koʻchiring yoki {{ui:PVI qoʻshish}} yoqilgan holda bosib PVI lar qoʻshing.

**"PVI 3 dagi vertikal egri chiziq (L = …) oldingi egri chiziq yoki PVI tugashidan oldin boshlanadi." / "… keyingi PVI dan oʻtib ketadi."**
Egri chiziq uzunligini qisqartiring yoki PVI larni bir-biridan uzoqlashtiring.

**"Allaqachon PVI bor: …"**
Bu piketda PVI mavjud. Boshqa joyni bosing yoki mavjud PVI ni sudrang.

**Profil koʻrinishi boʻsh: "Uning profilini koʻrish uchun trassa chizing."**
Trassa yoʻq yoki tanlangan trassada xatolar bor.

## Koridorlar va platformalar

**"Koridor uchun xatosiz loyiha profili kerak."**
Loyiha profilini boshlang ({{ui:Yer yuzasidan boshlash}}) va egri chiziqlarning ustma-ust tushishini tuzating.

**"… yon nishablari yerga yetmasdan sirtdan chiqib ketadi." / "… nishab chiziqlari unga yetmasdan sirtdan chiqib ketadi …"**
Qiyalik yerga yetmasdan sirt chetiga yetadi. Loyihani chetdan ichkariga suring yoki yerga yaqinlashtiring. Sirtdan qisman chiqib turgan yangi platforma 0 balandlikdan boshlanishi mumkin: haqiqiy balandlikni kiriting.

**"Koridorning ochiq chiziqlari kesishadi …" / "Ochiq chiziq oʻzini oʻzi kesib oʻtadi …"**
Turli tomondan kelgan nishablar bir-biriga tegadi: keskin egri chiziqlar, tor platformalar, chuqur kesmalar yoki baland toʻldirmalar. Kattaroq radius, torroq yigʻma, kengroq platforma yoki tikroq nishablardan foydalaning.

**"Hajmlar hali yoʻq: platforma muammosiz tekislanishi kerak."**
Undan yuqoridagi qizil quti ichida koʻrsatilgan muammolarni tuzating.

**{{ui:Loyihalangan (qiyalik berilgan)}} faol emas.**
Hali hech bir platforma yoki koridor tekislanmagan.

## Quvurlar

**"P2 da hali tub balandliklari yoʻq."**
{{ui:Tub balandliklarini qoidalar boʻyicha oʻrnatish}} tugmasini bosing yoki tub balandliklarini kiriting.

**"P1: S1 da boshlanish uchun yer yoʻq."**
Yuqori oqim inshooti sirtdan tashqarida va ustki chekkasi yoʻq. Unga ustki chekka balandligini kiriting.

**Inshootni koʻchirganimdan keyin har bir quvur belgilandi.**
Inshootni koʻchirish tub balandliklarini oʻzgartirmaydi. {{ui:Barcha tub balandliklarini qoidalar boʻyicha oʻrnatish}} tugmasini bosing.

Barcha tarmoq xabarlari [Gravitatsion quvur tarmogʻini loyihalash](topic:pipe-network#read-and-fix-problems) boʻlimida tushuntirilgan.

## Saqlash va eksport

**"Hali eksport qilinadigan narsa yoʻq." / "Hali chizish uchun narsa yoʻq."**
Loyiha boʻsh. Avval nuqtalarni import qiling.

**Saqlangan faylni topa olmayapman.**
U brauzerning yuklab olingan fayllari ichida (odatda "Yuklab olingan fayllar" jildida). Qarang: [Ochish, saqlash va eksport qilish mumkin boʻlgan fayllar](topic:files#where-the-files-go).

**Qogʻozda PDF masshtabi notoʻgʻri.**
100% yoki haqiqiy oʻlchamda chop eting, "sahifaga moslash" da emas.

**PDF matnida soʻroq belgilari.**
Nomlar yoki tavsiflarda Gʻarbiy Yevropa toʻplamidan tashqari belgilar bor. Holat xabarida ularning soni koʻrsatiladi. Oddiy belgilar bilan qayta nomlang.

**Chizma chetlaridan kesilgan.**
Masshtab varaq uchun juda katta. "(moslashadi)" deb belgilangan masshtabni, kattaroq varaqni yoki {{ui:Ekrandagi koʻrinish}} ni tanlang.

**{{key:Mod+P}} brauzerning chop etish dialogini ochdi.**
Sahifa fokusda emas edi. Dialogni yoping, rejani bosing va {{key:Mod+P}} ni qayta bosing, yoki {{ui:PDF}} tugmasini bosing.

## Ilovaning oʻzi

**Ekran boʻsh yoki asboblar paneli ishlamaydi.**
Chrome, Edge, Firefox yoki Safari brauzerining joriy versiyasidan foydalaning va sahifani qayta yuklang. Qarang: [Brauzerlar](common:browsers).

**Katta nuqta faylida ilova sekin ishlaydi.**
{{ui:Uchburchaklar}}, {{ui:Nuqta yozuvlari}} va {{ui:Balandlik zonalari}} ni oʻchiring hamda kattaroq gorizontal intervaldan foydalaning. Juda katta sirtlar har bir oʻzgarishdan keyin qayta qurilish uchun bir oz vaqt oladi.

**Brauzer "Saytni tark etasizmi?" deb soʻraydi.**
Loyihada saqlanmagan oʻzgarishlar bor. Qolish, {{key:Mod+S}} bilan saqlash, soʻng chiqish.
