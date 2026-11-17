---
title: Rejani DXF ga eksport qilish
summary: Reja chiziqlarini nomlangan qatlamlarda R12 DXF sifatida yozing: konturlar oʻz balandliklarida, sinuvchi chiziqlar 3D da, istalgan CAD dasturi uchun.
keywords: dxf, dwg, cad, eksport, chiziqlar, r12, 2000, 2004, 2007, 2010, 2013, 2018, qatlamlar, konturlar, chizma almashinuvi, asosiy xarita, fon
from: f2d8ede9
---

{{ui:DXF}} rejada koʻrsatilganini R12 formatidagi DXF fayl sifatida yozadi, bu har qanday CAD dasturi ochadigan versiya. Agar AutoCAD yoki Civil 3D dan foydalangan boʻlsangiz, uni istalgan boshqa DXF kabi oching yoki joylashtiring.

## Eksport

1. Chizmani xohlaganingizdek sozlang: **Koʻrinish** ostida sirtni (mavjud yoki loyihalangan), kontur oraligʻini va qaysi narsalar yoqilishini tanlang (konturlar, yorliqlar, nuqtalar, nuqta yorliqlari, uchburchaklar, sinuvchi chiziqlar, sirt chegarasi, quvurlar, qiyalik strelkalari).
2. **Eksport** guruhida {{ui:DWG/DXF}} ni bosing, {{ui:DXF (R12, text) — the plain exchange file}} ni tanlang, soʻng {{ui:Download}} ni bosing.
3. Brauzer `<name>.dxf` faylini yuklab oladi. Holat paneli masalan shunday xabar koʻrsatadi: "Exported R12 DXF: 2,140 objects; labels sized for 1" = 40'. Bands are not exported."

Koordinatalar loyiha birliklarida, haqiqiy qiymatlarida yoziladi (state plane koordinatalari oʻz holicha qoladi). Hech narsa masshtablanmaydi yoki siljitilmaydi.

## Fayl tarkibi

| Narsa | DXF obyekti | Qatlam |
|---|---|---|
| Kichik va katta konturlar | Balandligida 2D polichiziqlar | C-TOPO-MINR, C-TOPO-MAJR |
| Kontur yorliqlari | Matn | C-TOPO-TEXT |
| Uchburchaklar | Polichiziqlar | C-TOPO-TINN |
| Sinuvchi chiziqlar va chegara | 3D polichiziqlar | C-TOPO-BRKL |
| Sirt chegarasi | Polichiziqlar | C-TOPO-BNDY |
| Qiyalik strelkalari | Polichiziqlar | C-TOPO-SLOP |
| Geodezik nuqtalar va ularning yorliqlari | Nuqtalar (balandligi bilan), matn | V-NODE, V-NODE-TEXT |
| Chiziq kodlaridan olingan chiziqlar | 3D polichiziqlar | V-NODE-LINE |
| Trassa oʻq chiziqlari | Chiziqlar va yoylar | C-ROAD-CNTR |
| Pikketaj belgilari va yorliqlari | Polichiziqlar, matn | C-ROAD-STAN |
| Koridor chegaralari | Polichiziqlar | C-ROAD-CORR |
| Namuna chiziqlari | Polichiziqlar | C-ROAD-SCTN |
| Platformalar, yerga chiqish chiziqlari, qiyalik chiziqlari | Polichiziqlar | C-GRAD-PADS, C-GRAD-DAYL, C-GRAD-SLOP |
| Xususiyat chiziqlari | 3D polichiziqlar (yoylar 0.01 ichida boʻlaklar sifatida; qarang: [Xususiyat chiziqlari](topic:feature-lines)) | C-GRAD-FEAT |
| Burilish trayektoriyalari | Polichiziqlar, matn | C-ROAD-SWPT |
| Quvurlar, inshootlar, yorliqlar | Polichiziqlar, matn | C-STRM-PIPE, C-STRM-STRC, C-STRM-TEXT |
| Muammoli quvurlar va inshootlar | Polichiziqlar | C-STRM-PROB |

Har bir qatlamning rangi bor. Toʻliq roʻyxat: [Reja qatlamlari](topic:plan-layers).

## Yorliq oʻlchami

Matn chizma birliklarida oʻlchamga ega boʻlishi kerak. CivilCraft yorliqlarni butun reja Tabloid varagʻiga (fut) yoki A3 varagʻiga (metr) sigʻadigan masshtab uchun oʻlchaydi va masshtabni holat xabarida koʻrsatadi. Agar CAD dasturingizda boshqa masshtabda chop etsangiz, matnni u yerda masshtablang.

## Eksport qilinmaydigan narsalar

- Balandlik polosalari (faqat ekranda).
- Profil koʻrinishi. Profillar chizma sifatida emas, LandXML sifatida chiqadi.
- Sirtning oʻzi 3D obyekt sifatida. TIN uchun LandXML dan foydalaning yoki uning qirralarini chiziq sifatida olish uchun {{ui:Triangles}} ni yoqing.
- **Koʻrinish** ostida oʻchirilgan har qanday narsa.

## DWG

{{ui:DWG/DXF}} bir xil chiziqlarni DWG chizma sifatida ham yozadi. Uning oynasi formatni soʻraydi: DXF yoki 2000, 2004, 2007, 2010, 2013 yoki 2018 DWG. 2000 deyarli barcha CAD dasturlarida, eski va yangi, ochiladi; chizmani oluvchi yangiroq formatni soʻrasa, shuni tanlang. Tanlovingiz shu brauzerda eslab qolinadi.

1. **Eksport** guruhida {{ui:DWG}} ni bosing.
2. **Format** ni tanlang va **DWG ni yuklab olish** tugmasini bosing.
3. Brauzer `<name>.dwg` faylini yuklab oladi. Holat paneli nima kiritilganini koʻrsatadi, masalan: "Exported DWG (2018 format): 12 polylines, 40 labels on 9 layers".

DWG da DXF bilan bir xil qatlamlar, ranglar, konturlar (oʻz balandligida polichiziqlar sifatida), 3D sinuvchi chiziqlar, yorliqlar va nuqtalar bor, bir xil koordinatalarda. DWG saqlay olmaydigan qatlam nomlari oʻzgartiriladi va holat xabari buni aytadi. CivilCraft DWG ni oʻz kodi bilan yozadi, shuning uchun hech narsa kompyuteringizdan chiqmaydi.

### DWG dagi xarita qatlamlari

DWG chizma ichida rasmni saqlay olmaydi: CAD dasturlari chizma yonida turgan rasmni koʻrsatadi. Xarita qatlamlari koʻrinib turganda, oynada **Xarita qatlamlari chizma yonida rasm sifatida** variant chiqadi. U belgilangan boʻlsa, yuklab olish `.zip` boʻladi: u `<name>.dwg`, `<name>-map.png` (butun chizma boʻylab xarita qatlamlari, 4,096 piksel kenglikkacha) va `<name>-map.pgw` (GIS dasturlari uchun dunyo fayli) ni oʻz ichiga oladi. Chizma rasmni G-MAP-IMAG qatlamida, oʻz joyida, tasvir sifatida koʻrsatadi. Fayllarni bitta papkaga oching va birga saqlang.
