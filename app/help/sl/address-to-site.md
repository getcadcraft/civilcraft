---
title: Naslov v lokacijo
summary: Naslov spremenite v podatke, ki jih lokacija potrebuje: parcelo, stavbe okoli nje, namensko rabo, tla in poplavno območje, iz odprtih podatkov, ki jih zahtevate z gumbom ali prinesete kot datoteke, ter jih predate BimCraftu kot predloge.
keywords: naslov, geokodiranje, lokacija, parcela, stavbe, namenska raba, tla, poplava, odprti podatki, openstreetmap, fema, ssurgo, usgs, kontekst, ccsite, bimcraft
from: 125d848a
---

## Kaj počne

Površje › Več › Naslov v lokacijo za točko odgovori: v kateri parceli je, katere stavbe so okoli nje, kakšna je namenska raba, tla in poplavno območje. Podatki so odprti: datoteke, ki jih dodate (GeoJSON, shapefile, KML, GeoPackage), in, ko vklopite dodatke, gumbi, ki vsak zahtevajo eno odprto storitev.

## Kako uporabiti

1. Vnesite naslov in pritisnite gumb za iskanje naslova (dodatek „Iskanje naslova“) ali vnesite zemljepisno širino in dolžino.
2. Dodajte sloje: datoteke z „Dodaj datoteke“ ali drugimi gumbi za vire (poplavno območje, stavbe, tla, višina terena, okrajne parcele). Storitev se pokliče samo, ko pritisnete njen gumb; ob zagonu se ne prenese nič.
3. Pritisnite gumb za zagon, da dobite odgovor z besedami in CSV-datoteko.
4. „Shrani lokacijo kot datoteko“ ali „Pošlji v BimCraft kot predloge“ prenese obrise v BimCraft ali ModelCraft. Ti jih navedejo in dodajo samo tisto, kar označite.

## Na kaj paziti

- Iskanje naslova poteka prek getcadcraft.com, ki zanj vpraša OpenStreetMap Nominatim (največ ena zahteva na sekundo; odgovori se hranijo 90 dni, da se isti naslov nikoli ne sprašuje dvakrat; shranjena je samo zgoščena vrednost (hash) naslova, nikoli tisti, ki je vprašal). Drugi gumbi gredo neposredno iz vašega brskalnika do njihove storitve.
- Vsak vir ima svojo licenco (OpenStreetMap je ODbL: ohranite navedbo avtorja).
- Sloji so toliko dobri, kolikor so dobri odprti podatki na vašem območju. Kar je pomembno, preverite z geodetskim posnetkom.
