---
title: Planlager
summary: De fasta lagernamnen, färgerna och linjetjocklekarna som CivilCraft använder på skärmen, i DXF och i PDF, och vilken visningsinställning som styr varje lager.
keywords: lager, lagernamn, ncs, färger, aci, linjetjocklek, dxf-lager, pdf, visningsinställningar, linjer
from: c2aa8475
---

Allt på planen tillhör ett lager. Namnen följer det vanliga civila lagermönstret (disciplin, huvudgrupp, delgrupp). Lagren är fasta i den här versionen: du kan inte byta namn på dem, ändra deras färger eller lägga till egna. I DXF har varje lager färgnumret som visas; i PDF med {{ui:Lagerfärger}} används samma färger, och med {{ui:Svart}} skrivs allt ut svart.

| Lager | Innehåll | Färg (DXF-nummer) | Visas när |
|---|---|---|---|
| C-TOPO-MINR | Tunna höjdkurvor | Grå (8) | {{ui:Höjdkurvor}} |
| C-TOPO-MAJR | Huvudhöjdkurvor | Vit eller svart (7) | {{ui:Höjdkurvor}} |
| C-TOPO-TEXT | Höjdkurveetiketter | Vit eller svart (7) | {{ui:Höjdkurvor}} och {{ui:Höjdkurveetiketter}} |
| C-TOPO-TINN | Triangelkanter | Grå (8) | {{ui:Trianglar}} |
| C-TOPO-BRKL | Brytlinjer och gränsen | Orange (30) | {{ui:Brytlinjer}} |
| C-TOPO-BNDY | Terrängmodellens kant | Vit eller svart (7) | {{ui:Terrängmodellens kant}} |
| C-TOPO-SLOP | Lutningspilar | Cyan (4) | {{ui:Lutningspilar}} |
| V-NODE | Mätpunkter | Grön (3) | {{ui:Punkter}} |
| V-NODE-TEXT | Punktetiketter: nummer, höjd, beskrivning | Grön (3) | {{ui:Punkter}} och {{ui:Punktetiketter}} |
| V-NODE-LINE | Linjer från linjekoder (grupper som inte är brytlinjer) | Grön (3) | {{ui:Punkter}} |
| C-ROAD-CNTR | Linjeföringens mittlinjer | Röd (1) | Alltid |
| C-ROAD-STAN | Stationsmarkeringar och etiketter, PC och PT | Röd (1) | Alltid |
| C-ROAD-CORR | Korridorkanter | Gul (2) | Alltid |
| C-ROAD-SCTN | Provlinjer (där tvärsektioner tas) | Grå (8) | När linjeföringen har provlinjer |
| C-GRAD-PADS | Byggplattors konturer | Blå (5) | Alltid |
| C-GRAD-DAYL | Släntkrönslinjer | Magenta (6) | Alltid |
| C-GRAD-SLOP | Planeringens släntlinjer | Magenta (6) | Alltid |
| C-GRAD-FEAT | Funktionslinjer (3D) | Grön (3) | Alltid |
| C-ROAD-SWPT | Svepkurvor: kontur, yttersta hjulspår, namn | Orange (30) | Alltid |
| C-STRM-PIPE | Ledningar | Blå (5) | {{ui:Ledningar}} |
| C-STRM-STRC | Brunnar | Blå (5) | {{ui:Ledningar}} |
| C-STRM-TEXT | Lednings- och brunnsetiketter | Blå (5) | {{ui:Ledningar}} |
| C-STRM-PROB | Ledningar och brunnar med problem | Röd (1) | {{ui:Ledningar}} |

Brytlinjer ritas bara när **Terrängmodell** under **Visa** är {{ui:Befintlig mark}}; gränsen ritas med båda ytorna.

## Linjetjocklek i PDF

| Tjocklek | Lager |
|---|---|
| 0.50 mm | Linjeföringens mittlinjer, byggplattor, ledningar, ledningar med problem |
| 0.35 mm | Huvudhöjdkurvor, släntkrönslinjer, brunnar |
| 0.25 mm | Brytlinjer |
| 0.13 mm | Tunna höjdkurvor |
| 0.09 mm | Triangelkanter, planeringens släntlinjer |
| 0.18 mm | Allt annat |

DXF-filer innehåller inga linjetjocklekar; ställ in dem per lager i ditt CAD-program.

## Etikettstorlekar

Etiketterna dimensioneras på papper: höjdkurvetiketter 2.0 mm, stationsetiketter 1.8 mm, PC- och PT-etiketter samt lednings- och brunnsetiketter 1.6 mm, punktetiketter 1.5 mm. Ledningsetiketter anger namn, diameter och lutning; brunnsetiketter anger namn och brunnslock. På skärmen behåller de samma storlek när du zoomar. I DXF skalas de för skalan som anges i exportmeddelandet; se [Exportera planen till DXF](topic:dxf-export).

## Visas inte på något lager

Höjdband ritas under linjerna endast på skärmen. Profilvyn ingår inte i planen.
