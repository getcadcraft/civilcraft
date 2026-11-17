---
title: Muammolar va BCF
summary: Muammoni rejaga, trassa stansiyasiga, sirt nuqtasiga yoki quvurga biriktiring, unga holat va izohlar bering hamda muammolarni LandXML fayli yonida BCF 2.1 fayllari sifatida almashing.
keywords: muammo, muammolar, bcf, izoh, belgilash, kamchilik, nuqson, qurilish maydoni, belgi, holat, ochiq, hal qilingan, yopiq, bim collaboration format, landxml, masalalar
from: e44153b1
---

Muammo — bu CivilCraft chizmangizdagi biror joyga biriktirilgan eslatma boʻlib, sarlavha, holat va izohlarga ega. Uni qurilish xodimlariga yoki boshqa dasturga nimaga e'tibor berish kerakligini aytish va ularning javoblarini qaytarib oʻqish uchun ishlating.

## Muammo qoʻshish

1. **Sirt, Yana, Muammolar (BCF)...** ni oching.
2. Sarlavha va nima notoʻgʻriligini yozing.
3. Qayerga biriktirishni tanlang: reja koʻrinishining markazi, markazdagi sirt nuqtasi, tanlangan trassaning stansiyasi (stansiya va ofsetni kiriting, oʻngga — musbat), yoki tanlangan quvur, inshoot yoki xususiyat chizigʻi.
4. **Muammo qoʻshish** tugmasini bosing. Belgi rejada raqami bilan birga kichik romb shaklida koʻrinadi.

Muammo sarlavhasini bosib uni kattalashtiring, roʻyxatda holatini oʻzgartiring (Ochiq, Faol, Hal qilingan, Yopiq) va izoh qoʻshing. Har bir oʻzgarish bitta bekor qilish qadami boʻladi, muammolar esa loyiha faylida saqlanadi.

## BCF sifatida almashish

- **BCF eksport qilish** har bir muammo uchun bitta mavzu bilan BCF 2.1 faylini yozadi: sarlavha, holat, izohlar va bitta koʻrinish — ortogonal reja kamerasi va belgi bilan.
- **BCF import qilish** BCF faylini oʻqiydi (2.0 va 3.0 fayllari 2.1 bilan mos keladigan qismigacha oʻqiladi). Siz allaqachon bilgan guid ga ega mavzu yangi muammo qoʻshmaydi, balki oʻsha muammoni yangilaydi (holat, yangi izohlar).
- **Muammolardan** — Muammolar panelidagi, qayerdaligi koʻrsatilgan har bir ochiq yozuv uchun muammo yaratadi.

BCF ushbu loyihaning oʻz koordinatalarida, metrda, hech qanday siljishsiz ma'lumot beradi. Belgilar toʻgʻri joyga tushishi uchun boshqa dastur LandXML faylingiz bilan bir xil koordinatalar tizimida boʻlishi kerak. Belgi koʻrsatayotgan element (trassa, stansiya, ofset, quvur) "cc:" bilan boshlanadigan yorliqlar sifatida uzatiladi, CivilCraft ularni qayta oʻqiydi.

## Tekshirilmagan jihatlar

Belgilar va koʻrinishlar faqat fayl yozib, uni CivilCraft da qayta oʻqish orqali sinovdan oʻtkazildi. Hali hech qanday boshqa BIM dasturi ularni ochmagan. BCF dagi "view to world scale" koʻrinish balandligining toʻliq yoki yarim qismi ekani dasturlar orasida farq qiladi: CivilCraft toʻliq balandlikni yozadi.
