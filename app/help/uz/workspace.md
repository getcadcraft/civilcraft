---
title: Ekran, qismlar boʻyicha
summary: CivilCraft ning har bir panelini va asbobini ekrandagi nomi boʻyicha koʻrib chiqish, asboblar panelidan holat paneligacha.
keywords: interfeys, ekran, asboblar paneli, panellar, xususiyatlar, holat paneli, profil koʻrinishi, tartib, tur, ui
from: 76272010
---

CivilCraft da bitta ekran bor. Yorliqlar va tartib yoʻq. Yon panellarni koʻchirish, suzish yoki oʻz oynasiga chiqarish mumkin: qarang [Panellarni joylashtirish va ikkinchi monitordan foydalanish](common:arrange-panels). Yuqoridan pastga va chapdan oʻngga:

- **ilova paneli** (CadCraft belgisi, ilova nomi, versiya, Haqida, ekran rejimi, Yordam, Oflayn uchun saqlash, Qogʻoz va Model)
- **asboblar paneli** — yettita tugmalar guruhi bilan
- **chap panel**: Hudud, Nuqtalar, Yuza, Koʻrinish va import qilgandan keyin GIS qatlamlari
- **reja** oʻrtada, ochiq boʻlganda uning ostida **profil koʻrinishi** bilan
- **oʻng panel**: tanlangan narsaning Xususiyatlari
- **holat paneli** pastda

## Ilova paneli

Eng yuqoridagi yupqa panel CivilCraft ning oʻzi emas, CadCraft saytiga tegishli.

