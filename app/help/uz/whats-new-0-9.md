---
title: Yangiliklar 0.9 da (oldinroq)
summary: Koridor va relyef shablonlari, chizish paytida tutib olish va tanlash tugmalari, atributlar jadvali bilan GIS tahlili, sayt uchun soya, quyosh energiyasi hosildorligi, qulaylik va shamol tadqiqotlari, 3D Render koʻrinishi hamda Nuqta bulutlari va WaterCraft qoʻshimchalari.
keywords: yangiliklar 0.9, oldingi versiya, yangiliklar, 0.9, versiya haqida xabarlar, koridor shablonlari, relyef shablonlari, shablon muharriri, tipik kesim, bir nechta koridor, tutib olish, tanlash, koʻchirish, nusxalash, burish, tangens, render, 3d render, gis tahlili, bufer, qoplash, fazoviy birlashtirish, atributlar jadvali, atribut boʻyicha uslub, soya tadqiqoti, quyosh energiyasi, utci, ochiq havodagi qulaylik, shamol tadqiqoti, openfoam, nuqta bulutlari, las, laz, watercraft, yongʻin oqimi, gidrant, suv yoshi, xlor, isteʼmol, maslahatlar, tartib, yangiliklar, oʻzgarishlar jurnali, 0.8, 0.8.1, versiya, yangi imkoniyatlar, yomgʻir, ariq, hajm, balans, kesish va toʻldirish, tashish, eng yaxshi yoʻnalish, trassa, ushlab turuvchi havza, chiqish, drenaj, erkin balandlik, jarayon, surveylar, dron, zaxira, manzildan maydonga, uchastka, tuproq, toshqin, choʻkish, tutashuv, chiziqlash, belgilar, koʻrish masofasi, tuzatish, kichik kvadratlar, berk poligon, ochiq kon, blok modeli, radio aloqa, fresnel, strelka, krossover, tillar, muammolar, jonli, dwg
from: 4664522c
---

Bu CivilCraft 0.9 da 0.8.1 bilan solishtirganda nima oʻzgargani. CivilCraft 0.9 CadCraft Studio 0.9 va uning sakkizta ilovasining bir qismi. Asosiy qismlar: koridor va relyef shablonlari, chizish paytida tutib olish, GIS tahlili, sayt quyoshi, quyosh energiyasi hosildorligi, qulaylik va shamol tadqiqotlari hamda ikkita qoʻshimcha: Nuqta bulutlari va WaterCraft.

## Yangi

### Koridor va relyef shablonlari

- **Koridor shablonlari.** {{ui:Yuza}} › {{ui:Yana}} › {{ui:Koridor shablonlari…}} ni oching (yoki {{cmd:TEMPLATES}} ni yozing). Shablon — tarkibiy qismlar, siljishlar, qiyaliklar, materiallar va nuqta kodlari bilan kichik koʻndalang kesim. Ularni loyihada, {{ui:Mening kutubxonam}} da yoki `.cctemplates.json` fayl sifatida saqlang. Shablon muharriri haqiqiy masshtabli chizmani koʻrsatadi va siz yozayotganda muammolarni roʻyxatlaydi.
- **Shablonlar boʻyicha piketdan qurish.** Trassani tanlang va uning Xususiyatlarida {{ui:Shablonlar boʻyicha piketdan qurish}} ni yoqing. Har bir mintaqaning har bir tomonida oʻz qoplama roʻyxati va oʻz yakuniy sharti boʻladi. {{ui:Bu trassadagi koridorlar}} ostidagi {{ui:Koridor qoʻshish}} bitta trassaga bir nechta koridor qoʻyadi.
- **Relyef shablonlari.** {{ui:Yuza}} › {{ui:Yana}} › {{ui:Relyef shablonlari…}} (yoki {{cmd:TERRAINTEMPLATES}} ni yozing) relyefga unumdor tuproq yoki qoplama va asos kabi qatlamli materiallarni yoyadi, har bir qatlam uchun maydon va hajm bilan. Qarang: [Koridor shablonlari va relyef shablonlari](topic:corridor-templates).

