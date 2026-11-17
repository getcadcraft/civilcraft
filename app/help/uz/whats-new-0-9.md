---
title: 0.9 versiyasidagi yangiliklar
summary: Koridor va relyef shablonlari, chizish vaqtida ilashish va Koʻrsatish tugmalari, atribut jadvali bilan GIS tahlili, hudud uchun soya, quyosh unumdorligi, qulaylik va shamol tadqiqotlari, 3D Render koʻrinishi hamda Nuqta bulutlari va WaterCraft qoʻshimchalari.
keywords: yangiliklar, 0.9, reliz eslatmalari, koridor shablonlari, relyef shablonlari, shablon muharriri, tipik kesim, bir nechta koridor, ilashish, ilashishlar, koʻrsatish, koʻchirish, nusxalash, burish, tangens, render, 3D render, GIS tahlili, bufer, qoplash, fazoviy birikma, atribut jadvali, atribut boʻyicha uslub, soya tadqiqoti, quyosh unumdorligi, utci, tashqi qulaylik, shamol tadqiqoti, openfoam, nuqta bulutlari, las, laz, watercraft, yongʼin oqimi, gidrant, suv yoshi, xlor, talablar, maslahatlar, joylashuv, yomgʻir, boʻron, toʻplanish, toʻlib oqish, yer ishlari, balans, kesish va toʻldirish, tashish, eng yaxshi yoʻnalish, eng kam narx, trassa, saqlash havzasi, chiqish, pasayish, bort balandligi, jarayon, survey, dron, uyum, manzildan maydonga, parsel, tuproq, toshqin, qiyalik barqarorligi, bishop, choʻkish, chorraha, chiziqlash, belgilar, koʻrinish masofasi, tuzatish, eng kichik kvadratlar, traverz, ochiq kon, blok modeli, radio aloqa liniyasi, fresnel, strelka, kesishma, tillar, muammolar, live, dwg, 0.8, 0.8.1, versiya, yangi imkoniyatlar, oʻzgarishlar, oʻzgarishlar jurnali, nima yangi, yangilanish, AI, yordamchi
from: d7ac5b14
---

Bu CivilCraft 0.8.1 bilan solishtirganda CivilCraft 0.9da oʻzgargan narsalar. CivilCraft 0.9 CadCraft Studio 0.9 tarkibiga kiradi va uning sakkizta ilovasiga tegishli. Asosiy qismlari: koridor va relyef shablonlari, chizish vaqtida ilashish, GIS tahlili, hududning quyoshi, quyosh unumdorligi, qulaylik va shamol tadqiqotlari hamda ikkita qoʻshimcha: Nuqta bulutlari va WaterCraft.

## Yangi

### Koridor va relyef shablonlari

- **Koridor shablonlari.** {{ui:Yuza}} › {{ui:Yana}} › {{ui:Koridor shablonlari…}} ni oching (yoki {{cmd:TEMPLATES}} deb yozing). Shablon — komponentlar, siljishlar, qiyaliklar, materiallar va nuqta kodlari bilan kichik kesim. Ularni loyihada, {{ui:Mening kutubxonam}} ichida yoki `.cctemplates.json` fayli sifatida saqlang. Shablon muharriri haqiqiy masshtabdagi chizmani koʻrsatadi va siz yozayotganda muammolarni roʻyxatlaydi.
- **Stansiya boʻyicha shablonlardan qurish.** Trassani tanlang va uning Xususiyatlarida {{ui:Stansiya boʻyicha shablonlardan qurish}} ni yoqing. Har bir mintaqaning har bir tomoni oʻz qoplama roʻyxatiga va oʻz tugash shartiga ega. {{ui:Bu trassadagi koridorlar}} ostidagi {{ui:Koridor qoʻshish}} bitta trassada bir nechta koridorni joylashtiradi.
- **Relyef shablonlari.** {{ui:Yuza}} › {{ui:Yana}} › {{ui:Relyef shablonlari…}} (yoki {{cmd:TERRAINTEMPLATES}} deb yozing) unumdor tuproq yoki qoplama kabi qatlamli materiallarni relyefga joylashtiradi va har bir qatlam boʻyicha maydon hamda hajmni koʻrsatadi. Qarang: [Koridor shablonlari va relyef shablonlari](topic:corridor-templates).

