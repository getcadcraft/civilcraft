---
title: CivilCraft sozlamalari
summary: Nusxalangan va qoʻyilgan nuqta qatorlari uchun ustunlar tartibi va fayl ustunlarini taxmin qilish, qoʻyilgan nuqtalar qanday raqamlanishi, nuqta yozuvlari nimani koʻrsatishi, burchak indikatori, 3D vertikal oshirish, kenglik va uzunlik qanday koʻrinishi va xarita qatlamlari internetdan olinadimi.
keywords: sozlamalar, afzalliklar, pnezd, penzd, ustunlar tartibi, nuqta qatorlari, qayta raqamlash, nuqta raqamlari, boshlangʻich raqam, nuqta yozuvlari, yozuvlar, tavsif, balandlik, koʻrinish kubi, oʻq belgisi, burchak indikatori, kompas, vertikal oshirish, 3d, kenglik, uzunlik, dms, oʻnlik gradus, xarita qatlamlari, internet, maxfiylik
from: 64b9cb92
---

Ilova panelidagi tishli gʻildirak yoki {{key:Mod+,}} orqali {{ui:Sozlamalar}} ni oching. Birinchi yorliq, {{ui:CivilCraft}}, faqat shu ilovaga tegishli sozlamalarni oʻz ichiga oladi; {{ui:Umumiy}} esa barcha CadCraft ilovalari uchun umumiy boʻlganlarni (mavzu, asboblar paneli, panellar) oʻz ichiga oladi. CivilCraft sozlamalari faqat ilovada mavjud: ularni shu yerda oʻzgartirasiz va bu brauzer ularni eslab qoladi. CivilCraft sozlamalarini tiklash har bir sozlamani boshlangʻich holatiga qaytaradi.

## Nuqta qatorlari

**P, N, E, Z, D** (boshlangʻich) yoki **P, E, N, Z, D**: nuqta, shimoliy koordinata, sharqiy koordinata, balandlik, tavsif yoki sharqiy koordinata shimoliydan oldin. U uch joyda ishlatiladi:

- **Nusxalash**: elektron jadval uchun tizim buferiga qoʻyiladigan qatorlar.
- **Qoʻyish**: elektron jadval yoki matn faylidan sarlavha qatorisiz qoʻyilgan qatorlar.
- **Import**: fayl sarlavha qatorisiz boʻlganda **Nuqtalarni import qilish** dialogidagi taxmin (toʻrt ustunli fayl PENZ, uch ustunli esa ENZ sifatida oʻqiladi). Qarang: [Nuqta fayl formatlari](topic:point-file-formats).

Ustunlarni nomlaydigan sarlavha qatori har doim ustun hisoblanadi, xuddi import dialogidagi **Ustunlar** roʻyxatidagi tanlov kabi.

## Qoʻyilgan nuqtalar raqamlari

- **Boʻsh raqamlarni saqlash** (boshlangʻich): qoʻyilgan nuqta unga hech bir nuqta ega boʻlmasa, raqamini saqlaydi; faqat toʻqnashgan nuqtalar yangi raqam oladi.
- **Doim yangi raqamlar**: har bir qoʻyilgan nuqta, hatto oʻz raqami boʻsh boʻlsa ham, yangi raqam oladi.

