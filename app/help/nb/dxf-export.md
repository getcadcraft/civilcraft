---
title: Eksporter planen til DXF
summary: Skriv linjeverket i planen som en R12-DXF på navngitte layer, med høydekurver i sine høyder og bruddlinjer i 3D, for alle CAD-programmer.
keywords: dxf, dwg, cad, eksport, linjeverk, r12, 2000, 2004, 2007, 2010, 2013, 2018, layer, høydekurver, tegningsutveksling, grunnkart, bakgrunn
from: f2d8ede9
---

{{ui:DXF}} skriver det planen viser som en DXF-fil i R12-formatet, versjonen alle CAD-programmer åpner. Med AutoCAD eller Civil 3D åpnes eller settes den inn på samme måte som en hvilken som helst DXF-fil.

## Eksport

1. Still opp planen slik tegningen skal være: under **Visning** velg terrengmodellen (eksisterende eller planlagt), kurveintervallet, og hva som skal være med (høydekurver, merkelapper, punkter, punktmerkelapper, trekanter, bruddlinjer, terrengkant, rør, skråningspiler).
2. Klikk {{ui:DWG/DXF}} i gruppen **Eksporter** og velg {{ui:DXF (R12, tekst) — den enkle utvekslingsfilen}}, og klikk deretter {{ui:Last ned}}.
3. Nettleseren laster ned `<name>.dxf`. Statuslinjen sier for eksempel "Eksporterte R12-DXF: 2,140 objekter; merkelapper tilpasset for 1" = 40'. Høydebånd eksporteres ikke."

Koordinatene skrives i prosjektets enheter, med sine virkelige verdier (koordinater i state plane beholdes som de er). Ingenting skaleres eller flyttes.

## Hva filen inneholder

| Element | DXF-entitet | Layer |
|---|---|---|
| Tynne og tykke høydekurver | 2D-polylinjer i sin høyde | C-TOPO-MINR, C-TOPO-MAJR |
| Merkelapper for høydekurver | Tekst | C-TOPO-TEXT |
| Trekanter | Polylinjer | C-TOPO-TINN |
| Bruddlinjer og avgrensning | 3D-polylinjer | C-TOPO-BRKL |
| Terrengmodellens kant | Polylinjer | C-TOPO-BNDY |
| Skråningspiler | Polylinjer | C-TOPO-SLOP |
| Oppmålingspunkter og deres merkelapper | Punkter (med høyde), tekst | V-NODE, V-NODE-TEXT |
| Linjer fra linjekoder | 3D-polylinjer | V-NODE-LINE |
| Senterlinjer for veglinjer | Linjer og buer | C-ROAD-CNTR |
| Profilnummermerker og merkelapper | Polylinjer, tekst | C-ROAD-STAN |
| Korridorkanter | Polylinjer | C-ROAD-CORR |
| Profillinjer | Polylinjer | C-ROAD-SCTN |
| Byggeplater, dagslinjer, skråningslinjer | Polylinjer | C-GRAD-PADS, C-GRAD-DAYL, C-GRAD-SLOP |
| Formlinjer | 3D-polylinjer (buer som biter innenfor 0.01; se [Formlinjer](topic:feature-lines)) | C-GRAD-FEAT |
| Sveipebaner | Polylinjer, tekst | C-ROAD-SWPT |
| Rør, konstruksjoner, merkelapper | Polylinjer, tekst | C-STRM-PIPE, C-STRM-STRC, C-STRM-TEXT |
| Rør og konstruksjoner med problemer | Polylinjer | C-STRM-PROB |

Hvert layer har en farge. Hele listen står i [Plan-layers](topic:plan-layers).

## Størrelse på merkelapper

Tekst må ha en størrelse i tegningsenheter. CivilCraft tilpasser merkelappene til målestokken der hele planen får plass på et Tabloid-ark (fot) eller et A3-ark (meter), og statuslinjen sier hvilken målestokk det er. Hvis utskriften gjøres i en annen målestokk i CAD-programmet, skaleres teksten der.

## Hva som ikke eksporteres

- Høydebånd (bare på skjermen).
- Profilvisningen. Profiler eksporteres som LandXML, ikke som en tegning.
- Terrengmodellen selv som 3D-objekt. Bruk LandXML for TIN, eller slå på {{ui:Trekanter}} for å få kantene som linjeverk.
- Alt som er slått av under **Visning**.

## DWG

{{ui:DWG/DXF}} skriver det samme linjeverket som en DWG-tegning også. Dialogen spør etter formatet: DXF, eller en DWG i formatet 2000, 2004, 2007, 2010, 2013 eller 2018. 2000 åpnes av nesten alle CAD-programmer, gamle og nye. Velg et nyere format når mottakeren av tegningen ber om det. Valget huskes i denne nettleseren.

1. Klikk {{ui:DWG}} i gruppen **Eksporter**.
2. Velg **Format** og klikk **Last ned DWG**.
3. Nettleseren laster ned `<name>.dwg`. Statuslinjen sier hva som ble med, for eksempel "Eksporterte DWG (2018-format): 12 polylinjer, 40 merkelapper på 9 layer".

DWG-filen har de samme layerne, fargene, høydekurvene (som polylinjer i sin høyde), 3D-bruddlinjene, merkelappene og punktene som DXF-filen, i de samme koordinatene. Layernavn som en DWG ikke kan ha, endres, og statuslinjen sier fra om det. CivilCraft skriver DWG med sin egen kode, så ingenting forlater datamaskinen.

### Kartlag i DWG

En DWG-tegning kan ikke inneholde et bilde inni seg: CAD-programmer viser et bilde som ligger ved siden av tegningen. Når kartlag vises, tilbyr dialogen **Kartlag som bilde ved siden av tegningen**. Med det avkrysset blir nedlastingen en `.zip` som inneholder `<name>.dwg`, `<name>-map.png` (kartlagene over hele tegningen, opptil 4,096 piksler i bredden) og `<name>-map.pgw` (verdensfilen, for GIS-programmer). Tegningen viser bildet som et bilde på layer G-MAP-IMAG, på rett sted. Pakk ut filene i én mappe og hold dem sammen.
