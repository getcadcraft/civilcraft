---
title: Adress till tomt
summary: Gör en adress till det en tomt behöver veta: fastigheten, byggnader runt omkring, detaljplan, jord och översvämningszon, från öppna data som du begär med en knapp eller tar med som filer, och skickar dem till BimCraft som förslag.
keywords: adress, geokodning, tomt, fastighet, byggnader, detaljplan, jord, översvämning, öppna data, openstreetmap, fema, ssurgo, usgs, kontext, ccsite, bimcraft
from: 125d848a
---

## Vad det gör

Terrängmodell › Mer › Adress till tomt svarar för en punkt: vilken fastighet den ligger i, byggnaderna runt om, detaljplanen, jorden och översvämningszonen. Data är öppna: filer som du lägger till (GeoJSON, shapefile, KML, GeoPackage) och, när du slår på tilläggen, knappar som frågar en öppen tjänst var.

## Så här använder du det

1. Skriv en adress och tryck på knappen för adresssökning (tillägget "Adresssökning"), eller skriv latitud och longitud.
2. Lägg till lager: filer med "Lägg till filer", eller de andra källknapparna (översvämningszon, byggnader, jord, markhöjd, fastigheter i området). En tjänst frågas bara när du trycker på dess knapp; inget hämtas vid start.
3. Tryck på körknappen för svaret i text, med en CSV.
4. "Spara tomten som en fil" eller "Skicka till BimCraft som förslag" ger konturerna till BimCraft eller ModelCraft; de listar dem och lägger bara till det du bockar för.

## Att känna till

- Adressökningen går via getcadcraft.com, som frågar OpenStreetMaps Nominatim åt dig (högst en förfrågan per sekund, svar sparas i 90 dagar så att samma adress aldrig frågas två gånger; bara en hash av adressen lagras, aldrig vem som frågade). De andra knapparna går direkt från din webbläsare till respektive tjänst.
- Varje källa har sin egen licens (OpenStreetMap är ODbL: behåll källangivelsen).
- Lagren är så bra som de öppna data är där du befinner dig. Kontrollera det som är viktigt mot en mätning.
