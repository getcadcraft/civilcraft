---
title: Saytdagi quyosh soatlarini hisoblash
summary: Kunni (yoki faslni) va vaqt mintaqasini tanlang hamda har bir bino massasining har bir devorida va ular atrofidagi yerda toʻgʻridan-toʻgʻri quyosh soatlarini koʻring; yer rejada chiziladi, raqamlar CSV sifatida chiqadi.
keywords: quyosh, quyosh soatlari, soya, soyalash, quyosh yetarliligi, kunduzgi soatlar, fasad, devor, fasl, quyosh turishi, tenglik, vaqt mintaqasi, yoz vaqti, kenglik, uzunlik, CSV, rastr
from: 4e32a314
---

**Quyosh soatlari** har bir bino massasining har bir devoriga va ular atrofidagi yerga yetib boradigan toʻgʻridan-toʻgʻri quyosh soatlarini sanaydi — siz tanlagan kun boʻyicha yoki faslga oʻrtacha. Massalar va yerning oʻzi soya tashlaydi; boshqa hech narsa (daraxt, siz chizmagan qoʻshni binolar) soya tashlamaydi. Toʻgʻridan-toʻgʻri quyosh boʻlmagan osmon yorugʻligi hisobga olinmaydi.

## Boshlashdan oldin

Quyoshning oʻrni saytning kenglik va uzunligidan olinadi, ular esa loyihaning **koordinatalar tizimi** dan keladi. Koordinatalar tizimi yoʻq loyiha xabar bilan rad etiladi: avval uni oʻrnating (**GIS** guruhidagi **Koordinatalar**). Qoʻlda kiritilgan kenglik va uzunlik taxmin boʻlardi, shuning uchun ular uchun maydon yoʻq.

## Hisoblash

**Xossalar** ichida, **Bino massalari** ostida, **Quyosh soatlari**:

1. **Kun** ni tanlang. U siz turgan joydagi quyosh eng past boʻlgan kundan boshlanadi (21 dekabr, yoki janubiy yarim sharda 21 iyun). Faslga **Fasl boʻyicha** ni belgilang, **Oxirgi kun** va namuna olish oraligʻini (necha kunda bir marta) tanlang.
2. **Vaqt mintaqasi** ni kiriting: `America/Mexico_City` kabi nom yoki UTC dan farq kabi `-6`. Nom oʻsha kun uchun shu mintaqaning yoz vaqti qoidalariga amal qiladi; oʻzingiz kiritgan farq aynan kiritilganidek ishlatiladi, shuning uchun oʻsha kunda amal qiladigan farqni kiriting. Qutining ostidagi chiziq topilgan farqni koʻrsatadi.
3. Quyoshni qanchalik tez-tez joylashtirish kerakligini tanlang (har 5, 10, 15 yoki 30 daqiqa), soʻng **Quyosh soatlarini hisoblash**. Faslni fon ishchilari bajaradi; **Toʻxtatish** uni bekor qiladi.

## Nima olasiz

- Massa boʻyicha jadval: **eng yomon devor**, **oʻrtacha** va **eng yaxshi devor** kuniga soatlarda, hamda har bir devorning jadvali — qaysi tomonga qaragani va har bir qavat boʻyicha soatlari bilan.
- Massalar atrofidagi yer rejada chiziladi: qorongʻidan (quyoshsiz) sariqgacha (har bir katak olishi mumkin boʻlgan eng koʻp), izoh bilan. Massa ostidagi kataklar boʻsh qoldiriladi. **Yerni rejada koʻrsatish** uni oʻchiradi.
- **Devorlar CSV** va **Yer CSV** raqamlarni saqlaydi.

Faslda raqamlar namuna olingan kunlar boʻyicha kunlik oʻrtacha qiymatlardir. Loyihaga hech narsa saqlanmaydi: natija koʻrish uchun, uni qayta ishga tushirish esa qayta yaratadi.

## Yaxshi bilish kerak

- Devor biror daqiqani faqat quyoshga qaragan va yoʻlida hech narsa boʻlmasa quyoshli deb sanaydi. Orqaga qaragan devor hech narsa olmaydi.
- Yer tanlangan vaqt qadamiga va sayt oʻlchamiga bogʻliq toʻr boʻyicha namuna olinadi; quyoshning oʻrni har bir vaqt qadamining oʻrtasida olinadi, shuning uchun soatlar tanlagan qadam aniqligida toʻgʻri.
- Quyoshning oʻrni nashr etilgan astronomik formula boʻyicha, bir yoy daqiqasi aniqligida hisoblanadi.
