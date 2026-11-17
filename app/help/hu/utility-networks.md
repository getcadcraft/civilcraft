---
title: Közműhálózatok és OpenStreetMap
summary: Víz-, szennyvíz-, csapadékvíz-, gáz-, villamos energia- és távközlési vezetékszakaszok anyaggal, mérettel, takarással és tulajdonossal; OpenStreetMap-adatok Overpass JSON-fájlból; keresztezések, árokmetszetek és térfogatok; szolgáltatási rétegek DWG, DXF és PDF formátumban; IFC csőszegmensek és kábelszegmensek.
keywords: közmű, közművek, hálózat, osm, openstreetmap, overpass, cső, kábel, gáz, szennyvíz, csapadékvíz, távközlés, villamos energia, víz, tűzcsap, akna, árok, keresztezés, szabad távolság, takarás, mélység, dwg, ifc, georeferált, rétegek
from: 8a85dace
---

Rajzolja meg a terület földalatti közműveit: szolgáltatásonként egy-egy hálózatot, ellenőrizze, hol keresztezik egymást, és küldje ki rajzrétegekként és IFC-ként.

## Vezetékszakaszok készítése

Nyissa meg a **Felület, További, Közműhálózatok...** menüpontot.

- **Vezetékszakasz készítése a kijelölésből** a kijelölt tengelyt, jellemzővonalat vagy csövet a kiválasztott szolgáltatás vezetékszakaszává alakítja. Ezután a táblázatban adja meg az anyagot, a méretet (mm), a takarást (a cső vagy kábel tetejéig mért mélységet) és a tulajdonost.
- **OpenStreetMap-adatok beolvasása** egy mentett Overpass JSON-fájlt olvas be (olyan lekérdezés, amely `out geom;` sort tartalmaz). A projektnek előbb koordináta-rendszerre van szüksége, mert az OpenStreetMap pozíciói szélesség- és hosszúsági fokban vannak. A csővezetékek (közeg szerint), a földalatti villamos energia- és távközlési kábelek, a tűzcsapok, az aknák és a csapadékvíz-elvezető csatornák beolvasásra kerülnek. Minden más kimaradt elemként kerül számlálásra, és erről az üzenet tájékoztat. A légvezetékek kimaradnak.
- **OpenStreetMap-térkép hozzáadása** az OpenStreetMap térképet az alaprajz alá illeszti. Csak akkor rajzolja meg, ha a Beállításokban be van kapcsolva az internetről származó térképrétegek megjelenítése.

## Ellenőrzések és kimenetek

- **Keresztezések**: a síkban egymást keresztező, különböző szolgáltatású vezetékszakaszok fel vannak sorolva, és megjelenik közöttük a szabad magasság, ahol van terepfelület. A minimum egy Ön által beállított helykitöltő érték, nem valamely szabvány számértéke.
- **Árok**: minden vezetékszakaszhoz tartozik egy árok (a csőméret, oldalanként a szabad távolság, oldallejtés és ágyazás), térfogattal együtt. Az összesen érték az ablakban és a CSV-ben jelenik meg.
- **Rajz**: a vezetékszakaszok és pontok szolgáltatási rétegeken vannak (például U-WATR-RUN, U-POWR-RUN), így eljutnak PDF, DXF és DWG formátumba.
- **IFC**: a vezetékszakaszok csőszegmensként és kábelszegmensként kerülnek az IFC exportba, a tűzcsapokkal, szelepekkel és aknákkal együtt, szolgáltatásonként egy rendszerben, a projekt koordináta-rendszerében.

## OpenStreetMap-adatok

Az OpenStreetMap-adatok szerzői joga az OpenStreetMap közreműködőit illeti meg, és az ODbL licenc alatt állnak. A forrásmegjelölés hozzáadásra kerül a rajzhoz, a CSV-hez és az IFC-hez. Ha olyan fájlt oszt meg, amely OpenStreetMap-adatot tartalmaz, tartsa meg a forrásmegjelölést, és olvassa el a licenc továbbadási (share-alike) feltételeit.

## Ami még nincs elkészítve

A vezetékszakaszokat még nem lehet pontonként rajzolni a síkon eszközzel, és a keresztezések még nincsenek megjelenítve a hossz-szelvény nézetben (a számítás elkészült). A mélységek, méretek és szabad távolságok helykitöltő értékek: használja saját szabványának értékeit.
