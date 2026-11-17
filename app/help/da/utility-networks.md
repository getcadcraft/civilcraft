---
title: Forsyningsnet og OpenStreetMap
summary: Forløb for vand, spildevand, regnvand, gas, el og tele med materiale, dimension, overdækning og ejer; OpenStreetMap-data fra en Overpass JSON-fil; krydsninger, grøftesnit og mængder; tjenestelag i DWG, DXF og PDF; IFC-rør- og kabelsegmenter.
keywords: forsyning, forsyninger, net, osm, openstreetmap, overpass, rør, kabel, gas, spildevand, regnvand, tele, el, vand, brandhane, brønd, grøft, krydsning, frirum, overdækning, dybde, dwg, ifc, georefereret, lag
from: 8a85dace
---

Tegn områdets underjordiske forsyninger som et net pr. forsyningstype, kontrollér hvor de krydser hinanden, og send dem ud som tegningslag og som IFC.

## Lav forløb

Åbn **Terræn, Mere, Forsyningsnet...**

- **Lav forløb ud fra valget** omdanner det valgte tracé, den valgte brudlinje eller det valgte rør til et forløb af den forsyningstype, du vælger. Udfyld derefter materiale, dimension (mm), overdækning (dybden til rørets eller kablets top) og ejer i tabellen.
- **Læs OpenStreetMap-data** læser en Overpass JSON-fil, du har gemt (en forespørgsel med `out geom;`). Projektet skal have et koordinatsystem først, for OpenStreetMap-positioner er breddegrad og længdegrad. Rørledninger (efter stof), underjordiske el- og teleledninger, brandhaner, brønde og regnvandsledninger læses. Alt andet tælles som udeladt, og det fremgår af meddelelsen. Luftledninger udelades.
- **Tilføj OpenStreetMap-kortet** tilføjer OpenStreetMap-kortet under planen. Det tegnes kun, mens kortlag fra internettet er slået til under Indstillinger.

## Kontrol og output

- **Krydsninger**: forløb af forskellige forsyninger, der krydser hinanden i plan, listes med det frie højdemål mellem dem, hvor der findes en terrænflade. Minimumsværdien er en pladsholder, du selv angiver, ikke en standards tal.
- **Grøft**: hvert forløb får en grøft (rørdimension plus frirum på hver side, sideskråning, underlag) med en mængde. Totalen vises i vinduet og i CSV-filen.
- **Tegning**: forløb og punkter ligger på forsyningslag (for eksempel U-WATR-RUN, U-POWR-RUN), så de kommer med i PDF, DXF og DWG.
- **IFC**: forløb medtages i IFC-eksporten som rørsegmenter og kabelsegmenter sammen med brandhaner, ventiler og brønde, med ét system pr. forsyningstype i projektets koordinatsystem.

## OpenStreetMap-data

OpenStreetMap-data er ophavsretligt beskyttet af OpenStreetMap-bidragydere og licenseret under ODbL. Kildeangivelsen tilføjes tegningen, CSV-filen og IFC-filen. Hvis du deler en fil, der indeholder OpenStreetMap-data, skal kildeangivelsen bevares, og du skal læse licensens betingelser om videredeling på samme vilkår.

## Hvad er ikke lavet endnu

Forløb tegnes endnu ikke punkt for punkt i planen med et værktøj, og krydsninger vises endnu ikke i profilvisningen (beregningen er lavet). Dybder, dimensioner og frirum starter som pladsholdere: brug tal fra din egen standard.
