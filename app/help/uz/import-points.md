---
title: Geodezik nuqtalarni import qilish
summary: CSV yoki matnli nuqta faylini oching, Nuqtalarni import qilish oynasida ustunlar tartibini tekshiring, oʻqib boʻlmaydigan qatorlarni tuzating va nuqtalarni guruhlarga ajrating.
keywords: nuqtalarni import qilish, csv, txt, pnezd, penzd, nuqta fayli, geodezik oʻlchash, cogo nuqtalari, nuqta guruhlari, ustunlar, shimol sharq
from: ad33d88a
---

Nuqta fayli — har bir qatorda bitta nuqta boʻlgan matnli fayl: nuqta raqami, shimol, sharq, balandlik va tavsif istalgan tartibda, vergul, tabulyatsiya, nuqtali vergul yoki boʻshliq bilan ajratilgan. CivilCraft uni brauzerda oʻqiydi va undan darhol yuza quradi.

## Boshlashdan oldin

- Imkon boʻlsa, faylning ustunlar tartibini bilib oling (PNEZD va PENZD kompyuter uchun bir xil koʻrinadi).
- Uning birliklarini bilib oling. CivilCraft ularni almashtirmaydi: chap panelda **Birliklar** ni fayl bilan mos qilib belgilang (qarang: [Birliklar, stansiyalar va raqam formatlari](topic:units-and-stations)).
- Koordinatalar katta boʻlishi mumkin (davlat tekisligidagi shimol va sharq qiymatlari millionlab boʻlishi mumkin, bu normal).

## Faylni import qilish

1. Asboblar panelida {{ui:Ochish}} ni bosing yoki {{key:Mod+O}} ni bosing va faylni tanlang. Uni rejaga sudrab ham tashlash mumkin.
   **Nuqtalarni import qilish** oynasi ochiladi: fayl nomi, {{ui:Aniqlash}} ga oʻrnatilgan **Ustunlar** roʻyxati, xulosa qatori va birinchi oltita nuqta.
2. Xulosa qatorini oʻqing. Unda nechta nuqta oʻqilgani, qaysi ustunlar tartibida, bu tartib qanday aniqlangani va ustunlarni nima ajratishi aytiladi. Tartib quyidagi uchta usulda aniqlanadi:
   - "sarlavha qatoridan": birinchi qator ustunlarini nomlaydi (Point, Northing, Easting, Elevation, Description yoki X, Y, Z …). Bu eng xavfsiz usul.
   - "tanlanganidek": siz **Ustunlar** da tartibni tanlagansiz.
   - "ustunlar soni va nuqta qatori sozlamasiga (PNEZD) asosan taxmin qilindi — shimol va sharq almashmaganini tekshiring": yaroqli sarlavha yoʻq edi. Agar fayllaringiz odatda avval sharq bilan boshlansa, [CivilCraft sozlamalari](topic:settings) da **Nuqta qatorlari** ni P, E, N, Z, D ga oʻrnating.
