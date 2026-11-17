---
title: Plan-lagen
summary: De vaste laagnamen, kleuren en lijndiktes die CivilCraft op het scherm, in DXF en in PDF gebruikt, en welke weergave-instelling elk regelt.
keywords: lagen, laagnamen, ncs, kleuren, aci, lijndiktes, dxf-lagen, pdf, weergave-instellingen, lijnwerk
from: c2aa8475
---

Alles op het plan hoort bij een laag. De namen volgen het gebruikelijke civiele laagpatroon (discipline, hoofdgroep, subgroep). De lagen zijn in deze build vast: u kunt ze niet hernoemen, hun kleuren niet wijzigen en geen eigen lagen toevoegen. In DXF heeft elke laag het getoonde kleurnummer; in PDF worden met {{ui:Layer colors}} dezelfde kleuren gebruikt, en met {{ui:Black}} wordt alles zwart afgedrukt.

| Laag | Bevat | Kleur (DXF-nummer) | Getoond wanneer |
|---|---|---|---|
| C-TOPO-MINR | Tussenhoogtelijnen | Grijs (8) | {{ui:Contours}} |
| C-TOPO-MAJR | Hoofdhoogtelijnen | Wit of zwart (7) | {{ui:Contours}} |
| C-TOPO-TEXT | Labels van hoogtelijnen | Wit of zwart (7) | {{ui:Contours}} en {{ui:Contour labels}} |
| C-TOPO-TINN | Randen van driehoeken | Grijs (8) | {{ui:Triangles}} |
| C-TOPO-BRKL | Breeklijnen en de begrenzing | Oranje (30) | {{ui:Breaklines}} |
| C-TOPO-BNDY | Rand van het oppervlak | Wit of zwart (7) | {{ui:Surface edge}} |
| C-TOPO-SLOP | Helling-pijlen | Cyaan (4) | {{ui:Slope arrows}} |
| V-NODE | Meetpunten | Groen (3) | {{ui:Points}} |
| V-NODE-TEXT | Puntlabels: nummer, hoogte, beschrijving | Groen (3) | {{ui:Points}} en {{ui:Point labels}} |
| V-NODE-LINE | Lijnen uit lijncodes (groepen die geen breeklijnen zijn) | Groen (3) | {{ui:Points}} |
| C-ROAD-CNTR | Tracé-assen | Rood (1) | Altijd |
| C-ROAD-STAN | Stationsstrepen en labels, PC en PT | Rood (1) | Altijd |
| C-ROAD-CORR | Randen van corridors | Geel (2) | Altijd |
| C-ROAD-SCTN | Dwarsprofiellijnen (waar de doorsneden worden gesneden) | Grijs (8) | Wanneer het tracé dwarsprofiellijnen heeft |
| C-GRAD-PADS | Contouren van plateaus | Blauw (5) | Altijd |
| C-GRAD-DAYL | Ontgravingslijnen | Magenta (6) | Altijd |
| C-GRAD-SLOP | Hellingslijnen van grading | Magenta (6) | Altijd |
| C-GRAD-FEAT | Elementlijnen (3D) | Groen (3) | Altijd |
| C-ROAD-SWPT | Zwaaipaden: omtrek, buitenste wielsporen, naam | Oranje (30) | Altijd |
| C-STRM-PIPE | Leidingen | Blauw (5) | {{ui:Pipes}} |
| C-STRM-STRC | Kunstwerken | Blauw (5) | {{ui:Pipes}} |
| C-STRM-TEXT | Labels van leidingen en kunstwerken | Blauw (5) | {{ui:Pipes}} |
| C-STRM-PROB | Leidingen en kunstwerken met problemen | Rood (1) | {{ui:Pipes}} |

Breeklijnen worden alleen getekend terwijl **Oppervlak** onder **Weergave** op {{ui:Existing ground}} staat; de begrenzing wordt bij beide oppervlakken getekend.

## Lijndiktes in PDF

| Dikte | Lagen |
|---|---|
| 0.50 mm | Tracé-assen, plateaus, leidingen, leidingen met problemen |
| 0.35 mm | Hoofdhoogtelijnen, ontgravingslijnen, kunstwerken |
| 0.25 mm | Breeklijnen |
| 0.13 mm | Tussenhoogtelijnen |
| 0.09 mm | Randen van driehoeken, hellingslijnen van grading |
| 0.18 mm | Al het overige |

DXF-bestanden bevatten geen lijndiktes; stel die per laag in uw CAD-programma in.

## Labelgroottes

Labels zijn op papier bemaat: hoogtelijnlabels 2.0 mm, stationslabels 1.8 mm, PC- en PT-labels en leiding- en kunstwerklabels 1.6 mm, puntlabels 1.5 mm. Leidinglabels geven de naam, diameter en helling; kunstwerklabels geven de naam en de bovenrand. Op het scherm blijven ze even groot wanneer u zoomt. In DXF worden ze geschaald voor de schaal die in het exportbericht staat; zie [Het plan exporteren naar DXF](topic:dxf-export).

## Niet op een laag getoond

Hoogtebanden worden alleen op het scherm getekend, onder het lijnwerk. De profielweergave maakt geen deel uit van het plan.
