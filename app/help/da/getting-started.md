---
title: Kom i gang med CivilCraft
summary: Hvad CivilCraft gør, hvordan du åbner den, og de første ti minutter med eksempelområdet fra punkter til højdekurver, en vej og et gemt projekt.
keywords: start, første gang, eksempelområde, introduktion, hurtig start, vejledning, begynd, nyt projekt
from: c9b6dd8e
---

CivilCraft er appen til anlæg og terrænprojektering i CadCraft-familien. Den tager opmålingspunkter og gør dem til en overflade (et TIN) med højdekurver, lader dig derefter lægge tracéer ud med projekterede længdeprofiler, føre en enkel vejkorridor langs dem, planere byggeplateauer til skæring i terræn, kontrollere et gravitationsrørnet mod dine regler og se mængder af afgravning og opfyld. Den læser og skriver LandXML, eksporterer planen som DXF og plotter den til PDF.

Hvis du har brugt Civil 3D, vil ideerne være kendte: punkter, punktgrupper, brudlinjer, tracéer efter PI, profiler efter PVI, korridorer, planering, rørnet. Måden, du arbejder på, er anderledes og meget mindre: der er ingen kommandolinje, ingen stile og ingen tegningsfil. Læs [Hvis du kommer fra anden anlægssoftware](topic:coming-from) én gang, før dit første rigtige job.

## Det her skal du bruge

- En nyere browser på computer: Chrome, Edge, Firefox eller Safari. Se [Browsere](common:browsers).
- En mus eller pegeplade og et tastatur, eller en touchskærm: dér har tegning knapper på skærmen, {{ui:Afslut}}, {{ui:Fortryd punkt}} og {{ui:Annuller}} (se [Mus, pegeplade og touch](topic:keyboard#mouse-trackpad-and-touch)).
- Planen tegnes i 2D med browserens canvas. [3D-visningen](topic:site-3d) bruger browserens WebGL-grafik; hvis den ikke kan starte, siger statuslinjen hvorfor, og planen virker stadig.
- Ingen konto og ingen upload. Filer åbnes på din computer og gemmes som downloads. Se [Dine filer](common:your-files).

:::note
CivilCraft kører i dag som en tidlig browserbuild, der stadig er under udvikling. Skrivebordsbuilds findes ikke endnu, og gemning i skyen er der ikke endnu. Alt, du laver, bliver på din computer, til du gemmer eller eksporterer det.
:::

## Åbn CivilCraft

1. Åbn CivilCraft i din browser.
2. Vent på, at skærmen fyldes: en værktøjslinje øverst, et panel til venstre, planen i midten og et panel **Egenskaber** til højre.
3. På en tom plan ser du en boks med titlen **Start med opmålingspunkter**. Den viser de første trin og har et link, {{ui:Åbn eksempelområdet}}.

For at bruge CivilCraft uden forbindelse senere klikker du på {{ui:Gem til offline brug}} i appfeltet og venter på {{ui:Klar offline}}. Det omfatter denne hjælp, eksempelområdet og 3D- og GIS-bibliotekerne. Se [Offline](common:offline). Tryk på {{key:F1}} eller klik på {{ui:Hjælp}} når som helst for at åbne denne hjælp ved siden af appen.

## Dine første ti minutter: eksempelområdet

Eksempelområdet er en lille opmåling i amerikanske fod: 276 punkter i state plane-koordinater, en ryg, en lavning med en flowline og to bankekanter. Det følger med appen, så du kan følge med uden en fil af din egen.

1. Klik på {{ui:Åbn eksempelområdet}} i boksen på planen.
   Dialogboksen **Importér punkter** åbner. Den siger "276 points read as PNEZD (from the header row), separated by commas." og viser de første rækker.
2. Klik på {{ui:Importér}}.
   Planen fyldes med punkter, højdekurver og overfladekanten. Statuslinjen nederst siger, at punkterne er importeret, og hvor mange trekanter overfladen har (546).
3. Se i panelet til venstre under **Punkter**. Punkterne er grupperet efter beskrivelsens første ord: CP, FL, GRD, RIDGE, TBN, TBS og TREE.
4. I kolonnen **Overflade** i den tabel sætter du **FL**, **RIDGE**, **TBN** og **TBS** til {{ui:Brudlinje}}.
   Overfladen genopbygges med det samme. Fakta om **Overflade** siger nu "Breaklines: 4", og højdekurverne knækker skarpt langs flowlinen og ryggen i stedet for at skære på tværs af dem.
5. Før markøren hen over planen. Statuslinjen viser øst- og nordkoordinaten under markøren og terrænkoten dér.
6. Under **Visning** sætter du {{ui:Højdekurver for hver}} til 0,5 ft og slår {{ui:Kotebånd}} til. En farveskala dukker op med en signaturforklaring under afkrydsningsfelterne. Slå båndene fra igen, når du er færdig.

Du har nu en eksisterende terrænoverflade. Næste skridt er en vej.

## Læg en kort vej ud

1. Tryk på {{key:A}} (eller klik på {{ui:Tracé}} i gruppen **Design**).
2. Klik på tre punkter på tværs af området, ét efter ét. En rød linje følger markøren og viser længden og retningen af den næste rette linje.
3. Tryk på {{key:Enter}} for at afslutte.
   Tracéet dukker op med stationering. Panelet til højre viser **Tracé**: dets længde, PI-tabellen og kurven i den midterste PI (radius 100 ft, eller mindre, hvis 100 ft ikke kan være der).
4. I panelet til højre, under **Projektlængdeprofil**, klikker du på {{ui:Start fra terrænet}}.
   Profilvisningen åbner under planen med det eksisterende terræn og et ret projekteret fald fra ende til anden.
5. Tryk på {{key:I}} for at slå {{ui:Tilføj PVI'er}} til, og klik derefter én gang i profilvisningen nær midten. En PVI dukker op.
6. I PVI-tabellen til højre skriver du en kurvelængde (for eksempel 100) i feltet **Kurve L** ved den midterste PVI og trykker på {{key:Enter}}. Profilen har nu en lodret kurve, med dens K-værdi angivet.
7. Under **Korridor** afkrydser du **Før en samling langs projektlængdeprofilet**.
   Vejen planeres ind i terrænet: kørebaner, rabatter og skråninger ud til skæring i terræn. Blokken **Jordarbejde** viser afgravning og opfyld.

Bare rolig om præcise værdier. Hvert tal kan ændres i panelet til højre, og {{key:Mod+Z}} fortryder den sidste ændring.

## Gem dit arbejde

1. Skriv et navn i **Navn** øverst i panelet til venstre.
2. Tryk på {{key:Mod+S}} (eller klik på {{ui:Gem}}).
   Browseren downloader en fil opkaldt efter området og med endelsen `.civilcraft.json`. Den rummer punkterne, overfladeindstillingerne, tracéer, profiler, korridorer, plateauer og rør.
3. For at fortsætte senere klikker du på {{ui:Åbn}} (eller trykker på {{key:Mod+O}}) og vælger den fil, eller slipper den på planen.

:::warning
Der er ingen automatisk gemning. Hvis du lukker fanen med ugemte ændringer, spørger browseren, om du vil forlade siden; forlader du den, er ændringerne væk. Gem ofte.
:::

## Hvor du kan gå videre

- [Importér opmålingspunkter](topic:import-points) med dine egne filer.
- [Opbyg og forfin overfladen](topic:build-surface) med brudlinjer og en afgrænsning.
- [Skærmen, del for del](topic:workspace).
- [Taster og mus](topic:keyboard).
