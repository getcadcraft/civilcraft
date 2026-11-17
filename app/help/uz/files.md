---
title: Ochish, saqlash va eksport qilish mumkin boʻlgan fayllar
summary: Nuqta fayllari, LandXML va CivilCraft loyihalarini kiritish; loyihalar, LandXML, DXF va PDF ni chiqarish; har biri nimani saqlashi, fayllar qayerga borishi va oflayn rejimda nima oʻzgarishi.
keywords: ochish, saqlash, eksport, import, fayl formatlari, csv, txt, landxml, xml, dxf, pdf, json, yuklab olish, loyiha fayli
from: 82bff559
---

CivilCraft kompyuteringizdagi fayllarni ochadi va fayllarni yuklab olish orqali qaytarib saqlaydi. Hech narsa yuklanmaydi va serverda hech narsa saqlanmaydi. Shuningdek qarang: [Sizning fayllaringiz](common:your-files).

## Nimalarni ochadi

{{ui:Ochish}} ni bosing (yoki {{key:Mod+O}} ni bosing) va faylni tanlang, yoki faylni {{pick:mac=Finder|windows=File Explorer|linux=fayl menejeringiz}} dan rejaga torting. Bir vaqtda bitta fayl; 200 MB dan katta fayllar rad etiladi. 32 MB dan katta LandXML yoki loyiha fayli taxminan 4 MB li boʻlaklarda oʻqiladi, hech qachon bitta matn blokida emas. LandXML ochilayotganda u xotirada taxminan fayl hajmining 13 baravarini ishlatishi mumkin (sinovimizda 69 MB li fayl taxminan 0.9 GB ishlatdi).

| Tur | Fayl nomlari | Nima sodir boʻladi |
|---|---|---|
| Nuqta fayli | `.csv`, `.txt`, `.pnt`, `.xyz` (har qanday matn fayli) | **Nuqtalarni import qilish** dialogi ochiladi. Nuqtalar loyiha nuqtalarini almashtiradi; trassalar, platformalar va quvurlar qoladi. |
| LandXML | `.xml`, `.landxml` | Fayldan **yangi loyiha** yaratiladi (joriy loyihada saqlanmagan oʻzgarishlar boʻlsa, avval soʻraladi). |
| CivilCraft loyihasi | `.civilcraft.json` (har qanday `.json`) | Loyiha saqlangani kabi ochiladi (joriy loyihada saqlanmagan oʻzgarishlar boʻlsa, avval soʻraladi). |

CivilCraft faylni turini uning oxiri boʻyicha, soʻngra birinchi belgilari boʻyicha aniqlaydi: `{` bilan boshlanadigan matn loyiha sifatida, `<` bilan boshlanadigan matn LandXML sifatida, qolgani nuqta fayli sifatida oʻqiladi. Ochish oynasida xira koʻrinadigan fayl ham rejaga tashlanishi mumkin.

:::note
Nuqtalari bor loyihaga nuqta fayli import qilinsa, nuqtalar soʻramasdan almashtiriladi va bekor qilish tarixi tozalanadi (har qanday faylni ochish bekor qilish uchun yangi boshlanish). Sirt LandXML dan olingan boʻlsa, nuqtalarni import qilish uni yana nuqtalardan tuzilgan sirtga almashtiradi. Eski nuqtalar kerak boʻlishi mumkin boʻlsa, avval saqlang.
:::

Batafsil: [Nuqta fayli formatlari](topic:point-file-formats), [LandXML: nima oʻqiladi va yoziladi](topic:landxml-reference).

## Nimalarni saqlaydi

{{ui:Saqlash}} ({{key:Mod+S}}) ikkita faylni yonma-yon yozadi, ular chap paneldagi **Nomi** boʻyicha nomlanadi: `<name>.civilcraft.json`, ya'ni tahrirlashda davom etadigan loyiha, va `<name>.ifc`, ya'ni boshqalar uchun IFC 4.3 formatidagi oʻsha loyiha (qarang: [IFC eksport va import](topic:ifc)). Har bir fayl boshqasini qayd etadi. IFC shuningdek loyihaning siqilgan nusxasini oʻz ichiga oladi, shuning uchun alohida yuborilgan IFC ham toʻliq tahrirlanadigan holda qayta ochiladi.

- **Studio da** ikkala fayl bir-birining yonida, oʻz joyida yoziladi.
- **Chrome va Edge da** birinchi saqlashda papka soʻraladi va ikkalasini shu papkaga yozadi; keyingi saqlashlar xuddi shu papkaga boradi. Papka soʻrovida {{ui:Bekor qilish}} ni bossangiz, ikkalasi yuklab olinadi.
- **Boshqa brauzerlarda** ikkala fayl yuklab olinadi, avval loyiha fayli.

