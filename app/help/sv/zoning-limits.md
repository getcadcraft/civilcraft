---
title: Kontrollera volymer mot de planbestämmelser du skriver in
summary: Skriv in en tomts avstånd rad för rad, en höjdbegränsning, ett himmelsplan, ett exploateringstal och en bebyggelsegrad, se den byggbara ytan i planen och läs vilka volymer som bryter mot vilken gräns.
keywords: planbestämmelser, avstånd, framavstånd, sidoavstånd, bakavstånd, byggbar yta, höjdbegränsning, himmelsexponeringsplan, exploateringstal, bebyggelsegrad, tomt, fastighet, bestämmelser, kontroll av bestämmelser
from: 3e267b31
---

**CivilCraft har inga planbestämmelser i sig.** Det känner inte till någon stads regler och levererar inget bibliotek med dem. Varje siffra på den här sidan är en du skriver in, hämtad från dina egna bestämmelser, och varje resultat säger att det mäts mot de gränser du skrev in. Det är ett sätt att se hur en tomts gränser formar en byggnad, inte ett besked om en design är tillåten.

## Skriv in gränserna

Under **Egenskaper**, under **Byggnadsvolymer**, välj en **Fastighet** (eller markera en volym: dess fastighets gränser visas under den). Fyll sedan i det som gäller; lämna en ruta tom för "ingen gräns":

- **Gatulinje**: tomtgränsen mot gatan. **Framavstånd** gäller den, **Bakavstånd** gäller linjen som ligger längst bort från den, och **Sidoavstånd** gäller resten.
- **Höjdbegränsning**.
- **Himmelsplan**: det startar på en höjd vid tomtgränsen och stiger med det belopp du skriver in för varje 1 inåt, mätt från gatulinjen eller från varje tomtgräns (2 betyder 2 till 1). Den tillåtna höjden över en punkt är det lägsta av planet och höjdbegränsningen.
- **Exploateringstal** (bruttoarea för volymerna på tomten delat med tomtens area) och **Bebyggelsegrad** (deras fotavtryck delat med tomtens area, inskrivet i procent).

## Den byggbara ytan

Bocka i **Visa den byggbara ytan i planen** för att rita den på lagret `A-MASS-ENVL`. Den byggbara ytan är tomten, dragen inåt från varje tomtgräns med den linjens egna avstånd, där förskjutningslinjerna möts i hörn med geringar. En tomtgräns som består av en kurva tas som korta korder inom 0,01 från kurvan. Konvexa och konkava tomter fungerar båda. Om avstånden viker över sig själva (ett djupt avstånd på en smal eller mycket konkav tomt) finns ingen byggbar yta, och Egenskaper säger det; prova mindre avstånd.

## Resultatet

Under rutorna får varje volym och varje gräns en rad, med en bock eller ett kryss:

- **avstånd**: den yta av volymen som ligger utanför den byggbara ytan;
- **höjd**: volymens höjd mot den högsta tillåtna över dess fotavtryck (en prisma med en enda höjd begränsas av den lägsta tillåtna höjden i något av sina hörn);
- **exploateringstal** och **bebyggelsegrad**: alla volymer på fastigheten summerade.
