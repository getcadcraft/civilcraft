---
title: Enheter ved import: en fil oppgir sine enheter, eller du blir spurt først
summary: Når en tegning eller et nett du henter inn i et prosjekt oppgir sine enheter, konverterer CivilCraft den og sier fra om det. Når den ikke gjør det, spør CivilCraft før den leses inn, og husker svaret for den filen.
keywords: enheter, import, DWG, DXF, STL, OBJ, oppmåling, fot, US survey feet, meter, millimeter, skala, feil størrelse, for stor, for liten, spør, husket, INSUNITS, tegningsenheter
from: 60921963
---

## Hva du gjør

Hent en fil inn i et prosjekt og vær sikker på at den kommer inn i riktig størrelse.

## Steg

1. Åpne filen som vanlig: {{ui:Åpne}}, dra den over planen, eller CAD-tegningskommandoen.
2. Hvis filen oppgir sine enheter, spørres det ikke: importdialogen viser dem som **Som tegningen sier**.
3. Hvis ikke, spør en dialog etter **Enheter for** filen før importdialogen åpnes. Velg hva én enhet i filen er, og klikk {{ui:Bruk disse enhetene}}.
4. {{ui:Avbryt}} (eller {{key:Esc}}) hopper over filen. Ingenting av den leses inn i prosjektet.

## Hvilke filer som oppgir enhetene sine

- **DWG og DXF**: tegningens innsettingsenheter (`$INSUNITS`). En fil uten dem blir spurt om. Listen **Tegningsenheter** i importdialogen starter med svaret ditt og kan fortsatt endres.
- **STL og OBJ** (frie terrengformer): oppgir aldri enheter. Du blir spurt.
- **Punktlister** (CSV, TXT) og lister fra fremdriftsoppmåling: en liste som oppgir enheten i de første linjene, konverteres, og statuslinjen sier fra om det. En som ikke oppgir noen, spørres om når du trykker {{ui:Importer}}, før punktene tas inn. Kolonner for breddegrad og lengdegrad går i stedet gjennom koordinatsystemet.
- **Tillegget Punktskyer**: spør når du bygger en sky der filen ikke oppgir noen enhet, og merker skyens tall med enheten den har.
- **IFC og LandXML**: oppgir sine egne; de konverteres til prosjektets enheter.
- **LAS, LAZ og høyderasterbilder**: plasseres etter koordinatsystemet; terrengdialogen spør etter enheten for kote når filen ikke sier det.

## Greit å vite

- Svaret huskes for den filen på denne datamaskinen, i alle CadCraft-apper. Neste gang den kommer inn, spørres det ikke.
- For å bli spurt igjen: kommandopaletten ({{key:Mod+K}}) › **Spør igjen om enhetene for importerte filer**.
- En enhet en liste oppgir, leses fra de første åtte linjene: en linje som `units: ft`, eller kolonneoverskrifter som alle har samme enhet i parentes, for eksempel `Elevation (m)`.
