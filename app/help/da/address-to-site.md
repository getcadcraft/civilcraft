---
title: "Adresse til byggegrund"
summary: "Omsæt en adresse til det, en byggegrund skal vide: matriklen, bygningerne omkring, zonering, jordbund og oversvømmelseszone, fra åbne data du beder om med en knap eller medbringer som filer, og send dem til BimCraft som forslag."
keywords: adresse, geokodning, byggegrund, matrikel, bygninger, zonering, jordbund, oversvømmelse, åbne data, openstreetmap, fema, ssurgo, usgs, kontekst, ccsite, bimcraft
from: 125d848a
---

## Hvad den gør

Overflade › Mere › Adresse til byggegrund svarer for et punkt: hvilken matrikel det ligger i, bygningerne omkring, zoneringen, jordbunden og oversvømmelseszonen. Data er åbne: filer du tilføjer (GeoJSON, shapefile, KML, GeoPackage) og, når du slår add-ons til, knapper der spørger én åben tjeneste hver.

## Sådan bruger du den

1. Skriv en adresse og tryk på knappen til adressesøgning (add-on'et »Adressesøgning«), eller skriv breddegrad og længdegrad.
2. Tilføj lag: filer med »Tilføj filer«, eller de andre kildeknapper (oversvømmelseszone, bygninger, jordbund, terrænhøjde, matrikler for dit område). En tjeneste spørges kun når du trykker på dens knap; intet hentes ved start.
3. Tryk på kørselsknappen for svaret i tekst, med en CSV-fil.
4. »Gem arealet som fil« eller »Send til BimCraft som forslag« giver konturerne til BimCraft eller ModelCraft; de viser dem og tilføjer kun det du sætter flueben ved.

## Det skal du vide

- Adressesøgningen går via getcadcraft.com, som spørger OpenStreetMaps Nominatim for dig (højst én forespørgsel i sekundet, svar gemmes i 90 dage, så samme adresse aldrig spørges to gange; kun et hash af adressen gemmes, aldrig hvem der spurgte). De andre knapper går direkte fra din browser til deres tjeneste.
- Hver kilde har sin egen licens (OpenStreetMap er ODbL: behold kildeangivelsen).
- Lagene er så gode som de åbne data er på dit sted. Kontrollér det vigtige mod en opmåling.