### Chizish

- **Tutib olish.** Trassa, maydoncha, uchastka, massa, xususiyat chizigʻi, oʻlchash, chegara va suv yigʻish hududi asboblari survey nuqtalari, PI lar, burchaklar, choʻqqilar va inshootlarga tutib oladi; marker yonida yorliq bilan. Erkin nuqta uchun {{key:Alt}} ni bosib turing.
- **Tanlash tugmalari, tangens va koʻchirish, nusxalash, burish.** Maydoncha, uchastka va xususiyat chizigʻi burchaklarida Sharqiy (Easting) va Shimoliy (Northing) katakchalari hamda xoch-nishonli Tanlash tugmasi bor. Xususiyatlarda trassalar uchun {{ui:Ikki nuqtadan tangens}} va trassalar, maydonchalar, uchastkalar va xususiyat chiziqlari uchun {{ui:Koʻchirish, nusxalash va burish}} ham bor. Qarang: [Tutib olish, tanlangan burchaklar va koʻchirish, nusxalash, burish bilan chizish](topic:draft-with-snaps).
- **3D da render koʻrinishi.** 3D panelidagi {{ui:Render}} tugmasi yerni tabiiy ranglar, osmon, tumanlik va yumshoq soyalar bilan chizadi. Model oʻzgarmaydi. {{ui:Quyosh}} menyusida endi {{ui:Qoʻllash}} va {{ui:Yopish}} tugmalari bor. Qarang: [3D da saytni koʻrish](topic:site-3d).
- **Paneller bir vaqtda bitta boʻlim ochadi.** Chap panel va Xususiyatlar paneli bitta boʻlimni ochadi va boshqalarini yopadi; bir nechta asbobni saqlaydigan Landshaft lentasi plitkalari boʻlinadigan tugmalardir.

### GIS tahlili

- **Tahlil.** {{ui:Yuza}} › {{ui:Yana}} › {{ui:Tahlil}} bufer, qoplash, fazoviy birlashtirish, atribut yoki shakl boʻyicha tanlash va oʻlchashni taklif qiladi. Har bir asbob bitta bekor qilish qadamida yangi qatlam yaratadi.
- **Atributlar jadvali.** Qatlamning uch nuqtali menyusida {{ui:Atributlar jadvali…}} va {{ui:Atribut boʻyicha uslub…}} bor. Qarang: [GIS qatlamlarini tahlil qilish](topic:gis-analysis) va [Qatlamning atributlar jadvali bilan ishlash](topic:gis-table).

### Sayt: quyosh, quyosh energiyasi, qulaylik va shamol

- **Muhit boʻlimi.** Massani tanlang: {{ui:Muhit}} boʻlimi uning Xususiyatlarida {{ui:Quyosh soatlari}} ostida joylashgan. Unda soyani oʻrganish (xarita, jadval, animatsiya, CSV), bir yillik ob-havo fayli (.epw) asosida quyosh energiyasi hosildorligi va ochiq havodagi qulaylik (UTCI) bor.
- **Shamol, faqat skrining.** {{ui:Shamol tahlilini ishga tushirish}} har bir shamol yoʻnalishi uchun ob-havo faylidagi yerni oʻtirish mumkin boʻlgandan noqulaygacha boʻyaydi. Natija tasdiqlanmagan va panelda shunday yozilgan.
- **Piyodalar shamoli (OpenFOAM) qoʻshimchasi.** {{ui:Sozlamalar}} › {{ui:Qoʻshimchalar}} da yoqmaguningizcha oʻchiq. OpenFOAM siz oʻzingiz oʻrnatadigan dastur. Qarang: [Soya, quyosh energiyasi hosildorligi va ochiq havodagi qulaylik](topic:environment).

