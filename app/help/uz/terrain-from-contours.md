---
title: Kontur chiziqlaridan relyef
summary: Kontur xaritasidan yer sirtini yarating: chiziq qatlamlarini tanlang, har bir chiziqning balandligi qayerdan olinishini belgilang, kesishmalar va takrorlanishlarni tekshiring va quring. Kontur chiziqlari sinuvchi chiziqlarga aylanadi, qirlar va vodiylardagi tekis uchburchaklar tuzatiladi. Rasm yoki PDF dan chizilgan xarita ikki maʼlum nuqta bilan masshtablanib joylashtirilishi mumkin.
keywords: konturlar, kontur chiziqlari, konturlardan relyef, sirt konturlardan, topografik xarita, geodezik xarita, koordinatalarsiz, sinuvchi chiziqlar, tekis uchburchaklar, qir, vodiy, choʻqqi, kesishuvchi konturlar, takroriy konturlar, kontur oraligʻi, xaritani masshtablash, ikki nuqta, xaritani joylashtirish, DXF, DWG, shapefayl
from: e6161653
---

Geodezik mutaxassis ba'zan kontur xaritasini yuboradi: balandlikli chiziqlar bor, nuqtalar yoʻq. CivilCraft mavjud yerni shu chiziqlardan quradi.

## Konturlarni olib kirish

Xaritani chiziqlar sifatida oching: DXF yoki DWG chizma, shapefayl yoki GeoJSON (**GIS** › {{ui:Import}}, yoki faylni rejaga tashlang). Chiziqlar **xarita qatlamlari** sifatida kiradi. **Sirt** › {{ui:Yana}} ostida {{ui:Konturlardan relyef}} ni tanlang.

## Har bir balandlik qayerdan olinishini belgilash

Kontur saqlaydigan qatlamlarni belgilang, soʻng **Balandlik manbasi** ni tanlang:

- {{ui:Chiziqlarning oʻz balandliklari}}: barcha choʻqqilari bir xil balandlikka ega boʻlgan chiziq (3D polichiziq yoki balandlikli polichiziq). 0 dagi chiziq — reja chizigʻi va unda balandlik yoʻq.
- Qatlamning **raqamli maydoni** (masalan ELEV), xaritada u boʻlsa.
- {{ui:Boshlangʻich qiymat va oraliq, chiziqlar roʻyxatidagi tartibda}}: umuman balandligi yoʻq chiziqlar uchun. Roʻyxatdagi birinchi chiziq **Birinchi chiziq balandligi** ni oladi, keyingisi shu qiymat plus **Kontur oraligʻi**, va hokazo. Chiziqlarni pastdan yuqoriga qarab roʻyxatlang (yoki qatlamda tartibini oʻzgartiring).

## Tekshirish, soʻng qurish

{{ui:Tekshirish}} hech narsa oʻzgarishidan oldin nima notoʻgʻri ekanini soʻzlar bilan sanab beradi:

- **balandligi yoʻq** chiziq yoki ikkitadan kam nuqtali chiziq;
- **takroriy** chiziq (bir xil shakl ikki marta, hatto teskari chizilgan boʻlsa ham);
- bir-birini **kesib oʻtuvchi** ikki chiziq, turli yoki bir xil balandlikda (oʻzini kesib oʻtuvchi chiziq ham), joyi bilan;
- oraliqqa **toʻgʻri kelmaydigan** balandlik (masalan, 1 m xaritada 105.5 kabi yozishda xato).

{{ui:Boshqasini kesib oʻtgan chiziqlarni chiqarib tashlash}} ni belgilang, u boshqalarni eng koʻp kesib oʻtgan chiziqni tashlaydi (soʻng keyingisini, hech biri kesmaguncha): har bir konturni kesib oʻtadigan adashgan chiziq tashlanadi, konturlar emas. **Chiziqlarni soddalashtirish** esa shu masofadan yaqin boʻlgan, toʻgʻri chiziqqa yaqin choʻqqilarni siyraklashtiradi.

{{ui:Yerni yaratish}} chiziqlarni mavjud yerga sinuvchi chiziqlar sifatida qoʻshadi (bitta ortga qaytarish qadami), shuning uchun sirt har bir konturdan aynan oʻtadi. {{ui:Qir, vodiy va choʻqqilardagi tekis uchburchaklarni tuzatish}} belgilanib va oraliq berilganda, CivilCraft har bir tekis uchburchakka (barcha burchaklari bitta konturda yotgan uchburchak) yon tomondagi nishablik davom etadigan balandlikda nuqta qoʻshadi, konturdan yarim oraliqdan uzoqlashtirmasdan. Bu boʻlmasa qir choʻqqilari, vodiy tublari va tepaliklar tekis plastinkalar boʻlib chiqadi. Sinov tepaligida haqiqiy sirtdan xato chorak kamaydi; qirda 40 % ga kamaydi.

## Koordinatalarsiz xarita

Rasm yoki PDF dan chizilgan kontur xaritasi uchun **Ikki maʼlum nuqta bilan qatlamlarni masshtablash va joylashtirish** ni oching. Xaritada ikki nuqta va ularning haqiqiy joylashuvini bering; belgilangan qatlamlar masshtablanadi, buriladi va mos kelishi uchun koʻchiriladi (bitta ortga qaytarish qadami; balandliklar oʻzgarmaydi). Xuddi shu ikki nuqta masshtabni (xabarda koʻrsatiladi) va burilishni beradi.

Sirt xarita qanchalik yaxshi boʻlsa, shunchalik yaxshi: ikki kontur orasida u tekislik, shuning uchun ular orasidagi haqiqiy yer maʼlum emas. Natijaga ishonishdan oldin uni balandlik nuqtalari bilan tekshiring.
