---
title: Kerítések
summary: Kerítés egy jellemzővonal, nyomvonal, telek vagy tereplépcső mentén: oszlopok, keresztrúdak, panelek vagy lécek, kapuk, lejtősen vagy lépcsősen a terepen, kimutatás, alaprajzi jelek és IFC-elemek. Asszisztens is elérheti.
keywords: kerítés, oszlopok, keresztrúdak, panelek, lécek, kapu, lejtős, lépcsős, terep, kimutatás, ifc, korlát, határ
from: c0e7b84a
---

Kerítést készíthet egy jellemzővonal, nyomvonal, telek vagy tereplépcső mentén, az oszlopaival és kapuival együtt, amelyeket a program helyez el.

## Kerítés készítése

1. Jelöljön ki egy vonalat, egy telket vagy egy tereplépcsőt.
2. Nyissa meg a **Felület, További, Kerítések...** menüpontot.
3. Válassza ki a stílust (panelek, keresztrúdak vagy lécek), a lejtős vagy lépcsős kialakítást, a magasságot, az oszlopok közötti távolságot és a kapu szélességét, majd a **Kerítés a kijelölés mentén** gombot, vagy a **Kapuval** gombot, amellyel a leghosszabb egyenes szakasz közepére kerül kapu.

Oszlopok kerülnek a végekre, minden sarokra (a csúcsra, ahol az irány legalább 20 fokkal fordul), minden kapu mindkét szélére, valamint az egyenlő mezőkre a két oszlop között; egyik mező sem lehet hosszabb a megadott távolságnál. A **lejtős** panelek követik a terepet az oszlopaik között. A **lépcsős** panelek vízszintesek maradnak, és az oszlopoknál lépcsőznek; a panel alatti rés a lejtés felőli oszlopnál a legszélesebb, és a párbeszédpanel figyelmeztet, ha ez a rés meghaladja a határt, vagy ha a terep átnyúlik egy panelen. A 6 ft (1,8 m) vagy szélesebb kapuk két szárnyat kapnak; az alaprajzon a szárnyak nyitott állapotban, a nyitási irányukkal együtt látszanak.

## Kimutatás és kimenetek

Minden kerítés megmutatja a hosszát, az oszlopokat fajtánként, a paneleket, a kapukat és a lépcsőket, valamint a **CSV** kimutatást az oszlopokról, panelekről, keresztrúdakról, lécekről és kapukról. Az alaprajz kerítésrétegekkel rendelkezik (C-FENC, C-FENC-POST, C-FENC-GATE) a PDF, DXF és DWG formátumhoz. Az IFC-export tartalmazza az oszlopokat (IfcMember, post), a paneleket (IfcRailing, user defined fence panel), a keresztrúdakat (IfcMember) és a kapukat (IfcDoor, gate), kerítésenként egy rendszerként.

## Asszisztenstől

A `fence_build` kerítést készít (pontokból vagy megnevezett vonalból, telekből vagy tereplépcsőből; a kapuk szelvényszám szerint), a `fence_list` pedig felsorolja a kerítéseket a kimutatásukkal együtt.

## Ami még nincs kész

A kezdő méretek szokásos választások, nem szabvány. A könyvtárból származó típusok csak névként kerülnek át. A kapuknak egyetlen egyenes szakaszon kell lenniük. A BimCraftban ez az eszköz még nincs meg.