### Nuqta bulutlari (qoʻshimcha)

- {{ui:Sozlamalar}} › {{ui:Qoʻshimchalar}} da {{ui:Nuqta bulutlari}} ni yoqing; oʻng panelda Nuqta bulutlari yorligʻi paydo boʻladi. LAS yoki LAZ faylni oching, uni tozalang, yer, oʻsimlik va binolarga ajrating, yer, konturlar va hajmlarni yarating hamda LAS yoki LAZ ni eksport qiling. Qarang: [Dron yoki skanerdan nuqta bulutlari](topic:point-clouds).

### WaterCraft (qoʻshimcha)

- {{ui:Sozlamalar}} › {{ui:Qoʻshimchalar}} da {{ui:WaterCraft (suv taqsimoti)}} ni yoqing; WaterCraft yorligʻi paydo boʻladi. Unda mijozlardan isteʼmol, har bir gidrantda yongʻin oqimi, qaysi magistral uzilishi muhimroq ekani, suv yoshi va xlor — har biri CSV sifatida saqlanadi. Qarang: [WaterCraft: isteʼmol, yongʻin oqimi, uzilishlar va suv yoshi](topic:watercraft).

### Birgalikda ishlash

- Jonli seansda rejada bir-birining kursorlari va ismlarini koʻrasiz. Kutubxona oʻsimliklari: CivilCraft landshafti odatiy Kutubxona toʻplamidan boshlanadi, {{ui:CivilCraft landshafti}}.

## Har bir ilovada

- Maslahatlar Bootstrap tooltip shaklida koʻrinadi, boshlangʻich maslahatni yopish mumkin.
- Panel yorliqlari qatori sigʻmasa, kesilmasdan aylantiriladi.
- Brauzer yorliq sarlavhalari `<hujjat> - CivilCraft | CadCraft` koʻrinishida boʻladi.
- {{ui:Sozlamalar}} da Joylashuv boʻlimi bor, unda joylashuvlar ikki qatorli variantlardan iborat ochiladigan roʻyxat.
- Vazn va harorat birliklari {{ui:Sozlamalar}} › {{ui:Global}} › {{ui:Birliklar}} da.
- Til roʻyxatida ushbu versiya uchun fayllari bor tillar koʻrsatiladi. Inglizchadan boshqa tillar mashina qoralamalari.

## Tuzatilgan

- Manzil qidiruvi va EnergyPlus tekshiruvi qoʻshimchalarini yoqib boʻlmasdi; endi yoqish mumkin.
- Yordamda endi Nuqta bulutlari qoʻshimchasi tozalangan bulutni LAS 1.4 yoki LAZ sifatida yozishi aytiladi.
- Tanlangan obyektning oʻz dastagini bosish endi kutayotgan tanlashni toʻxtatuvchi dastak sudrashni boshlamaydi.

## Haqiqiy cheklovlar

- Namunaviy koridor shablonlari hech qanday standartga asoslanmagan vaqtinchalik qiymatlar; ularni muhandis tekshirishi kerak. Relyef shablonlari yuza qoʻshmaydi va 3D da yoki kesim koʻrinishida chizilmaydi. Trassadagi ikkinchi koridor IFC eksportiga kirmaydi. Piket boʻyicha ikki shablon orasida silliq oʻtish yoʻq.
- Nuqta bulutlari oʻylab topilgan fayllarda sinalgan, haqiqiy dron soʻrovida emas. Faqat LAS va LAZ oʻqiladi.
- GIS tahlili oʻylab topilgan qatlamlarda sinalgan.
- Soya, quyosh va qulaylik — rejalashtirish uchun taxminlar; shamol tasdiqlanmagan skrining. Bularning hech biri loyiha qiymati emas.
- WaterCraft oʻylab topilgan tarmoqlarda tekshirilgan hisoblash vositasi. Raqamlarning qiymatini suv muhandisi hal qiladi.
- Inglizchadan boshqa tillar mashina qoralamalari.
- Windows oʻrnatuvchilari kod bilan imzolanmagan, macOS disk tasviri esa notarizatsiya qilinmagan.

