---
title: Import qilishda geodezik chizmani tekshirish
summary: Matn yoki blok atributlari sifatida yozilgan balandliklarni geodezik nuqtalar sifatida oʻqing va DWG yoki DXF ni notoʻgʻri birliklar, koordinatalar tizimi yoʻqligi, uzoq boshlangʻich nuqta, tekis konturlar, gʻayritabiiy balandliklar va takrorlangan nuqtalar uchun tekshiring, undan yer qurishdan oldin.
keywords: geodezik tekshiruv, import tekshiruvi, geodezik balandliklar, nuqtaviy balandliklar, matn balandliklari, balandliklar matnda, atributlar, birliklar, koordinatalar tizimi, boshlangʻichdan uzoq, konturlar nolda, chetga chiqqanlar, takroriy nuqtalar, muammolar, landshaft arxitektori, geodezik chizma
from: d46acd24
---

Geodezik chizma toʻgʻri koʻrinishi mumkin, lekin yer uchun notoʻgʻri boʻlishi mumkin: birliklari taxmin qilingan boʻlishi, konturlari 0 balandlikda yotgan boʻlishi yoki balandliklari geometriya boʻlmagan matn sifatida yozilgan boʻlishi mumkin. {{ui:Chiziqlar}} dialogining **Geodezik balandliklar va tekshiruv** boʻlimi (qarang [Ochiq DWG yoki DXF ni chiziqlar sifatida](topic:open-dwg-dxf)) bu balandliklarni oʻqiydi va hech narsa qoʻshilishidan oldin nima notoʻgʻri koʻrinishini aytadi.

## Matn yoki atributlar sifatida yozilgan balandliklar

Koʻp geodezik chizmalar nuqtaviy balandlikni xoch yonidagi kichik matn sifatida beradi, masalan `104.37` yoki `EL 104.37`, yoki nuqta blokining atributi sifatida. Bular chiziq emas, shuning uchun chiziqli oʻqish ularni tashlab ketadi. Boʻlim qancha topilganini koʻrsatadi va ularni **geodezik nuqtalar** sifatida olishga imkon beradi:

1. **… balandlikni geodezik nuqta sifatida olish** ni belgilang. Ular belgilanmagan holda boshlanadi, chunki chizmadagi har bir raqam balandlik emas.
2. Matn faqat oʻz-oʻzidan balandlik boʻlganda oʻqiladi: kasr qismli raqam (`104.37`, `+104,37`, `-3.50`), yoki `EL`, `ELEV`, `RL`, `FFL`, `GL`, `TW`, `BW`, `INV`, `Z` yoki `LEVEL` dan keyingi raqam, undan keyin ixtiyoriy `m`, `ft` yoki `'`. Yolgʻiz butun raqam (`12`) lot yoki varaq raqami deb oʻqiladi, balandlik emas; `GATE 3` kabi matn yoki sana hech qachon oʻqilmaydi. Matn formatlash kodlari eʼtiborsiz qoldiriladi.
3. Blok atributlari uchun **Balandlikni saqlaydigan blok atributi** ni tanlang. CivilCraft ELEV, Z, LEVEL, RL yoki shunga oʻxshash tegni oʻzi topadi; chizma oʻz tegidan foydalansa, roʻyxatdan boshqasini tanlang. Tanlov shu kompyuterda shu fayl nomi uchun eslab qolinadi, shuning uchun uni qayta ochganda ham shu teg bilan boshlanadi. Siz tanlagan teg butun raqamlarni ham balandlik sifatida oladi.
4. {{ui:Qoʻshish}} ni bosing. Nuqtalar loyihadagi eng yuqori raqamdan keyin raqamlanadi, har bir nuqta oʻz qatlami (yoki bloki) bilan tavsiflanadi va balandliklar chizmaning qolgan qismi kabi loyihaning birliklariga aylantiriladi. Hammasi bitta qadam: {{key:Mod+Z}} nuqtalarni olib tashlaydi.

Matn oʻz qoʻyilish nuqtasida (yoki mavjud boʻlsa tekislash nuqtasida) joylashgan. Bloklar ichidagi matn oʻqilmaydi va chizma hech qachon oʻzgartirilmaydi.

## Tekshiruv

Tekshiruv kiritmoqchi boʻlgan narsada ishlaydi va topganlarini har bir muammo turi uchun bir qator qilib sanab beradi:

| Tekshiruv aytadi | Bu nimani anglatadi |
|---|---|
| **Birliklar koʻrsatilmagan** | Chizmada birliklari aytilmagan, shuning uchun uning raqamlari loyiha birliklari sifatida oʻqiladi. Bilgan bitta masofani tekshiring. |
| **Birliklar aylantirildi** | Chizma birliklari loyihanikidan farq qiladi va ular masshtablanadi (xato emas, eslatma). |
| **Maʼlumotlar … km** yoki **… m** ni qamrab oladi | Hajmi 200 km dan katta yoki yarim metrdan kichik; odatda notoʻgʻri birlik (millimetr metr deb oʻqilgan yoki aksincha). |
| **Koordinatalar tizimi yoʻq** | Loyihada yoʻq. Maʼlumotlar noldan uzoqda yotganda bu ogohlantirish boʻladi, xuddi davlat tekisligi yoki milliy setka koordinatalari kabi. Qarang [Koordinatalar tizimlari](topic:coordinate-systems). |
| **Boshlangʻichdan uzoq** | Maʼlumotlar noldan 100 km dan uzoqda. Noldan uzoqda 3D koʻrinishlar va eksportlar aniqlikni yoʻqotadi va silkinadi. |
| **… qatlamidagi konturlarning balandligi yoʻq** | Konturlarga oʻxshash nomlangan qatlam (TOPO, CONT, CNTR, CONTOUR) 0 balandlikdagi chiziqlarni saqlaydi, shuning uchun ulardan qurilgan yer tekis boʻladi. |
| **Balandliklar aynan 0** | Ayrim balandliklar 0, odatiy balandlik esa undan uzoq: ehtimol balandliklar yoʻq. |
| **Balandliklar qolganidan uzoq** | Bir nechta balandlik boshqalardan ancha chetda (barcha balandliklarning oʻrtasiga nisbatan topilgan, shuning uchun keng diapazonli tik sayt belgilanmaydi), yoki 9,000 m dan yuqori yoki -11,000 m dan past. |
| **Boshqa nuqta ustidagi nuqtalar** | Bir joyda ikki nuqta, bir xil balandlikda yoki turli balandliklarda. |

{{ui:Qoʻshish}} tugmasini bosgandan keyin xuddi shu qatorlar har bir tur uchun bittadan, fayl nomi bilan **Muammolar** ga boradi, shunda ularga qaytishingiz mumkin. Tekshiruv chizmani baholaydi; uning hech narsasini oʻzgartirmaydi va chizmadan foydalanishingizga toʻsqinlik qilmaydi.

:::tip
Tekshiruv konturlar 0 da tekis ekanini va matn sifatida balandliklar borligini aytganda, ularni geodezik nuqta sifatida oling: ular koʻpincha konturlarda yoʻq haqiqiy balandliklarni olib yuradi.
:::

## Nima tekshirilmaydi

Tekshiruv chizmani ikkinchi geodezik oʻlchov bilan solishtirmaydi va chizma qaysi koordinatalar tizimida ekanini ayta olmaydi: u faqat hech biri oʻrnatilmaganini aytadi.
