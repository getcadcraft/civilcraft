---
title: Planlag
summary: De faste lagnavne, farver og linjetykkelser som CivilCraft bruger på skærmen, i DXF og i PDF, og hvilken visningsindstilling der styrer hvert enkelt lag.
keywords: lag, lagnavne, ncs, farver, aci, linjetykkelser, dxf-lag, pdf, visningsindstillinger, linjeværk
from: c2aa8475
---

Alt på planen hører til et lag. Navnene følger det almindelige civile lagmønster (fag, hovedgruppe, undergruppe). Lagene er faste i denne version: du kan ikke omdøbe dem, ændre deres farver eller tilføje egne. I DXF har hvert lag det farvenummer, der vises; i PDF med {{ui:Lagfarver}} bruges de samme farver, og med {{ui:Sort}} udskrives alt sort.

| Lag | Indeholder | Farve (DXF-nummer) | Vises når |
|---|---|---|---|
| C-TOPO-MINR | Mindre højdekurver | Grå (8) | {{ui:Højdekurver}} |
| C-TOPO-MAJR | Hovedhøjdekurver | Hvid eller sort (7) | {{ui:Højdekurver}} |
| C-TOPO-TEXT | Højdekurveetiketter | Hvid eller sort (7) | {{ui:Højdekurver}} og {{ui:Kurveetiketter}} |
| C-TOPO-TINN | Trekantkanter | Grå (8) | {{ui:Trekanter}} |
| C-TOPO-BRKL | Brudlinjer og afgrænsningen | Orange (30) | {{ui:Brudlinjer}} |
| C-TOPO-BNDY | Overfladekant | Hvid eller sort (7) | {{ui:Overfladekant}} |
| C-TOPO-SLOP | Faldpile | Cyan (4) | {{ui:Faldpile}} |
| V-NODE | Opmålingspunkter | Grøn (3) | {{ui:Punkter}} |
| V-NODE-TEXT | Punktetiketter: nummer, kote, beskrivelse | Grøn (3) | {{ui:Punkter}} og {{ui:Punktetiketter}} |
| V-NODE-LINE | Linjer fra linjekoder (grupper, der ikke er brudlinjer) | Grøn (3) | {{ui:Punkter}} |
| C-ROAD-CNTR | Tracéets midterlinjer | Rød (1) | Altid |
| C-ROAD-STAN | Stationsmærker og etiketter, PC og PT | Rød (1) | Altid |
| C-ROAD-CORR | Korridorkanter | Gul (2) | Altid |
| C-ROAD-SCTN | Snitlinjer (hvor snit tages) | Grå (8) | Når tracéet har snitlinjer |
| C-GRAD-PADS | Byggeplateauers konturer | Blå (5) | Altid |
| C-GRAD-DAYL | Skæringslinjer i terræn | Magenta (6) | Altid |
| C-GRAD-SLOP | Skråningslinjer i planering | Magenta (6) | Altid |
| C-GRAD-FEAT | Feature-linjer (3D) | Grøn (3) | Altid |
| C-ROAD-SWPT | Svepekurver: kontur, yderste hjulspor, navn | Orange (30) | Altid |
| C-STRM-PIPE | Rør | Blå (5) | {{ui:Rør}} |
| C-STRM-STRC | Konstruktioner | Blå (5) | {{ui:Rør}} |
| C-STRM-TEXT | Rør- og konstruktionsetiketter | Blå (5) | {{ui:Rør}} |
| C-STRM-PROB | Rør og konstruktioner med problemer | Rød (1) | {{ui:Rør}} |

Brudlinjer tegnes kun, mens **Overflade** under **Visning** er {{ui:Eksisterende terræn}}; afgrænsningen tegnes med begge overflader.

## Linjetykkelser i PDF

| Tykkelse | Lag |
|---|---|
| 0.50 mm | Tracéets midterlinjer, byggeplateauer, rør, problemrør |
| 0.35 mm | Hovedhøjdekurver, skæringslinjer, konstruktioner |
| 0.25 mm | Brudlinjer |
| 0.13 mm | Mindre højdekurver |
| 0.09 mm | Trekantkanter, skråningslinjer i planering |
| 0.18 mm | Alt andet |

DXF-filer indeholder ingen linjetykkelser; angiv dem pr. lag i dit CAD-program.

## Etiketstørrelser

Etiketter har en størrelse på papiret: højdekurveetiketter 2.0 mm, stationsetiketter 1.8 mm, PC- og PT-etiketter samt rør- og konstruktionsetiketter 1.6 mm, punktetiketter 1.5 mm. Rørtetiketter viser navn, diameter og fald; konstruktionsetiketter viser navn og kant. På skærmen forbliver de lige store, når du zoomer. I DXF skaleres de til den målestok, der er angivet i eksportmeddelelsen; se [Eksportér planen til DXF](topic:dxf-export).

## Vises ikke på noget lag

Kotebånd tegnes kun på skærmen, under linjeværket. Længdeprofilvisningen er ikke en del af planen.
