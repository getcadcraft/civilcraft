---
title: Utbyt LandXML
summary: Öppna LandXML från annan anläggningsprogramvara som ett nytt projekt, exportera punkter, ytor, linjeföringar, profiler och ledningsnätet som LandXML 1.2, och vet vad som inte följer med.
keywords: landxml, xml, import, export, utbyte, tin, yta, linjeföring, profil, ledningsnät, interoperabilitet, datautbyte
from: 870d5ece
---

LandXML är det öppna utbytesformat som de flesta anläggningsprogram läser och skriver. CivilCraft läser och skriver LandXML 1.2. Om du har använt Civil 3D är dess dialogrutor för LandXML-import och -export närmast; här finns inga val att göra, och noterna talar om vad som lämnades ut.

## Öppna en LandXML-fil

1. Klicka på {{ui:Öppna}} (eller tryck {{key:Mod+O}}) och välj filen `.xml` eller `.landxml`, eller släpp den på planen.
2. Om det aktuella projektet har osparade ändringar frågar CivilCraft först. Välj {{ui:Spara en kopia}}, {{ui:Spara inte}} eller {{ui:Avbryt}}.
3. Ett **nytt projekt** skapas. Statusfältet anger vad som lästes, till exempel "Öppnade site.xml: 412 punkter, 2 ytor, 3 linjeföringar."
4. Titta på rutan under uppgifterna för **Terrängmodell**. Den listar allt som hoppades över eller ändrades, till exempel:
   - "Endast den första ytan ("EG") öppnades; filen har 1 till."
   - "Linjeföringen "Ramp A" har element som CivilCraft ännu inte kan rita (inte linjer, bågar eller klotoidspiraler); den hoppades över."
   - "Regler för ledningsnätet fanns inte i filen; platshållarna används — ange dina under Projekt."

Vad som blir vad:

| I filen | I CivilCraft |
|---|---|
| Enheter (Imperial eller Metric) | Projektets **Enheter** (fot eller meter) |
| Projektnamn | Projektets **Namn** |
| CgPoints | Projektets punkter; beskrivningen (eller koden) anger gruppen |
| Den första TIN-ytan | Befintlig mark, används som den är ("Surface (from LandXML)") |
| Varje linjeföring med linjer, bågar och klotoidspiraler | En linjeföring med sina PI, radier och spirallängder byggda om från kurvorna |
| Den första projekteringsprofilen för varje linjeföring | Dess projekteringsprofil, med parabliska vertikalkurvor |
| Det första ledningsnätet | Ledningsnätet, med brunnskanter, sumpar och bottennivåer |
| Funktionslinjer för linjer och bågar | Funktionslinjer, bågar behålls; från annat program startar de som **Endast ritad** |

Den fullständiga listan över element och attribut finns i [LandXML: vad som läses och skrivs](topic:landxml-reference).

:::note
En yta som läses från LandXML byggs inte om när du ändrar punktgrupper eller ritar brytlinjer. Klicka på {{ui:Bygg om terrängmodellen från punkterna}} i avsnittet **Terrängmodell** för att bygga den från punkterna i stället ({{key:Mod+Z}} återställer LandXML-ytan).
:::

## Exportera LandXML

1. Klicka på {{ui:LandXML}} i gruppen **Exportera**.
2. Webbläsaren laddar ner `<name>.xml`. Statusfältet anger vad som ingick, till exempel "Exporterade LandXML 1.2: 276 punkter, 2 ytor, 1 linjeföring, ledningsnätet. Byggplattor ingår inte i LandXML här; den planerade ytan gör det."

Filen innehåller:

- **Enheter**: US survey feet eller meter.
- **CgPoints**: varje punkt med sitt nummer som namn, sin beskrivning och sin grupp som code.
- **Ytor**: befintlig mark som TIN, med sina brytlinjer och yttre avgränsning som källdata; och, när byggplattor eller korridorer planeras, en andra TIN-yta med namnet "Proposed".
- **Linjeföringar**: linjer, bågar och klotoidspiraler med sina stationer, var och en med en profil som innehåller den befintliga marken samplad längs den och projekteringsprofilen (PVI och parabliska kurvor) när den har minst två PVI.
- **PipeNetworks**: brunnar med sina kanter, sumpar och bottennivå per ledning, och ledningarna med diameter, längd och lutning.
- **PlanFeatures**: varje funktionslinje som linjer och bågar med höjden i varje ände, och vad den används till.

## Vad som inte följer med

- Byggplattor och korridorer som objekt. Resultatet finns i ytan "Proposed".
- Linjeföringar med fel (till exempel överlappande kurvor): utelämnas och räknas i statusmeddelandet.
- Ledningar utan båda bottennivåerna, och nätverk med färre än två brunnar.
- En brunnskant som tas från ytan skrivs som en fast kant. Öppnas den igen behåller brunnen det talet även om ytan ändras.
- Nätverksregler (minsta lutning, täckning, fall): LandXML har ingen plats för dem.
- Visningsinställningar och punktgruppernas ytval: spara ett CivilCraft-projekt för dem.

Vid öppning läser CivilCraft inte spiraler som inte är klotoid, gridytor, punkter som bara hänvisar till andra punkter, fastigheter, spiraler i funktionslinjer, vägar eller mätdata. Varje sådant anges i noterna, aldrig gissat.

## Tur och retur

För att lämna över arbete till någon som använder annan anläggningsprogramvara och få tillbaka det, exportera LandXML, låt dem redigera och öppna deras LandXML som ett nytt projekt. Spara även din egen `.civilcraft.json`: det är den enda fil som behåller allt CivilCraft känner till.
