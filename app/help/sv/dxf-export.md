---
title: Exportera planen till DXF
summary: Skriv planens linjer som en R12-DXF på namngivna lager, med höjdkurvor på sina höjder och brytlinjer i 3D, för vilket CAD-program som helst.
keywords: dxf, dwg, cad, export, linjer, r12, 2000, 2004, 2007, 2010, 2013, 2018, lager, höjdkurvor, utbytesformat för ritningar, basekarta, bakgrund
from: f2d8ede9
---

{{ui:DXF}} skriver det planen visar som en DXF-fil i R12-formatet, den version som alla CAD-program öppnar. Om du har använt AutoCAD eller Civil 3D öppnar eller infogar du den som vilken DXF-fil som helst.

## Exportera

1. Ställ in planen som du vill ha ritningen: under **Visning** väljer du terrängmodell (befintlig eller föreslagen), höjdkurvsintervall och vilka delar som är påslagna (höjdkurvor, etiketter, punkter, punktetiketter, trianglar, brytlinjer, terrängmodellens kant, ledningar, lutningspilar).
2. Klicka på {{ui:DWG/DXF}} i gruppen **Exportera** och välj {{ui:DXF (R12, text) — den enkla utbytesfilen}}, och klicka sedan på {{ui:Ladda ner}}.
3. Webbläsaren laddar ner `<name>.dxf`. Statusfältet visar till exempel ”Exporterade R12 DXF: 2,140 objekt; etiketter dimensionerade för 1” = 40'. Höjdband exporteras inte.”

Koordinaterna skrivs i projektets enheter, med sina verkliga värden (state plane-koordinater behålls som de är). Inget skalas eller flyttas.

## Vad som finns i filen

| Innehåll | DXF-entitet | Lager |
|---|---|---|
| Tunna och tjocka höjdkurvor | 2D-polylinjer på sin höjd | C-TOPO-MINR, C-TOPO-MAJR |
| Höjdkurvsetiketter | Text | C-TOPO-TEXT |
| Trianglar | Polylinjer | C-TOPO-TINN |
| Brytlinjer och gräns | 3D-polylinjer | C-TOPO-BRKL |
| Terrängmodellens kant | Polylinjer | C-TOPO-BNDY |
| Lutningspilar | Polylinjer | C-TOPO-SLOP |
| Inmätningspunkter och deras etiketter | Punkter (med höjd), text | V-NODE, V-NODE-TEXT |
| Linjer från linjekoder | 3D-polylinjer | V-NODE-LINE |
| Linjeföringens mittlinjer | Linjer och bågar | C-ROAD-CNTR |
| Stationeringsmarkeringar och etiketter | Polylinjer, text | C-ROAD-STAN |
| Korridorkanter | Polylinjer | C-ROAD-CORR |
| Provlinjer | Polylinjer | C-ROAD-SCTN |
| Byggplattor, släntkrönslinjer, släntlinjer | Polylinjer | C-GRAD-PADS, C-GRAD-DAYL, C-GRAD-SLOP |
| Funktionslinjer | 3D-polylinjer (bågar som delar inom 0.01; se [Funktionslinjer](topic:feature-lines)) | C-GRAD-FEAT |
| Svepbanor | Polylinjer, text | C-ROAD-SWPT |
| Ledningar, konstruktioner, etiketter | Polylinjer, text | C-STRM-PIPE, C-STRM-STRC, C-STRM-TEXT |
| Ledningar och konstruktioner med problem | Polylinjer | C-STRM-PROB |

Varje lager har en färg. Hela listan finns i [Planlager](topic:plan-layers).

## Textstorlek

Text måste ha en storlek i ritningens enheter. CivilCraft dimensionerar etiketter för den skala där hela planen ryms på ett Tabloid-blad (fot) eller ett A3-blad (meter), och anger vilken skala i statusmeddelandet. Om du plottar i en annan skala i ditt CAD-program skalar du texten där.

## Vad som inte exporteras

- Höjdband (endast på skärmen).
- Längdprofilvyn. Profiler exporteras som LandXML, inte som ritning.
- Själva terrängmodellen som 3D-objekt. Använd LandXML för TIN:en, eller slå på {{ui:Trianglar}} för att få dess kanter som linjer.
- Allt du har stängt av under **Visning**.

## DWG

{{ui:DWG/DXF}} skriver samma linjer som en DWG-ritning också. Dialogrutan frågar efter formatet: DXF, eller en DWG från 2000, 2004, 2007, 2010, 2013 eller 2018. 2000 öppnas i nästan alla CAD-program, gamla och nya; välj ett nyare när mottagaren av ritningen begär det. Ditt val kommer ihåg i den här webbläsaren.

1. Klicka på {{ui:DWG}} i gruppen **Exportera**.
2. Välj **Format** och klicka på **Ladda ner DWG**.
3. Webbläsaren laddar ner `<name>.dwg`. Statusfältet anger vad som togs med, till exempel ”Exporterade DWG (2018-format): 12 polylinjer, 40 etiketter på 9 lager”.

DWG-filen har samma lager, färger, höjdkurvor (som polylinjer på sin höjd), 3D-brytlinjer, etiketter och punkter som DXF-filen, i samma koordinater. Lagernamn som en DWG-fil inte kan innehålla ändras, och statusmeddelandet säger till om det. CivilCraft skriver DWG med sin egen kod, så inget lämnar din dator.

### Kartlager i DWG

En DWG-fil kan inte innehålla en bild inuti sig: CAD-program visar en bild som ligger bredvid ritningen. När kartlager visas erbjuder dialogrutan **Kartlager som en bild bredvid ritningen**. Med den ikryssad blir hämtningen en `.zip` som innehåller `<name>.dwg`, `<name>-map.png` (kartlagren över hela ritningen, upp till 4,096 pixlar över) och `<name>-map.pgw` (dess världsfil, för GIS-program). Ritningen visar bilden som en bild på lager G-MAP-IMAG, på rätt plats. Packa upp filerna i en mapp och håll ihop dem.
