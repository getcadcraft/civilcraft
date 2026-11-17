---
title: Yer ishlari hajmlari
summary: Mavjud yer va loyihalangan sirt orasidagi kesish, toʻldirish va sof hajmlarni har bir platforma va koridor boʻyicha hamda jami boʻyicha oʻqish va ularning ortidagi toʻr usulini tushunish.
keywords: hajmlar, yer ishlari, kesish, toʻldirish, sof, kesish va toʻldirish, miqdorlar, toʻr usuli, sirtlarni solishtirish, hajm sirti, kub yard, kub metr
from: 299d7bc7
---

Platforma yoki koridor muammosiz tekislanishi bilanoq CivilCraft loyihalangan sirtni mavjud yer bilan solishtiradi va kesish hamda toʻldirishni hisobot qiladi. Raqamlar har bir oʻzgarishda yangilanadi.

## Qayerda oʻqish

- **Yer ishlari** oʻng panelda hech narsa tanlanmagan boʻlsa (**Loyiha** koʻrinishi), kamida bitta platforma yoki koridor boʻlganda.
- **Yer ishlari** oʻng panelda platforma tanlanganda (xuddi shu butun loyiha boʻyicha jami).
- Koridor sozlamalari ostidagi chiziq, oʻsha koridorning oʻz kesish va toʻldirishi bilan.

**Yer ishlari** bloki quyidagilarni koʻrsatadi:

- **Kesish**, **Toʻldirish** va **Sof** (oxirida qaysi biri katta boʻlsa, "toʻldirish" yoki "kesish")
- bir nechta element boʻlsa, har biri uchun alohida qator, masalan "Platforma 1: kesish 120.4 kub yd, toʻldirish 310.2 kub yd"
- usul qatori: "Toʻr usuli: mavjud yer va loyihalangan sirt ochiq chiziqlar ichida har 0.5 ft da namuna olingan (92,891 katak). Kengayish yoki qisqarish qoʻllanmagan."

Hajmlar futli loyihada kub yardlarda, metrli loyihada kub metrlarda.

## TakeoffCraft ga yuborish

Yer ishlarini narxlash uchun **Yer ishlari** blokining pastidagi {{ui:TakeoffCraft ga yuborish}} ni tanlang. CivilCraft miqdorlar faylini (`<site>.quantities.json`) ikkita miqdor bilan saqlaydi: kesish va toʻldirish, kub yardlarda (fut loyiha) yoki kub metrlarda (metr loyiha), bloki bilan bir xil raqamlar, yuzdan biriga yaxlitlangan. Uni TakeoffCraft da **Hajmlarni hisoblashni ochish** bilan oching yoki unga tashlang: ular narxlanadigan ikkita element boʻladi ([Kesish va toʻldirish (CivilCraft)](app:takeoffcraft/earthwork#cut-and-fill-from-civilcraft)). Oʻzgarishdan keyin qayta yuboring va yangi faylni oching: oʻsha elementlar yangi raqamlarni oladi.

Faqat jami yuboriladi, shuning uchun hech narsa ikki marta sanalmaydi; fayl izohi har bir platforma va koridorning oʻz kesish va toʻldirishini sanab beradi.

## Qanday hisoblanadi

CivilCraft **toʻr usulidan** foydalanadi:

1. Har bir ochiq chiziq ichidagi maydon ustiga kvadrat kataklar toʻri qoʻyiladi.
2. Har bir katakning markazida ikkala sirt namuna olinadi.
3. Har bir katak prizma sifatida hisoblanadi: balandlik farqi katakning maydoniga koʻpaytiriladi. Loyihalangan sirt pastroq boʻlsa — kesiladi; yuqoriroq boʻlsa — toʻldiriladi.
4. Kataklar qoʻshiladi.

Katak oʻlchami siz uchun tanlanadi: tekislangan maydonlar atrofidagi toʻrtburchakda taxminan 250,000 katak boʻladi, chiroyli qiymatga (10 ning darajasining 1, 2 yoki 5 barobari) yaxlitlanadi. Hozircha oʻzingiz belgilay olmaysiz. Usul qatori katak oʻlchamini va kataklar sonini koʻrsatadi. Kichikroq kataklar chetlar boʻylab aniqroq; tekis tekisliklar orasidagi butun katakda natija aniq.

## Bilish kerak

- Faqat ochiq chiziqlar ichidagi maydon hisoblanadi. Ulardan tashqaridagi yer oʻzgarmaydi.
- Muammosi bor platforma yoki koridor kiritilmaydi va hech narsa qoʻshmaydi. Agar blok "Hajmlar hali yoʻq: platforma muammosiz tekislanishi kerak." desa, undan yuqoridagi qizil qutini qidiring.
- Elementlar ustma-ust tushsa, keyingisi ochiq chiziq ichida oldingisini almashtiradi va ustma-ust tushgan joy bir marta hisoblanadi.
- Hech qanday kengayish yoki qisqarish koeffitsiyenti qoʻllanmaydi. Kerak boʻlsa, bank, boʻsh va zichlangan hajmlar uchun natijalarni oʻzingiz koʻpaytiring.
- Yuza qatlamini olib tashlash, yoʻl qoplamasi va asos chuqurliklari hamda TIN dan TIN gacha prizma hajmlari hali mavjud emas.

## Natijani tekshirish

- **Koʻrsatish** boʻlimida {{ui:Loyihalangan (qiyalik berilgan)}} ni yoqing va ochiq chiziqlar ichidagi gorizontallarga qarang.
- Tekislangan maydon ustiga koʻrsatkichni olib boring: holat satrida **Yer** va **Tekislangan** koʻrsatiladi. Farq shu nuqtadagi kesish yoki toʻldirish chuqurligi.
- Koridor uchun profil koʻrinishidagi oʻqish har bir piketda markaziy chiziqdagi kesish yoki toʻldirishni koʻrsatadi.
