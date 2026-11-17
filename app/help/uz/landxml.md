---
title: LandXML almashinuvi
summary: Boshqa fuqarolik dasturlaridan LandXML ni yangi loyiha sifatida oching, nuqtalar, sirtlar, trassalar, profillar va quvur tarmogʻini LandXML 1.2 sifatida eksport qiling va qaysi narsalar yoʻlda qolmasligini biling.
keywords: landxml, xml, import, eksport, almashinuv, tin, sirt, trassa, profil, quvur tarmogʻi, oʻzaro ishlash, maʼlumot almashinuvi
from: 870d5ece
---

LandXML koʻpchilik fuqarolik dasturlari oʻqiydigan va yozadigan ochiq almashinuv formati. CivilCraft LandXML 1.2 ni oʻqiydi va yozadi. Agar Civil 3D dan foydalangan boʻlsangiz, uning LandXML import va eksport oynalari eng yaqin oʻxshashlari; bu yerda tanlash kerak boʻladigan narsalar yoʻq, eslatmalar esa nima qoldirilganini aytadi.

## LandXML faylini ochish

1. {{ui:Ochish}} tugmasini bosing (yoki {{key:Mod+O}} tugmalarini bosing) va `.xml` yoki `.landxml` faylni tanlang yoki uni rejaga tashlang.
2. Joriy loyihada saqlanmagan oʻzgarishlar boʻlsa, CivilCraft avval soraydi. {{ui:Nusxasini saqlash}}, {{ui:Saqlamaslik}} yoki {{ui:Bekor qilish}} ni tanlang.
3. **Yangi loyiha** yaratiladi. Holat satri nima oʻqilganini aytadi, masalan "site.xml ochildi: 412 ta nuqta, 2 ta sirt, 3 ta trassa."
4. **Yuza** faktlari ostidagi qutiga qarang. U oʻtkazib yuborilgan yoki oʻzgartirilgan hamma narsani sanaydi, masalan:
   - "Faqat birinchi sirt ("EG") ochildi; faylda yana 1 ta bor."
   - "Trassa "Ramp A" CivilCraft hali chiza olmaydigan elementlarga ega (chiziqlar, yoylar yoki klotoid spirallar emas); u oʻtkazib yuborildi."
   - "Quvur tarmogʻi qoidalari faylda yoʻq edi; vaqtinchalik qiymatlar ishlatilmoqda. Ularni **Loyiha** ostida oʻrnating."

Faylda qanday narsa qanday boʻlishi:

| Faylda | CivilCraft da |
|---|---|
| Birliklar (Imperial yoki Metric) | Loyihaning **Birliklari** (fut yoki metr) |
| Loyiha nomi | Loyihaning **Nomi** |
| CgPoints | Loyihaning nuqtalari; tavsif (yoki kod) guruhni beradi |
| Birinchi TIN sirt | Mavjud yer, "Yuza (LandXML dan)" sifatida oʻz holicha ishlatiladi |
| Chiziq, yoy va klotoid spirallardan iborat har bir trassa | PI lar, radiuslar va spiral uzunliklari egrilardan qayta tiklangan trassa |
| Har bir trassaning birinchi loyihalangan profili | Parabolik vertikal egrilar bilan loyihalangan profil |
| Birinchi quvur tarmogʻi | Quvur tarmogʻi, qirralari, chuqurchalari va tublari bilan |
| Chiziq va yoylardan iborat reja xususiyatlari | Xarakterli chiziqlar, yoylar saqlanadi; boshqa dasturdan kelsa, ular **Faqat chizilgan** holatida boshlanadi |

Elementlar va atributlarning toʻliq roʻyxati: [LandXML: oʻqiladigan va yoziladigan narsalar](topic:landxml-reference).

:::note
LandXML dan oʻqilgan sirt nuqtalar guruhlarini oʻzgartirganingizda yoki xarakterli chiziqlar chizganingizda qayta qurilmaydi. Uni nuqtalardan qurish uchun **Yuza** boʻlimida {{ui:Sirtni nuqtalardan qayta qurish}} tugmasini bosing ({{key:Mod+Z}} LandXML sirtini qaytaradi).
:::

## LandXML ni eksport qilish

1. **Eksport** guruhida {{ui:LandXML}} ni bosing.
2. Brauzer `<name>.xml` faylni yuklab oladi. Holat satri nima kiritilganini aytadi, masalan "LandXML 1.2 eksport qilindi: 276 ta nuqta, 2 ta sirt, 1 ta trassa, quvur tarmogʻi. Bu yerda maydonchalar LandXML ga kirmaydi; vertikal rejalashtirilgan sirt kiradi."

Fayl quyidagilarni saqlaydi:

- **Birliklar**: AQSh geodezik futlari yoki metrlar.
- **CgPoints**: har bir nuqta, uning raqami nom sifatida, tavsifi va guruhi kod sifatida.
- **Sirtlar**: mavjud yer TIN sifatida, uning xarakterli chiziqlari va tashqi chegarasi manba maʼlumoti sifatida; pad yoki koridorlar yerni tekislaganda esa "Proposed" nomli ikkinchi TIN sirt.
- **Trassalar**: chiziqlar, yoylar va klotoid spirallar stansiyalari bilan, har biri yoʻlida olingan mavjud yer bilan profilga ega; kamida ikkita PVI boʻlganda loyihalangan profil (PVI va parabolik egrilar) ham.
- **PipeNetworks**: tuzilmalar, ularning qirralari, chuqurchalari va har bir quvur uchun tubi, hamda diametri, uzunligi va qiyaligi bilan quvurlar.
- **PlanFeatures**: har bir xarakterli chiziq chiziq va yoy sifatida, har bir uchida balandlik va uning ishlatilishi bilan.

## Nima yoʻlda qolmaydi

- Obyekt sifatidagi pad va koridorlar. Ularning natijasi "Proposed" sirtida.
- Xatolari bor trassalar (masalan, bir-biriga kirgan egrilar): tashlab yuboriladi va holat xabarida sanaladi.
- Ikkala tubi boʻlmagan quvurlar va ikkitadan kam tuzilmali tarmoqlar.
- Sirtdan olingan qirra qoʻzgʻalmas qirra sifatida yoziladi. Qayta ochilganda tuzilma sirt oʻzgarsa ham oʻsha raqamni saqlaydi.
- Tarmoq qoidalari (eng kichik qiyalik, qoplama, pasayish): LandXML ularga joy bermaydi.
- Koʻrinish sozlamalari va nuqtalar guruhlarining sirt tanlovlari: ularni saqlash uchun CivilCraft loyihasini saqlang.

Ochishda CivilCraft klotoiddan boshqa spirallarni, panjara sirtlarni, faqat boshqa nuqtalarga ishora qiluvchi nuqtalarni, uchastkalarni, reja xususiyatlaridagi spirallarni, yoʻllarni yoki geodezik maʼlumotlarni oʻqimaydi. Har biri izohlarda nomlanadi, hech qachon taxmin qilinmaydi.

## Aylanma almashinuv

Ishni boshqa fuqarolik dasturidan foydalanadigan odamga berib, keyin qaytarib olish uchun LandXML ni eksport qiling, u tahrir qilsin va uning LandXML ini yangi loyiha sifatida oching. Shuningdek oʻzingizning `.civilcraft.json` faylingizni saqlang: u CivilCraft biladigan hamma narsani saqlaydigan yagona fayl.
