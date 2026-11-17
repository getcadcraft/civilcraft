---
title: Laat 'n KI-assistent met jou terrein werk
summary: Skakel assistente in Instellings aan sodat 'n assistent op jou rekenaar die oop terrein kan lees (punte, oppervlaktes, volumes, profiele, erwe), opmetingspunte kan byvoeg, LandXML of DWG kan stoor en uitvoer, deur CadCraft Studio. Af totdat jy dit aanskakel.
keywords: ki, assistent, mcp, skrip, outomatisering, studio, punte, hoogte, stasie, afset, belyning, volume, afgrawing, opvulling, profiel, erf, landxml, dwg, usd, vouers, toestemmings, ontkoppel, aktiwiteit
from: d0356582
---

## Wat jy sal leer

Hoe om 'n KI-assistent (enige assistent wat MCP praat) met die terrein wat jy oop het te laat werk, wat dit kan en nie kan doen nie, en hoe om dit te stop.

## Wat 'n assistent in CivilCraft kan doen

| Dit vra vir | Wat dit kry | Benodig |
|---|---|---|
| Die terrein | Naam, eenhede, koördinaatstelsel, puntgroepe, belynings, oppervlaktes, {{ui:Plataform}}s, erwe en pype | Lees |
| Opmetingspunte | Nommer, oos, noord, hoogte en beskrywing, per groep, per beskrywing of binne 'n boks | Lees |
| Oppervlakhoogtes | Die bestaande grond (of die gegradeerde oppervlak) by enige punte wat dit noem | Lees |
| Stasies en afsette | Die stasie en afset van punte langs 'n belyning, of die koördinate en grondhoogte van stasies | Lees |
| 'n Profiel | Grond-, ontwerpprofiel- en gegradeerde oppervlakhoogtes langs 'n belyning, elke so baie voet of meter | Lees |
| Afgrawing en opvulling | Volumes tussen die bestaande grond en die gegradeerde oppervlak (elke plataform en korridor ook), of tussen die grond en 'n vlak | Lees |
| Erwe | Hoeke, oppervlakte (met akker of hektaar), omtrek en die wetlike beskrywing | Lees |
| 'n Keuse | Die punte wat dit noem, word op die plan gekies, asof jy hulle gekies het | Wysig |
| Nuwe opmetingspunte | Punte wat bygevoeg word met die nommers wat dit gee, of die volgende vrye nommers. Elke oproep is een stap wat jy kan ontdoen | Wysig |
| Stoor | CivilCraft se eie {{ui:Stoor}} | Stoor |
| LandXML of DWG | Dieselfde lêers as die {{ui:LandXML}}- en {{ui:DWG}}-knoppies | Uitvoer |
| Die terrein in 3D | OpenUSD (.usdz, .usda of .usdc) van die grond, gegradeerde oppervlak, plataforms en pype, soos die 3D-aansig dit uitvoer | Uitvoer |
| Plante en die plantskedule | Plante wat in die plantlys onder enige naam gevind word, en die plantskedule se tellings | Lees |
| Beplanting en gradering | Plante, 'n bedding of 'n heining wat geplaas word, of 'n platform, wal, grasgreppel of graderingsarea wat bygevoeg word, elk een stap wat jy kan ontdoen, met sy afgrawing en opvulling | Wysig |
| 'n Besproeiingskontrole | Elke sone se vloei, die druk wat by sy klep en by die toevoer nodig is, die ergste-geval-hoogte, looptye, probleme en die materiaallys, as 'n berekeningshulpmiddel wat 'n besproeiingsontwerper nagaan | Lees |

Dit werk met die terrein wat oop is. In Studio kan dit ook stoor en uitvoer na vouers wat jy kies (hieronder); sonder 'n vouer word sy lêers afgelaai soos die knoppies s'n doen.

## Skakel dit aan

Assistente bereik CivilCraft deur CadCraft Studio op jou rekenaar; die gewone blaaier het geen toegang nie.

1. Open {{ui:Instellings}} en kies die **CivilCraft**-oortjie.
2. Onder **Assistente**, merk **Laat KI-assistente en skripte CivilCraft gebruik**.
3. **Lees** is vir jou gemerk. Merk **Wysig**, **Stoor** of **Uitvoer** net wanneer die assistent dit nodig het.
4. Om dit toe te laat om na 'n vouer te stoor en uit te voer, kies {{ui:Voeg 'n vouer by…}} onder **Vouers wat dit mag gebruik** en kies die vouer in Studio se dialoog. {{ui:Verwyder}} neem dit dadelik terug; enige ander pad word geweier.
5. Koppel die assistent in Studio (Studio wys die adres en die instellings om in te plak).

## Terwyl 'n assistent gekoppel is

'n Nota bo-aan die regterpaneel sê watter assistent gekoppel is en wat dit kan doen. Klik {{ui:Ontkoppel}} om sy sessie dadelik te beëindig; dit moet weer koppel om voort te gaan.

**Aktiwiteit**, onder **Assistente** in Instellings, lys elke oproep wat die assistent gemaak het, nuutste eerste, met of dit gewerk het.

:::tip
Vra in gewone woorde, byvoorbeeld "wat is die grondhoogte elke 50 voet langs Main Street?", "hoeveel afgrawing en opvulling het die plataforms nodig?" of "voeg 'n beheerpunt by hierdie koördinate". Die assistent lees die terrein en antwoord, of maak die verandering as een stap wat jy kan ontdoen.
:::

## Sonder om CivilCraft oop te maak

Die CadCraft-lêerbediener vir assistente (`npx @getcadcraft/mcp`) en die `cadcraft`-opdragreël open gestoorde CivilCraft-projekte (`.civilcraft.json`) en puntlêers met CivilCraft se eie kode, sonder 'n venster: dieselfde leesinstrumente, punte byvoeg, die projek stoor, LandXML en die terrein in 3D as OpenUSD. `cadcraft convert site.civilcraft.json site.xml` skryf LandXML vanaf die opdragreël. LandXML oopmaak, die DWG-uitvoer en die Landskap-werkruimte se gereedskap benodig steeds die CivilCraft-venster.

## Skakel dit af

Ontmerk **Laat KI-assistente en skripte CivilCraft gebruik**. Elke assistent word dadelik ontkoppel, en die instelling word vir volgende keer behou.

## Sien ook

- [Resepte vir KI-assistente](common:assistants-recipes): werkende voorbeelde, elk met die instrumente wat dit roep.
- [Lê 'n horisontale belyning uit](topic:alignment)
- [Bou en verfyn die oppervlak](topic:build-surface)
- [Kies, kopieer en plak opmetingspunte](topic:copy-paste-points)
- [CivilCraft-instellings](topic:settings)
