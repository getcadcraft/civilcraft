---
title: Legg inn et polygontog og juster det med kompassregelen
summary: Skriv inn feltvinkler eller retninger og avstander, kontroller vinkel- og lineær lukkefeil og presisjonen, juster med kompassregelen, og legg til punktene som oppmålingspunkter eller sløyfen som en eiendom.
keywords: polygontog, lukket polygontog, sløyfe, vinkler til høyre, bakkikt, retninger, avstander, lukkefeil, presisjon, kompassregelen, Bowditch, justering, oppmåling
from: 56ce5a8c
---

Et polygontog er en rekke målte strekninger: i hvert punkt en vinkel (eller en retning) og en avstand til neste. Klikk **Legg inn et polygontog** under **Polygontog** i høyre panel når ingenting er valgt.

## Hvor det starter og slutter

1. **Start i punkt**: nummeret til punktet. Eller skriv inn en nord- og østkoordinat.
2. **Strekninger som**: **Vinkler til høyre og avstander**, eller **Retninger og avstander**.
3. Med vinkler angir du hvor de starter: et **Bakkiktpunkt**, eller **asimuten** (fra første punkt mot bakkiktet, med klokken fra nord).
4. **Slutter**: **tilbake til start (en sløyfe)**, eller **i punkt** og nummeret (et åpent polygontog mellom kjente punkter).

## Skriv inn strekningene

Én strekning per linje: først vinkelen eller retningen, deretter avstanden, og deretter et navn på punktet den går til, hvis du vil:

- Vinkler til høyre, målt med klokken i punktet strekningen forlater, fra punktet bak til neste: `270°00'10" 125.50 B`. `270-00-10`, `270 00 10` og `270.0028` fungerer også.
- Retninger: `N 45°30'15" E 125.50 B`, eller en asimut som ett ord: `AZ 45-30-15 125.50 B`.
- I en sløyfe med vinkler avslutter du med `close` og vinkelen i startpunktet igjen, målt fra det siste punktet til det andre: `close 270°00'05"`. Det er dette som kontrollerer vinklene.

Linjer som ikke kan leses, listes med linjenummer. "feet", komma og kommentarlinjer med `#` går fint.

## Les lukkefeilen

Mens du skriver, viser dialogen:

- **Vinkellukkefeil**: hvor langt vinklene er fra å gå opp, og hvor stor andel hver vinkel tar. Uten en avslutningsvinkel kontrolleres ikke vinklene, og eventuelle feil i dem kommer frem i den lineære lukkefeilen.
- **Lineær lukkefeil**: hvor langt fra der det skal ende, polygontoget ender, og i hvilken retning.
- **Presisjon**: lengden på polygontoget delt på den lineære lukkefeilen: 1 : 10,000 betyr 1 ft på 10,000 ft.
- Punktene etter justeringen, og hvor langt hvert av dem flyttet seg.

## Justeringen

Først fordeles vinkellukkefeilen likt på vinklene. Deretter fordeles den lineære lukkefeilen på strekningene etter kompassregelen (Bowditch): hvert punkt flyttes mot lukkefeilen i forhold til lengden som er tilbakelagt for å nå det, slik at polygontoget ender nøyaktig der det skal.

:::note
Kompassregelen er en standard justering, ikke en minste kvadraters-justering, og den veier ikke vinkler mot avstander. Om presisjonen er god nok, avgjør dine egne krav og kravene i din jurisdiksjon.
:::

## Bruk resultatet

- **Legg til som oppmålingspunkter**: de justerte punktene blir oppmålingspunkter med navnene du ga dem (ellers de neste ledige numrene), beskrivelse `TRAV` og uten kote. Det siste punktet i en sløyfe er startpunktet, så det legges ikke til to ganger. Ett steg: {{key:Mod+Z}} angrer det.
- **Legg til som eiendom** (sløyfer): de justerte punktene blir en [eiendom](topic:parcels), med etiketter og matrikkelopplysninger.
- **Rapport (CSV)**: lukkefeillinjene, deretter hvert punkts retning, avstand, koordinater før og etter justering, og korreksjoner.
