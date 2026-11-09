---
title: Yangi nima: 0.8 va 0.8.1
summary: CivilCraft 0.8 quyidagilarni qoʻshadi: Yomgʻir yoʻgʻdirish (tekislangan yer ustida boʻron sinovi), tuproq ishlari balanslagich, eng yaxshi yoʻnalish topuvchi, ushlab turuvchi havzalar, geodezik oʻlchashlardan jarayon, loyihada saytni saqlaydigan manzildan maydonga import vositasi, hamda tuproqlar va qiyaliklar, chorrahalar va chiziqlash, geodezik tuzatish, ochiq konlar, radio aloqa liniyalari va temir yoʻl strelkalari oynalari. 0.8.1 DWG fayllarini oʻqish usulini tuzatadi.
keywords: yangi nima, nima yangi, reliz haqida maʼlumot, oʻzgarishlar jurnali, oʻzgarishlar, 0.8, 0.8.1, versiya, yangi imkoniyatlar, yomgʻir, boʻron, suv toʻplanishi, toshib oʻtish, yer ishlari, balans, kesish va toʻldirish, tashish, eng yaxshi yoʻnalish, eng kam xarajat, trassa, ushlab turuvchi havza, chiqish, pasayish, erkin bort, jarayon, geodezik oʻlchash, dron, uyum, manzildan maydonga, uchastka, tuproq, toshqin, qiyalik barqarorligi, Bishop, choʻkish, chorraha, chiziqlash, belgilar, koʻrinish masofasi, tuzatish, eng kichik kvadratlar, poligon, ochiq kon, blok modeli, radio aloqa liniyasi, Fresnel, strelka, krossover, tillar, muammolar, jonli, DWG
from: b0932cf0
---

Bu CivilCraft 0.8 (2026-11-01) va 0.8.1 (2026-11-02) versiyalarida 0.7 bilan solishtirganda oʻzgargan narsalar. Asosiy yangi qismlar: yer ishlaringizni va saytingizni sinovdan oʻtkazish vositalari (yomgʻir, yer ishlari, yoʻnalishlar, havzalar, jarayon) hamda yer, yoʻllar, geodezik oʻlchash, konlar, aloqa liniyalari va temir yoʻl uchun oltita hisoblash oynasi.

## Yangi

### Yer ishlaringizni sinovdan oʻtkazing

- **Yomgʻir yoʻgʻdirish.** {{ui:Yomgʻir yoʻgʻdirish…}} ({{ui:Yuza}} ostida) tekislangan yer ustiga boʻron tushiradi. Suvning maydonchalardan oqib tushishini, past burchaklarda toʻplanishini va juda kichik havzalardan toshib oʻtishini kuzatasiz. Yurish animatsiya qilingan va hajmlar, eng yuqori chiqish oqimi hamda har bir havza boʻyicha CSV fayl beradi. Standart katak yirik boʻlgani uchun birinchi koʻrib chiqish tez; mayda katak sekinroq. Toshib oʻtadigan havzalar ham Muammolar panelida koʻrinadi.
- **Tuproq ishlari balanslagich.** {{ui:Tuproq ishlari balanslagich…}} kesish toʻldirishga teng boʻlguncha maydonchani koʻtaradi yoki tushiradi va ular orasidagi tashish jadvalini koʻrsatadi.
- **Eng yaxshi yoʻnalish.** {{ui:Eng yaxshi yoʻnalish…}}: boshlanish va tugash nuqtasini tanlang. CivilCraft esa yer boʻylab qiyalik va egrilik chegaralariga rioya qiladigan eng arzon yoʻlni topadi va undan trassa yaratadi.
- **Ushlab turuvchi havzalar.** {{ui:Ushlab turuvchi havzalar…}} yer maʼlumotlaringizdan sath va saqlash hajmini hisoblaydi, chiqish qurilmalarini (teshik, toʻgʻon, V-shaklli kesik, toshqin oʻtkazgich) qabul qiladi, havza orqali boʻron oʻtkazadi va ushlab qolingan eng yuqori oqim, pasayish vaqti hamda erkin bortni tekshiradi.
- **Geodezik oʻlchashlardan jarayon.** {{ui:Surveylar boʻyicha jarayon…}} turli sanalardagi dron yoki skanerlash yuzalarini oldingi yer holati va loyiha bilan solishtiradi: hajm boʻyicha bajarilgan foiz, ortiqcha qazilgan va ortiqcha toʻldirilgan maydonlar, uyumlar hamda shu sur'atda ish qachon tugashi (taxminiy sifatida belgilanadi).

