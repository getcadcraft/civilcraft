---
title: Od adrese do lokacije
summary: Pretvori adresu u ono što lokacija treba znati: parcelu, zgrade oko nje, zoniranje, tlo i zonu poplave, iz otvorenih podataka koje zatražiš dugmetom ili doneseš kao datoteke, i pošalji ih BimCraftu kao prijedloge.
keywords: adresa, geokodiranje, lokacija, parcela, zgrade, zoniranje, tlo, poplava, otvoreni podaci, openstreetmap, fema, ssurgo, usgs, kontekst, ccsite, bimcraft
from: 125d848a
---

## Šta radi

Surface › More › Od adrese do lokacije odgovara, za tačku: u kojoj je parceli, koje zgrade su oko nje, zoniranje, tlo i zona poplave. Podaci su otvoreni: datoteke koje dodaš (GeoJSON, shapefile, KML, GeoPackage) i, kad uključiš dodatke, dugmad koja svako traži jedan otvoreni servis.

## Kako se koristi

1. Upiši adresu i pritisni dugme za pretragu adrese (dodatak „Pretraga adrese”) ili upiši geografsku širinu i dužinu.
2. Dodaj slojeve: datoteke sa „Dodaj datoteke” ili ostala dugmad izvora (zona poplave, zgrade, tlo, visina terena, parcele okruga). Servis se traži tek kad pritisneš njegovo dugme; ništa se ne preuzima na početku.
3. Pritisni dugme za izvršavanje za odgovor riječima, sa CSV-om.
4. „Spasi lokaciju kao datoteku” ili „Pošalji BimCraftu kao prijedloge” daje konture BimCraftu ili ModelCraftu; oni ih navode i dodaju samo ono što označiš.

## Šta treba znati

- Pretraga adrese ide preko getcadcraft.com, koji za tebe pita OpenStreetMap-ov Nominatim (najviše jedan zahtjev u sekundi; odgovori se čuvaju 90 dana, pa se ista adresa nikad ne pita dvaput; čuva se samo heš adrese, nikad ko je pitao). Ostala dugmad idu direktno iz tvog pregledača do njihovog servisa.
- Svaki izvor ima svoju licencu (OpenStreetMap je ODbL: zadrži liniju sa priznanjem).
- Slojevi su dobri koliko i otvoreni podaci na tvom području. Provjeri ono što je važno u odnosu na geodetsko snimanje.