- Versiya menyusi qaysi versiyani ishga tushirayotganingizni koʻrsatadi.
- {{ui:CivilCraft haqida}} ilovaning saytdagi sahifasini ochadi.
- {{ui:Toʻliq ekran}} ekran rejimlarini almashtiradi: toʻliq ekran, soʻng panellar yashirilgan toʻliq ekran, soʻng oddiy rejimga qaytish. {{key:Ctrl+Shift+F}} har qanday platformada, jumladan Mac da ham xuddi shunday ishlaydi (u yerda Command emas, Control tugmasi). Panellar yashirilgan boʻlsa, ularni qaytarish uchun kursorni yuqori chetga olib boring.
- {{ui:Yordam}} (yoki {{key:F1}}) bu yordamni yon panelda ochadi; {{key:F1}} yoki {{key:Esc}} uni yopadi.
- {{ui:Oflayn uchun saqlash}} CivilCraft ni bu brauzerda saqlaydi, shuning uchun u ulanishsiz ochiladi; soʻng {{ui:Oflayn tayyor}} koʻrsatiladi. Qarang: [Fayllar: ochish, saqlash va eksport](topic:files#online-and-offline).
- {{ui:Qogʻoz}} va {{ui:Model}} yorugʻ va qorongʻi mavzular orasida almashadi. Reja va profil mavzuga ergashadi; PDF har doim oq rangda chop etiladi.

## Asboblar paneli

Har bir guruhning tugmalari ustida kichik yorliq bor. Tugma ustiga sichqonchani olib boring, uning maslahatini va klavishini koʻrish uchun.

| Guruh | Tugmalar | Nima qiladi |
|---|---|---|
| Fayl | {{ui:Yangi}}, {{ui:Ochish}}, {{ui:Saqlash}} | Qaytadan boshlash, nuqta fayli, LandXML yoki loyihani ochish, loyihani yuklab olinadigan fayl sifatida saqlash |
| Eksport | {{ui:LandXML}}, {{ui:DXF}}, {{ui:DWG}}, {{ui:PDF}} | LandXML 1.2, R12 DXF yoki rejaning DWG sini yozish, yoki rejani PDF ga chizish |
| Yuza | {{ui:Sinuvchi chiziq}}, {{ui:Chegara}} | Geodezik nuqtalar orqali uzilish chizigʻini chizish; tashqi chegarani chizish |
| Loyihalash | {{ui:Trassa}}, {{ui:Maydoncha}}, {{ui:Quvurlar}}, {{ui:Profil}} | Trassa, maydoncha yoki quvur yoʻnalishini chizish; profil koʻrinishini koʻrsatish yoki yashirish |
| Tahrirlash | {{ui:Ortga qaytarish}}, {{ui:Qayta bajarish}}, {{ui:Nusxalash}}, {{ui:Qoʻyish}}, {{ui:Yana}} | Geodezik nuqtalarni bekor qilish, qayta bajarish, nusxalash va qoʻyish; {{ui:Yana}} da Kesish, Joyida qoʻyish, Nusxasini yaratish, Oʻchirish, Barcha nuqtalarni tanlash va Hech nimani tanlamaslik bor |
| GIS | {{ui:Koordinatalar}}, {{ui:Import}}, {{ui:Eksport}}, {{ui:Xarita}} | Koordinata tizimini belgilash, GIS fayllarini import va eksport qilish, rejada xarita qatlamlarini koʻrsatish |
| Koʻrinish | {{ui:Tanlash}}, {{ui:Moslash}}, {{ui:3D}} | Narsalarni tanlash va koʻchirish; hammasini koʻrsatish uchun yaqinlashtirish; saytni 3D da koʻrsatish ([Saytni 3D da koʻrish](topic:site-3d)) |

Chizish asbobi faol boʻlganda bosilgan holda qoladi. Uni yana bosish, {{key:Esc}} yoki {{key:V}} tugmasini bosish sizni {{ui:Tanlash}} ga qaytaradi. {{ui:Ortga qaytarish}}, {{ui:Qayta bajarish}}, {{ui:Nusxalash}} va {{ui:Yana}} dagi elementlar ishlay olmasa xira koʻrinadi; maslahat sababini aytadi (masalan "Avval geodezik nuqtalarni tanlang"). Har bir tugma [Asboblar paneli maʼlumotnomasi](topic:toolbar) da roʻyxatga olingan.

Tor oynada asboblar paneli yon tomonga aylanadi.

## Chap panel

### Hudud

- **Nom**: loyiha nomi. U saqlaydigan yoki eksport qiladigan har bir faylning nomini beradi va PDF sarlavha chizigʻida chop etiladi.
- **Birliklar**: {{ui:AQSh futi}} yoki {{ui:Metrlar}}. Bu raqamlar nimani anglatishini aytadi. Uni oʻzgartirish koordinatalarni **konvertatsiya qilmaydi**; qarang: [Birliklar, pikketlar va raqam formatlari](topic:units-and-stations).

### Nuqtalar

Boʻsh boʻlsa, nuqta faylini qanday ochishni aytadi. Nuqtalar bilan u fayl nomini, nuqtalar sonini va balandligi bor nuqtalar sonini, soʻngra **nuqta guruhlari** jadvalini koʻrsatadi: tavsifning har bir birinchi soʻzi boʻyicha bir qator (GRD, FL, TBS …), soni va **Yuza** tanlovi bilan:

- {{ui:Nuqtalar}}: nuqtalar sirtga kiradi (har bir guruh uchun standart).
- {{ui:Sinuvchi chiziq}}: guruh nuqtalari nuqta raqami tartibida bitta uzilish chizigʻiga birlashtiriladi.
- {{ui:Chiqarib tashlangan}}: guruh sirtga tegmaydi.

### Yuza

Mavjud yer haqida maʼlumotlar: nuqtalar, uchburchaklar, eng past va eng baland balandliklar, oʻrtacha balandlik, 2D va 3D maydon, uzilish chiziqlari va chegara bor-yoʻqligi. Maʼlumotlar ostida sirt quruvchi tuzata olgan yoki bajara olmagan narsalar roʻyxatlanadi. Keyin:

- **Eng uzun tashqi chekka**: 0 barcha tashqi uchburchaklarni saqlaydi; raqam uzun ingichka uchburchaklarni tashqaridan kesadi.
- Qoʻllanilganda paydo boʻladigan havolalar: {{ui:Chegarani oʻchirish}}, {{ui:Chizilgan uzilish chiziqlarini oʻchirish}} va LandXML dan oʻqilgan yuza uchun {{ui:Sirtni nuqtalardan qayta qurish}}.

### Koʻrinish

- **Yuza**: {{ui:Mavjud yer}} yoki {{ui:Loyihalangan (qiyalik berilgan)}}. Ikkinchisi maydoncha yoki koridor muammosiz tekislaganda mavjud boʻladi.
- **Horizontallar har**, **Asosiy har** va **Zonalar** (rang zonalari soni).
- Katakchalar: {{ui:Gorizontallar}}, {{ui:Kontur yozuvlari}}, {{ui:Uchburchaklar}}, {{ui:Balandlik zonalari}}, {{ui:Nishablik strelkalari}}, {{ui:Nuqtalar}}, {{ui:Nuqta yozuvlari}}, {{ui:Uzilish chiziqlari}}, {{ui:Yuza chegarasi}}, {{ui:Quvurlar}}.
- Zonalar yoqilganda zona balandliklari legendasi paydo boʻladi.

Koʻrinish sozlamalari loyiha bilan saqlanadi, lekin bekor qilish qadamlari emas: {{key:Mod+Z}} hech qachon katakchani qaytarib qoʻymaydi.

## Reja

Reja nuqtalarni, sirtni va siz loyihalaydigan hamma narsani shimoli yuqorida boʻlgan plan koʻrinishda koʻrsatadi. Kursor ostida gʻildirak bilan yaqinlashtiring, boʻsh joyni sudrab suring. Toʻliq roʻyxat: [Tugmalar va sichqoncha](topic:keyboard).

- Boʻsh loyihada **Geodezik nuqtalar bilan boshlang** deb nomlangan quti birinchi qadamlarni roʻyxatlaydi va {{ui:Namuna hududni oching}} ni taklif qiladi.
- Chizish asbobi faol boʻlganda, reja yuqoridagi maslahat nimani bosish va qanday tugatishni aytadi.
- Faylni rejaga sudrash "Nuqta fayli, LandXML yoki loyihani tashlang" deb koʻrsatadi.
- Tanlangan narsalar ajratib koʻrsatiladi. Tanlangan trassa yoki maydonchada PI yoki burchaklarida kvadrat tutqichlar koʻrinadi; tanlangan inshoot bitta tutqichga ega. Tutqichni sudrab joyini oʻzgartiring.
- Tanlangan geodezik nuqtalar halqa bilan belgilanadi. {{key:Shift}} va bosish nuqtani qoʻshadi yoki olib tashlaydi; {{key:Shift}} va sudrash ichidagi nuqtalarni qoʻshadigan quti chizadi (yoki atrofida aylantirilsa, lasso). Qarang: [Geodezik nuqtalarni tanlash, nusxalash va qoʻyish](topic:copy-paste-points).

## Profil koʻrinishi

Uni rejaning ostida ochish uchun {{key:R}} tugmasini bosing yoki {{ui:Profil}} ni bosing. Uning paneli:

- trassalar roʻyxati (ikki yoki undan ortiq trassa boʻlganda faol)
- {{ui:PVI qoʻshish}}: u bosilgan paytda profilda bir marta bosish PVI qoʻshadi ({{key:I}} uni almashtiradi)
- kursor ostidagi pikket, yer, loyihaviy balandlik, nishablik va kesish yoki toʻldirish koʻrsatkichi
- yopish tugmasi

Profil mavjud yerni, loyihaviy profilni, har bir tangensdagi nishablarni, har bir PVI ning pikketi va balandligini, har bir vertikal egrining L va K sini BVC va EVC bilan, yuqori va past nuqtalarni va vertikal kattalashtirishni koʻrsatadi. U har doim butun trassaga sigʻdiradi: yaqinlashtirmaydi va surmaydi. Profil boʻylab kursorni harakatlantirsangiz, rejadagi trassada nuqta paydo boʻladi.

## Oʻng panel: Xususiyatlar

Sarlavhasi nimani koʻrsatayotganini aytadi.

- **Loyiha** (hech narsa tanlanmagan): trassalar va maydonchalar havola sifatida, **Yer ishlari** bloki va qoidalari hamda muammolari bilan **Quvur tarmogʻi** bloki.
- **Trassa**: nomi, boshlanish pikketi, uzunligi, PI jadvali, egrilar, loyihaviy profilning PVI jadvali va maʼlumotlari, hamda **Koridor** sozlamalari.
- **Maydoncha**: nomi, balandligi, qazish va toʻldirish nishablari, maydoni, kunduzgi maʼlumotlar va yer ishlari.
- **Inshoot** yoki **Quvur**: oʻlchamlar, qirralar, invertlar, nishablik, qoplama va har qanday muammolar.
- **Nuqta** va uning raqami: nuqtaning koordinatalari, balandligi, tavsifi va guruhi (faqat oʻqish uchun).

Maydonlar {{key:Enter}} bosilganda yoki maydondan chiqqanda kuchga kiradi. Qabul qilinmagan qiymat notoʻgʻri deb belgilanadi va hech narsa oʻzgarmaydi.

## Holat paneli

- **E** va **N**: kursor ostidagi sharq va shimol.
- **Yer** balandligi oʻsha yerda (va **Loyihalangan** maydoncha yoki koridor uni oʻzgartirgan joyda), yoki "Sirtdan tashqarida".
- Eng yaqin trassa (yoki tanlangani) kursor ostidagi **Pik.** va ofset (**L** yoki **R**) bilan.
- Oʻngda xabarlar: nima endigina sodir boʻlgani yoki nega biror narsa rad etilgani. Xabar bir necha soniyadan keyin oʻz-oʻzidan tozalanadi.

## Dialoglar

- **Nuqtalarni import qilish**: har bir nuqta faylida ochiladi. Qarang: [Geodezik nuqtalarni import qilish](topic:import-points).
- **Rejani PDF ga chizish**: qarang: [Rejani PDF ga chizish](topic:plot-pdf).
- **Saqlanmagan oʻzgarishlar**: {{ui:Yangi}} yoki loyiha yoki LandXML faylini ochish saqlanmagan ishni tashlab yuborishdan oldin soraydi. {{ui:Nusxasini saqlash}} avval loyihani yuklab oladi.

## Kichik ekranlar

760 pikselgacha kenglikda, masalan telefonda, reja ekranni saqlaydi: asboblar paneli yon tomonga aylanadigan bir qator boʻladi va panellar pastdagi satrdan varaqlar sifatida ochiladi. {{ui:Asboblar}} asboblar panelini yashiradi va {{ui:Koʻchirish}} uni pastga joylashtiradi.
