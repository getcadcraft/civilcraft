---
title: Dron yoki skanerdan nuqtalar buluti
summary: Nuqtalar buluti qoʻshimchasi bilan millionlab nuqtadan iborat LAS yoki LAZ faylni oching, uning hammasini koʻring, tozalang, yer, oʻsimlik va binolarga ajrating hamda undan yer, gorizontallar va hajmlarni yarating.
keywords: nuqtalar buluti, las, laz, dron, fotogrammetriya, recap, lidar, skanerlash, yer, tasniflash, shovqin, uyum, hajm, kesish va toʻldirish, gorizontallar, sinish chizigʻi, eye-dome, ortomozaika, ortho, qoplash, xarita qatlami, las eksport, laz eksport, siqish
from: e4a4901f
---

Koʻpchilik buni hech qachon talab qilmaydi, shuning uchun bu qoʻshimcha. Sozlamalar › Qoʻshimchalar boʻlimida {{ui:Point clouds}} ni yoqing; oʻng panelda {{ui:Point clouds}} yorligʻi paydo boʻladi. Fayl brauzeringizda oʻqiladi va boʻlaklarga boʻlinadi; ular brauzeringizning oʻz xotirasida (yoki siz tanlagan jildda) saqlanadi. **Hech narsa yuklanmaydi.**

:::warning
Bu yorliqda koʻrsatilgan hamma narsa maʼlumotlaringizdan olingan son, sertifikat emas. U oʻylab topilgan obyektda sinab koʻrilgan, hali haqiqiy dron surveyida emas: dastlabki natijalarga ehtiyotkorlik bilan qarang va nimani topganingizni bizga xabar bering. Yer, gorizontallar va hajmlarning qiymatini roʻyxatdan oʻtgan mutaxassis belgilaydi.
:::

## Bulutni ochish

{{ui:Bulutni ochish}} ostida LAS yoki LAZ faylni tanlang. Yorliqda nechta nuqta borligi, uning koordinata tizimi va birliklari hamda qurish uchun qancha joy kerakligi koʻrsatiladi; {{ui:Bulutni qurish}} tugmasini bosing. Qurishni toʻxtatish mumkin va uni {{ui:Davom ettirish}} bilan davom ettirish mumkin (xuddi shu faylni qayta tanlang). Fayl hech qachon oʻzgartirilmaydi. 100 million nuqtali fayl ish stantsiyasida bir necha daqiqada quriladi va faylning oʻzi hajmicha joy talab qiladi.

{{ui:Bu kompyuterdagi bulutlar}} ostida bulutni ochasiz yoki oʻchirasiz. {{ui:Bulutlarni jildda saqlash…}} (Chrome, Edge va Studio ilovasi) boʻlaklarni siz tanlagan jildda saqlaydi, masalan Hujjatlardagi CadCraft bulutlari jildida, shuning uchun 10 GB li bulut brauzer xotirasiga sigʻishi shart emas; ilgari qurilgan bulutlar oʻz joyida qoladi. Brauzer qayta ishga tushgandan keyin yana ruxsat soʻraydi: {{ui:Jild … ni qayta ishlatish}} tugmasini bosing.

## Uni koʻrish

{{ui:3D da koʻrish}} bulutni yirik boʻlaklardan chizadi va siz unga yaqinlashganda aniqlashtiradi; bir vaqtda {{ui:Chizilgan eng koʻp nuqtalar}} dan oshmaydi (2,5 million; telefonda 500 ming). Rang boʻyicha faylning oʻz rangi, balandlik, sinf, intensivlik yoki qoldiq boʻyicha boʻyang. {{ui:Eye-dome yoritish}} chekkalarni chuqurlik boʻyicha soyalaydi, shuning uchun shakl normalsiz ham seziladi (telefonda oʻchiq); {{ui:Nuqtalar masofa bilan kichrayadi}} uzoqdagi nuqtalarni kichikroq, yaqindagilarni kattaroq qiladi; {{ui:Nuqta oʻlchami}} oʻlchamni belgilaydi. Reja bulutni chizmangiz ostida rastr sifatida koʻrsatadi va uning bir qismiga **yaqinlashtirganda aniqlashadi**.