Ikkala faylni ochish ikkinchisini qidiradi. Ikkalasini birga oching (yoki ikkalasini tashlang), yoki bittasini oching: Studio da boshqasi bir papkada topiladi; brauzerda CivilCraft uni qoʻshishni soʻraydi yoki sizda bor bilan davom etishni taklif qiladi. Agar IFC CivilCraft saqlaganidan keyin boshqa dastur tomonidan oʻzgartirilgan boʻlsa yoki bir fayl ikkinchisidan eski boʻlsa, loyiha yangi loyihadan ochiladi va Muammolar paneli nima boʻlganini aytadi, **Hozir saqlash** (ikkala faylni qayta yozadi) va **IFC geometriyasini mos yozuv sifatida koʻrsatish** tugmalari bilan. Boshqa dastur oʻzgartirgan oʻz-oʻzidan IFC esa uning loyiha nusxasidan, mos keladigan narsalar bilan ochiladi: oʻzgartirilgan trassalar oʻz geometriyasini oladi, oʻchirilgan obyektlar chiqarib tashlanadi, qolgan oʻzgarishlar roʻyxatlanadi, lekin qabul qilinmaydi. 0.7.1 versiyasidan oldingi loyiha fayli avvalgidek ochiladi.

Loyiha fayli quyidagilarni saqlaydi:

- har bir nuqta (raqami, koordinatalari, balandligi, tavsifi) va ular olingan nuqta faylining nomi
- sirt sozlamalari: guruh tanlovlari, chizilgan sinish chiziqlari (breakline), chegara, eng uzun tashqi chekka va LandXML dan oʻqilgan TIN
- displey sozlamalari
- trassalar, ularning PI lari, radiuslari va boshlangʻich stansiyasi, ularning loyiha profillari (PVI lar va egri uzunliklari) va koridor sozlamalari
- platformalar va qoidalari bilan quvur tarmogʻi

Loyiha fayli bekor qilish tarixini saqlamaydi. Sirtlar, konturlar, kunduzgi chiziqlar va hajmlar saqlanmaydi; ular loyiha ochilganda saqlangan kiritmalardan qayta quriladi. Yangiroq CivilCraft dan olingan loyiha fayli uning versiyasini koʻrsatuvchi xabar bilan rad etiladi.

## Nimalarni eksport qiladi

| Tugma | Fayl | Mazmuni |
|---|---|---|
| {{ui:LandXML}} | `<name>.xml` | LandXML 1.2: nuqtalar, mavjud yer (va bor boʻlsa, loyihalangan sirt) TIN sirtlari sifatida, trassalar, yer va loyiha profillari, quvur tarmogʻi |
| {{ui:DXF}} | `<name>.dxf` | Rejaning koʻrsatilgan chiziqlari, nomlangan qatlamlarda, R12 DXF |
| {{ui:DWG}} | `<name>.dwg` | Oʻsha chiziqlar DWG chizmasi sifatida, siz tanlagan formatda (2000 dan 2018 gacha) |
| {{ui:PDF}} | `<name>.pdf` | Rejaning varaqdagi vektor chizmasi, siz tanlagan masshtabda |
| {{ui:GLB}} yoki {{ui:OBJ}} (3D koʻrinish panelida) | `<name>-3d.glb`, `<name>-3d.obj` | 3D koʻrinish 3D model sifatida koʻrsatadigan narsa: metrda, Y yuqoriga, haqiqiy masshtabda, yozib olingan mahalliy koordinata boshi atrofida |

Har biri nimani qoldirishi: [LandXML almashinuvi](topic:landxml), [Rejani DXF ga eksport qilish](topic:dxf-export) (DWG ham), [Rejani PDF ga chop etish](topic:plot-pdf), [Uchastkani 3D da eksport qilish](topic:export-3d).

## Fayllar qayerga boradi

Saqlangan va eksport qilingan fayllar brauzeringiz yuklab olishlarni joylashtiradigan joyga boradi, odatda Yuklab olishlar papkasiga. Har safar papka tanlash uchun:

:::chromium
Brauzerning **Sozlamalar** boʻlimini oching, soʻngra **Yuklab olishlar** ni va **Har bir faylni yuklashdan oldin qayerga saqlashni soʻrash** ni yoqing.
:::

:::firefox
**Sozlamalar** ni oching, soʻngra **Umumiy** ni va **Fayllar va ilovalar** ostida **Fayllarni qayerga saqlashni har doim soʻrash** ni tanlang.
:::

:::safari
**Safari > Sozlamalar > Umumiy** ni oching va **Fayl yuklab olish joyi** ni **Har bir yuklab olish uchun soʻrash** ga oʻrnating.
:::

Ikki marta bir xil nom bilan saqlasangiz, brauzer ikkinchi faylga raqam qoʻshishi mumkin, masalan `Site (1).civilcraft.json`. Keyingi safar eng yangisini oching.

## Onlayn va oflayn

