---
title: Bygg och förfina terrängmodellen
summary: Hur CivilCraft triangulerar befintlig mark, och hur du formar den med brytlinjegrupper, ritade brytlinjer, en yttre gräns och längsta yttre kanten.
keywords: tin, terrängmodell, triangulering, brytlinje, gräns, befintlig mark, eg, skapa terrängmodell, delaunay, trianglar, största kantlängd, yttre gräns
from: b9eea3f3
---

CivilCraft har en befintlig markyta per projekt. Det är en TIN (triangulerat oregelbundet nät) byggt av dina punkter, och det byggs om automatiskt varje gång en indata ändras. Det finns inget kommando för att bygga om och ingen föråldrad yta.

## Vad som går in i terrängmodellen

- Varje punkt med en höjd i en grupp som är satt till {{ui:Punkter}}.
- Varje grupp som är satt till {{ui:Brytlinje}}, sammanfogad i punktnummerordning.
- Varje brytlinje du ritar med verktyget {{ui:Brytlinje}}.
- Den yttre gränsen, om du ritar en.
- Inställningen **Längsta yttre kant**.

Trianglar korsar aldrig en brytlinje: ytan tvingas följa den och görs sedan så jämn som möjligt runt den (Delaunay på övriga ställen).

## Gör kodade linjer till brytlinjer

1. I den vänstra panelen under **Punkter**, hitta gruppen (till exempel FL).
2. Sätt dess val för **Terrängmodell** till {{ui:Brytlinje}}.
   Terrängmodellen byggs om, linjen ritas i orange (med {{ui:Brytlinjer}} påslaget under **Visa**), och **Brytlinjer** i terrängmodellens fakta ökar med ett.
3. Kontrollera linjen i planen. Den måste gå punkt till punkt i den ordning linjen mättes. Om den går i sicksack innehåller gruppen mer än en linje, eller punkterna är inte numrerade i ordning: sätt gruppen tillbaka till {{ui:Punkter}} och rita linjerna för hand (nästa avsnitt).

## Rita en brytlinje genom punkter

1. Tryck på {{key:B}}, eller klicka på {{ui:Brytlinje}} i gruppen **Terrängmodell**.
   Hjälptexten säger "Brytlinje: klicka på mätpunkter i ordning (den tar deras höjder). Enter avslutar."
2. Flytta pekaren nära en punkt. En liten orange kvadrat markerar punkten den tar.
3. Klicka på linjens punkter, en efter en. Varje klick anger punkten och dess höjd i statusfältet.
4. Tryck på {{key:Enter}} för att avsluta.
   Statusfältet säger "Brytlinje 1 tillagd; terrängmodellen byggdes om."

Klick måste träffa en mätpunkt som har en höjd; ett klick någon annanstans nekas med "Klicka på en mätpunkt med höjd: en brytlinje tar punkternas höjder." {{key:Backspace}} tar bort den sista punkten; {{key:Esc}} avbryter hela linjen.

:::warning
Avsluta med {{key:Enter}}. Dubbelklick avslutar också, men i den här versionen tar den bort punkten du dubbelklickade på. Klicka en gång på den sista punkten och tryck sedan på {{key:Enter}}.
:::

För att ta bort alla ritade brytlinjer på en gång, klicka på {{ui:Ta bort ritade brytlinjer}} i avsnittet **Terrängmodell**. För att bara ta bort den sista, använd {{key:Mod+Z}}. Ritade brytlinjer kan ännu inte markeras eller redigeras en och en.

## Rita den yttre gränsen

En gräns trimmar terrängmodellen till det område du litar på, till exempel mätgränserna, så att långa trianglar över omätta hörn försvinner.

1. Tryck på {{key:O}}, eller klicka på {{ui:Gräns}}.
2. Klicka på hörnen i ordning runt området. En streckad linje visar formen.
3. Tryck på {{key:Enter}}.
   Statusfältet säger "Gräns satt; trianglar utanför den är borta." **Gräns** i terrängmodellens fakta säger "Ja" och antalet hörn.

Att tänka på:

- Det finns en gräns. Om du ritar en till ersätts den. {{ui:Ta bort gränsen}} tar bort den.
- Den kan bara ta bort: en gräns som går längre än punkterna skärs tillbaka till deras omriss, med meddelandet "Gränsen går längre än punkterna; den skars tillbaka till deras omriss."
- Dess hörn tar sina höjder från terrängmodellen, så kanten följer marken exakt.
- Dolda (inre) gränser är inte tillgängliga ännu.

## Trimma långa yttre trianglar

Utan en gräns fyller terrängmodellen hela omrisset av punkterna, inklusive långa smala trianglar över konkava kanter.

1. I **Terrängmodell**, skriv en längd i **Längsta yttre kant** och tryck på {{key:Enter}}. Börja med ungefär två eller tre gånger ditt typiska mätavstånd.
2. Yttre trianglar vars yttre kant är längre än det tas bort, och arbetet fortsätter inåt tills varje yttre kant är tillräckligt kort. En kant som är en brytlinje tas aldrig bort.
3. Skriv 0 för att behålla alla trianglar igen.

## Läs terrängmodellrapporten

Under terrängmodellens fakta listar en ruta vad byggaren gjorde. Med en ockragul list till vänster är det information; med en röd list innehåller den ett fel och det finns ingen terrängmodell.

| Meddelande | Betydelse |
|---|---|
| "3 punkter låg på samma plats som en annan och gick ihop med den." | Punkter som ligger närmare än 0.0001 i planen blev en hörnpunkt (den första behålls). |
| "2 platser har två olika höjder …" | Punkter som ligger ovanpå varandra, eller brytlinjer som korsar, är oense om höjden. Brytlinjens höjd vinner, sedan den första. |
| "1 brytlinjedel kunde inte tvingas in i terrängmodellen." | En mycket kort eller nästan överlappande brytlinjedel fick inte plats; kontrollera just den platsen. |
| "En terrängmodell behöver minst tre punkter med höjder." | För få punkter: kontrollera kolumnordningen och grupperna. |
| "Punkterna ligger alla på en linje: inga trianglar." | Punkterna har ingen bredd, till exempel en enda polygontågslinje. |
| "Gränsen överlappar inte punkterna." | Gränsen ligger någon annanstans, ofta en förväxling av enheter eller koordinater. |
| "Inga trianglar finns kvar inom gränsen." | Gränsen är för liten eller felplacerad. |

## En terrängmodell läst från LandXML

När du öppnar LandXML används dess första TIN-yta som den är: rubriken **Terrängmodell** säger "Terrängmodell (från LandXML)" och **Längsta yttre kant** är nedtonad. Medan den ytan används ändrar brytlinjegrupper, ritade brytlinjer och en ny gräns den inte. För att bygga terrängmodellen från filens punkter i stället, klicka på {{ui:Bygg om terrängmodellen från punkterna}}. {{key:Mod+Z}} hämtar tillbaka LandXML-ytan.

## Relaterat

- [Läs höjdkurvor, höjder och lutningar](topic:contours).
- [Importera mätpunkter](topic:import-points).
