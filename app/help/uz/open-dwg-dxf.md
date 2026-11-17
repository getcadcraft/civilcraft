---
title: DWG yoki DXF ni chiziqlar sifatida ochish
summary: Chizmaning chiziqlarini rejada, qatlam boʻyicha oching, uning konturlari, 3D polichiziqlari va yopiq konturlaridan yuza uchun foydalaning hamda uning nuqta bloklarini geodezik nuqtalarga aylantiring.
keywords: geodezik tekshiruv, matn balandliklari, dwg, dxf, cad, chizma, chiziqlar, konturlar, uzilish chiziqlari, chegara, polichiziq, 3d polichiziq, qatlamlar, asosiy xarita, topo, geodezik chizma, bloklar, blok havolalari, bloklardan geodezik nuqtalar, atributlar, nuqta bloklari, kiritish nuqtasi
from: da0f4c58
---

Topografik tadqiqot koʻpincha chizma sifatida keladi: konturlar oʻz balandligidagi polichiziqlar sifatida, uzilish chiziqlari 3D polichiziqlar sifatida, uchastka chegarasi yopiq polichiziq sifatida. CivilCraft chizmaning **model fazosini** rejada qatlamlar sifatida ochadi va bu chiziqlarni toʻgʻridan-toʻgʻri yuzaga aylantirishi mumkin.

## Chizmani oching

1. **Yuza** guruhida {{ui:Chiziqlar}} ni bosing ({{ui:Ochish}} yoki faylni rejaga tashlang) va `.dwg` yoki `.dxf` faylini tanlang. Chizma shu kompyuterda oʻqiladi; hech narsa yuklanmaydi. 2000 dan 2018 gacha boʻlgan DWG va ASCII DXF oʻqiladi.
2. **Chiziqlar** oynasi chiziqlar, yopiq shakllar yoki nuqtalar saqlaydigan chizma qatlamlarini va ularda **balandliklar** bor-yoʻqligini koʻrsatadi. Chizmada oʻchiq boʻlgan qatlamlar belgilanmagan holda boshlanadi. Matn, shtrixlar, oʻlchamlar va boshqa chiziq boʻlmagan obyektlar sanaladi va chiqarib tashlanadi (oynada qaysilari ekanligi aytiladi).
3. **Chizma birliklari** ni tekshiring. Chizma oʻz birliklarini aytganda, CivilCraft ularni loyiha birliklariga aylantiradi (millimetrdan metrga, metrdan futga, dyuymdan futga). Futdagi chizma AQSh geodezik futi sifatida masshtablanmasdan oʻqiladi: ular 2 million ulushda farq qiladi va shtat tekisligi koordinatalarini shu bilan masshtablash ularni futlar bilan siljitadi. Chizma oʻz birliklarini aytmasa, uning raqamlari loyiha birliklarida oʻqiladi; agar ular notoʻgʻri boʻlsa, roʻyxatdan toʻgʻri birlikni tanlang.
4. **Yuza uchun ishlatish** da har bir qatlam yuzaga nima berishini tanlang (yoki **Faqat koʻrsatish** ni qoldiring). Konturlarga oʻxshash nomlangan (TOPO, CONT, CNTR) va balandliklari bor qatlamlar uzilish chiziqlari sifatida boshlanadi.
5. {{ui:Qoʻshish}} ni bosing. Qatlamlar chap panelda **GIS qatlamlari** ostida paydo boʻladi; har bir foydalanish yuzaga kiritiladi. Har bir qism alohida qadam boʻladi: {{key:Mod+Z}} ularni birma-bir qaytaradi.

## Qatlam nimani berishi mumkin

| Qatlam saqlaydi | Yuza uchun ishlatish |
|---|---|
| Konturlar (balandlikdagi polichiziqlar) | Chiziqlarning oʻz balandligida uzilish chiziqlari yoki ELEV maydonida |
| 3D polichiziqlar | Oʻz balandliklarida uzilish chiziqlari |
| Yopiq kontur | Yuza chegarasi (eng katta yopiq shakl yoki siz tanlagan) |
| Balandlikka ega nuqtalar | Geodezik nuqtalar, qatlam nomi bilan tavsiflangan |
| Nol balandlikdagi chiziqlar (reja chizigʻi) | Hech narsa: u asosiy chizma sifatida rejada qoladi |

CivilCraft yozgan chizma oʻz xususiyat chiziqlarini oʻz yoylarini eslab qoladigan 3D polichiziqlar sifatida saqlaydi. Oynada **Xususiyat chiziqlari** koʻrinadi: ularni yoylari va foydalanishlari bilan xususiyat chiziqlari sifatida qaytarish uchun belgili qoldiring (bitta bekor qilish qadami), yoki ularni boshqa qatlam kabi chiziq sifatida oʻqish uchun belgini olib tashlang.

