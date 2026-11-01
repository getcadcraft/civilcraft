---
title: Kom i gang med CivilCraft
summary: Hva CivilCraft gjør, hvordan du åpner den, og de første ti minuttene med eksempelområdet, fra punkter til høydekurver, en vei og et lagret prosjekt.
keywords: start, første gang, eksempelområde, innføring, hurtigstart, veiledning, begynne, nytt prosjekt
from: c9b6dd8e
---

CivilCraft er appen for anleggs- og tomtedesign i CadCraft-familien. Den tar oppmålingspunkter og gjør dem til en terrengmodell (en TIN) med høydekurver, lar deg legge ut veglinjer med prosjekterte lengdeprofiler, sveipe en enkel veikorridor, forme byggeplater til dagslinje, kontrollere et selvfallsnett av rør mot reglene dine og se volumer for skjæring og fylling. Den leser og skriver LandXML, eksporterer planen som DXF og plotter den til PDF.

Hvis du har brukt Civil 3D, vil ideene være kjente: punkter, punktgrupper, bruddlinjer, veglinjer etter PI, lengdeprofiler etter PVI, korridorer, terrengforming, rørnett. Måten du arbeider på er annerledes, og mye mindre: det finnes ingen kommandolinje, ingen stiler og ingen tegningsfil. Les [Hvis du kommer fra annen anleggsprogramvare](topic:coming-from) én gang før den første virkelige jobben.

## Dette trenger du

