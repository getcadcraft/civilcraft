---
title: Angiv et polygontræk og udjævn det med Bowditch-reglen
summary: Skriv markvinkler eller retninger og afstande, kontrollér vinkel- og længdelukkefejlen og præcisionen, udjævn efter Bowditch-reglen, og tilføj stationerne som punkter eller sløjfen som matrikel.
keywords: polygontræk, lukket polygontræk, sløjfe, vinkler til højre, bagudsigt, retninger, afstande, lukkefejl, præcision, Bowditch-reglen, udjævning, måling
from: 56ce5a8c
---

Et polygontræk er en række målte strækninger: ved hver station en vinkel (eller en retning) og en afstand til den næste. Klik på **Angiv et polygontræk** under **Polygontræk** i højre panel, når intet er valgt.

## Hvor det starter og slutter

1. **Start ved punkt**: dets nummer. Eller skriv en nordkoordinat og en østkoordinat.
2. **Strækninger som**: **Vinkler til højre og afstande**, eller **Retninger og afstande**.
3. Med vinkler angiver du, hvor de starter: et **bagudsigtspunkt**, eller **dets azimut** (fra første station mod bagudsigtet, med uret fra nord).
4. **Slutter**: **tilbage ved start (en sløjfe)**, eller **på punkt** og dets nummer (et åbent polygontræk mellem kendte punkter).

## Skriv strækningerne

Én strækning pr. linje: først vinklen eller retningen, derefter afstanden og, hvis du vil, et navn til stationen, den når frem til:

- Vinkler til højre, drejet med uret ved den station, strækningen forlader, fra stationen bagved til den næste: `270°00'10" 125.50 B`. `270-00-10`, `270 00 10` og `270.0028` virker også.
- Retninger: `N 45°30'15" E 125.50 B`, eller en azimut som ét ord: `AZ 45-30-15 125.50 B`.
- På en sløjfe med vinkler slutter du med `close` og vinklen ved start igen, drejet fra den sidste station til den anden: `close 270°00'05"`. Det er den, der kontrollerer vinklerne.

Linjer, der ikke kan læses, vises med deres linjenumre. »feet«, kommaer og `#`-kommentarlinjer er i orden.

## Læs lukkefejlen

Mens du skriver, viser dialogen:

- **Vinkelmæssig lukkefejl**: hvor langt vinklerne er fra at lukke, og den andel hver vinkel tager. Uden en lukkende vinkel kontrolleres vinklerne ikke, og eventuelle fejl i dem viser sig i længdelukkefejlen.
- **Længdelukkefejl**: hvor langt fra det sted, polygontrækket skulle slutte, det faktisk ender, og i hvilken retning.
- **Præcision**: polygontrækkets længde divideret med længdelukkefejlen: 1 : 10,000 betyder 1 ft i 10,000 ft.
- Stationerne efter udjævningen, og hvor langt hver enkelt er flyttet.

## Udjævningen

Først fordeles den vinkelmæssige lukkefejl ligeligt over vinklerne. Derefter fordeles længdelukkefejlen over strækningerne efter Bowditch-reglen: hver station flyttes mod lukkefejlen i forhold til den længde, der er tilbagelagt for at nå den, så polygontrækket ender præcis, hvor det skal.

:::note
Bowditch-reglen er en standardudjævning, ikke en mindste kvadraters udjævning, og den vægter ikke vinkler mod afstande. Om præcisionen er god nok, er op til dine egne standarder og din jurisdiktion at afgøre.
:::

## Brug resultatet

- **Tilføj som punkter**: de udjævnede stationer bliver til punkter med de navne, du har angivet (ellers de næste ledige numre), beskrivelsen `TRAV` og ingen kote. En sløjfes sidste station er dens start, så den tilføjes ikke to gange. Ét trin: {{key:Mod+Z}} fortryder det.
- **Tilføj som matrikel** (sløjfer): de udjævnede stationer bliver til en [matrikel](topic:parcels) med dens etiketter og matrikelbeskrivelse.
- **Rapport (CSV)**: lukkefejllinjerne, derefter hver stations retning, afstand, koordinater før og efter udjævning og korrektioner.