### Saytni bilib oling

- **Manzildan maydonga.** {{ui:Manzildan maydonga…}} ochiq uchastka, bino, zonalash, tuproq, toshqin va yer maʼlumotlarini bitta saytda birlashtiradi. Saytni loyiha faylida saqlab qoʻyish mumkin: kiritilgan manzil, har bir manba va uni olgan kun hamda litsenziyasi, shuningdek qaytgan natija. Loyihani qayta ochsangiz yoki ulashsangiz, sayt oʻsha yerda qoladi, hech narsa qayta yuklanmaydi. Uni sayt fayli sifatida saqlash yoki BimCraft ilovasiga yuborish ham mumkin. Qarang: [Manzildan maydonga](topic:address-to-site).

### Yer, yoʻllar, geodezik oʻlchash, konlar, aloqa va temir yoʻl

- **Tuproqlar va qiyaliklar.** {{ui:Tuproqlar va qiyaliklar…}} siz kiritgan burgʻulash nuqtalari orasidagi tuproq profilini chizadi. Keyin Bishop usuli yeringizdagi kritik doirani qidiradi, yer osti suvi sathi, qoʻshimcha yuk va zilzila koeffitsiyenti bilan. Poydevor choʻkishi konsolidatsiya, darhol choʻkish va vaqtni hisobga oladi.
- **Chorrahalar va chiziqlash.** {{ui:Chorrahalar va chiziqlash…}} shoxlarni bordyur burilishlari (har bir shox uchun bitta radius yoki uch markazli burilishlar), loyiha tezligi uchun koʻrinish masofasi, koʻrinish uchburchaklarini tekshirish, piyodalar oʻtish joylari, toʻxtash chiziqlari, belgilar va belgilar jadvali bilan birlashtiradi. Ular rejada chiziladi va nomlangan qatlamlar bilan DXF fayl sifatida saqlanadi.
- **Geodezik tuzatish.** {{ui:Geodezik tuzatish…}} poligon yoki tarmoqni eng kichik kvadratlar usulida tuzatadi: tuzatilgan koordinatalar, xato ellipslari, xi-kvadrat testi va oʻlchovga mos kelmagan qiymatni belgilash. Erkin tarmoqlar, poligonni kompas qoidasi bilan yopish va RW5, GSI, JobXML yoki CSV dala fayllari kiritilgan; tuzatilgan nuqtalar CSV sifatida saqlanadi.
- **Ochiq konlar.** {{ui:Ochiq konlar…}} burgʻulash namunalarini blok modeliga va qiyalik burchagingiz ichidagi yakuniy chuqurga aylantiradi, shuningdek tipratish nisbati, pogʻona boʻyicha jadval va baho-tonnaj egri chizigʻi bilan. Daromad omili boʻyicha ichki chuqurlar va diskontlangan pul oqimi bilan ishlab chiqarish jadvali ham bor.
- **Radio aloqa liniyalari.** {{ui:Radio aloqa liniyalari…}} yer ustidagi koʻrinish chizigʻini Yer qavariqligi, birinchi Fresnel zonasi, bogʻlanish byudjeti, signal pasayish zaxirasi va koʻp yoʻlli uzilish bilan tekshiradi hamda yoʻlni tozalaydigan machta balandligini beradi. Shuningdek tolali optika yoʻqotish byudjetlari, yoʻl hajmlari va minoradagi shamol yukini ham hisoblaydi.
- **Temir yoʻl strelkalari.** {{ui:Temir yo‘l strelkalari…}} strelkani yurak raqamidan, parallel yoʻllar orasidagi krossoverlarni va qiyalik bilan egilgan hamda egrilikda kengaytirilgan konstruktsiya gabaritini yaratadi. Strelka trassaning stansiyasida joylashishi mumkin.

Qarang: [Tuproqlar, chorrahalar, geodezik tuzatish, konlar, radio aloqa liniyalari va strelkalar](topic:soils-roads-survey-mines-links).

## Har bir ilovada

