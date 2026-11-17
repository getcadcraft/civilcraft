---
title: Sunʼiy intellekt yordamchisiga sayt bilan ishlashga ruxsat berish
summary: Sozlamalarda yordamchilarni yoqing, shunda kompyuteringizdagi yordamchi ochiq saytni (nuqtalar, sirtlar, hajmlar, profillar, uchastkalar) oʻqiy oladi, geodezik nuqtalar qoʻshadi, LandXML yoki DWG ni saqlaydi va eksport qiladi, CadCraft Studio orqali. Siz yoqmaguningizcha oʻchiq.
keywords: ai, yordamchi, mcp, skript, avtomatlashtirish, studio, nuqtalar, balandlik, pikket, ofset, trassa, hajm, kesish, toʻldirish, profil, uchastka, landxml, dwg, usd, jildlar, ruxsatlar, uzish, faollik
from: d0356582
---

## Nimani oʻrganasiz

Sunʼiy intellekt yordamchisi (MCP tilida gaplashadigan har qanday yordamchi) ochiq saytingiz bilan ishlashiga qanday ruxsat berish, nimalar qila olishi va qila olmasligi hamda uni qanday toʻxtatish.

## CivilCraftda yordamchi nimalar qila oladi

| Yordamchi soʻraydi | U nimani oladi | Kerak |
|---|---|---|
| Sayt | Nomi, birliklar, koordinatalar tizimi, nuqtalar guruhlari, trassalar, sirtlar, maydonchalar, uchastkalar va quvurlar | Oʻqish |
| Geodezik nuqtalar | Raqami, sharqiy, shimoliy, balandligi va tavsifi; guruh boʻyicha, tavsif boʻyicha yoki quti ichida | Oʻqish |
| Sirt balandliklari | Istalgan nomlangan nuqtalardagi mavjud yer (yoki tekislangan sirt) | Oʻqish |
| Pikketlar va ofsetlar | Nuqtalarning trassa boʻylab pikketi va ofseti, yoki pikketlarning koordinatalari va yer balandligi | Oʻqish |
| Profil | Trassa boʻylab yer, loyiha profili va tekislangan sirt balandliklari, har necha fut yoki metrda | Oʻqish |
| Kesish va toʻldirish | Mavjud yer va tekislangan sirt orasidagi hajmlar (har bir maydoncha va koridor ham), yoki yer bilan sath orasidagi | Oʻqish |
| Uchastkalar | Burchaklar, maydon (akr yoki gektar bilan), perimetr va huquqiy tavsif | Oʻqish |
| Tanlov | U nomlagan nuqtalar planda tanlanadi, xuddi siz tanlaganingizdek | Tahrirlash |
| Yangi geodezik nuqtalar | Nuqtalar u bergan raqamlar bilan yoki keyingi boʻsh raqamlar bilan qoʻshiladi. Har bir chaqiruv bekor qilinadigan bitta qadam | Tahrirlash |
| Saqlash | CivilCraftʼning oʻz {{ui:Saqlash}} tugmasi | Saqlash |
| LandXML yoki DWG | {{ui:LandXML}} va {{ui:DWG}} tugmalari bilan bir xil fayllar | Eksport |
| Sayt 3D da | Yer, tekislangan sirt, maydonchalar va quvurlarning OpenUSD (.usdz, .usda yoki .usdc) fayli, 3D koʻrinish eksport qilganidek | Eksport |
| Oʻsimliklar va oʻsimliklar jadvali | Oʻsimliklar roʻyxatida istalgan nom bilan topilgan oʻsimliklar va oʻsimliklar jadvalining sonlari | Oʻqish |
| Ekish va tekislash | Oʻsimliklar, gulzor yoki jonli devor joylashtiriladi, yoki platforma, boʻrtma, ariq yoki tekislash maydoni qoʻshiladi; har biri bekor qilinadigan bitta qadam, kesish va toʻldirishi bilan | Tahrirlash |
| Sugʻorish tekshiruvi | Har bir zonaning oqimi, uning klapanida va taʼminotda kerakli bosim, eng yomon holat bosimi, ishlash vaqtlari, muammolar va materiallar roʻyxati; sugʻorish loyihachisi tekshiradigan hisoblash yordami sifatida | Oʻqish |

