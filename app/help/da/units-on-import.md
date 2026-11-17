---
title: Enheder ved import: en fil angiver sine enheder, eller du bliver spurgt først
summary: Når en tegning eller et net, du henter ind i et projekt, angiver sine enheder, konverterer CivilCraft den og siger det. Når den ikke gør, spørger CivilCraft, før den læses ind, og husker dit svar for den fil.
keywords: enheder, import, DWG, DXF, STL, OBJ, måling, fod, US survey-fod, meter, millimeter, skala, forkert størrelse, for stor, for lille, spørg, husket, INSUNITS, tegningsenheder
from: 60921963
---

## Det, du gør

Hent en fil ind i et projekt, og sørg for, at den kommer ind i den rigtige størrelse.

## Trin

1. Åbn filen som sædvanligt: {{ui:Åbn}}, slip den på planen, eller brug CAD-tegningskommandoen.
2. Hvis filen angiver sine enheder, spørges der ikke: importdialogen viser dem som **Som tegningen angiver**.
3. Hvis ikke, spørger en dialog om filens **Enheder for**, før importdialogen åbnes. Vælg, hvad én enhed i filen er, og klik på {{ui:Brug disse enheder}}.
4. {{ui:Annuller}} (eller {{key:Esc}}) springer filen over. Intet af den læses ind i projektet.

## Hvilke filer angiver deres enheder

- **DWG og DXF**: tegningens indsætningsenheder (`$INSUNITS`). En fil uden dem spørges der om. Listen **Tegningsenheder** i importdialogen starter med dit svar og kan stadig ændres.
- **STL og OBJ** (frie landskabsformer): angiver aldrig enheder. Du bliver spurgt.
- **Punktlister** (CSV, TXT) og løbende målelister: en liste, der angiver sin enhed i de første linjer, konverteres, og statuslinjen siger det. En liste, der ikke angiver nogen, spørges der om, når du trykker på {{ui:Importér}}, før punkterne læses ind. Kolonner med bredde- og længdegrad går i stedet gennem koordinatsystemet.
- **Punktsky-tilføjelsen**: spørger, når du bygger en sky, hvis fil ikke angiver nogen enhed, og mærker skyens tal med den enhed, den bærer.
- **IFC og LandXML**: angiver deres egne; de konverteres til projektets enheder.
- **LAS, LAZ og højderastere**: placeres efter deres koordinatsystem; terrændialogen spørger efter kotens enhed, når filen ikke siger det.

## Godt at vide

- Svaret huskes for den fil på denne computer, i alle CadCraft-apps. Næste gang den hentes ind, spørges der ikke.
- For at blive spurgt igen: kommandopaletten ({{key:Mod+K}}) › **Spørg igen om enhederne for importerede filer**.
- En enhed, en liste angiver, læses fra dens første otte linjer: en linje som `units: ft`, eller kolonneoverskrifter, der alle bærer samme enhed i parentes, som `Elevation (m)`.
