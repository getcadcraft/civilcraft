---
title: Temir yoʻl loyihalash
summary: Trassani temir yoʻlga aylantiring: relslar oʻtishi (klotoida, kubik parabola, Bloss, Helmert, sinus yarim toʻlqini, sinus), har bir egri chiziqdagi qiyalik va uning muvozanat qiyaligi, yetishmovchilik va ortiqcha qiyalik, ogohlantirish sifatida qiyalik va yoʻl geometriyasi chegaralari, stansiyalar boʻyicha strelkalar va kesishmalar, boʻylab surilgan tozalash konverti, relslar, shpallar va shagʻal yostigʻi bilan qurilgan yoʻl — koridor sifatida reja, kesimlar, profil, 3D va hajmlarda.
keywords: temir yoʻl, rels, temir yoʻl, yoʻl, poyezd, metro, tramvay, qiyalik, superelevatsiya, qiyalik yetishmovchiligi, qiyalik ortiqchaligi, muvozanat qiyaligi, oʻtish, oʻtish egri chizigʻi, klotoida, kubik parabola, bloss, helmert, sinus yarim toʻlqini, kosinus, izkenglik, standart izkenglik, keng izkenglik, metrli izkenglik, tor izkenglik, shpal, shpal, shagʻal, ostki shagʻal, poyi, tozalash zonasi, yoʻl markazlari, 60E1, 54E1, UIC60, 115RE, 136RE, qiyalik gradienti, qiyalik oʻzgarish tezligi, strelka, strelka, krestovina, krestovina raqami, yetaklash, yopiluvchi egri chiziq, ajralish tezligi, tozalash, tozalash konverti, konstruktiv gabarit, kinematik konvert, peron, peron oraligʻi, yoʻl oraligʻi, gradient, vertikal egri chiziq, minimal radius, LandXML qiyaligi
from: 99de9745
---

Har qanday trassa temir yoʻl yoʻli boʻlishi mumkin. Uning egri chiziqlariga relslar oʻtishi va qiyalik (relslarning koʻtarilishi) beriladi, uning koridori esa yoʻl sifatida quriladi: shagʻal yostigʻi ustidagi shpallarga yotqizilgan relslar, xuddi avtomobil yoʻli kabi yer bilan tekislanadi. Strelkalar va kesishmalar stansiyalar boʻyicha joylanadi; boʻylab surilgan tozalash konverti chizilib, yoʻl yonidagi narsalar bilan tekshirilishi mumkin.

Quyidagi har bir raqam **vaqtinchalik qiymat**, standart emas. Temir yoʻllar chegaralarni liniya tezligi, yoʻl turi va mamlakatga qarab belgilaydi; ularni oʻz temir yoʻlingizning standartidan oʻrnating. CivilCraft hech qanday milliy jadval bilan kelmaydi.

## Trassani temir yoʻlga aylantirish

1. Trassani tanlang va **Xossalar** ichidan **Temir yoʻl** boʻlimini toping.
2. **Bu trassa temir yoʻl yoʻli** ni belgilang. Har bir oʻzgarish bitta ortga qaytarish qadamidir.
3. Trassa xossalarining yuqori qismida **Loyiha tezligi** ni belgilang: bu qiyalik tekshiriladigan liniya tezligi. **Eng sekin poyezdlar** (Temir yoʻl blokida) esa qiyalik ortiqchaligi tekshiriladigan tezlik.

## Oʻtishlar

Har bir egri chiziqqa PI jadvalida ikki uchidan spiral uzunligini kiriting (**Kirish spirali**, **Chiqish spirali**), soʻng Temir yoʻl blokidagi egri chiziqlar jadvalidan turini tanlang yoki **Har bir egri uchun oʻtish** ni tanlang:

| Turi | Oʻtish boʻylab egrilik |
|---|---|
| Klotoida | tekis oshadi (avtomobil yoʻli spirali) |
| Kubik parabola | y = x³ / (6·R·L), L urinma boʻylab oʻlchanadi; egri chiziqning oʻzi biroz uzunroq |
| Bloss | toʻliq egrilikning 3u² − 2u³ qismi (u = uzunlik ulushi): yumshoq boshlanadi va tugaydi |
| Helmert | ikki parabola: avval 2u², soʻng 1 − 2(1 − u)² |
| Sinus yarim toʻlqini | (1 − cos πu) / 2 |
| Sinus | u − sin(2πu) / 2π |

