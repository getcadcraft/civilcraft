---
title: Bygg og finjuster terrengmodellen
summary: Hvordan CivilCraft triangulerer det eksisterende terrenget, og hvordan du former det med bruddlinjegrupper, tegnede bruddlinjer, en ytre avgrensning og lengste ytterkant.
keywords: tin, terrengmodell, triangulering, bruddlinje, avgrensning, eksisterende terreng, eg, opprett terrengmodell, delaunay, trekanter, maks kant, ytre avgrensning
from: b9eea3f3
---

CivilCraft har én modell av eksisterende terreng per prosjekt. Den er et TIN (triangulated irregular network) bygget fra punktene dine, og den bygges på nytt automatisk hver gang en inndata endres. Det finnes ingen «bygg på nytt»-kommando og ingen utdatert terrengmodell.

## Hva som går inn i terrengmodellen

- Hvert punkt med høyde i en gruppe satt til {{ui:Punkter}}.
- Hver gruppe satt til {{ui:Bruddlinje}}, koblet sammen i punktnummerrekkefølge.
- Hver bruddlinje du tegner med verktøyet {{ui:Bruddlinje}}.
- Den ytre avgrensningen, hvis du tegner en.
- Innstillingen **Lengste ytterkant**.

Trekanter krysser aldri en bruddlinje: terrengmodellen tvinges til å følge den, og gjøres så jevn som mulig rundt den (Delaunay ellers).

## Gjør kodede linjer til bruddlinjer

1. I venstre panel under **Punkter** finner du gruppen (for eksempel FL).
2. Sett valget **Terrengmodell** til {{ui:Bruddlinje}}.
   Terrengmodellen bygges på nytt, linjen tegnes i oransje (med {{ui:Bruddlinjer}} på under **Vis**), og **Bruddlinjer** i fakta om terrengmodellen går opp med én.
3. Kontroller linjen i planen. Den må gå punkt for punkt i den rekkefølgen linjen ble målt. Hvis den sikksakker, inneholder gruppen mer enn én linje, eller punktene er ikke nummerert i rekkefølge: sett gruppen tilbake til {{ui:Punkter}} og tegn linjene for hånd (neste avsnitt).

## Tegn en bruddlinje gjennom punkter

1. Trykk {{key:B}}, eller klikk {{ui:Bruddlinje}} i gruppen **Terrengmodell**.
   Hintet sier «Bruddlinje: klikk oppmålingspunkter i rekkefølge (den tar høydene deres). Enter avslutter.»
2. Flytt pekeren nær et punkt. En liten oransje firkant markerer punktet den tar.
3. Klikk punktene på linjen etter hverandre. Hvert klikk navngir punktet og høyden i statuslinjen.
4. Trykk {{key:Enter}} for å avslutte.
   Statuslinjen sier «Bruddlinje 1 lagt til; terrengmodellen ble bygget på nytt.»

Klikkene må treffe et oppmålingspunkt med høyde; et klikk ellers avvises med «Klikk på et oppmålingspunkt med høyde: en bruddlinje tar høydene til punktene.» {{key:Backspace}} fjerner det siste punktet; {{key:Esc}} avbryter hele linjen.

:::warning
Avslutt med {{key:Enter}}. Dobbeltklikk avslutter også, men i denne versjonen fjerner den punktet du dobbeltklikket på. Klikk på det siste punktet én gang, og trykk deretter {{key:Enter}}.
:::

For å fjerne alle tegnede bruddlinjer på én gang, klikk {{ui:Fjern tegnede bruddlinjer}} i **Terrengmodell**-delen. For å fjerne bare den siste, bruk {{key:Mod+Z}}. Tegnede bruddlinjer kan ikke velges eller redigeres enkeltvis ennå.

## Tegn den ytre avgrensningen

En avgrensning kutter terrengmodellen til området du stoler på, for eksempel oppmålingsgrensene, slik at lange trekanter over umålte hjørner forsvinner.

1. Trykk {{key:O}}, eller klikk {{ui:Avgrensning}}.
2. Klikk hjørnene i rekkefølge rundt området. En stiplet linje viser formen.
3. Trykk {{key:Enter}}.
   Statuslinjen sier «Avgrensning satt; trekanter utenfor den er borte.» **Avgrensning** i fakta om terrengmodellen sier «Ja» og antallet hjørner.

Verdt å vite:

- Det finnes én avgrensning. Å tegne en ny erstatter den. {{ui:Fjern avgrensningen}} tar den bort.
- Den kan bare fjerne: en avgrensning som går forbi punktene, kuttes tilbake til omrisset deres, med merknaden «Avgrensningen går forbi punktene; den ble kuttet tilbake til omrisset deres.»
- Hjørnene tar høydene sine fra terrengmodellen, slik at kanten følger terrenget nøyaktig.
- Skjulte (indre) avgrensninger er ikke tilgjengelige ennå.

## Trim lange trekanter på utsiden

Uten en avgrensning fyller terrengmodellen hele omrisset av punktene, inkludert lange, tynne trekanter over konkave kanter.

1. I **Terrengmodell**, skriv inn en lengde i **Lengste ytterkant** og trykk {{key:Enter}}. Start med omtrent to til tre ganger din vanlige avstand mellom målepunktene.
2. Trekanter på utsiden hvis ytterkant er lengre enn det, fjernes, og arbeidet fortsetter innover til hver ytterkant er kort nok. En kant som er en bruddlinje fjernes aldri.
3. Skriv inn 0 for å beholde alle trekantene igjen.

## Les rapporten for terrengmodellen

Under fakta om terrengmodellen lister en boks hva byggeren gjorde. Med en okerfarget stolpe til venstre er det informasjon; med en rød stolpe inneholder den en feil, og det finnes ingen terrengmodell.

| Melding | Betydning |
|---|---|
| «3 punkter var på samme sted som et annet og ble slått sammen med det.» | Punkter nærmere enn 0.0001 i planen ble ett hjørne (det første beholdes). |
| «2 steder har to ulike høyder …» | Punkter oppå hverandre, eller krysende bruddlinjer, er uenige i høyde. Bruddlinjens høyde vinner, deretter den første. |
| «1 bruddlinjestykke kunne ikke tvinges inn i terrengmodellen.» | Et veldig kort eller nesten overlappende bruddlinjestykke fikk ikke plass; kontroller det stedet. |
| «En terrengmodell trenger minst tre punkter med høyder.» | For få punkter: kontroller kolonnerekkefølgen og gruppene. |
| «Punktene ligger alle på én linje: ingen trekanter.» | Punktene har ingen bredde, for eksempel en enkelt polygontog-linje. |
| «Avgrensningen overlapper ikke punktene.» | Avgrensningen ligger et annet sted, ofte en blanding av enheter eller koordinatsystem. |
| «Ingen trekanter er igjen innenfor avgrensningen.» | Avgrensningen er for liten eller feilplassert. |

## En terrengmodell lest fra LandXML

Når du åpner LandXML, brukes den første TIN-terrengmodellen slik den er: overskriften **Terrengmodell** sier «Terrengmodell (fra LandXML)», og **Lengste ytterkant** er gråtonet. Mens den modellen er i bruk, endrer ikke bruddlinjegrupper, tegnede bruddlinjer og en ny avgrensning den. For å bygge terrengmodellen fra filens punkter i stedet, klikk {{ui:Bygg terrengmodellen på nytt fra punktene}}. {{key:Mod+Z}} henter LandXML-terrengmodellen tilbake.

## Relatert

- [Les høydekurver, høyder og skråninger](topic:contours).
- [Importer oppmålingspunkter](topic:import-points).
