---
title: Sirtni qurish va aniqlashtirish
summary: CivilCraft mavjud yerni qanday uchburchaklashini va uni nuqtalar guruhlari (uzilish chiziqlari), chizilgan uzilish chiziqlari, tashqi chegara hamda eng uzun tashqi chekka bilan qanday shakllantirishni tushuntiradi.
keywords: tin, sirt, uchburchaklash, uzilish chiziqlari, chegara, mavjud yer, eg, sirt yaratish, delaunay, uchburchaklar, maksimal chekka, tashqi chegara
from: b9eea3f3
---

CivilCraftda har bir loyihada bitta mavjud yer sirti bor. U nuqtalaringizdan qurilgan TIN (uchburchaklangan notekis tarmoq) boʻlib, kiritilgan maʼlumot oʻzgarganda avtomatik qayta quriladi. Qayta qurish buyrugʻi yoʻq va eskirgan sirt ham yoʻq.

## Sirtga nima kiradi

- Har bir {{ui:Nuqtalar}} ga oʻrnatilgan guruhdagi balandligi bor nuqta.
- Har bir {{ui:Sinuvchi chiziq}} ga oʻrnatilgan guruh, nuqta raqamlari tartibida ulangan.
- {{ui:Sinuvchi chiziq}} asbobi bilan chizgan har bir uzilish chizigʻi.
- Agar chizsangiz, tashqi chegara.
- **Eng uzun tashqi chekka** sozlamasi.

Uchburchaklar hech qachon uzilish chizigʻini kesib oʻtmaydi: sirt unga boʻysunishga majbur qilinadi, keyin uning atrofida imkon qadar teng qilinadi (boshqa joylarda Delaunay).

## Kodlangan chiziqlarni uzilish chiziqlariga aylantirish

1. Chap panelda **Nuqtalar** ostida guruhni toping (masalan FL).
2. Uning **Sirt** tanlovini {{ui:Sinuvchi chiziq}} ga oʻrnating.
   Sirt qayta quriladi, chiziq toʻq sariq rangda chiziladi (**Koʻrsatish** ostida {{ui:Uzilish chiziqlari}} yoqilgan boʻlsa) va sirt maʼlumotlaridagi **Uzilish chiziqlari** bittaga oshadi.
3. Chiziqni planda tekshiring. U oʻlchangan tartibda nuqtadan nuqtaga oʻtishi kerak. Agar zigzag boʻlsa, guruhda bir nechta chiziq bor yoki nuqtalar tartib bilan raqamlanmagan: guruhni yana {{ui:Nuqtalar}} ga qaytaring va chiziqlarni qoʻlda chizing (keyingi boʻlim).

## Nuqtalar orqali uzilish chizigʻini chizish

1. {{key:B}} ni bosing yoki **Sirt** guruhida {{ui:Sinuvchi chiziq}} ni bosing.
   Maslahatda yozilgan: "Sinuvchi chiziq: geodezik nuqtalarni tartib bilan bosing (ularning balandliklarini oladi). Enter tugatadi."
2. Koʻrsatkichni nuqtaga yaqin olib boring. Kichik toʻq sariq kvadrat olinadigan nuqtani belgilaydi.
3. Chiziq nuqtalarini birin-ketin bosing. Har bir bosish nuqtani va uning balandligini holat satrida koʻrsatadi.
4. Tugatish uchun {{key:Enter}} ni bosing.
   Holat satrida: "Sinuvchi chiziq 1 qoʻshildi; sirt qayta qurildi."

Bosishlar balandligi bor geodezik nuqtaga tushishi kerak; boshqa joydagi bosish rad etiladi: "Balandligi bor geodezik nuqtani bosing: sinuvchi chiziq nuqtalarning balandliklarini oladi." {{key:Backspace}} oxirgi nuqtani tashlaydi; {{key:Esc}} butun chiziqni bekor qiladi.

:::warning
{{key:Enter}} bilan tugating. Ikki marta bosish ham tugatadi, lekin bu versiyada ikki marta bosgan nuqtani tashlaydi. Oxirgi nuqtani bir marta bosing, keyin {{key:Enter}} ni bosing.
:::

Barcha chizilgan uzilish chiziqlarini bir vaqtda olib tashlash uchun **Sirt** boʻlimidagi {{ui:Chizilgan uzilish chiziqlarini oʻchirish}} tugmasini bosing. Faqat oxirgisini olib tashlash uchun {{key:Mod+Z}} dan foydalaning. Chizilgan uzilish chiziqlarini hozircha bittadan tanlab tahrirlab boʻlmaydi.

## Tashqi chegarani chizish

