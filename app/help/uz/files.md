---
title: Ochish, saqlash va eksport qilish mumkin boʻlgan fayllar
summary: Nuqta fayllari, LandXML va CivilCraft loyihalarini kiritish; loyihalar, LandXML, DXF va PDF ni chiqarish; har biri nimani saqlashi, fayllar qayerga borishi va oflaynda nima oʻzgarishi.
keywords: ochish, saqlash, eksport, import, fayl formatlari, csv, txt, landxml, xml, dxf, pdf, json, yuklab olish, loyiha fayli
from: a7debb61
---

CivilCraft kompyuteringizdagi fayllarni ochadi va ularni kompyuterga yuklab olish orqali saqlaydi. Hech narsa yuklanmaydi va serverda hech narsa saqlanmaydi. Shuningdek qarang: [Fayllaringiz](common:your-files).

## Nimalarni ochadi

{{ui:Ochish}} tugmasini bosing (yoki {{key:Mod+O}} tugmalarini bosing) va faylni tanlang, yoki faylni rejaga sudrab tashlang. Sudrash uchun fayl manbasi: {{pick:mac=Finder|windows=File Explorer|linux=fayl boshqaruvchingiz}}. Bir vaqtda bitta fayl; 200 MB dan katta fayllar qabul qilinmaydi.

| Tur | Fayl nomlari | Nima sodir boʻladi |
|---|---|---|
| Nuqta fayli | `.csv`, `.txt`, `.pnt`, `.xyz` (har qanday matnli fayl) | **Nuqtalarni import qilish** oynasi ochiladi. Nuqtalar loyihaning joriy nuqtalarini almashtiradi; trassalar, maydonchalar va quvurlar qoladi. |
| LandXML | `.xml`, `.landxml` | Fayldan **yangi loyiha** yaratiladi (joriy loyihada saqlanmagan oʻzgarishlar boʻlsa, avval soʻraladi). |
| CivilCraft loyihasi | `.civilcraft.json` (har qanday `.json`) | Loyiha saqlangan holatida ochiladi (joriy loyihada saqlanmagan oʻzgarishlar boʻlsa, avval soʻraladi). |

CivilCraft faylni avval oxirgi qismi, soʻngra birinchi belgilari boʻyicha aniqlaydi: `{` bilan boshlangan matn loyiha sifatida, `<` bilan boshlangan matn LandXML sifatida, qolgani nuqta fayli sifatida oʻqiladi. Ochish oynasida xira koʻrsatilgan fayl ham rejaga sudrab tashlanishi mumkin.

:::note
Nuqtalari bor loyihaga nuqta faylini import qilish ularni soʻramasdan almashtiradi va bekor qilish tarixini tozalaydi (har qanday faylni ochish bekor qilish uchun yangi boshlanish hisoblanadi). Agar sirt LandXML dan kelgan boʻlsa, nuqtalarni import qilish uni yana nuqtalardan qurilgan sirtga almashtiradi. Eski nuqtalarni qaytarib olishni istasangiz, avval saqlang.
:::

Batafsil: [Nuqta fayli formatlari](topic:point-file-formats), [LandXML: nimalar oʻqiladi va yoziladi](topic:landxml-reference).

## Nimalarni saqlaydi

{{ui:Saqlash}} ({{key:Mod+S}}) ikkita fayl yonma-yon yozadi, ular chap paneldagi **Nom** boʻyicha nomlanadi: `<nom>.civilcraft.json` — siz tahrirlashda davom etadigan loyiha, va `<nom>.ifc` — xuddi shu loyiha boshqa dasturlar uchun IFC 4.3 formatida (qarang: [IFC eksport va import](topic:ifc)). Har bir fayl boshqasiga havola qiladi. IFC shuningdek loyihaning siqilgan nusxasini ham saqlaydi, shuning uchun alohida yuborilgan IFC ham toʻliq tahrirlanadigan holda qayta ochiladi.

- **Studio ichida** ikkala fayl bir-birining yonida, joyida yoziladi.
- **Chrome va Edge da** birinchi saqlashda jild soʻraladi va ikkalasi shu jildga yoziladi; keyingi saqlashlar shu jildga boradi. Ikkalasini yuklab olish uchun jild soʻrovini bekor qiling.
- **Boshqa brauzerlarda** ikkala fayl yuklab olinadi, avval loyiha fayli.