**Yangi raqamlar bundan boshlanadi**: boʻsh qoldiring — u hozir ishlatilayotgan eng katta raqamdan bittaga katta raqamdan sanaydi. Raqam kiriting, masalan 5000, yangi nuqtalarga 5000 dan boshlab raqam berish uchun; ishlatilayotgan raqamlar oʻtkazib yuboriladi. Har ikki holatda ham ikki nuqta hech qachon bir raqamni olmaydi. Qarang: [Geodezik nuqtalarni tanlash, nusxalash va qoʻyish](topic:copy-paste-points#point-numbers-never-clash).

## Nuqta yozuvlari

{{ui:Nuqta yozuvlari}} **Koʻrsatish** ostida yoqilganda nuqta yozuvi nimani koʻrsatadi: **Raqam**, **Raqam va balandlik** yoki **Raqam, balandlik va tavsif** (boshlangʻich). DXF, DWG va PDF eksportlari ekrandagi bilan bir xil yozuvlarni koʻrsatadi.

## Burchak indikatori

Reja va 3D koʻrinishning burchagida nima turadi: **Koʻrinish kubi** (boshlangʻich), **Oʻq belgisi** yoki **Yoʻq**.

- **Koʻrinish kubi** (yuqori oʻngda). Rejada u kompas halqasi bilan yuqorini koʻrsatadi: N — setka boʻyicha shimol (rejada yuqoriga). Kubning boshqa tomoni, qirrasi yoki burchagini bosing yoki sudrang, va [3D koʻrinish](topic:site-3d) oʻsha tomondan qarab ochiladi. Rejadagi kubda {{ui:Bosh sahifa}} rejani sigʻdiradi.
- 3D koʻrinishda kub koʻrinish bilan birga aylanadi: tomon, qirra yoki burchakni bosing, shu yerdan qarash uchun; kubni sudrang, koʻrinishni aylantirish uchun; kompas halqasini sudrang, vertikal atrofida aylantirish uchun; harfni bosing, shu tomondan qarash uchun; butun saytning izometrik koʻrinishi uchun {{ui:Bosh sahifa}} dan foydalaning. Toʻgʻridan tomonga qarashda kichik strelkalar keyingi tomonga oʻtadi, egri strelkalar esa koʻrinishni chorak aylanishga buradi.
- **Oʻq belgisi** (pastki chapda): rejada kichik X (sharq) va Y (shimol) belgisi, 3D da X, Y va Z (yuqori).

## 3D vertikal oshirish

3D koʻrinish balandliklarni qancha choʻzishi: **1×**, **2×** (boshlangʻich), **3×**, **5×** yoki **10×**. 3D koʻrinish panelidagi roʻyxat ham shu sozlama, shuning uchun u oʻzgarsa ikkalasi ham oʻzgaradi. Hajmlar, profillar va 3D eksportlar haqiqiy masshtabda qoladi.

## Kenglik va uzunlik

Holat satri loyihada koordinata tizimi boʻlganda kursorning kengligi va uzunligini qanday koʻrsatishi: **gradus, daqiqa va soniya** (boshlangʻich, masalan `30°18′00.00″ N`) yoki **oʻnlik gradus** (`30.300000° N`). Qarang: [Loyihaning koordinata tizimini belgilash](topic:coordinate-systems#latitude-and-longitude-in-the-status-bar).

## Xarita qatlamlari internetdan

**Oʻchiq** (boshlangʻich) yoki **Yoqilgan**. Yoqilganda CivilCraft siz qoʻshgan xarita serverlaridan ekrandagi hudud rasmlarini soʻraydi. Chizmangiz shu kompyuterda qoladi; server hududni va sizning internet manzilingizni koʻradi. Oʻchiq boʻlganda hech bir xarita serveridan hech narsa soʻralmaydi, hatto ochilayotgan loyiha uni nomlagan boʻlsa ham; fayldagi georeferensli rasm har holda ishlaydi. Qarang: [Reja ostidagi xarita qatlamlarini koʻrsatish](topic:map-layers).

## Yordamchilar

**Kompyuteringizdagi AI yordamchilar va skriptlar CivilCraft dan foydalansin** (boshida oʻchiq) yordamchiga CadCraft Studio orqali ochiq saytga yetishga ruxsat beradi: **Oʻqish** saytni tavsiflaydi va nuqtalar, yuza balandliklari, stansiyalar, profillar, hajmlar va uchastkalarni beradi; **Tahrirlash** unga geodezik nuqtalarni tanlash va qoʻshish imkonini beradi; **Saqlash** va **Eksport** loyihani saqlash yoki LandXML yoki DWG yozish imkonini beradi. **Foydalanishi mumkin boʻlgan jildlar** (Studio ichida) u saqlashi va eksport qilishi mumkin boʻlgan joylar. **Faollik** uning chaqiriqlarini roʻyxatlaydi. Qarang: [AI yordamchi bilan saytda ishlash](topic:assistants).