- En oppdatert nettleser på datamaskin: Chrome, Edge, Firefox eller Safari. Se [Nettlesere](common:browsers).
- En mus eller styreflate og et tastatur, eller en berøringsskjerm: der har tegning knappene {{ui:Fullfør}}, {{ui:Angre punkt}} og {{ui:Avbryt}} på skjermen (se [Mus, styreflate og berøring](topic:keyboard#mouse-trackpad-and-touch)).
- Planen tegnes i 2D med nettleserens lerret. [3D-visningen](topic:site-3d) bruker nettleserens WebGL-grafikk; hvis den ikke kan starte, sier statuslinjen hvorfor, og planen fungerer fortsatt.
- Ingen konto og ingen opplasting. Filer åpnes på datamaskinen din og lagres som nedlastinger. Se [Filene dine](common:your-files).

:::note
CivilCraft kjører i dag som et tidlig nettleserbygg som fortsatt er under arbeid. Skrivebordsversjoner finnes ikke ennå, og skylagring finnes ikke ennå. Alt du lager, blir på datamaskinen din til du lagrer eller eksporterer det.
:::

## Åpne CivilCraft

1. Åpne CivilCraft i nettleseren.
2. Vent til skjermen fylles: en verktøylinje over toppen, et panel til venstre, planen i midten og et panel **Egenskaper** til høyre.
3. På en tom plan ser du en boks med tittelen **Start med oppmålingspunkter**. Den lister de første trinnene og har en lenke, {{ui:Åpne eksempelområdet}}.

For å bruke CivilCraft uten forbindelse senere klikker du {{ui:Lagre for frakoblet bruk}} i appfeltet og venter på {{ui:Klar frakoblet}}. Det inkluderer denne hjelpen, eksempelområdet og 3D- og GIS-bibliotekene. Se [Frakoblet](common:offline). Trykk {{key:F1}} eller klikk {{ui:Hjelp}} når som helst for å åpne denne hjelpen ved siden av appen.

## De første ti minuttene: eksempelområdet

Eksempelområdet er en liten oppmåling i amerikanske fot: 276 punkter i statsplankoordinater, en rygg, en forsenkning med en bunnlinje og to bankekanter. Det følger med appen, så du kan følge med uten en egen fil.

1. Klikk {{ui:Åpne eksempelområdet}} i boksen på planen.
   Dialogen **Importer punkter** åpnes. Den sier «276 punkter lest som PNEZD (fra overskriftsraden), atskilt med komma.» og viser de første radene.
2. Klikk {{ui:Importer}}.
   Planen fylles med punkter, høydekurver og terrengmodellens kant. Statuslinjen nederst sier at punktene er importert og hvor mange trekanter terrengmodellen har (546).
3. Se på panelet til venstre under **Punkter**. Punktene er gruppert etter første ord i beskrivelsen: CP, FL, GRD, RIDGE, TBN, TBS og TREE.
4. I kolonnen **Terrengmodell** i den tabellen setter du **FL**, **RIDGE**, **TBN** og **TBS** til {{ui:Bruddlinje}}.
   Terrengmodellen bygges på nytt med en gang. Fakta om **Terrengmodell** sier nå «Bruddlinjer: 4», og høydekurvene knekker skarpt langs bunnlinjen og ryggen i stedet for å skjære på tvers.
5. Flytt pekeren over planen. Statuslinjen viser øst og nord under pekeren og terrenghøyden der.
6. Under **Visning** setter du {{ui:Høydekurver hver}} til 0,5 ft og slår på {{ui:Høydebånd}}. En fargerampe dukker opp med en tegnforklaring under avmerkingsboksene. Slå båndene av igjen når du er ferdig.

Du har nå en terrengmodell for eksisterende terreng. Neste: en vei.

## Legg ut en kort vei

1. Trykk {{key:A}} (eller klikk {{ui:Veglinje}} i gruppen **Prosjektering**).
2. Klikk tre punkter over området, ett etter ett. En rød linje følger pekeren og viser lengden og retningen til neste rettstrekning.
3. Trykk {{key:Enter}} for å fullføre.
   Veglinjen vises med profilnummer. Panelet til høyre viser **Veglinje**: lengden, PI-tabellen og kurven ved midtre PI (radius 100 ft, eller mindre hvis 100 ft ikke får plass).
4. I panelet til høyre, under **Prosjektert lengdeprofil**, klikker du {{ui:Start fra terrenget}}.
   Lengdeprofilvisningen åpnes under planen med eksisterende terreng og en rett prosjektert stigning fra ende til ende.
5. Trykk {{key:I}} for å slå på {{ui:Legg til PVI-er}}, og klikk deretter én gang i lengdeprofilvisningen nær midten. En PVI dukker opp.
6. I PVI-tabellen til høyre skriver du en kurvelengde (for eksempel 100) i boksen **Kurve L** for midtre PVI og trykker {{key:Enter}}. Lengdeprofilet har nå en vertikalkurve, med K-verdien merket.
7. Under **Korridor** krysser du av **Sveip en oppbygging langs det prosjekterte lengdeprofilet**.
   Veien formes inn i terrenget: kjørefelt, skuldre og sideskråninger til dagslinje. Blokken **Masseberegning** viser skjæring og fylling.

Ikke bekymre deg for eksakte verdier. Hvert tall kan endres i panelet til høyre, og {{key:Mod+Z}} angrer siste endring.

## Lagre arbeidet

1. Skriv et navn i **Navn** øverst i panelet til venstre.
2. Trykk {{key:Mod+S}} (eller klikk {{ui:Lagre}}).
   Nettleseren laster ned en fil oppkalt etter området, som slutter på `.civilcraft.json`. Den inneholder punktene, terrengmodellens innstillinger, veglinjer, lengdeprofiler, korridorer, byggeplater og rør.
3. For å fortsette senere klikker du {{ui:Åpne}} (eller trykker {{key:Mod+O}}) og velger den filen, eller slipper den på planen.

:::warning
Det finnes ingen automatisk lagring. Hvis du lukker fanen med ulagrede endringer, spør nettleseren om du vil forlate siden; hvis du forlater den, er endringene borte. Lagre ofte.
:::

## Veien videre

- [Importer oppmålingspunkter](topic:import-points) med dine egne filer.
- [Bygg og finjuster terrengmodellen](topic:build-surface) med bruddlinjer og en avgrensning.
- [Skjermen, del for del](topic:workspace).
- [Taster og mus](topic:keyboard).
