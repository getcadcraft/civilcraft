---
title: Ishchi jadvallar: obyektlarga bogʻlangan jadvallar
summary: Oʻsimliklar, ekilgan maydonlar, qoplamalar, devorlar, zinapoyalar, yer oʻzgartirgichlar yoki barcha miqdorlardan qatorli saqlangan ishchi jadvallar; oʻz ustunlaringiz va formulalaringiz, guruhlar va jamilar; CSV, XLSX va varaqlardagi jadval, doim yangilangan holda.
keywords: ishchi jadval, jadval, oʻsimliklar jadvali, qattiq qoplamalar jadvali, miqdorlar, ustunlar, formula, jami, yigʻindi, hisoblash, guruh, filtr, csv, xlsx, elektron jadval, varaqdagi jadval
from: 11bc1bac
---

{{ui:Ishchi jadvallar}} (Landshaft › Yana) ushbu loyihaning ishchi jadvallarini ochadi. Birinchi marta **oʻsimliklar jadvali** va **qattiq qoplamalar va maydonlar jadvali** siz uchun tayyorlanadi. Ishchi jadval har safar koʻrsatilganda, yozilganda yoki varaqqa qoʻyilganda obyektlardan hisoblanadi: yotoqni oʻzgartiring — uning hisoblari hamma joyda oʻzgaradi.

- **Qatorlar manbasi**: oʻsimliklar (har bir tur, navli va oʻlchamga bitta qator), ekilgan maydonlar, qoplama, devorlar, zinapoyalar, yer oʻzgartirgichlar (kesish va toʻldirish) yoki barcha miqdorlar.
- **Ustunlar**: maydon (`qty`, `area`, `botanical` yoki `[Net area]` kabi qavsdagi nom) yoki formula: `+ - * / ^ %`, matnni birlashtirish uchun `&`, `= <> < <= > >=` va `round`, `ceil`, `floor`, `abs`, `sqrt`, `min`, `max`, `if`, `and`, `or`, `not`, `concat`, `upper`, `lower`, `len`, `text`. Hisoblab boʻlmaydigan formula katakchasida `#ERR` (yoki `#DIV/0`) koʻrsatiladi. Formulalarni CadCraftʼning oʻz tahlilchisi oʻqiydi; ulardagi hech narsa kod sifatida ishga tushirilmaydi.
- Har bir ustun uchun **Jami** (yigʻindi, son, oʻrtacha, eng kichik, eng katta), **Guruhlash** (har bir guruh uchun oraliq jami) va **Faqat shu shartli qatorlar**.
- {{ui:CSV sifatida saqlash}}, {{ui:XLSX sifatida saqlash}} va **Bu ishchi jadvalni varaqlarga qoʻyish** (Varaqlar › Ishchi jadvallar uni jadval sifatida chizadi, kerakli sonidagi varaqlar boʻylab).

Oʻsimliklar va maydonlardagi yozuvlar xuddi shu maydon nomlarini oʻqiydi (`{botanical}`, `{cultivar}`, `{size}`, `{qty}`).