Chegara sirtni siz ishonadigan maydonga kesadi, masalan geodezik oʻlchov chegaralariga, shunda oʻlchanmagan burchaklar boʻylab uzun uchburchaklar yoʻqoladi.

1. {{key:O}} ni bosing yoki {{ui:Chegara}} ni bosing.
2. Maydon atrofida burchaklarni tartib bilan bosing. Shakl punktir chiziq bilan koʻrinadi.
3. {{key:Enter}} ni bosing.
   Holat satrida: "Chegara oʻrnatildi; undan tashqaridagi uchburchaklar yoʻqoldi." **Chegara** sirt maʼlumotlarida "Ha" va burchaklar soni koʻrsatiladi.

Bilib oling:

- Bitta chegara bor. Yangisini chizish eskisini almashtiradi. {{ui:Chegarani oʻchirish}} uni olib tashlaydi.
- U faqat kesishi mumkin: nuqtalardan oʻtib ketadigan chegara ularning konturiga qadar qisqartiriladi, izoh bilan: "Chegara nuqtalardan oʻtib ketdi; u ularning konturiga qadar qisqartirildi."
- Uning burchaklari balandliklarni sirtdan oladi, shuning uchun chekka yerni aniq kuzatadi.
- Ichki (yashirin) chegaralar hozircha mavjud emas.

## Tashqi uzun uchburchaklarni kesish

Chegarasiz sirt nuqtalar konturining butun shaklini toʻldiradi, jumladan botiq chekkalar boʻylab uzun ingichka uchburchaklarni ham.

1. **Sirt** da **Eng uzun tashqi chekka** ga uzunlik yozing va {{key:Enter}} ni bosing. Odatdagi oʻlchov qadamingizning taxminan ikki-uch baravaridan boshlang.
2. Tashqi chekkasi shundan uzunroq boʻlgan tashqi uchburchaklar olib tashlanadi; har bir tashqi chekka yetarlicha qisqa boʻlguncha ichkariga qarab ishlanadi. Uzilish chizigʻi boʻlgan chekka hech qachon olib tashlanmaydi.
3. Hamma uchburchaklarni qayta tiklash uchun 0 yozing.

## Sirt hisobotini oʻqish

Sirt maʼlumotlari ostidagi quti qurувchi nima qilganini koʻrsatadi. Chap tomonida ocher chiziq boʻlsa — bu maʼlumot; qizil chiziq boʻlsa — xato bor va sirt yoʻq.

| Xabar | Maʼnosi |
|---|---|
| "3 ta nuqta boshqasi bilan bir joyda edi va unga qoʻshildi." | 0.0001 dan yaqin planda nuqtalar bitta uchga aylandi (birinchisi saqlandi). |
| "2 ta joyda ikki xil balandlik bor …" | Nuqtalar bir-birining ustida, yoki uzilish chiziqlari kesishgan, balandligi bilan kelishmaydi. Uzilish chizigʻining balandligi ustun keladi, keyin birinchisi. |
| "1 ta uzilish chizigʻi boʻlagini sirtga majburan kiritib boʻlmadi." | Juda qisqa yoki deyarli ustma-ust tushgan uzilish chizigʻi boʻlagi sigʻmadi; shu joyni tekshiring. |
| "Sirt uchun balandligi bor kamida uchta nuqta kerak." | Nuqtalar juda kam: ustunlar tartibini va guruhlarni tekshiring. |
| "Nuqtalar bitta chiziqda: uchburchak yoʻq." | Nuqtalarning eni yoʻq, masalan bitta traverse chizigʻi. |
| "Chegara nuqtalar bilan ustma-ust tushmaydi." | Chegara boshqa joyda, koʻpincha birlik yoki koordinata aralashmasi. |
| "Chegara ichida uchburchak qolmadi." | Chegara juda kichik yoki notoʻgʻri joylashgan. |

## LandXML dan oʻqilgan sirt

LandXML ochganingizda, uning birinchi TIN sirti oʻz holicha ishlatiladi: **Sirt** sarlavhasi "Sirt (LandXML dan)" deydi va **Eng uzun tashqi chekka** oʻchirilgan (kulrang). Oʻsha sirt ishlatilayotganda uzilish chiziqlari guruhlari, chizilgan uzilish chiziqlari va yangi chegara uni oʻzgartirmaydi. Sirtni fayl nuqtalaridan qurish uchun {{ui:Sirtni nuqtalardan qayta qurish}} tugmasini bosing. {{key:Mod+Z}} LandXML sirtini qaytaradi.

## Tegishli

- [Konturlar, balandliklar va nishablarni oʻqish](topic:contours).
- [Geodezik nuqtalarni import qilish](topic:import-points).
