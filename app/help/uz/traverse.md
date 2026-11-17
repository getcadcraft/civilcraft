---
title: Poligon yoʻlini kiriting va uni kompas qoidasi boʻyicha tuzating
summary: Yoʻnalish burchaklari yoki rumblarni va masofalarni kiriting, burchak va chiziqli yopilmaslikni hamda aniqlikni tekshiring, kompas qoidasi boʻyicha tuzating va nuqtalarni geodezik nuqta sifatida yoki halqani uchastka sifatida qoʻshing.
keywords: poligon, yopiq poligon, halqa, oʻngga burchaklar, orqa koʻrish, rumblar, masofalar, yopilish, yopilmaslik, aniqlik, kompas qoidasi, bowditch, tuzatish, geodezik
from: 56ce5a8c
---

Poligon yoʻli — oʻlchangan chiziqlar qatori: har bir nuqtada burchak (yoki rumb) va keyingi nuqtagacha masofa. Hech narsa tanlanmagan boʻlsa, oʻng paneldagi **Poligon** ostida **Poligon yoʻlini kiriting** tugmasini bosing.

## Qayerdan boshlanadi va qayerda tugaydi

1. **Geodezik nuqtadan boshlash**: uning raqami. Yoki shimoliy koordinata (northing) va sharqiy koordinata (easting) ni kiriting.
2. **Chiziqlar koʻrinishi**: **Oʻngga burchaklar va masofalar** yoki **Rumblar va masofalar**.
3. Burchaklar bilan, ular qayerdan boshlanishini koʻrsating: **Orqa koʻrish geodezik nuqtasi** yoki **uning azimuti** (birinchi nuqtadan orqa koʻrish nuqtasi tomon, shimoldan soat yoʻnalishi boʻyicha).
4. **Tugashi**: **boshlanish nuqtasiga qaytish (halqa)** yoki **geodezik nuqtada** va uning raqami (maʼlum nuqtalar orasidagi ochiq poligon).

## Chiziqlarni kiriting

Har bir chiziq bitta qatorda: avval burchak yoki rumb, keyin masofa, keyin xohlasangiz, u yetib boradigan poligon nuqtasining nomi.

- Oʻngga burchaklar, chiziq chiqadigan nuqtada soat yoʻnalishi boʻyicha, orqadagi nuqtadan keyingisigacha buriladi: `270°00'10" 125.50 B`. `270-00-10`, `270 00 10` va `270.0028` ham ishlaydi.
- Rumblar: `N 45°30'15" E 125.50 B`, yoki azimut bir soʻz sifatida: `AZ 45-30-15 125.50 B`.
- Burchaklar bilan halqada oxirida `close` va boshlanish nuqtasidagi burchakni yozing; u oxirgi nuqtadan ikkinchisiga qarab buriladi: `close 270°00'05"`. Burchaklar aynan shu bilan tekshiriladi.

Oʻqib boʻlmaydigan qatorlar qator raqamlari bilan koʻrsatiladi. "feet", vergullar va `#` bilan boshlanadigan izoh qatorlari ham qabul qilinadi.

## Yopilishni koʻring

Siz kiritganingizda dialog quyidagilarni koʻrsatadi:

- **Burchaklar yopilmasligi**: burchaklar qanchalik yopilmaganligi va har bir burchakning ulushi. Yopuvchi burchak boʻlmasa, burchaklar tekshirilmaydi va ularning xatosi chiziqli yopilmaslikda koʻrinadi.
- **Chiziqli yopilmaslik**: poligon tugashi kerak boʻlgan joydan qanchaga va qaysi yoʻnalishda uzoqlashgani.
- **Aniqlik**: poligon uzunligining chiziqli yopilmaslikka nisbati: 1 : 10,000 degani 10,000 ft da 1 ft.
- Tuzatishdan keyingi nuqtalar va har biri qancha siljigani.

## Tuzatish

Avval burchaklarning yopilmasligi burchaklar boʻyicha teng taqsimlanadi. Soʻng chiziqli yopilmaslik kompas qoidasi (Bowditch) boʻyicha chiziqlar boʻylab taqsimlanadi: har bir nuqta bosib oʻtilgan masofaga mutanosib ravishda yopilmaslikka qarshi siljiydi, shunda poligon aynan kerakli joyda tugaydi.

:::note
Kompas qoidasi eng kichik kvadratlar usuli emas, u standart tuzatish boʻlib, burchaklarni masofalar bilan tortmaydi. Aniqlik yetarli-yetarli emasligini oʻz standartlaringiz va mamlakatingiz talablari belgilaydi.
:::

## Natijadan foydalaning

- **Geodezik nuqtalar sifatida qoʻshish**: tuzatilgan nuqtalar siz bergan nomlar bilan geodezik nuqtalarga aylanadi (aks holda keyingi boʻsh raqamlar bilan), tavsifi `TRAV`, balandliksiz. Halqaning oxirgi nuqtasi uning boshlanishi boʻlgani uchun ikki marta qoʻshilmaydi. Bir qadam: {{key:Mod+Z}} uni ortga qaytaradi.
- **Uchastka sifatida qoʻshish** (halqalar): tuzatilgan nuqtalar [yer uchastkasi](topic:parcels) sifatida, uning yorliqlari va huquqiy tavsifi bilan qoʻshiladi.
- **Hisobot (CSV)**: yopilish qatorlari, soʻng har bir nuqtaning yoʻnalishi, masofasi, tuzatilmagan va tuzatilgan koordinatalari hamda tuzatishlari.
