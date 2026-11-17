---
title: Sugʻorish tizimini loyihalash
summary: Hisoblash vositasi, muhrlangan loyiha emas: saytdagi sepkichlar, yon quvurlar, asosiy liniya, klapanlar va tomchilatish liniyalari; quvurlardan topilgan zonalar; Hazen–Williams boʻyicha bosim yoʻqotishi, eng yomon holat sepkichi, taʼminotga nisbatan oqim va bosim, yogʻin tezligi, ishlash vaqtlari, qamrov va materiallar roʻyxati.
keywords: sugʻorish, purkagich, sepkich, sepkichlar, aylanuvchi soplo, pufakcha sepkich, tomchilatish, tomchilatish liniyasi, emitter, klapan, zona, stansiya, boshqaruvchi, asosiy liniya, yon quvur, ulanish nuqtasi, suv taʼminoti, bosim, psi, kpa, oqim, gpm, ishqalanish yoʻqotishi, hazen williams, yogʻin tezligi, ishlash vaqti, qamrov, sepkichdan sepkichgacha, materiallar roʻyxati
from: 7d6342c1
---

:::warning
Bu hisoblash vositasi, muhrlangan loyiha emas: sugʻorish muhandisi qurilishdan oldin har bir natijani tekshirishi kerak.
:::

## Tizimni joylashtirish

1. Chap tomondagi **Sugʻorish** boʻlimida **Sepkich** ni, uning **Yoy**ini va yoyning boshlanish joyini, hamda yon quvurlar va asosiy liniya uchun quvur oʻlchamlarini tanlang.
2. {{ui:Sugʻorish}} › {{ui:Ulanish nuqtasi}}: suv taʼminoti qoʻshiladigan joyni bosing. **Xususiyatlar**da uning **bosimini**, mavjud **oqimni** va hisoblagich hamda qaytarish klapanidagi yoʻqotishni belgilang.
3. {{ui:Sugʻorish}} › {{ui:Klapan}}: har bir zona klapani qoʻyiladigan joyni bosing. Klapan zonani boshlaydi.
4. {{ui:Sugʻorish}} › {{ui:Sepkich}}: sepkichlarni qoʻyish uchun bosing; har bir bosish bitta sepkich qoʻyadi.
5. {{ui:Sugʻorish}} › {{ui:Yon quvur}}: klapandan uning sepkichlari orqali bosing va {{key:Enter}} ni bosing. {{ui:Asosiy liniya}}: ulanish nuqtasidan har bir klapangacha.

Quvur uchlari sepkichlar, klapanlar, taʼminot va boshqa quvur uchlariga tutashadi, shuning uchun tarmoq bir butun boʻladi. Zona — bu uning klapanidan yon quvurlar boʻylab yetib boriladigan hamma narsa; asosiy liniya bir vaqtda faqat bitta zonani olib boradi.

## Tomchilatish

{{ui:Sugʻorish}} › {{ui:Tomchilatish liniyasi}}: liniya boʻylab bosing, u oziqlantiriladigan joydan boshlab (yon quvur uchi yoki klapan). **Xususiyatlar**da **emitter oqimi** va **oraliq** ni belgilang; uning oqimi undagi emitterlarning yigʻindisidir.

## Tekshiruv

{{ui:Sugʻorish}} › {{ui:Tizimni tekshirish…}} har bir zonani sanab chiqadi:

| Ustun | Qanday hisoblanadi |
|---|---|
| Oqim | Sepkichlar oqimlari (va tomchilatish liniyalari oqimlari) yigʻindisi |
| Klapanda | Eng yomon holat sepkichining ishchi bosimi, unga qadar quvur yoʻqotishlari (Hazen–Williams, quvurning ichki diametri, balandlik oʻzgarishi) va klapan orqali yoʻqotish qoʻshilgan holda |
| Taʼminotda | Shunga oʻxshash, plus shu zonani olib boruvchi asosiy liniyaning yoʻqotishi, hamda hisoblagich va qaytarish klapanidagi yoʻqotish |
| Yogʻin | Sepkichlar oqimi, ularning sepkichdan sepkichgacha oraliqda sugʻoradigan maydoniga boʻlingan holda |
| Haftada daqiqalar | **Haftada sugʻorish** sozlamasiga koʻra |
| Muammolar | Tezlik chegaradan oshgan, sepkich bosim diapazonidan tashqarida, bitta klapanda sepkichlar va rotorlar, taʼminotda bosim yoki oqim yetarli emas, hech qaysi zonaga tegishli boʻlmagan sepkichlar, halqalar |

Klapanni tanlang, uning zonasi raqamlari va eng yomon holat sepkichi rejada halqaga olingan holda koʻrinadi. Materiallar roʻyxati sepkichlarni turi va burchagi boʻyicha, quvurni oʻlchami boʻyicha, klapanlar, tomchilatish liniyasi va emitterlar hamda boshqaruvchining stansiyalarini sanaydi. **CSV sifatida saqlash** ikkalasini saqlaydi.

Sugʻorish boʻlimidagi sozlamalar: **Hazen–Williams C** (yangi plastik quvur uchun 150), quvurdagi **eng tez oqim** (1.5 m/s), **klapan orqali yoʻqotish** va **haftada suv**. Ular standart qiymat sifatida belgilangan.

## Qamrov

{{ui:Sugʻorish}} › {{ui:Qamrovni koʻrsatish}} sepkichlar qancha maydonni quruq qoldirishini, qancha qismini ikki yoki undan ortiq sepkich sugʻorishini va qaysi sepkichlar qoʻshni sepkichga yetmasligini (sepkichdan sepkichgacha oraliq) koʻrsatadi.

## Sepkichlar

Roʻyxatdagi sepkichlar CadCraft tomonidan loyihalash yogʻin tezliklari asosida yozilgan **umumiy** turlar (doimiy purkagichlar, aylanuvchi soplolar, tishli rotorlar, pufakcha sepkichlar, mikro-purkagichlar, emitterlar) boʻlib, hech qanday ishlab chiqaruvchining mahsulotlari emas. **Sepkichlarni fayldan qoʻshish…** sizning sepkichlaringizni oʻqiydi (har bir sepkichning uchish masofasi, oqimi yoki yogʻin tezligi va bosim diapazoni koʻrsatilgan JSON roʻyxat); ular loyiha bilan birga saqlanadi. Ishlab chiqaruvchining eʼlon qilingan maʼlumotlari faqat oʻsha ishlab chiqaruvchining yozma ruxsati bilan kiritiladi.

Umumiy sepkichlardan pastda roʻyxatda **taxminiy sepkichlar** bor (nomlari "typical values" bilan tugaydi): doimiy purkagichlar, aylanuvchi soplolar va tishli rotorlarning soplo oʻlchamlari, mikro-purkagichlar, pufakcha sepkichlar va emitterlar, radius, oqim va bosim diapazoni bilan. Ular CadCraft tomonidan faqat ochiq manbalardan olingan matematika (oqim uchun orifis tenglamasi, radius uchun jet-uchish masshtabi) va nominal oqim sinflari asosida hisoblangan; hech qanday ishlab chiqaruvchining jadvali nusxalanmagan. Biror taxminiy sepkichni tanlasangiz, tanlagich uning asosini va litsenziyasini koʻrsatadi. Undan foydalanadigan loyiha sepkich va uning manbasini loyiha faylida saqlaydi. Ular rejalashtirish uchun moʻljallangan: qurishdan oldin haqiqiy sepkichning oʻz maʼlumotlarini tekshiring.
