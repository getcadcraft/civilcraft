---
title: Öppna en DWG eller DXF som linjer
summary: Öppna en ritnings linjer på planen, lager för lager, använd dess höjdkurvor, 3D-polylinjer och slutna konturer för terrängmodellen, och gör dess punktblock till mätpunkter.
keywords: mätningskontroll, texthöjder, dwg, dxf, cad, ritning, linjer, höjdkurvor, brytlinjer, avgränsning, polylinje, 3D-polylinje, lager, bakgrundskarta, topo, mätningsritning, block, blockreferenser, mätpunkter från block, attribut, punktblock, infogningspunkt
from: da0f4c58
---

En topografisk mätning kommer ofta som en ritning: höjdkurvor som polylinjer på deras höjd, brytlinjer som 3D-polylinjer och områdets gräns som en sluten polylinje. CivilCraft öppnar ritningens **modellrum** som lager på planen och kan göra dessa linjer direkt till terrängmodellen.

## Öppna ritningen

1. Klicka på {{ui:Linjer}} i gruppen **Terrängmodell** (eller på {{ui:Öppna}}, eller släpp filen på planen) och välj en `.dwg`- eller `.dxf`-fil. Ritningen läses på den här datorn; ingenting laddas upp. DWG från 2000 till 2018 och ASCII-DXF läses.
2. Dialogrutan **Linjer** listar ritningens lager som innehåller linjer, slutna former eller punkter, och om de har **höjder**. Lager som är av i ritningen börjar avmarkerade. Text, skraffering, mått och andra objekt som inte är linjer räknas och utelämnas (dialogrutan säger vilka).
3. Kontrollera **Ritningens enheter**. När ritningen anger sina enheter omvandlar CivilCraft dem till projektets (millimeter till meter, meter till fot, tum till fot). En ritning i fot läses som amerikanska mätfot utan skalning: de två skiljer sig med 2 miljondelar, och att skala state plane-koordinater med det skulle flytta dem flera fot. Anger ritningen inte sina enheter läses dess tal i projektets enheter; välj rätt enheter i listan om de inte stämmer.
4. Under **Använd för terrängmodellen** väljer du vad varje lager ger terrängmodellen (eller lämnar **Visa bara**). Lager med namn som höjdkurvor (TOPO, CONT, CNTR) som har höjder börjar som brytlinjer.
5. Klicka på {{ui:Lägg till}}. Lagren visas under **GIS-lager** i vänster panel; varje användning läggs in i terrängmodellen. Varje del är ett eget steg: {{key:Mod+Z}} tar tillbaka dem ett i taget.

## Vad varje lagertyp kan ge

| Lagret innehåller | Använd för terrängmodellen |
|---|---|
| Höjdkurvor (polylinjer på en höjd) | Brytlinjer på linjernas egen höjd, eller på fältet ELEV |
| 3D-polylinjer | Brytlinjer på deras egna höjder |
| En sluten kontur | Terrängmodellens avgränsning (den största slutna formen, eller den du valt) |
| Punkter med en höjd | Mätpunkter, beskrivna med lagrets namn |
| Linjer på höjd 0 (planlinjer) | Ingenting: de finns kvar på planen som bakgrundsritning |

En ritning som CivilCraft skrivit innehåller sina funktionslinjer som 3D-polylinjer som minns sina bågar. Dialogrutan visar då **Funktionslinjer**: lämna den ikryssad för att föra tillbaka dem som funktionslinjer med deras bågar och användningar (ett ångra-steg), eller avmarkera den för att läsa dem som linjer, precis som alla andra lager.

Senare kan du använda {{ui:Använd för terrängmodellen}} i lagrets meny under **GIS-lager** för att göra detsamma med ett lager du bara visat.

## Mätpunkter från block

Mätningsritningar bär ofta sina punkter som block: en liten symbol vid varje mätning, med attribut för punktnumret, beskrivningen och höjden. Har ritningen blockreferenser visar dialogrutan avsnittet **Mätpunkter från block**:

1. Markera de block som ska tas med (tabellen visar hur många referenser varje har, på vilka lager och vilka attribut), eller markera lager för att ta med varje blockreferens på dem.
2. Välj varifrån varje punkts **nummer**, **beskrivning** och **höjd** kommer: ett attribut, blockets eller lagrets namn, nästa lediga nummer, eller infogningspunktens Z. CivilCraft börjar med de troliga attributen (PT, DESC, ELEV och liknande) och tar höjden från ett attribut endast när blocken står på noll.
3. Avmarkera linjelagren om du bara vill ha punkterna, och klicka sedan på {{ui:Lägg till}}.

Varje referens blir en mätpunkt vid sin infogningspunkt. Endast referenser placerade i modellrummet räknas; block som ligger inbäddade i andra block gör det inte. Nummer som redan finns i projektet, eller som används två gånger i ritningen, får nya nummer efter det högsta, och ett höjdattribut som inte är ett tal lämnar den punkten utan höjd; statusraden räknar båda. Ritningen ändras aldrig, och varje punkt minns sitt block: dess Egenskaper visar **Från block** med blocket, lagret och dess handle. Att lägga till punkterna är ett steg, så {{key:Mod+Z}} tar bort alla.

## Höjder skrivna som text, och kontrollen

Punkthöjder som är skrivna som text (eller i ett blockattribut som inte är ett mätpunktsblock) är inte linjer. Avsnittet **Mätnivåer och kontroll** kan ta dem som mätpunkter, och listar vad som verkar fel i ritningen: enheter, koordinatsystem, avstånd från noll, platta höjdkurvor, udda höjder, dubbla punkter. Se [Kontrollera en mätningsritning vid import](topic:survey-check).

## Så läses ritningen

- Bågar, cirklar, ellipser, välvda polylinjesegment och splines blir korta räta delar (högst var 5°).
- Blockreferenser ritas där de placerats, även inbäddade block; det som ett block har på lager 0 får referensens lager.
- Objekt som ritats i ett annat plan (en annan extrusionsriktning) placeras i världskoordinater.
- Varje objekt får tre fält: LAYER, TYPE (objekttypen) och ELEV (dess höjd när alla dess punkter delar en höjd).
- Koordinaterna tas som de är: ritningen måste använda samma koordinater som projektet (till exempel samma state plane-zon). Länkade ritningar (externreferenser) öppnas inte: öppna dem var för sig.

:::tip
En höjdkurvsritning ger den bästa terrängmodellen med några punkthöjder på kullar och i sänkor, där höjdkurvorna ensamma lämnar platta trianglar. Lägg till dem som mätpunkter, eller från ett punktlager i ritningen.
:::
