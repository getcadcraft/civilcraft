---
title: Toʻsiqlar
summary: Chiziq, uchastka yoki platforma boʻylab toʻsiq: ustunlar, rigellar, panellar yoki shpunt, darvozalar, yer boʻylab qiyalikda yoki pogʻonali, jadval, reja belgilari va IFC elementlari. Yordamchiga ham mavjud.
keywords: toʻsiq, ustunlar, rigellar, panellar, shpunt, darvoza, qiyalikda, pogʻonali, relyef, jadval, ifc, panjara, chegara
from: c0e7b84a
---

Xususiyat chizigʻi, trassa, uchastka yoki platforma boʻylab toʻsiq yasang; uning ustunlari va darvozalari siz uchun joylashtiriladi.

## Toʻsiq yasash

1. Chiziq, uchastka yoki platformani tanlang.
2. **Sirt, Qoʻshimcha, Toʻsiqlar...** ni oching.
3. Uslubni (panellar, rigellar yoki shpunt), qiyalikda yoki pogʻonali, balandlikni, ustunlar oraligʻini va darvoza kengligini tanlang, soʻngra **Tanlov boʻylab toʻsiq** ni yoki eng uzun toʻgʻri qism oʻrtasiga darvoza qoʻyish uchun **Darvoza bilan** ni bosing.

Ustunlar uchlariga, har bir burilishga (20 daraja yoki undan koʻproq buriladigan uchga), har bir darvozaning ikki chekkasiga va orada teng boʻlimlarga qoʻyiladi; hech biri oraliqdan uzun emas. **Qiyalikda** panellar ustunlari orasidagi yerga ergashadi. **Pogʻonali** panellar tekis turadi va ustunlarda pogʻonaga tushadi; panel ostidagi boʻshliq eng pastki ustunida eng keng boʻladi, va oyna bu boʻshliq chegaradan oshsa yoki yer panel orqali koʻtarilsa, ogohlantiradi. 6 fut (1.8 m) va undan keng darvozalarda ikkita pallali boʻladi; reja pallalarni ochiq holda, ularning ochilish yoʻnalishi bilan koʻrsatadi.

## Jadval va chiqishlar

Har bir toʻsiq uzunligini, ustunlarni turi boʻyicha, panellar, darvozalar va pogʻonalarni koʻrsatadi, shuningdek ustunlar, panellar, rigellar, shpunt va darvozalar jadvali **CSV** da beriladi. Reja PDF, DXF va DWG uchun toʻsiq qatlamlariga ega (C-FENC, C-FENC-POST, C-FENC-GATE). IFC eksport ustunlarni (IfcMember, post), panellarni (IfcRailing, user defined fence panel), rigellarni (IfcMember) va darvozalarni (IfcDoor, gate) oʻz ichiga oladi, har bir toʻsiq uchun bitta tizim bilan.

## Yordamchidan

`fence_build` toʻsiq yasaydi (nuqtalar yoki nomlangan chiziq, uchastka yoki platforma, darvozalar stansiya boʻyicha), `fence_list` esa toʻsiqlarni jadvali bilan roʻyxatlaydi.

## Bajarilmaganlar

Boshlangʻich oʻlchamlar odatiy tanlovlar, qoida emas. Kutubxonadagi turlar faqat nom sifatida olib boriladi. Darvozalar bitta toʻgʻri qism ichida boʻlishi kerak. BimCraft da bu asbob hali yoʻq.
