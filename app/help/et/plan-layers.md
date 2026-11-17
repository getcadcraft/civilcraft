---
title: Plaani kihid
summary: Kindlad kihinimed, värvid ja joonte paksused, mida CivilCraft kasutab ekraanil, DXF-is ja PDF-is, ning millised kuvasätted neid juhivad.
keywords: kihid, kihinimed, ncs, värvid, aci, joonte paksus, dxf-kihid, pdf, kuvasätted, joonistus
from: c2aa8475
---

Kõik plaanil kuulub kihti. Nimed järgivad tavapärast tsiviilkihtide mustrit (eriala, põhirühm, alarühm). Kihid on selles versioonis fikseeritud: neid ei saa ümber nimetada, nende värvi muuta ega lisada oma kihte. DXF-is on igal kihil näidatud värvinumber; PDF-is valikuga {{ui:Layer colors}} kasutatakse samu värve ning valikuga {{ui:Black}} trükitakse kõik mustana.

| Kiht | Sisaldab | Värv (DXF-i number) | Nähtav, kui |
|---|---|---|---|
| C-TOPO-MINR | Väiksemad samakõrgusjooned | Hall (8) | {{ui:Contours}} |
| C-TOPO-MAJR | Põhilised samakõrgusjooned | Valge või must (7) | {{ui:Contours}} |
| C-TOPO-TEXT | Samakõrgusjoonte sildid | Valge või must (7) | {{ui:Contours}} ja {{ui:Contour labels}} |
| C-TOPO-TINN | Kolmnurkade servad | Hall (8) | {{ui:Triangles}} |
| C-TOPO-BRKL | Murdejooned ja piir | Oranž (30) | {{ui:Breaklines}} |
| C-TOPO-BNDY | Pinna serv | Valge või must (7) | {{ui:Surface edge}} |
| C-TOPO-SLOP | Nõlvanooled | Tsüaan (4) | {{ui:Slope arrows}} |
| V-NODE | Mõõdistuspunktid | Roheline (3) | {{ui:Points}} |
| V-NODE-TEXT | Punktisildid: number, kõrgusmärk, kirjeldus | Roheline (3) | {{ui:Points}} ja {{ui:Point labels}} |
| V-NODE-LINE | Joonekoodidest tulevad jooned (rühmad, mis ei ole murdejooned) | Roheline (3) | {{ui:Points}} |
| C-ROAD-CNTR | Trasside telgjooned | Punane (1) | Alati |
| C-ROAD-STAN | Piketimärgid ja sildid, PC ja PT | Punane (1) | Alati |
| C-ROAD-CORR | Koridoride servad | Kollane (2) | Alati |
| C-ROAD-SCTN | Proovijooned (kus lõiked tehakse) | Hall (8) | Kui trassil on proovijooned |
| C-GRAD-PADS | Platvormide piirjooned | Sinine (5) | Alati |
| C-GRAD-DAYL | Nõlvade lõikejooned | Magenta (6) | Alati |
| C-GRAD-SLOP | Vertikaalplaneerimise nõlvajooned | Magenta (6) | Alati |
| C-GRAD-FEAT | Tunnusjooned (3D) | Roheline (3) | Alati |
| C-ROAD-SWPT | Sõidutrajektoorid: kontuur, välimised rattajäljed, nimi | Oranž (30) | Alati |
| C-STRM-PIPE | Torud | Sinine (5) | {{ui:Pipes}} |
| C-STRM-STRC | Rajatised | Sinine (5) | {{ui:Pipes}} |
| C-STRM-TEXT | Toru- ja rajatisesildid | Sinine (5) | {{ui:Pipes}} |
| C-STRM-PROB | Probleemsed torud ja rajatised | Punane (1) | {{ui:Pipes}} |

Murdejooned joonistatakse ainult siis, kui jaotises **Kuva** on **Pind** väärtusega {{ui:Existing ground}}; piir joonistatakse kummagi pinnaga.

## Joonte paksus PDF-is

| Paksus | Kihid |
|---|---|
| 0.50 mm | Trasside telgjooned, platvormid, torud, probleemsed torud |
| 0.35 mm | Põhilised samakõrgusjooned, lõikejooned, rajatised |
| 0.25 mm | Murdejooned |
| 0.13 mm | Väiksemad samakõrgusjooned |
| 0.09 mm | Kolmnurkade servad, vertikaalplaneerimise nõlvajooned |
| 0.18 mm | Kõik muu |

DXF-failid ei sisalda joonte paksusi; määra need kihi kaupa oma CAD-programmis.

## Siltide suurused

Sildid on mõõdetud paberil: samakõrgusjoonte sildid 2.0 mm, piketisildid 1.8 mm, PC- ja PT-sildid ning toru- ja rajatisesildid 1.6 mm, punktisildid 1.5 mm. Torusildid näitavad nime, läbimõõtu ja kallet; rajatisesildid näitavad nime ja pealmist serva. Ekraanil jäävad sildid suumimisel samasuuruseks. DXF-is skaleeritakse need eksporditeates nimetatud mõõtkava järgi; vt [Plaani eksportimine DXF-i](topic:dxf-export).

## Ühelgi kihil ei kuvata

Kõrgusvööndid joonistatakse ekraanil ainult joonise alla. Profiilivaade ei ole plaani osa.
