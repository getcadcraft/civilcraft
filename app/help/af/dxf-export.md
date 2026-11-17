---
title: Voer die plan uit na DXF
summary: Skryf die planlynwerk as 'n R12 DXF op benoemde lae, met kontoere op hul hoogtes en breeklyne in 3D, vir enige CAD-program.
keywords: dxf, dwg, cad, uitvoer, lynwerk, r12, 2000, 2004, 2007, 2010, 2013, 2018, lae, kontoere, tekeninguitruiling, basiskaart, agtergrond
from: f2d8ede9
---

{{ui:DXF}} skryf wat die plan wys as 'n DXF-lêer in die R12-formaat, die weergawe wat elke CAD-program oopmaak. As jy AutoCAD of Civil 3D gebruik het, maak dit oop of voeg dit in soos enige ander DXF.

## Uitvoer

1. Stel die plan op soos jy die tekening wil hê: kies onder **Vertoning** die oppervlak (bestaande of voorgestelde), die kontoerinterval, en watter dinge aan is (kontoere, etikette, punte, puntetikette, driehoeke, breeklyne, oppervlakrand, pype, helling-pyltjies).
2. Klik {{ui:DWG/DXF}} in die groep **Uitvoer** en kies {{ui:DXF (R12, teks) — die gewone uitruillêer}}, en dan {{ui:Laai af}}.
3. Die blaaier laai `<name>.dxf` af. Die statusbalk sê, byvoorbeeld, "Uitgevoer R12 DXF: 2,140 voorwerpe; etikette gemeet vir 1" = 40'. Bande word nie uitgevoer nie."

Koördinate word in jou projekeenhede geskryf, op hul werklike waardes (staatsvlak-koördinate bly soos hulle is). Niks word geskaal of geskuif nie.

## Wat in die lêer is

| Ding | DXF-entiteit | Laag |
|---|---|---|
| Klein en groot kontoere | 2D-polilyne op hul hoogte | C-TOPO-MINR, C-TOPO-MAJR |
| Kontoeretikette | Teks | C-TOPO-TEXT |
| Driehoeke | Polilyne | C-TOPO-TINN |
| Breeklyne en grens | 3D-polilyne | C-TOPO-BRKL |
| Oppervlakrand | Polilyne | C-TOPO-BNDY |
| Helling-pyltjies | Polilyne | C-TOPO-SLOP |
| Opmetingspunte en hul etikette | Punte (met hoogte), teks | V-NODE, V-NODE-TEXT |
| Lyne uit lynkodes | 3D-polilyne | V-NODE-LINE |
| Belyningsmiddellyne | Lyne en bôe | C-ROAD-CNTR |
| Stasioneringsmerke en etikette | Polilyne, teks | C-ROAD-STAN |
| Koridorrande | Polilyne | C-ROAD-CORR |
| Monsterlyne | Polilyne | C-ROAD-SCTN |
| Platforms, daglig-lyne, helling-lyne | Polilyne | C-GRAD-PADS, C-GRAD-DAYL, C-GRAD-SLOP |
| Kenmerklyne | 3D-polilyne (bôe as stukke binne 0.01; sien [Kenmerklyne](topic:feature-lines)) | C-GRAD-FEAT |
| Swaaipaaie | Polilyne, teks | C-ROAD-SWPT |
| Pype, strukture, etikette | Polilyne, teks | C-STRM-PIPE, C-STRM-STRC, C-STRM-TEXT |
| Pype en strukture met probleme | Polilyne | C-STRM-PROB |

Elke laag het 'n kleur. Die volledige lys is in [Plan-lae](topic:plan-layers).

## Etiketgrootte

Teks moet 'n grootte in tekeningeenhede hê. CivilCraft meet etikette vir die skaal waarby die hele plan op 'n Tabloid-blad (voet) of 'n A3-blad (meter) pas, en sê in die statusboodskap watter skaal. As jy by 'n ander skaal in jou CAD-program druk, skaal die teks daar.

## Wat nie uitgevoer word nie

- Hoogtebande (slegs op die skerm).
- Die lengteprofiel-aansig. Profiele word as LandXML uitgestuur, nie as 'n tekening nie.
- Die oppervlak self as 'n 3D-voorwerp. Gebruik LandXML vir die TIN, of skakel {{ui:Triangles}} aan om sy rande as lynwerk te kry.
- Enigiets wat jy onder **Vertoning** afgeskakel het.

## DWG

{{ui:DWG/DXF}} skryf dieselfde lynwerk ook as 'n DWG-tekening. Die dialoog vra vir die formaat: DXF, of 'n DWG van 2000, 2004, 2007, 2010, 2013 of 2018. 2000 maak in byna elke CAD-program oop, oud en nuut; kies 'n nuwer een wanneer wie die tekening kry dit vra. Jou keuse word in hierdie blaaier onthou.

1. Klik {{ui:DWG}} in die groep **Uitvoer**.
2. Kies die **Formaat** en klik **Laai DWG af**.
3. Die blaaier laai `<name>.dwg` af. Die statusbalk sê wat ingegaan het, byvoorbeeld "DWG uitgevoer (2018-formaat): 12 polilyne, 40 etikette op 9 lae".

Die DWG het dieselfde lae, kleure, kontoere (as polilyne op hul hoogte), 3D-breeklyne, etikette en punte as die DXF, in dieselfde koördinate. Laenaamme wat 'n DWG nie kan hou nie, word verander, en die statusboodskap sê so. CivilCraft skryf DWG met sy eie kode, so niks verlaat jou rekenaar nie.

### Kaartlae in die DWG

'n DWG-tekening kan nie 'n prent binne in hom hou nie: CAD-programme wys 'n prent wat langs die tekening staan. Wanneer kaartlae wys, bied die dialoog **Kaartlae as 'n prent langs die tekening** aan. Met dit afgemerk is die aflaai 'n `.zip` wat `<name>.dwg`, `<name>-map.png` (die kaartlae oor die hele tekening, tot 4,096 pixels breed) en `<name>-map.pgw` (sy wêreldlêer, vir GIS-programme) hou. Die tekening wys die prent as 'n beeld op laag G-MAP-IMAG, op sy plek. Pak die lêers in een vouer uit en hou hulle saam.
