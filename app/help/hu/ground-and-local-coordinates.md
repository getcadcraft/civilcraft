---
title: Terep- és helyi koordináták
summary: Munka terep- (felület-) koordinátákban, amelyeket a rácsból egy megadott vagy egy ponton kiszámított összesített méretarány-tényezővel skálázunk, vagy egy feltételezett telephálózatban, két vezérponthoz kötve.
keywords: terepi koordináták, felületi koordináták, rácsról terepre, összesített méretarány-tényező, csf, összesített tényező, rácstényező, magassági tényező, tengerszinti tényező, konvergencia, térképezési szög, méretarány-tényező, feltételezett koordináták, helyi koordináták, telephálózat, 5000 5000, vezérpontok, lokalizáció, kalibrálás, kétpontos, zárási hiba
from: 3d7453de
---

Az állami síkkoordináták (State plane) és az UTM-koordináták **rács**koordináták: a térképvetítés kissé nyújtja vagy zsugorítja a távolságokat (néhány tíz ppm mértékben), és minél magasabban fekszik a telek, annál jobban tér el a mért terepi távolság a rácstávolságtól. Sok felmérés ezért **terep**koordinátákat ad át, amelyek úgy vannak skálázva, hogy a terven lévő távolságok egyenlők legyenek a terepen mért távolságokkal, vagy egy **feltételezett** telephálózatot (5000, 5000 egy vezérponton). A CivilCraft megtartja a megadott számokat, és rögzíti, hogyan kapcsolódnak a rácshoz, így a szélességi és hosszúsági fokok, a GIS-fájlok és a térképrétegek is a helyükre kerülnek.

Nyissa meg a {{ui:Koordináták}} beállítást a {{ui:GIS}} csoportban, válassza ki (vagy hagyja meg) a rendszert, majd a **Rács-, terep- vagy helyi koordináták** alatt válasszon:

| Választás | A koordinátái | Kapcsolat a ráccsal |
|---|---|---|
| {{ui:Rács}} | A rendszer saját (a kiindulási) | Ugyanazok a számok |
| {{ui:Terep}} | Terepi távolságokra skálázva | rács = alap + összesített tényező × (terep − alap) |
| {{ui:Helyi}} | Feltételezett telephálózat | Két vezérponttal eltolva, elforgatva és a rácsra skálázva |

Bármit választ, az a projekttel együtt mentődik, és egy visszavonási lépés; semmi nem mozdul.

## Terepi koordináták

1. Válassza a {{ui:Terep}} lehetőséget.
2. Írja be a felmérésből származó **Összesített méretarány-tényezőt** (például `0.99987`), vagy számítsa ki:
   1. A **Tényező számítása egy ponton** részben a pont a projekt közepén indul. Válassza a {{ui:Pont kiválasztása az alaprajzon}} lehetőséget, és kattintson a helyre (felmérési pont közelében kattintva az a pont lesz), vagy írja be az E és N értékeket.
   2. A magasságot a felület adja meg az adott helyen; ha másra van szüksége, írjon be egy másikat.
   3. Válassza a {{ui:Számítás}} gombot. A CivilCraft megmutatja:
      - **Rácsbeli méretarány-tényező k**: mennyire nyújtja a térképvetítés a távolságokat az adott helyen.
      - **Magassági tényező**: mennyivel rövidebbek a távolságok az ellipszoidon, mint az adott magasságon.
      - **Összesített tényező** = k × magassági tényező: rácstávolság = terepi távolság × ez.
      - **Konvergencia**: a szög a rácsészak és a valódi észak között az adott helyen (geodéziai azimut = rácsazimut + konvergencia).
   4. A számok alatti {{ui:Felhasználás}} gombbal az összesített tényező bekerül a mezőbe.
3. Állítsa be az **Alappont** értékét, ahol a terep- és rácskoordináták megegyeznek. Kezdetben 0, 0. A legtöbb olyan hatóság, amely terepkoordinátákat tesz közzé, az origóhoz képest skáláz, így a terepkoordináták felismerhetően közel maradnak a rácsiakhoz. Néhány felmérés ehelyett a projekt vezérpontjához képest skáláz: azt használja, amit a felmérés előír.
4. Válassza az {{ui:Alkalmaz}} gombot.

:::warning
A magasságot az ellipszoid feletti magasságként veszi figyelembe. A CivilCraft-ban nincs geoidmodell, így ahol a geoid 30 m-rel (100 ft-tel) az ellipszoid alatt vagy felett van, a magassági tényező körülbelül 5 ppm-et téved. Ha a felmérés megadja az összesített tényezőt, azt írja be.
:::

## Helyi (feltételezett) koordináták

1. Válassza a {{ui:Helyi}} lehetőséget.
2. Az **1. vezérpont** mezőbe írja be a felmérési pont számát (vagy válassza a {{ui:Kiválasztás}} gombot, és kattintson rá a terven). Helyi koordinátái mellette megjelennek.
3. Írja be a **rácsbeli** E és N értékeit, vagy a szélességi és hosszúsági fokát a harmadik mezőbe (például `30.2672, -97.7431`).
4. Ugyanezt tegye a **2. vezérponttal**, amennyire csak lehet, az elsőtől távolabb.
5. A CivilCraft megmutatja a talált **Méretarányt** és **Elforgatást**, és emlékeztet: **Két pont mindig pontosan illeszkedik — ellenőrizzen egy harmadikat.**
6. Az **Ellenőrző pont** adatait ugyanígy adja meg. A CivilCraft megmutatja, mennyire tér el az illesztés szerint a megadott rácskoordinátáitól (ennek zárási hibáját a projekt mértékegységében és ppm-ben). Nagy zárási hiba rossz pontot, elgépelést vagy más mértékegységben megadott koordinátákat jelent.
7. Válassza az {{ui:Alkalmaz}} gombot.

Az 1-től messze eső méretarány (0,5 alatt vagy 2 fölött) elutasításra kerül: ellenőrizze a pontokat és mértékegységeiket.

## Az ellenőrzések

- A méretarány-tényező és a konvergencia egy milliárdod pontossággal egyezik a PROJ-val (pyproj 3.7.1 és PROJ 9.5.1), a koordinátakönyvtárral, amelyet a legtöbb GIS-program használ. Több mint 300 konform vetítésű rendszeren vizsgálták (állami síkkoordináták, UTM, Gauss–Krüger/transzverzális Mercator, Lambert-féle konform kúpvetület), valamint a böngészőben, a terven kiválasztott ponton.
- A terep- és helyi lépések oda-vissza egy milliárdod pontossággal alakulnak át; két vezérpont visszaadja az eredeti méretarányt és elforgatást; egy 0,05 ft-tel eltérő ellenőrző pont 0,05 ft zárási hibát mutat.
