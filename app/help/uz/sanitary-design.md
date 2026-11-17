---
title: Maishiy loyiha oqimlarini hisoblash va kanalizatsiyani tekshirish
summary: Maishiy tarmoqning har bir quduqqa kiradigan odamlar va maydonni kiriting; CivilCraft ularni tarmoq boʻylab yigʻadi, choʻqqi oqimini choʻqqilik koeffitsiyenti va infiltratsiya bilan hisoblaydi hamda har bir quvurning sigʻimi va tezligini tekshiradi.
keywords: maishiy, kanalizatsiya, maishiy kanalizatsiya, chiqindi suv, loyiha oqimi, choʻqqi oqimi, choʻqqilik koeffitsiyenti, harmon, babbitt, infiltratsiya, aholi, odam boshiga, toʻlish foizi, oʻzini tozalash, tezlik, quvur oʻlchami, loyiha varaqi
from: 73ba197a
---

Maishiy loyiha oqimlari [quvur tarmogʻi](topic:pipe-network) ustida ishlaydi, uning {{ui:Turi}} si {{ui:Maishiy}} boʻlganda. Hech narsa tanlanmagan boʻlsa, oʻng panel yomgʻir suvi tarmogʻida yomgʻir suvi oqimini koʻrsatgandek, **Maishiy loyiha oqimlari** ni koʻrsatadi.

## Kiruvchi oqimni kiriting

1. Quduqni tanlang. **Maishiy loyiha oqimlari** ostida {{ui:Bu yerga kiruvchi aholi}} va {{ui:Bu yerga kiruvchi maydon}} ni kiriting (metrli loyihada gektarda, futli loyihada akrda).
2. Doʻkonlar, ofislar yoki sanoat uchun ekvivalent aholini kiriting: maydon koʻpaytirilgan, agentligingiz ishlatadigan gektar (yoki akr) boshiga odamlar soni. Maydon har holda infiltratsiyaga hisobga olinadi.
3. Koʻcha yoki uchastka ulanadigan har bir quduq uchun takrorlang. Hech narsa ulanmagan quduq ikkalasini ham 0 da qoldiradi.

Har bir quvur oʻzining yuqori quduqiga kiradigan va undan yuqoridagi hammasini olib oʻtadi. Quduqni tanlab, undan oʻtadigan narsani koʻring.

## Sozlamalar

| Sozlama | Nima degani |
|---|---|
| {{ui:Odam boshiga oqim}} | bir kishining kunlik oʻrtacha oqimi: litrda (metrli loyiha) yoki AQSh gallonida (futli loyiha) |
| {{ui:Infiltratsiya}} | yer osti suvining oqib kirishi: sekundiga gektar boshiga litr yoki kunda akr boshiga gallon |
| {{ui:Choʻqqi koeffitsiyenti}} | Harmon, 1 + 14 / (4 + √P), yoki Babbitt, 5 / P^0.2, bunda P — minglarda aholi |
| {{ui:Choʻqqi koeffitsiyenti kamida}} / {{ui:Eng koʻp choʻqqilik koeffitsiyenti}} | koeffitsiyent shu ikki qiymat orasida ushlab turiladi |
| {{ui:Manning n}} | sigʻim va tezlik uchun |
| {{ui:Eng kichik tezlik}} / {{ui:Eng katta tezlik}} | choʻqqi oqimining quvurdagi oʻz chuqurligida |
| {{ui:Toʻliq sigʻimning eng koʻpi}} | choʻqqida quvur qanchalik toʻla ishlashi mumkin, toʻliq oqimda sigʻadigan qismining foizida |

Boshlangʻich qiymatlar vaqtinchalik, standart emas. Agentligingiz eʼlon qilgan qiymatlardan foydalaning.

## Nima hisoblanadi

Har bir quvur uchun, oqim tartibida:

- choʻqqi oqimi = odamlar × odam boshiga oqim × choʻqqilik koeffitsiyenti + maydon × infiltratsiya
- toʻliq oqimdagi sigʻim (quvur qiyaligidagi Manning tenglamasi) va choʻqqi uni qanchalik toʻldirishi
- choʻqqi oqimining normal chuqurligi va shu yerdagi tezlik

**Maishiy natijalar** jadvali har bir quvurning odamlarini, choʻqqilik koeffitsiyentini, choʻqqi oqimini (L/s, yoki gpm va kub fut/s), foizli toʻlishini va tezligini koʻrsatadi. Muammolar uning ostida chiqadi: chegaradan koʻproq toʻlgan quvur, eng kichik tezlikdan sekinroq (oʻzini tozalamasligi mumkin), eng katta tezlikdan tezroq yoki qiyaligi yoʻq. {{ui:Quvur oʻlchamlarini shu oqimlarga moslang}} har bir quvur uchun chegara ichida choʻqqisini oʻtkazadigan eng kichik standart oʻlchamni (200 mm yoki 8 dyuym va undan katta) tanlaydi; bitta {{key:Mod+Z}} uni bekor qiladi.

:::note
Bu loyiha varaqi hisoblaydigan doimiy choʻqqi oqimi boʻlib, nashr etilgan loyiha varaqiga uning chop etilgan yaxlitlashigacha tekshirilgan. Bu vaqt boʻyicha kanalizatsiya modeli emas: gidrograflar, saqlash, nasoslar yoki toshib ketishlar yoʻq. Qarang: [Hali qurilmagan](topic:not-built-yet).
:::

Tezliklar barcha chuqurliklarda bir xil n bilan Manning tenglamasidan foydalanadi. Ayrim agentliklarning qisman toʻlgan jadvallari n ni chuqurlikka qarab oʻzgartirishga ruxsat beradi, bu 60 dan 70 foizgacha toʻla oqadigan quvurda tezlikni biroz pasaytiradi (taxminan 3 foizga kam).