CivilCraft ikkala holatda ham faqat kompyuteringizda ishlaydi: ochish faylni brauzerda oʻqiydi, saqlash uni yuklab oladi. CivilCraft ni umuman ulanishsiz ochish uchun avval uni oflayn foydalanish uchun saqlang:

1. Onlaynda turganda, ilova panelining yuqorisida {{ui:Oflayn uchun saqlash}} ni bosing.
2. Tugma sanab boradi ("12 dan 30 saqlanmoqda") va soʻngra {{ui:Oflayn tayyor}} ni koʻrsatadi. CivilCraft kichik (taxminan 0.6 MB), shuning uchun bu bir oz vaqt oladi. Saqlangan nusxaga ushbu yordam va namunaviy uchastka kiradi.
3. Ulanish boʻlmasa, xuddi shu manzilni (yoki unga xatcho'pni) oching. Hamma narsa ishlaydi, shu jumladan {{ui:Namunaviy saytni ochish}}.

Tugmaning boshqa holatlari:

- {{ui:Saqlab boʻlmadi}}: ba'zi fayllar yuklab olinmadi. Ulanishni tekshiring va qayta urinish uchun bosing.
- {{ui:Oflayn rejim mavjud emas}}: bu brauzer oynasi oflayn nusxani saqlay olmaydi (maxfiy oynalar va ayrim boshqariladigan kompyuterlar buni bloklaydi). Oddiy oynadan foydalaning.

{{ui:Oflayn tayyor}} ni bosing, nusxa qachon saqlanganini koʻrish uchun, ikkita tanlov bilan: {{ui:Qayta saqlash (eng yangi versiyani olish)}} va {{ui:Oflayn nusxani oʻchirish}}. Saytga chiqishdan oldin qayta saqlang, shunda nusxa eng yangi yigʻishga mos boʻladi. Batafsil: [Oflayn](common:offline).

:::offline
Siz hozir oflaynsiz. Agar CivilCraft oflayn foydalanish uchun saqlangan boʻlsa, hamma narsa, shu jumladan namunaviy sayt ham ishlaydi. Aks holda shu yorliqda ishlashda davom eting, lekin ulanish qaytmaguncha uni qayta yuklamang; saqlangan nusxa boʻlmasa, {{ui:Namunaviy saytni ochish}} "Namunani yuklab boʻlmadi" xabari bilan muvaffaqiyatsiz tugaydi.
:::

:::tip
Dalada foydalanish uchun CivilCraft ni oflayn foydalanish uchun saqlang va nuqta fayllaringizni noutbukning oʻzida olib keling. Loyihalar va eksportlar ulanishsiz yuklab olish sifatida saqlanadi, shuning uchun kunlik oʻlchovlarni import qilib, sirtni tekshirishingiz va loyihani dalada saqlashingiz mumkin.
:::

Bulutli saqlash hali mavjud emas, desktop versiyalari esa hali chiqmagan. Hozircha siz saqlagan fayllar yagona nusxa: ularni zaxiralanadigan joyda saqlang.

## Fayl ishlatadigan qoʻshimchalar

Qoʻshimcha maʼlumotlar (Bino me'yorlari belgilari yoki Manzildan uchastkagacha manbasi) bilan loyihani saqlaganingizda, fayl qaysi qoʻshimchalar va qaysi versiyalar ekanini qayd etadi. Uni bunday qoʻshimchasi yoʻq kompyuterda ochsangiz, reja ustidagi panel buni aytadi va uni hisobingizdagi roʻyxatdan qoʻshishni taklif qiladi. Bu qayd faqat eslatma; fayl baribir ochiladi.

## Studio dan bekor qilish

CadCraft Studio ichida CivilCraft da tugatgan har bir qadam Studio ga aytiladi, shuning uchun uning loyiha darajasidagi bekor qilish funksiyasi ilovalar boʻylab soʻnggi qadamni qaytarishi mumkin. Studio qadamni faqat CivilCraft ning oʻz bekor qilish steki oʻsha qadam qoldirgan holatda boʻlganda qaytaradi. Boshqa faylni ochganingizdan keyin bu oyna oʻtkazib yuboriladi.

## Saqlanmagan oʻzgarishlar bilan yopish

Loyihada saqlanmagan oʻzgarishlar boʻlganda va siz yorliqni yopsangiz, qayta yuklasangiz yoki sahifadan chiqsangiz, brauzer chiqishni xohlaysizmi deb soʻraydi. Uning matni va koʻrinishi brauzerga tegishli, CivilCraft uni oʻzgartira olmaydi. {{ui:Yangi}} va loyiha yoki LandXML faylini ochish esa buning oʻrniga CivilCraft ning oʻz **Saqlanmagan oʻzgarishlar** oynasida soʻraydi, unda {{ui:Bekor qilish}}, {{ui:Saqlamaslik}} va {{ui:Nusxasini saqlash}} tugmalari bor.
