---
title: Mga layer ng plano
summary: Ang mga nakapirming pangalan ng layer, kulay at lapad ng linya na ginagamit ng CivilCraft sa screen, sa DXF at sa PDF, at kung aling display setting ang kumokontrol sa bawat isa.
keywords: layers, pangalan ng layer, ncs, kulay, aci, lapad ng linya, dxf layers, pdf, display settings, linework
from: c2aa8475
---

Lahat ng nasa plano ay kabilang sa isang layer. Ang mga pangalan ay sumusunod sa karaniwang civil layer pattern (disiplina, pangunahing grupo, pangalawang grupo). Nakapirmi ang mga layer sa build na ito: hindi mo mapapalitan ang pangalan nila, mababago ang kulay nila, o makapagdadagdag ng sarili mong layer. Sa DXF, bawat layer ay may nakalistang numero ng kulay; sa PDF na may {{ui:Layer colors}}, ang parehong kulay ang ginagamit, at sa {{ui:Black}} ay naka-print sa itim ang lahat.

| Layer | Laman | Kulay (numero sa DXF) | Lumalabas kapag |
|---|---|---|---|
| C-TOPO-MINR | Minor na contour | Kulay abo (8) | {{ui:Contours}} |
| C-TOPO-MAJR | Major na contour | Puti o itim (7) | {{ui:Contours}} |
| C-TOPO-TEXT | Label ng contour | Puti o itim (7) | {{ui:Contours}} at {{ui:Contour labels}} |
| C-TOPO-TINN | Mga gilid ng triangle | Kulay abo (8) | {{ui:Triangles}} |
| C-TOPO-BRKL | Breakline at hangganan | Kahel (30) | {{ui:Breaklines}} |
| C-TOPO-BNDY | Gilid ng surface | Puti o itim (7) | {{ui:Surface edge}} |
| C-TOPO-SLOP | Slope arrows | Cyan (4) | {{ui:Slope arrows}} |
| V-NODE | Mga survey point | Berde (3) | {{ui:Points}} |
| V-NODE-TEXT | Label ng point: numero, elevation, deskripsyon | Berde (3) | {{ui:Points}} at {{ui:Point labels}} |
| V-NODE-LINE | Mga linya mula sa line code (mga grupong hindi breakline) | Berde (3) | {{ui:Points}} |
| C-ROAD-CNTR | Centerline ng alignment | Pula (1) | Palagi |
| C-ROAD-STAN | Station tick at label, PC at PT | Pula (1) | Palagi |
| C-ROAD-CORR | Gilid ng corridor | Dilaw (2) | Palagi |
| C-ROAD-SCTN | Sample line (kung saan pinuputol ang mga section) | Kulay abo (8) | Kapag may sample line ang alignment |
| C-GRAD-PADS | Balangkas ng pad | Asul (5) | Palagi |
| C-GRAD-DAYL | Daylight line | Magenta (6) | Palagi |
| C-GRAD-SLOP | Grading slope line | Magenta (6) | Palagi |
| C-GRAD-FEAT | Feature line (3D) | Berde (3) | Palagi |
| C-ROAD-SWPT | Swept path: balangkas, pinakalabas na wheel path, pangalan | Kahel (30) | Palagi |
| C-STRM-PIPE | Mga pipe | Asul (5) | {{ui:Pipes}} |
| C-STRM-STRC | Mga structure | Asul (5) | {{ui:Pipes}} |
| C-STRM-TEXT | Label ng pipe at structure | Asul (5) | {{ui:Pipes}} |
| C-STRM-PROB | Mga pipe at structure na may problema | Pula (1) | {{ui:Pipes}} |

Iginuguhit ang mga breakline lamang habang ang **Surface** sa ilalim ng **Display** ay {{ui:Existing ground}}; iginuguhit ang hangganan gamit ang alinmang surface.

## Lapad ng linya sa PDF

| Lapad | Mga layer |
|---|---|
| 0.50 mm | Centerline ng alignment, pad, pipe, pipe na may problema |
| 0.35 mm | Major na contour, daylight line, structure |
| 0.25 mm | Breakline |
| 0.13 mm | Minor na contour |
| 0.09 mm | Mga gilid ng triangle, grading slope line |
| 0.18 mm | Lahat ng iba pa |

Walang lapad ng linya ang mga DXF file; itakda ang mga ito kada layer sa iyong CAD program.

## Laki ng label

Sinusukat sa papel ang laki ng mga label: label ng contour 2.0 mm, label ng station 1.8 mm, label ng PC at PT at label ng pipe at structure 1.6 mm, label ng point 1.5 mm. Ang label ng pipe ay nagpapakita ng pangalan, diameter at slope; ang label ng structure ay nagpapakita ng pangalan at rim. Sa screen, nananatiling pareho ang laki nila habang nag-zoom ka. Sa DXF, sinusukat sila ayon sa scale na nakasaad sa export message; tingnan ang [I-export ang plano sa DXF](topic:dxf-export).

## Hindi ipinapakita sa anumang layer

Iginuguhit lamang sa screen ang elevation band, sa ilalim ng linework. Hindi bahagi ng plano ang profile view.
