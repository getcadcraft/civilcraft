---
title: Adresse til tomt
summary: Gjør en adresse om til det en tomt må vite: eiendommen, bygningene rundt, arealbruk, grunn og flomsone, fra åpne data du ber om med en knapp eller tar med som filer, og overfører dem til BimCraft som forslag.
keywords: adresse, geokoding, tomt, eiendom, bygninger, arealbruk, grunn, flom, åpne data, openstreetmap, fema, ssurgo, usgs, kontekst, ccsite, bimcraft
from: 125d848a
---

## Hva den gjør

Terrengmodell › Mer › Adresse til tomt svarer for et punkt: hvilken eiendom det ligger i, bygningene rundt, arealbruken, grunnen og flomsonen. Dataene er åpne: filer du legger til (GeoJSON, shapefile, KML, GeoPackage) og, når du slår på tilleggene, knapper som spør én åpen tjeneste hver.

## Slik bruker du den

1. Skriv inn en adresse og trykk på søkeknappen for adresse (tillegget «Adressesøk»), eller skriv inn breddegrad og lengdegrad.
2. Legg til lag: filer med «Legg til filer», eller de andre kildeknappene (flomsone, bygninger, grunn, terrenghøyde, fylkets eiendommer). En tjeneste spørres bare når du trykker på knappen dens; ingenting hentes ved oppstart.
3. Trykk på knappen som kjører analysen, for svaret i tekst, med en CSV.
4. «Lagre tomten som fil» eller «Send til BimCraft som forslag» gir konturene til BimCraft eller ModelCraft; de viser dem i lista og legger bare til det du krysser av.

## Verdt å vite

- Adressesøket går via getcadcraft.com, som spør OpenStreetMap sin Nominatim for deg (høyst én forespørsel i sekundet; svar lagres i 90 dager, slik at samme adresse aldri spørres om to ganger; bare en hash av adressen lagres, aldri hvem som spurte). De andre knappene går direkte fra nettleseren til tjenesten.
- Hver kilde har sin egen lisens (OpenStreetMap er ODbL: behold kildeangivelsen).
- Lagene er så gode som de åpne dataene der du er. Kontroller det som er viktig mot en oppmåling.