### Chizish

- **Ilashish.** Trassa, Maydon, Parsel, Massa, Xususiyat chizigʻi, Oʻlchash, Chegara va Yigʻish havzasi asboblari geodezik nuqtalar, PI nuqtalari, burchaklar, uchlar va inshootlarga ilashadi; belgi yonida yorliq chiqadi. Erkin nuqta uchun {{key:Alt}} ni bosib turing.
- **Koʻrsatish tugmalari, tangens va koʻchirish, nusxalash, burish.** Maydon, parsel va xususiyat chizigʻi burchaklarida Sharqiy (Easting) va Shimoliy (Northing) qiymatlarni kiritish maydonlari hamda krest koʻrinishidagi Koʻrsatish tugmasi bor. Xususiyatlarda trassalar uchun {{ui:Ikki nuqtadan tangens}} va trassalar, maydonlar, parsellar hamda xususiyat chiziqlari uchun {{ui:Koʻchirish, nusxalash va burish}} ham bor. Qarang: [Ilashish, koʻrsatilgan burchaklar va koʻchirish, nusxalash, burish bilan chizish](topic:draft-with-snaps).
- **3D da Render koʻrinishi.** 3D panelidagi {{ui:Render}} tugmasi yerni tabiiy ranglar, osmon, tuman va yumshoq soyalar bilan chizadi. U modelni oʻzgartirmaydi. {{ui:Quyosh}} menyusida endi {{ui:Qoʻllash}} va {{ui:Yopish}} tugmalari bor. Qarang: [Hududni 3D da koʻrish](topic:site-3d).
- **Panellar bir vaqtda bitta boʻlimni ochadi.** Chap panel va Xususiyatlar paneli bitta boʻlimni ochadi va boshqalarini yopadi; bir nechta asbobni saqlaydigan Landshaft lentasi plitalari boʻlinadigan tugmalardir.

### GIS tahlili

- **Tahlil.** {{ui:Yuza}} › {{ui:Yana}} › {{ui:Tahlil}} bufer, qoplash, fazoviy birikma, atribut yoki shakl boʻyicha tanlash va oʻlchashni taklif qiladi. Har bir asbob bitta bekor qilish qadamida yangi qatlam yaratadi.
- **Atribut jadvali.** Qatlamning uch nuqtali menyusida {{ui:Atributlar jadvali…}} va {{ui:Atribut boʻyicha uslub…}} bor. Qarang: [GIS qatlamlarini tahlil qilish](topic:gis-analysis) va [Qatlamning atribut jadvali bilan ishlash](topic:gis-table).

### Hudud: quyosh, quyosh energiyasi, qulaylik va shamol

- **Muhit boʻlimi.** Massani tanlang: {{ui:Muhit}} boʻlimi uning Xususiyatlarida {{ui:Quyosh soatlari}} ostida joylashgan. Unda soya tadqiqoti (xarita, jadval, animatsiya, CSV), tipik yil ob-havo fayli (.epw) asosida quyosh unumdorligi va tashqi qulaylik (UTCI) bor.
- **Shamol, faqat dastlabki baho.** {{ui:Shamol tadqiqotini ishga tushirish}} ob-havo faylidagi har bir shamol yoʻnalishi uchun yerni oʻtirish mumkin boʻlganidan tpartov boʻlguncha boʻyaydi. U tasdiqlanmagan va panelda shunday deyiladi.
- **Piyodalar shamoli (OpenFOAM) qoʻshimchasi.** {{ui:Sozlamalar}} › {{ui:Qoʻshimchalar}} da yoqmaguningizcha oʻchiq. OpenFOAM — siz oʻzingiz oʻrnatadigan dastur. Qarang: [Soya, quyosh unumdorligi va tashqi qulaylik](topic:environment).

