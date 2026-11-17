---
title: Qatlam atributlar jadvali bilan ishlash
summary: GIS qatlamining har bir obyektini jadval sifatida koʻring, saralang va filtrlang, qatorlar va obyektlarni birga tanlang, qiymatlarni tuzating, ustunlar qoʻshing, yangi qiymatlar hisoblang va jadvalni CSV sifatida saqlang.
keywords: atributlar jadvali, jadval, ustunlar, qatorlar, saralash, filtr, ifoda, tanlash, tahrirlash, ustun kalkulyatori, hisoblash, ustun qoʻshish, ustun nomini oʻzgartirish, ustunni olib tashlash, csv, eksport, gis, shapefile, geopackage, belgilash
from: fd9d6c11
---

Qatlamning jadvalini uning **uchta nuqta** menyusidan ({{ui:Attribute table…}}), Sirt › Yana › {{ui:Attribute table}} dan yoki `ATTRIBUTES`, `ATTTABLE` yoki `TABLE` buyrugʻini yozib oching. Jadval reja yonida ochiladi va siz ishlayotganda ochiq qoladi. Faqat koʻrinadigan qatorlar chiziladi, shuning uchun minglab obyektli qatlam tez ochiladi va aylantiriladi.

## Saralash, filtrlash va tanlash

- **Saralash:** ustun sarlavhasini bosing. Ikkinchi bosish teskari qiladi, uchinchisi faylning asl tartibini tiklaydi. Boʻsh qiymatlar doim pastda qoladi. Saralash faqat koʻrinishni oʻzgartiradi, qatlamni hech qachon.
- **Filtr:** filtr katagiga yozing. `AREA > 500 and USE = 'Res'` kabi ifoda haqiqat boʻlgan qatorlarni qoldiradi ([GIS qatlamlarini tahlil qilish](topic:gis-analysis) ning Tanlash yorligʻidagi soʻzlar bilan bir xil: `=`, `<`, `like`, `contains`, `is null`, `in`, `between`, `and`, `or`, `not`, `$area`, `$length`). Ifoda boʻlmagan narsa, masalan `oak maple`, har bir ustunda shu soʻzlarni qidiradi.
- **Qatorlarni tanlash:** qatorni bosing. Ctrl+bosish bittasini qoʻshadi yoki olib tashlaydi, Shift+bosish oraliqni tanlaydi, {{ui:Select shown rows}} esa filtrdan oʻtgan har bir qatorni tanlaydi. Tanlangan obyektlar rejada chiziladi, rejadagi obyektni bosish esa uning qatorini bu yerda tanlaydi.
- Tanlangan qatorlar bilan {{ui:Zoom}} qilishingiz, tanlovdan qatlam yaratishingiz va holat qatorida umumiy maydon yoki uzunlikni oʻqishingiz mumkin.

## Qiymatlarni tuzatish

Katakchani ikki marta bosing (yoki yoʻnalish tugmalari bilan oʻtib {{key:Enter}} bosing), yangi qiymatni yozing va {{key:Enter}} bosing. {{key:Esc}} uni oʻz holicha qoldiradi. Qiymat ustunga mos kelishi kerak: raqamlar raqam sifatida, sanalar `YYYY-MM-DD` shaklida, ha/yoʻq esa yes, no, true yoki false sifatida. Mos kelmagan qiymat jumla bilan rad etiladi va hech narsa oʻzgarmaydi. Boʻsh katak qiymatni boʻsh qiladi. Har bir tahrir bitta bekor qilish qadami: jadval pastida {{ui:Undo}} va {{ui:Redo}} bor, rejada esa Ctrl+Z ishlaydi.

## Ustunlar

**Ustunlar** ostida ustun qoʻshishingiz (matn, raqam, sana yoki ha/yoʻq), nomini oʻzgartirishingiz yoki olib tashlashingiz mumkin. Yangi ustun boʻsh boshlanadi. Nomni oʻzgartirish davom etadi: qatlamning yorliq ustuni va [atribut boʻyicha uslub](topic:gis-symbology) yangi nomga koʻchadi, ustunni olib tashlash esa uni ishlatgan yorliq va uslubni oʻchiradi. Har biri bitta bekor qilish qadami boʻlib, hammasini qaytaradi.

## Ustun kalkulyatori

Har bir qatorga (yoki faqat tanlangan qatorlarga) qatorning boshqa ustunlaridan, geometriyasidan va bir nechta funksiyalardan qiymat yozadi. Mavjud ustunni yoki **Yangi ustun…** ni tanlang va unga nom hamda tur bering. Hech narsa kod sifatida bajarilmaydi: ifoda belgilangan funksiyalar roʻyxatiga ega kichik tahlilchi tomonidan oʻqiladi.

| Guruh | Soʻzlar |
|---|---|
| Raqamlar | `+ - * /`, qavslar, `abs round(x, digits) floor ceil sqrt pow min max` |
| Matn | `upper lower trim len substr(text, from, count) left right replace concat` (matn 'bitta qoʻshtirnoq' ichida boʻladi; boʻshliqli ustun nomi "qoʻshtirnoq" yoki [kvadrat qavs] ichida boʻladi) |
| Tanlash | `if(test, then, else)`, `coalesce(a, b, …)`, `num(x)`, `str(x)` |
| Sanalar | `YYYY-MM-DD` qiymatining `year month day` |
| Geometriya | `$area $perimeter $length $x $y $vertices`, loyiha birliklarida |

Ustun turiga sigʻmaydigan natija (raqamlar ustunidagi matn) boʻsh qoldiriladi va xabarda sanaladi. Nolga boʻlish boʻsh qiymat beradi. Masalan, `round($area / 43560, 2)` kvadrat feet dan acres ni yozadi.

## Eksport

{{ui:Export CSV}} koʻrinadigan qatorlarni (filtr va saralashdan keyin) birinchi satrda ustun nomlari bilan UTF-8 CSV fayl sifatida saqlaydi. `=`, `+`, `-` yoki `@` bilan boshlanadigan matnning oldiga bosh apostrof qoʻyiladi, shunda elektron jadval uni formula sifatida bajarmaydi. Qatlamning oʻzini saqlash uchun [GIS uchun as-built maʼlumotlarini eksport qilish](topic:gis-export) dan foydalaning.

## Cheklovlar

Jadval qatlamni bitta saralash tartibida va bir vaqtda bitta filtr bilan koʻrsatadi. Bu yerda qatorlar qoʻshilmaydi va oʻchirilmaydi (buning oʻrniga tanlovdan yangi qatlam yarating), geometriya tahrirlanmaydi va ustun turini yaratilgandan keyin oʻzgartirib boʻlmaydi.
