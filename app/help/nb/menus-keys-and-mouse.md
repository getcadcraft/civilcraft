---
title: Menyer, taster og mus
summary: Velg en menystil som passer til måten du allerede jobber på, gi en kommando din egen tast, flytt kommandoer mellom båndfaner, og velg hva hjulet og musknappene gjør i planen og i 3D.
keywords: menystil, menyer, bånd, veibånd, verktøylinje, kommandolinje, klassisk tegning, tastatursnarveier, hurtigtaster, taster, tilpass, endre tastetildeling, mus, hjul, snu, zoomretning, midtknapp, høyreknapp, panorer, roter rundt, eksporter, importer, bytte, kjent
from: 07ac73a0
---

Kommandoene i CivilCraft er de samme uansett hvordan du finner dem. En **menystil** bestemmer bare hvor de står på skjermen, hva de heter der og hvilke taster som kjører dem, slik at du kan beholde vanene dine. Velg en i {{ui:Innstillinger}} ({{key:Mod+,}}) › {{ui:CivilCraft}} › {{ui:Menyer, taster og mus}}; endringen gjelder med en gang, og denne nettleseren husker den.

## De tre stilene

| Stil | Dette får du |
|---|---|
| {{ui:CivilCraft}} | CivilCrafts egen verktøylinje (Fil, Eksporter, Terrengmodell, Design, Rediger, GIS, Visning) og enkelttaster: {{key:A}} veglinje, {{key:G}} byggeplate, {{key:P}} rør, {{key:B}} bruddlinje, {{key:O}} grense, {{key:L}} formlinje, {{key:R}} lengdeprofil, {{key:X}} snitt, {{key:E}} fall, {{key:D}} 3D, {{key:F}} tilpass, {{key:V}} velg. Utgangspunktet. |
| {{ui:Klassisk tegning}} | Et lite bånd ({{ui:Hjem}}, {{ui:Sett inn}}, {{ui:Utdata}}) og en kommandolinje, for folk som skriver kommandoer: ALIGNMENT, PAD, PIPE, FEATURELINE, BREAKLINE, PROFILE, SECTIONS, U (angre), ZOOM, 3D, PLOT, LANDXML, XATTACH, MAPIMPORT, HELP. Begynn å skrive hvor som helst, så går bokstavene til kommandolinjen; {{key:Enter}} kjører, {{key:Enter}} uten noe gjentar siste kommando, {{key:Esc}} tømmer den. Midtknappen panorerer. |
| {{ui:Veibånd}} | Faner med store knapper, slik anleggsprogrammer grupperer verktøyene sine: {{ui:Hjem}} (terrengdata, lag design, lengdeprofil- og snittvisninger), {{ui:Terrengmodeller}}, {{ui:Endre}}, {{ui:Geolokalisering}}, {{ui:Visning}} og {{ui:Utdata}}, med en {{ui:Fil}}-meny og hurtigknapper til høyre. Enkeltastene beholdes. Midtknappen panorerer planen; i 3D panorerer midtknappen, og {{key:Shift}} med midtknappen roterer rundt. |

Alle stiler beholder {{key:Mod}}-tastene: {{key:Mod+Z}}, {{key:Mod+Y}}, {{key:Mod+S}}, {{key:Mod+O}}, {{key:Mod+P}}, {{key:Mod+C}}, {{key:Mod+X}}, {{key:Mod+V}}, {{key:Mod+D}}, {{key:Mod+A}}.

:::tip
En tast som hører til CivilCrafts eget oppsett, men som stilen din har gitt en annen kommando, gjør ingenting, og statuslinjen sier hvor kommandoen havnet ("I Mine taster er Byggeplate Ctrl+Alt+G"). {{key:Delete}}, {{key:Esc}}, {{key:Enter}}, {{key:Tab}}, {{key:Space}} og piltastene beholder alltid sin betydning, og mens du tegner en linje beholder punktene sine tastene ({{key:Backspace}}, {{key:Enter}}).
:::

## Lag din egen

1. Velg stilen som ligner mest på det du vil ha, og klikk deretter {{ui:Tilpass…}}.
2. Under {{ui:Taster og menyer}} finner du en kommando (søkefeltet hjelper). Klikk {{ui:Legg til en nøkkel}} og trykk tasten, eller to taster etter hverandre for en to-bokstavs-tast. Klikk en tast for å fjerne den.
3. Med et bånd flytter {{ui:Hvor den står}} kommandoen til en annen fane og et annet panel, til {{ui:Fil}}-menyen, eller til {{ui:Bare taster}}.
4. Under {{ui:Mus}} setter du hjulet, knappene som panorerer planen, og hva hver knapp gjør i 3D-visningen.
5. Gi den et navn og klikk {{ui:Lagre}}.

Når du lagrer en innebygd stil, lages en egen kopi («Mitt veibånd»); den innebygde endres aldri. En tast gitt til to kommandoer, eller en tast som ville kjørt før en to-bokstavs-tast kan skrives, vises i rødt og må rettes før du kan lagre.

## Mus

- **Musehjul**: {{ui:Rulling opp zoomer inn}} (utgangspunktet) eller {{ui:Rulling opp zoomer ut}}, og hvor raskt, i planen og i 3D. En klype-bevegelse på styreflaten zoomer alltid den veien fingrene beveger seg.
- **Panorer planen med**: midtknappen, høyreknappen, eller begge. {{key:Space}} og dra panorerer også. Venstreknappen velger og tegner alltid.
- **Dra i 3D-visningen**: {{ui:Hver visning sin egen}} beholder CivilCrafts knapper (venstre roterer, høyre panorerer). Eller sett hver knapp til rotering, panorering, zoom eller ingenting; {{key:Shift}} med knappen bytter mellom rotering og panorering. Et klikk uten å dra velger fortsatt.

## Ta det med deg

{{ui:Eksporter}} lagrer stilen i bruk som en liten `.ccinput.json`-fil; {{ui:Importer…}} legger til en, fra en annen datamaskin eller en kollega. En importert fil kan bare peke på CivilCrafts egne kommandoer: alt annet i den utelates og telles i statuslinjen. {{ui:Slett denne stilen}} fjerner en av dine egne.

:::note
Disse innstillingene blir i denne nettleseren. {{ui:Bruk denne stilen i alle apper}} under stilkortene får hver app til å åpne i den tilsvarende stilen (sin egen verktøylinje, et bånd eller Klassisk tegning), med endringene du gjorde i hver app. CivilCraft har ingen menylinjestil: når en annen apps menylinje velges for alle apper, beholder CivilCraft sin egen verktøylinje.
:::

Relatert: [Tastatur og mus](topic:keyboard) · [CivilCraft-innstillinger](topic:settings) · [Kommer fra annen anleggsprogramvare](topic:coming-from)
