---
title: Adres naar bouwplaats
summary: Maak van een adres wat een bouwplaats moet weten: het perceel, de gebouwen eromheen, de bestemming, de bodem en de overstromingszone, uit open data die u met een knop opvraagt of als bestanden meebrengt, en geef ze als suggesties door aan BimCraft.
keywords: adres, geocoderen, bouwplaats, perceel, gebouwen, bestemming, bodem, overstroming, open data, openstreetmap, fema, ssurgo, usgs, context, ccsite, bimcraft
from: 125d848a
---

## Wat het doet

Terrein › Meer › Adres naar bouwplaats geeft voor een punt het antwoord op: in welk perceel het ligt, welke gebouwen eromheen staan, de bestemming, de bodem en de overstromingszone. De gegevens zijn open: bestanden die u toevoegt (GeoJSON, shapefile, KML, GeoPackage) en, wanneer u de add-ons inschakelt, knoppen die elk één open dienst raadplegen.

## Gebruik

1. Typ een adres en druk op de zoekknop voor adressen (de add-on "Adreszoeken"), of typ de breedtegraad en lengtegraad.
2. Voeg lagen toe: bestanden met "Bestanden toevoegen", of de andere bronknoppen (overstromingszone, gebouwen, bodem, maaiveldhoogte, county-percelen). Een dienst wordt alleen geraadpleegd wanneer u op de knop ervan drukt; bij het starten wordt niets opgehaald.
3. Druk op de uitvoerknop voor het antwoord in woorden, met een CSV.
4. "Het terrein als bestand opslaan" of "Naar BimCraft sturen als suggesties" geeft de omtrekken aan BimCraft of ModelCraft; zij tonen ze en voegen alleen toe wat u aanvinkt.

## Waar u op moet letten

- De adreszoekfunctie loopt via getcadcraft.com, dat voor u OpenStreetMap's Nominatim raadpleegt (hooguit één verzoek per seconde; antwoorden blijven 90 dagen bewaard, zodat hetzelfde adres nooit twee keer wordt opgevraagd; alleen een hash van het adres wordt opgeslagen, nooit wie het vroeg). De andere knoppen gaan rechtstreeks van uw browser naar hun dienst.
- Elke bron heeft een eigen licentie (OpenStreetMap is ODbL: houd de bronvermelding).
- De lagen zijn zo goed als de open data in uw omgeving. Controleer wat belangrijk is met een opmeting.
