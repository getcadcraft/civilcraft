---
title: CivilCraft beállításai
summary: A másolt és beillesztett pontsorok oszlopsorrendje és a fájlok oszlopainak felismerése, a beillesztett pontok számozása, mit mutatnak a pontfeliratok, a sarokjelző, a 3D függőleges nagyítása, a szélesség és hosszúság megjelenítése, és hogy a térképrétegek az internetről jönnek-e.
keywords: beállítások, beállítás, pnezd, penzd, oszlopsorrend, pontsorok, újraszámozás, pontszámok, kezdőszám, pontfeliratok, feliratok, leírás, magasság, nézetkocka, tengelyjel, sarokjelző, iránytű, függőleges nagyítás, 3d, szélesség, hosszúság, fok perc másodperc, tizedes fok, térképrétegek, internet, adatvédelem
from: 64b9cb92
---

Nyissa meg a {{ui:Beállítások}} ablakot az alkalmazássáv fogaskerekével, vagy a {{key:Mod+,}} billentyűkombinációval. Az első lap, a {{ui:CivilCraft}}, az alkalmazáshoz tartozó beállításokat tartalmazza; a {{ui:Általános}} azokat, amelyeket minden CadCraft-alkalmazás közösen használ (téma, eszköztár, panelek). A CivilCraft beállításai csak az alkalmazásban léteznek: itt módosítja őket, és ez a böngésző megjegyzi azokat. A {{ui:CivilCraft-beállítások visszaállítása}} minden beállítást a kezdő értékre állít.

## Pontsorok

**P, N, E, Z, D** (kezdeti érték) vagy **P, E, N, Z, D**: pont, északi koordináta (N), keleti koordináta (E), magasság (Z), leírás (D), illetve a keleti koordináta az északi előtt. Három helyen használják:

- **Másolás**: a CivilCraft által a vágólapra helyezett sorok táblázatkezelőhöz.
- **Beillesztés**: táblázatból vagy szövegfájlból beillesztett sorok, amelyekben nincs fejléc.
- **Importálás**: a találgatás a **Pontok importálása** párbeszédpanelen, ha egy fájlnak nincs fejléc sora (a négy oszlopos fájl PENZ-ként, a három oszlopos ENZ-ként olvasódik). Lásd: [Pontfájl-formátumok](topic:point-file-formats).

A fejléc, amely megnevezi az oszlopait, mindig nyer, ugyanígy az importáló párbeszédpanel **Oszlopok** listájában tett választás is.

## Számok a beillesztett pontokhoz

- **Szabad számok megtartása** (kezdeti érték): a beillesztett pont megtartja számát, ha nincs más pont azzal a számmal; csak az ütköző pontok kapnak új számot.
- **Mindig új számok**: minden beillesztett pont új számot kap, még akkor is, ha a sajátja szabad.

**Új számok kezdete**: hagyja üresen, hogy a használt legnagyobb számnál eggyel nagyobbtól számoljon. Írjon be egy számot, például 5000-et, hogy az új pontok 5000-től kapjanak számot; a már használt számokat kihagyja. Két pont sosem osztozik egy számon, bármelyik módot is választja. Lásd: [Felmérési pontok kijelölése, másolása és beillesztése](topic:copy-paste-points#point-numbers-never-clash).

## Pontfeliratok

Mit mutat a pontfelirat, ha a **Megjelenítés** alatti {{ui:Pontfeliratok}} be van kapcsolva: **Szám**, **Szám és magasság**, vagy **Szám, magasság és leírás** (kezdeti érték). A DXF-, DWG- és PDF-exportok ugyanazokat a feliratokat mutatják, mint a képernyő.

## Sarokjelző

Ami a alaprajz és a 3D-nézet sarkában látszik: **Nézetkocka** (kezdeti érték), **Tengelyjel** vagy **Nincs**.

- **Nézetkocka** (jobb felül). Az alaprajzon a felső oldalt mutatja, az iránytűgyűrűvel: N a rácsészak (az alaprajz felfelé). Kattintson a kocka bármely más oldalára, élére vagy sarkára, vagy húzza el, és a [3D-nézet](topic:site-3d) az adott irányból nyílik meg. Az alaprajz kockáján a {{ui:Kezdőlap}} az alaprajzot illeszti a nézetbe.
- A 3D-nézetben a kocka a nézettel együtt fordul: kattintson egy oldalra, élre vagy sarokra, hogy onnan nézzen rá; húzza a kockát a körbeforgatáshoz; húzza az iránytűgyűrűt a függőleges tengely körüli forgatáshoz; kattintson egy betűre, hogy az adott oldalról nézzen rá; a {{ui:Kezdőlap}} adja a teljes terület izometrikus nézetét. Ha egy oldalra egyenesen néz, a kis nyilak a következő oldalra lépnek, a görbe nyilak pedig negyed fordulatot fordítanak a nézeten.
- **Tengelyjel** (bal alul): kis X (kelet) és Y (észak) jel az alaprajzon, X, Y és Z (felfelé) a 3D-ben.

## 3D függőleges nagyítás

Mennyire nyújtja a 3D-nézet a magasságokat: **1×**, **2×** (kezdeti érték), **3×**, **5×** vagy **10×**. A 3D-nézet sávján lévő lista ugyanez a beállítás, így bármelyiket változtatja, mindkettő változik. A térfogatok, a hossz-szelvények és a 3D-exportok valós méretarányban maradnak.

## Szélesség és hosszúság

Ahogyan az állapotsor megmutatja a mutató szélességét és hosszúságát, ha a projektnek van koordináta-rendszere: **fok, perc és másodperc** (kezdeti érték, például `30°18′00.00″ N`), vagy **tizedes fok** (`30.300000° N`). Lásd: [A projekt koordináta-rendszerének beállítása](topic:coordinate-systems#latitude-and-longitude-in-the-status-bar).

## Térképrétegek az internetről

**Ki** (kezdeti érték) vagy **Be**. Be állapotban a CivilCraft a hozzáadott térképszervereket kéri a képernyőn látható területről készült képekért. A rajza ezen a számítógépen marad; a szerver a területet és az internetes címét látja. Ki állapotban egyetlen térképszervertől sem kér semmit, akkor sem, ha a megnyitott projekt megnevez egyet; a fájlból érkező, georeferált kép mindkét esetben működik. Lásd: [Térképrétegek megjelenítése az alaprajz alatt](topic:map-layers).

## Asszisztensek

Az **MI-asszisztensek és szkriptek használhassák a CivilCraftot** (kezdetben ki) lehetővé teszi, hogy a számítógépen lévő asszisztens a CadCraft Studion keresztül elérje a megnyitott területet: a **Olvasás** leírja a területet, és megadja a pontokat, felszíni magasságokat, szelvényszámokat, hossz-szelvényeket, térfogatokat és telkeket; a **Szerkesztés** kijelölhet és felmérési pontokat adhat hozzá; a **Mentés** és az **Exportálás** menti a projektet, illetve LandXML vagy DWG fájlt ír. A **Használható mappák** (a Studióban) azok a helyek, ahová menthet és exportálhat. A **Tevékenység** felsorolja a hívásait. Lásd: [Asszisztens használata a területtel](topic:assistants).
