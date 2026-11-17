---
title: Ekish rejalari va jadvallar
summary: Yakka oʻsimliklarni joylashtirish, oʻsimlik masofasi boʻyicha toʻldirilgan ekish yotoqlari va foizlar boʻyicha aralashtirilgan oʻsimliklar hamda jonli devorlar; ularga yozuv qoʻyish; elektron jadval yoki TakeoffCraft uchun oʻsimliklar jadvalida sanash.
keywords: ekish rejasi, oʻsimliklar jadvali, ekish yotogʻi, ommaviy ekish, jonli devor, daraxt, buta, yer qoplamasi, masofa, uchburchak masofa, oʻsimliklar soni, miqdorlar, yorliqlar, shox qoplami, oʻsimlik belgilari, ifc, hajmlarni hisoblash
from: ab49eab5
---

## Oʻsimliklarni joylashtirish

1. Chapdagi **Oʻsimliklar** boʻlimidan oʻsimlikni tanlang.
2. {{ui:Oʻsimlik}} ni bosing, keyin rejada bosing: har bir bosish bitta oʻsimlik joylashtiradi. Toʻxtatish uchun {{key:Esc}} ni bosing.

Oʻsimlikning belgisi voyaga yetgandagi yoyilishi boʻyicha chiziladi; Yana › {{ui:Ekish oʻlchamida koʻrsatish}} har bir oʻsimlikni ekiladigan oʻlchamida chizadi. Daraxtlar oʻz ostidagi yerda turadi: saytni keyinroq tekislasangiz, ular unga ergashadi. Oʻsimlikni balandlikda qotirish uchun uni **Xususiyatlar** da **Balandlik belgisi** ga yozing.

## Ekish yotoqlari

1. Asosiy oʻsimlikni tanlang, {{ui:Yotoq}} ni bosing va yotoqning burchaklarini bosing. Yopish uchun {{key:Enter}} ni bosing (yoki birinchi burchakni yana bosing).
2. Yotoq oʻsimlik bilan oʻz masofasida toʻladi, odatiy naqsh — **uchburchak** (har bir oʻsimlik oltitasidan bir xil masofada), chetdan masofaning yarmicha ichkarida.
3. **Xususiyatlar** da **Oʻsimlik qoʻshish** chapda tanlangan oʻsimlikni aralashtiradi. Har bir oʻsimlikning **Ulush %** ini belgilang: yotoq ularning aynan shuncha foizini oladi va butun yotoqqa tarqatadi. **Qayta aralashtirish** ularning joylashuvini almashtiradi.

**Masofa** boʻsh boʻlsa, oʻsimliklarning oʻz masofasi ishlatiladi (ulushlari boʻyicha ogʻirlashtirilgan); uni yozsangiz, u hamma oʻsimlik uchun ishlatiladi. **Naqsh** kvadrat boʻlishi mumkin, **Qatorlar burchagi** esa qatorlarni buradi.

## Jonli devorlar

Jonli devor oʻsimligini tanlang, {{ui:Jonli devor}} ni bosing, devor boʻylab bosing va {{key:Enter}} ni bosing. Oʻsimliklar chiziq boʻylab masofasida joylashadi, ikkala uchida bir xil chekinish boʻlishi uchun markazlashtiriladi. Jonli devor **ikki qator, shaxmat tartibida** boʻlishi mumkin, bir-biridan belgilangan masofada.

## Yozuvlar

Yakka oʻsimliklar yozuv sozlamasi bilan yorliqlanadi (odatda `{name}`); bitta oʻsimlik uchun oʻz yozuvingizni **Xususiyatlar** da yozing. Yotoqlar har bir oʻsimlikning soni bilan, jonli devorlar oʻz soni bilan yorliqlanadi. Yana › {{ui:Oʻsimlik yorliqlari}} yozuvlarni yoqadi va oʻchiradi. Yozuv maydonlari: `{name}`, `{botanical}`, `{size}` (idish), `{qty}`, `{height}`, `{spread}`, `{container}`.

## Oʻsimliklar jadvali

Yana › {{ui:Oʻsimliklar jadvali…}} yakka oʻsimliklar, yotoqlar va jonli devorlardan birgalikda har bir oʻsimlikni turi boʻyicha ekish oʻlchami bilan sanaydi. Uni **CSV** yoki **XLSX** sifatida saqlang, yoki **TakeoffCraft ga yuborish**: TakeoffCraft oʻsimliklar narxini belgilash uchun ochadigan miqdorlar fayli (yonida qattiq qoplama va sugʻorish miqdorlari bilan).

## IFC

Yana › {{ui:Landshaft IFC ni eksport qilish}} landshaftni BIM modeli saqlay oladigan IFC fayl (IFC 4.3) sifatida saqlaydi: har bir oʻsimlik VEGETATION turidagi `IfcGeographicElement` boʻladi, turi boʻyicha tipi va oʻsimlik xossalari bilan (botanik nomi, oʻlchamlari, chidamliligi, suv, yorugʻlik); har bir yotoq va jonli devor oʻz hisoblari bilan bitta element boʻladi, hammasi saytda. BimCraft uni bino yonida ochadi.
