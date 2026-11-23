---
title: Loyiha vertikal profilini loyihalash
summary: Profil koʻrinishini oching, yerdan loyiha profilini boshlang, PVI larni qoʻshing va suring, vertikal egri chiziq uzunliklarini belgilang va qiyaliklar, K qiymatlari hamda yuqori va past nuqtalarni oʻqing.
keywords: profil, vertikal trassa, pvi, vertikal egri chiziq, qiyalik, k qiymati, choʻqqi, choʻkma, bvc, evc, profil koʻrinishi, yakuniy qiyalik, fg, mavjud yer profili, profildagi xususiyat chiziqlari, kesishmalar, proyeksiya, bordyur, ariq, yorliqlar
from: dbb1f32d
---

Har bir trassada bitta loyiha profili bor: PVI lar roʻyxati (piket va balandlik) toʻgʻri qiyaliklar bilan birlashgan, uzunligi bor har qanday ichki PVI da simmetrik parabolik vertikal egri chiziq bilan. Mavjud yer profili siz uchun yuzadan avtomatik olinadi.

## Profil koʻrinishini ochish

1. Trassani tanlang ({{ui:Tanlash}} bilan bosing).
2. {{key:R}} ni bosing, yoki asboblar panelidagi {{ui:Profil}} ni, yoki oʻng panelning pastidagi {{ui:Profil koʻrinishi}} ni bosing.
   Profil koʻrinishi reja ostida ochiladi, trassa boʻylab mavjud yer bilan. Ikki yoki undan koʻp trassa boʻlsa, profil panelining chap tomonidagi roʻyxatdan birini tanlang.

Koʻrinish butun trassani koʻrsatish va balandliklarni panelni toʻldirish uchun choʻzishdan boshlanadi; kattalashtirish pastki chap burchakda koʻrsatiladi, masalan "Vertikal kattalashtirish 10×".

## Profilni kattalashtirish va surish

- **Kattalashtirish:** sichqoncha gʻildiragini aylantiring (yoki sensorli panelda qisish) — koʻrinish koʻrsatkich atrofida kattalashadi. Faqat piketlarni kattalashtirish uchun {{key:Shift}} ni, faqat balandliklarni kattalashtirish uchun {{key:Alt}} ni bosib turing (bu kattalashtirishni oʻzgartiradi). Profil koʻrinishi tanlanganda plyus va minus tugmalari oʻrtasi atrofida kattalashtiradi.
- **Surish:** oʻng yoki oʻrta sichqoncha tugmasi bilan sudrang, yoki sensorli panelda ikki barmoq bilan suring.
- **Moslash:** profilni ikki marta bosing yoki {{key:F}} ni bosing — butun trassa yana koʻrinadi.

PVI ni tahrirlash tanlagan kattalashtirishni saqlaydi; u moslashga qaytmaydi.

Koʻrsatkichni profil boʻylab harakatlantiring: panelda piket, yer va loyiha balandliklari, qiyalik va u yerdagi kesish yoki toʻldirish koʻrsatiladi, rejada trassada nuqta esa kuzatib boradi.

## Loyiha profilini boshlash

1. Oʻng panelda **Loyiha profili** ostida {{ui:Yer yuzasidan boshlash}} ni bosing.
   Trassaning ikki uchida yerda ikkita PVI joylashtiriladi, bitta toʻgʻri qiyalik bilan birlashgan. Holat satri aytadi: "Loyiha profili ikki uchida yerdan boshlandi. Qiyalik oʻzgarishlarini qoʻshish uchun PVI qoʻshish ni yoqing va bosing; jadvalda ularga egri chiziq uzunligi bering."

Agar trassa yuzani kesib oʻtmasa, "Bu trassa ostida boshlash uchun yer yoʻq." degan xabar chiqadi. Keyin oʻrniga bosish orqali PVI lar qoʻshing (keyingi boʻlim).

## PVI qoʻshish

1. {{key:I}} ni bosing yoki profil panelidagi {{ui:PVI qoʻshish}} ni bosing. U bosilgan holatda qoladi.
2. Qiyalik oʻzgarishi kerak boʻlgan joyda profilni bosing. Shu piket va balandlikda PVI 0.01 gacha yaxlitlanib qoʻshiladi va tanlanadi.
3. Kerakli miqdorda qoʻshing, soʻng qoʻshishni toʻxtatish uchun yana {{key:I}} ni bosing.

Allaqachon PVI boʻlgan joyda bosish rad etiladi ("…da PVI allaqachon bor"). PVI lar doim piketlar tartibida qoladi.

## Qoʻshish yoki sudrashda tutib olish

Profil panelidagi **Tutib olish** tugmasi boshida yoqilgan. U yoqilgan paytda qoʻshgan yoki sudragan PVI eng yaqin PVI, yer nuqtasi, PVI piketi yoki yer chizigʻiga tushadi, va belgi yonidagi yorliq qaysisi ekanini aytadi. Istalgan joyda erkin nuqta uchun {{key:Alt}} ni bosib turing.

## PVI larni sozlash