## Oldinroq: 0.8 va 0.8.1

Bu CivilCraft 0.8 (2026-11-01) va 0.8.1 (2026-11-02) da 0.7 bilan solishtirganda nima oʻzgargani. Asosiy yangi qismlar — yerni tekislash va saytni sinovdan oʻtkazuvchi asboblar (yomgʻir, yer ishlari, yoʻnalishlar, havzalar, jarayon) hamda yer, yoʻllar, geodeziya, konlar, bogʻlanishlar va temir yoʻl uchun oltita hisoblash oynasi.

### Yangi

**Tekislashni sinash**

- **Yomgʻir yoʻgʻdirish.** {{ui:Yomgʻir yoʻgʻdirish…}} ({{ui:Yuza}} ostida) tekislangan yerga yomgʻir yogʻdiradi. Suv maydonchalardan oqib tushishini, past burchaklarda toʻplanishini va juda kichik havzalardan toshib ketishini kuzatasiz. Ishga tushirish animatsiya qilinadi va hajmlar, eng yuqori chiqish oqimi hamda har bir havzaning CSV roʻyxatini beradi. Odatiy katak yirik, shuning uchun birinchi koʻrish tez; mayda katak sekinroq. Toshib ketgan havzalar Muammolar panelida ham chiqadi.
- **Tuproq ishlari balanslagich.** {{ui:Tuproq ishlari balanslagich…}} kesish toʻldirishga teng boʻlguncha maydonchani koʻtaradi yoki pasaytiradi va ular orasidagi tashish jadvalini koʻrsatadi.
- **Eng yaxshi yoʻnalish.** {{ui:Eng yaxshi yoʻnalish…}}: boshlanish va tugash nuqtasini tanlang; CivilCraft siz belgilagan qiyalik va egri chiziq chegaralariga rioya qiluvchi relyef boʻylab eng arzon yoʻlni topadi, soʻng undan trassa yaratadi.
- **Ushlab turuvchi havzalar.** {{ui:Ushlab turuvchi havzalar…}} yeringizdan bosqich va saqlash hajmini hisoblaydi, chiqish qurilmalarini (teshik, toʻgʻon, V-shaklli kesik, tashlama) qabul qiladi, havzadan yomgʻir suvini oʻtkazadi va ushlab qolingan eng yuqori oqim, pasayish vaqti va erkin balandlikni tekshiradi.
- **Surveylar boʻyicha jarayon.** {{ui:Surveylar boʻyicha jarayon…}} turli sanalardagi dron yoki skaner yuzalarini dastlabki yer bilan va loyiha bilan solishtiradi: hajm boʻyicha bajarilgan foiz, ortiqcha kovlangan va ortiqcha toʻldirilgan maydonlar, uyumlar va shu surʼatda ish qachon tugashi (taxminiy deb belgilangan).

**Saytni bilish**

- **Manzildan maydonga.** {{ui:Manzildan maydonga…}} ochiq uchastka, bino, zonalash, tuproq, toshqin va relyef maʼlumotlarini bitta saytda yigʻadi. Saytni loyiha faylida saqlashingiz mumkin: kiritilgan manzil, har bir manba va uni olgan kuni hamda litsenziyasi, qaytgan natija. Loyihani qayta oching yoki ulashing — sayt joyida boʻladi va hech narsa qayta olinmaydi. Uni sayt fayli sifatida saqlash yoki BimCraftʼga yuborish ham mumkin. Qarang: [Manzildan maydonga](topic:address-to-site).

**Yer, yoʻllar, geodeziya, konlar, bogʻlanishlar va temir yoʻl**

