---
title: Boshqa qurilish dasturlaridan oʻtish
summary: Tanish qurilish loyihalash ish oqimlari CivilCraftga qanday mos kelishi va tajribali foydalanuvchilarni birinchi soatda chalgʻitadigan farqlar.
keywords: oʻtish, koʻchirish, tanish, farqlar, ish oqimi, buyruqlar, xaritalash, cogo, koridor, tekislash, quvur tarmogʻi, uslublar, buyruq qatori
from: feae37d6
---

Agar Civil 3D dan foydalangan boʻlsangiz, CivilCraftdagi gʻoyalarni allaqachon bilasiz: nuqtalar va nuqtalar guruhlari, uzilish chiziqlari va chegaralarli TIN sirtlar, PI boʻyicha trassalar, PVI boʻyicha profillar, koridorlarga yigʻilgan yigʻmalar, yer bilan tekislash, gravitatsion quvur tarmoqlari, LandXML. Farqi ularning atrofidagi deyarli hamma narsada: chizma fayli yoʻq, buyruq qatori yoʻq (agar {{ui:Klassik chizmachilik}} menyu uslubini tanlamasangiz), uslublar yoʻq, Prospector yoʻq va sozlamalar dialoglari yoʻq. CivilCraft brauzerdagi kichik, aniq yoʻnaltirilgan asbob, va bu versiyada toʻliq qurilish paketi qiladigan ishning bir qismini bajaradi. Bu sahifa siz bilganlarni bu yerda nima borligiga xaritalaydi.

:::tip
Agar Civil 3D lentasini yoqtirsangiz, {{ui:Sozlamalar}} › {{ui:CivilCraft}} › {{ui:Menyular, tugmalar va sichqoncha}} boʻlimidan {{ui:Qurilish lentasi}} menyu uslubini tanlang: Bosh, Sirtlar, Oʻzgartirish, Geolokatsiya, Koʻrinish va Chiqish yorliqlari, oʻrta tugma suradi, va {{key:Shift}} bilan oʻrta tugma 3D koʻrinishni aylantiradi. Agar buyruqlarni yozsangiz, {{ui:Klassik chizmachilik}} buyruq qatorini qoʻshadi (ALIGNMENT, PAD, PROFILE, ZOOM …). Qarang: [Menyular, tugmalar va sichqoncha](topic:menus-keys-and-mouse).
:::

## Ish oqimi xaritasi

