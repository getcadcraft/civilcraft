---
title: Osilish va tortish
summary: Yuklama holatlari (harorat, shamol, muz) va tortish chegaralari, CivilCraft har bir kesimdagi tortishni qanday hisoblashi hamda tortish jadvallari.
keywords: osilish, tortish, yuklama holati, harorat, shamol, muz, assimetrik muz, hisobiy oraliq, ekvivalent oraliq, holat oʻzgarishi, katenariya, tortish jadvali, uzilish kuchi, kundalik kuchlanish
from: f8876c35
---

## Yuklama holatlari va chegaralar

{{ui:Yana}} › {{ui:Yuklama holatlari va chegaralar…}} loyihadagi har bir liniya rioya qiladigan qoidalarni tahrirlaydi.

- **Yuklama holatlari**: harorat, oʻtkazgichga shamol bosimi (Pa) va radial muz (mm, zichligi bilan). Birinchi holat asosiy hisoblanadi.
- **Tortish chegaralari**: oʻtkazgichning uzilish kuchining bir ulushi, gorizontal tortishda yoki tayanchdagi eng katta tortishda, bitta yuklama holatida. Yoki gorizontal tortishni oʻzingiz bering.
- **Masofalar**: oʻtkazgich yer, yoʻl, bino va hokazolar ustida saqlaydigan masofa. Ularni qoʻshing, qayta nomlang va oʻchiring: ular sizniki. Ularning pastida **Liniya ostidagi oʻsimliklar**, **Liniya ostidagi devorlar** va **Yer osti kesishmalari** qoidalarini tanlang.
- **Tekshiruvlar ishlatadigan holatlar**: qaysi holat eng katta osilishni beradi (issiq), izolyator burilishi (shamol), muz va tayanch bir tomonidagi muz.
- **Omillar**: fazalar oraligʻi omili k, eng katta izolyator burilishi, tayanch va birikma yuklamalariga koeffitsiyent, tayanchlarni burchakli va oxirgi qilib hosil qiluvchi burilish burchaklari, yer ostidagi kabellar uchun eng kichik qoplama va eng katta kuchlanish pasayishi.

## Paketlar: davlat uchun qoidalar va kutubxona

Hech bir davlatning qoidalari CivilCraft ichiga oʻrnatilmagan. **Paket** bitta faylda (`.cclinepack.json`) qoidalar toʻplamini va kutubxonani saqlaydi, davlat, tarmoq operatori yoki kompaniya uchun:

- **Paket sifatida saqlash…** {{ui:Yuklama holatlari va chegaralar…}} oynasida koʻrsatilgan qoidalar toʻplamini va kutubxonangizni yozadi (yoki kutubxonada hali hech narsa boʻlmasa, bu loyihada ishlatiladigan elementlarni). Avval **Mamlakat yoki hudud** ni kiriting.
- **Qoidalar toʻplamini yoki paketni ochish…** paketni, qoidalar faylini yoki kutubxona faylini oʻqiydi. Paketning qoidalari dialogda koʻrsatiladi (ulardan foydalanish uchun **Qoʻllash** ni bosing), elementlari esa kutubxonangizga tushadi.
- Boshqalar ulashgan paketlar qoʻshimchalar sahifasida **Quvvat liniyasi paketlari** ostida roʻyxatlanadi. Ikki namunaviy paket formatni koʻrsatadi; ular hech bir davlatning qoidalari emas.

Har bir paket ochilganda tekshiriladi, har qanday fayl kabi. Qurilishdan oldin har bir qiymatni tegishli standart bilan tekshiring.

Boshlash uchun ikkita namunaviy qoidalar toʻplami bor: **Namuna: sovuq iqlim** va **Namuna: moʻtadil iqlim**. Ularning raqamlari hech qanday standartdan olinmagan: standartingiz bergan qiymatlarni oʻrnating. {{ui:Qoidalarni saqlash}} va {{ui:Qoidalarni ochish…}} qoidalar toʻplamini fayl sifatida ulashadi.

## Tortish qanday hisoblanadi

Har bir osilgan tayanchlar orasidagi kesim uchun:

1. **Hisobiy oraliq** — uning oraliqlarining √(ΣL³ ÷ ΣL) qiymati.
2. Har bir chegara **holat oʻzgarishi tenglamasi** orqali hisobiy oraliqda asosiy holatdagi gorizontal tortishga aylantiriladi: H₂²·(H₂ − H₁ + EA·w₁²L²/(24H₁²) + EA·α·(t₂ − t₁)) = EA·w₂²L²/24. Eng qattiqi tortishni belgilaydi.
3. Har bir yuklama holatining tortishi shu asosdan kelib chiqadi, va har bir oraliqning shakli ikki biriktirish nuqtasi orqali oʻtuvchi aniq **katenariya** (qiyaliklardagi oraliqlar ham): vatardan osilish, uzunlik va har bir uchidagi tortish.

Bir metrdagi yuklama holatda: vertikal ravishda ogʻirlik va muz (muz maydoni × zichlik × g); gorizontal ravishda shamol bosimi × muzli diametr.

## Tortish jadvallari

{{ui:Yana}} › {{ui:Simni tortish jadvallari…}} har bir kesim uchun gorizontal tortish va har bir oraliqning osilishini har bir harorat boʻyicha qoidalar toʻplamidan (boshida −5 °C dan 40 °C gacha 5 °C qadam bilan) tinch havoda koʻrsatadi. Ularni va tayanchlar jadvalini CSV sifatida saqlang.

Hisobga olinmagan: yillar davomida oʻtkazgichning sekin deformatsiyasi (creep) va yangi oʻtkazgichning choʻzilishi. Ularni oʻzingiz tortadigan haroratlar orqali qoʻshing.