### Nuqta bulutlari (qoʻshimcha)

- {{ui:Sozlamalar}} › {{ui:Qoʻshimchalar}} boʻlimida {{ui:Nuqta bulutlari}} ni yoqing; oʻng panelda Nuqta bulutlari yorligʻi paydo boʻladi. LAS yoki LAZ faylini oching, uni tozalang, yer, oʻsimlik va binolarga ajrating, yer, gorizontallar va hajmlarni yarating hamda LAS yoki LAZ sifatida eksport qiling. Qarang: [Dron yoki skanerdan nuqta bulutlari](topic:point-clouds).

### WaterCraft (qoʻshimcha)

- {{ui:Sozlamalar}} › {{ui:Qoʻshimchalar}} boʻlimida {{ui:WaterCraft (suv taqsimoti)}} ni yoqing; WaterCraft yorligʻi paydo boʻladi. Unda iste'molchilardan talablar, har bir gidrantdagi yongʼin oqimi, qaysi magistral uzilishi eng muhimligi, hamda suv yoshi va xlor bor; ularning har biri CSV sifatida saqlanadi. Qarang: [WaterCraft: talablar, yongʼin oqimi, uzilishlar va suv yoshi](topic:watercraft).

### Birgalikda ishlash

- Live seansda planda bir-biringizning kursorlari va ismlarini koʻrasiz. Kutubxona oʻsimliklari: CivilCraft Landscape oʻzining standart kutubxona toʻplamidan — {{ui:CivilCraft landscape}} dan boshlanadi.

## Har bir ilovada

- Maslahatlar Bootstrap tooltip sifatida koʻrinadi va boshlangʻich maslahatni yopish mumkin.
- Panelning yorliqlar qatori sigʻmasa, kesilmasdan aylantiriladi.
- Brauzer yorliqlarining sarlavhalari `<document> - CivilCraft | CadCraft` koʻrinishida boʻladi.
- {{ui:Sozlamalar}} da Joylashuv boʻlimi bor; unda joylashuvlar ikki qatorli variantlardan iborat ochiladigan roʻyxat.
- Vazn va harorat birliklari {{ui:Sozlamalar}} › {{ui:Global}} › {{ui:Birliklar}} da joylashgan.
- Tillar roʻyxati buildda fayllari boʻlgan tillarni koʻrsatadi. Ingliz tilidan boshqa tillar mashina qoralamalari.

## Tuzatildi

- Manzil qidiruvi va EnergyPlus tekshiruvi qoʻshimchalarini yoqib boʻlmas edi; endi mumkin.
- Yordam endi Nuqta bulutlari qoʻshimchasi tozalangan bulutni LAS 1.4 yoki LAZ sifatida yozishini aytadi.
- Tanlangan obyektning oʻz dastagini bosish endi kutilayotgan Koʻrsatish ni toʻxtatuvchi dastak sudralishini boshlamaydi.

## Haqiqiy cheklovlar

- Namunaviy koridor shablonlari hech qanday standartdan olinmagan vaqtinchalik namunalar; muhandis ularni tekshirishi kerak. Relyef shablonlari yuza qoʻshmaydi va 3D yoki kesim koʻrinishida chizilmaydi. Trassadagi ikkinchi koridor IFC eksportida yoʻq. Stansiya boʻyicha ikki shablon orasida torayish yoʻq.
- Nuqta bulutlari oʻylab topilgan fayllarda sinalgan, haqiqiy dron surveyida emas. Faqat LAS va LAZ oʻqiladi.
- GIS tahlili oʻylab topilgan qatlamlarda sinalgan.
- Soya, quyosh va qulaylik taxminiy rejalashtirish baholari; shamol esa tasdiqlanmagan dastlabki tekshiruv. Bularning hech biri loyiha qiymati emas.
- WaterCraft oʻylab topilgan tarmoqlarda tekshirilgan hisoblash yordamchisi. Raqamlar nimaga arzishini suv muhandisi hal qiladi.
- Ingliz tilidan boshqa tillar mashina qoralamalari.
- Windows oʻrnatuvchilari kod bilan imzolanmagan, macOS disk tasviri esa notarizatsiya qilinmagan.

