---
title: Od adrese do lokacije
summary: Pretvorite adresu u ono što lokacija treba znati: katastarsku česticu, okolne zgrade, prostornu namjenu, tlo i poplavnu zonu, iz otvorenih podataka koje zatražite gumbom ili priložite kao datoteke, te ih predajte BimCraftu kao prijedloge.
keywords: adresa, geokodiranje, lokacija, katastarska čestica, zgrade, prostorna namjena, tlo, poplava, otvoreni podaci, openstreetmap, fema, ssurgo, usgs, kontekst, ccsite, bimcraft
from: 125d848a
---

## Što radi

Teren › Više › Od adrese do lokacije za jednu točku daje odgovor: u kojoj je katastarskoj čestici, koje su zgrade oko nje, kakva je prostorna namjena, kakvo je tlo i je li u poplavnoj zoni. Podaci su otvoreni: datoteke koje dodate (GeoJSON, shapefile, KML, GeoPackage) i, kad uključite dodatke, gumbi koji za svaki pitaju po jednu otvorenu uslugu.

## Kako se koristi

1. Upišite adresu i pritisnite gumb za pretragu adrese (dodatak „Pretraga adrese“) ili upišite geografsku širinu i dužinu.
2. Dodajte slojeve: datoteke gumbom „Dodaj datoteke“ ili drugim gumbima za izvore (poplavna zona, zgrade, tlo, visina terena, katastarske čestice županije). Usluga se pita tek kad pritisnete njezin gumb; ništa se ne preuzima pri pokretanju.
3. Pritisnite gumb za pokretanje za odgovor riječima i CSV datoteku.
4. „Spremi lokaciju kao datoteku“ ili „Pošalji u BimCraft kao prijedloge“ predaje obrise u BimCraft ili ModelCraft; oni ih popišu i dodaju samo ono što označite.

## Što trebate znati

- Pretraga adrese ide preko getcadcraft.com, koji za vas pita OpenStreetMap Nominatim (najviše jedan zahtjev u sekundi; odgovori se čuvaju 90 dana, pa se ista adresa nikad ne traži dvaput; pohranjuje se samo kontrolni zbroj (hash) adrese, nikad tko je pitao). Ostali gumbi idu izravno iz vašeg preglednika do njihove usluge.
- Svaki izvor ima vlastitu licenciju (OpenStreetMap je ODbL: zadržite navod autora).
- Slojevi su dobri koliko su dobri otvoreni podaci u vašem kraju. Ono što je važno provjerite geodetskim snimkom.