- **Tuproqlar va qiyaliklar.** {{ui:Tuproqlar va qiyaliklar…}} siz kiritgan burgʻulash nuqtalari orasida tuproq profilini chizadi. Soʻng Bishop usuli yeringizda xavfli aylanani izlaydi, yer osti suvi, qoʻshimcha yuklama va zilzila koeffitsiyenti bilan; poydevor choʻkishi konsolidatsiya, darhol choʻkish va vaqtni hisobga oladi.
- **Chorrahalar va chiziqlash.** {{ui:Chorrahalar va chiziqlash…}} shoxlarni bordyur burilishlari bilan birlashtiradi (har bir shox uchun bitta radius yoki uch markazli burilishlar), loyiha tezligi uchun koʻrish masofasi, koʻrish uchburchaklarini tekshirish, piyodalar oʻtish joylari, toʻxtash chiziqlari, belgilar va yorliqlar bilan belgilar jadvali. Ular rejada chiziladi va nomlangan qatlamlar bilan .dxf sifatida saqlanadi.
- **Geodezik tuzatish.** {{ui:Geodezik tuzatish…}} poligon yoki tarmoqning eng kichik kvadratlar boʻyicha tuzatishini bajaradi: tuzatilgan koordinatalar, xato ellipslari, xi-kvadrat sinovi va toʻgʻri kelmaydigan oʻlchovga belgi. Erkin tarmoqlar, kompas qoidasi bilan poligonni yopish va RW5, GSI, JobXML yoki CSV dala fayllari kiritilgan, tuzatilgan nuqtalar CSV ga saqlanadi.
- **Ochiq konlar.** {{ui:Ochiq konlar…}} burgʻulash namunalarini blok modelga va qiyalik burchagingiz ichidagi oxirgi konga aylantiradi: yopiq qatlam nisbati, pogʻona boʻyicha jadval va tarkib hamda tonnaj egri chizigʻi bilan. Daromad koeffitsiyenti boʻyicha ichki konlar va diskontlangan pul oqimi bilan ishlab chiqarish jadvali ham bor.
- **Radio aloqa liniyalari.** {{ui:Radio aloqa liniyalari…}} yeringiz ustidan koʻrish chizigʻini Yerning qavariqligi, birinchi Fresnel zonasi, aloqa byudjeti, susayish zaxirasi va koʻp yoʻlli uzilish bilan tekshiradi hamda yoʻlni tozalaydigan machta balandligini beradi. Shuningdek, tolali optika yoʻqotish byudjeti, yoʻnalish miqdorlari va minoradagi shamolni hisoblaydi.
- **Temir yo‘l strelkalari.** {{ui:Temir yo‘l strelkalari…}} burilish strelkasini uning yurak raqamidan (frog), parallel yoʻllar orasidagi oʻtish yoʻllarini va qiyalik bilan egilgan hamda egri chiziqda kengaygan inshoot oʻlchamini yaratadi. Strelka trassaning piketida joylashishi mumkin.

Qarang: [Tuproqlar, yoʻllar, geodeziya, konlar va bogʻlanishlar](topic:soils-roads-survey-mines-links).

### Har bir ilovada

- **Tillar.** 54 ta til, ulardan oʻntasi yangi. Inglizchadan boshqa tillar ona tilida soʻzlovchi oʻqib chiqmaguncha mashina qoralamalari. Yordam mavzulari hali asosan inglizcha.
- **Asboblar paneli qatorlari.** {{ui:Sozlamalar}} › {{ui:Umumiy}} › {{ui:Asboblar paneli qatorlari}}: oʻrash (avvalgidek), 2 qator yoki 1 qator. CivilCraft lentasi eng koʻp ishlatiladigan asbobni katta, keyingilarini kichik, qolganlarini guruh nomining strelkasi ortida koʻrsatadi.
- **Kiritish qurilmalari.** Sensorli panel, qalam, 3D sichqoncha, boshqaruvchi va MIDI ilovalarni boshqarishi mumkin.
- **Muammolar.** Har bir ilovada ogohlantiradigan Muammolar paneli; tekshiruvlar tartibga solish paketlarini oʻqiydi.
- **Jonli.** Jonli seansda kim qayerdaligini koʻrish.
- **Qoʻshimchalar.** Qoʻshimchalar roʻyxati, yorituvchi qoʻshimchalar bilan.
- **AI ulash.** Ulagan har qanday yordamchi CivilCraft asboblarini boshqarishi mumkin. Unga CadCraft Studio ichida bir tugma bilan ulanish va hosting ulagich hali tayyor emasligi haqida eslatma bor. Qarang: [AI yordamchisi bilan saytda ishlash](topic:assistants).

