---
title: Planlae
summary: Die vaste laagname, kleure en lynddiktes wat CivilCraft op die skerm, in DXF en in PDF gebruik, en watter vertoninginstelling elkeen beheer.
keywords: lae, laagname, ncs, kleure, aci, lynddikte, dxf-lae, pdf, vertoninginstellings, lynwerk
from: c2aa8475
---

Alles op die plan behoort aan 'n laag. Die name volg die algemene siviele laagpatroon (dissipline, hoofgroep, subgroep). Lae is in hierdie weergawe vas: jy kan hulle nie hernoem, hul kleure verander of jou eie byvoeg nie. In DXF het elke laag die kleurnommer wat getoon word; in PDF met {{ui:Laagkleure}} word dieselfde kleure gebruik, en met {{ui:Swart}} druk alles swart.

| Laag | Bevat | Kleur (DXF-nommer) | Word getoon wanneer |
|---|---|---|---|
| C-TOPO-MINR | Ondergeskikte kontoerlyne | Grys (8) | {{ui:Kontoerlyne}} |
| C-TOPO-MAJR | Hoofkontoerlyne | Wit of swart (7) | {{ui:Kontoerlyne}} |
| C-TOPO-TEXT | Kontoerlynetikette | Wit of swart (7) | {{ui:Kontoerlyne}} en {{ui:Kontoerlynetikette}} |
| C-TOPO-TINN | Driehoekrande | Grys (8) | {{ui:Driehoeke}} |
| C-TOPO-BRKL | Breeklyne en die grens | Oranje (30) | {{ui:Breeklyne}} |
| C-TOPO-BNDY | Oppervlakrand | Wit of swart (7) | {{ui:Oppervlakrand}} |
| C-TOPO-SLOP | Helling-pyltjies | Siaan (4) | {{ui:Helling-pyltjies}} |
| V-NODE | Opmetingspunte | Groen (3) | {{ui:Punte}} |
| V-NODE-TEXT | Puntetikette: nommer, hoogtepeil, beskrywing | Groen (3) | {{ui:Punte}} en {{ui:Puntetikette}} |
| V-NODE-LINE | Lyne uit lynkodes (groepe wat nie breeklyne is nie) | Groen (3) | {{ui:Punte}} |
| C-ROAD-CNTR | Middellyne van belyning | Rooi (1) | Altyd |
| C-ROAD-STAN | Stasiemerkers en -etikette, PC en PT | Rooi (1) | Altyd |
| C-ROAD-CORR | Korridorrande | Geel (2) | Altyd |
| C-ROAD-SCTN | Monsterlyne (waar snitte gesny word) | Grys (8) | Wanneer die belyning monsterlyne het |
| C-GRAD-PADS | Padomtrekke | Blou (5) | Altyd |
| C-GRAD-DAYL | Dagligtlyne | Magenta (6) | Altyd |
| C-GRAD-SLOP | Gelykmakinghellinglyne | Magenta (6) | Altyd |
| C-GRAD-FEAT | Kenmerklyne (3D) | Groen (3) | Altyd |
| C-ROAD-SWPT | Swaaipaaie: omtrek, buitenste wielpaaie, naam | Oranje (30) | Altyd |
| C-STRM-PIPE | Pype | Blou (5) | {{ui:Pype}} |
| C-STRM-STRC | Strukture | Blou (5) | {{ui:Pype}} |
| C-STRM-TEXT | Pyp- en struktuuretikette | Blou (5) | {{ui:Pype}} |
| C-STRM-PROB | Pype en strukture met probleme | Rooi (1) | {{ui:Pype}} |

Breeklyne word net geteken terwyl **Oppervlak** onder **Vertoning** {{ui:Bestaande grond}} is; die grens word met enige oppervlak geteken.

## Lynddiktes in PDF

| Dikte | Lae |
|---|---|
| 0.50 mm | Middellyne van belyning, padomtrekke, pype, probleempype |
| 0.35 mm | Hoofkontoerlyne, dagligtlyne, strukture |
| 0.25 mm | Breeklyne |
| 0.13 mm | Ondergeskikte kontoerlyne |
| 0.09 mm | Driehoekrande, gelykmakinghellinglyne |
| 0.18 mm | Al die ander |

DXF-lêers dra geen lynddiktes nie; stel hulle per laag in jou CAD-program.

## Etiketgroottes

Etikette word op papier gegroot: kontoerlynetikette 2.0 mm, stasie-etikette 1.8 mm, PC- en PT-etikette en pyp- en struktuuretikette 1.6 mm, puntetikette 1.5 mm. Pypetikette gee die naam, deursnee en helling; struktuuretikette gee die naam en rand. Op die skerm bly hulle dieselfde grootte wanneer jy zoem. In DXF word hulle geskaal vir die skaal wat in die uitvoerboodskap genoem word; sien [Voer die plan na DXF uit](topic:dxf-export).

## Nie op enige laag gewys nie

Hoogtebande word net op die skerm onder die lynwerk geteken. Die profielaansig is nie deel van die plan nie.
