---
title: Låt en AI-assistent arbeta med din tomt
summary: Slå på assistenter i Inställningar så att en assistent på din dator kan läsa den öppna tomten (punkter, ytor, volymer, profiler, fastigheter), lägga till mätpunkter, spara och exportera LandXML eller DWG, via CadCraft Studio. Av tills du slår på den.
keywords: ai, assistent, mcp, skript, automatisering, studio, punkter, höjd, station, sidoavstånd, linjeföring, volym, schakt, fyllning, profil, fastighet, landxml, dwg, usd, mappar, behörigheter, koppla från, aktivitet
from: d0356582
---

## Vad du lär dig

Hur du låter en AI-assistent (vilken assistent som helst som talar MCP) arbeta med den tomt du har öppen, vad den kan och inte kan göra, och hur du stoppar den.

## Vad en assistent kan göra i CivilCraft

| Den begär | Den får | Behöver |
|---|---|---|
| Tomten | Namn, enheter, koordinatsystem, punktgrupper, linjeföringar, terrängmodeller, byggplattor, fastigheter och ledningar | Läsa |
| Mätpunkter | Nummer, easting, northing, höjd och beskrivning, per grupp, per beskrivning eller inuti en ruta | Läsa |
| Ythöjder | Befintlig mark (eller den planerade ytan) vid de punkter den anger | Läsa |
| Stationer och sidoavstånd | Stationen och sidoavståndet för punkter längs en linjeföring, eller koordinaterna och markhöjden för stationer | Läsa |
| En profil | Mark-, designprofil- och planerade ytans höjder längs en linjeföring, var så många fot eller meter | Läsa |
| Schakt och fyllning | Volymer mellan befintlig mark och den planerade ytan (varje byggplatta och korridor också), eller mellan marken och en nivå | Läsa |
| Fastigheter | Hörn, area (i acres eller hektar), omkrets och den juridiska beskrivningen | Läsa |
| Ett urval | De punkter den anger markeras i planen, som om du hade valt dem | Redigera |
| Nya mätpunkter | Punkter som läggs till med de nummer den anger, eller nästa lediga. Varje anrop är ett steg som du kan ångra | Redigera |
| Spara | CivilCrafts egen {{ui:Spara}} | Spara |
| LandXML eller DWG | Samma filer som knapparna {{ui:LandXML}} och {{ui:DWG}} | Exportera |
| Tomten i 3D | OpenUSD (.usdz, .usda eller .usdc) av marken, den planerade ytan, byggplattor och ledningar, som 3D-vyn exporterar dem | Exportera |
| Växter och växtlistan | Växter som hittas i växtlistan under vilket namn som helst, och växtlistans antal | Läsa |
| Plantering och markarbete | Växter, en bädd eller en häck placerad, eller en plattform, vall, dike eller markarbetsyta tillagd, vart och ett ett steg som du kan ångra, med dess schakt och fyllning | Redigera |
| En bevattningskontroll | Varje zons flöde, trycket som behövs vid dess ventil och vid försörjningen, det värsta fallet för tryckhöjd, körtider, problem och materialförteckningen, som ett beräkningsunderlag som en bevattningskonstruktör kontrollerar | Läsa |

Den arbetar med tomten som är öppen. I Studio kan den också spara och exportera till mappar du väljer (nedan); utan mapp laddas dess filer ner precis som knapparnas gör.

## Slå på det

Assistenter når CivilCraft via CadCraft Studio på din dator; den vanliga webbläsaren har ingen väg in.

1. Öppna {{ui:Inställningar}} och välj fliken **CivilCraft**.
2. Under **Assistenter**, bocka i **Låt AI-assistenter och skript använda CivilCraft**.
3. **Läsa** är bockad för dig. Bocka i **Redigera**, **Spara** eller **Exportera** bara när assistenten behöver dem.
4. För att låta den spara och exportera till en mapp, välj {{ui:Lägg till en mapp…}} under **Mappar den får använda** och välj mappen i Studios dialogruta. {{ui:Ta bort}} tar tillbaka den direkt; alla andra sökvägar nekas.
5. Anslut assistenten i Studio (Studio visar adressen och inställningarna att klistra in i den).

## När en assistent är ansluten

En notis överst i den högra panelen säger vilken assistent som är ansluten och vad den kan göra. Klicka på {{ui:Koppla från}} för att avsluta dess session direkt; den måste ansluta igen för att fortsätta.

**Aktivitet**, under **Assistenter** i Inställningar, listar varje anrop som assistenten gjort, nyast först, med om det lyckades.

:::tip
Fråga med vanliga ord, till exempel "vilken markhöjd finns var 50:e fot längs Main Street?", "hur mycket schakt och fyllning behöver byggplattorna?" eller "lägg till en kontrollpunkt vid dessa koordinater". Assistenten läser tomten och svarar, eller gör ändringen som ett steg som du kan ångra.
:::

## Utan att öppna CivilCraft

CadCrafts filserver för assistenter (`npx @getcadcraft/mcp`) och kommandoraden `cadcraft` öppnar sparade CivilCraft-projekt (`.civilcraft.json`) och punktfiler med CivilCrafts egen kod, utan fönster: samma läsverktyg, tillägg av punkter, spara projektet, LandXML och tomten i 3D som OpenUSD. `cadcraft convert site.civilcraft.json site.xml` skriver LandXML från kommandoraden. Att öppna LandXML, DWG-exporten och verktygen i arbetsytan Landscape kräver fortfarande CivilCraft-fönstret.

## Stäng av det

Avbocka **Låt AI-assistenter och skript använda CivilCraft**. Varje assistent kopplas genast från, och inställningen sparas till nästa gång.

## Se även

- [Recept för AI-assistenter](common:assistants-recipes): exempel, vart och ett med de verktyg det anropar.
- [Lägg ut en horisontell linjeföring](topic:alignment)
- [Bygg och förfina terrängmodellen](topic:build-surface)
- [Markera, kopiera och klistra in mätpunkter](topic:copy-paste-points)
- [CivilCraft-inställningar](topic:settings)