Ikkala fayldan istalgan birini ochganda, boshqasi qidiriladi. Ikkalasini birga oching (yoki birga tashlang) yoki bittasini oching: Studio ichida boshqasi bir jildda topiladi; brauzerda CivilCraft uni qoʻshishni yoki mavjud fayl bilan davom etishni soʻraydi. Agar IFC CivilCraft saqlaganidan keyin boshqa dastur tomonidan oʻzgartirilgan boʻlsa yoki bir fayl ikkinchisidan eskiroq boʻlsa, loyiha yangiroq loyihadan ochiladi va **Muammolar** paneli nima boʻlganini aytadi, **Hozir saqlash** (ikkala faylni qayta yozadi) va **IFC geometriyasini mos yozuv sifatida koʻrsatish** tugmalari bilan. Boshqa dastur oʻzgartirgan yolgʻiz IFC oʻzining loyiha nusxasidan mos keladigan narsalar bilan ochiladi: oʻzgargan trassalar oʻz geometriyasini oladi, oʻchirilgan obyektlar chiqarib tashlanadi, qolgan oʻzgarishlar roʻyxatga olinadi, lekin qabul qilinmaydi. 0.7.1 dan oldingi loyiha fayli avvalgidek ochiladi.

Loyiha fayli quyidagilarni saqlaydi:

- har bir nuqta (raqami, koordinatalari, balandligi, tavsifi) va ular kelgan nuqta faylining nomi
- sirt sozlamalari: guruh tanlovlari, chizilgan uzilish chiziqlari, chegara, eng uzun tashqi chekka va LandXML dan oʻqilgan TIN
- koʻrinish sozlamalari
- trassalar, ularning PI lari, radiuslari va boshlanish pikketlari, ularning loyihaviy profillari (PVI lar va egri uzunliklari) va koridor sozlamalari
- maydonchalar va ularning qoidalari bilan quvur tarmogʻi

Bekor qilish tarixini saqlamaydi. Sirtlar, gorizontallar, qazish-toʻldirish chegara chiziqlari va hajmlar saqlanmaydi; loyiha ochilganda ular saqlangan kiritmalardan qayta quriladi. Yangiroq CivilCraft dan olingan loyiha fayli uning versiyasini koʻrsatuvchi xabar bilan rad etiladi.

## Nimalarni eksport qiladi

| Tugma | Fayl | Mazmuni |
|---|---|---|
| {{ui:LandXML}} | `<nom>.xml` | LandXML 1.2: nuqtalar, mavjud yer (va mavjud boʻlsa, loyihalangan sirt) TIN sirtlari sifatida, trassalar, yer va loyihaviy profillar, quvur tarmogʻi |
| {{ui:DXF}} | `<nom>.dxf` | Rejaning koʻrsatilgan chiziqlari, nomlangan qatlamlarda R12 DXF |
| {{ui:DWG}} | `<nom>.dwg` | Xuddi shu chiziqlar DWG chizmasi sifatida, siz tanlagan formatda (2000 dan 2018 gacha) |
| {{ui:PDF}} | `<nom>.pdf` | Varaqdagi reja vektor chizmasi, siz tanlagan masshtabda |
| {{ui:GLB}} yoki {{ui:OBJ}} (3D koʻrinish panelida) | `<nom>-3d.glb`, `<nom>-3d.obj` | 3D koʻrinish 3D model sifatida koʻrsatadigan narsa: metrda, Y yuqoriga, haqiqiy masshtabda, yozib olingan mahalliy koordinata nuqtasi atrofida |

Har biri nimani qoldirishi: [LandXML almashinuvi](topic:landxml), [Rejani DXF ga eksport qilish](topic:dxf-export) (DWG ham), [Rejani PDF ga chizish](topic:plot-pdf), [Saytni 3D da eksport qilish](topic:export-3d).

## Fayllar qayerga boradi

Saqlangan va eksport qilingan fayllar brauzeringiz yuklab olishlarni qoʻyadigan joyga boradi, odatda Yuklab olinganlar jildiga. Har safar jild tanlash uchun:

:::chromium
Brauzer **Sozlamalar** boʻlimini oching, soʻng **Yuklab olishlar** ga oʻting va **Har bir faylni yuklashdan oldin qayerga saqlashni soʻrash** ni yoqing.
:::

:::firefox
**Sozlamalar** ni oching, soʻng **Umumiy** ga oʻting va **Fayllar va ilovalar** boʻlimida **Fayllarni qayerga saqlashni har doim soʻrash** ni tanlang.
:::

:::safari
**Safari > Sozlamalar > Umumiy** ni oching va **Yuklab olish joyi** ni **Har bir yuklab olish uchun soʻrash** ga qoʻying.
:::

Agar ikki marta bir xil nom bilan saqlasangiz, brauzer ikkinchi fayl nomiga raqam qoʻshishi mumkin, masalan `Site (1).civilcraft.json`. Keyingi safar eng yangisini oching.

## Onlayn va oflayn