Keyinchalik, faqat koʻrsatgan qatlam uchun uni yuzaga qoʻshish uchun **GIS qatlamlari** ostidagi qatlam menyusidagi {{ui:Sirt uchun ishlatish}} dan foydalaning.

## Bloklardan geodezik nuqtalar

Geodezik chizmalar koʻpincha nuqtalarini bloklar sifatida saqlaydi: har bir oʻlchovda kichik belgi, nuqta raqami, tavsifi va balandligi uchun atributlar bilan. Chizmada blok havolalari boʻlsa, oynada **Bloklardan geodezik nuqtalar** boʻlimi bor:

1. Olinadigan bloklarni belgilang (jadvalda har bir blokda nechta havola bor, qaysi qatlamlarda va qanday atributlar borligi koʻrsatiladi) yoki ulardagi har bir blok havolasini olish uchun qatlamlarni belgilang.
2. Har bir nuqtaning **raqami**, **tavsifi** va **balandligi** qayerdan olinishini tanlang: atributdan, blok yoki qatlam nomidan, keyingi boʻsh raqamlardan yoki kiritish nuqtasining Z qiymatidan. CivilCraft eng ehtimolli atributlardan boshlaydi (PT, DESC, ELEV va shunga oʻxshash) va balandlikni atributdan faqat bloklar nolda turganda oladi.
3. Faqat nuqtalarni xohlasangiz, chiziq qatlamlarini belgisini olib tashlang, soʻng {{ui:Qoʻshish}} ni bosing.

Har bir havola kiritish nuqtasida bitta geodezik nuqtaga aylanadi. Faqat model fazosida joylashtirilgan havolalar hisobga olinadi; boshqa bloklar ichida joylashgan bloklar hisobga olinmaydi. Loyihada allaqachon mavjud yoki chizmada ikki marta ishlatilgan raqamlar eng yuqori raqamdan keyin yangi raqamlar oladi, va raqam boʻlmagan balandlik atributi oʻsha nuqtani balandliksiz qoldiradi; holat qatori ikkalasini ham sanaydi. Chizma hech qachon oʻzgarmaydi, va har bir nuqta oʻz blokini eslab qoladi: uning xususiyatlarida **Blokdan** bloki, qatlami va tutqichi koʻrsatiladi. Nuqtalarni qoʻshish bitta qadam, shuning uchun {{key:Mod+Z}} ularning hammasini olib tashlaydi.

## Matn koʻrinishidagi balandliklar va tekshiruv

Matn sifatida yozilgan nuqta balandliklari (yoki blok nuqta bloki boʻlmagan atributda) chiziq emas. **Geodezik balandliklar va tekshiruv** boʻlimi ularni geodezik nuqtalar sifatida olishi mumkin va chizma bilan nima notoʻgʻri ekanligini sanab beradi: birliklar, koordinatalar tizimi, nol nuqtasidan masofa, tekis konturlar, gʻalati balandliklar, ikki marta yozilgan nuqtalar. Qarang: [Import qilishda geodezik chizmani tekshirish](topic:survey-check).

## Chizma qanday oʻqiladi

- Yoylar, aylanalar, ellipslar, qavariq polichiziq segmentlari va splaynlar qisqa toʻgʻri boʻlaklarga aylanadi (eng koʻpi har 5° da).
- Blok havolalari joylashtirilgan joyida chiziladi, ichki bloklar ham; 0-qatlamdagi blok ichida nima boʻlsa, havolaning qatlamini oladi.
- Boshqa tekislikda chizilgan obyektlar (boshqa ekstruziya yoʻnalishi) jahon koordinatalarida joylashtiriladi.
- Har bir obyektda uchta maydon bor: LAYER, TYPE (obyekt turi) va ELEV (barcha nuqtalari bitta balandlikda boʻlsa, uning balandligi).
- Koordinatalar qanday boʻlsa shunday olinadi: chizma loyiha bilan bir xil koordinatalardan foydalanishi kerak (masalan, bir xil shtat tekisligi zonasi). Bogʻlangan chizmalar (xref) ochilmaydi: ularni alohida oching.

:::tip
Kontur chizmasi bir necha tepalik va chuqurlikdagi balandlik nuqtalari bilan eng yaxshi yuzani beradi, faqat konturlar esa tekis uchburchaklar qoldiradi. Ularni geodezik nuqtalar sifatida yoki chizmadagi nuqtalar qatlamidan qoʻshing.
:::
