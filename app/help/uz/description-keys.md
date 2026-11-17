---
title: Tavsif kalitlari va chiziq kodlari
summary: Dala kodlarini tavsifli nuqta guruhlariga aylantiring va kodlangan nuqtalarni (boshlash, tugatish, yopish) uzilish chiziqlariga aylanadigan chiziqlarga birlashtiring.
keywords: tavsif kalitlari, dala kodlari, chiziq kodlari, figuralar, chiziqlar, boshlash, tugatish, yopish, nuqta guruhlari, kodlar, geodezik kodlar, maʼlumot yigʻuvchi, uzilish chiziqlari, bordyur, qoplama chekkasi
from: b3d1af8d
---

Geodezik brigadalar dalada har bir oʻlchovni kodlaydi: qoplama chekkasi uchun `EP`, bordyur yuqori qismi uchun `TC`, bino burchagi uchun `BLDG`. Kod nuqta tavsifining birinchi soʻzi. CivilCraft nuqtalarni shu boʻyicha guruhlaydi va undan keyingi chiziq kodlarini chiziqlarga aylantiradi.

## Chiziq kodlari

Chiziq kodi — dala kodidan keyin keladigan soʻz:

| Tavsif | Maʼnosi |
|---|---|
| `EP B` | Shu nuqtada yangi qoplama chekkasi chizigʻini boshlash |
| `EP` | Joriy EP chizigʻini davom ettirish |
| `EP E` | Joriy EP chizigʻini shu nuqtada tugatish |
| `BLDG C` | Binoni yopish: bu nuqtani chiziqning birinchi nuqtasiga qaytarib ulash |

Bir xil kodli nuqtalar raqam tartibida birlashtiriladi. Turli kodlar bir guruhda boʻlsa ham turli chiziqlar, shuning uchun `EP1` va `EP2` bir vaqtda ikkita chekka beradi. Chiziq kodini hech qachon ishlatmaydigan kod oldingi versiyalardagidek barcha nuqtalari orqali birlashtiriladi.

**Uzilish chizigʻi** sifatida ishlatiladigan guruhdagi chiziqlar har bir chiziq uchun alohida uzilish chizigʻi boʻladi, shuning uchun oraliqli bordyur oraliq boʻylab choʻzilmaydi. Boshqa guruhlardagi chiziqlar rejada chiziladi (V-NODE-LINE qatlami) va DXF, DWG va PDF ga chiqadi.

Boshlash, tugatish va yopish soʻzlari `B`, `BEG`, `START`; `E`, `END`; va `C`, `CLO`, `CLOSE`. Ularni pastdagi oynada oʻzgartiring yoki chiziq kodlarini oʻchiring.

## Tavsif kalitlari

Tavsif kaliti kodni nuqta guruhiga, qoʻllanishiga va uzun tavsifga aylantiradi.

1. **Nuqtalar** ostida {{ui:Tavsif kalitlari va chiziq kodlari}} ni bosing.
2. {{ui:Kalit qoʻshish}} ni bosing va qatorni toʻldiring:
   - **Kod**: mos keladigan dala kodi. `*` istalgan belgilarni, `?` bitta belgini bildiradi, shuning uchun `EP*` EP, EP1 va EP12 ni ushlaydi.
   - **Guruh**: bu nuqtalar birlashadigan nuqta guruhi (boʻsh = kodning oʻzi). Guruh `EP` boʻlgan `EP*` EP1 va EP2 ni bitta guruhga qoʻyadi, lekin ular alohida chiziqlar boʻlib qoladi.
   - **Qoʻllanish**: Nuqtalar, Uzilish chizigʻi yoki Chetda qoldirish, guruh birinchi marta paydo boʻlganda (yoki uni **Nuqtalar** jadvaliga qoldiring).
   - **Tavsif**: uzun nom, nuqtaning **Xususiyatlar** ichida koʻrsatiladi.
3. **Nuqtalar** ustuni yozganingizda har bir kalit ushlagan nuqtalarni sanaydi. Kodga birinchi mos kelgan kalit gʻolib boʻladi.
4. {{ui:Qoʻllash}} ni bosing. Guruhlar, yuza va reja bir qadamda ergashadi: {{key:Mod+Z}} uni bekor qiladi.

Guruh **Nuqtalar** jadvalida bergan qoʻllanishini saqlaydi; kalitning qoʻllanishi faqat yangi guruh uchun oʻrnatiladi. Kalitlar va chiziq kodlari loyiha faylida saqlanadi.
