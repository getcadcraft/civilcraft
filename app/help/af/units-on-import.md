---
title: Eenhede by invoer: 'n lêer sê sy eenhede, of jy word eers gevra
summary: Wanneer 'n tekening of mesh wat jy in 'n projek bring sy eenhede sê, skakel CivilCraft dit om en sê so. Wanneer nie, vra CivilCraft voordat dit ingelees word en onthou jou antwoord vir daardie lêer.
keywords: eenhede, invoer, DWG, DXF, STL, OBJ, opmeting, voet, US-landmeetvoet, meter, millimeter, skaal, verkeerde grootte, te groot, te klein, vra, onthou, INSUNITS, tekeningeenhede
from: 60921963
---

## Wat jy gaan doen

Bring 'n lêer in 'n projek in en maak seker dit kom in die regte grootte in.

## Stappe

1. Maak die lêer soos gewoonlik oop: {{ui:Maak oop}}, sleep dit op die plan, of die CAD-tekeningopdrag.
2. As die lêer sy eenhede sê, word niks gevra nie: die invoerdialoog wys hulle as **Soos die tekening sê**.
3. As dit nie sê nie, vra 'n dialoog **Eenhede van** die lêer voordat die invoerdialoog oopgaan. Kies wat een eenheid in die lêer is en klik {{ui:Gebruik hierdie eenhede}}.
4. {{ui:Kanselleer}} (of {{key:Esc}}) slaan die lêer oor. Niks daarvan word in die projek gelees nie.

## Watter lêers sê hul eenhede

- **DWG en DXF**: die tekening se invoegeenhede (`$INSUNITS`). 'n Lêer sonder hulle word gevra. Die **Tekeningeenhede**-lys in die invoerdialoog begin by jou antwoord en kan steeds verander.
- **STL en OBJ** (vrye landskapsvorms): sê nooit eenhede nie. Jy word gevra.
- **Lyste van punte** (CSV, TXT) en vorderingsopmetingslyste: 'n lys wat sy eenheid in sy eerste reëls sê, word omgeskakel en die statusreël sê so. 'n Lys wat geen sê nie, word gevra wanneer jy {{ui:Voer in}} druk, voordat die punte ingaan. Breedte- en lengtegraadkolomme gaan eerder deur die koördinaatstelsel.
- **Die Puntwolke-byvoeging**: vra wanneer jy 'n wolk bou waarvan die lêer geen eenheid sê nie, en merk die wolk se getalle in die eenheid wat dit dra.
- **IFC en LandXML**: sê hulle s'n; hulle word na die projek se eenhede omgeskakel.
- **LAS, LAZ en hoogteraster**: geplaas volgens hul koördinaatstelsel; die terreindialoog vra vir die hoogte-eenheid wanneer die lêer dit nie sê nie.

## Goed om te weet

- Die antwoord word vir daardie lêer op hierdie rekenaar onthou, in elke CadCraft-app. Die volgende keer as dit ingaan, word jy nie gevra nie.
- Om weer gevra te word: die opdragpalet ({{key:Mod+K}}) › **Vra weer vir die eenhede van ingevoerde lêers**.
- 'n Eenheid wat 'n lys sê, word uit sy eerste agt reëls gelees: 'n reël soos `units: ft`, of kolomopskrifte wat almal dieselfde eenheid in hakies dra, soos `Elevation (m)`.
