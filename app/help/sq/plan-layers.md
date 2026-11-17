---
title: Shtresat e planit
summary: Emrat, ngjyrat dhe trashësitë e vijave fikse të shtresave që CivilCraft përdor në ekran, në DXF dhe në PDF, dhe cili cilësim shfaqjeje e kontrollon secilën.
keywords: shtresa, emrat e shtresave, ncs, ngjyra, aci, trashësia e vijave, shtresa dxf, pdf, cilësimet e shfaqjes, vija
from: c2aa8475
---

Çdo gjë në planimetri i përket një shtrese. Emrat ndjekin modelin e zakonshëm civil të shtresave (disiplina, grupi kryesor, nëngrupi). Shtresat janë fikse në këtë version: nuk mund t'i riemërtoni, të ndryshoni ngjyrat e tyre ose të shtoni të tuajat. Në DXF, çdo shtresë ka numrin e ngjyrës së treguar; në PDF me {{ui:Ngjyra e shtresave}}, përdoren të njëjtat ngjyra, dhe me {{ui:E zezë}} gjithçka printohet e zezë.

| Shtresa | Përmban | Ngjyra (numri DXF) | Shfaqet kur |
|---|---|---|---|
| C-TOPO-MINR | Izoipsë të vogla | Gri (8) | {{ui:Izoipsët}} |
| C-TOPO-MAJR | Izoipsë kryesore | E bardhë ose e zezë (7) | {{ui:Izoipsët}} |
| C-TOPO-TEXT | Etiketat e izoipsave | E bardhë ose e zezë (7) | {{ui:Izoipsët}} dhe {{ui:Etiketat e izoipsave}} |
| C-TOPO-TINN | Brinjët e trekëndëshave | Gri (8) | {{ui:Trekëndësha}} |
| C-TOPO-BRKL | Vijat e thyerjes dhe kufiri | Portokalli (30) | {{ui:Vijat e thyerjes}} |
| C-TOPO-BNDY | Kufiri i sipërfaqes | E bardhë ose e zezë (7) | {{ui:Kufiri i sipërfaqes}} |
| C-TOPO-SLOP | Shigjetat e pjerrësisë | Cian (4) | {{ui:Shigjetat e pjerrësisë}} |
| V-NODE | Pikat e rilevimit | E gjelbër (3) | {{ui:Pikat}} |
| V-NODE-TEXT | Etiketat e pikave: numri, kota, përshkrimi | E gjelbër (3) | {{ui:Pikat}} dhe {{ui:Etiketat e pikave}} |
| V-NODE-LINE | Vija nga kodet e vijave (grupe që nuk janë vija thyerjeje) | E gjelbër (3) | {{ui:Pikat}} |
| C-ROAD-CNTR | Qendrat e aksit rrugor | E kuqe (1) | Gjithmonë |
| C-ROAD-STAN | Shenjat e stacioneve dhe etiketat, PC dhe PT | E kuqe (1) | Gjithmonë |
| C-ROAD-CORR | Kufijtë e korridorit | E verdhë (2) | Gjithmonë |
| C-ROAD-SCTN | Vijat e mostrave (ku priten prerjet) | Gri (8) | Kur aksi ka vija mostrash |
| C-GRAD-PADS | Konturet e platformave | Blu (5) | Gjithmonë |
| C-GRAD-DAYL | Vijat e prerjes me terrenin | Magjentë (6) | Gjithmonë |
| C-GRAD-SLOP | Vijat e pjerrësisë së nivelimit | Magjentë (6) | Gjithmonë |
| C-GRAD-FEAT | Vijat karakteristike (3D) | E gjelbër (3) | Gjithmonë |
| C-ROAD-SWPT | Shtigjet e lëvizjes: kontura, shtigjet më të jashtme të rrotave, emri | Portokalli (30) | Gjithmonë |
| C-STRM-PIPE | Tubat | Blu (5) | {{ui:Tubat}} |
| C-STRM-STRC | Strukturat | Blu (5) | {{ui:Tubat}} |
| C-STRM-TEXT | Etiketat e tubave dhe strukturave | Blu (5) | {{ui:Tubat}} |
| C-STRM-PROB | Tubat dhe strukturat me probleme | E kuqe (1) | {{ui:Tubat}} |

Vijat e thyerjes vizatohen vetëm kur **Sipërfaqja** te **Shfaqja** është {{ui:Terreni ekzistues}}; kufiri vizatohet me çdo sipërfaqe.

## Trashësitë e vijave në PDF

| Trashësia | Shtresat |
|---|---|
| 0.50 mm | Qendrat e aksit rrugor, platformat, tubat, tubat me probleme |
| 0.35 mm | Izoipsët kryesore, vijat e prerjes me terrenin, strukturat |
| 0.25 mm | Vijat e thyerjes |
| 0.13 mm | Izoipsët e vogla |
| 0.09 mm | Brinjët e trekëndëshave, vijat e pjerrësisë së nivelimit |
| 0.18 mm | Të tjerat |

Skedarët DXF nuk mbajnë trashësi vijash; vendoseni sipas shtresës në programin tuaj CAD.

## Madhësitë e etiketave

Etiketat përcaktohen sipas madhësisë në letër: etiketat e izoipsave 2.0 mm, etiketat e stacioneve 1.8 mm, etiketat PC dhe PT, si dhe ato të tubave e strukturave 1.6 mm, etiketat e pikave 1.5 mm. Etiketat e tubave japin emrin, diametrin dhe pjerrësinë; etiketat e strukturave japin emrin dhe buzën. Në ekran mbeten të njëjtën madhësi kur zmadhoni. Në DXF, ato zmadhohen për shkallën e emërtuar në mesazhin e eksportit; shih [Eksporto planimetrinë në DXF](topic:dxf-export).

## Nuk shfaqet në asnjë shtresë

Brezat e kotës vizatohen nën vijat, vetëm në ekran. Pamja e profilit nuk është pjesë e planimetrisë.