Kubik paraboladan tashqari barchasi klotoida kabi L / 2R burchakka buriladi. Stansiyalar haqiqiy uzunlik boʻylab boradi. LandXML turni saqlaydi (spiType clothoid, cubicParabola, bloss, biquadratic, cosine, sinusoid).

## Qiyalik

Har bir egri chiziqning **Qiyaligi** ni millimetrda kiriting. Jadvalda har bir egri uchun quyidagilar koʻrsatiladi:

- **Muvozanat** qiyaligi = G·v² / (g·R), bunda G — relslar markazlari orasidagi masofa (**Relslar markazlari**: izkenglik va rels boshi kengligi yigʻindisi, agar siz oʻzingiz kiritmasangiz). G = 1500 mm boʻlganda bu tanish 11.8·V² / R (V — km/soat, R — m) koʻrinishga ega boʻladi.
- **Yetishmovchilik** = liniya tezligidagi muvozanat qiyaligi − qoʻllanilgan qiyalik.
- **Ortiqcha** = qoʻllanilgan qiyalik − eng sekin poyezdlar tezligidagi muvozanat qiyaligi.
- **Pandus**: uning pandusları boʻylab eng tik qiyalik gradienti, mm/m hisobida.

Qiyalik har bir oʻtish boʻylab egrilikka mos shaklda oshadi: klotoida yoki kubik parabola uchun toʻgʻri chiziq boʻylab, Bloss uchun Bloss shaklida va hokazo. Oʻtishsiz egri chiziq uchi oldingi toʻgʻri chiziqda, qiyalik gradienti chegarasi talab qilgancha pandus hosil qiladi va buni koʻrsatadi: bunda qiyalik egrilik oʻzgarmaydigan joyda oʻzgaradi.

**Qiyalik aylanish oʻqi** qaysi rels loyiha profilida qolishini koʻrsatadi: **past rels** (odatdagisi), **ichki rels** yoki **yoʻl markazi** (har bir rels qiyalikning yarmiga siljiydi). Loyiha profili shu yerda relsning ustki qismidir.

**Qiyalik diagrammasi** har bir relsning balandligini stansiyalar boʻylab profil ustida chizadi; profil koʻrinishi va reja hamda profil varaqlari buni profil ostida lenta sifatida koʻrsatadi.

## Qiyalik chegaralari va ogohlantirishlar

Har bir egri chiziqda **Eng katta qoʻllanilgan qiyalik**, **Eng katta qiyalik yetishmovchiligi**, **Eng katta qiyalik ortiqchaligi**, **Eng tik qiyalik gradienti** va **Qiyalikning eng tez oʻzgarishi** (liniya tezligidagi gradient, mm/s) tekshiriladi. Chegaradan oshgan qiymat Temir yoʻl blokida va **Muammolar** panelida, chegara va topilgan qiymat bilan birga ogohlantirish boʻladi. Loyiha tezligi kiritilmagan boʻlsa, yetishmovchilik va oʻzgarish tezligi tekshirilmaydi (bu haqda izoh beriladi).

## Yoʻl

Belgilang: **Izkenglik** (standart 1435 mm, keng, metrli yoki tor oldindan sozlamalar yoki oʻzingizniki), **Rels kesimi** (60E1, 54E1, 49E1, 115RE, 136RE: faqat ularning eʼlon qilingan oʻlchamlari), **Yoʻllar** soni va ularning **Yoʻl markazlari** oraligʻi; soʻng **Shpallar va shagʻal**: shpal materiali, uzunligi, kengligi, qalinligi va oraligʻi; shpal ostidagi shagʻal qalinligi (past relsda), yelka, qiyalik, uning ustki qismining shpallar ostidan qanchaga pastda joylashuvi; ostki shagʻal qalinligi, shagʻal etagi ortidagi tozalash zonasi va yoʻl poyining koʻndalang qiyaligi.

**Yoʻlni qurish** tugmasini bosing. U trassa koridorini loyiha profili boʻylab yoʻl sifatida quradi: relslar va shpallar qiyalik bilan ogʻadi, yoʻl poyi esa ogʻmaydi. Kesma va toʻldirma qiyaliklaridagi ochiq yer qiyaliklari koridorning tozalash chetidan boshlanadi, yoʻl esa avtomobil yoʻli kabi taklif etilgan yuzaga tekislanadi.

