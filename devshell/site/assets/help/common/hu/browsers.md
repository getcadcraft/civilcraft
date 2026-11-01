---
title: Böngészők és számítógépek
summary: Mely böngészőkben futnak az alkalmazások, mi a különbség köztük, és mire van szüksége a számítógépének.
keywords: chrome, edge, firefox, safari, brave, böngésző, mac, windows, linux, ipad, táblagép, webgl, követelmények, memória
from: a11b09b1
---

Az alkalmazások webböngészőben futnak. A munkát a saját számítógépe végzi: a fájlokat ott nyitja meg, és soha nem küldjük el nekünk (lásd: [Hová kerülnek a fájljai](common:your-files)).

## Melyik böngészőt használja

Használja az alábbiak valamelyikének naprakész verzióját:

| Böngésző | Motor | Megjegyzések |
|---|---|---|
| Chrome, Edge, Brave, Opera, Vivaldi | Chromium | A legteljesebb: mappaválasztás, mentés offline használatra, fájlkezelés. |
| Firefox | Gecko | Működik. Egy egész mappa megnyitása egyszerűbb választót használ. Privát ablakokban az offline mentés nem biztos, hogy működik. |
| Safari | WebKit | Működik Mac-en és iPaden. Egy egész mappa megnyitása egyszerűbb választót használ. A Safari törölheti azt az offline másolatot, amelyet néhány hete nem használt. |

Mindhárom motor megfelel a mindennapi munkához. Ha egy alkalmazás valamelyikben másképp működik, a súgója az Ön böngészőjéhez tartozó lépéseket mutatja.

## Mi különbözik a böngészők között

- **Mappa megnyitása.** A Chromium alapú böngészők valódi mappaválasztót mutatnak, és közvetlenül tudják olvasni a mappát. A Firefox és a Safari arra kéri, hogy válasszon ki egy mappát, majd beolvassa az összes fájlt benne, ami nagy projektmappáknál tovább tart; a mappa ráhúzása az alkalmazásra mindhárom böngészőben működik.
- **Mentés.** Az alkalmazások fájl letöltésével mentenek. A böngésző dönti el, hová kerülnek a letöltések, és hogy rákérdez-e előtte.

:::chromium
A Chrome-ban vagy az Edge-ben kapcsolja be a „Letöltés előtt rákérdezés a fájlok mentési helyére” beállítást (a Beállításokban, a Letöltések alatt), hogy minden alkalommal mappát választhasson.
:::

:::firefox
A Firefoxban nyissa meg a Beállításokat, majd az Általános részt, majd a Letöltések szakaszt, és válassza a „Mindig kérdezzen, hová mentse a fájlokat” lehetőséget, hogy minden alkalommal mappát választhasson.
:::

:::safari
A Safariban nyissa meg a Beállításokat, majd az Általános részt, és állítsa a „Fájlletöltés helye” értékét „Rákérdezés minden letöltésnél” értékre, hogy minden alkalommal mappát választhasson.
:::

## Mac, Windows és Linux

Az alkalmazások minden számítógépen ugyanazok. A billentyűzet változik: a billentyűparancsok automatikusan az Ön számítógépének megfelelően vannak leírva. Lásd: [Billentyűk, egerek és érintőpadok](common:keys).

## Táblagépek és érintőképernyők

Egyes alkalmazások fogadnak érintést (egy ujj rajzol vagy kijelöl, két ujj összehúzással nagyít és eltol). Az egyes alkalmazások súgója megmondja, hogy ez rájuk igaz-e. iPaden használja a Safarit vagy a Chrome-ot. A billentyűzet segít a beírt parancsokat használó alkalmazásoknál.

## A legrégebbi böngésző és rendszer

Ezeket a 0.7-es alkalmazások kódjából olvastuk ki, nem találgatásból: minden fájlt feldolgoztunk, és az általa használt nyelvi funkciókat megkerestük a böngészők közzétett kompatibilitási adataiban. Ezeknél a verzióknál régebbi böngészőben az alkalmazások el sem tudnak indulni, mert a böngésző nem érti a kódot.

| | A legrégebbi verzió, amely el tudja indítani az alkalmazásokat |
|---|---|
| Chrome, Edge, Brave, Opera, Vivaldi | Chromium 94 |
| Firefox | 93 |
| Safari (Mac, iPad, iPhone) | 16.4 (macOS 13.3, iPadOS és iOS 16.4) |

A CadCraft Studio Windowson saját webmotort hoz magával, ezért Windows 10 vagy 11 kell hozzá; Mac-en a rendszer motorját használja, ezért macOS 13.3 vagy újabb kell hozzá. A Studio Beállítások › Frissítések oldala megmutatja, min fut az Ön példánya.

Ez a legrégebbi verzió, amely *elindul*, a kódból kiolvasva. Nem azon régi böngészők listája, amelyekben kipróbáltuk az alkalmazásokat, ezért egy régebbi, de elinduló böngészőből még hiányozhat egy funkció.

## Mire van szüksége a számítógépének

Ezek az alkalmazások tervezett minimumai, nem mért követelmények:

- 8 GB memória (nagy, összevont modellekhez 16 GB ajánlott).
- WebGL 2-t támogató grafikus chip a 3D alkalmazásokhoz. Ha egy 3D nézet üres marad, ellenőrizze, hogy a hardveres gyorsítás be van kapcsolva a böngésző beállításaiban.
- Legalább 1280 képpont széles képernyő a teljes eszköztárakhoz; a kisebb képernyők tördelik őket.

A nagyon nagy fájlok (nagy tervkészletek, nagy modellek) sok memóriát használnak egy böngészőlapon. Zárja be a többi nagy erőforrásigényű lapot, ha egy alkalmazás lelassul.
