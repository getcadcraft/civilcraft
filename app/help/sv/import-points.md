---
title: Importera mätpunkter
summary: Öppna en CSV- eller textpunktfil, kontrollera kolumnordningen i dialogrutan Importera punkter, rätta rader som inte kan läsas och sortera punkterna i grupper.
keywords: importera punkter, csv, txt, pnezd, penzd, punktfil, mätning, COGO-punkter, punktgrupper, kolumner, nordvärde östvärde
from: ad33d88a
---

En punktfil är en textfil med en punkt per rad: punktnummer, nordvärde, östvärde, höjd och beskrivning i någon ordning, avskilda med kommatecken, tabbar, semikolon eller mellanslag. CivilCraft läser den i webbläsaren och bygger genast en yta av den.

## Innan du börjar

- Känn till filens kolumnordning om du kan (PNEZD och PENZD ser likadana ut för en dator).
- Känn till dess enheter. CivilCraft konverterar inte: ange **Enheter** i vänstra panelen så att de stämmer med filen (se [Enheter, stationer och talformat](topic:units-and-stations)).
- Koordinaterna kan vara stora (plankoordinater med nordvärden och östvärden i miljontal fungerar).

## Importera filen

1. Klicka på {{ui:Öppna}} i verktygsfältet, eller tryck på {{key:Mod+O}}, och välj filen. Du kan också dra den till planen.
   Dialogrutan **Importera punkter** öppnas med filnamnet, en lista **Kolumner** satt till {{ui:Identifiera}}, en sammanfattningsrad och de första sex punkterna.
2. Läs sammanfattningsraden. Den säger hur många punkter som lästes, i vilken kolumnordning, hur ordningen hittades och vad som skiljer kolumnerna åt. De tre sätten ordningen hittas på:
   - "från rubrikraden": första raden anger kolumnerna (Point, Northing, Easting, Elevation, Description, eller X, Y, Z …). Det här är säkrast.
   - "som valt": du valde en ordning i **Kolumner**.
   - "gissad från antalet kolumner och inställningen för punktrader (PNEZD) — kontrollera att nordvärde och östvärde inte bytts plats": det fanns ingen användbar rubrik. Om dina filer brukar ha östvärde först, ange **Punktrader** till P, E, N, Z, D i [CivilCraft-inställningar](topic:settings).
3. Kontrollera förhandsgranskningstabellen. Dess kolumner är alltid **Punkt**, **Nordvärde**, **Östvärde**, **Höjd** och **Beskrivning**, oavsett vilken ordning filen använder. Nord- och östvärden för en verklig plats är oftast tydligt olika stora: om de ser ut att vara utbytta gissade det fel.
4. Om ordningen är fel, välj rätt i **Kolumner** (till exempel {{ui:PENZD — punkt, östvärde, nordvärde, höjd, beskrivning}}). Sammanfattningen och förhandsgranskningen uppdateras direkt.
5. Titta under förhandsgranskningen efter **Rader som inte lästes**. Varje rad anger filens radnummer, orsaken och början av raden. Se [Rader som inte lästes](topic:import-points#rows-that-are-not-read).
6. Klicka på {{ui:Importera}}.
   Punkterna visas på planen, vyn zoomar till dem och ytan byggs. Statusfältet säger till exempel "Importerade 276 punkter från site.csv; yta: 546 trianglar."

Om projektet inte hade något namn än tar det filens namn.

## Kontrollera grupperna

Varje punkt tillhör en grupp som namnges efter **det första ordet i dess beskrivning**, med versaler: "GRD", "FL 12" och "fl" blir grupperna GRD, FL och FL. Punkter utan beskrivning hamnar i "(ingen beskrivning)".

1. Titta i tabellen under **Punkter** i vänstra panelen: grupp, antal punkter och ett val för **Yta**.
2. Varje grupp börjar som {{ui:Punkter}}. Ändra flödeslinjer, kanter på beläggning, krön och fötter på slänter, åsar och liknande kodade linjer till {{ui:Brytlinje}}. Sätt grupper som inte ska forma marken (styrpunkter, trädtoppar, elstolpar mätta i toppen) till {{ui:Utelämnas}}.
3. Klicka på en punkt på planen (med {{ui:Markera}}) för att se dess nummer, koordinater, höjd, beskrivning och grupp i högra panelen.

:::warning
En brytlinjegrupp förenar **alla** sina punkter till **en** linje, i punktnummerordning. Det fungerar när varje kodad linje mättes i ordning med sin egen kod. Två separata flödeslinjer som båda kodats "FL" blir en linje som sicksackar mellan dem. Om dina koder delas, använd verktyget {{ui:Brytlinje}} för att klicka på punkterna i varje linje i stället (se [Bygg och förfina ytan](topic:build-surface)).
:::

## Rader som inte lästes

| Orsak som visas | Vad det betyder | Vad du gör |
|---|---|---|
| "nordvärde eller östvärde är inte ett tal" | En koordinatkolumn innehåller text | Kontrollera kolumnordningen, eller en främmande textrad mitt i filen |
| "höjd är inte ett tal" | Höjdkolumnen innehåller text | Fel kolumnordning, eller en beskrivning i höjdkolumnen |
| "inget punktnummer" | Punktkolumnen är tom | Numrera punkten, eller välj en ordning utan P (NEZD, NEZ …): punkterna numreras då 1, 2, 3 … |
| "punkt 12 förekommer två gånger (den första behålls)" | Två rader delar ett nummer | Numrera om en av dem i filen om båda är verkliga mätningar |
| "3 kolumner, väntade 5 (PNEZD)" | Raden är för kort | En trasig rad, eller fel kolumnordning |

En punkt med tom höjd behålls, men den används inte i ytan. **Punkter**-fakta visar hur många punkter som har en höjd.

Rader som börjar med `#`, `;` eller `//` är kommentarer och hoppas över. Tomma rader hoppas över.

## Ersätt eller lägg till punkter

Importerar du igen **ersätts** alla punkter; de läggs inte till. Dina linjeföringar, byggplattor, ledningar, ritade brytlinjer och gräns blir kvar. Ångrahistoriken rensas, så spara projektet först om du kanske vill ha tillbaka de gamla punkterna. För att kombinera två filer, slå ihop dem i en textredigerare eller ett kalkylblad innan du importerar (akta dig för upprepade punktnummer).

Punkter kan inte flyttas, redigeras eller tas bort i CivilCraft ännu. Rätta dem i filen och importera igen.

## Relaterat

- [Punktfilsformat](topic:point-file-formats): varje kolumnordning och hur rubriker känns igen.
- [Bygg och förfina ytan](topic:build-surface).
