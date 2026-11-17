---
title: Koridor shablonlari va relyef shablonlari
summary: Kichik qayta ishlatiladigan shablonlar (bordyur va lotok, trotuar, devor, ariq) yarating, ulardan koridorni piket boʻyicha chap va oʻng tomonlari alohida qilib quring, trassani bir nechta koridorga boʻling va relyefga qatlamli materiallarni yoying.
keywords: shablon, shablonlar, shablonlar kutubxonasi, shablon yaratish, tipik kesim, yigʻma, kichik yigʻma, komponentlar, nuqta kodlari, oxirgi shart, daylight, ariq, tutib turuvchi devor, bordyur, lotok, trotuar, mintaqalar, piket oraligʻi, bir nechta koridor, chap va oʻng, relyef shabloni, unumdor qatlam, qoplama, asos, yoyish, materiallar, miqdorlar
from: ce70e58b
---

**Shablon** — bir marta chizib, qayta ishlatiladigan kichik kesim: siljishli, nishabli va nuqta kodli nuqtalar hamda materialli komponentlar. Koridorni shablonlardan piket boʻyicha qurish mumkin, har bir tomonda oʻz qoplama shablonlari va oʻz oxirgi sharti bilan; xuddi shu shablonlarni relyefga yoyish ham mumkin.

:::warning
Namunaviy shablonlar boshlash uchun joy egallovchilar. Ularning raqamlari hech bir standart yoki idoradan olinmagan. Loyihada ishlatishdan oldin muhandis har bir shablonni va unga kiritgan har bir qiymatni tekshirishi shart.
:::

## Shablonlarni ochish

{{ui:Yuza}} › {{ui:Yana}} › {{ui:Koridor shablonlari…}} ni oching (yoki {{cmd:TEMPLATES}} ni yozing). Oynada uchta roʻyxat bor:

- **Bu loyihada**: bu loyihaning koridorlari va relyef shablonlari ishlatadigan shablonlar. Ular loyiha faylida saqlanadi.
- **Mening kutubxonam**: bu brauzerda saqlanadigan va har bir loyihada taklif qilinadigan shablonlar. Loyiha shablonini saqlash uchun unda {{ui:Mening kutubxonamga saqlash}} ni ishlating.
- **Namunalar**: qatlamli ikki polosa, bordyur va lotok, trotuar, daylight, ariq, tutib turuvchi devor, relyef ostidagi unumdor qatlam va relyefdagi qoplama. Har biri "Muhandis tekshiruvi uchun" deb belgilangan.

{{ui:Bu loyihada ishlatish}} kutubxona yoki namuna shablonini loyihaga nusxalaydi. {{ui:Bu loyiha shablonlarini eksport qilish}} ularni `.cctemplates.json` fayli sifatida saqlaydi, va {{ui:Fayl import qilish}} faylni loyihaga va Mening kutubxonamga oʻqiydi. Shablonlarni ulashish yoki boshqa kompyuterga koʻchirish uchun fayldan foydalaning.

## Shablon yaratish

{{ui:Yangi shablon}} (yoki loyiha shablonidagi {{ui:Tahrirlash}}) shablon muharririni ochadi. Oʻng tomonni shablonning 0,0 nuqtasidan tashqariga chizing; chap tomon xuddi shu shablonni chapga tashqariga ishlatadi.

1. Unga nom va tur bering: **Qoplama** (keyingi shablon uning oxiriga ulanadi), **Oxirgi shart** (u yerga tegadi) yoki **Relyef shabloni**.
2. **Qiymatlar** qoʻshing: nomlangan sonlar, masalan kenglik `w` yoki nishab `s`. Shablondagi istalgan son katakchasi raqam yoki qiymat nomini qabul qiladi; `-t` — manfiy qilingan `t` qiymati. Koridor shablonning har bir qoʻllanishiga oʻz qiymatlarini berishi mumkin, shuning uchun bitta bordyur shablon har qanday bordyur balandligiga xizmat qiladi.
3. **Nuqtalar** ni tartib bilan qoʻshing. Har biri oldingi nuqtadan (yoki 0,0 nuqtadan) oʻz cheklovi boʻyicha joylashtiriladi:

| Cheklov | Nuqtani joylashtiradi |
|---|---|
| Nishabda siljish | Tashqariga siljish va nishab (koʻtarilish/gorizontal; −0.02 — 2% pasayish) |
| Siljish va koʻtarilish | Siljish va koʻtarilish |
| Toʻgʻri yuqoriga yoki pastga | Faqat koʻtarilish |
| Yon nishab yerga | Oʻz nuqtasidan yerga tashqariga, yer yuqorida boʻlsa kesish nisbatida, pastda boʻlsa toʻldirish nisbatida |
| Yergacha | Siljish, soʻngra toʻgʻri yuqoriga yoki pastga yergacha |
| Tutib turuvchi devor | Siz bergan qalinlikdagi devor: kesishda uning yuqori qismi yoʻl yuzida yerga tegadi, toʻldirishda yoʻl uning ustidan oʻtadi va tashqi yuzi yerga tushadi |

   **Yuqori** ni belgilang, tayyor yuza oʻtadigan nuqtalar uchun. Oxirgi yuqori nuqta shu tomondagi keyingi shablon boshlanadigan joy. **Nishon** koridorga nuqtani siljitish imkonini beradi: uning siljishi yoki balandligi chiziqdan olinadi.
4. **Komponentlar** qoʻshing: nuqta kodlari orqali yopiq shakllar (`0` — 0,0 nuqta), har biriga nom, material va tur bering. Ularning maydonlari hajmlarni beradi.

