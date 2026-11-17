---
title: Vertikal profilni loyihalash
summary: Profil koʻrinishini oching, yer ustidan loyihalash profilini boshlang, PVI qoʻshing va sudrang, vertikal egri uzunliklarini belgilang hamda nishablar, K qiymatlari va yuqori hamda past nuqtalarni oʻqing.
keywords: profil, vertikal trassa, pvi, vertikal egri, nishab, k qiymati, choʻqqi, botiq, bvc, evc, profil koʻrinishi, yakuniy nishab, fg, mavjud yer profili, profildagi xususiyat chiziqlari, kesishmalar, proyeksiya, bordyur, ariq, yorliqlar
from: e9182bfa
---

Har bir trassada bitta loyihalash profili bor: PVI lar roʻyxati (stansiya va balandlik), ular toʻgʻri nishablar bilan bogʻlangan, va har qanday uzunlikka ega ichki PVI da simmetrik parabolik vertikal egri bor. Mavjud yer profili sirtdan siz uchun olinadi.

## Profil koʻrinishini ochish

1. Trassani tanlang ({{ui:Tanlash}} bilan bosing).
2. {{key:R}} ni bosing, yoki asboblar panelidagi {{ui:Profil}} ni, yoki oʻng panel pastidagi {{ui:Profil koʻrinishi}} ni bosing.
   Profil koʻrinishi reja ostida ochiladi va trassa boʻylab mavjud yerni koʻrsatadi. Ikki yoki undan ortiq trassa boʻlsa, profil panelining chap tomonidagi roʻyxatdan birini tanlang.

Koʻrinish har doim butun trassani koʻrsatadi va balandliklarni panelni toʻldirish uchun choʻzadi; masshtab pastki chap burchakda chop etiladi, masalan "Vertikal kattalashtirish 10×". U kattalashtirmaydi va surmaydi.

Profil boʻylab koʻrsatgichni harakatlantiring: panelda stansiya, yer va loyihalash balandliklari, nishab va oʻsha joydagi kesish yoki toʻldirish koʻrinadi, rejadagi trassada esa nuqta harakatlanadi.

## Loyihalash profilini boshlash

1. Oʻng panelda **Loyihalash profili** ostida {{ui:Yer ustidan boshlash}} ni bosing.
   Trassaning ikki uchida yer ustida ikkita PVI joylashadi va bitta toʻgʻri nishab bilan bogʻlanadi. Holat satrida shunday yoziladi: "Loyihalash profili ikki uchida yerdan boshlandi. Nishab nuqtalarini qoʻshish uchun PVI qoʻshishni yoqing va bosing; ularga jadvalda egri uzunligi bering."

Agar trassa sirtni kesib oʻtmasa, "Bu trassa ostida boshlanadigan yer yoʻq." degan xabar chiqadi. Shunda PVI larni bosish orqali qoʻshing (keyingi boʻlim).

## PVI qoʻshish

1. {{key:I}} ni bosing, yoki profil panelidagi {{ui:PVI qoʻshish}} ni bosing. U bosilgan holda qoladi.
2. Profilda nishab nuqtasi kerak boʻlgan joyni bosing. PVI oʻsha stansiya va balandlikka qoʻshiladi, 0.01 gacha yaxlitlanadi va tanlanadi.
3. Kerakli miqdorda qoʻshing, soʻngra qoʻshishni toʻxtatish uchun yana {{key:I}} ni bosing.

PVI allaqachon boʻlgan joyni bosish rad etiladi ("… da allaqachon PVI bor"). PVI lar har doim stansiya tartibida qoladi.

## PVI larni tuzatish

- Profilda PVI ni **sudrab** koʻchiring. U qoʻshnilaridan oʻta olmaydi. Koʻchirish bitta bekor qilish qadami.
- Oʻng paneldagi PVI jadvalida aniq qiymatlarni **kiriting**: **Stansiya**, **Balandlik** va **Egri L** (vertikal egri uzunligi). Har biridan keyin {{key:Enter}} ni bosing.
- PVI ni satr oxiridagi x bilan **oʻchiring**, yoki uni tanlab ({{key:Delete}} ni bosing). Profil koʻrinishi fokusda boʻlsa, {{key:Backspace}} ham oʻchiradi.