| Nima qilmoqchisiz | Tanish usul | CivilCraftda |
|---|---|---|
| Geodezik nuqtalarni olib kirish | Nuqta fayl formati bilan nuqtalarni import qilish | {{ui:Ochish}}, keyin **Nuqtalarni import qilish** da ustunlar tartibini tekshiring ([Geodezik nuqtalarni import qilish](topic:import-points)) |
| Nuqtalarni saralash | Nuqtalar guruhlari, tavsif kalitlari | Tavsifning birinchi soʻzi boʻyicha avtomatik guruhlar; tavsif kalitlari yoʻq |
| Nuqtani tahrirlash | Nuqta muharriri, tutqichlar | Uni bosing va Xossalarda yozing, yoki sudrang ([Geodezik nuqtani tahrirlash](topic:edit-points)) |
| Mavjud yerni qurish | Sirt yaratish, nuqtalar guruhlarini maʼlumot sifatida qoʻshish | Avtomatik: kiritish oʻzgarganda sirt qayta quriladi |
| Uzilish chiziqlarini qoʻshish | Polichiziqlar yoki xususiyat chiziqlaridan uzilish chiziqlarini qoʻshish | Nuqtalar guruhini {{ui:Sinuvchi chiziq}} ga oʻrnating, yoki {{ui:Sinuvchi chiziq}} asbobi bilan nuqtalarni bosing ({{key:B}}) |
| Sirtni kesish | Tashqi chegara, yashirin chegara, uchburchakning maksimal uzunligi | {{ui:Chegara}} ({{key:O}}, faqat tashqi) va **Eng uzun tashqi chekka** |
| Konturlarni koʻrsatish | Sirt uslubi | Chap panelda **Koʻrsatish**: oraliq, asosiy har, yorliqlar, polosalar, nishab strelkalari |
| Oʻq chiziqni tuzish | Trassa yaratish asboblari, egri va spiral sozlamalari | {{ui:Trassa}} ({{key:A}}): PI larni bosing, {{key:Enter}}; radiuslar va spiral uzunliklari PI jadvalida |
| Profil koʻrinishini yaratish | Profil koʻrinishi ustasi, polosalar | {{ui:Profil}} ({{key:R}}): plan ostida bitta profil koʻrinishi, doim moslashtirilgan |
| Nishablikni loyihalash | Profil joylashtirish asboblari | {{ui:Yer yuzasidan boshlash}}, {{ui:PVI qoʻshish}} ({{key:I}}), PVI larni sudrang, **Curve L** ni yozing |
| Yoʻl qurish | Yigʻma, quyi yigʻmalar, koridor, maqsadlar, mintaqalar | Trassa ostida **Yigʻmani loyiha profili boʻylab surish** ni belgilang; har ikki tomonda qatnov qismi, yelka va yon nishab, yoki har ikki tomon qismlardan (ariq, bordyur, trotuar …) |
| Maydonchani tekislash | Xususiyat chiziqlari, tekislash guruhlari, tekislash mezonlari | {{ui:Maydoncha}} ({{key:G}}): kesish va toʻldirish nishablari bilan tekis maydoncha, yer bilan tutashguncha |
| Yer ishlarini hisoblash | Hajm sirtlari, hajmlar paneli | Oʻng panelda **Yer ishlari**, toʻr usuli, jonli yangilanadi |
| Yomgʻir yoki kanalizatsiya tarmogʻini loyihalash | Qismlar roʻyxati bilan quvur tarmogʻi, qoidalar | {{ui:Quvurlar}} ({{key:P}}): oqim tomonidagi inshootlarni bosing; oʻzingiz belgilagan uchta qoida; avtomatik pastki sathlar |
| Boshqalar bilan almashish | LandXML import va eksport | LandXML faylini {{ui:Ochish}}; eksport uchun {{ui:LandXML}} ([LandXML almashish](topic:landxml)) |
| Chiziqlarni CADga yuborish | DWG ga eksport | {{ui:DWG}} (2000 dan 2018 gacha format) yoki {{ui:DXF}} (R12) |
| Chop etish | Maketlar, koʻrish oynalari, varaq toʻplamlari | {{ui:PDF}}: tanlangan masshtabda planning bitta gorizontal varaqi; plan va profil varaqlari hamda kesim varaqlari PDF sifatida |
| Fayllar orasida ish ulashish | Maʼlumot yorliqlari, havolalar | Mavjud emas: har bir faylda bitta loyiha |
| Ortga qaytarish | Ortga qaytarish | {{key:Mod+Z}} va {{key:Mod+Y}}, 200 qadam; koʻrsatish sozlamalari bekor qilish qadamlari emas |

## Odamlarni chalgʻitadigan farqlar

**Buyruq qatori yoʻq**, agar {{ui:Klassik chizmachilik}} menyu uslubini tanlamasangiz. Asboblar asboblar paneli tugmalari va yakka harflar: {{key:A}} trassa, {{key:G}} maydoncha, {{key:P}} quvurlar, {{key:B}} uzilish chizigʻi, {{key:O}} chegara, {{key:R}} profil, {{key:I}} PVI qoʻshish, {{key:V}} tanlash, {{key:F}} moslash. Boshqa menyu uslublarida buyruq nomini yozish hech narsa qilmaydi. Qarang: [Tugmalar va sichqoncha](topic:keyboard).

**Enter yakunlaydi; ikki marta bosish xavfli.** Oxirgi nuqtani bir marta bosing, keyin {{key:Enter}} ni bosing. Bu versiyada ikki marta bosish ham yakunlaydi, lekin ikki marta bosgan nuqtani tashlaydi. Oʻng tugma yakunlamaydi va takrorlamaydi; u faqat sudrash bilan koʻrinishni suradi.

