---
title: Oʻsimliklar roʻyxati
summary: Taxminan 420 ta odatiy moʻtadil va Oʻrta yer dengizi oʻsimligi, ularning oʻlchamlari, qishga chidamliligi, yorugʻlik va suv talablari; istalgan tilda qidiriladi, shuningdek loyiha bilan saqlangan oʻz roʻyxatingiz.
keywords: oʻsimliklar roʻyxati, oʻsimliklar bazasi, tur, botanik nomi, umumiy nom, oʻsimliklar palitrasi, pitomnik roʻyxati, qishga chidamlilik zonasi, csv, oʻsimliklarni import qilish, oʻsimliklarni eksport qilish, mening oʻsimliklarim, daraxtlar roʻyxati, buta roʻyxati, oʻsimliklar kutubxonasi
from: 7ed09e7e
---

Chap paneldagi **Oʻsimliklar** boʻlimi joylashtirish mumkin boʻlgan hamma oʻsimliklarni koʻrsatadi. Oʻsimlikni bossangiz, uning oʻlchamlari koʻrinadi va u **Oʻsimlik**, **Yotoq** va **Jonli devor** foydalanadigan oʻsimlik boʻladi.

## Qidirish va filtrlash

**Qidiruv** ga yozing: oʻsimlik nomining istalgan tilda (ingliz, ispan, portugal) har qanday soʻzi, botanik nomi, turi yoki izohidagi soʻz. Yozgan har bir soʻz mos kelishi kerak, shuning uchun `quercus evergreen` yashil doimiy eman daraxtlarini topadi. Aksent belgilari ahamiyatga ega emas.

Roʻyxatni **Tur**, **Yorugʻlik**, **Suv** va **Chidamlilik zonasi** bilan toraytiring (saytingiz joylashgan USDA zonasi: oʻsimlik zona uning diapazoniga kirsa, roʻyxatda koʻrinadi).

## Oʻsimlik nimani oʻz ichiga oladi

| Maydon | Maʼnosi |
|---|---|
| Tur | Daraxt, buta, jonli devor, oʻt (maysazorlar ham kiradi), koʻpyillik, yer qoplamasi yoki chirmovuq |
| Voyaga yetganda | Bogʻda yoki koʻchada oʻsgan oʻsimlikning balandligi va yoyilishi, metrda |
| Ekishda | Ekiladigan oʻlcham va uning idishi |
| Masofa | Yotoqda yoki jonli devor boʻylab markazdan markazgacha |
| Chidamlilik zonasi | Odatda chidaydigan USDA zonalari |
| Yorugʻlik, suv, tuproq | Nimani talab qilishi |
| Izohlar | Foydalanish va ehtiyot choralari, masalan zaharli qismlar yoki tarqalib ketadigan oʻsimlik |

:::note
Oʻrnatilgan roʻyxat CadCraft uchun umumiy bogʻdorchilik bilimlari asosida tuzilgan: odatiy oʻlchamlar, yaxlitlangan. U hech qanday pitomnik katalogi emas. Oʻlchamlar va chidamlilikni mahalliy pitomnik bilan tekshiring. Iberiya va moʻtadil mintaqaning koʻp qismidagi eng mashhur invaziv oʻsimliklar ataylab kiritilmagan, va bir nechta joyda invaziv boʻlgan oʻsimliklarga izoh qoʻyilgan.
:::

## Oʻz oʻsimliklaringiz

- **Loyiha roʻyxatiga qoʻshish** oʻsimlikni loyihaning oʻz roʻyxatiga nusxalaydi; u loyiha bilan birga saqlanadi. Roʻyxatingizdagi oʻsimlik bir xil kalitli oʻrnatilgan oʻsimlikni almashtiradi, shuning uchun mintaqangiz uchun oʻlchamlarini oʻzgartirishingiz mumkin.
- **Oʻsimliklar roʻyxatini import qilish…** CSV (yoki oʻsimliklar faylini) oʻqiydi. CSV da botanik nomli ustun boʻlishi kerak, yaxshisi tur, balandlik va yoyilish ham boʻlsin; ustun nomlari oʻz soʻzlaringizda boʻlishi mumkin (Latin, Common name, Height, Spread, Width, Zone). Vergul, nuqtali vergul yoki tabulyatsiya hamda oʻnlik vergullar oʻqiladi. Boʻsh ekish oʻlchamlari, masofa va idishlar tur uchun oqilona qiymatlar bilan toʻldiriladi.
- **CSV sifatida eksport** roʻyxatingizni (yoki hech narsa boʻlmasa, qidiruv koʻrsatgan oʻsimliklarni) elektron jadvalda ochish uchun saqlaydi.

Oʻsimliklar roʻyxati boshqa tashqi fayl kabi oʻqiladi: undan foydalanib boʻlmaydigan narsalar chiqarib tashlanadi va sanaladi.

## Boshqa ilovalardagi oʻsimliklar

Oʻsimliklar roʻyxati barcha CadCraft ilovalari uchun yagona kutubxona: BimCraft va ModelCraft bir xil roʻyxatga ega, lekin ularning oʻz **Kutubxonadan joylashtirish** funksiyasi hozircha oʻsimliklarni taklif qilmaydi. Hozircha oʻsimliklar BIM modeliga CivilCraft ning landshaft IFC fayli orqali yetib boradi (har bir oʻsimlik `IfcGeographicElement`). Qarang: [Ekish](topic:planting#ifc).
