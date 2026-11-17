---
title: Oʻsimlik yozuvlari, navlar va taqdim etiladigan oʻlchamlar
summary: Loyihangizning oʻz oʻsimliklar roʻyxati jadval koʻrinishida: navlar, taqdim etiladigan oʻlchamlar (idish, ildiz kosasi, obxvat, toza poya), zichlik, spetsifikatsiya izohlari, CSV kirish va chiqish; har bir joylashtirilgan oʻsimlik oʻlchamini nomlaydi; masshtab boʻyicha oʻsimlik belgilari, oʻz belgilari va 3D modellari.
keywords: oʻsimliklar jadvali, oʻsimliklar bazasi, nav, xilma, taqdim etiladigan oʻlcham, idish, ildiz kosasi, ochiq ildiz, obxvat, toza poya, zichlik, metr kvadratiga oʻsimliklar soni, spetsifikatsiya, spetsifikatsiya izohi, oʻsimlik belgisi, blok, oʻz belgisi, 3D oʻsimlik, tafsilot darajasi, masshtab
from: 12251beb
---

Landshaft guruhining {{ui:Yana}} menyusidan yoki **Oʻsimliklar** boʻlimidan {{ui:Oʻsimliklar jadvali}} ni oching. Har bir qator loyihaning oʻz roʻyxatidagi oʻsimlik yozuvi (oʻsimliklar roʻyxatidagi yozuv qoʻshilganda nusxalanadi). Har bir tahrir import qilingan fayl kabi tekshiriladi va bitta bekor qilish amali hisoblanadi.

## Ustunlar

- **Botanik nomi**, **Umumiy nom**, **Tur**, **Balandlik** va **Yoyilish** voyaga yetganda (metrda).
- **Masofa** (markazdan markazgacha) yoki **Zichlik** (m² dagi oʻsimliklar). Zichlikka ega, masofasi boʻlmagan yozuvning yotogʻi oʻz namunasi (uchburchak yoki kvadrat) boʻyicha shu zichlikda toʻldiriladi.
- **Taqdim etiladigan oʻlchamlar**: har bir oʻlcham `;` bilan ajratiladi. Har bir yozuv: identifikator, tur (`container`, `rootball`, `wrapped`, `bareroot`, `plug`, `seed`) va quyidagilardan ixtiyoriy: hajm `10L`, balandlik `h0.6`, yoyilish `s0.4`, obxvat `g14-16` (sm), toza poya `st1.8`. Misol: `c10 container 10L h0.6; rb rootball h3 g14-16 st1.8`.
- **Navlar**: nomlar `;` bilan ajratiladi. Nav oʻz oʻlchamlari va izohlarini saqlaydi, agar import qilingan faylda ular boʻlgan boʻlsa.
- **Spetsifikatsiya izohlari**.

{{ui:Takrorlash}} qatorni yangi kalit ostida nusxalaydi; {{ui:CSV sifatida saqlash}} va {{ui:Oʻsimliklar fayli sifatida saqlash}} roʻyxatni yozib chiqaradi (navlarning CSV qatorlari ularning turi ostida, `cultivar_of` bilan joylashadi). CSV yoki oʻsimliklar faylini import qilish uni mavjud roʻyxatga birlashtiradi.

## Sizning oʻz Kutubxona oʻsimliklar roʻyxatingiz

CadCraft hisobingizga kiring (**Sozlamalar**, **Sizning qoʻshimchalaringiz**, **Kirish**), shunda oʻsimliklar jadvali Kutubxonada saqlaydigan roʻyxatingizdan foydalana oladi:

- {{ui:Mening kutubxona roʻyxatimdan}} sizning oʻz oʻsimlik elementlaringizni olib keladi (hali koʻrib chiqish kutayotganlarini ham). Bu yerda allaqachon boʻlgan oʻsimlik Kutubxonadan yangilanadi; bu yerda qoʻshgan navlar, taqdim etiladigan oʻlchamlar, zichlik va spetsifikatsiya saqlanadi.
- {{ui:Oʻsimliklar roʻyxati sifatida saqlash}} har bir qatorni oʻz Kutubxona oʻsimlik elementingiz sifatida saqlaydi, har bir tur uchun bitta element: yangi oʻsimlik yangi element, oʻzgargan oʻsimlik yangi versiya boʻladi, oʻzgarmagani tegilmaydi. Avval katakchani belgilang: saqlash oʻsimliklarni CC0 ostida ommaga beradi. Hali ishonchli boʻlmagan shaxsning birinchi ommaviy yuklashi, har bir yuklash kabi, koʻrinishdan oldin inson tomonidan tekshiriladi.

Kutubxonada asosiy oʻsimlik yozuvi saqlanadi. Navlar, taqdim etiladigan oʻlchamlar, zichlik va spetsifikatsiya izohlari loyihada hamda oʻsimliklar faylida ({{ui:Oʻsimliklar fayli sifatida saqlash}}) qoladi; muloqot oynasi har safar saqlaganingizda necha qator taʼsirlanishini koʻrsatadi.

## Joylashtirilgan oʻsimlik oʻlchamini nomlaydi

Oʻsimlikni, jonli devorni yoki yotoq yoki maydonning aralashma qatorini tanlang: yozuvda navlar yoki taqdim etiladigan oʻlchamlar boʻlsa, {{ui:Nav va oʻlcham}} ulardan birini tanlaydi. Oʻsimliklar jadvali keyin turi, nav va oʻlcham boʻyicha sanaydi, yozuv ularni koʻrsatishi mumkin: `{botanical} '{cultivar}' {size}` yoki `{full}`.

## Masshtab boʻyicha oʻsimlik belgilari

{{ui:Oʻsimlik grafikasi}} (Landshaft › Yana) oʻsimliklar rejada qanday chizilishini belgilaydi: **avtomatik** (1:500 dan kam batafsil masshtablarda yoyilish boʻyicha doira, 1:200 va 1:500 orasida markazi bilan kontur, batafsilroq boʻlsa batafsil belgi; ikkala masshtabni oʻzgartirish mumkin) yoki har bir masshtab uchun bitta daraja. Varaqlar oynasida shu toʻplam uchun oʻz **Rejada oʻsimlik tafsiloti** bor.

Oʻsimliklar boʻlimidagi yozuvda {{ui:Oʻz belgisi…}} SVG yoki DXF/DWG chizmasining blokini oʻqiydi va uni oʻsimlikning yoyilishiga moslab batafsil darajada chizadi. {{ui:Oʻz 3D modeli…}} OBJ, STL yoki GLB ni oʻqiydi; 3D da koʻrish uchun Oʻsimlik grafikasi da **Har bir yozuvning oʻz modeli** ni tanlang. Fayllar chegaralangan (512 KB SVG, 2000 shakl, 50 000 uchburchak) va loyihada saqlanadi. SVG transformatsiyalari qoʻllanmaydi (fayl ularni oʻz ichiga olsa, sizga xabar beriladi). Darajalar, chegaralar va GLB nimani oʻz ichiga olishi mumkinligi haqida qarang: [Oʻsimlik grafikasi, oʻz belgilaringiz va 3D oʻsimliklar](topic:plant-graphics).