**Hamma narsa doim dinamik.** Nuqtalar guruhini, radiusni, PVI yoki maydoncha nishabini oʻzgartiring — sirt, konturlar, koridor, yorugʻlik chiziqlari va hajmlar darhol yangilanadi. Qayta qurish yoʻq va hech narsa eskirmaydi.

**Hech narsa chizma obyekti emas.** Plan — loyihaning koʻrinishi, CAD buyruqlari bilan tahrir qilinadigan chizma emas. Oʻz chiziqlaringiz yoki matningizni qoʻsha olmaysiz, qatlam rangini oʻzgartira olmaysiz yoki hech narsani portlata olmaysiz. DXF ga eksport qiling va chizmani CAD dasturida tugating.

**Uslublar yoʻq.** Ranglar, chiziq qalinliklari, yorliq oʻlchamlari va qatlam nomlari qat'iy (qarang: [Plan qatlamlari](topic:plan-layers)). Ilova panelidagi Paper va Model esa yorugʻ va qorongʻi ekran oʻrtasida almashtiradi.

**Birdan bittadan.** Bitta mavjud yer sirti, bitta tekislangan natija va bitta quvur tarmogʻi har bir loyihada. Koʻp trassa va maydonchalar yaxshi.

**Birliklar faqat yorliq.** {{ui:AQSh futi}} yoki {{ui:Metrlar}} ni tanlash hech narsani aylantirmaydi. Masshtab yoʻq. Koordinatalar tizimi ixtiyoriy: uni {{ui:Koordinatalar}} ostida oʻrnating va hech narsa siljimaydi, faqat raqamlarning nimani anglatishini aytadi (qarang: [Loyiha koordinatalar tizimini oʻrnatish](topic:coordinate-systems)). Futlar LandXML ga yozilganda AQSh sirt futi sifatida qaraladi.

**Pikketlar bir xil koʻrinadi, metrlar farq qiladi.** Futlar 100 ft pikketlardan foydalanadi (12+34.56); metrlar 1000 m pikketlardan foydalanadi (1+234.567).

**Mac da oʻchirish.** Mac klaviaturasida delete deb belgilangan tugma brauzerda Backspace. Tanlovni oʻchirish uchun Fn va delete dan yoki {{ui:Oʻchirish}} tugmasidan foydalaning.

**Fayllar yuklab olinadi.** {{ui:Saqlash}} har safar `.civilcraft.json` faylni yuklab oladi; ochiq faylni "ustidan saqlash" yoʻq. Saqlanmagan ishning tiklash nusxasi shu brauzerda saqlanadi ([Saqlanmagan ishni tiklash](common:recover)). Nuqta faylini ochish nuqtalarni soʻramasdan almashtiradi. Qarang: [Ochish, saqlash va eksport qilish mumkin boʻlgan fayllar](topic:files).

**Qoidalar sizniki.** Quvur tarmogʻi qoidalari va koridor yigʻmasi standart boʻlmagan vaqtinchalik qiymatlar bilan boshlanadi. Har qanday tekshiruvga ishonishdan oldin oʻzingiz oʻrnating.

**Hajmlar toʻrga asoslangan.** Yer kesish va toʻldirish ikki sirt orasida yorugʻlik chiziqlari ichida nozik toʻr boʻylab hisoblanadi, shishish yoki qisqarishsiz. Ular TIN-dan-TIN hajmiga yaqin, lekin bir xil emas.

## Yoʻq narsalar

Klotoiddan boshqa spirallar, yoʻl boʻylab oʻzgaradigan yigʻmalar, nishabli maydonchalar, kirish sigʻimi va suv ushlash havzalari, qismlar katalogi, profildagi quvurlar, uchastka joylashuvi va lot oʻlchami, eng kichik kvadratlar usulida tuzatish va geodezik maʼlumotlar bazalari, DWG ni ochish va boshqalar. Toʻliq roʻyxat, bugungi kunda oʻrniga nima qilish kerakligi bilan, [Hali qurilmagan](topic:not-built-yet) da.
