---
title: Parkoló elrendezése
summary: Parkolóhelyek, közlekedők, mozgáskorlátozott és furgonos helyek, valamint szigetek elrendezése egy körvonalon belül, a parkoló tereprendezése lefolyókig tartó eséssel a meglévő terephez képest, majd burkolás és beültetés. Asszisztens is elérheti.
keywords: parkoló, parkolóhely, közlekedő, mozgáskorlátozott, ada, furgon, sziget, lefolyó, esés, tereprendezés, bevágás, feltöltés, burkolás, térkő, beültetés, fák, terep, pontfelhő, mcp, asszisztens
from: 06c14da9
---

Illesszen parkolót egy telekbe, tereplépcsőbe vagy zárt jellemzővonalba, és egy lépésben kapja meg a darabszámokat, a tereprendezést és a burkolást.

## Elrendezés

1. Jelöljön ki egy telket, tereplépcsőt vagy zárt jellemzővonalat az alaprajzon.
2. Nyissa meg a **Felület, További, Parkoló...** menüpontot.
3. Válassza ki a szabályokat, a parkolóhely szögét (90, 75, 60, 45, 30 fok vagy párhuzamos), valamint az egyirányú vagy kétirányú közlekedőket. A parkolóhelyek, közlekedők és szigetek méretei a táblázatból indulnak, és mindegyik felülírható.
4. Nyomja meg az **Elrendezés** gombot.

A sorok a körvonal azon széle mentén futnak, amely a legtöbb parkolóhelyet adja (vagy a megadott szögben). Parkolóhelynek csak az számít, amely teljesen a körvonalon belül van. Ahol egy sorra és egy közlekedőre elég hely marad, egyoldalas sáv kerül hozzá. Az ablak listázza a helyeket, a mozgáskorlátozott és furgonos helyeket, a szigeteket, a lefolyókat és a helyenkénti területet; az alaprajz a parkolóhelyeket, a sraffozott megközelítő közlekedőkkel együtt a mozgáskorlátozott helyeket, a szigeteket, a közlekedők tengelyvonalait és a lefolyókat külön rétegeken mutatja (C-PARK-...), így ezek eljutnak a PDF-be, DXF-be és DWG-be.

## Mozgáskorlátozott helyek

Az amerikai szabályok szerint a darabszám a 2010-es ADA-szabvány 208.2 táblázatát követi a biztosított helyekre (minden hatodik, felfelé kerekítve, furgonos hely), a körvonal első sarkához (a bejárathoz) legközelebb helyezve, mindegyik megközelítő közlekedővel; kettő közülük meg is osztozhat egyen. A mozgáskorlátozott helyek szélességénél keskenyebb parkolóhely, vagy az 1:48-nál meredekebb esés a mozgáskorlátozott helyeken, problémaként jelenik meg. **Ezeket a számokat a szabványból, emlékezetből gépeltük be, és nincsenek összevetve a nyomtatott szabvánnyal.** A tipikus parkoló- és közlekedőméretek parkolótervezési útmutatókból származnak, ezek is ellenőrizetlenek. Mindkettőt, és a helyi építési előírásokat ellenőrizze, mielőtt rájuk hagyatkozna. Válassza az **Egyéni** lehetőséget, ha saját mozgáskorlátozott darabszámot ad meg.

## Esések a lefolyókhoz, bevágás és feltöltés

Ha ki nem kapcsolja, a parkoló tereprendezési területté válik a Tájépítészet munkaterületen. A lefolyók nagyjából 100 ft-onként (30 m) a közlekedők tengelyvonalán kerülnek elhelyezésre; a felület minden lefolyótól a megadott eséssel emelkedik (kezdetben 1,5 százalékkal), így minden pont a legközelebbi lefolyó felé lejt. A szintet úgy választja meg a program, hogy a parkoló bevágása és feltöltése kiegyenlítődjön a meglévő terepen. A meglévő terep a projekt meglévő felülete, amely származhat felmérési pontokból, LandXML-ből, lidar- vagy szkennelt pontfelhőből felületté alakítva, vagy szintvonalakból. Az ablak a bevágás és feltöltés becslését mutatja; a projekt saját térfogatai utólag adják a pontos értéket. A tereprendezési terület szélét a meglévő terepen tartja, így ahol az új felület a szélen eltér a terepszinttől, lépcső keletkezik; az ablak megmondja, mekkora.

## Burkolás és beültetés

A teljes körvonal térkőburkolatot kap (a kötésmintát a Tájépítészet, Kemény felületek alatt módosíthatja), minden sziget cserjeágyást, és ha elég széles, egy fát is, a növénylistáról. Ezután minden egy szokásos tájépítészeti objektum: szerkessze, vagy válassza az **Elrendezés újra** lehetőséget, hogy a parkoló által készítetteket lecserélje. A parkoló eltávolítása eltávolítja az általa készítetteket is.

## Asszisztenstől

Ugyanez a parkoló kérhető MCP-n keresztül: a `parking_layout` előnézetet ad, a `parking_build` ír, a `parking_remove` eltávolít egy parkolót. Kérje a telek neve alapján, vagy küldje el a körvonalat.

## Ami még nincs kész

Nem ellenőrzi, hogy a közlekedők elérik-e az utcát. A burkolat a teljes körvonalat lefedi, így a területe tartalmazza a szigeteket is. A könyvtárból származó burkolóanyag-választás és a parkolóhelyek könyvtári típusa még nincs kész; a kötésminta a Kemény felületeké. Más országok szabályai nincsenek elkészítve.
