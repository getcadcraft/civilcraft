---
title: Ledningsnett og OpenStreetMap
summary: Strekninger for vann, avløp, overvann, gass, kraft og tele med materiale, dimensjon, overdekning og eier; OpenStreetMap-data fra en Overpass JSON-fil; kryssinger, grøftesnitt og volumer; tjenestelayer i DWG, DXF og PDF; IFC-segmenter for rør og kabler.
keywords: ledning, ledninger, nett, osm, openstreetmap, overpass, rør, kabel, gass, avløp, overvann, tele, kraft, vann, brannhydrant, kum, grøft, kryssing, fri høyde, overdekning, dybde, dwg, ifc, georeferert, layer
from: 8a85dace
---

Tegn ledningsanleggene på et sted som ett nett per tjeneste, kontroller hvor de krysser hverandre, og send dem ut som tegningslayer og som IFC.

## Lag strekninger

Åpne **Terrengmodell, Mer, Ledningsnett...**

- **Lag strekning fra utvalget** gjør den valgte veglinjen, formlinjen eller ledningen om til en strekning for tjenesten du valgte. Fyll deretter inn materiale, dimensjon (mm), overdekning (dybden til toppen av røret eller kabelen) og eier i tabellen.
- **Les OpenStreetMap-data** leser en Overpass JSON-fil du har lagret (en spørring med `out geom;`). Prosjektet må først ha et koordinatsystem, fordi posisjonene i OpenStreetMap er breddegrad og lengdegrad. Rørledninger (etter stoff), underjordiske kraftkabler og teleledninger, brannhydranter, kummer og overvannsledninger leses. Alt annet telles som utelatt, og det står i meldingen. Luftledninger utelates.
- **Legg til OpenStreetMap-kartet** legger OpenStreetMap-kartet under planen. Det tegnes bare når kartlag fra internett er på i Innstillinger.

## Kontroller og utdata

- **Kryssinger**: strekninger for ulike tjenester som krysser i planen, listes med fri høyde mellom dem der det finnes en terrengflate. Minimumsverdien er en plassholder du angir, ikke et tall fra en standard.
- **Grøft**: hver strekning får en grøft (rørdimensjon pluss fri plass på hver side, sideskråning, underlag) med et volum. Totalen vises i vinduet og i CSV-filen.
- **Tegning**: strekninger og punkter ligger på tjenestelayer (for eksempel U-WATR-RUN, U-POWR-RUN), slik at de kommer med til PDF, DXF og DWG.
- **IFC**: strekninger tas med i IFC-eksporten som rørsegmenter og kabelsegmenter, sammen med brannhydranter, ventiler og kummer, ett system per tjeneste, i prosjektets koordinatsystem.

## OpenStreetMap-data

OpenStreetMap-data er opphavsrettslig beskyttet av OpenStreetMap-bidragsytere og lisensiert under ODbL. Kildehenvisningen legges til i tegningen, i CSV-filen og i IFC-filen. Hvis du deler en fil som inneholder OpenStreetMap-data, må du beholde kildehenvisningen og lese lisensens vilkår om deling på samme vilkår (share-alike).

## Hva som ikke er gjort

Strekninger tegnes ikke punkt for punkt i planen med et verktøy ennå, og kryssinger tegnes ikke i lengdeprofilvisningen ennå (beregningen er bygget). Dybder, dimensjoner og frie høyder starter som plassholdere: bruk tallene fra din egen standard.