### 0.8.1 da tuzatilgan

- **DWG sinflar boʻlimi.** U notoʻgʻri turda oʻqilgan edi (GitHub cadcraft#5). CivilCraftʼda CadCraft, BimCraft, ModelCraft va TakeoffCraft bilan birga tuzatildi.
- **Ishlayotgan paytda tilni almashtirish.** CadCraft Studio va jamlangan nashrlar ishlash vaqtida tilni oʻzgartirishi mumkin. Oldin ular faqat inglizcha edi. Hali har bir platformada sinalmagan: til oʻzgarmasa, bizga xabar bering.

### Bu versiyada hali yoʻq

- **Bular hisoblash vositalari.** Yangi oynalardagi har bir natija muhandis tekshiruvini talab qiladi. Tuproq mustahkamligi tuproq guruhi uchun odatiy qiymatlardan boshlanadi va oyna buni aytadi.
- **Yomgʻir yoʻgʻdirish.** Namunaviy saytda mayda katakli ishga tushirish brauzerda ikki daqiqadan oshishi mumkin. U qoʻlda hisoblangan holatlar va V shaklidagi suv yigʻish hududi bilan tekshirilgan, hali haqiqiy tekislangan saytda emas.
- **Manzildan maydonga.** U siz olib kelgan ochiq maʼlumot fayllarini oʻqiydi va faqat oʻz fayllarimizda sinalgan. Daraxtlar manba emas. Siz uchun manbalarni olish maxfiylik matni tayyor boʻlishini kutadi.
- **Surveylar boʻyicha jarayon.** Faqat oʻylab topilgan surveylarda sinalgan. Varaqlar va belgilashlar (MarkupCraft) boʻyicha jarayon hamda skanerni model (BimCraft) bilan solishtirish qurilmagan.
- **Tuproqlar va qiyaliklar.** Faqat aylana yuzalar: ponali yoki blokli qidiruv va choʻzilish yoriqi yoʻq.
- **Tutashuvlar.** Har bir shox uchun bitta radius, yuk mashinalarining burilish izlari yoʻq va ular hali koridorga kirmaydi.
- **Dala fayllari.** Oʻqigichlar ochiq format tavsiflari asosida yozilgan va biz yaratgan fayllarda sinalgan. Haqiqiy asbob fayllari kerak.
- **Bogʻlanishlar va temir yoʻl.** Radio aloqa: faqat boʻshliqdagi yoʻqotish va koʻp yoʻlli (yomgʻir susayishi yoki antenna diagrammalari yoʻq); temir yoʻl standarti yoʻq: har bir temir yoʻl chegarasi vaqtinchalik qiymat boʻlib, hech bir temir yoʻl muhandisi tekshirmagan qoralama raqamlar bilan.
- **Windows va macOS.** 0.8 kod bilan imzolanmagan. Windows ogohlantirishi mumkin, macOS esa sichqonchaning oʻng tugmasini bosib, soʻngra Ochish soʻraydi.

Qolgan hammasi: [Hali qurilmagan](topic:not-built-yet). Oldingi versiya uchun qarang: [0.7 dagi yangiliklar](topic:whats-new-0-7).