## Oldingi: 0.8 va 0.8.1

Bu CivilCraft 0.8 (2026-11-01) va 0.8.1 (2026-11-02) versiyalarida 0.7 bilan solishtirganda oʻzgargan narsalar. Asosiy yangi qismlar — relyef, yoʻllar, marshrutlar, havzalar va jarayonni sinash asboblari (yomgʻir, yer ishlari, marshrutlar, havzalar, jarayon) hamda yer, yoʻllar, geodezik oʻlchash, konlar, aloqa va temir yoʻl uchun oltita hisoblash oynasi.

### Yangi

**Relyef loyihasini sinash**

- **Yomgʻir yoʻgʻdirish.** {{ui:Yomgʻir yoʻgʻdirish…}} ({{ui:Yuza}} boʻlimida) loyihalashtirilgan yerga boʻron yuboradi. Suvning platformalardan oqib tushishini, past burchaklarda toʻplanishini va juda kichik havzalar toʻlib oqishini kuzatasiz. Yugurish animatsiya qilinadi va hajmlar, eng yuqori chiqish oqimi hamda har bir havzaning CSV faylini beradi. Standart katak yirik, shuning uchun birinchi koʻrib chiqish tez; mayda katak sekinroq. Toʻlib oqqan havzalar Muammolar panelida ham koʻrinadi.
- **Yer ishlari balanslagich.** {{ui:Tuproq ishlari balanslagich…}} kesish fillga teng boʻlguncha platformani koʻtaradi yoki tushiradi va ular orasidagi tashish jadvalini koʻrsatadi.
- **Eng yaxshi yoʻnalish.** {{ui:Eng yaxshi yoʻnalish…}}: boshlanish va tugash nuqtasini tanlang; CivilCraft relyef boʻylab qiyalik va egrilik chegaralaringizga rioya qiladigan eng arzon yoʻlni topadi, keyin undan trassa yaratadi.
- **Ushlab turuvchi havzalar.** {{ui:Ushlab turuvchi havzalar…}} yer ma'lumotlaringizdan bosqich va saqlash hajmini hisoblaydi, chiqish qurilmalarini (teshik, toʻgʻon, V-tirqish, suv toshirgich) qabul qiladi, boronni havza orqali oʻtkazadi va ushlab qolingan eng yuqori oqimni, qurish vaqtini hamda bort balandligini tekshiradi.
- **Surveylar boʻyicha jarayon.** {{ui:Surveylar boʻyicha jarayon…}} turli sanalardagi dron yoki skaner yuzalarini yerning oʻsha paytdagi va loyihadagi holati bilan solishtiradi: hajm boʻyicha bajarilgan foiz, haddan tashqari qazilgan va toʻldirilgan hududlar, uyumlar hamda ishning bu tezlikda qachon tugashi (taxminiy deb belgilangan).

**Hududni bilish**

- **Manzildan maydonga.** {{ui:Manzildan maydonga…}} ochiq parsel, bino, zonalash, tuproq, toshqin va relyef maʼlumotlarini bitta hududda birlashtiradi. Hududni loyiha faylida saqlashingiz mumkin: yozilgan manzil, har bir manba va uni olgan kun hamda litsenziyasi, shuningdek qaytgan natija. Loyihani qayta ochsangiz yoki ulashsangiz, hudud oʻsha yerda boʻladi va hech narsa qayta olinmaydi. Uni hudud fayli sifatida saqlash yoki BimCraft ga yuborish ham mumkin. Qarang: [Manzildan maydonga](topic:address-to-site).