- **Reja**: har bir yoʻlning ikkala rels (qatlam C-RAIL-TRAK) va bir necha yoʻl boʻlganda har bir yoʻl markazi (C-RAIL-CNTR); ekranda, DXF, DWG, PDF va reja hamda profil varaqlarida.
- **Kesimlar**: har bir kesimda shpallar, relslar, shagʻal va ostki shagʻal pastki qismlari.
- **3D**: relslar, har bir shpal va shagʻal yostigʻi (Koʻrsatish › Yoʻl), shuningdek GLB, OBJ va USD formatlarida.
- **Miqdorlar**: yoʻl uzunligi, relslar (har bir yoʻlning ikkala rels, har bir yoʻl oʻz chizigʻi boʻylab), shpallar, shagʻal yostigʻi va shpallarsiz shagʻal, hamda ostki shagʻal — kesimlar orasidagi oʻrtacha uchki maydonlar boʻyicha.

## Yoʻl geometriyasini tekshirish

Qiyaliktan tashqari, Temir yoʻl blokida liniyaning oʻzi yana oltita chegara boʻyicha tekshiriladi (barchasi vaqtinchalik qiymat, barchasini siz belgilaysiz):

- **Loyiha profilining eng tik gradienti**, mm/m hisobida.
- **Vertikal egri chiziqning eng kichik radiusi**, k koeffitsiyenti sifatida R ≥ k·V² (R — metrda, V — km/soatda). Ikki gradient orasidagi L uzunlikdagi parabolik vertikal egri chiziqning radiusi L ni gradient oʻzgarishiga boʻlganiga teng.
- **Eng qisqa vertikal egri chiziq**.
- **Reja boʻyicha eng kichik egri chiziq radiusi** (0 boʻlsa, tekshiruv oʻchiriladi).
- **Eng qisqa yoy yoki toʻgʻri chiziq**, liniya tezligida harakat sekundlari hisobida: bu masofadan qisqa aylana yoy yoki ikki egri orasidagi toʻgʻri chiziq ogohlantiriladi. 1.8 s tanish qoida: km/soatdagi tezlikning yarmi metrda.
- Har bir oʻtish boʻylab **qiyalik yetishmovchiligining oʻzgarish tezligi**, liniya tezligida mm/s hisobida.

**Yoʻl geometriyasi** topilgan eng tik gradientni va har bir vertikal egri chiziqni, uning radiusi va liniya tezligi talab qilgan radius bilan birga koʻrsatadi. Oʻtish yoki qiyalik pandusida yotgan vertikal egri chiziq izoh oladi. Loyiha profili yoki loyiha tezligi boʻlmasa, ularni talab qiluvchi tekshiruvlar oʻtkazib yuboriladi va bu haqda izoh beriladi.

## Strelkalar va kesishmalar

**Strelkalar va kesishmalar** boʻlimida **Strelka qoʻshish** tugmasini bosing. U eng uzun toʻgʻri chiziqqa joylashtiriladi; jadvalda belgilang:

- **Strelka uchi stansiyasi**: strelka bu trassada qayerdan boshlanishi.
- **Krestovina**: krestovina raqami N (1:N). Krestovina burchagi 2·atan(1 / 2N).
- **Tomon**: chap yoki oʻng, stansiya raqami ortib borish tomonga qarab.
- **Kesishma oraligʻi** metrda: 0 dan katta boʻlsa, strelka shuncha masofadagi parallel yoʻlga kesishmaga aylanadi (ikkita strelka va ular orasidagi toʻgʻri chiziq).

Jadvalda **Yetaklash** (strelka uchidan krestovinagacha), yopiluvchi egri chiziqning **Radiusi** va shu radius qiyalik yetishmovchiligi chegarasi bilan hech qanday qiyalikka ega boʻlmasa ruxsat beradigan **Ajralish tezligi** koʻrsatiladi. **Yoʻlini yasash** ajralish yoʻnalishini oʻz trassasiga aylantiradi (strelka, yopiluvchi egri chiziq, soʻng krestovina burchagida toʻgʻri davom etadi), bir xil temir yoʻl sozlamalari bilan, uzaytirishga tayyor holda.

Reja har bir strelkaning ikkita ajraluvchi relsini, oʻq chizigʻini, strelka uchi va krestovinadagi belgilarni hamda "1:N" yozuvini (qatlam C-RAIL-TURN) ekranda, DXF, DWG, PDF va varaqlarda chizadi. 3D koʻrinishda ajraluvchi relslar asosiy yoʻl sathida chiziladi.

