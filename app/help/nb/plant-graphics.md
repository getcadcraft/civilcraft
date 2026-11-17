---
title: Plantegrafikk etter målestokk, egne symboler og 3D-planter
summary: Hvordan planter tegnes i plan ved hver tegningsmålestokk og detaljnivå, og hvordan en plantepost får eget symbol (SVG, eller en DXF/DWG-blokk) og egen 3D-modell (OBJ, STL eller GLB).
keywords: plantegrafikk, plantesymbol, symbol etter målestokk, detaljnivå, nivå av detaljer, enkel sirkel, kontur, detaljert symbol, eget symbol, blokk, svg, dxf, dwg, 3D-plante, egen 3D-modell, obj, stl, glb, gltf, trémodell, planter i 3D
from: 875837d9
---

## Plansymboler etter målestokk

Landskap › {{ui:Mer}} › {{ui:Plantegrafikk}} angir hvordan planter tegnes i plan. **Automatisk etter målestokk** velger ett av tre nivåer ut fra tegningsmålestokken:

- **Enkel sirkel** (grovere enn 1:500): en sirkel med plantens utbredelse.
- **Kontur med senter** (fra 1:500 til 1:200): sirkelen og et lite senterkors.
- **Detaljert symbol** (finere enn 1:200): postens eget symbol hvis den har et, ellers det innebygde symbolet.

Endre de to målestokkene med **Enkel fra 1:** og **Kontur fra 1:**, eller velg ett nivå for alle målestokker. Hvert arksett i dialogboksen Ark har sin egen **Plantedetalj i plan**, slik at en situasjonsplan i 1:500 og en beplantningsplan i 1:100 kan være ulike. Innstillingene lagres med prosjektet.

## Eget symbol

Velg en plante i delen Planter og trykk {{ui:Eget symbol…}}. Det leses en SVG, eller en blokk fra en DXF- eller DWG-tegning (hvis tegningen har flere blokker, velges én). Symbolet tilpasses plantens utbredelse og tegnes på detaljert nivå. Det lagres i prosjektet, så filen følger med.

- En SVG leses for linjer, polylinjer, mangekanter, rektangler, sirkler, ellipser og baner. Skript, stiler, lenker og bilder i den undersøkes aldri. Transformasjoner brukes ikke: det gis beskjed når filen har dem, så de må flates ut i tegneprogrammet først.
- Grenser: 512 KB SVG og 2000 former. En større fil avvises, med årsaken.

## Egen 3D-plante

{{ui:Egen 3D-modell…}} på samme post leser en **OBJ**-, **STL**- eller **GLB**-fil. Sett deretter i Plantegrafikk **Planter i 3D** til **Egen modell for hver post**: hver plante i den posten viser modellen, skalert til sin høyde og utbredelse. Poster uten egen modell beholder de innebygde formene. Velg **Enkle masser** for raske visninger av store områder.

En GLB leses kun for formen:

- Alt modellen trenger må ligge inne i .glb-filen. En modell som peker til andre filer (en egen .bin, eller bilder etter adresse) avvises: ingenting lastes ned.
- Komprimert eller pakket geometri (Draco, meshopt, kvantiserte posisjoner) leses ikke. Eksporter uten komprimering.
- Teksturer og farger i filen brukes ikke: modellen tegnes i plantens egen farge. Teksturer kontrolleres likevel, og en tekstur over 4096 piksler på en side avvises.
- Grenser: en fil på 32 MB, 50 000 trekanter (der hver kopi av en del som er plassert mer enn én gang, telles), 64 bilder og 16 MB bilder.

Hver grense avviser filen med årsaken; ingenting som er delvis lest, beholdes. Ett angre-steg gir posten symbolet eller modellen, og {{ui:Fjern eget symbol}} eller {{ui:Fjern egen 3D-modell}} fjerner det igjen.

Se [Plantepost](topic:plant-records) for selve posten, og [Vis området i 3D](topic:site-3d).
