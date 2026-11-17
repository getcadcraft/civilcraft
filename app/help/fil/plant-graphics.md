---
title: Graphics ng halaman ayon sa scale, sariling simbolo at 3D na halaman
summary: Paano iginuguhit ang mga halaman sa plano sa bawat drawing scale at antas ng detalye, at paano nagkakaroon ng sariling simbolo (SVG, o block ng DXF/DWG) at sariling 3D model (OBJ, STL o GLB) ang isang plant record.
keywords: plant graphics, simbolo ng halaman, simbolo ayon sa scale, level of detail, detail level, simple circle, outline, detailed symbol, own symbol, block, svg, dxf, dwg, 3d plant, own 3d model, obj, stl, glb, gltf, tree model, mga halaman sa 3d
from: 875837d9
---

## Mga simbolo sa plano ayon sa scale

Landscape › {{ui:More}} › {{ui:Plant graphics}} ang nagtatakda kung paano iginuguhit ang mga halaman sa plano. Pumipili ang **Automatic, by scale** ng isa sa tatlong antas batay sa drawing scale:

- **Simple circle** (mas magaspang sa 1:500): isang bilog na katumbas ng spread ng halaman.
- **Outline with centre** (mula 1:500 hanggang 1:200): ang bilog at isang maliit na center cross.
- **Detailed symbol** (mas pino sa 1:200): ang sariling simbolo ng record kung mayroon, kung wala ay ang built-in na simbolo.

Baguhin ang dalawang scale gamit ang **Simple from 1:** at **Outline from 1:**, o pumili ng iisang antas para sa bawat scale. Bawat sheet set sa Sheets dialog ay may sariling **Plant detail in plan**, kaya maaaring magkaiba ang 1:500 na site plan at ang 1:100 na planting plan. Naka-save kasama ng proyekto ang mga setting.

## Sarili mong simbolo

Pumili ng halaman sa seksyong Plants at pindutin ang {{ui:Own symbol…}}. Nagbabasa ito ng SVG, o block ng DXF o DWG drawing (kapag maraming block ang drawing, pipili ka ng isa). Ang simbolo ay isinasaayos sa spread ng halaman at iginuguhit sa detalyadong antas. Nakatago ito sa proyekto, kaya kasama nito ang file.

- Binabasa ang SVG para sa mga linya, polyline, polygon, rectangle, circle, ellipse at path. Hindi binabasa ang mga script, style, link at larawan dito. Hindi ina-apply ang mga transform: sasabihan ka kapag may taglay ang file, kaya i-flatten muna ang mga ito sa iyong drawing program.
- Mga limit: 512 KB na SVG at 2000 na shape. Tinatanggihan ang mas malaking file, kasama ang dahilan.

## Sarili mong 3D na halaman

{{ui:Own 3D model…}} sa parehong record ay nagbabasa ng **OBJ**, **STL** o **GLB** na file. Pagkatapos, sa Plant graphics, itakda ang **Plants in 3D** sa **Each record's own model**: ang bawat halaman ng record na iyon ay magpapakita ng iyong model, naka-scale sa taas at spread nito. Ang mga record na walang sariling model ay mananatili sa built-in na anyo. Piliin ang **Simple masses** para sa mabilisang tingin sa malalaking site.

Binabasa ang GLB para sa hugis lamang:

- Ang lahat ng kailangan ng model ay dapat nasa loob ng .glb file. Tinatanggihan ang model na tumuturo sa ibang file (hiwalay na .bin, o larawang nasa address): walang dina-download.
- Hindi nababasa ang compressed o packed na geometry (Draco, meshopt, quantized positions). I-export nang walang compression.
- Hindi ginagamit ang mga texture at kulay sa file: iginuguhit ang model sa sariling kulay ng halaman. Chine-check pa rin ang mga texture, at tinatanggihan ang texture na lampas sa 4096 pixel sa isang gilid.
- Mga limit: 32 MB na file, 50 000 triangle (kasama ang bawat kopya ng bahaging nailagay nang higit sa isang beses), 64 na larawan at 16 MB na larawan.

Tinatanggihan ng bawat limit ang file kasama ang dahilan; walang bahaging nabasa nang kalahati ang itinatago. Isang undo step ang nagbibigay sa record ng simbolo o model nito, at ang {{ui:Remove own symbol}} o {{ui:Remove own 3D model}} ang nag-aalis nito.

Tingnan ang [Mga plant record](topic:plant-records) para sa mismong record, at ang [Tingnan ang site sa 3D](topic:site-3d).