Shakl **vaqtinchalik**: toʻgʻri strelka va krestovina raqamidan kelib chiqqan bitta yopiluvchi egri chiziq. Qurilgan strelka temir yoʻl standarti va ishlab chiqaruvchi chizmasiga amal qiladi. Ogohlantirishlar: strelka trassadan chiqib ketsa, egri chiziq, oʻtish, qiyalik yoki vertikal egri chiziqda yotsa, yoki boshqa strelka bilan ustma-ust tushsa; va liniya tezligi uning ajralish tezligidan yuqori boʻlganda izoh.

## Tozalash konverti

**Bu yoʻl boʻylab tozalash konvertini surish** ni belgilang. **Kontur** ni tanlang (ikkita vaqtinchalik shakl yoki **Oʻz konturim**, bu har bir qatorda bitta nuqta: yoʻl markazidan siljish, soʻng rels ustidan balandlik, metrda), **Transport vositasi uzunligi** va **Tayanch markazlari** ni, va bor boʻlsa, **Peron chekkasi** ni (tomoni, yoʻl markazidan masofa, relsdan balandlik).

Har bir stansiyada kontur past rels atrofida qiyalik bilan ogʻdiriladi va egri chiziq tufayli kengaytiriladi: transport vositasining oʻrtasi b² / 8R ga ichkariga, uchlari (L² − b²) / 8R ga tashqariga siljiydi (b — tayanch markazlari, L — transport vositasi uzunligi, R — shu yerdagi radius, oʻtishni kuzatib). Blok kesimni toʻgʻri chiziqda va eng keng joyida chizadi hamda quyidagilarni koʻrsatadi:

- **eng keng konvert** va u qayerda,
- **yoʻl markazlari** qoʻshni ikki konvert talab qiladigan markazlar bilan solishtirilgan holda,
- **peron chekkasida** qolgan joy yoki u qanchaga ichkarida ekani,
- **konvert ichida** topilgan har bir obyekt chizigʻi, quvur inshooti va boshqa temir yoʻl trassasi.

Balandlikka ega obyekt chizigʻi relsdan balandligida kontur bilan solishtiriladi; loyiha profilisiz yoki balandligi yoʻq nuqta uchun u faqat reja boʻyicha baholanadi va roʻyxatda shu aytiladi. Reja konvertning ikki chetini (qatlam C-RAIL-CLRN) va ichidagi har bir narsa ustida krest bilan koʻrsatadi.

Taklif etilgan konturlar **vaqtinchalik shakllar, hech qanday temir yoʻlning izkengligi emas**. Natijaga tayanishdan oldin temir yoʻlingizning konstruktiv gabaritini kiriting.

## Boshqa dasturlarda

- **LandXML**: temir yoʻl trassasi oʻz oʻtishlari (spiType) va `Cant` blokı bilan yoziladi: izkenglik, aylanish nuqtasi, liniya tezligi va har bir qiyalik pandusining boshlanish va tugash stansiyasi, qoʻllanilgan qiyalik, muvozanat qiyaligi va yetishmovchilik bilan. `Cant` blokli LandXML faylini ochish trassani shu qiyaliklar bilan temir yoʻlga aylantiradi.
- **IFC**: trassa, uning qiyalik segmentlari, relslar, shpallar, shagʻal va ostki shagʻal bilan.

## Hali qurilmagan

IFC eksportidagi strelkalar; yagona yopiluvchi egri chiziqdan tashqari strelka turlari (egri strelkalar, buriluvchi krestovinalar, sirpanma kesishmalar, romb kesishmalar); kinematik gabarit qoidalari (konvert egri chiziq siljishi bilan belgilangan kontur); havo liniyalari va signalizatsiya.

**Qaysi standart.** Temir yoʻl blokida "Keltiriladigan standart" None yoki European (UIC va EN) boʻlishi mumkin. European tanlanganda Yevropa loyihasi keltiradigan hujjatlar koʻrsatiladi (trassa parametrlari uchun EN 13803, strelkalar va kesishmalar uchun EN 13232, izkenglik uchun EN 15273, yoʻl geometriyasi sifati uchun EN 13848) va har bir chegara uchun u olingan bandni yozish maydoni beriladi. Hech qanday standartdan raqam oʻrnatilmagan: qiyalik, yetishmovchilik, ortiqcha, gradient va tezlik chegaralari, strelka geometriyasi va konstruktiv gabarit hali ham vaqtinchalik qiymatlar, oyna shuni aytadi. Temir yoʻl muhandisi har bir qiymatni standartning oʻz matni bilan tekshirishi va yonida bandni yozishi kerak, hech narsa qurilishdan oldin. Janubiy Afrika va AREMA jadvallari bu versiyada yoʻq.
