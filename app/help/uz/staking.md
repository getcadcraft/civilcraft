---
title: Qoziqlarni belgilash hisobotini tuzish
summary: Trassa boʻylab qoziqlarni stansiya va ofsetlar boʻyicha yoki unga yaqin geodezik nuqtalarni roʻyxatga oling: stansiya, ofset, shimoliy va sharqiy koordinatalar, loyiha va yer balandliklari, kesim yoki toʻldirma; hisobotni CSV yoki PDF sifatida saqlang.
keywords: qoziqlar, qoziqlarni belgilash, qoziq hisoboti, kesim varaqi, balandlik varaqi, stansiya, ofset, kesim, toʻldirma, joylashtirish, qurilish belgilash, ijro etilgan
from: d8a4e9f1
---

Trassani tanlang va uning **Xossalar** qismida **Qoziqlarni belgilash hisoboti** tugmasini bosing.

## Stansiya va ofsetlar boʻyicha qoziqlar

1. **Dan** va **gacha**: belgilanadigan stansiyalar (1+50 yoki 150).
2. **har**: oraliq. Qoziqlar uning har bir karrali nuqtasiga, ikki uchiga va (belgi katakchasi belgilab qoʻyilgan boʻlsa) trassa egri chiziqlarining boshlanish va tugash joylariga qoʻyiladi.
3. **Ofsetlar**: trassaning chap va oʻng tomoni, stansiyaga qarab: `12 L, 0, 12 R`, `L12 CL R12` yoki `-12, 0, 12` (chap tomon minus bilan). Koridorli trassa yoʻl qoplamasi va yelkalarining chetlaridan boshlanadi.
4. **Raqamlashni boshlash** va **prefiks bilan** qoziqlarga nom beradi: 1, 2, 3 yoki S101, S102.

## Trassa yaqinidagi geodezik nuqtalar

**Trassa yaqinidagi geodezik nuqtalar** ni tanlang va qaysi masofada yaqin ekanini belgilang. Shu masofadagi har bir nuqta oʻz stansiyasi va ofsetini, shu yerdagi loyihani va oʻz balandligini yer sifatida oladi: qoziqlangan yoki ijro etilgan holda oʻlchangan nuqtalarni tekshirish uchun.

## Hisobot nimani koʻrsatadi

| Ustun | Nimani anglatadi |
|---|---|
| Nuqta | Qoziqning nomi yoki geodezik nuqtaning raqami |
| Stansiya, Ofset | Trassa boʻylab qayerda: L chap, R oʻng |
| Shimoliy, Sharqiy | Uning koordinatalari |
| Loyiha bal. | Shu yerdagi loyihalangan koridor sirti (tushish chizigʻidan tushish chizigʻigacha), aks holda markaziy chiziqdagi loyiha profili |
| Yer bal. | Shu yerdagi mavjud sirt yoki geodezik nuqtaning oʻz balandligi |
| Kesim/toʻldirma | C — yer loyihadan baland boʻlsa (kesib tushiriladi), F — past boʻlsa (toʻldiriladi), yuzdan biriga qadar |

Loyiha balandligi yoʻq qoziq (koridordan tashqarida yoki markaziy chiziqdan uzoqda trassada) kesim yoki toʻldirmaga ega emas; dialogda ularning soni koʻrsatiladi.

## Saqlash

- **CSV**: sarlavha qatori, soʻng yuqoridagi ustunlar hamda elektron jadvallar va maʼlumot yigʻuvchilar uchun imzoli son sifatida kesim yoki toʻldirma (yer minus loyiha).
- **PDF**: tanlangan qogʻozda jadval sahifalari, har bir qatorda bitta qoziq, kesimlar toʻq sariq, toʻldirmalar yashil rangda, boshqa varaqlardagi kabi sarlavha chizigʻi bilan.

:::note
Qoziqlar loyihadagi loyihadan hisoblanadi. Qurish boshlanishidan oldin ularni tasdiqlangan rejalar bilan tekshiring.
:::
