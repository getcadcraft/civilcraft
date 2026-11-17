---
title: Gorizontallar, balandliklar va nishablarni oʻqish
summary: Gorizontallar oraligʻini va asosiy gorizontallarni belgilang, balandlik zonalarini, nishablik strelkalarini va uchburchaklarni koʻrsating hamda koʻrsatkich ostidagi yer balandliklarini oʻqing.
keywords: gorizontallar, gorizontal oraliq, asosiy gorizontallar, yozuvlar, balandlik zonalari, nishablik strelkalari, uchburchaklar, nuqta balandligi, yuza tahlili, balandlik tahlili, nishab tahlili
from: 585e500a
---

Yuza mavjud boʻlishi bilanoq u gorizontallar bilan koʻrsatiladi. Ushbu mavzudagi hamma narsa chap panelda **Koʻrsatish** boʻlimida sozlanadi. Koʻrsatish sozlamalari faqat koʻrinishni (va eksport qilinadigan narsani) oʻzgartiradi; ular ortga qaytarish qadamlari emas.

## Gorizontal oraliqni belgilash

1. **Koʻrsatish** boʻlimida **Gorizontallar qadami** maydonidan qiymat tanlang.
   - Futda: 0.25, 0.5, 1, 2, 5, 10 yoki 20 ft.
   - Metrda: 0.1, 0.25, 0.5, 1, 2, 5 yoki 10 m.
2. **Asosiy qadam** maydonidan tanlang: 2-, 4-, 5- yoki 10-gorizontal.
   Asosiy gorizontallar qalinroq chiziladi va ularga balandligi yozib qoʻyiladi. Ular asosiy qadamning butun karralarida joylashadi (1 ft gorizontallar va har 5-asosiy bilan: 245, 250, 255 …).
3. Yozuvlar kichik reja maydonini toʻldirsa, {{ui:Kontur yozuvlari}} ni oʻchiring.

Yangi loyiha 1 birlik bilan boshlanadi va har 5-gorizontal asosiy boʻladi. Gorizontallar uzilish chiziqlarida egiladi; agar ular oqim chizigʻi yoki tizmani toʻgʻri kesib oʻtsa, bu chiziq hali uzilish chizigʻi emas (qarang: [Yuzani qurish va aniqlashtirish](topic:build-surface)).

:::note
Gorizontallar faqat eng past va eng baland nuqta orasida 2,000 tadan koʻp sath boʻlmaganda chiziladi. Balandlik farqi katta va oraligʻi juda kichik boʻlgan joyda reja umuman gorizontal koʻrsatmaydi: kattaroq oraliq tanlang.
:::

## Gorizontallarni silliqlash

Gorizontallar yuzaning har bir uchburchagi boʻylab bitta toʻgʻri boʻlakcha sifatida chiziladi, shuning uchun ular har bir uchburchak chetida kichik burchak hosil qiladi. **Koʻrsatish** ostidagi **Gorizontallarni silliqlash** bu burchaklarni yumaloqlaydi:

- **Yoʻq (toʻgʻri boʻlaklar)**: chizilgan chiziqlar aynan shunday. Yangi yoki eskiroq chizma shuni koʻrsatadi.
- **Yengil**: burchaklar biroz yumaloqlanadi. Chiziq keyingi gorizontal tomon yoʻlning 10% dan koʻpini bosib oʻtmaydi va oʻz toʻgʻri boʻlagidan shu boʻlak uzunligining oltidan bir qismidan uzoqlashmaydi.
- **Kuchli**: silliq egri chiziq. Chiziq keyingi gorizontal tomon yoʻlning 25% dan koʻpini bosib oʻtmaydi va toʻgʻri boʻlagidan uchdan bir qismidan uzoqlashmaydi.

Ikkala tanlovda ham silliqlangan gorizontal har bir uchburchak chetini chizilgan gorizontal bilan bir nuqtada kesadi, har bir boʻlak kesib oʻtadigan uchburchak ichida qoladi va shuning uchun boshqa gorizontal bilan hech qachon kesishmaydi yoki tegmaydi. Uzilish chizigʻi yoki chegara bilan kesishgan joyda u oʻtkir burchagini saqlaydi. Silliqlangan chiziqlar rejaga chiziladi va eksport qilinadi (DXF, DWG, PDF, GIS va 3D), chizilgan chiziqlarga qaraganda koʻproq uchga ega.

Silliqlash faqat chizilgan chiziqlarni oʻzgartiradi. Balandliklar, hajmlar, profillar va kesimlar hali ham yuzaning oʻzidan oʻqiladi. Aniq geodezik nuqtalardan oʻtadigan gorizontal (masalan, 250.00 gorizontalidagi 250.00 nuqta) bunday har bir nuqtada kichik burchakni saqlaydi.

## Gorizontallar ortidagi yuza qanday yaratiladi

