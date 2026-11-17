---
title: Beplantningsplaner og lister
summary: Plasser enkeltplanter, plantebed fylt etter plantenes avstand med blandede planter etter prosent, og hekker. Merk dem, og tell dem i en planteliste for et regneark eller TakeoffCraft.
keywords: beplantningsplan, planteliste, plantebed, massebeplantning, hekk, tre, busk, dekkevekst, avstand, trekantet avstand, plantetall, mengder, etiketter, kronedekke, plantesymboler, ifc, mengdeuttak
from: ab49eab5
---

## Plasser planter

1. Velg en plante i **Planter** til venstre.
2. Klikk {{ui:Plante}}, og klikk deretter i planen: hvert klikk plasserer én plante. Trykk {{key:Esc}} for å avslutte.

Symbolet til en plante tegnes med utbredelsen ved modenhet; Mer › {{ui:Vis i plantestørrelse}} tegner hver plante i størrelsen den plantes i. Trær står på bakken under seg: når terrenget senere formes, følger de med. For å feste en plante i en kote i stedet, skriv den inn i **Kotehøyde** under Egenskaper.

## Plantebed

1. Velg hovedplanten, klikk {{ui:Bed}} og klikk hjørnene av bedet. Trykk {{key:Enter}} (eller klikk første hjørne igjen) for å lukke det.
2. Bedet fylles med den planten i sin avstand, i et **trekantet** mønster (det vanlige: hver plante har samme avstand til seks andre), en halv avstand inn fra kanten.
3. Under Egenskaper blander **Legg til en plante** inn planten som er valgt til venstre. Sett hver plantes **Andel %**: bedet tar nøyaktig så mange av hver, spredt utover. **Bland på nytt** flytter rundt hvor de havner.

Hvis **Avstand** er tom, brukes plantenes egen avstand (vektet etter andelene); skriv inn en for å bruke den for alle planter. **Mønster** kan være kvadratisk, og **Rader ved** snur radene.

## Hekker

Velg hekkeplanten, klikk {{ui:Hekk}}, klikk langs hekken og trykk {{key:Enter}}. Plantene settes langs linjen med sin avstand, sentrert slik at begge ender har samme margin. En hekk kan være **to rader, forskjøvet**, med en fast avstand mellom.

## Etiketter

Enkeltplanter merkes med etikettinnstillingen (`{name}` som standard); skriv inn en egen etikett for én plante under Egenskaper. Bed merkes med antallet av hver plante, og hekker med sitt eget antall. Mer › {{ui:Planteetiketter}} slår etiketter av og på. Etikettfelt: `{name}`, `{botanical}`, `{size}` (beholderen), `{qty}`, `{height}`, `{spread}`, `{container}`.

## Plantelisten

Mer › {{ui:Planteliste…}} teller hver plante etter art, fra enkeltplanter, bed og hekker samlet, med plantestørrelsen. Lagre den som **CSV** eller **XLSX**, eller **Send til TakeoffCraft**: en mengdefil som TakeoffCraft åpner for å prise plantene (med mengdene for harde flater og vanning ved siden av).

## IFC

Mer › {{ui:Eksporter landskaps-IFC}} lagrer landskapet som en IFC-fil (IFC 4.3) som en BIM-modell kan inneholde: hver plante er et `IfcGeographicElement` av typen VEGETATION, typet etter art med plantens egenskaper (botanisk navn, størrelser, hardførhet, vann, lys), og hvert bed og hver hekk er ett element med sine antall, på tomten. BimCraft åpner den ved siden av bygget.