- Profilda PVI ni koʻchirish uchun uni **sudrang**. U qoʻshnilaridan oʻta olmaydi. Koʻchirish bitta bekor qilish qadami.
- Oʻng paneldagi PVI jadvaliga aniq qiymatlarni **kiriting**: **Piket**, **Balandlik**, **Qiyalik %** va **Egri chiziq L** (vertikal egri chiziq uzunligi). Har biridan keyin {{key:Enter}} ni bosing.
- **Tanlash** — profildan qiymat olish: PVI piketi yoki balandligi yonidagi kichik tugma profil koʻrinishida bir marta bosilishini kutadi va shu qiymatni toʻldiradi. Bosish PVI qoʻshish kabi tutib oladi; erkin nuqta uchun {{key:Alt}} ni bosib turing; {{key:Esc}} bekor qiladi.
- **Qiyalik %** — shu PVI dan boshlanib keyingisiga boradigan tangensning qiyaligi. Uni kiritish **keyingi** PVI ning balandligini siljitadi (uning piketi hech qachon siljimaydi). Agar keyingi PVI qulflangan boʻlsa, oʻrniga oldingi PVI ning balandligi siljiydi.
- PVI ni qatorining oxiridagi qulf belgisi bilan **qulflang**. Qulflangan PVI sudralmaydi va qiyalik tahriri uni siljitmaydi. Agar tangensning ikki uchi ham qulflangan boʻlsa, uning qiyaligi oʻzgara olmaydi: holat satri buni aytadi va avval bir uchini ochish kerak. Qulf fayl ichida saqlanadi.
- PVI ni qatorining oxiridagi x bilan **oʻchiring**, yoki uni tanlang (bosing) va {{key:Delete}} ni bosing. Profil koʻrinishi fokusda boʻlganda {{key:Backspace}} ham uni oʻchiradi.

Birinchi va oxirgi PVI hech qachon egri chiziq olmaydi.

## Vertikal egri chiziqlar

1. Ichki PVI uchun **Egri chiziq L** ga uzunlik kiriting, masalan 200.
2. Egri chiziq PVI markazida chiziladi. Profil va oʻng panel uning turini (choʻqqi yoki choʻkma), L va K ni, BVC va EVC piketlari hamda balandliklarini va egri chiziq ichida boʻlsa, uning yuqori yoki past nuqtasini koʻrsatadi.

K L dan hisoblanadi (K = L ÷ qiyaliklarning algebraik farqi, foizda). Siz L kiritasiz; K ni toʻgʻridan-toʻgʻri kiritish hali mavjud emas.

Agar vertikal egri chiziq sigʻmasa, qizil quti sababini aytadi: u oldingi PVI yoki egri chiziqqa qaytib kiradi yoki keyingi PVI dan oʻtadi va u tomonda qancha joy borligi (egri chiziq PVI ning har tomonida uzunligining yarmini talab qiladi). Uning tugmasi **sigʻadigan eng uzun egri chiziqni** K bilan birga bitta qadam sifatida belgilaydi ({{key:Mod+Z}} uni bekor qiladi). Yoki PVI larni bir-biridan uzoqlashtiring.

## Faktlarni oʻqish

PVI jadvali ostidagi roʻyxat har bir qiyalikni foizda ("Qiyalik 1: +1.25%") va har bir egri chiziqni beradi, masalan "Choʻqqi 2+00.00 da: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)", soʻng "Yuqori nuqta 1+62.40, 254.12".

Agar PVI lar trassaning ikkala uchiga yetmasa, izoh buni aytadi. Koridor faqat profil va trassa ustma-ust tushgan joyda quriladi.

## Profildagi xususiyat chiziqlari

Xususiyat chiziqlari profil koʻrinishida ham koʻrinadi, shuning uchun bordyur, ariq yoki devor tepasini yoʻl profiliga nisbatan koʻrishingiz mumkin.

- Xususiyat chizigʻi trassani **kesib oʻtgan** joyda profilda shu piket va balandlikda kichik rombcha koʻrsatiladi, chiziq nomi va u yerdagi balandligi yorliqi bilan (kesib oʻtuvchi kesma boʻylab hisoblangan chiziqning oʻz balandligi).
- {{ui:Quyidagi masofa ichida yonida}} ga masofa kiriting: shu masofa ichida trassa **yonida** oʻtuvchi xususiyat chiziqlari ham oʻz balandliklarida shtrixli chiziqlar bilan chiziladi. Boʻsh yoki 0 boʻlsa, faqat kesishmalar koʻrsatiladi.
- Belgilar va yorliqlar har bir oʻzgarishga ergashadi: uchni siljiting, qiyalik kiriting yoki chiziqni koʻtaring, profil yangi balandliklarni darhol koʻrsatadi.
- Kesishmaning rombchasini bosib, shu xususiyat chizigʻini tanlang; tanlangan chiziq yorqin rangda chiziladi.
- Profil panelidagi {{ui:Xususiyat chiziqlari}} ularning hammasini yashiradi yoki koʻrsatadi. Ikkala sozlama ham loyiha bilan saqlanadi.

Qarang: [Xususiyat chiziqlari](topic:feature-lines).

## Keyingi

- Trassa va shu profil boʻylab [yoʻl koridorini yaratish](topic:corridor).
- Profil trassa bilan birga LandXML ga yoziladi; qarang: [LandXML almashinuvi](topic:landxml).
