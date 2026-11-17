---
title: Een AI-assistent met uw bouwplaats laten werken
summary: Schakel assistenten in bij Instellingen zodat een assistent op uw computer de geopende bouwplaats kan lezen (punten, terreinen, volumes, profielen, percelen), meetpunten kan toevoegen, en LandXML of DWG kan opslaan en exporteren, via CadCraft Studio. Uit totdat u het aanzet.
keywords: ai, assistent, mcp, script, automatisering, studio, punten, hoogte, stationering, offset, tracé, volume, ontgraving, ophoging, profiel, perceel, landxml, dwg, usd, mappen, rechten, verbinding verbreken, activiteit
from: d0356582
---

## Wat u leert

Hoe u een AI-assistent (elke assistent die MCP spreekt) met de bouwplaats die u open heeft laat werken, wat die wel en niet kan, en hoe u hem stopt.

## Wat een assistent kan doen in CivilCraft

| Hij vraagt om | Wat hij krijgt | Vereist |
|---|---|---|
| De bouwplaats | Naam, eenheden, coördinatenstelsel, puntengroepen, tracés, terreinen, platen, percelen en leidingen | Lezen |
| Meetpunten | Nummer, easting, northing, hoogte en beschrijving, per groep, per beschrijving of binnen een kader | Lezen |
| Terreinhoogten | Het bestaande maaiveld (of het geplateauerde terrein) op de punten die hij noemt | Lezen |
| Stationeringen en offsets | De stationering en offset van punten langs een tracé, of de coördinaten en het maaiveld van stationeringen | Lezen |
| Een profiel | Maaiveld, ontwerpprofiel en het geplateauerde terrein langs een tracé, elke zoveel ft of meter | Lezen |
| Ontgraving en ophoging | Volumes tussen het bestaande maaiveld en het geplateauerde terrein (ook elke plaat en corridor), of tussen het maaiveld en een vlak | Lezen |
| Percelen | Hoekpunten, oppervlakte (in acres of hectare), omtrek en de juridische omschrijving | Lezen |
| Een selectie | De punten die hij noemt worden op het plan geselecteerd, alsof u ze had aangeklikt | Bewerken |
| Nieuwe meetpunten | Punten toegevoegd met de nummers die hij geeft, of de eerstvolgende vrije. Elke aanroep is één stap die u ongedaan kunt maken | Bewerken |
| Opslaan | De eigen {{ui:Opslaan}} van CivilCraft | Opslaan |
| LandXML of DWG | Dezelfde bestanden als de knoppen {{ui:LandXML}} en {{ui:DWG}} | Exporteren |
| De bouwplaats in 3D | OpenUSD (.usdz, .usda of .usdc) van het maaiveld, het geplateauerde terrein, platen en leidingen, zoals de 3D-weergave het exporteert | Exporteren |
| Beplanting en de beplantingslijst | Beplanting gevonden in de beplantingslijst onder elke naam, en de aantallen van de beplantingslijst | Lezen |
| Beplanting en grondwerk | Beplanting, een bed of een haag geplaatst, of een platform, berm, greppel of grondwerkgebied toegevoegd, elk één stap die u ongedaan kunt maken, met zijn ontgraving en ophoging | Bewerken |
| Een beregeningscontrole | De debiet van elke zone, de druk die nodig is bij zijn klep en bij de toevoer, de hoogste belasting, looptijden, problemen en de materiaallijst, als rekenhulp die een beregeningsontwerper controleert | Lezen |

Hij werkt met de bouwplaats die open is. In Studio kan hij ook opslaan en exporteren naar mappen die u kiest (zie hieronder); zonder map worden zijn bestanden gedownload zoals de knoppen dat doen.

## Inschakelen

Assistenten bereiken CivilCraft via CadCraft Studio op uw computer; de gewone browser heeft geen toegang.

1. Open {{ui:Instellingen}} en kies het tabblad **CivilCraft**.
2. Vink onder **Assistenten** aan: **AI-assistenten en scripts CivilCraft laten gebruiken**.
3. **Lezen** staat voor u aan. Vink **Bewerken**, **Opslaan** of **Exporteren** alleen aan wanneer de assistent die nodig heeft.
4. Om hem te laten opslaan en exporteren naar een map, kiest u {{ui:Een map toevoegen…}} onder **Mappen die het mag gebruiken** en kiest u de map in het dialoogvenster van Studio. {{ui:Verwijderen}} neemt die meteen weer terug; elk ander pad wordt geweigerd.
5. Verbind de assistent in Studio (Studio toont het adres en de instellingen om in de assistent te plakken).

## Terwijl een assistent is verbonden

Een melding bovenaan het rechterpaneel zegt welke assistent verbonden is en wat die kan doen. Klik op {{ui:Verbinding verbreken}} om zijn sessie meteen te beëindigen; hij moet opnieuw verbinding maken om door te gaan.

**Activiteit**, onder **Assistenten** in Instellingen, toont elke aanroep die de assistent deed, de nieuwste eerst, met of ze lukte.

:::tip
Vraag in gewone woorden, bijvoorbeeld "wat is de maaiveldhoogte elke 50 ft langs de Hoofdstraat?", "hoeveel ontgraving en ophoging hebben de platen nodig?" of "voeg een controlepunt toe op deze coördinaten". De assistent leest de bouwplaats en antwoordt, of maakt de wijziging als één stap die u ongedaan kunt maken.
:::

## Zonder CivilCraft te openen

De CadCraft-bestandsserver voor assistenten (`npx @getcadcraft/mcp`) en de `cadcraft`-opdrachtregel openen opgeslagen CivilCraft-projecten (`.civilcraft.json`) en puntenbestanden met de eigen code van CivilCraft, zonder venster: dezelfde leesfuncties, meetpunten toevoegen, het project opslaan, LandXML en de bouwplaats in 3D als OpenUSD. `cadcraft convert site.civilcraft.json site.xml` schrijft LandXML vanaf de opdrachtregel. Het openen van LandXML, de DWG-export en de gereedschappen van de werkomgeving Landschap hebben nog steeds het venster van CivilCraft nodig.

## Uitschakelen

Haal het vinkje weg bij **AI-assistenten en scripts CivilCraft laten gebruiken**. Elke assistent wordt meteen losgekoppeld, en de instelling blijft bewaard voor de volgende keer.

## Zie ook

- [Recepten voor AI-assistenten](common:assistants-recipes): uitgewerkte voorbeelden, elk met de gereedschappen die het aanroept.
- [Een horizontaal tracé uitzetten](topic:alignment)
- [Terrein opbouwen en verfijnen](topic:build-surface)
- [Meetpunten selecteren, kopiëren en plakken](topic:copy-paste-points)
- [Instellingen van CivilCraft](topic:settings)