Chizma har bir oʻzgarishni haqiqiy masshtabda kuzatadi, va uning ostidagi roʻyxat nima notoʻgʻriligini aytadi (oxirigacha yerga tegadigan nuqta, shablonda boʻlmagan qiymat, maydoni boʻlmagan komponent). {{ui:Bu loyihaga qoʻshish}} yoki {{ui:Saqlash}} uni bitta ortga qaytarish qadami sifatida saqlaydi.

## Shablonlardan koridor qurish

Koridori bor trassani tanlang va uning **Xususiyatlar** ichida {{ui:Shablonlar boʻyicha piketdan qurish}} ni yoqing. Koridor ikki tomonda ikki polosa va daylight namunalari bilan boshlanadi.

- **Mintaqalar.** Har bir mintaqa piketdan boshlanadi va keyingi mintaqagacha davom etadi. {{ui:Mintaqa qoʻshish}} bittasini qoʻshadi; uning boshlangʻich piketini katakchasida oʻzgartiring.
- **Chap va oʻng alohida.** Har bir mintaqaning har bir tomonida oʻz **Qoplama** roʻyxati bor, markaziy chiziqdan tashqariga, va oʻz **Oxirgi shart**i: daylight, ariq, devor yoki yerga tegadigan istalgan shablon. Oxirgi shart boʻlmasa, tomon koridorning kesish va toʻldirish nishablarida daylight chizigʻini beradi. {{ui:Chapdan oʻngga nusxalash}} tomonni nusxalaydi.
- **Qiymatlar va nishonlar.** Tomondagi har bir shablon ostida har bir qiymat uchun katakcha (boʻsh = shablonning oʻz qiymati) va nishonni oladigan nuqta uchun uni siljitadigan xususiyat chizigʻi yoki boshqa koridor chizigʻi.
- **Dan** va **Gacha** koridorni trassaning bir qismi bilan chegaralaydi.

Kesimlar, har bir nuqta kodi uchun reja chiziqlari, loyihalangan yuza, nuqtalarni koʻchirib belgilash va yer ishlari hammasi shularga ergashadi. Xususiyatlar har bir komponentning hajmini tomon va mintaqa boʻyicha koʻrsatadi (markaziy chiziq boʻylab oʻrtacha oxirgi maydonlar). Koridor shablonlardan qurilgan paytda superelevatsiya va koridorning chekka nishonlari ishlatilmaydi.

## Bitta trassada bir nechta koridor

**Bu trassadagi koridorlar** ostida {{ui:Koridor qoʻshish}} trassaning qolgan qismiga koridor qoʻshadi: birinchi koridorga oʻrtada oxirgi piket beriladi (yoki oʻz piketini saqlaydi) va yangisi oʻsha yerdan birinchi koridorning oxirgi mintaqa shablonlari bilan boshlanadi. Har bir koridorning oʻz nomi, piket oraligʻi, shablonlari va yer ishlari bor. Bittasini uning {{ui:Yoqilgan}} katakchasi bilan oʻchiring. Ikki oraliq ustma-ust tushsa, keyingi koridor oldingisi ustidan tekislaydi.

## Relyef shablonlari

Relyef shabloni shablonning qatlamlarini 0,0 nuqtadan relyef ustiga yoyadi: 0,0 nuqtadan pastdagi qatlam yerga kiradi (olib tashlanadigan unumdor qatlam), undan yuqoridagi qatlam yer ustida turadi (avtoturargohdagi asos va qoplama). Kengliklar va nishablar ahamiyatga ega emas, faqat har bir komponentning 0,0 nuqtasidan yuqori yoki pastdagi chuqurligi.

{{ui:Yuza}} › {{ui:Yana}} › {{ui:Relyef shablonlari…}} ni oching (yoki {{cmd:TERRAINTEMPLATES}} ni yozing); blok loyihaning **Xususiyatlar** ichida ham bor. {{ui:Relyef shablonini qoʻshish}} unga unumdor qatlam namunasi bilan bittasini qoʻshadi. Har biri uchun tanlang:

- **shablon** (uning qiymatlarini shu biri uchun oʻzgartirish mumkin),
- **relyef**: mavjud yer yoki loyihalangan yuza,
- uni kesadigan **shakl**: butun relyef, uchastka, maydoncha yoki yopiq xususiyat chizigʻi. Bir nechta relyef shablonlari bir relyefda turli shakllardan foydalanishi mumkin.

Har bir qatlamda qalinligi, reja maydoni va hajmi koʻrsatiladi. Hajm — reja maydoni qalinlikka koʻpaytirilgani, qalinlik toʻgʻri pastga oʻlchanadi; maydon toʻrda oʻlchanadi, va yoyilgan (qiyalik) maydon ham beriladi. Shakllar rejada C-TOPO-TMPL qatlamida chiziladi. Relyef shablonlari loyihalangan yuzani oʻzgartirmaydi.

## Materiallar va miqdorlar

Loyihaning yer ishlari blokida **Shablonlardan materiallar** roʻyxati bor: har bir koridor komponenti va relyef shabloni qatlami hajmi bilan. {{ui:TakeoffCraft ga yuborish}} ularni kesish va toʻldirishdan keyin miqdorlar fayliga yozadi, har biri alohida element sifatida, kub yardda (futdagi loyihalar) yoki kub metrda.

## Fayllar

Shablonlar, mintaqalar, qoʻshimcha koridorlar va relyef shablonlari loyiha faylida saqlanadi. Ulardan birortasini ishlatmaydigan loyiha oldingidek saqlanadi; eskiroq CivilCraft versiyalari ulardan foydalanadigan loyihani ochadi (ular shablonlarni eʼtiborsiz qoldiradi va koridorning oʻz yigʻmasini quradi).
