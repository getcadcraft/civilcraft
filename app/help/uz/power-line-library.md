---
title: Elektr liniyasi kutubxonangiz
summary: Oʻzingiz nomlagan kategoriyalarda oʻz simlaringiz, yer osti kabellaringiz, tayanchlaringiz, jihozlaringiz va xandaq turlaringizni yarating hamda ularni fayl sifatida ulashing.
keywords: kutubxona, sim, kabel, ustun, tayanch, travers, izolyator, armatura, ushlagich, transformator, shkaf, birikma, xandaq, kategoriya, csv, import, eksport
from: 88733744
---

Elektr liniyalari ish maydonining **Kutubxona** boʻlimi liniya yoki kabel ishlata oladigan barcha elementlarni saqlaydi. Ularning hech biri mamlakat yoki ishlab chiqaruvchiga bogʻlanmagan: siz bilan ishlaydigan elementlarni oʻzingiz yaratasiz.

## Uch xil element

| Tur | Qayerda turadi | Oʻzgartira olasizmi? |
|---|---|---|
| **Namunalar** | CivilCraft bilan birga keladi, material xossalaridan hisoblangan umumiy raqamlar bilan | Yoʻq: avval {{ui:Mening kutubxonamga nusxalash}} |
| **Loyihada** | Ochgan loyiha fayli bilan kelgan | Yoʻq: avval {{ui:Mening kutubxonamga nusxalash}} |
| **Mening** | Oʻzingizning elementlaringiz, shu brauzerda saqlanadi | Ha, oʻzgarishlar darhol saqlanadi |

Har bir loyiha ishlatadigan har bir elementning nusxasini saqlaydi, shuning uchun loyiha har qanday kompyuterda oʻzining simlari va ustunlari bilan ochiladi.

:::warning
Namunaviy elementlar faqat namunadir: har bir raqamni yetkazib beruvchingizning maʼlumotlari bilan tekshiring. Yer osti kabellarida tok reytingi ataylab yoʻq, chunki u kabel qanday yotqizilganiga bogʻliq.
:::

## Element yaratish

1. **Kutubxona** da **Tur** ni tanlang (havo simlari, yer osti kabellari, tayanchlar, jihozlar yoki xandaq turlari).
2. {{ui:Yangi element}} ni bosing, yoki namunani tanlab {{ui:Mening kutubxonamga nusxalash}} yoki {{ui:Takrorlash}} ni bosing.
3. Uning maydonlarini toʻldiring. `*` bilan belgilangan maydonlar tekshiruvlar uchun kerak boʻlganlardir; yetishmayotgan element `!` bilan belgilanadi va liniya uni ishlatganda **Tekshiruvlar** da roʻyxatga olinadi.
4. Unga **Kategoriya** bering, darajalar orasiga `/` qoʻyib: `Overhead/LV/Bundled`, `Supports/Concrete/12 m`. Daraxt sizning kategoriyalaringizga ergashadi.

Har bir tur uchun tekshiruvlarda kerak boʻladigan maydonlar:

| Tur | Tekshiruvlar uchun kerak |
|---|---|
| Havo simi | kesim yuzi, diametr, metrga massa, uzilish kuchi, elastiklik moduli, issiqlik kengayishi |
| Yer osti kabeli | tomirlar, kesim yuzi, kuchlanish, diametr, qarshilik, tok reytingi |
| Tayanch | umumiy uzunlik, nominal yuk (tepadan pastdagi nuqtada olinadi), yerdagi chuqurlik |
| Jihoz | uning turi; travers, armatura va ushlagichlar uchun nominal yuk; travers uchun faza oraligʻi va pasayish; izolyatorlar uchun uzunlik; ushlagichlar uchun burchak |
| Xandaq turi | chuqurlik, kenglik, kabellar ustidagi qoplama |

## Ulashish

- {{ui:Kutubxonamni saqlash}} sizning barcha elementlaringizni bitta `.cclines.json` fayl sifatida saqlaydi; {{ui:Kutubxonani ochish…}} uni qaytadan oʻqiydi (bir xil kalitli elementlar almashtiriladi).
- {{ui:CSV sifatida saqlash}} koʻrayotgan turingizni elektron jadval sifatida saqlaydi; {{ui:Kutubxonani ochish…}} shu turdagi CSV ni qaytadan oʻqiydi. Ustunlar istalgan tartibda boʻlishi mumkin; nuqtali vergul bilan ajratilgan faylda oʻnlik vergul ishlatilishi mumkin.
