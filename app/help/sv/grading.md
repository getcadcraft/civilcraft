---
title: Planera en byggplatta
summary: Rita en plan platta, ange dess höjd och schakt- och fyllningsslänter, och låt CivilCraft hitta släntkrönet mot befintlig mark och lägga till plattan i den projekterade ytan.
keywords: stödmur, stödmurar, lodrät sida, mur i stället för slänt, slänt per sida, bank, planering, byggplatta, släntkrön, planeringsgrupp, schaktslänt, fyllningsslänt, slutlig planering, projekterad yta, markplanering
from: 482319a6
---

En byggplatta är en plan yta på en och samma höjd. Från dess kant planerar CivilCraft utåt med din schaktslänt där marken är högre än plattan och med din fyllningsslänt där den är lägre, tills slänten möter den befintliga marken. Den linjen är släntkrönslinjen. Plattan och dess slänter ersätter den befintliga marken innanför släntkrönslinjen och bildar den projekterade ytan.

## Rita plattan

Du behöver först en befintlig markyta.

1. Tryck på {{key:G}} eller klicka på {{ui:Pad}} i gruppen **Design**.
   Tipset säger ”Byggplatta: klicka på dess hörn. Enter eller dubbelklick avslutar, Backspace tar bort det sista, Esc avbryter.”
2. Klicka på plattans hörn i ordning, åt vilket håll som helst. En blå kontur följer pekaren.
3. Tryck på {{key:Enter}} efter det sista hörnet (minst tre).
   Plattan ritas och markeras. Den börjar på markhöjden vid sin mitt, avrundad till 0.1, med en schaktslänt på 2 : 1 och en fyllningsslänt på 3 : 1. Statusfältet säger till exempel ”Platta 1 på höjden 254.3 (marken i dess mitt), schakt 2:1, fyll 3:1. Ändra dem under Egenskaper.”

:::warning
Avsluta med {{key:Enter}}. Dubbelklick avslutar också, men i den här versionen tar det bort hörnet du dubbelklickade på. Klicka en gång på sista hörnet och tryck sedan på {{key:Enter}}.
:::

Plattans kontur får inte korsa sig själv (”Plattans kontur korsar sig själv.”).

## Ange höjd och slänter

Med plattan markerad visar den högra panelen **Platta**:

1. **Namn**.
2. **Höjd**: plattans plana höjd.
3. **Schaktslänt** och **Fyllningsslänt**, som H:V (2 betyder 2 : 1). Båda måste vara större än 0.
4. **Plattans area** och **Hörn** visas som referens.

Tryck på {{key:Enter}} efter varje värde. Släntkrönslinjen, den projekterade ytan och volymerna uppdateras direkt.

Under fälten står en rad, till exempel ”Släntkrönslinje: 48 släntlinjer (20 i schakt, 28 i fyllning), längst ut 31.20 ft.” Planen visar släntkrönslinjen och släntlinjerna i magenta.

## Hur släntkrönet hittas

- Släntlinjer går ut från varje kant i rät vinkel mot den, ungefär var tjugonde del av plattans storlek.
- Vid yttre hörn viftar de ut var 10°, så att slänten går runt hörnet.
- Vid inre hörn löper en linje längs halveringslinjen, där slänterna från de två kanterna möts.
- Varje linje stiger i din schaktslänt eller sjunker i din fyllningsslänt tills den når marken.

## Slänter per sida och stödmurar

Under **Sidor och stödmurar** i Egenskaperna för en platta, en plattform eller en vall kan varje sida planeras på sitt eget sätt. Sida 1 går från det första hörnet du klickade på till det andra, sida 2 från det andra till det tredje, och så vidare.

- **Alla sidor**: **Slänt** använder schakt- och fyllningsslänterna ovan på varje sida; **Lodrät: stödmurar** sätter en mur på varje sida.
- Per sida: **Slänter ovan**, **Egna slänter** (skriv in en schakt- och en fyllningsslänt för den sidan) eller **Lodrät (stödmur)**.
- Skriv in en slänt som `3` eller `3:1` (horisontellt mot 1 vertikalt), `33%` eller `18.4°`; den visas som H:1. Plattans egna **Schaktslänt** och **Fyllningsslänt** tar samma format.
- En lodrät sida har ingen bank: en stödmur går längs kanten, från plattan ner till befintlig mark (i fyllning) eller från marken ner till plattan (i schakt). **Murtjocklek** (0.3 m eller 1 ft från början) är hur långt marken går från plattkanten till befintlig mark. Schakt- och fyllningsvolymer utelämnar den bank som sidan inte längre har.
- Där en mur möter en slänt sida går slänten runt murens ände; två murar möts i en geringsfog.
- Under fälten visas murarnas längd, synliga yta (höjd gånger längd), högsta och genomsnittliga höjd.

Planen ritar varje murs yttre yta med korta tvärstreck och murens höjd i båda ändar och vid sin högsta punkt (på lagret för stödmurar, som också går till DXF och DWG). 3D-vyn visar murarna som solida kroppar (Visa › Stödmurar), och GLB-, OBJ- och USD-exporter tar med dem. Sektioner över kanten visar steget.

**Varningar** (i Egenskaper och i panelen Problem): en mur högre än **Varna över en murhöjd på** (1.0 m eller 3.3 ft från början) ”kan kräva en konstruerad mur eller ett bygglov; kontrollera lokala regler”, och, när du skriver in **Brantaste slänt som jorden står**, varje sida vars schakt- eller fyllningsslänt är brantare än det. De är varningar: planeringen byggs ändå. Varje ändring är ett steg för {{key:Mod+Z}}.

## Flytta hörn

Markera plattan och dra sedan i ett kvadratiskt handtag vid ett hörn. Varje dragning är ett steg i ångra. Att lägga till eller ta bort ett hörn finns inte ännu: ta bort plattan och rita den igen.

## När den inte planerar

En röd ruta under **Jordarbeten** anger plattan och problemet:

| Meddelande | Vad du gör |
|---|---|
| ”3 släntlinjer går utanför ytan innan de möter den: plattan ligger för nära ytans kant eller för högt/lågt.” | Flytta plattan inåt från ytans kant, eller ta dess höjd närmare marken. |
| ”Släntkrönslinjen korsar sig själv (släntlinjer från olika sidor av plattan löper in i varandra). Forma om plattan eller ändra slänterna.” | Typiskt för smala eller L-formade plattor i djup schakt eller hög fyllning. Gör plattan bredare, jämna ut höjdskillnaden eller gör slänterna brantare. |
| ”Plattans kontur korsar sig själv.” | Rita om hörnen i ordning runt plattan. |

En platta med problem utelämnas från den projekterade ytan och volymerna tills den är åtgärdad.

## Se resultatet

1. Under **Visning** sätter du **Yta** till {{ui:Proposed (graded)}}. Höjdkurvorna går nu plant över plattan och följer slänterna ut till släntkrönslinjen.
2. För pekaren över plattan: statusfältet visar höjderna **Mark** och **Planerad**.
3. Läs schakt och fyllning under **Jordarbeten**; se [Jordvolymer](topic:volumes).

Plattor planeras efter korridorerna, i den ordning de ritades. En senare platta ersätter allt tidigare innanför sin egen släntkrönslinje.

## Ta bort en platta

Markera den och tryck på {{key:Delete}} (på en Mac: Fn och delete), eller klicka på {{ui:Delete}}.

## Finns inte ännu

Plattor är plana: sluttande plattor, linjer med varierande lutning, bänkar och planering till ett avstånd eller ett höjdmål finns inte ännu. Se [Finns inte ännu](topic:not-built-yet).