**Yer, yoʻllar, geodezik oʻlchash, konlar, aloqa va temir yoʻl**

- **Tuproqlar va qiyaliklar.** {{ui:Tuproqlar va qiyaliklar…}} kiritgan burgʻulash teshiklari orasida tuproq profilini chizadi. Bishop usuli keyin yerdagi tanqidiy doirani qidiradi: suv sathi, qoʻshimcha yuk va zilzila koeffitsiyenti bilan; poydevor choʻkishi konsolidatsiya, darhol choʻkish va vaqtni oladi.
- **Chorrahalar va chiziqlash.** {{ui:Chorrahalar va chiziqlash…}} shoxlarni bordyur qaytishlari bilan birlashtiradi (har bir shox uchun bitta radius yoki uch markazli qaytishlar), loyiha tezligi uchun koʻrinish masofasi, koʻrinish uchburchaklarini tekshirish, piyodalar oʻtish joylari, toʻxtash chiziqlari, belgilar va belgilar jadvali bilan. Ular planda chiziladi va nomlangan qatlamlar bilan .dxf sifatida saqlanadi.
- **Geodezik tuzatish.** {{ui:Geodezik tuzatish…}} traversning yoki tarmoqning eng kichik kvadratlar tuzatishini bajaradi: tuzatilgan koordinatalar, xato ellipslari, xi-kvadrat sinovi va oʻlchovda mos kelmagan belgi. Erkin tarmoqlar, kompas qoidasi bilan traversni yopish hamda RW5, GSI, JobXML yoki CSV dala fayllari kiritilgan; tuzatilgan nuqtalar CSV sifatida saqlanadi.
- **Ochiq konlar.** {{ui:Ochiq konlar…}} burgʻulash namunalarini blok modelga va qiyalik burchagingiz ichidagi chegaraviy karerga aylantiradi, ochish nisbati, pogʻona boʻyicha jadval hamda ruda-tonnaj egri chizigʻi bilan. Daromad koeffitsiyenti boʻyicha ichki karerlar va diskontlangan pul oqimi bilan ishlab chiqarish jadvali ham bor.
- **Radio aloqa liniyalari.** {{ui:Radio aloqa liniyalari…}} yer ustida koʻrinish chizigʻini Yer egriligi, birinchi Fresnel zonasi, aloqa byudjeti, pasayish zahirasi va koʻp yoʻlli uzilish bilan tekshiradi hamda yoʻlni tozalaydigan machta balandligini beradi. Shuningdek, tolali optika yoʻqotish byudjetlari, marshrut miqdorlari va minoradagi shamolni ham hisoblaydi.
- **Temir yoʻl strelkalari.** {{ui:Temir yo‘l strelkalari…}} qanot raqamidan strelka, parallel yoʻllar orasidagi kesishmalar va egrilikda kant bilan egilgan hamda kengaytirilgan tuzilma oʻlchagichi yaratadi. Strelka trassaning stansiyasida joylashishi mumkin.

Qarang: [Tuproqlar, chorrahalar, geodezik tuzatish, konlar, radio aloqa va strelkalar](topic:soils-roads-survey-mines-links).

### Har bir ilovada

