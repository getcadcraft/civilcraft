---
title: Bevattningsdesign
summary: Ett beräkningsstöd, inte en signerad konstruktion: sprinklers, grenledningar, huvudledning, ventiler och droppslangar på tomten; zoner som hittas från rören; tryckförlust enligt Hazen–Williams, värsta fallets sprinklerhuvud, flöde och tryck mot tillförseln, nederbördshastigheter, körtider, täckning och en materialförteckning.
keywords: bevattning, sprinkler, sprinklers, sprej, roterare, roterande munstycke, bubbler, droppbevattning, droppslang, droppare, ventil, zon, station, styrenhet, huvudledning, grenledning, anslutningspunkt, vattenförsörjning, tryck, psi, kPa, flöde, gpm, friktionsförlust, hazen williams, nederbördshastighet, körtid, täckning, huvud mot huvud, materialförteckning
from: 7d6342c1
---

:::warning
Detta är ett beräkningsstöd, inte en signerad konstruktion: en bevattningsprojektör kontrollerar varje resultat innan något byggs.
:::

## Lägg ut systemet

1. I avsnittet **Bevattning** till vänster väljer du **Huvud**, dess **Båge** och var bågen börjar, samt rördimensionerna för grenledningar och huvudledningen.
2. {{ui:Bevattning}} › {{ui:Anslutningspunkt}}: klicka där vattentillförseln ansluts. Ange dess **tryck**, det **tillgängliga flödet** och mätar- och backventilsförlusten i Egenskaper.
3. {{ui:Bevattning}} › {{ui:Ventil}}: klicka där varje zons ventil ska ligga. En ventil startar en zon.
4. {{ui:Bevattning}} › {{ui:Huvud}}: klicka för att placera sprinklerhuvuden; varje klick placerar ett.
5. {{ui:Bevattning}} › {{ui:Grenledning}}: klicka från en ventil genom dess huvuden och tryck på {{key:Enter}}. {{ui:Huvudledning}}: från anslutningspunkten till varje ventil.

Rörändar fästs mot huvuden, ventiler, tillförseln och andra rörändar, så nätet hänger ihop. En zon är allt som nås från dess ventil via grenledningarna; huvudledningen bär en zon i taget.

## Droppbevattning

{{ui:Bevattning}} › {{ui:Droppslang}}: klicka längs slangen, med start där den matas (en grenledningsände eller en ventil). Ange **droppflöde** och **avstånd** i Egenskaper; slangens flöde är droppen längs den.

## Kontrollen

{{ui:Bevattning}} › {{ui:Kontrollera systemet…}} listar varje zon:

| Kolumn | Så beräknas den |
|---|---|
| Flöde | Sprinklerhuvudenas flöden (och droppslangarnas) adderade |
| Vid ventilen | Värsta fallets sprinklerhuvuds arbetstryck plus rörförlusterna till det (Hazen–Williams, rörets innerdiameter, höjdskillnaden) och förlusten genom ventilen |
| Vid tillförseln | Samma plus huvudledningens förlust som bär den zonen, och mätar- och backventilsförlusten |
| Nederbörd | Sprinklerhuvudenas flöde över den yta de vattnar vid huvud-mot-huvud-avstånd |
| Minuter per vecka | Så många minuter som krävs för att ge **Vatten per vecka** |
| Problem | Hastigheten över gränsen, ett huvud utanför dess tryckintervall, sprej och roterare på samma ventil, för lite tryck eller flöde vid tillförseln, huvuden utan zon, slingor |

Markera en ventil för att se dess zons siffror och dess värsta fallets sprinklerhuvud ringat på planen. Materialförteckningen räknar huvuden efter typ och båge, rör efter dimension, ventiler, droppslang och droppare samt styrenhetens stationer. **Spara som CSV** sparar båda.

Inställningarna i avsnittet Bevattning: **Hazen–Williams C** (150 för nytt plaströr), den **högsta hastigheten** i ett rör (1.5 m/s), **förlusten genom en ventil** och **vatten per vecka**. De är märkta standardvärden.

## Täckning

{{ui:Bevattning}} › {{ui:Visa täckning}} visar hur stor del av ytan som sprinklerhuvudena lämnar torr, hur stor del som två eller fler huvuden vattnar, och vilka huvuden som inte når ett grannhuvud (avstånd huvud mot huvud).

## Huvuden

Huvudena i listan är **generiska** typer som CadCraft skrivit utifrån konstruktionsnederbördshastigheter (fasta sprejer, roterande munstycken, kugghjulsroterare, bubblers, mikrosprejer, droppare), inte någon tillverkares produkter. **Lägg till huvuden från en fil…** läser dina egna huvuden (en JSON-lista med varje huvuds kastlängd, flöde eller nederbördshastighet och tryckintervall); de sparas med projektet. En tillverkares publicerade data tas med endast med den tillverkarens dokumenterade tillstånd.

Under de generiska huvudena har listan **typiska huvuden** (deras namn slutar med "typiska värden"): munstyckesstorlekar för fasta sprejer, roterande munstycken och kugghjulsroterare, mikrosprejer, bubblers och droppare, med en radie, ett flöde och ett tryckintervall. CadCraft har tagit fram dem ur publicerad matematik (öppningsekvationen för flöde, skalningen av strålens kastlängd för radie) och nominella flödesklasser, enbart från öppna källor; ingen tillverkares tabell har kopierats. Välj ett och väljaren visar dess grund och licens. Ett projekt som använder ett sparar huvudet och dess källa i projektfilen. De är till för planering: kontrollera den verkliga sprinklerns egna data innan något byggs.