Birinchi va oxirgi PVI hech qachon egri olmaydi.

## Vertikal egrilar

1. Ichki PVI uchun **Egri L** ga uzunlik kiriting, masalan 200.
2. Egri PVI markaziga chiziladi. Profil va oʻng panel uning turini (choʻqqi yoki botiq), L va K ni, BVC va EVC stansiya va balandliklarini, hamda egri ichida boʻlsa, uning yuqori yoki past nuqtasini koʻrsatadi.

K L dan hisoblanadi (K = L nishablarning algebraik farqiga boʻlinadi, foizda). Siz L ni kiritasiz; K ni toʻgʻridan-toʻgʻri kiritish hali mavjud emas.

Vertikal egri sigʻmasa, qizil quti sababini aytadi: u oldingi PVI yoki egriga orqaga kiradi yoki keyingi PVI dan oʻtadi, va oʻsha tomonda qancha joy borligini koʻrsatadi (egri oʻz PVI sining har ikki tomonida uzunligining yarmini talab qiladi). Uning tugmasi **sigʻadigan eng uzun egri** ni, uning K bilan, bitta qadamda oʻrnatadi ({{key:Mod+Z}} uni bekor qiladi). Yoki PVI larni bir-biridan uzoqlashtiring.

## Faktlarni oʻqish

PVI jadvali ostidagi roʻyxat har bir nishabni foizda beradi ("Nishab 1: +1.25%") va har bir egrini, masalan "Choʻqqi 2+00.00 da: L 200.00, K 85.3, BVC 1+00.00 (253.10), EVC 3+00.00 (252.40)", soʻngra "Yuqori nuqta 1+62.40, 254.12".

Agar PVI lar trassaning ikki uchiga yetmasa, izoh buni aytadi. Yoʻlak faqat profil va trassa ustma-ust tushgan joyda quriladi.

## Profildagi xususiyat chiziqlari

Xususiyat chiziqlari profil koʻrinishida ham koʻrinadi, shuning uchun bordyur, ariq yoki devor choʻqqisini yoʻl profiliga nisbatan koʻrishingiz mumkin.

- Xususiyat chizigʻi trassani **kesib oʻtgan** joyda profil oʻsha stansiya va balandlikda kichik romb koʻrsatadi, uning yonida chiziq nomi va oʻsha joydagi balandligi yoziladi (kesishayotgan kesma boʻylab hisoblangan chiziqning oʻz balandligi).
- Trassa yonida **yonma-yon** oʻtadigan xususiyat chiziqlarini shu masofa ichida chizish uchun {{ui:Quyidagi masofa ichida yonida}} ga masofa kiriting; ular oʻz balandliklarida punktir chiziq bilan chiziladi. Boʻsh yoki 0 boʻlsa, faqat kesishmalar koʻrinadi.
- Har qanday oʻzgarish belgilarni va yorliqlarni kuzatadi: uchni koʻchiring, nishab kiriting yoki chiziqni koʻtaring, va profil yangi balandliklarni darhol koʻrsatadi.
- Xususiyat chizigʻini tanlash uchun kesishma rombini bosing; tanlangan chiziq yoritish rangida chiziladi.
- Profil panelidagi {{ui:Xususiyat chiziqlari}} ularning hammasini yashiradi yoki koʻrsatadi. Ikkala sozlama ham loyiha bilan saqlanadi.

Qarang: [Xususiyat chiziqlari](topic:feature-lines).

## Keyingi

- [Yoʻl yoʻlagini](topic:corridor) shu trassa va bu profil boʻylab yoyish.
- Profil trassa bilan birga LandXML ga yoziladi; qarang: [LandXML almashinuvi](topic:landxml).
