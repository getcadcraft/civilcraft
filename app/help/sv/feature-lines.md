---
title: Funktionslinjer
summary: Rita 3D-linjer som du lutar punkt för punkt, gör trappstegsförskjutningar av dem och använd dem som brytlinjer i marken eller som lutande byggplattor i designen.
keywords: båge, kurva, radie, 3D-båge, helix, böjd kantsten, lutningsöverlägg, höjdöverlägg, lutningspilar, funktionslinje, lutning, slänt, höjd, trappstegsförskjutning, förskjutning, brytlinje, kantsten, dike, bankett, lutande byggplatta, släntkrön, planering, 3D-polylinje
from: d55b25fb
---

En funktionslinje är en linje med en höjd i varje hörn: en kantsten, en diklinje, överkanten på en bankett, kanten på en lutande byggplatta. Du anger dess höjder med siffror eller med lutning, kopierar den åt sidan med ett steg upp eller ner, och väljer vad terrängmodellerna gör med den.

## Rita en

1. Välj **Terrängmodell** › {{ui:Mer}} › {{ui:Funktionslinje}}, eller tryck på {{key:L}}.
2. Klicka på linjens hörn i planen. Ett klick på en inmätningspunkt tar punktens plats och höjd; på annan plats tar hörnet den befintliga markens höjd där.
3. Tryck på {{key:Enter}} för att avsluta en öppen linje, eller klicka på det första hörnet igen för att stänga den.

Den nya linjen är markerad och startar som en brytlinje för befintlig mark, liggande på marken.

## Bågar

Ett segment kan vara en båge i plan vars ändar ligger på olika höjder: ett kantstensnedsväng, ett böjt dike, en ramp som svänger. Dess lutning löper jämnt längs bågen, och dess längd mäts längs kurvan.

- **Medan du ritar:** tryck på {{key:C}} (på en pekskärm, {{ui:Båge}} i fältet över planen) för att slå på bågar. Efter ett hörn klickar du på en punkt på kurvan och sedan där bågen slutar. Tryck på {{key:C}} igen för raka segment. {{key:Backspace}} tar först bort punkten på kurvan.
- **Efteråt:** i **Egenskaper** skriver du en radie och åt vilket håll den svänger i hörnets **Båge**-ruta, till exempel `50 L` eller `50 R` (vänster eller höger när du går längs linjen), och trycker på {{key:Enter}}. Töm rutan för att göra segmentet rakt igen. En radie som är mindre än halva segmentet avvisas.

Den markerade linjen visar varje bågs radie bredvid dess lutning. **Längd** är längs bågarna i plan; **3D-längd** räknar också med stigningen och fallet. Trappstegsförskjutningar behåller bågarna: en båge på utsidan av en kurva växer, en på insidan krymper, och en förskjutning förbi en bågs mittpunkt avvisas.

Terrängmodellerna, 3D-vyn och DXF och DWG tar varje båge som korta raka delar som håller sig inom 0.01 från kurvan. LandXML behåller dem som bågar (se **Bågar i andra filer** nedan).

## Ange höjder och lutningar

**Egenskaper** listar hörnen med deras avstånd längs linjen, deras **Höjd** och **Lutning till nästa** (i procent). Skriv antingen och tryck på {{key:Enter}}:

- En höjd flyttar bara det hörnet.
- En lutning sätter höjden vid segmentets bortre ände; hörnen efter den står kvar, så nästa segments lutning ändras.

Också i **Egenskaper**:

| Åtgärd | Vad den gör |
|---|---|
| **Höj eller sänk alla med** | Lägger till den höjd du skriver till varje hörn. |
| {{ui:Höjder från marken}} | Sätter varje hörn tillbaka på den befintliga marken (hörn utanför terrängmodellen behåller sina höjder och listas). |
| {{ui:En lutning, första till sista}} | Behåller första och sista höjden och lägger hörnen mellan dem på en jämn lutning. |

