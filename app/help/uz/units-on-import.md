---
title: Import qilishdagi birliklar: fayl oʻz birliklarini koʻrsatadi yoki avval soraladi
summary: Loyihaga olib kiradigan chizma yoki mesh oʻz birliklarini koʻrsatsa, CivilCraft ularni konvertatsiya qiladi va buni aytadi. Koʻrsatmasa, CivilCraft oʻqishdan oldin soraydi va bu fayl uchun javobingizni eslab qoladi.
keywords: birliklar, import, DWG, DXF, STL, OBJ, geodezik, fut, AQSH geodezik futi, metrlar, millimetrlar, masshtab, notoʻgʻri oʻlcham, juda katta, juda kichik, soʻrash, eslab qolingan, INSUNITS, chizma birliklari
from: 60921963
---

## Nima qilasiz

Faylni loyihaga olib kirasiz va u toʻgʻri oʻlchamda kirishiga ishonch hosil qilasiz.

## Qadamlar

1. Faylni odatdagidek oching: {{ui:Ochish}}, uni rejaga tashlang yoki CAD chizma buyrugʻi orqali.
2. Agar fayl oʻz birliklarini koʻrsatsa, hech narsa soralmaydi: import dialogida ular **Chizma aytganidek** sifatida koʻrsatiladi.
3. Agar koʻrsatmasa, import dialogi ochilishidan oldin dialog faylning **birliklarini** soraydi. Fayldagi bir birlik nimaligini tanlang va {{ui:Ushbu birliklardan foydalanish}} ni bosing.
4. {{ui:Bekor qilish}} (yoki {{key:Esc}}) faylni oʻtkazib yuboradi. Undan hech narsa loyihaga oʻqilmaydi.

## Qaysi fayllar oʻz birliklarini koʻrsatadi

- **DWG va DXF**: chizmaning kiritish birliklari (`$INSUNITS`). Ularsiz fayldan soraladi. Import dialogidagi **Chizma birliklari** roʻyxati sizning javobingizdan boshlanadi va uni hali oʻzgartirish mumkin.
- **STL va OBJ** (landshaft erkin shakllari): hech qachon birliklarni koʻrsatmaydi. Sizdan soraladi.
- **Nuqtalar roʻyxatlari** (CSV, TXT) va bosqichma-bosqich geodezik roʻyxatlar: birinchi qatorlarida birligini koʻrsatgan roʻyxat konvertatsiya qilinadi va holat qatorida shu aytiladi. Hech birlik koʻrsatmagan roʻyxat {{ui:Import}} tugmasini bosganingizda, nuqtalar kirishidan oldin soraladi. Kenglik va uzunlik ustunlari esa koordinata tizimi orqali oʻtadi.
- **Point clouds** qoʻshimchasi: nuqtalar buluti qurganda, agar uning fayli birlik koʻrsatmasa, soraydi va bulutning raqamlarini u olib yurgan birlikda belgilaydi.
- **IFC va LandXML**: oʻz birliklarini koʻrsatadi; ular loyiha birliklariga konvertatsiya qilinadi.
- **LAS, LAZ va balandlik rasterlari**: koordinata tizimi boʻyicha joylashtiriladi; fayl koʻrsatmasa, relyef dialogi balandlik birligini soraydi.

## Foydali maʼlumotlar

- Javob shu kompyuterdagi shu fayl uchun eslab qolinadi, har bir CadCraft ilovasida. Keyingi safar u kelganda sizdan soralmaydi.
- Yana soʻrash uchun: buyruqlar paneli ({{key:Mod+K}}) › **Import qilingan fayllarning birliklarini qayta soʻrash**.
- Birlik roʻyxati birinchi sakkiz qatoridan oʻqiladi: masalan `units: ft` kabi qator yoki barcha sarlavhalari qavs ichida bir xil birlik bilan boʻlgan ustun sarlavhalari, masalan `Elevation (m)`.
