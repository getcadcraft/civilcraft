---
title: Reja qatlamlari
summary: CivilCraft ekranda, DXF va PDF da ishlatadigan qat'iy qatlam nomlari, ranglari va chiziq qalinliklari hamda har birini boshqaradigan koʻrsatish sozlamasi.
keywords: qatlamlar, qatlam nomlari, ncs, ranglar, aci, chiziq qalinliklari, dxf qatlamlari, pdf, koʻrsatish sozlamalari, chiziqlar
from: c2aa8475
---

Rejadagi hamma narsa qatlamga tegishli. Nomlar odatdagi fuqarolik qatlam tuzilishiga (soha, asosiy guruh, kichik guruh) amal qiladi. Qatlamlar bu versiyada qat'iy: ularni qayta nomlab boʻlmaydi, ranglarini oʻzgartirib boʻlmaydi yoki oʻz qatlamingizni qoʻshib boʻlmaydi. DXF da har bir qatlamning koʻrsatilgan rang raqami bor; {{ui:PDF}} da {{ui:Qatlam ranglari}} bilan xuddi shu ranglar ishlatiladi, {{ui:Qora}} tanlanganda esa hamma narsa qora chop etiladi.

| Qatlam | Tarkibi | Rang (DXF raqami) | Qachon koʻrsatiladi |
|---|---|---|---|
| C-TOPO-MINR | Kichik gorizontallar | Kulrang (8) | {{ui:Gorizontallar}} |
| C-TOPO-MAJR | Asosiy gorizontallar | Oq yoki qora (7) | {{ui:Gorizontallar}} |
| C-TOPO-TEXT | Kontur yozuvlari | Oq yoki qora (7) | {{ui:Gorizontallar}} va {{ui:Kontur yozuvlari}} |
| C-TOPO-TINN | Uchburchak qirralari | Kulrang (8) | {{ui:Uchburchaklar}} |
| C-TOPO-BRKL | Uzilish chiziqlari va chegara | Toʻq sariq (30) | {{ui:Uzilish chiziqlari}} |
| C-TOPO-BNDY | Yuza chegarasi | Oq yoki qora (7) | {{ui:Yuza chegarasi}} |
| C-TOPO-SLOP | Nishablik strelkalari | Zangori (4) | {{ui:Nishablik strelkalari}} |
| V-NODE | Geodezik nuqtalar | Yashil (3) | {{ui:Nuqtalar}} |
| V-NODE-TEXT | Nuqta yozuvlari: raqam, balandlik, tavsif | Yashil (3) | {{ui:Nuqtalar}} va {{ui:Nuqta yozuvlari}} |
| V-NODE-LINE | Chiziq kodlaridan olingan chiziqlar (uzilish chiziqlari boʻlmagan guruhlar) | Yashil (3) | {{ui:Nuqtalar}} |
| C-ROAD-CNTR | Trassa oʻq chiziqlari | Qizil (1) | Doim |
| C-ROAD-STAN | Piket belgilari va yozuvlari, PC va PT | Qizil (1) | Doim |
| C-ROAD-CORR | Koridor chegaralari | Sariq (2) | Doim |
| C-ROAD-SCTN | Namuna chiziqlari (kesimlar kesiladigan joylar) | Kulrang (8) | Trassada namuna chiziqlari boʻlganda |
| C-GRAD-PADS | Platforma konturlari | Koʻk (5) | Doim |
| C-GRAD-DAYL | Chiqish chiziqlari | Binafsha (6) | Doim |
| C-GRAD-SLOP | Yerni tekislash nishablik chiziqlari | Binafsha (6) | Doim |
| C-GRAD-FEAT | Xarakterli chiziqlar (3D) | Yashil (3) | Doim |
| C-ROAD-SWPT | Burilish yoʻllari: kontur, eng tashqi gʻildirak izlari, nom | Toʻq sariq (30) | Doim |
| C-STRM-PIPE | Quvurlar | Koʻk (5) | {{ui:Quvurlar}} |
| C-STRM-STRC | Inshootlar | Koʻk (5) | {{ui:Quvurlar}} |
| C-STRM-TEXT | Quvur va inshoot yozuvlari | Koʻk (5) | {{ui:Quvurlar}} |
| C-STRM-PROB | Muammoli quvurlar va inshootlar | Qizil (1) | {{ui:Quvurlar}} |

Uzilish chiziqlari faqat **{{ui:Koʻrsatish}}** ostidagi **Yuza** {{ui:Mavjud yer}} boʻlganda chiziladi; chegara ikkala yuza bilan ham chiziladi.

## PDF da chiziq qalinliklari

| Qalinlik | Qatlamlar |
|---|---|
| 0.50 mm | Trassa oʻq chiziqlari, platformalar, quvurlar, muammoli quvurlar |
| 0.35 mm | Asosiy gorizontallar, chiqish chiziqlari, inshootlar |
| 0.25 mm | Uzilish chiziqlari |
| 0.13 mm | Kichik gorizontallar |
| 0.09 mm | Uchburchak qirralari, yerni tekislash nishablik chiziqlari |
| 0.18 mm | Qolgan hammasi |

DXF fayllarda chiziq qalinliklari saqlanmaydi; ularni CAD dasturingizda qatlam boʻyicha belgilang.

## Yozuvlar oʻlchamlari

Yozuvlar qogʻozda oʻlchanadi: kontur yozuvlari 2.0 mm, piket yozuvlari 1.8 mm, PC va PT yozuvlari hamda quvur va inshoot yozuvlari 1.6 mm, nuqta yozuvlari 1.5 mm. Quvur yozuvlarida nomi, diametri va nishabligi; inshoot yozuvlarida nomi va qopqoq balandligi koʻrsatiladi. Ekranda ular kattalashtirganda oʻzgarmaydi. DXF da ular eksport xabarida koʻrsatilgan masshtab boʻyicha moslanadi; qarang: [Rejani DXF ga eksport qilish](topic:dxf-export).

## Hech qaysi qatlamda koʻrsatilmaydi

Balandlik polosalari faqat ekranda chiziqlar ostida chiziladi. Profil koʻrinishi rejaga kirmaydi.
