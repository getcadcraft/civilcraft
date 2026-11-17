---
title: Qatlamni atribut boʻyicha uslublash
summary: GIS qatlami obyektlarini maydon qiymatlari boʻyicha ranglang (har bir qiymatga bitta rang yoki raqamli oraliqlar boʻyicha), nuqtalarni raqam boʻyicha kattalashtiring, poligonlarni boʻyang va rejada legenda koʻrsating.
keywords: uslub, uslublash, rang, colour, color, kategoriyalangan, darajalangan, noyob qiymatlar, teng interval, kvantil, tabiiy chegaralar, jenks, gradient, rang koʻrmaslik, legenda, oʻlcham, nuqtalar, xoroplet, sinflar, belgilar, gis
from: a3a69add
---

GIS qatlamlari roʻyxatidagi qatlamning **uchta nuqta** menyusini oching va {{ui:Style by attribute…}} ni tanlang.

## Uchta uslub

- **Yakka belgi:** avvalgidek qatlam rangi.
- **Kategoriyalangan:** istalgan ustunning har bir alohida qiymati uchun bitta rang. Sakkiztagacha qiymat sakkizta Okabe-Ito rangini oladi (rang koʻrmaslikning keng tarqalgan turlarida ajralib turish uchun tanlangan); koʻproq qiymat boʻlsa, eng koʻp uchragan yettitasi har biri rang oladi, qolganlari esa umumiy kulrang **Boshqa** sinfni tashkil qiladi. Qiymatsiz obyektlar kulrang boʻladi.
- **Darajalangan:** raqamli ustun 2 dan 9 gacha oraliqqa boʻlinadi, har biri gradientdan olingan rang bilan. Chegara nuqtasidagi qiymat pastki oraliqqa tushadi.

## Oraliqlar qanday boʻlinadi

| Usul | Chegaralar |
|---|---|
| Teng interval | Eng kichik qiymatdan eng kattasigacha boʻlgan oraliq teng kenglikdagi boʻlaklarga boʻlinadi. 0 dan 30 gacha qiymatlar uch oraliqda: 0, 10, 20, 30. |
| Kvantil | Har bir oraliqda taxminan bir xil obyektlar soni. Chegaralar tartiblangan qiymatlardan odatdagi toʻgʻri chiziqli interpolyatsiya bilan olinadi: ikki oraliqda 1 dan 10 gacha uchun chegara 5.5. |
| Tabiiy chegaralar (Jenks) | Har bir oraliq ichida eng kam tarqalish qoldiradigan kesimlar, shunda oʻxshash qiymatlar toʻplami birga qoladi. 1,500 dan ortiq qiymatda u 1,500 ta teng masofadagi qiymat bilan ishlaydi va buni aytadi. |

## Ranglar

Viridis va Cividis qorongʻidan yorugʻgacha silliq yorqinlik oʻzgarishi bilan boradi, shuning uchun oraliqlar tartibini hatto kulrangda yoki rang koʻrmaslikda ham oʻqish mumkin. Blues ochiqdan toʻqqa boradi. Qizildan koʻkgacha oʻrtacha qiymatlar atrofidagi ikki tomonlama gradient. **Ranglarni teskari qilish** istalgan birini teskarisiga aylantiradi. Muloqot oynasi qoʻllashdan oldin oraliqlarni va har birida obyektlar sonini koʻrsatadi.

## Oʻlcham, toʻldirish va legenda

- **Nuqta oʻlchami** raqamli ustun boʻyicha: qiymat qanchalik katta boʻlsa, har bir nuqta kvadrati shunchalik katta boʻladi, siz bergan ikki oʻlcham orasida (qogʻozda yarim tomon millimetrda).
- **Poligon ichini boʻyash** har bir poligonni sinf rangi bilan toʻldiradi (teshiklar boʻsh qoladi). Boʻyash ekranda; chop va DXF/DWG esa rangli konturlarni koʻrsatadi.
- **Rejada legendani koʻrsatish** sinflarni, ularning sonini va oʻlcham oraligʻini rejaning chap pastki qismida chizadi. Legenda ekranda; chopda yoʻq.
- Obyektlarni maydon bilan yorliqlash uchun xuddi shu menyudagi **Quyidagi bilan yorliqlash** dan foydalaning.

Uslub loyiha faylida saqlanadi. Uslublarni bilmaydigan versiya faylni qatlam rangi bilan ochadi. Chop, DXF va DWG sinflarni qatlam va sinf nomi bilan alohida qatlamlar sifatida, toʻqqizta asosiy CAD rangining eng yaqinida olib boradi. 200,000 dan ortiq obyektli qatlam bitta rangda chiziladi.
