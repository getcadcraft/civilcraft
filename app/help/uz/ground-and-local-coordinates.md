---
title: Yer va mahalliy koordinatalar
summary: Yer (sirt) koordinatalarida ishlang — ular setkadan umumiy masshtab koeffitsienti bilan masshtablanadi, uni siz kiritasiz yoki nuqtada hisoblaysiz — yoki ikki nazorat nuqtasi bilan tizimga bogʻlangan taxminiy sayt setkasida.
keywords: yer koordinatalari, sirt koordinatalari, setkadan yerga, umumiy masshtab koeffitsienti, csf, umumiy koeffitsient, setka koeffitsienti, balandlik koeffitsienti, dengiz sathi koeffitsienti, yaqinlashish, xaritalash burchagi, masshtab koeffitsienti, taxminiy koordinatalar, mahalliy koordinatalar, sayt setkasi, 5000 5000, nazorat nuqtalari, lokalizatsiya, kalibrlash, ikki nuqta, nomuvofiqlik
from: 3d7453de
---

Davlat tekisligi va UTM koordinatalari **setka** koordinatalaridir: xarita proyeksiyasi masofalarni biroz choʻzadi yoki siqadi (oʻnlab parts per million, ppm), sayt qanchalik baland boʻlsa, oʻlchangan yer masofasi setka masofasidan shunchalik farq qiladi. Shu sababli koʻp tadqiqotlar **yer** koordinatalarini topshiradi, ular reja masofalari yerda oʻlchangan masofalarga teng boʻladi, yoki **taxminiy** sayt setkasini (nazorat nuqtasida 5000, 5000). CivilCraft raqamlaringizni oʻz holicha saqlaydi va ularning setka bilan bogʻliqligini yozib qoʻyadi, shuning uchun kenglik va uzunlik, GIS fayllari va xarita qatlamlari ham toʻgʻri joyga tushadi.

**GIS** guruhida {{ui:Coordinates}} ni oching, tizimni tanlang (yoki saqlang), soʻng **Setka, yer yoki mahalliy koordinatalar** ostida tanlang:

| Tanlov | Koordinatalaringiz | Setkaga bogʻliqligi |
|---|---|---|
| {{ui:Grid}} | Tizimning oʻz koordinatalari (boshlanish) | Bir xil raqamlar |
| {{ui:Ground}} | Yer masofalariga masshtablangan | setka = asos + umumiy koeffitsient × (yer − asos) |
| {{ui:Local}} | Taxminiy sayt setkasi | Ikki nazorat nuqtasi bilan setkaga siljitilgan, burilgan va masshtablangan |

Tanlaganingiz loyiha bilan saqlanadi va bitta bekor qilish qadami; hech narsa siljimaydi.

## Yer koordinatalari

1. {{ui:Ground}} ni tanlang.
2. Tadqiqotdan **Umumiy masshtab koeffitsienti** ni kiriting (masalan `0.99987`), yoki hisoblang:
   1. **Nuqtada koeffitsientni hisoblash** ostida nuqta loyihaning oʻrtasidan boshlanadi. {{ui:Pick a point on the plan}} ni tanlang va joyni bosing (tadqiqot nuqtasi yaqinidagi bosish oʻsha nuqtani oladi), yoki E va N ni yozing.
   2. Balandlik oʻsha joydagi sirtdan olinadi; kerak boʻlsa boshqasini kiriting.
   3. {{ui:Compute}} ni tanlang. CivilCraft koʻrsatadi:
      - **Setka masshtab koeffitsienti k**: xarita proyeksiyasi oʻsha yerda masofalarni qanchaga choʻzishi.
      - **Balandlik koeffitsienti**: ellipsoidda, shu balandlikdagiga nisbatan masofalar qanchalik qisqa.
      - **Umumiy koeffitsient** = k × balandlik koeffitsienti: setka masofasi = yer masofasi × bu.
      - **Yaqinlashish**: oʻsha yerda setka shimoli va haqiqiy shimol orasidagi burchak (geodezik azimut = setka azimuti + yaqinlashish).
   4. Raqamlar ostidagi {{ui:Use}} tugmasini tanlang, umumiy koeffitsientni katakka qoʻyish uchun.
3. **Asos nuqtasi** ni oʻrnating: yer va setka koordinatalari bir xil boʻlgan joy. U 0, 0 dan boshlanadi: yer koordinatalarini nashr etadigan koʻpchilik hududlar boshi atrofida masshtablaydi, shuning uchun yer koordinatalari setkadagilarga tanish boʻlib qoladi. Ayrim tadqiqotlar buning oʻrniga loyihaning nazorat nuqtasi atrofida masshtablaydi: tadqiqot nima deyishini ishlating.
4. {{ui:Apply}} ni tanlang.

:::warning
Balandlik ellipsoiddan balandlik sifatida olinadi. CivilCraft geoid modeliga ega emas, shuning uchun geoid ellipsoiddan 30 m (100 ft) pastda yoki yuqorida boʻlgan joyda balandlik koeffitsienti taxminan 5 ppm ga xato boʻladi. Tadqiqot oʻzining umumiy koeffitsientini aytganda, oʻshani kiriting.
:::

## Mahalliy (taxminiy) koordinatalar

1. {{ui:Local}} ni tanlang.
2. **Nazorat nuqtasi 1** uchun tadqiqot nuqtasining raqamini kiriting (yoki {{ui:Pick}} ni tanlab, rejada bosing). Uning mahalliy koordinatalari yonida koʻrinadi.
3. Uning **setka** E va N ni yoki uchinchi katakdagi kenglik va uzunligini kiriting (masalan `30.2672, -97.7431`).
4. **Nazorat nuqtasi 2** uchun ham xuddi shunday, birinchisidan iloji boricha uzoqda.
5. CivilCraft topilgan **Masshtab** va **Burilish** ni koʻrsatadi va eslatadi: **Ikki nuqta doim aniq mos keladi — uchinchisini tekshiring.**
6. **Tekshiruv nuqtasi** uchun ham xuddi shunday bering. CivilCraft uning siz kiritgan setka koordinatalaridan qanchalik uzoqligini koʻrsatadi (nomuvofiqlik, loyiha birliklarida va ppm da). Katta nomuvofiqlik notoʻgʻri nuqtani, yozuv xatosini yoki boshqa birlikdagi koordinatalarni bildiradi.
7. {{ui:Apply}} ni tanlang.

Masshtab 1 dan uzoq boʻlsa (0.5 dan 2 gacha boʻlgan chegaradan tashqari) rad etiladi: nuqtalar va ularning birliklarini tekshiring.

## Tekshirilgan narsalar

- Masshtab koeffitsienti va yaqinlashish PROJ (pyproj 3.7.1 bilan PROJ 9.5.1) bilan mos keladi — koʻpchilik GIS dasturlari ishlatadigan koordinata kutubxonasi — 300 dan ortiq konform proyeksiyali tizimda (davlat tekisligi, UTM, transverse Mercator, Lambert conformal conic) milliardning bir qismi aniqligida, va brauzerda rejada tanlangan nuqtada.
- Yer va mahalliy qadamlar bir-biriga milliardning bir qismi aniqlikda qaytib konvertatsiya qilinadi; ikki nazorat nuqtasi ular bilan yaratilgan masshtab va burilishni qaytaradi; 0.05 ft siljigan tekshiruv nuqtasi 0.05 ft nomuvofiqlik koʻrsatadi.
