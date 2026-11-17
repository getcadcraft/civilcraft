---
title: Plantegrafik efter målestok, egne symboler og 3D-planter
summary: Hvordan planter tegnes i plan ved hver tegningsmålestok og detaljeringsniveau, og hvordan en plantepost får dit eget symbol (SVG, eller en DXF/DWG-blok) og din egen 3D-model (OBJ, STL eller GLB).
keywords: plantegrafik, plantesymbol, symbol efter målestok, detaljeringsniveau, enkel cirkel, kontur, detaljeret symbol, eget symbol, blok, svg, dxf, dwg, 3D-plante, egen 3D-model, obj, stl, glb, gltf, træmodel, planter i 3D
from: 875837d9
---

## Plansymboler efter målestok

Landskab › {{ui:Mere}} › {{ui:Plantegrafik}} angiver, hvordan planter tegnes i plan. **Automatisk, efter målestok** vælger et af tre niveauer ud fra tegningsmålestoken:

- **Enkel cirkel** (grovere end 1:500): en cirkel med plantens udbredelse.
- **Kontur med centrum** (fra 1:500 til 1:200): cirklen og et lille centrumkryds.
- **Detaljeret symbol** (finere end 1:200): postens eget symbol, hvis den har et, ellers det indbyggede symbol.

Ændr de to målestoksgrænser med **Enkel fra 1:** og **Kontur fra 1:**, eller vælg ét niveau for alle målestoksforhold. Hvert arksæt i dialogboksen Ark har sin egen **Plantedetalje i plan**, så en 1:500 situationsplan og en 1:100 beplantningsplan kan være forskellige. Indstillingerne gemmes sammen med projektet.

## Dit eget symbol

Vælg en plante i afsnittet Planter, og tryk på {{ui:Eget symbol…}}. Den læser en SVG, eller en blok i en DXF- eller DWG-tegning (hvis tegningen har flere blokke, vælger du én). Symbolet tilpasses plantens udbredelse og tegnes på det detaljerede niveau. Det gemmes i projektet, så filen følger med.

- En SVG læses for sine linjer, polylinjer, polygoner, rektangler, cirkler, ellipser og stier. Scripts, stilarter, links og billeder i den læses aldrig. Transformationer anvendes ikke: du får besked, når filen har dem, så opløs dem i dit tegneprogram først.
- Grænser: 512 KB SVG og 2000 former. En større fil afvises, og årsagen vises.

## Din egen 3D-plante

{{ui:Egen 3D-model…}} på samme post læser en **OBJ**-, **STL**- eller **GLB**-fil. Derefter sættes **Planter i 3D** under Plantegrafik til **Hver posts egen model**: alle planter af den post viser din model, skaleret til deres højde og udbredelse. Poster uden egen model beholder de indbyggede former. Vælg **Enkle masser** til hurtige visninger af store områder.

En GLB læses kun for sin form:

- Alt modellen behøver skal ligge inde i .glb-filen. En model, der peger på andre filer (en separat .bin, eller billeder via adresse), afvises: intet hentes.
- Komprimeret eller pakket geometri (Draco, meshopt, kvantiserede positioner) læses ikke. Eksportér uden komprimering.
- Teksturer og farver i filen bruges ikke: modellen tegnes i plantens egen farve. Teksturer kontrolleres stadig, og en tekstur over 4096 pixel på en side afvises.
- Grænser: en fil på 32 MB, 50 000 trekanter (hver kopi af en del, der er placeret mere end én gang, tælles med), 64 billeder og 16 MB billeder.

Hver grænse afviser filen med årsagen; intet halvt læst gemmes. Ét fortryd-trin giver posten dens symbol eller model, og {{ui:Fjern eget symbol}} eller {{ui:Fjern egen 3D-model}} fjerner det igen.

Se [Plantposter](topic:plant-records) for selve posten, og [Vis området i 3D](topic:site-3d).
