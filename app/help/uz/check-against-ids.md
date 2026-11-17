---
title: IFC eksportini mijozning IDS bilan tekshirish
summary: Mijoz yoki yoʻl boshqarmasi bergan .ids faylini yuklang va Muammolar ichida talabga javob bermaydigan har bir eksport qilingan elementni koʻring.
keywords: ids, axborot yetkazish spetsifikatsiyasi, buildingsmart, talablar, yetkazib berish, tekshirish, validatsiya, qa, ifc eksport, ifc 4.3, trassa, yoʻl, xarid
from: 183d9a0e
---

## Nima qilasiz

IDS (Information Delivery Specification, buildingSMART standarti) — bu IFC ichida boʻlishi kerak boʻlgan narsalar roʻyxati. Davlat xaridlari koʻpincha ish bilan birga uni yuboradi. CivilCraft bu loyiha eksport qiladigan IFC ni, eksport uchun tanlagan IFC versiyasida, unga qarshi tekshiradi va yetmaydigan har bir elementni roʻyxatlaydi.

## Qadamlar

1. Loyihangizni oching.
2. Asboblar panelidagi Eksport guruhida {{ui:IFC}} ni bosing. Dialogda yetkazib beradigan IFC versiyasini tanlang.
3. {{ui:IDS boʻyicha tekshirish…}} ni bosing.
4. {{ui:.ids faylini yuklash…}} ni bosing va faylni tanlang. Hech narsa yuklanmaydi.
5. Natijani oʻqing: har bir spetsifikatsiya {{ui:Oʻtdi}} yoki {{ui:Oʻtmadi}} bilan va u nechta elementga tegishli ekanligi bilan.
6. Muammolar ({{key:Ctrl+Shift+M}}) ni oching va muvaffaqiyatsizlikni bosing: u kelib chiqqan trassa, maydoncha, quvur, inshoot yoki bino massasi tanlanadi.

## Nimani koʻrishingiz kerak

- Eksport qilingan har bir element va talab uchun bitta ogohlantirish: spetsifikatsiya nomi, IDS nima soʻrayotgani va eksportda nima borligi bilan.
- Tekshiruv hisoboti (Muammolar da) IDS bilan boshlanadi: uning sarlavhasi, versiyasi, muallifi va har bir spetsifikatsiyaning sonlari.

## Foydali maʼlumot

- IDS loyiha faylida saqlanadi, shuning uchun loyihani ochganingizda u yana tekshiriladi. Uni yuklash yoki unutish bitta bekor qilinadigan qadam.
- Har bir oʻzgarish bir oz keyin yana tekshiriladi. Katta sirtlarni yozish koʻproq vaqt oladi, shuning uchun tekshiruv har safar biroz koʻproq kutadi.
- Tekshiruv {{ui:IFC}} eksporti yozadigan oʻsha faylni ishlatadi, oxirgi tanlangan versiyada (agar tanlamagan boʻlsangiz, IFC 4.3).
- Raqamlar SI birliklarida solishtiriladi: futlardagi loyiha avval metrga aylantiriladi.
- IDS dagi shablonlar butun qiymat sifatida oʻqiladi. Boshidagi `^` va oxiridagi `$` ham "butun qiymat" deb olinadi, chunki koʻpchilik IDS fayllar ularni shunday nazarda tutadi.

## Keyingisi

- [IFC eksport qilish](topic:ifc)
