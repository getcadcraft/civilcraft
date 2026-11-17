---
title: Utiliidivõrgud ja OpenStreetMap
summary: Vee-, kanalisatsiooni-, sademevee-, gaasi-, elektri- ja sidetrassid koos materjali, suuruse, katte ja omanikuga; OpenStreetMap'i andmed Overpass JSON -failist; ristumised, kaevikulõigud ja mahud; teenuste kihid DWG-, DXF- ja PDF-vormingus; IFC torulõigud ja kaablilõigud.
keywords: utiliit, utiliidid, võrk, osm, openstreetmap, overpass, toru, kaabel, gaas, kanalisatsioon, sademevesi, side, elekter, vesi, hüdrant, kaev, kaevik, ristumine, vaba kõrgus, kate, sügavus, dwg, ifc, georefereeritud, kihid
from: 8a85dace
---

Joonistage saidi maa-alused teenused nii, et igal teenusel on oma võrk, kontrollige, kus need ristuvad, ja väljastage need joonise kihtidena ning IFC-vormingus.

## Trasside loomine

Ava **Pind, Rohkem, Utiliidivõrgud...**

- **Tee trass valikust** muudab valitud joondise, joonjoone või toru valitud teenuse trassiks. Seejärel täitke tabelis materjal, suurus (mm), kate (sügavus toru või kaabli pealmise servani) ja omanik.
- **Loe OpenStreetMap'i andmed** loeb salvestatud Overpass JSON -faili (päring koos reaga `out geom;`). Projektil peab kõigepealt olema koordinaatsüsteem, sest OpenStreetMap'i asukohad on laiuskraad ja pikkuskraad. Torujuhtmed (aine järgi), maa-alused elektri- ja sidekaablid, hüdrandid, kanalisatsioonikaevud ja sademeveekanalid loetakse sisse; kõik muu loetakse välja jäetuks ja sellest teatatakse sõnumis. Õhuliine ei loeta.
- **Lisa OpenStreetMap'i kaart** lisab OpenStreetMap'i kaardi plaani alla. See joonistub ainult siis, kui internetist pärinevad kaardikihid on sätetes sisse lülitatud.

## Kontrollid ja väljund

- **Ristumised**: erinevate teenuste trassid, mis plaanil ristuvad, on loetletud koos nendevahelise vaba kõrgusega, kui on olemas maapinna pind; miinimum on kohatäide, mille ise määrate, mitte standardi number.
- **Kaevik**: igale trassile luuakse kaevik (toru suurus pluss vaba ruum mõlemal pool, külgnõlv, aluspadi) koos mahuga. Kokku kuvatakse aknas ja CSV-failis.
- **Joonis**: trassid ja punktid asuvad teenuste kihtidel (näiteks U-WATR-RUN, U-POWR-RUN), nii et need jõuavad PDF-, DXF- ja DWG-vormingusse.
- **IFC**: trassid lähevad IFC-ekspordi torulõikude ja kaablilõikudena koos hüdrantide, ventiilide ja kambritega; iga teenuse kohta on üks süsteem projekti koordinaatsüsteemis.

## OpenStreetMap'i andmed

OpenStreetMap'i andmete autoriõigus kuulub OpenStreetMap'i kaasautoritele ning need on litsentsitud ODbL-i alusel. Autorimärge lisatakse joonisele, CSV-failile ja IFC-failile. Kui jagate faili, mis sisaldab OpenStreetMap'i andmeid, säilitage autorimärge ja lugege litsentsi nõudeid jagamise kohta samadel tingimustel.

## Mis ei ole veel tehtud

Trasse ei joonistata veel plaanil tööriistaga punkt-punktilt ning ristumisi ei joonistata veel pikiprofiilivaates (arvutus on valmis). Sügavused, suurused ja vaba kõrgused on algul kohatäited: kasutage oma standardi numbreid.