## Uni tozalash

{{ui:Tozalash}} ostida rejada arqon, toʻrtburchak yoki koʻpburchak chizing (yoki 3D da yuqori koʻrinishdan: 3D da kontur toʻgʻridan-toʻgʻri pastga olinadi, shuning uchun u faqat yuqoridan aniq boʻladi). Qoʻllashdan **oldin** ichida nechta nuqta borligini yorliq koʻrsatadi: {{ui:Bu nuqtalarni oʻchirish}}, {{ui:Ularning sinfini oʻzgartirish}}, {{ui:Oʻchirilgan nuqtalarni tiklash}} yoki {{ui:Bu chegaraga kesish}}. {{ui:Ortga qaytarish}} va {{ui:Qayta bajarish}} tahrirlash jurnali boʻylab yuradi; faylning oʻzi hech qachon oʻzgartirilmaydi. {{ui:Shovqin filtri…}} tasodifiy nuqtalarni past nuqtalar (sinf 7) yoki yuqori shovqin (sinf 18) deb belgilaydi.

## Uni ajratish

{{ui:Yerni topish}} boʻlaklar boʻyicha ishlaydi va yer (sinf 2) hamda past nuqtalarni belgilaydi; ogʻish 0,15 m, geodezik aniqlik kaliti yoqilganda esa 0,08 m. U bir-biriga mos kelmaydigan boʻlak choklarini xabar qiladi. {{ui:Oʻsimlik va binolarni tasniflash}} keyin past, oʻrta va baland oʻsimliklar hamda binolarni yer ustidagi balandlik va atrofning tekisligi boʻyicha belgilaydi. Mashinali oʻqitish yoʻq, shuning uchun daraxtlar ostidagi tekis tomli omborxona notoʻgʻri boʻlishi mumkin: qarab chiqing.

## Yer, gorizontallar, sinish chiziqlari

{{ui:Yerni qurish}} yer nuqtalaridan mavjud yerni yasaydi va uni LAS importi kabi loyihaga qoʻshadi (bitta bekor qilish qadami). Keyin nuqtalarni u bilan solishtiradi: oʻrtacha qiymat, RMS, 95-foizli qiymat, ogʻish ichidagi ulush va bir-biridan eng koʻp farq qiluvchi oʻnta joy, har biri {{ui:Oʻsha joyga oʻtish}} bilan. {{ui:Qoldiq}} boʻyicha rang yer va bulut bir-biriga mos kelmagan joylarni koʻrsatadi.

**Sinish chizigʻi** (bordyur, ariq yoki qirgʻoq yuqori chegarasi) bulutda tanlanadi: 3D koʻrinishda {{ui:Bulutda sinish chizigʻini tanlash}} har bir bosishda chizilgan eng yaqin nuqtani oladi, rejada esa {{ui:Rejada sinish chizigʻini tanlash}} har bir bosish ostidagi eng yaqin bulut nuqtasini (avval yer) oladi; chiziqni ikki marta bosish yoki Enter tugatadi. Keyingi {{ui:Yerni qurish}} uni ishlatadi. {{ui:Gorizontallarni koʻrsatish}} bulut ustida gorizontallarni kichik rasmda chizadi va loyihaning intervalini belgilaydi.

## Hajmlar

{{ui:Uyum hajmi…}} siz chizgan chegara ichidagi tayanch ustidagi sirt hajmini hisoblaydi. Chegarani uyum atrofidagi tekis yerda chizing va tayanchni tanlang: eng past chegara nuqtasi, tekislik, silliq egri tayanch, chegara orqali oʻtgan sirt yoki siz kiritgan daraja. Qiya yoki egri yerda tekislik yoki egri tayanchdan foydalaning; eng past nuqta juda baland koʻrsatadi. Qolgan nuqtalardan baland turgan chegara nuqtalari (chiziqdagi daraxt) tayanchdan chiqarib tashlanadi. {{ui:Parvozdan parvozgacha}} ikki bulut orasidagi kesish va toʻldirishni beradi. Ikkalasini ham CSV sifatida saqlash mumkin.