U ochiq sayt bilan ishlaydi. Studioʼda u siz tanlagan jildlarga ham saqlashi va eksport qilishi mumkin (quyida); jild boʻlmasa, fayllari tugmalar kabi yuklab olinadi.

## Yoqish

Yordamchilar CivilCraftga kompyuteringizdagi CadCraft Studio orqali ulanadi; oddiy brauzerda bunga yoʻl yoʻq.

1. {{ui:Sozlamalar}} ni oching va **CivilCraft** yorligʻini tanlang.
2. **Yordamchilar** ostida **Sunʼiy intellekt yordamchilari va skriptlarga CivilCraftdan foydalanishga ruxsat berish** ni belgilang.
3. **Oʻqish** siz uchun belgilangan. Yordamchiga kerak boʻlganda **Tahrirlash**, **Saqlash** yoki **Eksport** ni belgilang.
4. Yordamchi jildga saqlashi va eksport qilishi uchun **Foydalanishi mumkin boʻlgan jildlar** ostida {{ui:Jild qoʻshish…}} ni tanlang va Studio dialogida jildni tanlang. {{ui:Olib tashlash}} uni darhol qaytarib oladi; boshqa har qanday yoʻl rad etiladi.
5. Studioʼda yordamchini ulang (Studio manzilni va uni joylashtirish uchun sozlamalarni koʻrsatadi).

## Yordamchi ulangan vaqtda

Oʻng panelning yuqorisida qaysi yordamchi ulangani va u nimani qila olishini koʻrsatuvchi izoh bor. Seansini darhol tugatish uchun {{ui:Uzish}} ni bosing; davom etish uchun u qayta ulanishi kerak.

**Faollik** — Sozlamalarda **Yordamchilar** ostida — yordamchi qilgan har bir chaqiruvni koʻrsatadi, eng yangisi birinchi, ishlaganmi yoʻqmi bilan.

:::tip
Oddiy soʻzlar bilan soʻrang, masalan "Asosiy koʻcha boʻylab har 50 futda yer balandligi qancha?", "Maydonchalarga qancha kesish va toʻldirish kerak?" yoki "bu koordinatalarda boshqaruv nuqtasini qoʻshing". Yordamchi saytni oʻqiydi va javob beradi, yoki oʻzgarishni bekor qilinadigan bitta qadam sifatida bajaradi.
:::

## CivilCraftni ochmasdan

Yordamchilar uchun CadCraft fayl serveri (`npx @getcadcraft/mcp`) va `cadcraft` buyruq qatori saqlangan CivilCraft loyihalarini (`.civilcraft.json`) va nuqta fayllarini CivilCraftʼning oʻz kodi bilan oynasiz ochadi: oʻsha oʻqish vositalari, nuqta qoʻshish, loyihani saqlash, LandXML va sayt 3D da OpenUSD sifatida. `cadcraft convert site.civilcraft.json site.xml` buyruq qatoridan LandXML yozadi. LandXML ni ochish, DWG eksporti va Landscape ish maydonining vositalari hali ham CivilCraft oynasini talab qiladi.

## Yordamchini oʻchirish

**Sunʼiy intellekt yordamchilari va skriptlarga CivilCraftdan foydalanishga ruxsat berish** belgisini olib tashlang. Har bir yordamchi darhol uziladi va sozlama keyingi safar uchun saqlanadi.

## Shuningdek qarang

- [Yordamchilar uchun retseptlar](common:assistants-recipes): har biri chaqiradigan vositalar bilan ishlangan misollar.
- [Gorizontal trassani tuzish](topic:alignment)
- [Sirtni qurish va aniqlashtirish](topic:build-surface)
- [Geodezik nuqtalarni tanlash, nusxalash va qoʻyish](topic:copy-paste-points)
- [CivilCraft sozlamalari](topic:settings)