3. Oldindan koʻrish jadvalini tekshiring. Uning ustunlari fayl qanday tartibda boʻlishidan qat'i nazar doim **Nuqta**, **Shimol**, **Sharq**, **Balandlik**, **Tavsif** boʻladi. Haqiqiy obyektning shimol va sharq qiymatlari odatda sezilarli darajada turlicha katta boʻladi: agar ular almashgan koʻrinsa, taxmin notoʻgʻri boʻlgan.
4. Agar tartib notoʻgʻri boʻlsa, **Ustunlar** da toʻgʻrisini tanlang (masalan {{ui:PENZD — nuqta, sharq, shimol, balandlik, tavsif}}). Xulosa va oldindan koʻrish darhol yangilanadi.
5. Oldindan koʻrish ostida **Oʻqilmagan qatorlar** ni qidiring. Har bir qator fayl qator raqamini, sababini va qatorning boshini koʻrsatadi. Qarang: [Oʻqilmagan qatorlar](topic:import-points#rows-that-are-not-read).
6. {{ui:Import}} ni bosing.
   Nuqtalar rejada paydo boʻladi, koʻrinish ularga yaqinlashadi va yuza quriladi. Holat satri masalan shunday deydi: "site.csv dan 276 nuqta import qilindi; yuza: 546 ta uchburchak."

Agar loyihaning hali nomi boʻlmasa, u faylning nomini oladi.

## Guruhlarni tekshirish

Har bir nuqta **tavsifining birinchi soʻzi** bilan nomlangan guruhga tegishli, bosh harflarda: "GRD", "FL 12" va "fl" guruhlari GRD, FL va FL. Tavsifi boʻlmagan nuqtalar "(tavsif yoʻq)" guruhiga tushadi.

1. Chap paneldagi **Nuqtalar** ostidagi jadvalga qarang: guruh, nuqtalar soni va **Yuza** tanlovi.
2. Har bir guruh avval {{ui:Nuqtalar}} bilan boshlanadi. Oqim chiziqlari, qoplama qirralari, tepalar va nishab uchlari, qirralar va shunga oʻxshash kodlangan chiziqlarni {{ui:Sinuvchi chiziq}} ga oʻzgartiring. Yer shaklini belgilamasligi kerak boʻlgan guruhlarni (boshqaruv nuqtalari, daraxt tojlari, tepasidan oʻlchangan kommunal ustunlar) {{ui:Chiqarib tashlangan}} ga qoʻying.
3. Rejadagi nuqtani bosing ({{ui:Tanlash}} bilan) — oʻng panelda uning raqami, koordinatalari, balandligi, tavsifi va guruhi koʻrinadi.

:::warning
Sinuvchi chiziq guruhi **barcha** nuqtalarini nuqta raqami tartibida **bitta** chiziqqa birlashtiradi. Bu har bir kodlangan chiziq oʻz kodi bilan tartibda oʻlchangan boʻlsa ishlaydi. Ikkita alohida oqim chiziqlari ikkalasi ham "FL" deb kodlangan boʻlsa, ular orasida zigzag qilgan bitta chiziqqa aylanadi. Agar kodlaringiz umumiy boʻlsa, har bir chiziq nuqtalarini bosib belgilash uchun {{ui:Sinuvchi chiziq}} asbobidan foydalaning (qarang: [Yuzani qurish va aniqlash](topic:build-surface)).
:::

## Oʻqilmagan qatorlar

| Koʻrsatilgan sabab | Bu nimani anglatadi | Nima qilish kerak |
|---|---|---|
| "shimol yoki sharq son emas" | Koordinata ustunida matn bor | Ustunlar tartibini tekshiring, yoki fayl oʻrtasidagi begona matnli qatorni |
| "balandlik son emas" | Balandlik ustunida matn bor | Notoʻgʻri ustunlar tartibi, yoki balandlik ustunidagi tavsif |
| "nuqta raqami yoʻq" | Nuqta ustuni boʻsh | Nuqtaga raqam bering, yoki P siz tartibni tanlang (NEZD, NEZ …): shunda nuqtalar 1, 2, 3 … deb raqamlanadi |
| "12-nuqta ikki marta uchraydi (birinchisi saqlanadi)" | Ikki qator bir raqamga ega | Agar ikkalasi ham haqiqiy oʻlchov boʻlsa, fayldagi birini qayta raqamlang |
| "3 ta ustun, 5 ta kutilgan (PNEZD)" | Qator qisqa | Uzilgan qator, yoki notoʻgʻri ustunlar tartibi |

Balandligi boʻsh nuqta saqlanadi, lekin yuzada ishlatilmaydi. **Nuqtalar** maʼlumotlari balandligi boʻlgan nuqtalar sonini koʻrsatadi.

`#`, `;` yoki `//` bilan boshlangan qatorlar izoh hisoblanadi va oʻtkazib yuboriladi. Boʻsh qatorlar ham oʻtkazib yuboriladi.

## Nuqtalarni almashtirish yoki qoʻshish

Qayta import qilish **barcha** nuqtalarni **almashtiradi**; ularga qoʻshmaydi. Trassalaringiz, maydonchalaringiz, quvurlaringiz, chizilgan sinuvchi chiziqlaringiz va chegaraingiz qoladi. Bekor qilish tarixi tozalanadi, shuning uchun eski nuqtalarni qaytarishni xohlashingiz mumkin boʻlsa, avval loyihani saqlang. Ikki faylni birlashtirish uchun import qilishdan oldin ularni matn muharririda yoki elektron jadvalda birlashtiring (takroriy nuqta raqamlariga ehtiyot boʻling).

Nuqtalarni CivilCraft ichida hali koʻchirib, tahrirlab yoki oʻchirib boʻlmaydi. Ularni faylda tuzating va qayta import qiling.

## Tegishli

- [Nuqta fayli formatlari](topic:point-file-formats): har bir ustunlar tartibi va sarlavhalar qanday tanilishi.
- [Yuzani qurish va aniqlash](topic:build-surface).