## Ortomozaika

{{ui:Ortomozaika (yuqoridan tasvir)}} ostida dronning ortomozaikasini, agar boʻlsa, uning dunyo fayli va `.prj` bilan birga tanlang: GeoTIFF, yoki PNG yoki JPEG. U loyihaning **xarita qatlami** boʻladi, shuning uchun reja uni chizmangiz ostida koʻrsatadi, 3D koʻrinish ({{ui:Xarita}} rangi) esa uni siz qurgan yerga boʻyaydi, shuning uchun avval {{ui:Yerni qurish}} ni bajaring. Yorliq rasm bulutning qancha qismini qoplashini koʻrsatadi va hech narsani qoplamasa ogohlantiradi: odatiy sabab boshqa koordinata tizimi, shuning uchun unga `.prj` faylini bering. `.prj` boʻlmasa, dastur koordinatalar qayerdaligini soʻraydi. Rasm loyiha faylida saqlanadi; 200 MB dan katta GeoTIFF rad etiladi va juda katta mozaika 16 megapikselgacha kichraytiriladi, shuning uchun katta surveyda avval mozaikani obyektga qarab kesing.

## Eksport

{{ui:Eksport}} tozalangan, tasniflangan bulutni yangi fayl sifatida yozadi (barcha nuqtalar, tozalangan sinflar yoki faqat yer). {{ui:Fayl turi}} ostida tanlang:

- **LAS 1.4 (siqilmagan)**: nuqta formati 6, yoki rang bilan 7.
- **LAZ (siqilgan)**: xuddi shu nuqtalar yoʻqotishsiz siqilgan, shuning uchun har bir nuqta aynan qaytadi. U nuqta formati 0, yoki rang bilan 2 sifatida, LAS 1.4 faylida yoziladi. Oʻylab topilgan 300 m obyektda LAZ hajmi LAS 1.4 faylining taxminan beshdan bir qismi boʻldi. LAZ formatlari 0 va 2 faqat 0 dan 31 gacha boʻlgan sinflarni saqlaydi: undan yuqori sinfli nuqta xabar bilan rad etiladi, shuning uchun bunday bulutni LAS 1.4 sifatida eksport qiling.

LAZ CadCraftning oʻz siqish dasturi bilan, nashr etilgan LAZ spetsifikatsiyasi asosida yoziladi. Biz oʻz oʻqish dasturimiz va ikkita mustaqil LAZ oʻquvchisini (ilova LAZ fayllarni ochish uchun ishlatadigan laz-perf va laspy hamda lazrs) tekshirdik: ular har bir nuqtani aynan qaytaradi, va laspy yaratgan LAZ fayllar ularning nuqtalarini qayta yozganda baytma-bayt bir xil chiqadi. Boshqa dasturlar hali sinab koʻrilmagan, shuning uchun biror dastur faylni ochmasa, qaysi biri ekanini bizga ayting.

Brauzer faylni yozishni bajarsa, avval faylni tanlaysiz va juda katta bulut uni xotirada yigʻmasdan boʻlaklab yoziladi; aks holda fayl yigʻiladi va yuklab olinadi, bu bir necha yuz megabaytgacha yaxshi ishlaydi.

## Nima qilmaydi

Bu faqat LAS va LAZ ni oʻqiydi (E57, PLY va PCD hali bu yorliqqa ulanmagan, va bitta parvozning bir nechta fayli birlashtirilmaydi), bulutni qayta proyeksiya qilmaydi (loyihaning tizimi va metrlar qabul qilinadi), Autodesk RCP yoki RCS fayllarini oʻqimaydi, fotosuratlardan sirt yasamaydi va ustun, bordyur yoki quvurlarni oʻzi topmaydi.
