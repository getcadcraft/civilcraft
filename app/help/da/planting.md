---
title: Beplantningsplaner og lister
summary: Placér enkelte planter, plantebede udfyldt med planternes afstand og blandede planter efter procent, og hække; mærk dem; tæl dem i en planteliste til et regneark eller TakeoffCraft.
keywords: beplantningsplan, planteliste, plantebed, masseplantning, hæk, træ, busk, jorddække, afstand, trekantet afstand, plantetælling, mængder, etiketter, krone, plantesymboler, ifc, mængdeudtræk
from: ab49eab5
---

## Placér planter

1. Vælg en plante under **Planter** til venstre.
2. Klik på {{ui:Plante}}, og klik derefter i planen: hvert klik placerer én plante. Tryk på {{key:Esc}} for at stoppe.

En plantes symbol tegnes i dens udbredelse ved modenhed; Mere › {{ui:Vis i plantestørrelse}} tegner hver plante i den størrelse, den plantes i. Træer står på jorden under dem: når du senere planerer området, følger de det. For at fastlåse en plante til en kote i stedet skal du angive den i **Kote** under Egenskaber.

## Plantebede

1. Vælg hovedplanten, klik på {{ui:Bed}}, og klik på bedets hjørner. Tryk på {{key:Enter}} (eller klik på det første hjørne igen) for at lukke det.
2. Bedet fyldes med denne plante i dens afstand, i et **trekantet** mønster (det almindelige: hver plante har samme afstand til seks andre), en halv afstand ind fra kanten.
3. Under Egenskaber blander **Tilføj en plante** den plante ind, der er valgt til venstre. Angiv hver plantes **Andel %**: bedet tager netop så mange af hver, fordelt over det. **Bland igen** blander, hvor de placeres.

**Afstand** tom bruger planternes egen afstand (vægtet efter deres andele); skriv en afstand for at bruge den for alle planter. **Mønster** kan være kvadratisk, og **Rækker ved** drejer rækkerne.

## Hække

Vælg hækplanten, klik på {{ui:Hæk}}, klik langs hækken, og tryk på {{key:Enter}}. Planter placeres langs linjen i deres afstand, centreret, så begge ender har samme margin. En hæk kan være **to rækker, forskudt** i en fast afstand fra hinanden.

## Etiketter

Enkeltplanter mærkes med etiketindstillingen (`{name}` som standard); skriv din egen etiket til én plante under Egenskaber. Bede mærkes med hver plantes antal, hække med deres. Mere › {{ui:Planteetiketter}} tænder og slukker for etiketter. Etikettfelter: `{name}`, `{botanical}`, `{size}` (beholderen), `{qty}`, `{height}`, `{spread}`, `{container}`.

## Planteoversigten

Mere › {{ui:Planteliste…}} tæller hver plante pr. art, fra enkeltplanter, bede og hække samlet, med dens plantestørrelse. Gem den som **CSV** eller **XLSX**, eller **Send til TakeoffCraft**: en mængdefil, som TakeoffCraft åbner for at prissætte planterne (med belægnings- og vandingsmængderne ved siden af).

## IFC

Mere › {{ui:Eksportér landskabs-IFC}} gemmer landskabet som en IFC-fil (IFC 4.3), som en BIM-model kan indeholde: hver plante er et `IfcGeographicElement` af typen VEGETATION, typet efter sin art, med plantens egenskaber (botanisk navn, størrelser, hårdførhed, vand, lys); hvert bed og hver hæk er ét element med sine tællinger, placeret på grunden. BimCraft åbner den ved siden af bygningen.
