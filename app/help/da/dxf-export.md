---
title: Eksportér planen til DXF
summary: Skriv planens linjer som en R12 DXF-fil med navngivne lag, med højdekurver i deres koter og brudlinjer i 3D, til ethvert CAD-program.
keywords: dxf, dwg, cad, eksport, linjetegning, r12, 2000, 2004, 2007, 2010, 2013, 2018, lag, højdekurver, tegningsudveksling, baggrundskort, baggrund
from: f2d8ede9
---

{{ui:DXF}} skriver det, planen viser, som en DXF-fil i R12-formatet, den version alle CAD-programmer kan åbne. Hvis du har brugt AutoCAD eller Civil 3D, kan du åbne eller indsætte den, ligesom du ville gøre med enhver anden DXF-fil.

## Eksport

1. Opsæt planen, som du vil have tegningen: under **Visning** vælger du overfladen (eksisterende eller foreslået), højdekurveintervallet og hvilke ting der er tændt (højdekurver, etiketter, punkter, punktetiketter, trekanter, brudlinjer, overfladekant, rør, skråningspile).
2. Klik på {{ui:DWG/DXF}} i gruppen **Eksportér**, vælg {{ui:DXF (R12, tekst) — den almindelige udvekslingsfil}}, og klik derefter på {{ui:Download}}.
3. Browseren downloader `<name>.dxf`. Statuslinjen siger fx "Eksporteret R12 DXF: 2,140 objekter; etiketter dimensioneret til 1" = 40'. Bånd eksporteres ikke."

Koordinater skrives i projektets enheder, med deres faktiske værdier (state plane-koordinater bevares, som de er). Intet skaleres eller flyttes.

## Hvad der er i filen

| Ting | DXF-entitet | Lag |
|---|---|---|
| Mindre og større højdekurver | 2D-polylinjer ved deres kote | C-TOPO-MINR, C-TOPO-MAJR |
| Højdekurveetiketter | Tekst | C-TOPO-TEXT |
| Trekanter | Polylinjer | C-TOPO-TINN |
| Brudlinjer og afgrænsning | 3D-polylinjer | C-TOPO-BRKL |
| Overfladekant | Polylinjer | C-TOPO-BNDY |
| Skråningspile | Polylinjer | C-TOPO-SLOP |
| Opmålingspunkter og deres etiketter | Punkter (med kote), tekst | V-NODE, V-NODE-TEXT |
| Linjer fra linjekoder | 3D-polylinjer | V-NODE-LINE |
| Tracé-midterlinjer | Linjer og buer | C-ROAD-CNTR |
| Stationeringsstreger og -etiketter | Polylinjer, tekst | C-ROAD-STAN |
| Korridorkanter | Polylinjer | C-ROAD-CORR |
| Snitlinjer | Polylinjer | C-ROAD-SCTN |
| Plateauer, skæringslinjer, skråningslinjer | Polylinjer | C-GRAD-PADS, C-GRAD-DAYL, C-GRAD-SLOP |
| Feature-linjer | 3D-polylinjer (buer som stykker inden for 0.01; se [Feature-linjer](topic:feature-lines)) | C-GRAD-FEAT |
| Svingkurver | Polylinjer, tekst | C-ROAD-SWPT |
| Rør, konstruktioner, etiketter | Polylinjer, tekst | C-STRM-PIPE, C-STRM-STRC, C-STRM-TEXT |
| Rør og konstruktioner med problemer | Polylinjer | C-STRM-PROB |

Hvert lag har en farve. Hele listen findes i [Planlag](topic:plan-layers).

## Etiketternes størrelse

Tekst skal have en størrelse i tegningsenheder. CivilCraft dimensionerer etiketter til den målestok, hvor hele planen passer på et Tabloid-ark (fod) eller et A3-ark (meter), og statuslinjen siger, hvilken målestok det er. Hvis du plotter i en anden målestok i dit CAD-program, skal du skalere teksten dér.

## Hvad der ikke eksporteres

- Kotebånd (kun på skærmen).
- Længdeprofilvisningen. Længdeprofiler eksporteres som LandXML, ikke som tegning.
- Selve overfladen som et 3D-objekt. Brug LandXML til TIN'et, eller slå {{ui:Trekanter}} til for at få dens kanter som linjer.
- Alt, du har slået fra under **Visning**.

## DWG

{{ui:DWG/DXF}} skriver den samme linjetegning som en DWG-tegning. Dialogboksen spørger efter formatet: DXF, eller en DWG fra 2000, 2004, 2007, 2010, 2013 eller 2018. 2000 kan åbnes i næsten alle CAD-programmer, både gamle og nye; vælg et nyere, når modtageren af tegningen beder om det. Dit valg huskes i denne browser.

1. Klik på {{ui:DWG}} i gruppen **Eksportér**.
2. Vælg **Format** og klik på **Download DWG**.
3. Browseren downloader `<name>.dwg`. Statuslinjen siger, hvad der blev med, fx "Eksporteret DWG (2018-format): 12 polylinjer, 40 etiketter på 9 lag".

DWG-filen har de samme lag, farver, højdekurver (som polylinjer ved deres kote), 3D-brudlinjer, etiketter og punkter som DXF-filen, i de samme koordinater. Lagnavne, en DWG ikke kan rumme, bliver ændret, og statusmeddelelsen siger det. CivilCraft skriver DWG med sin egen kode, så intet forlader din computer.

### Kortlag i DWG-filen

En DWG-tegning kan ikke rumme et billede inde i sig selv: CAD-programmer viser et billede, der ligger ved siden af tegningen. Når kortlag vises, tilbyder dialogboksen **Kortlag som et billede ved siden af tegningen**. Med det markeret er download en `.zip`, der indeholder `<name>.dwg`, `<name>-map.png` (kortlagene over hele tegningen, op til 4,096 pixels i bredden) og `<name>-map.pgw` (verdensfilen til GIS-programmer). Tegningen viser billedet som et billede på laget G-MAP-IMAG, på sin plads. Pak filerne ud i én mappe, og hold dem sammen.
