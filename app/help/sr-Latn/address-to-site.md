---
title: Adresa do lokacije
summary: Pretvorite adresu u ono što lokacija treba da zna: parcelu, zgrade oko nje, zoniranje, zemljište i zonu poplave, iz otvorenih podataka koje tražite dugmetom ili donosite kao datoteke, i predate ih BimCraft-u kao predloge.
keywords: adresa, geokodiranje, lokacija, parcela, zgrade, zoniranje, zemljište, poplava, otvoreni podaci, openstreetmap, fema, ssurgo, usgs, kontekst, ccsite, bimcraft
from: 125d848a
---

## Šta radi

Površina › Više › Adresa do lokacije odgovara, za tačku: u kojoj je parceli, zgrade oko nje, zoniranje, zemljište i zona poplave. Podaci su otvoreni: datoteke koje dodate (GeoJSON, shapefile, KML, GeoPackage) i, kada uključite dodatke, dugmad koja traži po jednu otvorenu uslugu.

## Kako se koristi

1. Ukucajte adresu i pritisnite dugme za pretragu adrese (dodatak „Pretraga adrese“), ili ukucajte geografsku širinu i dužinu.
2. Dodajte slojeve: datoteke sa „Dodaj datoteke“, ili druga dugmad izvora (zona poplave, zgrade, zemljište, visina terena, parcele okruga). Usluga se pita samo kada pritisnete njeno dugme; ništa se ne preuzima na početku.
3. Pritisnite dugme za pokretanje da dobijete odgovor rečima, sa CSV datotekom.
4. „Sačuvaj lokaciju kao datoteku“ ili „Pošalji BimCraft-u kao predloge“ daje obrise BimCraft-u ili ModelCraft-u; oni ih navode i dodaju samo ono što označite.

## Šta treba znati

- Pretraga adrese ide preko getcadcraft.com, koji za vas pita OpenStreetMap-ov Nominatim (najviše jedan zahtev u sekundi; odgovori se čuvaju 90 dana, pa se ista adresa nikada ne traži dvaput; čuva se samo heš adrese, nikada ko je pitao). Ostala dugmad idu direktno iz vašeg pregledača do njihove usluge.
- Svaki izvor ima svoju licencu (OpenStreetMap je ODbL: zadržite liniju sa navođenjem izvora).
- Slojevi su dobri koliko i otvoreni podaci u vašem kraju. Proverite ono što je važno prema geodetskom snimanju.