Gorizontallar yuzaga ergashadi, yuza esa chap paneldagi **Yuza** boʻlimidagi **Gorizontallash usuli** ga ergashadi. Standart **Chiziqli interpolyatsiya bilan uchburchaklash** nuqtalaringizni uchburchaklarga birlashtiradi va har bir nuqta hamda uzilish chizigʻini aniq saqlaydi.

Boshqa usullar avval nuqtalarga muntazam toʻrni moslaydi (kriging, minimal egrilik, eng yaqin qoʻshni, teskari masofa va boshqalar). Bu nuqtalar orasida yumaloqroq gorizontallar beradi, lekin har bir nuqtadan aniq oʻtmaydi; **Yuza** ostidagi yuza hisoboti natijaning nuqtalaringizdan qanchaga chetlashishini koʻrsatadi.

**ABOS (silliqlashga asoslangan yaqinlashtirish)** toʻrli usullardan biri. Uning oʻz ikkita sozlamasi bor: **Silliqlik** (boshlangʻich qiymat 0.5; past qiymat silliqroq) va **Aniqlik** (boshlangʻich qiymat 1: yuza nuqtalaringizda hudud balandligi diapazonining 1% ichiga keltiriladi; aniqroq moslash uchun kichikroq son kiriting). Agar u mavjud toʻrda aniqlikka erisha olmasa, yuza hisoboti buni bildiradi: kichikroq **Toʻr qadami** kiriting.

## Istalgan joydagi balandlikni oʻqish

Koʻrsatkichni reja ustida harakatlantiring. Holat satrida quyidagilar koʻrsatiladi:

- Koʻrsatkich ostidagi **E** va **N**
- **Yer** va oʻsha yerdagi mavjud yer balandligi, koʻrsatkich ostidagi uchburchakda interpolyatsiya qilingan
- **Tekislangan** va loyihalangan balandlik, maydoncha yoki koridor yerni oʻzgartirgan joyda
- Yuza tashqarisida: "Yuzadan tashqarida"

Geodezik nuqtani aniq oʻqish uchun {{ui:Tanlash}} ni tanlang va nuqtani bosing: oʻng panelda uning raqami, sharqiy koordinatasi, shimoliy koordinatasi, balandligi, tavsifi va guruhi koʻrsatiladi.

## Balandlik zonalarini koʻrsatish

1. {{ui:Balandlik zonalari}} ni belgilang.
   Yuza pastdan (koʻk-yashil) baland tomonga (ocher-jigarrang) rang bilan toʻldiriladi. Katakchalar ostidagi izohda har bir zonaning balandlik diapazoni koʻrsatiladi.
2. **Zonalar** maydonida zonalar sonini tanlang: 5, 8, 10 yoki 12. Zonalar eng past va eng baland balandlik oraligʻini teng qadamlarga boʻladi.

Zonalar faqat koʻrish uchun. Ular DXF ga eksport qilinmaydi va PDF ga chizilmaydi.

## Nishablik strelkalarini koʻrsatish

{{ui:Nishablik strelkalari}} ni belgilang. Strelkaga sigʻadigan darajada katta har bir uchburchakda pastga qaragan qisqa strelka chiziladi. Tekis uchburchaklarda strelka boʻlmaydi. Strelkalar drenaj yoʻnalishini tez tekshirish uchun xizmat qiladi; nishablik qiymatining oʻzi hali yozib qoʻyilmagan.

## Uchburchaklar, nuqtalar va chekkalarni koʻrsatish

- {{ui:Uchburchaklar}} TIN chekkalarini chizadi. Yuza nuqtalarni qanday bogʻlashini tekshirish uchun yoqing, ayniqsa uzilish chiziqlari boʻylab va tashqi chetda.
- {{ui:Nuqtalar}} har bir geodezik nuqtani chizadi; {{ui:Nuqta yozuvlari}} unga raqami, balandligi va tavsifini qoʻshadi (yoki kamroq: [CivilCraft sozlamalari](topic:settings) dagi **Nuqta yozuvlari** boʻlimiga qarang).
- {{ui:Uzilish chiziqlari}} uzilish chiziqlarini (va chegarani) toʻq sariq rangda chizadi.
- {{ui:Yuza chegarasi}} yuza chegarasi konturini chizadi.

## Mavjud yoki loyihalangan

Maydoncha yoki koridor muammosiz tekislanganda, **Koʻrsatish** ostidagi **Yuza** {{ui:Loyihalangan (qiyalik berilgan)}} ni taklif qiladi. Gorizontallar, zonalar va strelkalar keyin tekislangan yuzani koʻrsatadi, shunda siz yangi yerni va uning atrofidagi yer kesishish chiziqlarini koʻrasiz. Geodezik suratni koʻrish uchun {{ui:Mavjud yer}} ga qaytib oʻting.

## Nima eksport qilinadi

DXF va PDF chiqishi shu sozlamalarga amal qiladi: oʻchirilgan narsa yozilmaydi, gorizontallar esa koʻrsatilgan yuzaniki boʻladi. Balandlik zonalari hech qachon eksport qilinmaydi.