- **Tillar.** 54 til, shulardan oʻntasi yangi. Ingliz tilidan boshqa tillar mashina qoralamalari boʻlib qoladi, to tub tilli oʻquvchi ularni oʻqimaguncha. Yordam mavzulari hali asosan ingliz tilida.
- **Asboblar paneli qatorlari.** {{ui:Sozlamalar}} › {{ui:Umumiy}} › {{ui:Asboblar paneli qatorlari}}: Oʻrash (avvalgidek), 2 qator yoki 1 qator. CivilCraft lentasi eng koʻp ishlatiladigan asbobni katta, keyingilarini kichik, qolganlarini guruh nomining strelkasi orqasida koʻrsatadi.
- **Kiritish qurilmalari.** Sensorli panel, qalam, 3D sichqoncha, kontroller va MIDI ilovalarni boshqarishi mumkin.
- **Muammolar.** Har bir ilovada ogohlantiradigan Muammolar paneli; tekshiruvlar qoidalar toʻplamini oʻqiydi.
- **Live.** Live seansda kim qayerdaligini koʻrish.
- **Qoʻshimchalar.** Qoʻshimchalar roʻyxati, yoritish qoʻshimchalari bilan.
- **AI ni ulang.** Siz ulagan har qanday yordamchi CivilCraft asboblarini boshqara oladi. U bilan bir tugmali ulanish CadCraft Studio ichida va xostlangan konnektor hali tayyor emasligi haqida izoh bilan keladi. Qarang: [Yordamchi AI ni hududingiz ustida ishlashga jalb qilish](topic:assistants).

### 0.8.1 da tuzatildi

- **DWG sinflar boʻlimi.** U notoʻgʻri turda oʻqilgan edi (GitHub cadcraft#5). CivilCraft da CadCraft, BimCraft, ModelCraft va TakeoffCraft bilan birga tuzatildi.
- **Ish paytida tilni almashtirish.** CadCraft Studio va paketlangan nashrlar ish vaqtida tilni oʻzgartirishi mumkin. Ilgari faqat ingliz tilida edi. Hali hamma platformada sinalmagan: til oʻzgarmasa, bizga xabar bering.

### Hali bu versiyada yoʻq

- **Bular hisoblash yordamchilari.** Yangi oynalardagi har bir natija muhandis tekshiruvini talab qiladi. Tuproq mustahkamligi tuproq guruhi uchun tipik qiymatlardan boshlanadi, oyna buni aytadi.
- **Yomgʻir yoʻgʻdirish.** Namunaviy hududda yirik katakda brauzerda ikki daqiqadan ortiq vaqt olishi mumkin. U qoʻlda hisoblangan holatlar va V shaklidagi yigʻish havzasi bilan tekshirilgan, hali haqiqiy relyef loyihalashtirilgan hududda emas.
- **Manzildan maydonga.** U siz keltirgan ochiq maʼlumot fayllarini oʻqiydi va faqat bizning fayllarimizda sinalgan. Daraxtlar manba emas. Sizga manbalarni olish maxfiylik matni tasdiqlanishini kutadi.
- **Surveylar boʻyicha jarayon.** Faqat oʻylab topilgan surveylarda sinalgan. Varaqlar va belgilashlardagi (MarkupCraft) jarayon hamda skaner va model (BimCraft) solishtirish hali qurilmagan.
- **Tuproqlar va qiyaliklar.** Faqat aylana yuzalar: ponaga yoki blok qidiruvga va choʻzilish yorigʻiga yoʻq.
- **Chorrahalar.** Har bir shox uchun bitta radius, yuk mashinasining aylanish izlari yoʻq va hali koridorga kirmaydi.
- **Dala fayllari.** Oʻqigichlar ommaviy format tavsiflaridan yozilgan va biz yaratgan fayllarda sinalgan. Haqiqiy asbob fayllari kerak.
- **Aloqa va temir yoʻl.** Radio aloqa: faqat boʻsh fazo yoʻqolishi va koʻp yoʻlli (yomgʻir pasayishi yoki antenna naqshlari yoʻq). Temir yoʻl standarti yoʻq: har bir temir yoʻl chegarasi vaqtinchalik, hech bir temir yoʻl muhandisi tekshirmagan qoralama raqamlar bilan.
- **Windows va macOS.** 0.8 kod bilan imzolanmagan. Windows ogohlantirishi mumkin, macOS esa oʻng tugma, keyin Ochish ni soʻraydi.

Qolgan hammasi [Hali qurilmagan](topic:not-built-yet) boʻlimida. Oldingi relizlar uchun qarang: [0.7 versiyasidagi yangiliklar](topic:whats-new-0-7).
