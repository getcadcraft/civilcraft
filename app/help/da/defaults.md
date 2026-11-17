---
title: Startværdier og pladsholdere
summary: Alle værdier, CivilCraft starter med, til nye projekter, visning, tracéer, byggeplateauer, korridorer, rørnetværk, mængder og plot, og hvilke der er pladsholdere, du skal erstatte.
keywords: standardindstillinger, indstillinger, startværdier, pladsholdere, designkriterier, standarder, regler, antagelser
from: fbfc7432
---

CivilCraft har ingen indstillingsdialog og ingen skabelon. Dette er de værdier, ting starter med. Værdier markeret **pladsholder** er ikke hentet fra en standard: erstat dem med dine projekters kriterier, før du stoler på et tjek eller en mængde.

## Nyt projekt

| Indstilling | Værdi |
|---|---|
| Navn | Unavngivet område (den første punktfils navn erstatter det) |
| Enheder | US feet |
| Overfladenavn | {{ui:Eksisterende terræn}} |
| Punktgrupper | Hver gruppe starter som {{ui:Punkter}} |
| Længste ydre kant | 0 (behold hver trekant) |
| Fortrydelsestrin, der gemmes | 200 |

## Visning

| Indstilling | Værdi |
|---|---|
| Overflade | {{ui:Eksisterende terræn}} |
| Højdekurver hver | 1 (ft eller m) |
| Hovedkurve hver | 5. højdekurve |
| Bånd | 8 |
| Til | Højdekurver, {{ui:Kurveetiketter}}, punkter, brudlinjer, overfladekant, rør |
| Fra | Trekanter, kotebånd, faldpile, punktetiketter |

## Tracéer og profiler

| Indstilling | Værdi |
|---|---|
| Navn | Tracé 1, Tracé 2 … |
| Startstation | 0+00 |
| Kurveradius ved hvert indre PI | 100 ft eller 30 m, mindre hvis den ikke passer i halvdelen af hver tangent |
| Designprofil | Ingen, til du starter et; {{ui:Start fra terrænet}} sætter en PVI på terrænet i hver ende |
| Længde af lodret kurve | 0 (ingen kurve), til du skriver en |

## Byggeplateauer

| Indstilling | Værdi |
|---|---|
| Navn | Byggeplateau 1, Byggeplateau 2 … |
| Kote | Terrænet i byggeplateauets midte, afrundet til 0.1 (0, hvis midten ligger uden for overfladen) |
| Skærehældning | 2 : 1 (pladsholder) |
| Fyldningshældning | 3 : 1 (pladsholder) |

## Korridorsamling (pladsholdere)

| Indstilling | US feet | Meter |
|---|---|---|
| Kørebanebredde | 12 ft | 3.6 m |
| Kørebanehældning | 2 % | 2 % |
| Skulderbredde | 4 ft | 1.2 m |
| Skulderhældning | 4 % | 4 % |
| Skærehældning | 2 : 1 | 2 : 1 |
| Fyldningshældning | 3 : 1 | 3 : 1 |
| Snit hver | 10 ft | 5 m |

## Rørnetværk

| Indstilling | US feet | Meter |
|---|---|---|
| Navn og type | Regnvand, regnvand | Regnvand, regnvand |
| Mindste fald (pladsholder) | 0.50 % | 0.50 % |
| Mindste overdækning (pladsholder) | 2 ft | 0.6 m |
| Fald i brøndene (pladsholder) | 0.10 ft | 0.03 m |
| Ny brøndsdiameter | 48 in | 1200 mm |
| Nyt rørs diameter | 12 in | 300 mm |
| Sumpdybde | 0 | 0 |
| Kant | Fra overfladen | Fra overfladen |

Et rørnetværk, der åbnes fra LandXML, bruger også disse regler, fordi LandXML ikke bærer dem.

## Volumener

| Indstilling | Værdi |
|---|---|
| Metode | Gitter, målt i cellernes midtpunkter inden for skærelinjerne |
| Cellestørrelse | Valgt, så det omskrevne rektangel for det planerede areal rummer ca. 250,000 celler (1, 2 eller 5 gange en potens af ti) |
| Udvidelse og sammentrækning | Ingen |

## Plot

| Indstilling | Værdi |
|---|---|
| Område | {{ui:Alt}} |
| Papir | Tabloid 11 × 17 in (fodprojekter), ISO A3 (meterprojekter); altid liggende |
| Målestok | Den største angivne målestok, der passer |
| Blæk | {{ui:Lagfarver}} |

DXF-etiketter er dimensioneret til den målestok, hvor alt passer på Tabloid (fod) eller A3 (meter).
