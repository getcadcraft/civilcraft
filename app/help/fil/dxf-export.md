---
title: I-export ang plano sa DXF
summary: Isulat ang linework ng plano bilang R12 DXF sa mga pinangalanang layer, na may contours sa kanilang elevation at breaklines sa 3D, para sa anumang CAD program.
keywords: dxf, dwg, cad, i-export, linework, r12, 2000, 2004, 2007, 2010, 2013, 2018, layers, contours, palitan ng drawing, base map, background
from: f2d8ede9
---

Isinusulat ng {{ui:DXF}} ang ipinapakita ng plano bilang DXF file sa R12 format, ang bersyong nabubuksan ng bawat CAD program. Kung gumamit ka ng AutoCAD o Civil 3D, buksan o i-insert ito gaya ng anumang DXF.

## I-export

1. Itakda ang plano ayon sa gusto mong drawing: sa ilalim ng **Display**, piliin ang surface (existing o proposed), ang contour interval, at kung alin ang nakabukas (contours, labels, points, point labels, triangles, breaklines, surface edge, pipes, slope arrows).
2. I-click ang {{ui:DWG/DXF}} sa grupong **I-export** at piliin ang {{ui:DXF (R12, text) — the plain exchange file}}, saka {{ui:Download}}.
3. Magda-download ang browser ng `<name>.dxf`. Ipinapakita ng status bar, halimbawa, "Na-export ang R12 DXF: 2,140 objects; labels sized for 1" = 40'. Bands are not exported."

Isinusulat ang coordinates sa units ng iyong proyekto, sa tunay nilang halaga (nananatili ang state plane coordinates gaya ng mga ito). Walang na-scale o nailipat.

## Ano ang nasa file

| Bagay | DXF entity | Layer |
|---|---|---|
| Minor at major contours | 2D polylines sa kanilang elevation | C-TOPO-MINR, C-TOPO-MAJR |
| Mga label ng contour | Text | C-TOPO-TEXT |
| Triangles | Polylines | C-TOPO-TINN |
| Breaklines at boundary | 3D polylines | C-TOPO-BRKL |
| Gilid ng surface | Polylines | C-TOPO-BNDY |
| Slope arrows | Polylines | C-TOPO-SLOP |
| Survey points at ang kanilang mga label | Points (may elevation), text | V-NODE, V-NODE-TEXT |
| Mga linya mula sa line codes | 3D polylines | V-NODE-LINE |
| Mga centerline ng alignment | Lines at arcs | C-ROAD-CNTR |
| Mga stationing tick at label | Polylines, text | C-ROAD-STAN |
| Mga gilid ng corridor | Polylines | C-ROAD-CORR |
| Mga sample line | Polylines | C-ROAD-SCTN |
| Mga pad, daylight line, slope line | Polylines | C-GRAD-PADS, C-GRAD-DAYL, C-GRAD-SLOP |
| Feature lines | 3D polylines (mga arko bilang piyesa sa loob ng 0.01; tingnan ang [Feature lines](topic:feature-lines)) | C-GRAD-FEAT |
| Mga swept path | Polylines, text | C-ROAD-SWPT |
| Mga pipe, structure, label | Polylines, text | C-STRM-PIPE, C-STRM-STRC, C-STRM-TEXT |
| Mga pipe at structure na may problema | Polylines | C-STRM-PROB |

Bawat layer ay may kulay. Kumpletong listahan ay nasa [Mga layer ng plano](topic:plan-layers).

## Laki ng label

Kailangan ng text ng laki sa mga drawing unit. Sinusukat ng CivilCraft ang mga label ayon sa scale kung saan kasya ang buong plano sa isang Tabloid sheet (feet) o A3 sheet (metres), at sinasabi nito sa status message kung aling scale. Kung i-plot mo sa ibang scale sa iyong CAD program, i-scale ang text doon.

## Hindi na-export

- Mga elevation band (sa screen lamang).
- Ang profile view. Lumalabas ang mga profile bilang LandXML, hindi bilang drawing.
- Ang mismong surface bilang 3D object. Gamitin ang LandXML para sa TIN, o i-on ang {{ui:Triangles}} para makuha ang mga gilid nito bilang linework.
- Anumang na-off mo sa ilalim ng **Display**.

## DWG

Isinusulat din ng {{ui:DWG/DXF}} ang parehong linework bilang DWG drawing. Nagtatanong ang dialog nito ng format: DXF, o DWG ng 2000, 2004, 2007, 2010, 2013 o 2018. Nabubuksan ng 2000 ang halos bawat CAD program, luma at bago; pumili ng mas bago kapag hiniling iyon ng tatanggap ng drawing. Naaalala sa browser na ito ang pinili mo.

1. I-click ang {{ui:DWG}} sa grupong **I-export**.
2. Piliin ang **Format** at i-click ang **I-download ang DWG**.
3. Magda-download ang browser ng `<name>.dwg`. Ipinapakita ng status bar kung ano ang naisama, halimbawa "Na-export ang DWG (2018 format): 12 polylines, 40 labels on 9 layers".

Ang DWG ay may parehong layer, kulay, contours (bilang polylines sa kanilang elevation), 3D breaklines, label at points gaya ng DXF, sa parehong coordinates. Pinapalitan ang mga pangalan ng layer na hindi kayang hawakan ng DWG, at sinasabi ito ng status message. Isinusulat ng CivilCraft ang DWG gamit ang sarili nitong code, kaya walang umaalis sa iyong computer.

### Map layers sa DWG

Hindi kayang maglaman ng larawan sa loob nito ang DWG drawing: nagpapakita ang mga CAD program ng larawang nasa tabi ng drawing. Kapag nakikita ang map layers, nag-aalok ang dialog ng **Map layers bilang larawan sa tabi ng drawing**. Kapag naka-tick ito, ang download ay isang `.zip` na naglalaman ng `<name>.dwg`, `<name>-map.png` (ang map layers sa buong drawing, hanggang 4,096 pixels ang lapad) at `<name>-map.pgw` (ang world file nito, para sa GIS programs). Ipinapakita ng drawing ang larawan bilang image sa layer G-MAP-IMAG, sa tamang lugar. I-unzip ang mga file sa isang folder at panatilihin silang magkakasama.