Den markerade linjen visar sina höjder vid hörnen och sina lutningar längs segmenten i planen. Dra ett hörn med {{ui:Markera}} för att flytta det; dess höjd behålls.

## Trappstegsförskjutningar

Under **Trappstegsförskjutning** skriver du ett **Avstånd** (positivt åt höger om linjens riktning, negativt åt vänster), sedan en höjd (upp eller ner med) eller en lutning i procent, och klickar på {{ui:Skapa förskjuten linje}}. Kopian är en ny funktionslinje: till exempel kantstenens baksida 0.5 ft åt sidan och 0.5 ft högre, eller en dikeskant 6 ft ut vid 2 %. Ett avstånd som skulle vika kopian över sig självt vid en skarp kurva avvisas.

## Lutningar och höjder på skärmen

Tryck på {{key:E}}, eller kryssa i **Lutningar och höjder på funktionslinjer** under Visning, för att se varje funktionslinjes lutning längs varje segment (med en liten pil som pekar nedför) och dess höjd vid hörnen. De visas bara på skärmen: inget läggs till i ritningen, och PDF, DXF och DWG förblir som de är. Korta segment och tätt placerade hörn saknar etiketter tills du zoomar in. Den markerade linjen visar alltid sina egna lutningar och höjder.

## I längdprofilvyn

En funktionslinje som korsar en linjeföring visas i den linjeföringens längdprofilvy, med sitt namn och sin höjd vid korsningen; linjer som löper bredvid kan också visas. Se [Designa en längdprofil](topic:profile).

## Vad terrängmodellerna gör med den

Välj **Användning**:

| Användning | Vad som händer |
|---|---|
| Brytlinje för befintlig mark | Den befintliga marken går genom linjen på dess höjder, precis som en ritad brytlinje. |
| Planerad i designen | En **sluten** linje blir en lutande byggplatta: den föreslagna terrängen inom den planeras till sin kant. Slå på **Släntkrön mot marken** för att dra schakt- och fyllningsslänter (1 horisontellt till 1 vertikalt) från dess kant till marken, som en byggplatta gör; varje slänt startar på kantens egen höjd där. |
| Endast ritad | Den ligger kvar i planen och exporteras i DXF, DWG och PDF (lager C-GRAD-FEAT, 3D-polylinjer), men terrängmodellerna ignorerar den. |

Volymer, sektioner och 3D-vyn tar med funktionslinjer som är planerade i designen, precis som byggplattor. Varje ändring är ett steg: {{key:Mod+Z}} ångrar den.

## Dela linjer med ditt team

I en ritning som öppnats från dina molnfiler i CadCraft Studio, på en teamplan, har projektets **Egenskaper** (inget markerat) ett avsnitt **Team** med {{ui:Teamlinjer…}}: de linjer ditt team har delat, var och en med sin revision, utan att du först behöver markera en funktionslinje. Markera en linje för att dela den, skicka en ny revision, hämta teamets, eller sluta dela. Utanför den inställningen säger avsnittet vad det behöver.

## Bågar i andra filer

| Fil | Vad som händer med en funktionslinje med bågar |
|---|---|
| CivilCraft-projekt | Behålls exakt. |
| LandXML | Skrivs som en planfunktion med linjer och bågar med deras höjder, och läses tillbaka med sina bågar. En funktionslinje från ett annat program kommer in som **Endast ritad**: välj dess **Användning** för att lägga den i en terrängmodell. |
| DWG och DXF | En 3D-polylinje kan inte innehålla en båge, så linjen skrivs som korta delar inom 0.01 från varje båge. CivilCraft noterar också i ritningen vilka delar som var bågar: när du öppnar ritningen som linjer, hämtar {{ui:Funktionslinjer}} tillbaka linjerna som funktionslinjer med deras bågar. Andra program ser en vanlig 3D-polylinje. |