CivilCraft baribir faqat kompyuteringizda ishlaydi: ochish faylni brauzerda oʻqiydi, saqlash uni yuklab oladi. CivilCraft ni hech qanday ulanishsiz ochish uchun avval uni oflayn foydalanish uchun saqlang:

1. Ulanganda, yuqoridagi ilova panelidagi {{ui:Oflayn uchun saqlash}} tugmasini bosing.
2. Tugma hisoblanadi (`12 / 30 saqlanmoqda`) va soʻngra {{ui:Oflayn tayyor}} ni koʻrsatadi. CivilCraft kichik (taxminan 0.6 MB), shuning uchun bu bir oz vaqt oladi. Saqlangan nusxaga ushbu yordam va namuna hudud kiradi.
3. Ulanish boʻlmasa, xuddi shu manzilni (yoki uning xatchoʻpini) oching. Hammasi ishlaydi, shu jumladan {{ui:Namuna hududni oching}}.

Tugmaning boshqa holatlari:

- {{ui:Saqlab boʻlmadi}}: baʼzi fayllar yuklab olinmadi. Ulanishni tekshiring va qayta urinish uchun bosing.
- {{ui:Oflayn rejim mavjud emas}}: bu brauzer oynasi oflayn nusxani saqlay olmaydi (shaxsiy oynalar va baʼzi boshqariladigan kompyuterlar uni bloklaydi). Oddiy oynadan foydalaning.

Nusxa qachon saqlanganini koʻrish uchun {{ui:Oflayn tayyor}} tugmasini bosing: ikkita tanlov chiqadi, {{ui:Qayta saqlash (eng yangi versiyani olish)}} va {{ui:Oflayn nusxani oʻchirish}}. Saytga borishdan oldin qayta saqlang, shunda nusxa eng yangi versiyaga mos keladi. Batafsil: [Oflayn](common:offline).

:::offline
Siz hozir oflaynsiz. Agar CivilCraft oflayn foydalanish uchun saqlangan boʻlsa, hammasi ishlaydi, namuna hudud ham. Aks holda bu yorliqda ishlashni davom ettiring, lekin ulanmaguningizcha uni qayta yuklamang; saqlangan nusxa boʻlmasa, {{ui:Namuna hududni oching}} "Namuna yuklab boʻlmadi" xabari bilan ishlamaydi.
:::

:::tip
Dalada foydalanish uchun CivilCraft ni oflayn foydalanish uchun saqlang va nuqta fayllaringizni noutbukning oʻzida olib keling. Loyihalar va eksportlar ulanishsiz yuklab olinadigan fayl sifatida saqlanadi, shuning uchun bir kunlik oʻlchovlarni import qilishingiz, sirtni tekshirishingiz va loyihani dalada saqlashingiz mumkin.
:::

Hozircha bulutga saqlash mavjud emas va ish stoli versiyalari hali chiqarilmagan. Hozirda saqlagan fayllaringiz yagona nusxa: ularni zaxiralanadigan joyda saqlang.

## Fayl ishlatadigan qoʻshimchalar

Qoʻshimcha maʼlumotlari bilan loyihani saqlaganingizda (Qurilish qoidalari belgilari yoki Manzildan saytga manbasi), fayl qaysi qoʻshimchalar va qaysi versiyalar ekanligini qayd etadi. Uni qoʻshimcha yoʻq kompyuterda ochsangiz, reja ustidagi panel buni aytadi va uni hisobingizdagi roʻyxatdan qoʻshishni taklif qiladi. Bu yozuv faqat eslatma: fayl baribir ochiladi.

## Studio ichidan bekor qilish

Studio ichida CivilCraft da tugallagan har bir qadam Studio ga xabar qilinadi, shuning uchun uning loyiha darajasidagi bekor qilish oxirgi qadamni ilovalar boʻylab qaytara oladi. Studio qadamni faqat CivilCraft ning oʻz bekor qilish steki qadam tugagan holatda boʻlsagina bekor qiladi; boshqa fayl ochgandan keyin bu oyna uni oʻtkazib yuboradi.

## Saqlanmagan oʻzgarishlar bilan yopish

Loyihada saqlanmagan oʻzgarishlar boʻlganda yorliqni yopsangiz, qayta yuklasangiz yoki sahifadan chiqsangiz, brauzer chiqishni xohlaysizmi deb soraydi. Uning matni va koʻrinishi brauzerga tegishli va CivilCraft tomonidan oʻzgartirilmaydi. {{ui:Yangi}} va loyiha yoki LandXML faylini ochish esa CivilCraft ning oʻz **Saqlanmagan oʻzgarishlar** oynasida soraydi, unda {{ui:Bekor qilish}}, {{ui:Saqlamaslik}} va {{ui:Nusxasini saqlash}} tugmalari bor.