- **Tillar.** 54 ta til, shulardan oʻntasi yangi. Ingliz tilidan boshqa tillar tilshunoslar oʻqib chiqmaguncha mashina qoralamasi hisoblanadi. Yordam mavzulari hali asosan inglizcha.
- **Asboblar paneli qatorlari.** {{ui:Sozlamalar}} › {{ui:Umumiy}} › {{ui:Asboblar paneli qatorlari}}: Oʻrash (avvalgidek), 2 qator yoki 1 qator. CivilCraft'ning Ribbon paneli eng koʻp ishlatiladigan asbobni katta, keyingilarini kichik, qolganlarini guruh nomining strelkasi ortida koʻrsatadi.
- **Kiritish qurilmalari.** Trekpad, qalam, 3D sichqoncha, kontroller va MIDI ilovalarni boshqarishi mumkin.
- **Muammolar.** Barcha ilovalarda ogohlantiruvchi Muammolar paneli, regulyatsiya toʻplamlarini oʻqiydigan tekshiruvlar bilan.
- **Jonli.** Jonli seansda kim qayerdaligini koʻrsatuvchi koʻrinish.
- **Qoʻshimchalar.** Yoritish qoʻshimchalari bilan qoʻshimchalar roʻyxati.
- **AI'ngizni ulang.** Siz ulagan har qanday yordamchi CivilCraft vositalarini boshqarishi mumkin. U bilan birga CadCraft Studio ichida bir bosishda ulanish va xostlangan konnektor hali tayyor emasligi haqida eslatma keladi. Qarang: [Yordamchi AI'ga saytingiz ustida ishlashga ruxsat bering](topic:assistants).

## 0.8.1 da tuzatilganlar

- **DWG sinflar boʻlimi.** U notoʻgʻri turda oʻqilgan edi (GitHub cadcraft#5). CivilCraft'da CadCraft, BimCraft, ModelCraft va TakeoffCraft bilan birga tuzatildi.
- **Ishlash vaqtida tilni almashtirish.** CadCraft Studio va oʻralgan nashrlar ishlash vaqtida tilni oʻzgartirishi mumkin. Ilgari faqat inglizcha edi. Hali har bir platformada sinovdan oʻtmagan: til oʻzgarmasa, bizga xabar bering.

## Bu versiyada hali yoʻq

- **Bular hisoblash yordamchilari.** Yangi oynalardagi har bir natija muhandis tekshiruvini talab qiladi. Tuproq mustahkamligi tuproq guruhi uchun odatiy qiymatlardan boshlanadi, oyna buni koʻrsatadi.
- **Yomgʻir yoʻgʻdirish.** Namunaviy saytdagi yurish brauzerda mayda katakda ikki daqiqadan oshishi mumkin. U qoʻlda hisoblangan holatlar va V shaklli havzada tekshirilgan, lekin hali haqiqiy qurilgan yerda emas.
- **Manzildan maydonga.** U siz olib kelgan ochiq maʼlumot fayllarini oʻqiydi va faqat bizning fayllarimizda sinalgan. Daraxtlar manba emas. Manbalarni siz uchun olish maxfiylik matni tayyor boʻlishini kutadi.
- **Geodezik oʻlchashlardan jarayon.** Faqat oʻylab topilgan oʻlchashlarda sinalgan. Varaqlar va belgilar (MarkupCraft) boʻyicha jarayon hamda skanerlash va model (BimCraft) bilan solishtirish hali qurilmagan.
- **Tuproqlar va qiyaliklar.** Faqat doiraviy yuzalar: lona yoki blok qidiruvi va choʻzilish yorigʻi yoʻq.
- **Chorrahalar.** Har bir shox uchun bitta radius, yuk mashinasi aylanish yoʻllari yoʻq, va ular hali koridorga kirmaydi.
- **Dala fayllari.** Oʻqigichlar ochiq format tavsiflari asosida yozilgan va biz yaratgan fayllarda sinalgan. Haqiqiy asbob fayllari kerak.
- **Aloqa liniyalari va strelkalar.** Radio aloqa liniyalari: faqat boʻshliq boʻylab yoʻqotish va koʻp yoʻlli uzilish (yomgʻir pasayishi yoki antenna diagrammalari yoʻq). Temir yoʻl standarti ham yoʻq: har bir temir yoʻl chegarasi oʻrin egallovchi, hech bir temir yoʻl muhandisi tekshirmagan qoralama raqamlar bilan.
- **Windows va macOS.** 0.8 kod bilan imzolanmagan. Windows ogohlantirishi mumkin, macOS esa oʻng tugmani bosib, soʻngra Ochish ni soʻraydi.

Qolgan barcha narsalar [Hali qurilmagan](topic:not-built-yet) boʻlimida. Oldingi reliz uchun [0.7 da yangi nima](topic:whats-new-0-7) ga qarang.
