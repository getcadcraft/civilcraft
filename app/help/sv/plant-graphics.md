---
title: Växtgrafik efter skala, egna symboler och 3D-växter
summary: Hur växter ritas i plan i varje ritningsskala och detaljnivå, och hur en växtpost får en egen symbol (SVG, eller ett DXF/DWG-block) och en egen 3D-modell (OBJ, STL eller GLB).
keywords: växtgrafik, växtsymbol, symbol efter skala, detaljnivå, detaljgrad, enkel cirkel, kontur, detaljerad symbol, egen symbol, block, svg, dxf, dwg, 3D-växt, egen 3D-modell, obj, stl, glb, gltf, trädmodell, växter i 3D
from: 875837d9
---

## Planssymboler efter skala

Landskap › {{ui:Mer}} › {{ui:Växtgrafik}} styr hur växter ritas i plan. **Automatiskt, efter skala** väljer en av tre nivåer utifrån ritningsskalan:

- **Enkel cirkel** (grövre än 1:500): en cirkel med växtens spridning.
- **Kontur med mittpunkt** (från 1:500 till 1:200): cirkeln och ett litet kryss i mitten.
- **Detaljerad symbol** (finare än 1:200): postens egna symbol om den har en, annars den inbyggda symbolen.

Ändra de två skalorna med **Enkel från 1:** och **Kontur från 1:**, eller välj en nivå för alla skalor. Varje bladuppsättning i dialogrutan Blad har sin egen **Växtdetalj i plan**, så en platsplan i 1:500 och en planteringsplan i 1:100 kan skilja sig. Inställningarna sparas med projektet.

## Egen symbol

Välj en växt i avsnittet Växter och tryck på {{ui:Egen symbol…}}. Den läser en SVG, eller ett block i en DXF- eller DWG-ritning (om ritningen har flera block väljer du ett). Symbolen anpassas efter växtens spridning och ritas på detaljerad nivå. Den sparas i projektet, så filen följer med.

- En SVG läses för sina linjer, polylinjer, polygoner, rektanglar, cirklar, ellipser och banor. Skript, formatmallar, länkar och bilder i den tas aldrig upp. Transformeringar tillämpas inte: du får veta när filen har dem, så platta ut dem i ditt ritprogram först.
- Gränser: 512 KB SVG och 2000 former. En större fil avvisas med skälet angivet.

## Egen 3D-växt

{{ui:Egen 3D-modell…}} på samma post läser en **OBJ**-, **STL**- eller **GLB**-fil. Sedan, i Växtgrafik, ställ in **Växter i 3D** till **Varje posts egna modell**: varje växt i den posten visar din modell, skalad efter sin höjd och spridning. Poster utan egen modell behåller de inbyggda formerna. Välj **Enkla volymer** för snabba vyer av stora områden.

En GLB läses endast för sin form:

- Allt modellen behöver måste finnas inne i .glb-filen. En modell som pekar på andra filer (en separat .bin, eller bilder via adress) avvisas: ingenting hämtas.
- Komprimerad eller packad geometri (Draco, meshopt, kvantiserade positioner) läses inte. Exportera utan komprimering.
- Texturer och färger i filen används inte: modellen ritas i växtens egen färg. Texturer kontrolleras ändå, och en textur över 4096 bildpunkter per sida avvisas.
- Gränser: en fil på 32 MB, 50 000 trianglar (där varje kopia av en del som placerats mer än en gång räknas), 64 bilder och 16 MB bilder.

Varje gräns avvisar filen med skälet; ingenting som lästs halvvägs sparas. Ett steg i Ångra ger posten dess symbol eller modell, och {{ui:Ta bort egen symbol}} eller {{ui:Ta bort egen 3D-modell}} tar bort den igen.

Se [Växtposter](topic:plant-records) för själva posten, och [Visa platsen i 3D](topic:site-3d).
