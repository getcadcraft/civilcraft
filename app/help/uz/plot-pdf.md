---
title: Rejani PDF ga chiqarish
summary: Hammasini yoki joriy koʻrinishni standart varaqda, muhandislik yoki metrik masshtabda, qatlam ranglarida yoki qora rangda vektor PDF ga chiqarish.
keywords: chiqarish, chop etish, pdf, varaq, masshtab, qogʻoz oʻlchami, reja varagʻi, nashr etish, sarlavha bloki, shimol strelkasi, masshtab chizigʻi
from: 9af396ca
---

{{ui:PDF}} rejani bitta varaqda vektor PDF ga chiqaradi, sarlavha qatori, shimol strelkasi va masshtab chizigʻi bilan. PDF brauzerda tayyorlanadi va yuklab olinadi; u brauzerning chop etish oynasidan oʻtmaydi.

## Chiqarish

1. **Koʻrsatish** boʻlimida rejani sozlang: koʻrsatiladigan yuza, konturlar intervali va qaysi narsalar yoqilganligi. Chiqarish shu sozlamalarga amal qiladi.
2. Saytning faqat bir qismi kerak boʻlsa, rejani oʻsha qismga kattalashtiring va suring.
3. **Eksport** guruhida {{ui:PDF}} ni bosing yoki {{key:Mod+P}} ni bosing.
   **Rejani PDF ga chiqarish** oynasi ochiladi.
4. **Maydon** ni tanlang: {{ui:Hammasi}} yoki {{ui:Ekrandagi koʻrinish}}.
5. **Qogʻoz** ni tanlang: Letter, Tabloid, ANSI D, ARCH D, ISO A4, A3 yoki A1. Futli loyiha Tabloid bilan, metrik loyiha A3 bilan boshlanadi. Varaqlar doim gorizontal boʻladi.
6. **Masshtab** ni tanlang. Roʻyxat "(mos keladi)" bilan eng katta sigʻadigan masshtabni belgilaydi va uni tanlaydi.
   - Futlar: 1" = 5', 10', 20', 30', 40', 50', 60', 100', 200', 300', 400', 500', 1000'.
   - Metrlar: 1:50, 1:100, 1:200, 1:250, 1:500, 1:1000, 1:2000, 1:2500, 1:5000, 1:10000.
7. **Rang** ni tanlang: {{ui:Qatlam ranglari}} yoki {{ui:Qora}}.
8. Tanlovlar ostidagi satrni oʻqing. U maydonning qogʻozdagi oʻlchamini va varaq oʻlchamini beradi, masalan: "Maydon 1" = 40' masshtabda 297 × 222 mm, 432 × 279 mm varaqda (gorizontal)."
9. {{ui:PDF yuklab olish}} tugmasini bosing.
   Brauzer `<name>.pdf` faylini yuklab oladi. Holat satrida "<name>.pdf 1" = 40' masshtabda chiqarildi" yoziladi.

Agar tanlangan masshtabda maydon varaqdan katta boʻlsa, chiqarish markazlashtiriladi va chekkalari kesiladi. "(mos keladi)" belgisi qoʻyilgan masshtabni yoki kattaroq varaqni tanlang.

## Varaqda nima bor

- Reja chizish maydonining markazida, haqiqiy vektorlar sifatida: konturlar, yozuvlar, piketli trassalar, koridorlar, platformalar va chiqish chiziqlari, quvurlar, nuqtalar.
- Qatlamlar boʻyicha chiziq qalinliklari: trassalar, platformalar va quvurlar qalinroq; uchburchaklar va kichik konturlar ingichka.
- Pastda sarlavha qatori: loyiha **Nomi**, masshtab, konturlar intervali haqida eslatma va qaysi yuza (mavjud yoki tekislangan) ishlatilgani, oʻngda sana va versiya.
- Yuqori oʻng burchakda shimol strelkasi (reja shimoli yuqorida) va sarlavha qatorida masshtab chizigʻi.
- Reja ostidagi xarita qatlamlari (rasm, xarita plitalari yoki xizmat), **Reja ostidagi xarita qatlamlari** belgilanganda: ular chiziqlar ostida, butun chizish maydonining bitta rasmi sifatida 150 nuqta/dyuym aniqlikda chiziladi va xaritaning mualliflik yozuvi sarlavha qatoriga qoʻyiladi. CivilCraft xarita rasmlarini 8 soniyagacha kutadi; baʼzilari hali yetib kelmagan boʻlsa, holat satrida shu haqda aytiladi.

Matnda PDF ning oʻrnatilgan Helvetica shrifti ishlatiladi. Gʻarbiy Yevropa toʻplamidan (Windows-1252) tashqari belgilar "?" sifatida chop etiladi, va holat xabarida ularning soni hisoblanadi.

## Chiqarilmaydigan narsalar

- Balandlik polosalari.
- Profil koʻrinishi. Profillarni chiqarish hali mavjud emas.
- Bir nechta varaq (trassa uchun [reja va profil varaqlaridan](topic:plan-profile-sheets) foydalaning), viewportlar, maxsus sarlavha bloki yoki portret varaqlar.

:::note
Oynada nishablik strelkalari faqat ekranda koʻrinishi aytiladi. Bu versiyada **Koʻrsatish** ostida yoqilgan nishablik strelkalari chiqariladi (va DXF ga eksport qilinadi). Agar ularni istamasangiz, chiqarishdan oldin oʻchiring.
:::

## Qogʻozda chop etish

Yuklab olingan PDF ni istalgan PDF koʻruvchida oching va masshtab toʻgʻri qolishi uchun 100% (haqiqiy oʻlcham) da chop eting. "Sahifaga moslash" masshtabni oʻzgartiradi.
