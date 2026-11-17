---
title: Planteringsplaner och förteckningar
summary: Placera enskilda växter, planteringsbäddar fyllda efter växternas avstånd med blandade växter efter procent, och häckar; märk dem; räkna dem i en växtförteckning för ett kalkylblad eller TakeoffCraft.
keywords: planteringsplan, växtförteckning, planteringsbädd, massplantering, häck, träd, buske, marktäckare, avstånd, triangulärt avstånd, växtantal, mängder, etiketter, krona, växtsymboler, ifc, mängdavtagning
from: ab49eab5
---

## Placera växter

1. Välj en växt i **Växter** till vänster.
2. Klicka på {{ui:Växt}}, och klicka sedan i planen: varje klick placerar en växt. Tryck på {{key:Esc}} för att sluta.

En växts symbol ritas efter dess spridning vid mognad; Mer › {{ui:Visa i planteringsstorlek}} ritar varje växt i den storlek den planteras i. Träd står på marken under dem: när du senare planerar tomten följer de den. För att fixera en växt på en höjd i stället, skriv in den i **Höjd** i Egenskaper.

## Planteringsbäddar

1. Välj huvudväxten, klicka på {{ui:Bädd}} och klicka på bäddens hörn. Tryck på {{key:Enter}} (eller klicka på första hörnet igen) för att stänga den.
2. Bädden fylls med den växten i dess avstånd, i ett **triangulärt** mönster (det vanliga: varje växt lika långt från sex andra), ett halvt avstånd in från kanten.
3. I Egenskaper blandar **Lägg till en växt** in växten som valts till vänster. Ange varje växts **Andel %**: bädden tar exakt så många av varje, utspridda över den. **Blanda om** slumpar var de hamnar.

**Avstånd** tomt använder växternas egna avstånd (viktade efter deras andelar); skriv ett värde för att använda det för alla växter. **Mönster** kan vara kvadratiskt, och **Rader vid** vrider raderna.

## Häckar

Välj häckväxten, klicka på {{ui:Häck}}, klicka längs häcken och tryck på {{key:Enter}}. Växter placeras längs linjen med deras avstånd, centrerade så att båda ändar får samma marginal. En häck kan vara **två rader, förskjutna**, ett fast avstånd från varandra.

## Etiketter

Enskilda växter märks med etikettinställningen (`{name}` som standard); skriv en egen etikett för en växt i Egenskaper. Bäddar märks med varje växts antal, häckar med sitt. Mer › {{ui:Växtetiketter}} slår på och av etiketterna. Etikettfält: `{name}`, `{botanical}`, `{size}` (behållaren), `{qty}`, `{height}`, `{spread}`, `{container}`.

## Växtförteckningen

Mer › {{ui:Växtförteckning…}} räknar varje växt per art, från enskilda växter, bäddar och häckar tillsammans, med dess planteringsstorlek. Spara den som **CSV** eller **XLSX**, eller **Skicka till TakeoffCraft**: en mängdfil som TakeoffCraft öppnar för att prissätta växterna (med hårdgjorda ytor och bevattningsmängder bredvid).

## IFC

Mer › {{ui:Exportera landskaps-IFC}} sparar landskapet som en IFC-fil (IFC 4.3) som en BIM-modell kan innehålla: varje växt är ett `IfcGeographicElement` av typen VEGETATION, typat efter sin art med växtens egenskaper (botaniskt namn, storlekar, härdighet, vatten, ljus), varje bädd och häck är ett element med sina antal, på tomten. BimCraft öppnar det bredvid byggnaden.
